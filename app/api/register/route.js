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
      const freeOptionFieldId = `${paymentField.id}_free`;
      const isFree = formData[freeOptionFieldId] || false;
      const selectedDates = formData[dateFieldId] || [];
      const totalDates = paymentField.dateOptions?.length || 0;
      const isPartial = selectedDates.length > 0 && selectedDates.length < totalDates;

      console.log('🔍 Payment Calculator Debug:', {
        paymentField: paymentField.id,
        dateFieldId,
        freeOptionFieldId,
        isFree,
        selectedDates,
        totalDates,
        isPartial,
        extraCounts: participant.extraCounts,
        pricing: paymentField.pricing,
      });

      // 현재 날짜가 1차 등록 마감일 이전인지 확인
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

      console.log('💰 Price Info:', {
        isPhase1,
        phase1Enabled,
        phase2Enabled,
        phase,
        isPartial,
        isFree,
      });

      if (phase && selectedDates.length > 0) {
        // extraCounts에서 계산 (대표자 포함된 값)
        const adult = participant.extraCounts?.adult || 0;
        const minor8plus = participant.extraCounts?.minor8plus || 0;
        const minorUnder8 = participant.extraCounts?.minorUnder8 || 0;

        let totalAmount = 0;

        // isFree가 체크되지 않은 경우에만 금액 계산
        if (!isFree) {
          if (isPartial) {
            // 부분 참석: 날짜별 개별 가격 합산
            selectedDates.forEach(date => {
              const datePrice = phase?.perDate?.[date];
              if (datePrice) {
                totalAmount += (datePrice.adult || 0) * adult;
                totalAmount += (datePrice.minor8plus || 0) * minor8plus;
                totalAmount += (datePrice.minorUnder8 || 0) * minorUnder8;
              }
            });
          } else {
            // 전체 참석: 전체 참석 가격 사용
            const fullPrice = phase?.full;
            if (fullPrice) {
              totalAmount = (
                (fullPrice.adult || 0) * adult +
                (fullPrice.minor8plus || 0) * minor8plus +
                (fullPrice.minorUnder8 || 0) * minorUnder8
              );
            }
          }
        }

        console.log('💵 Calculated Amount:', totalAmount, isFree ? '(isFree=true, amount set to 0)' : '');

        participant.amount = {
          first: totalAmount,
          second: 0,
          total: totalAmount,
        };
        participant.isPartial = isPartial;
        participant.partialDates = isPartial ? selectedDates : [];
        participant.registrationPhase = isPhase1 ? 'phase1' : 'phase2';
        participant.isFreePayment = isFree;
      }
    }

    // 8. 숙박비 계산 (accommodation-calculator 필드가 있는 경우)
    const accommodationField = form.fields.find(f => f.type === 'accommodation-calculator');

    let selectedAccomDates = [];
    let selectedRoomType = '';
    let pricePerNight = 0;
    let isPhase1 = true;
    let roomTypeOption = null;
    let isFreeAccommodation = false;

    if (accommodationField) {
      const accomDateFieldId = `${accommodationField.id}_dates`;
      const accomRoomTypeFieldId = `${accommodationField.id}_roomType`;
      const accomRoomOptionsFieldId = `${accommodationField.id}_roomOptions`;
      const accomFreeOptionFieldId = `${accommodationField.id}_free`;
      isFreeAccommodation = formData[accomFreeOptionFieldId] || false;
      selectedAccomDates = formData[accomDateFieldId] || [];
      selectedRoomType = formData[accomRoomTypeFieldId] || '';
      const roomOptions = formData[accomRoomOptionsFieldId] || {};

      // 숙박 정보 저장
      participant.accommodationDates = selectedAccomDates;
      participant.roomType = selectedRoomType;

      // 현재 날짜가 1차 등록 마감일 이전인지 확인
      const now = new Date();
      const phase1Deadline = accommodationField.phase1Deadline ? new Date(accommodationField.phase1Deadline) : null;
      isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

      const phase = isPhase1 ? accommodationField.accommodationPricing?.phase1 : accommodationField.accommodationPricing?.phase2;
      pricePerNight = phase?.[selectedRoomType] || 0;

      roomTypeOption = accommodationField.roomTypeOptions?.[selectedRoomType];

      if (pricePerNight && selectedAccomDates.length > 0) {
        const totalNights = selectedAccomDates.length;

        // 방 타입별 인원 수 계산
        let peopleCount = 1;

        if (roomTypeOption?.type === 'gender') {
          // 단체실: 남자 + 여자 인원 수 (대표자 포함)
          const maleList = roomOptions.male || [];
          const femaleList = roomOptions.female || [];

          peopleCount = maleList.length + femaleList.length;
        } else if (roomTypeOption?.type === 'count') {
          // 가족실: people 배열 사용 (성별 구분 없음)
          const peopleList = roomOptions.people || [];
          peopleCount = peopleList.length;
        }

        // 총 숙박비 계산 (isFreeAccommodation이 false일 때만)
        let totalAccommodationAmount = 0;
        if (!isFreeAccommodation) {
          if (roomTypeOption?.type === 'gender') {
            // 단체실: 대표자도 1인 금액만 내기 (개별 인원과 동일)
            totalAccommodationAmount = pricePerNight * totalNights;
          } else {
            // 2인실 등: 1박 요금 × 박수 (인원수 무관)
            totalAccommodationAmount = pricePerNight * totalNights;
          }
        }

        participant.accommodationAmount = {
          pricePerNight: isFreeAccommodation ? 0 : pricePerNight,
          totalNights,
          peopleCount,
          total: totalAccommodationAmount,
          phase: isPhase1 ? 'phase1' : 'phase2',
        };
        participant.isFreeAccommodation = isFreeAccommodation;

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

    // 10-1. 만약 단체실(gender) 또는 가족실(count) type 방이라면, 각 인원을 개별 문서로 저장
    if ((roomTypeOption?.type === 'gender' || roomTypeOption?.type === 'count') && accommodationField) {
      const accomRoomOptionsFieldId = `${accommodationField.id}_roomOptions`;
      const roomOptions = formData[accomRoomOptionsFieldId] || {};
      const isPrivateRoom = roomTypeOption?.type === 'count';

      let allPeople = [];
      let representativePerson = null;

      if (isPrivateRoom) {
        // 가족실: people 배열 사용
        const peopleList = roomOptions.people || [];
        allPeople = peopleList;
        representativePerson = peopleList.find(p => p.isRepresentative);
      } else {
        // 단체실: male/female 배열 사용
        const maleList = (roomOptions.male || []).filter(p => !p.isRepresentative);
        const femaleList = (roomOptions.female || []).filter(p => !p.isRepresentative);
        allPeople = [...(roomOptions.male || []), ...(roomOptions.female || [])];
        representativePerson = allPeople.find(p => p.isRepresentative);
      }

      const representativeIncluded = !!representativePerson;

      // 대표자 이름 가져오기
      const nameField = form.fields.find(f => f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명')));
      const representativeName = formData[nameField?.id] || '대표자';

      // 그룹 ID 생성
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 총 그룹 인원 계산
      let totalGroupMembers = 0;
      if (isPrivateRoom) {
        // 가족실: people 배열 길이
        totalGroupMembers = allPeople.length;
      } else {
        // 단체실: 남자 + 여자 (대표자 제외) + 대표자(1명)
        const maleList = (roomOptions.male || []).filter(p => !p.isRepresentative);
        const femaleList = (roomOptions.female || []).filter(p => !p.isRepresentative);
        totalGroupMembers = maleList.length + femaleList.length;
        if (representativeIncluded) totalGroupMembers += 1;
      }

      // 대표자 문서에 그룹 정보 추가
      participant.groupId = groupId;
      participant.isRepresentative = true;
      participant.representativeIncluded = representativeIncluded;
      participant.totalGroupMembers = totalGroupMembers;
      participant.groupPosition = 0;

      // 단체실인 경우 대표자의 성별도 저장
      if (!isPrivateRoom && representativePerson) {
        // representativePerson에 gender가 있으면 사용, 없으면 어느 배열에 있는지로 판단
        if (representativePerson.gender) {
          participant.gender = representativePerson.gender;
        } else {
          // male 배열에 있는지 확인
          const isInMale = (roomOptions.male || []).some(p => p.isRepresentative || p.name === representativeName);
          // female 배열에 있는지 확인
          const isInFemale = (roomOptions.female || []).some(p => p.isRepresentative || p.name === representativeName);

          if (isInMale) {
            participant.gender = 'male';
          } else if (isInFemale) {
            participant.gender = 'female';
          } else {
            participant.gender = null;
          }
        }
      }

      // 대표자 문서 저장
      const representativeDocRef = await adminDb.collection(collectionName).add(participant);

      let position = 1;
      const createdDocs = [representativeDocRef.id];

      if (isPrivateRoom) {
        // 가족실: people 배열 처리
        const peopleList = roomOptions.people || [];
        for (const person of peopleList) {
          // 본인(대표자)은 이미 저장했으므로 스킵
          if (person.isRepresentative) continue;

          // 추가 인원은 0원
          const individualAccomAmount = 0;

          const additionalParticipant = {
            formId,
            formName,
            groupId,
            isRepresentative: false,
            representativeName,
            representativeId: representativeDocRef.id,
            totalGroupMembers,
            groupPosition: position++,
            age: person.age || null,
            accommodationDates: selectedAccomDates,
            roomType: selectedRoomType,
            accommodationAmount: {
              pricePerNight: 0,
              totalNights: selectedAccomDates.length,
              peopleCount: 1,
              total: individualAccomAmount,
              phase: isPhase1 ? 'phase1' : 'phase2',
            },
            amount: {
              first: 0,
              second: 0,
              total: individualAccomAmount,
            },
            paymentStatus: 'unpaid',
            registeredAt,
            roomId: null,
            roomName: null,
            roomAssignments: {},
            createdAt: Timestamp.now(),
            isFreeAccommodation: false,
          };

          // 이름과 전화번호 추가
          if (nameField?.id) {
            additionalParticipant[nameField.id] = `${person.name} - 등록:${representativeName}`;
          }
          const phoneField = form.fields.find(f => f.type === 'tel');
          if (phoneField?.id && person.phone) {
            additionalParticipant[phoneField.id] = person.phone;
          }

          const additionalDocRef = await adminDb.collection(collectionName).add(additionalParticipant);
          createdDocs.push(additionalDocRef.id);
        }
      } else {
        // 단체실: male/female 배열 처리
        // 대표자는 본인 이름으로 필터링 (isRepresentative 플래그와 이름 둘 다 체크)
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

        // 남자 인원 각각 문서로 저장
        for (const male of maleList) {
          const individualAccomAmount = isFreeAccommodation ? 0 : (pricePerNight * selectedAccomDates.length);

          const maleParticipant = {
            formId,
            formName,
            groupId,
            isRepresentative: false,
            representativeName,
            representativeId: representativeDocRef.id,
            totalGroupMembers,
            groupPosition: position++,
            gender: 'male',
            age: male.age || null,
            accommodationDates: selectedAccomDates,
            roomType: selectedRoomType,
            accommodationAmount: {
              pricePerNight: isFreeAccommodation ? 0 : pricePerNight,
              totalNights: selectedAccomDates.length,
              peopleCount: 1,
              total: individualAccomAmount,
              phase: isPhase1 ? 'phase1' : 'phase2',
            },
            amount: {
              first: 0,
              second: 0,
              total: individualAccomAmount,
            },
            paymentStatus: 'unpaid',
            registeredAt,
            roomId: null,
            roomName: null,
            roomAssignments: {},
            createdAt: Timestamp.now(),
            isFreeAccommodation,
          };

          // 이름과 전화번호 추가
          if (nameField?.id) {
            maleParticipant[nameField.id] = `${male.name} - 등록:${representativeName}`;
          }
          const phoneField = form.fields.find(f => f.type === 'tel');
          if (phoneField?.id && male.phone) {
            maleParticipant[phoneField.id] = male.phone;
          }

          const maleDocRef = await adminDb.collection(collectionName).add(maleParticipant);
          createdDocs.push(maleDocRef.id);
        }

        // 여자 인원 각각 문서로 저장
        for (const female of femaleList) {
          const individualAccomAmount = isFreeAccommodation ? 0 : (pricePerNight * selectedAccomDates.length);

          const femaleParticipant = {
            formId,
            formName,
            groupId,
            isRepresentative: false,
            representativeName,
            representativeId: representativeDocRef.id,
            totalGroupMembers,
            groupPosition: position++,
            gender: 'female',
            age: female.age || null,
            accommodationDates: selectedAccomDates,
            roomType: selectedRoomType,
            accommodationAmount: {
              pricePerNight: isFreeAccommodation ? 0 : pricePerNight,
              totalNights: selectedAccomDates.length,
              peopleCount: 1,
              total: individualAccomAmount,
              phase: isPhase1 ? 'phase1' : 'phase2',
            },
            amount: {
              first: 0,
              second: 0,
              total: individualAccomAmount,
            },
            paymentStatus: 'unpaid',
            registeredAt,
            roomId: null,
            roomName: null,
            roomAssignments: {},
            createdAt: Timestamp.now(),
            isFreeAccommodation,
          };

          // 이름과 전화번호 추가
          if (nameField?.id) {
            femaleParticipant[nameField.id] = `${female.name} - 등록:${representativeName}`;
          }
          const phoneField = form.fields.find(f => f.type === 'tel');
          if (phoneField?.id && female.phone) {
            femaleParticipant[phoneField.id] = female.phone;
          }

          const femaleDocRef = await adminDb.collection(collectionName).add(femaleParticipant);
          createdDocs.push(femaleDocRef.id);
        }
      }

      return NextResponse.json({
        ok: true,
        participantId: representativeDocRef.id,
        groupId,
        createdDocs,
        collectionName
      });
    }

    // 10-2. 일반 등록 (gender type이 아닌 경우)
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
