'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type DisasterSectionProps = {
  title: { line1: string; line2: string };
  description: string;
  image?: ImagePlaceholder;
  theme?: string;
};

const PlayIcon = () => (
  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 12.3397C23.8333 13.1132 23.8333 14.8868 22.5 15.6603L2.25 27.5263C0.916666 28.2998 -4.47424e-07 27.413 0 25.866L1.74846e-06 2.13401C1.99688e-06 0.587009 2.16667 -0.299812 3.5 0.473689L22.5 12.3397Z" fill="white"/>
  </svg>
);


export default function DisasterSection({ title, description, image, theme }: DisasterSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  const themeClasses: Record<string, { bg: string, accent: string }> = {
    earthquake: { bg: 'from-purple-500/5 to-blue-500/5', accent: 'bg-primary' },
    flood: { bg: 'from-blue-500/5 to-green-500/5', accent: 'bg-blue-500' },
    volcano: { bg: 'from-red-500/5 to-orange-500/5', accent: 'bg-red-500' },
  }

  return (
    <section ref={sectionRef} className={cn('relative py-24 sm:py-32 overflow-hidden', theme && themeClasses[theme]?.bg)}>
      <div className="container">
        <div className="text-center md:text-left md:ml-[5%] lg:ml-[10%]">
          <h2 className="font-headline text-5xl sm:text-6xl md:text-7xl font-medium tracking-tighter leading-none">
            <span className={cn('block transition-all duration-700 ease-out', inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8')}>{title.line1}</span>
            <span className={cn('block transition-all duration-700 ease-out delay-100', inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8', `text-gradient-primary`)}>{title.line2}</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className={cn("transition-all duration-1000 ease-out delay-200", inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
             {image && (
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 cursor-pointer">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={980}
                  height={560}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <div className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg", theme ? themeClasses[theme]?.accent : 'bg-primary')}>
                    <PlayIcon />
                  </div>
                  <p className="mt-4 font-headline text-xl font-bold">Educational Video</p>
                </div>
              </div>
            )}
          </div>
          <div className={cn("transition-all duration-1000 ease-out delay-300", inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
            <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
