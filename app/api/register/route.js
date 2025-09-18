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
  if (age >= 19) return 'adult';       // 성인
  if (age >= 8) return 'minor8plus';  // 8세 이상 미성년
  return 'minorUnder8';               // 8세 미만
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

    // 2. 등록 당시 날짜 (YYYY-MM-DD)
    const now = new Date();
    const registeredAt = now.toISOString().split('T')[0]; 

    // 3. 등록 기간 판별 (가격표 적용)
    let period = settings.registrationPeriods?.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return now >= start && now <= end;
    });
    if (!period && settings.registrationPeriods?.length > 0) {
      period = settings.registrationPeriods.at(-1);
    }

    // 4. 본인 연령대 판별
    const age = calcKRAgeByYear(data.dob);
    const ageGroup = getAgeGroupByYear(age);

    // 5. extraCounts 초기화
    const extraCounts = {
      adult: data.extraCounts?.adult || 0,
      minor8plus: data.extraCounts?.minor8plus || 0,
      minorUnder8: data.extraCounts?.minorUnder8 || 0,
    };

    // 6. 본인 카운트 반영
    extraCounts[ageGroup] += 1;

    // 7. 총 인원
    const totalPeople =
      extraCounts.adult + extraCounts.minor8plus + extraCounts.minorUnder8;

    // 8. 금액 계산
    let totalAmount = 0;
    let unitPrice = {};

    if (data.isPartial && data.partialDates?.length > 0) {
      const days = data.partialDates.length;
      unitPrice = period?.partialPrice || { adult: 0, minor8plus: 0, minorUnder8: 0 };
      totalAmount =
        unitPrice.adult * extraCounts.adult * days +
        unitPrice.minor8plus * extraCounts.minor8plus * days +
        unitPrice.minorUnder8 * extraCounts.minorUnder8 * days;
    } else {
      unitPrice = period?.fullPrice || { adult: 0, minor8plus: 0, minorUnder8: 0 };
      totalAmount =
        unitPrice.adult * extraCounts.adult +
        unitPrice.minor8plus * extraCounts.minor8plus +
        unitPrice.minorUnder8 * extraCounts.minorUnder8;
    }

    // 9. 참가자 문서 생성
    const participant = {
      ...data,
      ageGroup,
      extraCounts,
      totalPeople,
      registeredAt,   // "YYYY-MM-DD"
      amount: {
        adult: unitPrice.adult,
        minor8plus: unitPrice.minor8plus,
        minorUnder8: unitPrice.minorUnder8,
        total: totalAmount,
      },
      paymentStatus: 'unpaid',
      roomId: null,
      roomName: null,
      createdAt: Timestamp.now(), // ✅ Firestore Timestamp 저장
    };

    // 10. 저장
    await adminDb.collection(settings.dbName || 'participants_default').add(participant);

    return NextResponse.json({ ok: true, participant });
  } catch (err) {
    console.error('🔥 등록 에러:', err);
    return new NextResponse('등록 중 오류 발생', { status: 500 });
  }
}
