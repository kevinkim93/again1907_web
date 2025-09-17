// app/api/admin/settings/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const data = await req.json();
  await adminDb.collection('settings').doc('current').set({ ...data, updatedAt: new Date() }, { merge: true });
  return NextResponse.json({ ok: true });
}
