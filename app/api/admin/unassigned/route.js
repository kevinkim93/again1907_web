// app/api/admin/unassigned/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;
  const snap = await adminDb.collection('participants').where('roomId','==', null).get();
  const participants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ participants });
}

