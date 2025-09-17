// app/api/admin/login/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export async function POST(req) {
  const { password } = await req.json();
  if ((password || '') !== (process.env.ADMIN_PASSWORD || '1907')) {
    return new NextResponse('비밀번호가 올바르지 않습니다.', { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', expectedToken(), {
    httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 8
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
