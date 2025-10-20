import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const collectionName = searchParams.get('collectionName');

  if (!collectionName) {
    return new NextResponse('collectionName is required', { status: 400 });
  }

  try {
    const snap = await adminDb.collection(collectionName).orderBy('createdAt', 'desc').get();
    const rawParticipants = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
    }));

    // 모든 Timestamp 객체를 평범한 객체로 변환
    const participants = JSON.parse(JSON.stringify(rawParticipants));

    return NextResponse.json({ participants });
  } catch (err) {
    console.error('참가자 조회 에러:', err);
    return new NextResponse('참가자 조회 실패', { status: 500 });
  }
}
