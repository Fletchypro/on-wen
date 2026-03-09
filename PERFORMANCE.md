# Wen Performance Optimization Guide

This document outlines the performance optimizations implemented to improve Core Web Vitals (FCP, LCP, CLS) and user experience for the Wen application.

## 1. Resource Prioritization

### Preloading Critical Assets
In `index.html`, we've added `<link rel="preload">` tags for critical assets:
- **CDN Domain**: Preconnected to `horizons-cdn.hostinger.com` to reduce DNS lookup and SSL handshake time for images.
- **Logo**: Preloaded the main logo image to ensure it's available immediately for the First Contentful Paint (FCP).

### Prefetching Secondary Assets
We use `<link rel="prefetch">` (or implicitly let the browser handle it via standard tags) for assets that might be needed soon but aren't critical for the initial render.

## 2. CSS Optimization

### Critical CSS Inlining
We've inlined the absolute minimum CSS required to render the initial loading state and background color directly into the `<head>` of `index.html`. This prevents the "flash of unstyled content" and reduces render-blocking requests.

### Async CSS Loading (Eliminating Render Blocking)
To ensure the main stylesheet does not block the First Contentful Paint (FCP), we utilize a `preload` strategy in `index.html`: