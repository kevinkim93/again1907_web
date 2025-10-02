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
    <div className="max-w-sm mx-auto bg-white shadow rounded-lg p-6 mt-12">
      <h1 className="text-xl font-bold mb-4 text-center">관리자 로그인</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        >
          로그인
        </button>
      </form>
      {msg && <p className="mt-4 text-center text-red-600">{msg}</p>}
    </div>
  );
}
