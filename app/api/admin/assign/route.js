import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { collectionName, participantId, roomId, roomName } = await req.json();

  if (!collectionName || !participantId) {
    return new NextResponse('collectionName and participantId are required', { status: 400 });
  }

  // 참가자 정보 가져오기
  const participantDoc = await adminDb.collection(collectionName).doc(participantId).get();
  const participant = participantDoc.data();

  // 참가자의 숙박 날짜 전체에 같은 방 배정
  const accommodationDates = participant.accommodationDates || [];

  // roomAssignments 객체 생성 (모든 숙박 날짜에 같은 방)
  const roomAssignments = {};

  if (roomId && roomName) {
    // 방 배정: 모든 숙박 날짜에 같은 방 할당
    accommodationDates.forEach(date => {
      roomAssignments[date] = { roomId, roomName };
    });
  }
  // roomId가 없으면 빈 객체 (방 해제)

  await adminDb.collection(collectionName).doc(participantId).update({
    roomAssignments,
    roomId: roomId || null,
    roomName: roomName || null,
  });

  return NextResponse.json({ ok: true });
}
