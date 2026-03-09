import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useOptimizedImage } from '@/hooks/useOptimizedImage';

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
        fetchPriority={priority ? "high" : "auto"}
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
    return (
      <div 
        ref={containerRef}
        className={cn("bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md", className)}
        style={{ 
          width: width ? `${width}px` : '100%', 
          height: height ? `${height}px` : '100%',
          aspectRatio: width && height ? `${width}/${height}` : 'auto',
          ...style 
        }}
        role="presentation"
        aria-hidden="true"
      />
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