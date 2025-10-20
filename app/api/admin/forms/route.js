import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

// 모든 폼 목록 가져오기
export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const doc = await adminDb.collection('settings').doc('current').get();
  const rawSettings = doc.exists ? doc.data() : {};

  // Timestamp를 평범한 객체로 변환
  const settings = JSON.parse(JSON.stringify(rawSettings));
  const forms = settings.forms || [];

  return NextResponse.json({ forms });
}

// 새 폼 생성
export async function POST(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const { name, description } = await req.json();

  const doc = await adminDb.collection('settings').doc('current').get();
  const settings = doc.exists ? doc.data() : {};
  const forms = settings.forms || [];

  const newForm = {
    id: `form_${Date.now()}`,
    name: name || '새 폼',
    description: description || '',
    enabled: true,
    order: forms.length,
    createdAt: new Date().toISOString(),
    fields: []
  };

  forms.push(newForm);

  await adminDb.collection('settings').doc('current').set(
    { forms, updatedAt: new Date() },
    { merge: true }
  );

  return NextResponse.json({ ok: true, form: newForm });
}

// 폼 업데이트
export async function PUT(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const { formId, updates } = await req.json();

  const doc = await adminDb.collection('settings').doc('current').get();
  const settings = doc.exists ? doc.data() : {};
  const forms = settings.forms || [];

  const index = forms.findIndex(f => f.id === formId);
  if (index === -1) {
    return new NextResponse('Form not found', { status: 404 });
  }

  forms[index] = { ...forms[index], ...updates, updatedAt: new Date().toISOString() };

  await adminDb.collection('settings').doc('current').set(
    { forms, updatedAt: new Date() },
    { merge: true }
  );

  return NextResponse.json({ ok: true, form: forms[index] });
}

// 폼 삭제
export async function DELETE(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  const { formId } = await req.json();

  const doc = await adminDb.collection('settings').doc('current').get();
  const settings = doc.exists ? doc.data() : {};
  const forms = settings.forms || [];

  const filtered = forms.filter(f => f.id !== formId);

  await adminDb.collection('settings').doc('current').set(
    { forms: filtered, updatedAt: new Date() },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
