export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export default async function AdminRedirectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token !== expectedToken()) {
    redirect('/admin/login');
  }

  // 인증되어 있으면 실제 admin 대시보드로 리다이렉트
  redirect('/admin/dashboard');
}