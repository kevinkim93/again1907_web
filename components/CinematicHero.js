'use client';

import useAmbientVideo from '@/hooks/useAmbientVideo';

export default function CinematicHero({ children }) {
  const { containerRef, videoRef, unavailable, videoEvents } = useAmbientVideo();
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
    </section>
  );
}
