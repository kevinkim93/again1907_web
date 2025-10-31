import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

// GET: FAQ 목록 조회
export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  try {

    const faqsSnapshot = await adminDb
      .collection('faqs')
      .orderBy('order', 'asc')
      .get();

    const faqs = faqsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('FAQ 조회 오류:', error);
    return NextResponse.json(
      { error: 'FAQ 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: FAQ 추가
export async function POST(request) {
  const deny = requireAdmin(request); if (deny) return deny;

  try {

    const { question, answer, order } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: '질문과 답변은 필수입니다.' },
        { status: 400 }
      );
    }

    const newFaq = {
      question,
      answer,
      order: order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('faqs').add(newFaq);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      ...newFaq
    });
  } catch (error) {
    console.error('FAQ 추가 오류:', error);
    return NextResponse.json(
      { error: 'FAQ 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: FAQ 수정
export async function PUT(request) {
  const deny = requireAdmin(request); if (deny) return deny;

  try {

    const { id, question, answer, order } = await request.json();

    if (!id || !question || !answer) {
      return NextResponse.json(
        { error: 'ID, 질문, 답변은 필수입니다.' },
        { status: 400 }
      );
    }

    await adminDb.collection('faqs').doc(id).update({
      question,
      answer,
      order: order || 0,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FAQ 수정 오류:', error);
    return NextResponse.json(
      { error: 'FAQ 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: FAQ 삭제
export async function DELETE(request) {
  const deny = requireAdmin(request); if (deny) return deny;

  try {

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID는 필수입니다.' },
        { status: 400 }
      );
    }

    await adminDb.collection('faqs').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FAQ 삭제 오류:', error);
    return NextResponse.json(
      { error: 'FAQ 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
