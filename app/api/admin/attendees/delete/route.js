import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { collectionName, participantId } = await req.json();

  if (!collectionName || !participantId) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  await adminDb.collection(collectionName).doc(participantId).delete();
  return NextResponse.json({ ok: true });
}
