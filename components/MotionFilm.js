'use client';

import { Pause, Play } from 'lucide-react';
import useAmbientVideo from '@/hooks/useAmbientVideo';
import './MotionFilm.css';

export default function MotionFilm({ src, poster, label, className = '' }) {
  const { containerRef, videoRef, playing, unavailable, togglePlayback, videoEvents } = useAmbientVideo();
  return (
    <div ref={containerRef} className={`motion-film ${className}`} role="group" aria-label={`${label} 영상`}
      style={{ backgroundImage: `url("${poster}")` }}>
      <video ref={videoRef} className="motion-film-video" data-unavailable={unavailable} poster={poster}
        preload="none" muted loop playsInline aria-hidden="true" {...videoEvents}>
        <source src={src} type="video/mp4" onError={videoEvents.onError} />
      </video>
      <button className="motion-film-toggle" type="button" onClick={togglePlayback} disabled={unavailable}
        aria-label={`${label} ${unavailable ? '영상 재생 불가' : playing ? '영상 일시정지' : '영상 재생'}`}>
        {playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        <span>{unavailable ? '영상 준비 중' : playing ? '영상 일시정지' : '영상 재생'}</span>
      </button>
    </div>
  );
}
