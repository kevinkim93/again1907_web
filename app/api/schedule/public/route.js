import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req) {
  try {
    const doc = await adminDb.collection('settings').doc('current').get();
    const settings = doc.exists ? doc.data() : {};
    const schedules = settings.schedules || { tabs: [], data: {} };

    // Only expose tabs and data
    const { tabs = [], data = {} } = schedules || {};
    return NextResponse.json({ tabs, data });
  } catch (error) {
    console.error('공개 스케줄 조회 오류:', error);
    return NextResponse.json(
      { error: '스케줄 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


