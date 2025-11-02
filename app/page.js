'use client';

import { useEffect, useRef } from 'react';

export default function HomePage() {
  const imageRefs = useRef([]);

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
