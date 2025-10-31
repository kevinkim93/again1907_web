import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export default async function ProtectedAdminLayout({ children }) {
  const cookieStore = await cookies(); // ✅ 이제 반드시 await
  const token = cookieStore.get('admin_token')?.value;

  const pwd = process.env.ADMIN_PASSWORD || '1907';
  const expected = crypto.createHash('sha256').update(pwd).digest('hex');
  
  if (token !== expectedToken()) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">관리자</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="/admin" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            대시보드
          </a>
          <a href="/admin/forms" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            폼 관리
          </a>
          <a href="/admin/attendees" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            인원 관리
          </a>
          <a href="/admin/rooms" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            방 관리
          </a>
          <a href="/admin/faq" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            FAQ 관리
          </a>
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/admin/login?logout=1" className="block w-full text-left rounded-md px-3 py-2 text-red-600 hover:bg-red-100">
            로그아웃
          </a>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
