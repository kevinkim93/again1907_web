// app/api/admin/_auth.js
import crypto from 'crypto';
import { NextResponse } from 'next/server';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export function requireAdmin(req) {
  const token = req.cookies.get('admin_token')?.value;
  if (token !== expectedToken()) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  return null;
}
