import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '../_auth';

function validateSchedulesPayload(schedules) {
  if (!schedules || typeof schedules !== 'object') return 'invalid root object';
  const { tabs, data } = schedules;
  if (!Array.isArray(tabs)) return 'tabs must be an array';
  if (!tabs.every(t => t && typeof t.id === 'string' && typeof t.name === 'string')) {
    return 'each tab must have string id and name';
  }
  if (!data || typeof data !== 'object') return 'data must be an object';
  for (const tab of tabs) {
    const days = data[tab.id];
    if (!Array.isArray(days)) return `data[${tab.id}] must be an array`;
    for (const day of days) {
      if (!day || typeof day !== 'object') return 'day must be object';
      if (typeof day.day !== 'string' || typeof day.date !== 'string') return 'day and date are required strings';
      if (!Array.isArray(day.sessions)) return 'sessions must be an array';
      for (const s of day.sessions) {
        if (!s || typeof s !== 'object') return 'session must be object';
        if (typeof s.time !== 'string' || typeof s.title !== 'string') return 'session.time and session.title are required strings';
        if (s.detail != null && typeof s.detail !== 'string') return 'session.detail must be string if present';
      }
    }
  }
  return null;
}

// GET: read schedules from settings/current
export async function GET(req) {
  const deny = requireAdmin(req); if (deny) return deny;

  try {
    const doc = await adminDb.collection('settings').doc('current').get();
    const settings = doc.exists ? doc.data() : {};
    const schedules = settings.schedules || { tabs: [], data: {} };
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('스케줄 조회 오류:', error);
    return NextResponse.json(
      { error: '스케줄 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: overwrite schedules in settings/current
export async function PUT(request) {
  const deny = requireAdmin(request); if (deny) return deny;

  try {
    const { schedules } = await request.json();
    const validationError = validateSchedulesPayload(schedules);
    if (validationError) {
      return NextResponse.json(
        { error: `invalid schedules: ${validationError}` },
        { status: 400 }
      );
    }

    const payload = {
      schedules: { ...schedules, updatedAt: new Date().toISOString() },
    };

    await adminDb.collection('settings').doc('current').set(payload, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('스케줄 저장 오류:', error);
    return NextResponse.json(
      { error: '스케줄 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


