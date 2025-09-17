// app/api/admin/assign/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { participantId, roomId } = await req.json();
  await adminDb.collection('participants').doc(participantId).update({ roomId });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { searchParams } = new URL(req.url);
  const participantId = searchParams.get('participantId');
  await adminDb.collection('participants').doc(participantId).update({ roomId: null });
  return NextResponse.json({ ok: true });
}
