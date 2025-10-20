import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  try {
    const { collectionName, participantId, paymentStatus } = await req.json();

    if (!collectionName || !participantId || !paymentStatus) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return new NextResponse('Invalid payment status', { status: 400 });
    }

    await adminDb.collection(collectionName).doc(participantId).update({
      paymentStatus
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error updating payment status:', err);
    return new NextResponse('Failed to update payment status', { status: 500 });
  }
}
