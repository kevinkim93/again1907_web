'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function CinematicHero({ children }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const wantsPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inViewport = true;
    let disposed = false;
    wantsPlayback.current = !motionPreference.matches;
    section.dataset.motionReady = 'true';

    const syncPlayback = () => {
      if (document.hidden || !inViewport || !wantsPlayback.current) {
        video.pause();
        return;
      }
      video.play().catch(() => {
        // Blocked autoplay leaves the poster and manual play control available.
        if (!disposed) setPlaying(false);
      });
    };
    const onPreferenceChange = () => {
      wantsPlayback.current = !motionPreference.matches;
      syncPlayback();
    };

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting;
        syncPlayback();
      }, { threshold: 0.01 });
      observer.observe(section);
    } else {
      syncPlayback();
    }
    document.addEventListener('visibilitychange', syncPlayback);
    motionPreference.addEventListener('change', onPreferenceChange);

    return () => {
      disposed = true;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      motionPreference.removeEventListener('change', onPreferenceChange);
      video.pause();
      delete section.dataset.motionReady;
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    wantsPlayback.current = !playing;
    if (playing) video.pause();
    else video.play().catch(() => setPlaying(false));
  };

  return (
    <section ref={sectionRef} className="cinematic-hero" aria-labelledby="gathering-title">
      <div className="hero-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-film"
          data-unavailable={unavailable}
          poster="/images/again1907-6th-motion.jpg"
          preload="none"
          muted
          loop
          playsInline
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => { setUnavailable(true); setPlaying(false); }}
        >
          <source src="/videos/again1907-6th-motion.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      {children}
      <div className="hero-motion-control page-width">
        <button className="motion-toggle" type="button" onClick={togglePlayback} disabled={unavailable}
          aria-label={unavailable ? '배경 영상 재생 불가' : playing ? '배경 영상 일시정지' : '배경 영상 재생'}>
          {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
          <span>{unavailable ? '배경 이미지' : playing ? '영상 일시정지' : '영상 재생'}</span>
        </button>
      </div>
    </section>
  );
}
