import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../../_auth';

/**
 * GET /api/admin/participants/all
 *
 * 전체 참가자 데이터를 한 번에 가져오는 엔드포인트
 * 클라이언트 측 필터링 최적화를 위해 페이지네이션 없이 모든 데이터 반환
 *
 * 이름 필터링은 클라이언트에서 처리하므로 서버에서는 제외
 */
export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const collectionName = searchParams.get('collectionName');

  // Firestore 인덱스 가능한 필터만 서버에서 처리
  const paymentStatus = searchParams.get('paymentStatus');
  const groupId = searchParams.get('groupId');
  const roomType = searchParams.get('roomType');

  if (!collectionName) {
    return new NextResponse('collectionName is required', { status: 400 });
  }

  try {
    let query = adminDb.collection(collectionName);

    // Firestore where 필터 적용 (인덱스 사용 가능)
    if (paymentStatus) {
      query = query.where('paymentStatus', '==', paymentStatus);
    }

    if (groupId) {
      query = query.where('groupId', '==', groupId);
    }

    if (roomType) {
      query = query.where('roomType', '==', roomType);
    }

    // 전체 데이터 가져오기 (페이지네이션 없음)
    const snapshot = await query.get();

    let participants = snapshot.docs.map(doc => {
      const data = doc.data();

      // createdAt 타임스탬프 변환
      let createdAtValue = null;
      if (data.createdAt) {
        if (typeof data.createdAt === 'string') {
          createdAtValue = data.createdAt;
        } else if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
          createdAtValue = data.createdAt.toDate().toISOString();
        }
      }

      return {
        id: doc.id,
        ...data,
        createdAt: createdAtValue,
        roomAssignments: data.roomAssignments || {},
      };
    });

    // 최신순 정렬
    participants.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // 응답 반환 (이름 필터링은 클라이언트에서 처리)
    return NextResponse.json({
      participants,
      totalCount: participants.length,
      timestamp: new Date().toISOString(),
      cachedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching all participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants', details: error.message },
      { status: 500 }
    );
  }
}
