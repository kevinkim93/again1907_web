'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLogin() {
  const sp = useSearchParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  // 로그아웃 처리
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
    if (res.ok) {
      location.href = '/admin';
    } else {
      setMsg(await res.text());
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          관리자 로그인
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {msg && (
            <p className="text-sm text-red-600">{msg}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  );
}
