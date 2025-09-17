// app/admin/rooms/page.js
'use client';
import { useEffect, useState } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [form, setForm] = useState({ name:'', capacity:4, gender:'혼성' });
  const fetchAll = async () => {
    const [r, u] = await Promise.all([
      fetch('/api/admin/rooms').then(r=>r.json()),
      fetch('/api/admin/unassigned').then(r=>r.json()),
    ]);
    setRooms(r.rooms); setUnassigned(u.participants);
  };
  useEffect(()=>{ fetchAll(); },[]);
  const createRoom = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/rooms', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setForm({ name:'', capacity:4, gender:'혼성' });
    fetchAll();
  };
  const assign = async (pid, rid) => {
    await fetch('/api/admin/assign', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ participantId: pid, roomId: rid }) });
    fetchAll();
  };
  return (
    <main>
      <h1>방배정 현황</h1>

      <section style={{ display:'flex', gap:24 }}>
        <div>
          <h3>방 생성</h3>
          <form onSubmit={createRoom} style={{ display:'grid', gap:8 }}>
            <input placeholder="방 이름" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input type="number" min="1" placeholder="정원" value={form.capacity} onChange={e=>setForm({...form, capacity:+e.target.value})} required />
            <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
              <option>혼성</option><option>남</option><option>여</option>
            </select>
            <button>생성</button>
          </form>
        </div>

        <div>
          <h3>미배정 인원</h3>
          <ul>
            {unassigned.map(p => (
              <li key={p.id}>
                {p.name} ({p.gender}) &nbsp;
                <select onChange={e => assign(p.id, e.target.value)} defaultValue="">
                  <option value="" disabled>방 배정</option>
                  {rooms
                    .filter(r => r.gender === '혼성' || r.gender === p.gender)
                    .map(r => <option key={r.id} value={r.id}>{r.name} ({r.current}/{r.capacity})</option>)}
                </select>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>방 목록</h3>
          <ul>
            {rooms.map(r => (
              <li key={r.id}>
                <b>{r.name}</b> [{r.gender}] {r.current}/{r.capacity}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr style={{ margin:'24px 0' }}/>
      <section>
        <h3>관리자 등록/조회</h3>
        <AdminRegister />
      </section>
    </main>
  );
}

function AdminRegister() {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const load = async () => {
    const data = await fetch('/api/admin/admins').then(r=>r.json());
    setAdmins(data.admins || []);
  };
  useEffect(()=>{ load(); },[]);
  const add = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/admins', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
    setName(''); load();
  };
  return (
    <>
      <form onSubmit={add} style={{ display:'flex', gap:8 }}>
        <input placeholder="관리자 이름" value={name} onChange={e=>setName(e.target.value)} required />
        <button>등록</button>
      </form>
      <ul>{admins.map(a => <li key={a.id}>{a.name} ({a.role})</li>)}</ul>
    </>
  );
}
