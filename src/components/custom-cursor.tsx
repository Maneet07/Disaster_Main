'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        followerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseEnter = () => {
        cursorRef.current?.classList.add('grow');
    };
    const handleMouseLeave = () => {
        cursorRef.current?.classList.remove('grow');
    };

    document.addEventListener('mousemove', moveCursor);

    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select'
    );
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 border-2 border-primary rounded-full pointer-events-none z-[9999] transition-transform duration-300 ease-out hidden md:block"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full pointer-events-none z-[9999] transition-transform duration-150 ease-out hidden md:block"
      />
      <style jsx>{`
        .grow {
          transform: scale(1.5) !important;
          border-color: hsl(var(--accent));
        }
      `}</style>
    </>
  );
}
