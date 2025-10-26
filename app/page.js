export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* Hero 영역 */}
      <section className="bg-black text-white min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* 왼쪽: 포스터 이미지 */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="/images/again_poster.png"
                alt="Again 1907 포스터"
                className="w-full max-w-md rounded-lg shadow-2xl"
              />
            </div>

            {/* 오른쪽: 텍스트 설명 */}
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Again 1907
              </h1>
              <div className="space-y-4 text-base sm:text-lg text-gray-300 leading-relaxed break-keep">
                <p className="break-keep">
                  <span className="text-red-500 font-semibold">Again1907 평양 대부흥회</span>는
                  탈북민과 남한 성도들이 하나되어
                  오직 성령으로 충만함을 위해 기도하고 성령님의 마음을 받아
                  남과 북의 부흥을 위해 중보하는 집회입니다.
                </p>
                <p className="break-keep">
                  탈북민과 남한 성도들 가운데 성령님께서 충만하게 임하실 때,
                  북한이 복음으로 회복되고 남한의 교회가 깨어나
                  <span className="text-red-500 font-semibold">복음통일</span>이 이루어질 것입니다.
                  복음통일을 통해 진정한 <span className="text-red-500 font-semibold">민족복음화</span>가 이뤄될 것입니다!
                  민족복음화를 넘어 온 열방의 부흥과 주님께서 다시 오실 길이 예비될 것입니다!
                </p>
                <p className="mt-6 break-keep">
                  성령님께서 임재하시는 곳에 함께하실 동역자분들을
                  주 예수님의 이름으로 초대합니다!
                </p>
              </div>
              <a
                href="/register"
                className="inline-block mt-6 px-8 py-4 bg-red-600 text-white font-semibold text-base rounded-lg hover:bg-red-700 transition shadow-lg"
              >
                등록하기
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
