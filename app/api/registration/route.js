import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebaseAdmin';

// PUT: 등록 정보 수정
export async function PUT(request) {
  try {
    const { id, collectionName, formData } = await request.json();

    console.log('수정 요청 받음:', { id, collectionName, formData });

    if (!id || !collectionName || !formData) {
      console.error('필수 정보 없음:', { id, collectionName, formData });
      return NextResponse.json(
        { error: 'ID, 컬렉션명, 수정할 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 문서 직접 참조
    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.error('등록 정보 찾을 수 없음:', { id, collectionName });
      return NextResponse.json(
        { error: '등록 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const existingData = docSnap.data();
    console.log('기존 데이터:', existingData);

    // Settings에서 폼 스키마 가져오기
    const settingsSnap = await db.collection('settings').doc('current').get();
    if (!settingsSnap.exists) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 500 }
      );
    }
    const settings = settingsSnap.data();
    const form = settings.forms?.find(f => f.id === existingData.formId);
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // 기존 데이터와 새 데이터 병합
    const updatedData = {
      ...existingData,
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    // === 금액 재계산 로직 (register API와 동일) ===

    const calculateAgeGroup = (dob) => {
      if (!dob) return null;
      const birthYear = new Date(dob).getFullYear();
      const thisYear = new Date().getFullYear();
      const age = thisYear - birthYear;

      if (age >= 19) return 'adult';
      if (age >= 8) return 'minor8plus';
      return 'minorUnder8';
    };

    const peopleField = form.fields.find(f => f.type === 'people-count');
    const dobField = form.fields.find(f => f.type === 'date-of-birth');

    // 대표자 본인 나이 계산
    let adult = 0;
    let minor8plus = 0;
    let minorUnder8 = 0;

    if (dobField && updatedData[dobField.id]) {
      const representativeAgeGroup = calculateAgeGroup(updatedData[dobField.id]);
      if (representativeAgeGroup === 'adult') adult = 1;
      else if (representativeAgeGroup === 'minor8plus') minor8plus = 1;
      else if (representativeAgeGroup === 'minorUnder8') minorUnder8 = 1;
    }

    // 추가 인원이 있으면 합산
    if (peopleField && updatedData[peopleField.id]) {
      const peopleData = updatedData[peopleField.id];
      adult += peopleData.adult || 0;
      minor8plus += peopleData.minor8plus || 0;
      minorUnder8 += peopleData.minorUnder8 || 0;
    }

    // extraCounts 및 totalPeople 설정
    if (dobField || peopleField) {
      updatedData.extraCounts = {
        adult,
        minor8plus,
        minorUnder8,
      };
      updatedData.totalPeople = adult + minor8plus + minorUnder8;
    }

    // 금액 초기화 (중복 누적 방지)
    let paymentAmount = 0;
    let accommodationAmount = 0;

    // 참가비 계산
    const paymentField = form.fields.find(f => f.type === 'payment-calculator');
    if (paymentField) {
      const dateFieldId = `${paymentField.id}_dates`;
      const selectedDates = updatedData[dateFieldId] || [];
      const totalDates = paymentField.dateOptions?.length || 0;
      const isPartial = selectedDates.length > 0 && selectedDates.length < totalDates;

      const now = new Date();
      const phase1Deadline = paymentField.phase1Deadline ? new Date(paymentField.phase1Deadline) : null;
      const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

      const phase = isPhase1 ? paymentField.pricing?.phase1 : paymentField.pricing?.phase2;
      const price = isPartial ? phase?.daily : phase?.full;

      if (price && selectedDates.length > 0) {
        const adultCount = updatedData.extraCounts?.adult || 0;
        const minor8plusCount = updatedData.extraCounts?.minor8plus || 0;
        const minorUnder8Count = updatedData.extraCounts?.minorUnder8 || 0;

        if (isPartial && selectedDates.length > 0) {
          const days = selectedDates.length;
          paymentAmount = (
            (price?.adult || 0) * adultCount * days +
            (price?.minor8plus || 0) * minor8plusCount * days +
            (price?.minorUnder8 || 0) * minorUnder8Count * days
          );
        } else {
          paymentAmount = (
            (price?.adult || 0) * adultCount +
            (price?.minor8plus || 0) * minor8plusCount +
            (price?.minorUnder8 || 0) * minorUnder8Count
          );
        }

        updatedData.isPartial = isPartial;
        updatedData.partialDates = isPartial ? selectedDates : [];
        updatedData.registrationPhase = isPhase1 ? 'phase1' : 'phase2';
      }
    }

    // 숙박비 계산
    const accommodationField = form.fields.find(f => f.type === 'accommodation-calculator');
    if (accommodationField) {
      const accomDateFieldId = `${accommodationField.id}_dates`;
      const accomRoomTypeFieldId = `${accommodationField.id}_roomType`;
      const accomRoomOptionsFieldId = `${accommodationField.id}_roomOptions`;
      const selectedAccomDates = updatedData[accomDateFieldId] || [];
      const selectedRoomType = updatedData[accomRoomTypeFieldId] || '';
      const roomOptions = updatedData[accomRoomOptionsFieldId] || {};

      updatedData.accommodationDates = selectedAccomDates;
      updatedData.roomType = selectedRoomType;

      const now = new Date();
      const phase1Deadline = accommodationField.phase1Deadline ? new Date(accommodationField.phase1Deadline) : null;
      const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

      const phase = isPhase1 ? accommodationField.accommodationPricing?.phase1 : accommodationField.accommodationPricing?.phase2;
      const pricePerNight = phase?.[selectedRoomType] || 0;

      if (pricePerNight && selectedAccomDates.length > 0) {
        const totalNights = selectedAccomDates.length;

        // 방 타입별 인원 수 계산
        const roomTypeOption = accommodationField.roomTypeOptions?.[selectedRoomType];
        let peopleCount = 1;

        if (roomTypeOption?.type === 'gender') {
          const maleList = roomOptions.male || [];
          const femaleList = roomOptions.female || [];
          peopleCount = maleList.length + femaleList.length;
        } else if (roomTypeOption?.type === 'count') {
          peopleCount = parseInt(roomOptions.count) || 1;
        }

        // 총 숙박비 계산
        if (roomTypeOption?.type === 'gender') {
          // 30인실: 인원 수 × 1박 요금 × 박수
          accommodationAmount = pricePerNight * peopleCount * totalNights;
        } else {
          // 2인실 등: 1박 요금 × 박수
          accommodationAmount = pricePerNight * totalNights;
        }

        updatedData.accommodationAmount = {
          pricePerNight,
          totalNights,
          peopleCount,
          total: accommodationAmount,
          phase: isPhase1 ? 'phase1' : 'phase2',
        };
      }
    }

    // 최종 금액 설정 (참가비 + 숙박비)
    const totalAmount = paymentAmount + accommodationAmount;
    if (totalAmount > 0) {
      updatedData.amount = {
        first: totalAmount,
        second: 0,
        total: totalAmount,
      };
    }

    console.log('업데이트할 데이터:', updatedData);

    await docRef.update(updatedData);

    console.log('업데이트 완료');

    return NextResponse.json({
      success: true,
      message: '등록 정보가 수정되었습니다.',
    });
  } catch (error) {
    console.error('등록 정보 수정 오류:', error);
    return NextResponse.json(
      { error: `등록 정보 수정 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE: 등록 정보 삭제
export async function DELETE(request) {
  try {
    const { id, collectionName } = await request.json();

    console.log('삭제 요청 받음:', { id, collectionName });

    if (!id || !collectionName) {
      console.error('필수 정보 없음:', { id, collectionName });
      return NextResponse.json(
        { error: 'ID와 컬렉션명이 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 문서 직접 참조
    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.error('등록 정보 찾을 수 없음:', { id, collectionName });
      return NextResponse.json(
        { error: '등록 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await docRef.delete();

    console.log('삭제 완료');

    return NextResponse.json({
      success: true,
      message: '등록 정보가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('등록 정보 삭제 오류:', error);
    return NextResponse.json(
      { error: `등록 정보 삭제 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
