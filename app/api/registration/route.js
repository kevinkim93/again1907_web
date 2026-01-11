import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

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
      updatedAt: Timestamp.now(),
    };

    // amount 초기화 (무료에서 유료로 변경될 때를 대비)
    updatedData.amount = null;

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
      const freeOptionFieldId = `${paymentField.id}_free`;
      const isFreePayment = updatedData[freeOptionFieldId] || false;
      const selectedDates = updatedData[dateFieldId] || [];
      const totalDates = paymentField.dateOptions?.length || 0;
      const isPartial = selectedDates.length > 0 && selectedDates.length < totalDates;

      const now = new Date();
      const phase1Deadline = paymentField.phase1Deadline ? new Date(paymentField.phase1Deadline) : null;

      // 1차/2차 가격 활성화 여부 확인
      const phase1Enabled = paymentField.enablePhase1 !== false;
      const phase2Enabled = paymentField.enablePhase2 !== false;

      let isPhase1 = false;

      // 1차만 활성화된 경우
      if (phase1Enabled && !phase2Enabled) {
        isPhase1 = true;
      }
      // 2차만 활성화된 경우
      else if (!phase1Enabled && phase2Enabled) {
        isPhase1 = false;
      }
      // 둘 다 활성화된 경우
      else if (phase1Enabled && phase2Enabled) {
        isPhase1 = phase1Deadline ? now <= phase1Deadline : true;
      }

      const phase = isPhase1 ? paymentField.pricing?.phase1 : paymentField.pricing?.phase2;

      if (phase && selectedDates.length > 0) {
        const adultCount = updatedData.extraCounts?.adult || 0;
        const minor8plusCount = updatedData.extraCounts?.minor8plus || 0;
        const minorUnder8Count = updatedData.extraCounts?.minorUnder8 || 0;

        // isFreePayment가 false일 때만 금액 계산
        if (!isFreePayment) {
          if (isPartial) {
            // 부분 참석: 날짜별 개별 가격 합산
            selectedDates.forEach(date => {
              const datePrice = phase?.perDate?.[date];
              if (datePrice) {
                paymentAmount += (datePrice.adult || 0) * adultCount;
                paymentAmount += (datePrice.minor8plus || 0) * minor8plusCount;
                paymentAmount += (datePrice.minorUnder8 || 0) * minorUnder8Count;
              }
            });
          } else {
            // 전체 참석: 전체 참석 가격 사용
            const fullPrice = phase?.full;
            if (fullPrice) {
              paymentAmount = (
                (fullPrice.adult || 0) * adultCount +
                (fullPrice.minor8plus || 0) * minor8plusCount +
                (fullPrice.minorUnder8 || 0) * minorUnder8Count
              );
            }
          }
        }

        updatedData.isPartial = isPartial;
        updatedData.partialDates = isPartial ? selectedDates : [];
        updatedData.registrationPhase = isPhase1 ? 'phase1' : 'phase2';
        updatedData.isFreePayment = isFreePayment;
      }
    }

    // 숙박비 계산
    const accommodationField = form.fields.find(f => f.type === 'accommodation-calculator');
    if (accommodationField) {
      const accomDateFieldId = `${accommodationField.id}_dates`;
      const accomRoomTypeFieldId = `${accommodationField.id}_roomType`;
      const accomRoomOptionsFieldId = `${accommodationField.id}_roomOptions`;
      const accomFreeOptionFieldId = `${accommodationField.id}_free`;
      const isFreeAccommodation = updatedData[accomFreeOptionFieldId] || false;
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

        // 총 숙박비 계산 (isFreeAccommodation이 false일 때만)
        if (!isFreeAccommodation) {
          if (roomTypeOption?.type === 'gender') {
            // 30인실: 인원 수 × 1박 요금 × 박수
            accommodationAmount = pricePerNight * peopleCount * totalNights;
          } else {
            // 2인실 등: 1박 요금 × 박수
            accommodationAmount = pricePerNight * totalNights;
          }
        }

        updatedData.accommodationAmount = {
          pricePerNight: isFreeAccommodation ? 0 : pricePerNight,
          totalNights,
          peopleCount,
          total: accommodationAmount,
          phase: isPhase1 ? 'phase1' : 'phase2',
        };
        updatedData.isFreeAccommodation = isFreeAccommodation;
      }
    }

    // 최종 금액 설정 (참가비 + 숙박비)
    const totalAmount = paymentAmount + accommodationAmount;
    // paymentField나 accommodationField가 있으면 항상 amount 설정
    if (paymentField || accommodationField) {
      updatedData.amount = {
        first: totalAmount,
        second: 0,
        total: totalAmount,
      };
    }

    console.log('업데이트할 데이터:', updatedData);

    // === 그룹 등록 처리 (단체실/가족실) ===
    if (accommodationField) {
      const accomRoomTypeFieldId = `${accommodationField.id}_roomType`;
      const accomRoomOptionsFieldId = `${accommodationField.id}_roomOptions`;
      const selectedRoomType = updatedData[accomRoomTypeFieldId] || '';
      const roomOptions = updatedData[accomRoomOptionsFieldId] || {};
      const roomTypeOption = accommodationField.roomTypeOptions?.[selectedRoomType];

      // 단체실(gender) 또는 가족실(count) 타입인 경우
      if (roomTypeOption?.type === 'gender' || roomTypeOption?.type === 'count') {
        // 기존 그룹 구성원 문서 찾기 및 삭제
        if (existingData.groupId) {
          const existingGroupMembers = await db
            .collection(collectionName)
            .where('groupId', '==', existingData.groupId)
            .where('isRepresentative', '==', false)
            .get();

          const batch = db.batch();
          existingGroupMembers.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`삭제된 기존 그룹 구성원: ${existingGroupMembers.size}명`);
        }

        // 새 그룹 ID 생성 (기존 것이 있으면 재사용, 없으면 신규 생성)
        const groupId = existingData.groupId || `group_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // 총 그룹 인원 계산
        let totalGroupMembers = 1; // 대표자 포함
        let newMembers = [];

        if (roomTypeOption?.type === 'gender') {
          // 단체실: 남자 + 여자 (대표자 제외)
          const representativeName = updatedData[form.fields.find(f => f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명')))?.id] || '';

          const maleList = (roomOptions.male || []).filter(p => {
            if (p.isRepresentative) return false;
            // 대표자 본인 이름과 같으면 제외
            if (p.name === representativeName) return false;
            return true;
          });
          const femaleList = (roomOptions.female || []).filter(p => {
            if (p.isRepresentative) return false;
            // 대표자 본인 이름과 같으면 제외
            if (p.name === representativeName) return false;
            return true;
          });

          newMembers = [
            ...maleList.map(person => ({ ...person, gender: 'male' })),
            ...femaleList.map(person => ({ ...person, gender: 'female' }))
          ];

          // 대표자 포함 여부 확인
          const allPeople = [...(roomOptions.male || []), ...(roomOptions.female || [])];
          const representativeIncluded = allPeople.some(p => p.isRepresentative || p.name === representativeName);
          totalGroupMembers = newMembers.length + (representativeIncluded ? 1 : 0);
        } else if (roomTypeOption?.type === 'count') {
          // 가족실: people 배열 (대표자 제외)
          const allPeople = roomOptions.people || [];
          const representativeIncluded = allPeople.some(p => p.isRepresentative);

          newMembers = allPeople.filter(p => !p.isRepresentative);
          totalGroupMembers = allPeople.length;
        }

        // 대표자 문서에 그룹 정보 추가
        updatedData.groupId = groupId;
        updatedData.isRepresentative = true;
        updatedData.representativeName = updatedData[form.fields.find(f => f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명')))?.id] || '';
        updatedData.totalGroupMembers = totalGroupMembers;
        updatedData.groupPosition = 0;

        // 단체실인 경우 대표자의 성별도 저장
        if (roomTypeOption?.type === 'gender') {
          const representativeName = updatedData.representativeName;
          const allPeople = [...(roomOptions.male || []), ...(roomOptions.female || [])];
          const representativePerson = allPeople.find(p => p.isRepresentative || p.name === representativeName);

          if (representativePerson && representativePerson.gender) {
            updatedData.gender = representativePerson.gender;
          } else {
            // gender 필드가 없으면 어느 배열에 있는지로 판단
            const isInMale = (roomOptions.male || []).some(p => p.isRepresentative || p.name === representativeName);
            const isInFemale = (roomOptions.female || []).some(p => p.isRepresentative || p.name === representativeName);

            if (isInMale) {
              updatedData.gender = 'male';
            } else if (isInFemale) {
              updatedData.gender = 'female';
            }
          }
        }

        // 그룹 구성원 문서 생성
        const batch = db.batch();
        let position = 1;

        const accomDateFieldId = `${accommodationField.id}_dates`;
        const accomFreeOptionFieldId = `${accommodationField.id}_free`;
        const selectedAccomDates = updatedData[accomDateFieldId] || [];
        const isFreeAccommodation = updatedData[accomFreeOptionFieldId] || false;

        // 숙박비 계산
        const now = new Date();
        const phase1Deadline = accommodationField.phase1Deadline ? new Date(accommodationField.phase1Deadline) : null;
        const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;
        const phase = isPhase1 ? accommodationField.accommodationPricing?.phase1 : accommodationField.accommodationPricing?.phase2;
        const pricePerNight = phase?.[selectedRoomType] || 0;
        const totalNights = selectedAccomDates.length;

        for (const member of newMembers) {
          const memberRef = db.collection(collectionName).doc();

          let individualAccomAmount = 0;
          if (roomTypeOption?.type === 'gender') {
            // 단체실: 1인당 금액
            individualAccomAmount = isFreeAccommodation ? 0 : (pricePerNight * totalNights);
          } else if (roomTypeOption?.type === 'count') {
            // 가족실: 구성원은 0원 (대표자가 전액 부담)
            individualAccomAmount = 0;
          }

          const memberData = {
            formId: existingData.formId,
            formName: existingData.formName || '',
            registeredAt: existingData.registeredAt || new Date().toISOString(),
            paymentStatus: 'unpaid',
            groupId,
            representativeId: id,
            representativeName: updatedData.representativeName,
            isRepresentative: false,
            groupPosition: position++,
            totalGroupMembers,

            // 구성원 정보
            [form.fields.find(f => f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명')))?.id]: member.name || '',
            [form.fields.find(f => f.type === 'tel')?.id]: member.phone || '',

            // 생년월일 (있는 경우)
            ...(member.birthdate && {
              [form.fields.find(f => f.type === 'date-of-birth')?.id]: member.birthdate
            }),

            // 성별 (단체실인 경우)
            ...(member.gender && { gender: member.gender }),

            // 나이 (있는 경우)
            ...(member.age && { age: member.age }),

            // 숙박 정보
            accommodationDates: selectedAccomDates,
            roomType: selectedRoomType,
            accommodationAmount: {
              pricePerNight: isFreeAccommodation ? 0 : pricePerNight,
              totalNights,
              peopleCount: 1,
              total: individualAccomAmount,
              phase: isPhase1 ? 'phase1' : 'phase2',
            },
            isFreeAccommodation,

            // 금액 정보
            amount: {
              first: individualAccomAmount,
              second: 0,
              total: individualAccomAmount,
            },

            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          batch.set(memberRef, memberData);
        }

        await batch.commit();
        console.log(`생성된 새 그룹 구성원: ${newMembers.length}명`);
      } else {
        // 일반 등록인 경우 그룹 정보 제거
        if (existingData.groupId) {
          updatedData.groupId = null;
          updatedData.isRepresentative = false;
          updatedData.representativeName = null;
          updatedData.totalGroupMembers = null;
          updatedData.groupPosition = null;
        }
      }
    }

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
