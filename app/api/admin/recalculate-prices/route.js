import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

/**
 * 참가자들의 가격을 현재 폼 설정에 맞춰 재계산하는 API
 *
 * POST /api/admin/recalculate-prices
 * Body: { formId: string }
 */
export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  try {
    const { formId } = await req.json();

    if (!formId) {
      return new NextResponse('formId is required', { status: 400 });
    }

    // 1. 폼 설정 가져오기
    const settingsDoc = await adminDb.collection('settings').doc('current').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    const forms = settings.forms || [];
    const form = forms.find(f => f.id === formId);

    if (!form) {
      return new NextResponse('Form not found', { status: 404 });
    }

    // 2. payment-calculator와 accommodation-calculator 필드 찾기
    const paymentField = form.fields?.find(f => f.type === 'payment-calculator');
    const accomField = form.fields?.find(f => f.type === 'accommodation-calculator');

    if (!paymentField && !accomField) {
      return new NextResponse('No calculator fields found in this form', { status: 400 });
    }

    // 3. 참가자 데이터 가져오기
    const collectionName = `participants_${formId}`;
    const participantsSnapshot = await adminDb.collection(collectionName).get();

    if (participantsSnapshot.empty) {
      return NextResponse.json({
        ok: true,
        message: 'No participants found',
        updated: 0
      });
    }

    const batch = adminDb.batch();
    let updateCount = 0;
    const updateLog = [];

    // 4. 각 참가자의 가격 재계산
    for (const doc of participantsSnapshot.docs) {
      const participant = doc.data();
      let updated = false;
      const changes = {};

      // 4-1. 참가비 재계산 (payment-calculator)
      if (paymentField) {
        const result = recalculatePaymentFee(participant, paymentField, form);
        if (result.updated) {
          changes.amount = result.amount;
          updated = true;
        }
      }

      // 4-2. 숙박비 재계산 (accommodation-calculator)
      if (accomField) {
        const result = recalculateAccommodationFee(participant, accomField, form);
        if (result.updated) {
          changes.accommodationAmount = result.accommodationAmount;
          updated = true;
        }
      }

      // 4-3. 변경사항이 있으면 업데이트
      if (updated) {
        batch.update(doc.ref, {
          ...changes,
          priceRecalculatedAt: new Date().toISOString(),
        });
        updateCount++;
        updateLog.push({
          id: doc.id,
          name: participant.field_1760378476899 || participant.name || 'Unknown',
          changes
        });
      }
    }

    // 5. 배치 업데이트 실행
    if (updateCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully recalculated prices for ${updateCount} participants`,
      updated: updateCount,
      total: participantsSnapshot.size,
      log: updateLog.slice(0, 10) // 처음 10개만 로그
    });

  } catch (error) {
    console.error('Price recalculation error:', error);
    return new NextResponse('Failed to recalculate prices: ' + error.message, { status: 500 });
  }
}

/**
 * 참가비 재계산 함수
 */
function recalculatePaymentFee(participant, paymentField, form) {
  try {
    // 무료 등록인 경우 재계산 불필요
    const freeFieldId = `${paymentField.id}_free`;
    if (participant[freeFieldId]) {
      return { updated: false };
    }

    // 날짜 정보 가져오기
    const dateFieldId = `${paymentField.id}_dates`;
    const selectedDates = participant[dateFieldId] || [];

    if (selectedDates.length === 0) {
      return { updated: false };
    }

    // 나이 그룹 계산
    const ageGroups = calculateAgeGroups(participant, form);
    if (!ageGroups) {
      return { updated: false };
    }

    // 등록 시기 판별 (참가자의 등록일 기준)
    const registeredAt = participant.registeredAt || participant.createdAt?.toDate?.() || new Date();
    const registrationDate = typeof registeredAt === 'string' ? new Date(registeredAt) : registeredAt;
    const phase1Deadline = paymentField.phase1Deadline ? new Date(paymentField.phase1Deadline) : null;

    let isPhase1 = true;
    if (paymentField.enablePhase1 === false && paymentField.enablePhase2 !== false) {
      isPhase1 = false;
    } else if (paymentField.enablePhase1 !== false && paymentField.enablePhase2 !== false) {
      isPhase1 = phase1Deadline ? registrationDate <= phase1Deadline : true;
    }

    const phase = isPhase1 ? paymentField.pricing?.phase1 : paymentField.pricing?.phase2;
    if (!phase) {
      return { updated: false };
    }

    // 전체 참석 vs 부분 참석
    const totalDates = paymentField.dateOptions?.length || 0;
    const isPartial = selectedDates.length < totalDates;

    let totalAmount = 0;

    if (isPartial && selectedDates.length > 0) {
      // 부분 참석: 날짜별 개별 가격 합산
      selectedDates.forEach(date => {
        const datePrice = phase?.perDate?.[date];
        if (datePrice) {
          totalAmount += (datePrice.adult || 0) * ageGroups.adult;
          totalAmount += (datePrice.minor8plus || 0) * ageGroups.minor8plus;
          totalAmount += (datePrice.minorUnder8 || 0) * ageGroups.minorUnder8;
        }
      });
    } else {
      // 전체 참석
      const fullPrice = phase?.full;
      if (fullPrice) {
        totalAmount += (fullPrice.adult || 0) * ageGroups.adult;
        totalAmount += (fullPrice.minor8plus || 0) * ageGroups.minor8plus;
        totalAmount += (fullPrice.minorUnder8 || 0) * ageGroups.minorUnder8;
      }
    }

    // 기존 금액과 비교
    const currentAmount = participant.amount?.total || 0;
    if (currentAmount === totalAmount) {
      return { updated: false };
    }

    return {
      updated: true,
      amount: {
        first: participant.amount?.first || totalAmount,
        second: participant.amount?.second || 0,
        total: totalAmount
      }
    };

  } catch (error) {
    console.error('Payment fee calculation error:', error);
    return { updated: false };
  }
}

/**
 * 숙박비 재계산 함수
 */
function recalculateAccommodationFee(participant, accomField, form) {
  try {
    // 무료 숙박인 경우 재계산 불필요
    const freeFieldId = `${accomField.id}_free`;
    if (participant[freeFieldId]) {
      return { updated: false };
    }

    // 숙박 날짜 정보
    const dateFieldId = `${accomField.id}_dates`;
    const selectedDates = participant[dateFieldId] || [];

    if (selectedDates.length === 0) {
      return { updated: false };
    }

    // 방 타입 정보
    const roomTypeFieldId = `${accomField.id}_roomType`;
    const selectedRoomType = participant[roomTypeFieldId];

    if (!selectedRoomType) {
      return { updated: false };
    }

    // 등록 시기 판별
    const registeredAt = participant.registeredAt || participant.createdAt?.toDate?.() || new Date();
    const registrationDate = typeof registeredAt === 'string' ? new Date(registeredAt) : registeredAt;
    const phase1Deadline = accomField.phase1Deadline ? new Date(accomField.phase1Deadline) : null;
    const isPhase1 = phase1Deadline ? registrationDate <= phase1Deadline : true;

    const phase = isPhase1 ? accomField.accommodationPricing?.phase1 : accomField.accommodationPricing?.phase2;
    const pricePerNight = phase?.[selectedRoomType] || 0;

    if (pricePerNight === 0) {
      return { updated: false };
    }

    // 인원 수 계산
    const roomTypeOption = accomField.roomTypeOptions?.[selectedRoomType];
    const roomOptionsFieldId = `${accomField.id}_roomOptions`;
    const roomOptions = participant[roomOptionsFieldId] || {};

    let peopleCount = 1;

    if (roomTypeOption?.type === 'gender') {
      // 단체실: 남자 + 여자
      const maleList = roomOptions.male || [];
      const femaleList = roomOptions.female || [];
      peopleCount = maleList.length + femaleList.length;
    } else if (roomTypeOption?.type === 'count') {
      // 가족실: people 배열
      const peopleList = roomOptions.people || [];
      peopleCount = peopleList.length;
    }

    const totalNights = selectedDates.length;

    // 총 금액 계산
    let totalAmount = 0;
    if (roomTypeOption?.type === 'gender') {
      // 단체실: 인원당 가격
      totalAmount = pricePerNight * peopleCount * totalNights;
    } else {
      // 기타: 방당 가격
      totalAmount = pricePerNight * totalNights;
    }

    // 그룹 구성원인 경우 처리
    if (participant.groupId && !participant.isRepresentative) {
      // 가족실 구성원: 0원 (대표자가 전액 부담)
      if (roomTypeOption?.type === 'count') {
        totalAmount = 0;
      }
      // 단체실 구성원: 1인 금액만
      else if (roomTypeOption?.type === 'gender') {
        totalAmount = pricePerNight * totalNights;
      }
    }

    // 기존 금액과 비교
    const currentAmount = participant.accommodationAmount?.total || 0;
    if (currentAmount === totalAmount) {
      return { updated: false };
    }

    return {
      updated: true,
      accommodationAmount: {
        pricePerNight,
        totalNights,
        peopleCount,
        total: totalAmount,
        phase: isPhase1 ? 'phase1' : 'phase2'
      }
    };

  } catch (error) {
    console.error('Accommodation fee calculation error:', error);
    return { updated: false };
  }
}

/**
 * 나이 그룹 계산
 */
function calculateAgeGroups(participant, form) {
  try {
    // 생년월일 필드 찾기
    const dobField = form.fields.find(f => f.type === 'date-of-birth');
    const peopleField = form.fields.find(f => f.type === 'people-count');

    let adult = 0;
    let minor8plus = 0;
    let minorUnder8 = 0;

    // 대표자 나이 계산
    if (dobField && participant[dobField.id]) {
      const dob = participant[dobField.id];
      const birthYear = new Date(dob).getFullYear();
      const thisYear = new Date().getFullYear();
      const age = thisYear - birthYear;

      if (age >= 19) adult = 1;
      else if (age >= 8) minor8plus = 1;
      else minorUnder8 = 1;
    }

    // 추가 인원 합산
    if (peopleField && participant[peopleField.id]) {
      const peopleData = participant[peopleField.id];
      adult += peopleData.adult || 0;
      minor8plus += peopleData.minor8plus || 0;
      minorUnder8 += peopleData.minorUnder8 || 0;
    }

    return { adult, minor8plus, minorUnder8 };

  } catch (error) {
    console.error('Age group calculation error:', error);
    return null;
  }
}
