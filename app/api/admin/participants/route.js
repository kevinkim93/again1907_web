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
    const participants = snap.docs.map(doc => {
      const data = doc.data();

      // roomAssignments를 명시적으로 처리
      const roomAssignments = data.roomAssignments || {};

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        roomAssignments: roomAssignments, // 명시적으로 포함
      };
    });

    console.log('🔍 Participants API Debug:');
    console.log('  Total participants:', participants.length);
    const withAssignments = participants.filter(p => p.roomAssignments && Object.keys(p.roomAssignments).length > 0);
    console.log('  With room assignments:', withAssignments.length);
    if (withAssignments.length > 0) {
      console.log('  Sample assignment:', {
        id: withAssignments[0].id,
        roomAssignments: withAssignments[0].roomAssignments
      });
    }

    return NextResponse.json({ participants });
  } catch (err) {
    console.error('참가자 조회 에러:', err);
    return new NextResponse('참가자 조회 실패', { status: 500 });
  }
}
