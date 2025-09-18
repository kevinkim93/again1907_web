import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { collectionName, participantId, status } = await req.json();

  if (!collectionName || !participantId || !status) {
    return new NextResponse('collectionName, participantId, status are required', { status: 400 });
  }

  await adminDb.collection(collectionName).doc(participantId).update({
    paymentStatus: status,
  });

  return NextResponse.json({ ok: true });
}
