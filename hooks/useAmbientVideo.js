'use client';

import { useEffect, useRef, useState } from 'react';

export default function useAmbientVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const wantsPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let disposed = false;
    wantsPlayback.current = !preference.matches;
    container.dataset.motionReady = 'true';

    const sync = () => {
      if (document.hidden || !visible || !wantsPlayback.current) {
        video.pause();
      } else {
        video.play().catch(() => { if (!disposed) setPlaying(false); });
      }
    };
    const onPreferenceChange = () => {
      wantsPlayback.current = !preference.matches;
      sync();
    };
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      }, { threshold: 0.01 });
      observer.observe(container);
    } else {
      visible = true;
      sync();
    }
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', onPreferenceChange);
    return () => {
      disposed = true;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', onPreferenceChange);
      video.pause();
      delete container.dataset.motionReady;
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    wantsPlayback.current = !playing;
    if (playing) video.pause();
    else video.play().catch(() => setPlaying(false));
  };

  return {
    containerRef, videoRef, playing, unavailable, togglePlayback,
    videoEvents: {
      onPlaying: () => setPlaying(true),
      onPause: () => setPlaying(false),
      onError: () => { setUnavailable(true); setPlaying(false); },
    },
  };
}
