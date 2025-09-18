import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function POST(req) {
  const { collectionName, participantId, status, paidAt } = await req.json();

  await adminDb.collection(collectionName).doc(participantId).update({
    paymentStatus: status,
    paidAt: paidAt || null,
  });

  return NextResponse.json({ ok: true });
}
