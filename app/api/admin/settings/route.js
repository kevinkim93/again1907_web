// app/api/admin/settings/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const doc = await adminDb.collection('settings').doc('current').get();
  const rawSettings = doc.exists ? doc.data() : null;

  // Timestamp를 문자열로 변환
  const settings = rawSettings ? JSON.parse(JSON.stringify(rawSettings)) : null;

  return NextResponse.json({ settings });
}

export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const data = await req.json();
  await adminDb.collection('settings').doc('current').set({ ...data, updatedAt: new Date() }, { merge: true });
  return NextResponse.json({ ok: true });
}
