'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#home', text: 'Home' },
  { href: '#about', text: 'About Us' },
  { href: '#helpline', text: 'Emergency Helpline' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-6 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-md'
          : 'bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between">
        <Link href="/" className="font-headline text-2xl font-extrabold text-gradient-primary">
          EduPrepAI
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.text}
              href={link.href}
              className="font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.text}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
