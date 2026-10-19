'use client';

import { Pause, Play } from 'lucide-react';
import useAmbientVideo from '@/hooks/useAmbientVideo';

export default function CinematicHero({ children }) {
  const { containerRef, videoRef, playing, unavailable, togglePlayback, videoEvents } = useAmbientVideo();
  return (
    <section ref={containerRef} className="cinematic-hero" aria-labelledby="gathering-title">
      <div className="hero-media" aria-hidden="true">
        <video ref={videoRef} className="hero-film" data-unavailable={unavailable}
          poster="/images/again1907-heaven-light.jpg" preload="none" muted loop playsInline {...videoEvents}>
          <source src="/videos/again1907-heaven-light.mp4" type="video/mp4" onError={videoEvents.onError} />
        </video>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      {children}
      <div className="hero-motion-control page-width">
        <button className="motion-toggle" type="button" onClick={togglePlayback} disabled={unavailable}
          aria-label={unavailable ? '배경 영상 재생 불가' : playing ? '배경 영상 일시정지' : '배경 영상 재생'}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          <span>{unavailable ? '배경 이미지' : playing ? '영상 일시정지' : '영상 재생'}</span>
        </button>
      </div>
    </section>
  );
}
