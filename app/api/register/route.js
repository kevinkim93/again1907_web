import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// 출생연도 기준 나이 계산
function calcKRAgeByYear(dobStr) {
  if (!dobStr) return null;
  const birthYear = new Date(dobStr).getFullYear();
  const thisYear = new Date().getFullYear();
  return thisYear - birthYear;
}

// 연령대 판별
function getAgeGroupByYear(age) {
  if (age >= 19) return 'adult';         // 성인
  if (age >= 7) return 'minor7to18';     // 만 7세 ~ 만 18세
  return 'minorUnder7';                  // 만 7세 미만
}

export async function POST(req) {
  try {
    const data = await req.json();

    // 1. settings 불러오기
    const settingsSnap = await adminDb.collection('settings').doc('current').get();
    if (!settingsSnap.exists) {
      return new NextResponse('Settings not found', { status: 500 });
    }
    const settings = settingsSnap.data();

    // 2. 전화번호 중복 확인
    const phoneDigits = data.phone.replace(/[^\d+]/g, '');
    const existingParticipants = await adminDb
      .collection(settings.dbName || 'participants_default')
      .get();

    const isDuplicate = existingParticipants.docs.some(doc => {
      const existingPhone = doc.data().phone?.replace(/[^\d+]/g, '');
      return existingPhone === phoneDigits;
    });

    if (isDuplicate) {
      return new NextResponse('이미 등록된 전화번호입니다.', { status: 400 });
    }

    // 3. 등록 당시 날짜 (YYYY-MM-DD)
    const now = new Date();
    const registeredAt = now.toISOString().split('T')[0];

    // 4. 등록 기간 판별 (가격표 적용)
    let period = settings.registrationPeriods?.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return now >= start && now <= end;
    });
    if (!period && settings.registrationPeriods?.length > 0) {
      period = settings.registrationPeriods.at(-1);
    }

    // 5. 본인 연령대 판별
    const age = calcKRAgeByYear(data.dob);
    const ageGroup = getAgeGroupByYear(age);

    // 6. extraCounts 초기화
    const extraCounts = {
      adult: data.extraCounts?.adult || 0,
      minor7to18: data.extraCounts?.minor7to18 || 0,
      minorUnder7: data.extraCounts?.minorUnder7 || 0,
    };

    // 7. 본인 카운트 반영
    extraCounts[ageGroup] += 1;

    // 8. 총 인원
    const totalPeople =
      extraCounts.adult + extraCounts.minor7to18 + extraCounts.minorUnder7;

    // 9. 금액 계산 (고정 가격)
    const fullPrice = { adult: 150000, minor7to18: 120000, minorUnder7: 0 };
    const partialPrice = { adult: 40000, minor7to18: 25000, minorUnder7: 0 };

    let totalAmount = 0;
    let unitPrice = {};

    if (data.isPartial && data.partialDates?.length > 0) {
      const days = data.partialDates.length;
      unitPrice = partialPrice;
      totalAmount =
        unitPrice.adult * extraCounts.adult * days +
        unitPrice.minor7to18 * extraCounts.minor7to18 * days +
        unitPrice.minorUnder7 * extraCounts.minorUnder7 * days;
    } else {
      unitPrice = fullPrice;
      totalAmount =
        unitPrice.adult * extraCounts.adult +
        unitPrice.minor7to18 * extraCounts.minor7to18 +
        unitPrice.minorUnder7 * extraCounts.minorUnder7;
    }

    // 10. 참가자 문서 생성
    const participant = {
      ...data,
      ageGroup,
      extraCounts,
      totalPeople,
      registeredAt,   // "YYYY-MM-DD"
      amount: {
        adult: unitPrice.adult,
        minor7to18: unitPrice.minor7to18,
        minorUnder7: unitPrice.minorUnder7,
        total: totalAmount,
      },
      paymentStatus: 'unpaid',
      roomId: null,
      roomName: null,
      createdAt: Timestamp.now(), // ✅ Firestore Timestamp 저장
    };

    // 11. 저장
    await adminDb.collection(settings.dbName || 'participants_default').add(participant);

    return NextResponse.json({ ok: true, participant });
  } catch (err) {
    console.error('🔥 등록 에러:', err);
    return new NextResponse('등록 중 오류 발생', { status: 500 });
  }
}
