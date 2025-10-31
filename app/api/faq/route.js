import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET: 공개 FAQ 목록 조회 (인증 불필요)
export async function GET() {
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
