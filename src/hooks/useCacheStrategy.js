import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to interact with the Cache API and Service Worker
 */
export const useCacheStrategy = () => {
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    staticSize: 0,
    imageSize: 0,
    dynamicSize: 0
  });

  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setIsServiceWorkerActive(true);
      checkCacheSizes();
    }
  }, []);

  const checkCacheSizes = useCallback(async () => {
    if (!('caches' in window)) return;

    const keys = await caches.keys();
    let staticCount = 0;
    let imageCount = 0;
    let dynamicCount = 0;

    for (const key of keys) {
      const cache = await caches.open(key);
      const requests = await cache.keys();
      
      if (key.includes('static')) staticCount += requests.length;
      if (key.includes('images')) imageCount += requests.length;
      if (key.includes('dynamic')) dynamicCount += requests.length;
    }

    setCacheStats({
      staticSize: staticCount,
      imageSize: imageCount,
      dynamicSize: dynamicCount
    });
  }, []);

  const clearCacheType = useCallback(async (type) => {
    if (!('caches' in window)) return;
    
    const keys = await caches.keys();
    const targetKey = keys.find(k => k.includes(type));
    
    if (targetKey) {
      await caches.delete(targetKey);
      await checkCacheSizes();
      console.log(`Cache cleared: ${targetKey}`);
      return true;
    }
    return false;
  }, [checkCacheSizes]);

  const clearAllCaches = useCallback(async () => {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await checkCacheSizes();
    return true;
  }, [checkCacheSizes]);

  return {
    isServiceWorkerActive,
    cacheStats,
    refreshStats: checkCacheSizes,
    clearCacheType,
    clearAllCaches
  };
};