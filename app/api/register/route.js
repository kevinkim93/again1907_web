// app/api/register/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req) {
  try {
    const data = await req.json();

    // settings/current 불러오기
    const settingsSnap = await adminDb.collection('settings').doc('current').get();
    const settings = settingsSnap.exists ? settingsSnap.data() : { dbName: 'participants_default' };

    const collectionName = settings.dbName || 'participants_default';

    const totalPeople = 1
      + (data.extraCounts?.adult || 0)
      + (data.extraCounts?.minor8plus || 0)
      + (data.extraCounts?.minorUnder8 || 0);

    await adminDb.collection(collectionName).add({
      ...data,
      totalPeople,
      createdAt: new Date(),
      roomId: null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return new NextResponse('등록 중 오류 발생', { status: 500 });
  }
}
