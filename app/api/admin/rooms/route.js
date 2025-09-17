// app/api/admin/rooms/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const snap = await adminDb.collection('rooms').get();
  const participants = await adminDb.collection('participants').get();
  const counts = {};
  participants.forEach(d => {
    const r = d.data().roomId;
    if (r) counts[r] = (counts[r]||0) + 1;
  });
  const rooms = snap.docs.map(d => ({ id: d.id, ...d.data(), current: counts[d.id] || 0 }));
  return NextResponse.json({ rooms });
}

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { name, capacity, gender } = await req.json();
  await adminDb.collection('rooms').add({
    name, capacity: Number(capacity||0), gender: gender||'혼성', createdAt: new Date()
  });
  return NextResponse.json({ ok: true });
}
