import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

// 날짜 문자열을 YYYY-MM-DD 형식으로 변환
function parseKoreanDate(dateStr) {
  // "2026년 1월 7일 (Day3 - 수요일)" → "2026-01-07"
  const matchWithYear = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (matchWithYear) {
    const year = matchWithYear[1];
    const month = matchWithYear[2].padStart(2, '0');
    const day = matchWithYear[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // "1월 26일 (Day1)" → "2026-01-26" (연도가 없는 경우, 2026년으로 가정)
  const matchWithoutYear = dateStr.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (matchWithoutYear) {
    const currentYear = new Date().getFullYear();
    // 이벤트가 2026년이므로 하드코딩 (또는 settings에서 가져올 수도 있음)
    const year = 2026;
    const month = matchWithoutYear[1].padStart(2, '0');
    const day = matchWithoutYear[2].padStart(2, '0');
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
  const { collectionName, participantId, roomNumber, buildingName, rooms: clientRooms } = await req.json();

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
  console.log('  Building Name:', buildingName);
  console.log('  Original accommodationDates:', accommodationDates);

  // roomAssignments 객체 생성
  const roomAssignments = {};
  let firstRoomId = null;
  let firstRoomName = null;

  if (roomNumber) {
    // 🚀 성능 최적화: 클라이언트에서 rooms 데이터를 받으면 사용, 없으면 DB 조회
    let allRooms;
    if (clientRooms && Array.isArray(clientRooms) && clientRooms.length > 0) {
      allRooms = clientRooms;
      console.log('  ✅ Using client-provided rooms:', allRooms.length);
    } else {
      const roomsSnap = await adminDb.collection('rooms').get();
      allRooms = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('  ⚠️ Fetched rooms from DB:', allRooms.length);
    }

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
        r.roomNumber === roomNumber &&
        (r.buildingName || '') === (buildingName || '') &&
        r.date === standardDate
      );

      console.log(`  Looking for room ${roomNumber} on ${standardDate}:`, matchingRoom ? 'FOUND' : 'NOT FOUND');

      if (matchingRoom) {
        // 원본 날짜 문자열을 키로 사용 (한글 형식 유지)
        const displayName = buildingName ? `${buildingName} ${roomNumber}호` : `${roomNumber}호`;
        roomAssignments[dateStr] = {
          roomId: matchingRoom.id,
          roomName: matchingRoom.name || `${displayName} (${standardDate})`,
          buildingName: buildingName || '',
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

  const updateData = {
    roomAssignments,
    roomId: firstRoomId,
    roomName: firstRoomName,
    roomNumber: roomNumber || null, // 방 번호도 저장
    buildingName: buildingName || null, // 숙소 이름도 저장
  };

  await adminDb.collection(collectionName).doc(participantId).update(updateData);

  // 🚀 성능 최적화: 두 번째 읽기 제거, 업데이트한 데이터를 바로 반환
  return NextResponse.json({
    ok: true,
    participant: {
      id: participantId,
      ...participant,  // 기존 데이터
      ...updateData    // 업데이트된 필드
    }
  });
}
