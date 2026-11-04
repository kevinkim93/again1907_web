'use client';

import { useEffect, useRef } from 'react';
import './ScrollReveal.css';

export default function ScrollReveal({ children, as: Element = 'div', className = '', delay = 0, ...props }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!element || motionPreference.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-revealed');
        observer.disconnect();
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <Element {...props} ref={elementRef} className={`scroll-reveal ${className}`.trim()} style={{ '--reveal-delay': `${Math.min(240, Math.max(0, delay))}ms` }}>{children}</Element>;
}
