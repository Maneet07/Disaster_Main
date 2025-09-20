'use client';

import AnimatedCounter from '@/components/animated-counter';

const stats = [
  { target: 500, label: 'Schools Protected' },
  { target: 50, label: 'Disaster Types' },
  { target: 10000, label: 'Students Trained' },
];

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center py-24 sm:py-32">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute w-80 h-80 top-[10%] left-[10%] bg-primary/10 rounded-full animate-float" />
        <div 
          className="absolute w-52 h-52 top-[60%] right-[15%] bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: '-7s' }}
        />
        <div 
          className="absolute w-40 h-40 top-[30%] right-[30%] bg-blue-500/10 rounded-full animate-float"
          style={{ animationDelay: '-14s' }}
        />
      </div>
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter">
              <span className="block">Empowering Schools with</span>
              <span className="block text-gradient-primary">Disaster Preparedness</span>
            </h1>
          </div>
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
            <p className="mt-6 text-lg md:text-xl text-foreground/70 max-w-2xl">
              Interactive modules, real-time alerts, and virtual drills to keep students safe.
            </p>
          </div>
          <div className="mt-16 flex flex-col sm:flex-row gap-8 sm:gap-12 animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center sm:text-left">
                <div className="font-headline text-5xl font-bold text-primary">
                  <AnimatedCounter target={stat.target} />
                </div>
                <div className="mt-1 text-sm font-medium text-foreground/60 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
