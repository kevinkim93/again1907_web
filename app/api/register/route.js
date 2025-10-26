import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const { formId, formName, formData } = await req.json();

    if (!formId || !formData) {
      return new NextResponse('formId and formData are required', { status: 400 });
    }

    // 1. settings 불러오기
    const settingsSnap = await adminDb.collection('settings').doc('current').get();
    if (!settingsSnap.exists) {
      return new NextResponse('Settings not found', { status: 500 });
    }
    const settings = settingsSnap.data();

    // 2. 해당 폼 스키마 찾기
    const form = settings.forms?.find(f => f.id === formId);
    if (!form) {
      return new NextResponse('Form not found', { status: 404 });
    }

    // 3. 전화번호 중복 확인 (phone 필드가 있는 경우)
    const phoneField = form.fields.find(f => f.type === 'tel' || f.id.includes('phone'));
    if (phoneField && formData[phoneField.id]) {
      const phoneDigits = formData[phoneField.id].replace(/[^\d+]/g, '');

      // formId별 컬렉션에서 중복 확인
      const collectionName = `participants_${formId}`;
      const existingParticipants = await adminDb.collection(collectionName).get();

      const isDuplicate = existingParticipants.docs.some(doc => {
        const existingPhone = doc.data()[phoneField.id]?.replace(/[^\d+]/g, '');
        return existingPhone === phoneDigits;
      });

      if (isDuplicate) {
        return NextResponse.json({ error: '이미 등록된 전화번호입니다.' }, { status: 400 });
      }
    }

    // 4. 등록 당시 날짜 (YYYY-MM-DD)
    const now = new Date();
    const registeredAt = now.toISOString().split('T')[0];

    // 5. 참가자 문서 생성
    const participant = {
      formId,
      formName,
      ...formData, // 동적 폼 데이터 모두 저장
      registeredAt,
      paymentStatus: 'unpaid',
      createdAt: Timestamp.now(),
    };

    // 6. totalPeople 계산 (people-count 필드가 있는 경우)
    console.log('📝 Registration Start:', {
      formId,
      formName,
      formDataKeys: Object.keys(formData),
      formFieldTypes: form.fields.map(f => ({ id: f.id, type: f.type })),
    });

    const peopleField = form.fields.find(f => f.type === 'people-count');
    const dobField = form.fields.find(f => f.type === 'date-of-birth');

    const calculateAgeGroup = (dob) => {
      if (!dob) return null;
      const birthYear = new Date(dob).getFullYear();
      const thisYear = new Date().getFullYear();
      const age = thisYear - birthYear;

      if (age >= 19) return 'adult';
      if (age >= 8) return 'minor8plus';
      return 'minorUnder8';
    };

    // 대표자 본인 나이 계산
    let adult = 0;
    let minor8plus = 0;
    let minorUnder8 = 0;

    if (dobField && formData[dobField.id]) {
      const representativeAgeGroup = calculateAgeGroup(formData[dobField.id]);
      if (representativeAgeGroup === 'adult') adult = 1;
      else if (representativeAgeGroup === 'minor8plus') minor8plus = 1;
      else if (representativeAgeGroup === 'minorUnder8') minorUnder8 = 1;
    }

    // 추가 인원이 있으면 합산
    if (peopleField && formData[peopleField.id]) {
      const peopleData = formData[peopleField.id];
      adult += peopleData.adult || 0;
      minor8plus += peopleData.minor8plus || 0;
      minorUnder8 += peopleData.minorUnder8 || 0;
    }

    // extraCounts 및 totalPeople 설정 (생년월일이나 추가 인원이 있는 경우)
    if (dobField || peopleField) {
      participant.extraCounts = {
        adult,
        minor8plus,
        minorUnder8,
      };
      participant.totalPeople = adult + minor8plus + minorUnder8;
    }

    console.log('👥 People Calculation Done:', {
      peopleField: peopleField?.id,
      dobField: dobField?.id,
      extraCounts: participant.extraCounts,
      totalPeople: participant.totalPeople,
    });

    // 7. 참가비 계산 (payment-calculator 필드가 있는 경우)
    const paymentField = form.fields.find(f => f.type === 'payment-calculator');
    console.log('🎯 Looking for payment field:', {
      found: !!paymentField,
      paymentFieldId: paymentField?.id,
    });

    if (paymentField) {
      const dateFieldId = `${paymentField.id}_dates`;
      const selectedDates = formData[dateFieldId] || [];
      const totalDates = paymentField.dateOptions?.length || 0;
      const isPartial = selectedDates.length > 0 && selectedDates.length < totalDates;

      console.log('🔍 Payment Calculator Debug:', {
        paymentField: paymentField.id,
        dateFieldId,
        selectedDates,
        totalDates,
        isPartial,
        extraCounts: participant.extraCounts,
        pricing: paymentField.pricing,
      });

      // 현재 날짜가 1차 등록 마감일 이전인지 확인
      const now = new Date();
      const phase1Deadline = paymentField.phase1Deadline ? new Date(paymentField.phase1Deadline) : null;
      const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

      const phase = isPhase1 ? paymentField.pricing?.phase1 : paymentField.pricing?.phase2;
      const price = isPartial ? phase?.daily : phase?.full;

      console.log('💰 Price Info:', {
        isPhase1,
        phase,
        price,
      });

      if (price && selectedDates.length > 0) {
        // extraCounts에서 계산 (대표자 포함된 값)
        const adult = participant.extraCounts?.adult || 0;
        const minor8plus = participant.extraCounts?.minor8plus || 0;
        const minorUnder8 = participant.extraCounts?.minorUnder8 || 0;

        let totalAmount = 0;
        if (isPartial && selectedDates.length > 0) {
          const days = selectedDates.length;
          totalAmount = (
            (price?.adult || 0) * adult * days +
            (price?.minor8plus || 0) * minor8plus * days +
            (price?.minorUnder8 || 0) * minorUnder8 * days
          );
        } else {
          totalAmount = (
            (price?.adult || 0) * adult +
            (price?.minor8plus || 0) * minor8plus +
            (price?.minorUnder8 || 0) * minorUnder8
          );
        }

        console.log('💵 Calculated Amount:', totalAmount);

        participant.amount = {
          first: totalAmount,
          second: 0,
          total: totalAmount,
        };
        participant.isPartial = isPartial;
        participant.partialDates = isPartial ? selectedDates : [];
        participant.registrationPhase = isPhase1 ? 'phase1' : 'phase2';
      }
    }

    // 8. 숙박비 계산 (accommodation-calculator 필드가 있는 경우)
    const accommodationField = form.fields.find(f => f.type === 'accommodation-calculator');
    if (accommodationField) {
      const accomDateFieldId = `${accommodationField.id}_dates`;
      const accomRoomTypeFieldId = `${accommodationField.id}_roomType`;
      const selectedAccomDates = formData[accomDateFieldId] || [];
      const selectedRoomType = formData[accomRoomTypeFieldId] || '';

      // 숙박 정보 저장
      participant.accommodationDates = selectedAccomDates;
      participant.roomType = selectedRoomType;

      // 현재 날짜가 1차 등록 마감일 이전인지 확인
      const now = new Date();
      const phase1Deadline = accommodationField.phase1Deadline ? new Date(accommodationField.phase1Deadline) : null;
      const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

      const phase = isPhase1 ? accommodationField.accommodationPricing?.phase1 : accommodationField.accommodationPricing?.phase2;
      const pricePerNight = phase?.[selectedRoomType] || 0;

      if (pricePerNight && selectedAccomDates.length > 0) {
        const totalNights = selectedAccomDates.length;
        const totalAccommodationAmount = pricePerNight * totalNights;

        participant.accommodationAmount = {
          pricePerNight,
          totalNights,
          total: totalAccommodationAmount,
          phase: isPhase1 ? 'phase1' : 'phase2',
        };

        // 기존 amount에 숙박비 추가
        if (participant.amount) {
          participant.amount.total += totalAccommodationAmount;
        } else {
          participant.amount = {
            first: totalAccommodationAmount,
            second: 0,
            total: totalAccommodationAmount,
          };
        }
      }
    }

    // 9. 방 배정 관련 초기화
    participant.roomId = null;
    participant.roomName = null;
    participant.roomAssignments = {};

    // 10. formId별 컬렉션에 저장
    const collectionName = `participants_${formId}`;
    const docRef = await adminDb.collection(collectionName).add(participant);

    return NextResponse.json({
      ok: true,
      participantId: docRef.id,
      collectionName
    });

  } catch (err) {
    console.error('🔥 등록 에러:', err);
    return new NextResponse('등록 중 오류 발생', { status: 500 });
  }
}
