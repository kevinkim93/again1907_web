import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  try {
    const { collectionName, participantId, checkInStatus } = await req.json();

    if (!collectionName || !participantId || !checkInStatus) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    if (!['checked', 'unchecked'].includes(checkInStatus)) {
      return new NextResponse('Invalid check-in status', { status: 400 });
    }

    await adminDb.collection(collectionName).doc(participantId).update({
      checkInStatus
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error updating check-in status:', err);
    return new NextResponse('Failed to update check-in status', { status: 500 });
  }
}
