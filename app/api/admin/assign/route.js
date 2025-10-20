import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

// 날짜 문자열을 YYYY-MM-DD 형식으로 변환
function parseKoreanDate(dateStr) {
  // "2026년 1월 7일 (Day3 - 수요일)" → "2026-01-07"
  const match = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 이미 YYYY-MM-DD 형식이면 그대로 반환
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return null;
}

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { collectionName, participantId, roomNumber } = await req.json();

  if (!collectionName || !participantId) {
    return new NextResponse('collectionName and participantId are required', { status: 400 });
  }

  // 참가자 정보 가져오기
  const participantDoc = await adminDb.collection(collectionName).doc(participantId).get();
  const participant = participantDoc.data();

  // 참가자의 숙박 날짜
  const accommodationDates = participant.accommodationDates || [];

  console.log('🔍 Assign API Debug:');
  console.log('  Participant:', participantId);
  console.log('  Room Number:', roomNumber);
  console.log('  Original accommodationDates:', accommodationDates);

  // roomAssignments 객체 생성
  const roomAssignments = {};
  let firstRoomId = null;
  let firstRoomName = null;

  if (roomNumber) {
    // 모든 방 문서 가져오기
    const roomsSnap = await adminDb.collection('rooms').get();
    const allRooms = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log('  Total rooms:', allRooms.length);
    console.log('  Sample room dates:', allRooms.slice(0, 3).map(r => r.date));

    // 각 숙박 날짜에 대해 해당 날짜의 방 번호 문서 찾기
    accommodationDates.forEach(dateStr => {
      // 한글 날짜를 표준 형식으로 변환
      const standardDate = parseKoreanDate(dateStr);

      console.log(`  Converting: "${dateStr}" → "${standardDate}"`);

      if (!standardDate) {
        console.warn(`  ⚠️ Could not parse date: ${dateStr}`);
        return;
      }

      const matchingRoom = allRooms.find(r =>
        r.roomNumber === roomNumber && r.date === standardDate
      );

      console.log(`  Looking for room ${roomNumber} on ${standardDate}:`, matchingRoom ? 'FOUND' : 'NOT FOUND');

      if (matchingRoom) {
        // 원본 날짜 문자열을 키로 사용 (한글 형식 유지)
        roomAssignments[dateStr] = {
          roomId: matchingRoom.id,
          roomName: matchingRoom.name || `${roomNumber}호 (${standardDate})`,
          standardDate: standardDate // 표준 날짜도 함께 저장
        };

        // 첫 번째 방 정보 저장 (하위 호환성)
        if (!firstRoomId) {
          firstRoomId = matchingRoom.id;
          firstRoomName = matchingRoom.name;
        }
      }
    });
  }
  // roomNumber가 없으면 빈 객체 (방 해제)

  console.log('  Final roomAssignments:', roomAssignments);

  await adminDb.collection(collectionName).doc(participantId).update({
    roomAssignments,
    roomId: firstRoomId,
    roomName: firstRoomName,
    roomNumber: roomNumber || null, // 방 번호도 저장
  });

  return NextResponse.json({ ok: true });
}
