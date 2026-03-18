import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useOptimizedImage } from '@/hooks/useOptimizedImage';
import { Calendar } from 'lucide-react';

// Separate heavy component logic
const ImageLoader = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority, 
  sizes, 
  style, 
  objectFit,
  isLoaded,
  onLoad,
  onError,
  ...props 
}) => {
  const { src: optimizedSrc, srcSet } = useOptimizedImage(src, width, height);
  
  return (
    <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || "Image"}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchpriority={priority ? "high" : "auto"}
        onLoad={onLoad}
        onError={onError}
        className={cn(
            "transition-opacity duration-500 w-full h-full",
            isLoaded ? "opacity-100" : "opacity-0",
            objectFit === 'cover' ? "object-cover" : "object-contain"
        )}
        style={{ 
            aspectRatio: width && height ? `${width}/${height}` : 'auto'
        }}
        {...props}
    />
  );
};

const ImageOptimizer = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  style,
  objectFit = 'cover',
  /** When 'event', show gradient + icon instead of gray for missing/error (e.g. external event cards). */
  fallbackVariant,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const containerRef = useRef(null);

  // Task 8: Progressive Enhancement with Intersection Observer
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Preload when image is near viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); 
  };

  if (!src || hasError) {
    const isEventFallback = fallbackVariant === 'event';
    return (
      <div 
        ref={containerRef}
        className={cn(
          isEventFallback
            ? 'flex items-center justify-center bg-gradient-to-br from-violet-600/80 via-purple-700/80 to-indigo-800/80 rounded-md'
            : 'bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md',
          className
        )}
        style={{ 
          width: width ? `${width}px` : '100%', 
          height: height ? `${height}px` : '100%',
          aspectRatio: width && height ? `${width}/${height}` : 'auto',
          ...style 
        }}
        role="presentation"
        aria-hidden="true"
      >
        {isEventFallback && (
          <Calendar className="w-12 h-12 text-white/40" strokeWidth={1.5} aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div 
        ref={containerRef}
        className={cn("relative overflow-hidden", className)} 
        style={{ 
            width: width ? 'auto' : '100%', 
            height: height ? 'auto' : '100%',
            aspectRatio: width && height ? `${width}/${height}` : 'auto', 
            contain: 'paint',
            ...style 
        }}
    >
        {/* Placeholder blur effect while loading */}
        {!isLoaded && (
            <div 
                className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
                style={{ width: '100%', height: '100%' }} 
            />
        )}
        
        {isVisible && (
           <ImageLoader 
             src={src}
             alt={alt}
             width={width}
             height={height}
             className={className}
             priority={priority}
             sizes={sizes}
             style={style}
             objectFit={objectFit}
             isLoaded={isLoaded}
             onLoad={handleLoad}
             onError={handleError}
             {...props}
           />
        )}
    </div>
  );
};

export default ImageOptimizer;