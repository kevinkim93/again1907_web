import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// 사용자가 볼 수 있는 활성화된 폼 목록만 반환
export async function GET(req) {
  const doc = await adminDb.collection('settings').doc('current').get();
  const settings = doc.exists ? doc.data() : {};
  const forms = settings.forms || [];

  // enabled가 true인 폼만 필터링하고 order로 정렬
  const activeForms = forms
    .filter(f => f.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return NextResponse.json({ forms: activeForms });
}
