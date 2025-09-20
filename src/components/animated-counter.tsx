'use client';

import { useState, useEffect, useRef } from 'react';

type AnimatedCounterProps = {
  target: number;
  duration?: number;
  className?: string;
};

export default function AnimatedCounter({ target, duration = 2000, className }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    let start = 0;
    const end = target;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    // Use Intersection Observer to start animation on view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let current = start;
        const timer = setInterval(() => {
          current += increment * Math.ceil(range / (duration / 16));
          if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
          }
          setCount(current);
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(element);
    
    return () => observer.disconnect();

  }, [target, duration]);

  return <span ref={ref} className={className}>{count.toLocaleString()}</span>;
}
