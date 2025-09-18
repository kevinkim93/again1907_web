'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginForm() {
  const sp = useSearchParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (sp.get('logout') === '1') {
      fetch('/api/admin/login', { method: 'DELETE' })
        .then(() => setMsg('로그아웃되었습니다.'));
    }
  }, [sp]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) location.href = '/admin';
    else setMsg(await res.text());
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded p-8">
      <h1 className="text-xl font-bold mb-4">관리자 로그인</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="비밀번호"
          required
        />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          로그인
        </button>
      </form>
    </div>
  );
}
