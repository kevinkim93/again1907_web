import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { collectionName, participantId, roomId, roomName } = await req.json();

  if (!collectionName || !participantId) {
    return new NextResponse('collectionName and participantId are required', { status: 400 });
  }

  await adminDb.collection(collectionName).doc(participantId).update({
    roomId: roomId || null,
    roomName: roomName || null,
  });

  return NextResponse.json({ ok: true });
}
