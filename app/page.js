'use client';

import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const imageRefs = useRef([]);
  const [youtubeUrl, setYoutubeUrl] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const { settings } = await res.json();
          if (settings?.youtubeStreamUrl) {
            setYoutubeUrl(settings.youtubeStreamUrl);
          }
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const observers = imageRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in-active');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px'
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer, index) => {
        if (observer && imageRefs.current[index]) {
          observer.unobserve(imageRefs.current[index]);
        }
      });
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .fade-in-active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <main className="flex flex-col">
        {/* Hero 영역 */}
        {/* Full-screen Image Section 1 */}
        <section
          ref={(el) => (imageRefs.current[0] = el)}
          className=" relative w-full h-full overflow-hidden"
        >
          <img
            src="/images/home1.jpg"
            alt="Again1907 소개 1"
            className="w-full h-full object-cover"
          />
            {/* 절대 위치 버튼 */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex gap-3 md:gap-4">
                <button
                  onClick={() => {
                    window.location.href = '/register';
                  }}
                  className="inline-block px-8 py-3 md:px-12 md:py-4 lg:px-16 lg:py-5 bg-gradient-to-r from-[#4A7CFF] via-[#2F3BA5] to-[#D12C2C] hover:from-[#5A8FFF] hover:via-[#3B4BC5] hover:to-[#E23C3C] text-white font-bold text-base md:text-xl lg:text-2xl rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  등록하기
                </button>
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 md:px-12 md:py-4 lg:px-16 lg:py-5 bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold text-base md:text-xl lg:text-2xl rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    실시간 시청
                  </a>
                )}
          </div>
        </section>
        {/* Full-screen Video Section 2 */}
        <section
          ref={(el) => (imageRefs.current[1] = el)}
          className="relative w-full h-full overflow-hidden"
        >
          <video
            src="/videos/again_video1.mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </section>
        {/* Full-screen Image Section 2 */}
        <section
          ref={(el) => (imageRefs.current[1] = el)}
          className=" relative w-full h-full overflow-hidden"
        >
          <img
            src="/images/home2.jpg"
            alt="Again1907 소개 2"
            className="w-full h-full object-cover"
          />
        </section>

        {/* Full-screen Image Section 3 */}
        <section
          ref={(el) => (imageRefs.current[2] = el)}
          className=" relative w-full h-full overflow-hidden"
        >
          <img
            src="/images/home3.jpg"
            alt="Again1907 소개 3"
            className="w-full h-full object-cover"
          />
        </section>

      </main>
    </>
  );
}
