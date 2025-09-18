import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907'; // 기본값은 1907
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

// 로그인 처리
export async function POST(req) {
  const body = await req.json();
  const { password } = body;

  if ((password || '') !== (process.env.ADMIN_PASSWORD || '1907')) {
    return new NextResponse('비밀번호가 올바르지 않습니다.', { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', expectedToken(), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8시간 유지
  });
  return res;
}

// 로그아웃 처리
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
