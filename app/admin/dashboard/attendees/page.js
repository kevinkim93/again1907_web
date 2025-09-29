import { adminDb } from '@/lib/firebaseAdmin';
import AttendeesTable from '@/components/AttendeesTable';

// 출생연도 기준 나이 계산
function calcKRAgeByYear(dobStr) {
  if (!dobStr) return null;
  const birthYear = new Date(dobStr).getFullYear();
  const thisYear = new Date().getFullYear();
  return thisYear - birthYear;
}

export default async function AttendeesPage() {
  const settingsSnap = await adminDb.collection('settings').doc('current').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : { dbName: 'participants_default', eventName: '집회' };
  const collectionName = settings.dbName || 'participants_default';
  // 참가자
  const snap = await adminDb.collection(collectionName).orderBy('createdAt', 'desc').get();
  const rows = snap.docs.map(d => {
    const data = d.data();
    console.log('createdAt type:', typeof data.createdAt);
    console.log('createdAt value:', data.createdAt);
    console.log('has toDate method:', typeof data.createdAt?.toDate === 'function');
    return {
      id: d.id,
      ...data,
      dob: data.dob || '',
      createdAt: data.createdAt ? String(data.createdAt) : null,
      age: calcKRAgeByYear(data.dob),
    };
  });

  // 방 목록
  const roomsSnap = await adminDb.collection('rooms').get();
  const rooms = roomsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    };
  });

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">
        인원관리 — {settings.eventName}
      </h1>
      <AttendeesTable
        rows={rows}
        rooms={rooms}
        collectionName={collectionName}
        settings={settings}   // ✅ 추가
      />
    </main>
  );
}
