import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// 사용자가 볼 수 있는 settings 정보 (민감한 정보 제외)
export async function GET(req) {
  const doc = await adminDb.collection('settings').doc('current').get();
  const settings = doc.exists ? doc.data() : {};

  // 필요한 정보만 공개
  const publicSettings = {
    eventName: settings.eventName,
    dates: settings.dates,
    openRegistration: settings.openRegistration,
    registrationPeriods: settings.registrationPeriods,
    popupMessage: settings.popupMessage,
    popupEnabled: settings.popupEnabled,
    noticeMessage: settings.noticeMessage,
    noticeEnabled: settings.noticeEnabled,
    youtubeStreamUrl: settings.youtubeStreamUrl,
  };

  return NextResponse.json({ settings: publicSettings });
}
