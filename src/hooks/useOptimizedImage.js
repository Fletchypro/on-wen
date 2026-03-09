import { useMemo } from 'react';

// Task 5: Split ImageOptimizer logic
export const useOptimizedImage = (src, width, height) => {
  return useMemo(() => {
    if (!src) return { src: '', srcSet: '' };
    
    // Don't optimize non-CDN or already optimized images heavily to avoid double processing overhead on client
    // unless they are from our known image sources
    const isHostingerCDN = src.includes('horizons-cdn.hostinger.com');
    const isStorage = src.includes('storage.googleapis.com');
    const isUnsplash = src.includes('images.unsplash.com');
    
    if (!isHostingerCDN && !isStorage && !isUnsplash) {
        return { src, srcSet: '' };
    }

    // Basic optimization params - in a real app this would connect to an image service
    // Here we simulate the logic by appending query params or returning the original if strict
    // For Unsplash we can use their API params
    
    if (isUnsplash) {
        const baseUrl = src.split('?')[0];
        const baseParams = '?auto=format&fit=crop';
        
        const generatedSrc = `${baseUrl}${baseParams}&w=${width || 800}&q=80`;
        const srcSet = `
            ${baseUrl}${baseParams}&w=400&q=80 400w,
            ${baseUrl}${baseParams}&w=800&q=80 800w,
            ${baseUrl}${baseParams}&w=1200&q=80 1200w
        `;
        return { src: generatedSrc, srcSet };
    }

    // For other known CDNs, pass through for now or apply specific logic if available
    return { src, srcSet: '' };
  }, [src, width, height]);
};