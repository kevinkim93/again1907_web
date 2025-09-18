// app/admin/attendees/page.js
import { adminDb } from '@/lib/firebaseAdmin';

export default async function Attendees() {
  const snap = await adminDb.collection('participants').orderBy('createdAt','desc').get();
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

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
      <h1>인원관리</h1>
      <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} download="participants.csv">
        CSV 다운로드
      </a>
      <table border="1" cellPadding="6" style={{ marginTop:12 }}>
        <thead><tr>
          <th>이름</th><th>성별</th><th>생년월일</th><th>연락처</th><th>교회/지역</th>
          <th>교통</th><th>부분참석</th><th>날짜</th><th>총 인원</th><th>방</th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td><td>{r.gender}</td><td>{r.dob}</td><td>{r.phone}</td>
              <td>{r.churchOrRegion}</td><td>{r.transport}</td>
              <td>{r.isPartial ? 'Y' : 'N'}</td><td>{(r.partialDates||[]).join(', ')}</td>
              <td>{r.totalPeople || 1}</td><td>{r.roomId || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
