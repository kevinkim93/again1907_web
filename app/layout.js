import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }) {
  const navItems = [
    { name: "홈", href: "/" },
    { name: "등록", href: "/register" },
    { name: "조회", href: "/lookup" },
    { name: "FAQ", href: "/faq" },
    { name: "일정", href: "/schedule" },
  ];

  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* 네비게이션 */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* 로고 */}
            <div className="text-xl font-extrabold tracking-tight text-blue-600">
              <Link href="/">Again1907</Link>
            </div>

            {/* 메뉴 */}
            <nav>
              <ul className="flex space-x-8 text-sm font-medium text-gray-700">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        {/* 메인 */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm">
            © {new Date().getFullYear()} Again 1907 평양 대부흥회. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
