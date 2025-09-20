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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="playGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1f2937" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    <path d="M8 5V19L19 12L8 5Z" fill="url(#playGradient)" stroke="url(#playGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pauseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1f2937" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    <rect x="6" y="4" width="4" height="16" rx="1" fill="url(#pauseGradient)"/>
    <rect x="14" y="4" width="4" height="16" rx="1" fill="url(#pauseGradient)"/>
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fullscreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1f2937" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    {/* Four outward-pointing arrows in corners */}
    <path d="M3 3H8V5H5V8H3V3Z" fill="url(#fullscreenGradient)"/>
    <path d="M21 3H16V5H19V8H21V3Z" fill="url(#fullscreenGradient)"/>
    <path d="M3 21H8V19H5V16H3V21Z" fill="url(#fullscreenGradient)"/>
    <path d="M21 21H16V19H19V16H21V21Z" fill="url(#fullscreenGradient)"/>
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="exitFullscreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1f2937" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    {/* Four inward-pointing arrows for exit fullscreen */}
    <path d="M8 3V8H3V3H8Z" fill="url(#exitFullscreenGradient)"/>
    <path d="M16 3V8H21V3H16Z" fill="url(#exitFullscreenGradient)"/>
    <path d="M8 21V16H3V21H8Z" fill="url(#exitFullscreenGradient)"/>
    <path d="M16 21V16H21V21H16Z" fill="url(#exitFullscreenGradient)"/>
  </svg>
);


export default function DisasterSection({ title, description, image, theme }: DisasterSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [originalTransform, setOriginalTransform] = useState({ scale: 1, translateX: 0, translateY: 0 });
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [snakeProgress, setSnakeProgress] = useState(0);
  const snakePathRef = useRef<SVGPathElement>(null);

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
  
  // Full-screen video transition: glow → full-screen → push content down
  useEffect(() => {
    const handleScroll = () => {
      const container = videoContainerRef.current;
      const section = sectionRef.current;
      const videoEl = videoRef.current;
      if (!container || !section) return;

      // Don't apply scroll-based transforms when in fullscreen mode
      if (isFullscreen) return;

      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);

      // Calculate scroll progress relative to section
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const sectionBottom = sectionTop + sectionRect.height;
      const currentScroll = window.scrollY;
      
      // Transition triggers when section is in viewport
      const triggerPoint = sectionTop - vh * 0.1; // Start when section enters viewport
      const endPoint = sectionBottom + vh * 0.3; // End after section passes
      const transitionRange = endPoint - triggerPoint;
      
      const progress = Math.max(0, Math.min(1, (currentScroll - triggerPoint) / transitionRange));
      setTransitionProgress(progress);

      // Phase 1: Glow effect (0-0.2)
      // Phase 2: Move down and grow (0.2-0.5) 
      // Phase 3: Stay in position and push content down (0.5-0.8)
      // Phase 4: Complete transition (0.8-1.0)
      
      let glowIntensity = 0;
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      let zIndex = 10;
      let backgroundColor = 'transparent';

      if (progress <= 0.2) {
        // Phase 1: Quick scale effect
        const phaseProgress = progress / 0.2;
        glowIntensity = 0; // No glow effect
        scale = 1 + phaseProgress * 0.2;
        backgroundColor = 'transparent'; // No background color
        setIsTransitioning(true);
      } else if (progress <= 0.5) {
        // Phase 2: Move to center below header and grow to fullscreen
        const phaseProgress = (progress - 0.2) / 0.3;
        glowIntensity = 0; // No glow effect
        
        // Calculate fullscreen scale to fill viewport below header
        const containerRect = container.getBoundingClientRect();
        const headerHeight = 80; // Approximate header height
        const availableHeight = vh - headerHeight;
        const availableWidth = vw;
        
        // Scale to fill the available space
        const scaleX = availableWidth / containerRect.width;
        const scaleY = availableHeight / containerRect.height;
        const fullscreenScale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave some margin
        
        // Interpolate from 1.2x to fullscreen scale
        scale = 1.2 + phaseProgress * (fullscreenScale - 1.2);
        
        // Move to center of viewport below header
        const centerX = (vw - containerRect.width * scale) / 2;
        const centerY = (availableHeight - containerRect.height * scale) / 2 + headerHeight;
        
        translateX = centerX - containerRect.left;
        translateY = centerY - containerRect.top;
        zIndex = 25; // Lower z-index to not overlap text
        backgroundColor = 'transparent'; // No background color
        
        // Video playback is now only controlled by user interaction
        // Removed auto-play functionality during scroll
        
        // Push text content down to avoid video overlap
        const textElement = section.querySelector('.relative.z-30');
        if (textElement) {
          (textElement as HTMLElement).style.marginTop = `${phaseProgress * 20}vh`;
        }
      } else if (progress <= 0.8) {
        // Phase 3: Maintain fullscreen position while video plays
        const phaseProgress = (progress - 0.5) / 0.3;
        glowIntensity = 0; // No glow effect
        
        // Maintain fullscreen scale
        const containerRect = container.getBoundingClientRect();
        const headerHeight = 80;
        const availableHeight = vh - headerHeight;
        const availableWidth = vw;
        
        const scaleX = availableWidth / containerRect.width;
        const scaleY = availableHeight / containerRect.height;
        scale = Math.min(scaleX, scaleY) * 0.95;
        
        const centerX = (vw - containerRect.width * scale) / 2;
        const centerY = (availableHeight - containerRect.height * scale) / 2 + headerHeight;
        
        translateX = centerX - containerRect.left;
        translateY = centerY - containerRect.top;
        zIndex = 25; // Lower z-index to not overlap text
        backgroundColor = 'transparent'; // No background color
        
        // Add spacing to push content down and avoid overlap
        const extraSpacing = phaseProgress * 40; // Add up to 40vh extra spacing
        section.style.marginBottom = `${extraSpacing}vh`;
        
        // Push text content down to avoid video overlap
        const textElement = section.querySelector('.relative.z-30');
        if (textElement) {
          (textElement as HTMLElement).style.marginTop = `${phaseProgress * 20}vh`;
        }
      } else {
        // Phase 4: Return to original position and restore normal size
        const phaseProgress = (progress - 0.8) / 0.2;
        glowIntensity = 0; // No glow effect
        
        // Calculate fullscreen scale for interpolation
        const containerRect = container.getBoundingClientRect();
        const headerHeight = 80;
        const availableHeight = vh - headerHeight;
        const availableWidth = vw;
        
        const scaleX = availableWidth / containerRect.width;
        const scaleY = availableHeight / containerRect.height;
        const fullscreenScale = Math.min(scaleX, scaleY) * 0.95;
        
        // Interpolate back to 2x scale
        scale = fullscreenScale - (phaseProgress * (fullscreenScale - 2.0));
        
        // Calculate center position for interpolation
        const centerX = (vw - containerRect.width * scale) / 2;
        const centerY = (availableHeight - containerRect.height * scale) / 2 + headerHeight;
        
        // Interpolate back to original position
        const originalX = 0;
        const originalY = 0;
        
        translateX = centerX - containerRect.left - (phaseProgress * (centerX - containerRect.left - originalX));
        translateY = centerY - containerRect.top - (phaseProgress * (centerY - containerRect.top - originalY));
        zIndex = 25; // Lower z-index to not overlap text
        backgroundColor = 'transparent'; // No background color
        
        // Add footer spacing to prevent video from overshadowing the ending
        section.style.marginBottom = `30vh`;
        
        // Reset text content position
        const textElement = section.querySelector('.relative.z-30');
        if (textElement) {
          (textElement as HTMLElement).style.marginTop = '0';
        }
      }

      // Use calculated translateX for proper centering
      const finalTranslateX = translateX;
      
      // Set transform origin to center for proper fullscreen scaling
      container.style.transformOrigin = 'center center';
      
      // Apply transformations keeping original position
      container.style.transform = `translate(${finalTranslateX}px, ${translateY}px) scale(${scale})`;
      container.style.zIndex = zIndex.toString();
      container.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.1)'; // Simple black shadow instead of purple glow
      
      // Apply faster transitions to complete before next section
      if (progress <= 0.05) {
        // Immediate response for initial glow effect
        container.style.transition = 'none';
      } else if (progress <= 0.2) {
        // Very quick transition during glow phase
        container.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.15s ease-out';
      } else if (progress <= 0.5) {
        // Fast transition during scaling phase
        container.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease-out, z-index 0.15s ease-out';
      } else {
        // Quick final positioning
        container.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.15s ease-out';
      }
      
      // Add purple background to section during transition
      if (section) {
        section.style.backgroundColor = backgroundColor;
      }

      // Debug logging
      if (progress > 0) {
        console.log('Transition progress:', progress.toFixed(2), 'Scale:', scale.toFixed(2), 'TranslateY:', translateY.toFixed(0), 'TranslateX:', finalTranslateX.toFixed(0), 'Glow:', glowIntensity.toFixed(2));
      }
    };

    const handleResize = () => handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    // initialize
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, isTransitioning, transitionProgress, isFullscreen]);

  // Function to hide controls after delay
  const hideControlsAfterDelay = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      console.log('Hiding controls - isMouseMoving:', isMouseMoving, 'isPlaying:', isPlaying);
      if (!isMouseMoving && isPlaying) {
        setShowControls(false);
      }
    }, 2000);
  };

  // Function to show controls immediately
  const showControlsImmediately = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setShowControls(true);
  };

  // Handle mouse movement detection
  const handleMouseMove = () => {
    if (isPlaying) {
      setIsMouseMoving(true);
      showControlsImmediately();
      
      // Clear existing timeout
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      
      // Set new timeout to detect when mouse stops moving
      mouseMoveTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
        hideControlsAfterDelay();
      }, 1000); // Wait 1 second after mouse stops moving
    }
  };

  // Play/Pause functionality
  const handlePlayPause = async () => {
    if (videoRef.current && !isVideoLoading) {
      setIsVideoLoading(true);
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
          showControlsImmediately(); // Show controls when paused
        } else {
          // Wait for any pending operations to complete
          await videoRef.current.play();
          setIsPlaying(true);
          showControlsImmediately(); // Show controls when starting to play
          hideControlsAfterDelay(); // Hide after 2 seconds
        }
      } catch (error) {
        console.log('Video play/pause error:', error);
        // Reset state if there's an error
        setIsPlaying(false);
        showControlsImmediately();
      } finally {
        setIsVideoLoading(false);
      }
    }
  };

  // Fullscreen functionality
  const handleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!isFullscreen) {
        // Store current transform before entering fullscreen
        const currentTransform = videoContainerRef.current.style.transform;
        const transformMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)\s*scale\(([^)]+)\)/);
        if (transformMatch) {
          setOriginalTransform({
            translateX: parseFloat(transformMatch[1]) || 0,
            translateY: parseFloat(transformMatch[2]) || 0,
            scale: parseFloat(transformMatch[3]) || 1
          });
        }
        
        if (videoContainerRef.current.requestFullscreen) {
          videoContainerRef.current.requestFullscreen();
        } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
          (videoContainerRef.current as any).webkitRequestFullscreen();
        } else if ((videoContainerRef.current as any).msRequestFullscreen) {
          (videoContainerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const wasFullscreen = isFullscreen;
      const nowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(nowFullscreen);

      // When exiting fullscreen, restore original position
      if (wasFullscreen && !nowFullscreen && videoContainerRef.current) {
        // Restore the original transform
        videoContainerRef.current.style.transform = `translate(${originalTransform.translateX}px, ${originalTransform.translateY}px) scale(${originalTransform.scale})`;
        videoContainerRef.current.style.transition = 'transform 0.3s ease-out';
        
        // Remove transition after animation completes
        setTimeout(() => {
          if (videoContainerRef.current) {
            videoContainerRef.current.style.transition = '';
          }
        }, 300);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, originalTransform]);

  // Global mouse movement detection
  useEffect(() => {
    const handleGlobalMouseMove = () => {
      if (isPlaying) {
        console.log('Mouse moved - showing controls');
        setIsMouseMoving(true);
        showControlsImmediately();
        
        // Clear existing timeout
        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current);
        }
        
        // Set new timeout to detect when mouse stops moving
        mouseMoveTimeoutRef.current = setTimeout(() => {
          console.log('Mouse stopped moving - will hide controls in 2 seconds');
          setIsMouseMoving(false);
          hideControlsAfterDelay();
        }, 1000); // Wait 1 second after mouse stops moving
      }
    };

    // Add global mouse movement listener
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Snake path animation effect - STARTS FROM DISASTER SECTIONS
  useEffect(() => {
    const path = snakePathRef.current;
    if (!path) return;

    // Set initial path length
    const totalLength = path.getTotalLength();
    path.style.setProperty('--path-length', totalLength.toString());
    path.style.strokeDasharray = totalLength.toString();
    path.style.strokeDashoffset = totalLength.toString();

    let animationId: number;

    const updateSnake = () => {
      if (!sectionRef.current || !snakePathRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate when section enters and exits viewport
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      
      // Start animation as soon as any part of the disaster section is visible
      if (sectionBottom > 0 && sectionTop < windowHeight) {
        // Calculate progress based on how much of the section is visible
        // Start from 0 when section first appears, end at 1 when section is fully scrolled past
        const visibleHeight = Math.min(sectionBottom, windowHeight) - Math.max(sectionTop, 0);
        const totalSectionHeight = rect.height;
        
        // Alternative calculation: based on scroll position relative to section
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight + totalSectionHeight)));
        
        setSnakeProgress(scrollProgress);
        
        // Update snake path INSTANTLY - no transition
        const pathLength = totalLength;
        const drawLength = pathLength * scrollProgress;
        const offset = pathLength - drawLength;
        
        snakePathRef.current.style.strokeDashoffset = offset.toString();
        
        // Debug logging
        console.log('Snake Progress:', {
          progress: Math.round(scrollProgress * 100) + '%',
          sectionTop: Math.round(sectionTop),
          visible: sectionBottom > 0 && sectionTop < windowHeight
        });
      }
    };

    const handleSnakeScroll = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      animationId = requestAnimationFrame(updateSnake);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleSnakeScroll, { passive: true });
    
    // Initial call
    setTimeout(() => {
      updateSnake();
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleSnakeScroll);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  const themeClasses: Record<string, { bg: string, accent: string, line: string }> = {
    earthquake: { bg: 'from-purple-500/5 to-blue-500/5', accent: 'bg-primary', line: 'text-primary' },
    flood: { bg: 'from-blue-500/5 to-green-500/5', accent: 'bg-blue-500', line: 'text-blue-500' },
    volcano: { bg: 'from-red-500/5 to-orange-500/5', accent: 'bg-red-500', line: 'text-red-500' },
  }

  return (
    <section ref={sectionRef} className={cn('relative py-24 sm:py-32 pb-40 overflow-visible min-h-screen', theme && themeClasses[theme]?.bg)}>
      {/* Snake Path Animation */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <path
          ref={snakePathRef}
          id="snake-path"
          d="M 0,0 C 150,100, 300,200, 450,400 C 600,600, 750,750, 900,900 C 950,950, 1000,1000, 1000,1000"
          fill="none"
          stroke={theme === 'earthquake' ? '#8b5cf6' : theme === 'flood' ? '#3b82f6' : theme === 'volcano' ? '#ef4444' : '#9caec6'}
          strokeWidth="35"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 'var(--path-length)',
            strokeDashoffset: 'var(--path-length)',
            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.3))'
          }}
        />
      </svg>
      
      <div className="container relative z-10">
        <div className="text-left">
          <h2 className="font-headline text-5xl sm:text-6xl md:text-7xl font-medium tracking-tighter leading-none">
            <span className={cn('block transition-all duration-700 ease-out', inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8')}>{title.line1}</span>
            <span className={cn('block transition-all duration-700 ease-out delay-100', inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8', `text-gradient-primary`)}>{title.line2}</span>
          </h2>
        </div>

        <div className="mt-32 md:mt-36 grid md:grid-cols-2 gap-16 items-start pb-32 relative z-10">
            <div className={cn("relative z-30 transition-all duration-1000 ease-out delay-300 md:col-start-2 md:ml-[25%]", inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
                <div className="h-[125%] w-[85%] flex items-center">
                    <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
                    {description}
                    </p>
                </div>
            </div>
            <div className={cn("relative transition-all duration-1000 ease-out delay-200 md:row-start-1 md:col-start-1 mt-20 md:mt-12", inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
                {image && (
                  <div
                    ref={videoContainerRef}
                    className="relative z-20 group rounded-2xl overflow-hidden shadow-2xl shadow-black/10 cursor-pointer mx-auto"
                    style={{
                      willChange: 'transform, box-shadow, z-index',
                      width: '100%',
                      maxWidth: '700px',
                      aspectRatio: '16/9',
                    }}
                  >
                    <video 
                      ref={videoRef} 
                      muted 
                      playsInline 
                      controls={false}
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onPlay={() => {
                        console.log('Video started playing');
                        setIsPlaying(true);
                        showControlsImmediately();
                        hideControlsAfterDelay();
                      }}
                      onPause={() => {
                        console.log('Video paused');
                        setIsPlaying(false);
                        showControlsImmediately();
                      }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        setIsPlaying(false);
                      }}
                      onLoadStart={() => {
                        console.log('Video loading started');
                        setIsVideoLoading(true);
                      }}
                      onCanPlay={() => {
                        console.log('Video can play');
                        setIsVideoLoading(false);
                      }}
                      onWaiting={() => {
                        console.log('Video waiting for data');
                        setIsVideoLoading(true);
                      }}
                      onStalled={() => {
                        console.log('Video stalled');
                        setIsVideoLoading(true);
                      }}
                    >
                      {/* Your video file */}
                      <source src="/video_test123.mp4" type="video/mp4" />
                      {/* Fallback message */}
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Center play/pause button - controlled visibility */}
                    <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", showControls ? 'opacity-100' : 'opacity-0')}>
                      <button
                        onClick={handlePlayPause}
                        className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ease-out cursor-pointer bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-110 hover:bg-white active:scale-95"
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                        style={{
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        {/* Animated ring effect */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse group-hover:border-white/50 group-hover:scale-110 transition-all duration-500"></div>
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Icon with enhanced styling */}
                        <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-110">
                          {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </div>
                        
                        {/* Ripple effect on click */}
                        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
                      </button>
                    </div>

                    {/* Fullscreen button - bottom right corner */}
                    <div className={cn("absolute bottom-4 right-4 transition-opacity duration-300", showControls ? 'opacity-100' : 'opacity-0')}>
                      <button
                        onClick={handleFullscreen}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out cursor-pointer bg-white/95 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:scale-110 hover:bg-white active:scale-95"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        style={{
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        {/* Subtle ring effect */}
                        <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-white/40 group-hover:scale-110 transition-all duration-500"></div>
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/15 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Icon with enhanced styling */}
                        <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                      </div>
                        
                        {/* Ripple effect on click */}
                        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
                      </button>
                    </div>

                  </div>
                )}
            </div>
        </div>
      </div>
    </section>
  );
}
