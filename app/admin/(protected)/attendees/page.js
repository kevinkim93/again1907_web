// app/admin/(protected)/attendees/page.js
import { adminDb } from '@/lib/firebaseAdmin';

export default async function Attendees() {
  // settings에서 dbName 읽기
  const settingsSnap = await adminDb.collection('settings').doc('current').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : { dbName: 'participants_default' };
  const collectionName = settings.dbName || 'participants_default';

  // 참가자 데이터 가져오기
  const snap = await adminDb.collection(collectionName).orderBy('createdAt','desc').get();
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // CSV 생성 함수
  const toCSV = (arr) => {
    const cols = ['name','gender','dob','phone','churchOrRegion','transport','isPartial','partialDates','discovery','totalPeople'];
    const head = cols.join(',');
    const lines = arr.map(r => cols.map(k => {
      const v = Array.isArray(r[k]) ? r[k].join('|') : (r[k] ?? '');
      return `"${String(v).replaceAll('"','""')}"`;
    }).join(','));
    return [head, ...lines].join('\n');
  };

  const csv = toCSV(rows);

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">
        인원관리 — {settings.eventName}
      </h1>

      <a
        href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
        download={`${collectionName}.csv`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        CSV 다운로드
      </a>

      <table className="mt-6 w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">이름</th>
            <th className="border p-2">성별</th>
            <th className="border p-2">생년월일</th>
            <th className="border p-2">연락처</th>
            <th className="border p-2">교회/지역</th>
            <th className="border p-2">교통</th>
            <th className="border p-2">부분참석</th>
            <th className="border p-2">날짜</th>
            <th className="border p-2">총 인원</th>
            <th className="border p-2">방</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.name}</td>
              <td className="border p-2">{r.gender}</td>
              <td className="border p-2">{r.dob}</td>
              <td className="border p-2">{r.phone}</td>
              <td className="border p-2">{r.churchOrRegion}</td>
              <td className="border p-2">{r.transport}</td>
              <td className="border p-2">{r.isPartial ? 'Y' : 'N'}</td>
              <td className="border p-2">{(r.partialDates||[]).join(', ')}</td>
              <td className="border p-2">{r.totalPeople || 1}</td>
              <td className="border p-2">{r.roomId || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
