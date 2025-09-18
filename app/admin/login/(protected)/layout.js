import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export default function ProtectedAdminLayout({ children }) {
  const token = cookies().get('admin_token')?.value;
  if (token !== expectedToken()) {
    redirect('/admin/login');  // ✅ 보호 구역에서만 실행됨
  }
  return (
    <section className="p-4">
      <nav className="mb-4">
        <a href="/admin" className="mr-4">대시보드</a>
        <a href="/admin/attendees" className="mr-4">인원관리</a>
        <a href="/admin/rooms" className="mr-4">방배정 현황</a>
        <a href="/admin/login?logout=1">로그아웃</a>
      </nav>
      {children}
    </section>
  );
}
