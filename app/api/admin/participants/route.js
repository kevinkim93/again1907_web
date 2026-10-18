import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const collectionName = searchParams.get('collectionName');

  // 페이지네이션 파라미터
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // 필터링 파라미터
  const paymentStatus = searchParams.get('paymentStatus'); // 'paid', 'unpaid', null(전체)
  const searchName = searchParams.get('searchName');
  const nameFieldId = searchParams.get('nameFieldId'); // 동적 폼의 이름 필드 ID
  const groupId = searchParams.get('groupId');
  const roomType = searchParams.get('roomType');

  if (!collectionName) {
    return new NextResponse('collectionName is required', { status: 400 });
  }

  try {
    // 기본 쿼리 (정렬 없이 시작)
    let query = adminDb.collection(collectionName);

    // 서버 사이드 필터링 적용 (Firestore where 사용)
    // 이름 검색을 제외한 나머지 필터들만 서버에서 처리
    if (paymentStatus) {
      query = query.where('paymentStatus', '==', paymentStatus);
    }

    if (groupId) {
      query = query.where('groupId', '==', groupId);
    }

    if (roomType) {
      query = query.where('roomType', '==', roomType);
    }

    // 모든 데이터 가져오기
    const allSnap = await query.get();

    let participants = allSnap.docs.map(doc => {
      const data = doc.data();

      // createdAt 변환: Firestore Timestamp 또는 문자열 처리
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

    // 클라이언트 측에서 최신순 정렬
    participants.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // 최신순
    });

    // 이름 검색 필터링 (동적 필드 ID 지원)
    if (searchName) {
      const searchLower = searchName.toLowerCase();

      participants = participants.filter(p => {
        const searchableFields = [];

        // 동적 필드 ID로 저장된 이름 (예: field_123456: "박지현")
        if (nameFieldId && p[nameFieldId]) {
          // 그룹원의 경우 "이름 - 등록:대표자명" 형식에서 이름 부분만 추출
          const nameValue = p[nameFieldId];
          const actualName = nameValue.includes(' - 등록:')
            ? nameValue.split(' - 등록:')[0]
            : nameValue;
          searchableFields.push(actualName);
        }

        // 그룹원의 대표자 이름 필드도 검색
        if (p.representativeName) {
          searchableFields.push(p.representativeName);
        }

        return searchableFields.some(field =>
          field && field.toLowerCase().includes(searchLower)
        );
      });
    }

    // 필터링된 결과에 페이지네이션 적용
    const totalFiltered = participants.length;
    const offset = (page - 1) * limit;
    const paginatedParticipants = participants.slice(offset, offset + limit);
    const hasMore = offset + limit < totalFiltered;

    return NextResponse.json({
      participants: paginatedParticipants,
      pagination: {
        page,
        limit,
        hasNext: hasMore,
        hasPrev: page > 1,
        totalFiltered,
      }
    });
  } catch (err) {
    console.error('참가자 조회 에러:', err);
    return new NextResponse('참가자 조회 실패', { status: 500 });
  }
}
