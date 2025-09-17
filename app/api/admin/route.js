// app/api/admin/admins/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const snap = await adminDb.collection('admins').orderBy('createdAt','desc').get();
  const admins = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ admins });
}

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const { name } = await req.json();
  await adminDb.collection('admins').add({ name, role: 'room', active: true, createdAt: new Date() });
  return NextResponse.json({ ok: true });
}
