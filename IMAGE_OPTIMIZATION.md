# Image Optimization Guide

This project implements a comprehensive image optimization strategy to improve Core Web Vitals (LCP, CLS) and overall performance.

## 1. Using the ImageOptimizer Component

The primary way to display images is through the `ImageOptimizer` component. It handles:
- Lazy loading (automatic)
- Width/Height attributes (to prevent CLS)
- Responsive `sizes` attribute
- Fade-in on load

### Usage Example