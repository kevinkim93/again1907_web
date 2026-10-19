'use client';

import useAmbientVideo from '@/hooks/useAmbientVideo';
import './MotionFilm.css';

export default function MotionFilm({ src, poster, label, className = '' }) {
  const { containerRef, videoRef, unavailable, videoEvents } = useAmbientVideo();
  return (
    <div ref={containerRef} className={`motion-film ${className}`} role="group" aria-label={`${label} 영상`}
      style={{ backgroundImage: `url("${poster}")` }}>
      <video ref={videoRef} className="motion-film-video" data-unavailable={unavailable} poster={poster}
        preload="none" muted loop playsInline aria-hidden="true" {...videoEvents}>
        <source src={src} type="video/mp4" onError={videoEvents.onError} />
      </video>
    </div>
  );
}
