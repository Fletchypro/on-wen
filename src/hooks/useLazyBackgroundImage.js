import { useState, useEffect, useRef } from 'react';

/**
 * Hook to lazily load background images using IntersectionObserver
 * @param {string} bgUrl - The URL of the background image
 * @returns {object} - Ref to attach to element and boolean indicating if loaded
 */
export const useLazyBackgroundImage = (bgUrl) => {
  const elementRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);

  useEffect(() => {
    if (!bgUrl) return;

    // Reset if url changes
    setIsLoaded(false);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload the image
            const img = new Image();
            img.src = bgUrl;
            img.onload = () => {
              setCurrentUrl(bgUrl);
              setIsLoaded(true);
            };
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Start loading slightly before viewport
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
        if (observer) observer.disconnect();
    }
  }, [bgUrl]);

  return { elementRef, isLoaded, currentUrl };
};