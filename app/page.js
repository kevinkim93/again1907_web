export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero 영역 */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Again 1907 평양 대부흥회
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Again 1907 평양 대부흥회 현장에서 부흥과 변화의 은혜를 경험하세요
          </p>
          <div className="max-w-4xl mx-auto mb-6 sm:mb-10">
            <img
              src="/images/hero.png"
              alt="집회 장면"
              className="rounded-lg shadow-md w-full object-cover"
            />
          </div>
          <a
            href="/register"
            className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-700 transition"
          >
            등록하기
          </a>
        </div>
      </section>

      {/* 집회 소개 섹션 */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-10 text-center">
            예수님만 드러나는 집회
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <img src="/images/cross.png" alt="십자가" className="rounded mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">예수님만 드러나는 집회</h3>
              <p className="text-sm text-gray-600 mt-2">
                예수님만을 높이고 경배하는 거룩한 예배와 찬양이 중심이 됩니다.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <img src="/images/history.png" alt="성령의 역사" className="rounded mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">성령의 역사</h3>
              <p className="text-sm text-gray-600 mt-2">
                1907년 평양 대부흥의 은혜가 오늘날 다시 재현됩니다.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <img src="/images/logo.png" alt="Again 1907" className="rounded mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">부흥의 열정</h3>
              <p className="text-sm text-gray-600 mt-2">
                모든 세대와 교회가 연합하여 함께 기도하며 부흥을 사모합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 상세 소개 섹션 */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Again 1907 평양 대부흥회
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-6">
              한국 교회 부흥의 기원이 되었던 1907년 평양 대부흥의 역사를 오늘 다시 회복합니다.
              전국 각지에서 모여드는 성도들과 함께 뜨거운 기도와 찬양, 말씀의 은혜를 나누며
              새 역사를 써 내려갑니다.
            </p>
            <a
              href="/register"
              className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-700 transition"
            >
              등록하기
            </a>
          </div>
          <div className="max-w-md mx-auto">
            <img
              src="/images/poster.png"
              alt="부흥회 포스터"
              className="rounded-lg shadow-md w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-semibold mb-2">집회문의</h3>
          <p className="text-sm">전화: 010-9866-7628</p>
          <p className="text-sm">이메일: icdanthakub@gmail.com</p>
        </div>
      </footer>
    </main>
  );
}
