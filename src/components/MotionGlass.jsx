import React from 'react';
import { motion } from 'framer-motion';
import { useLazyBackgroundImage } from '@/hooks/useLazyBackgroundImage';
import { cn } from '@/lib/utils';
import '@/styles/imageOptimization.css';

export function MotionGlass({ children, className = "", bgImage = null, priority = false, width, height, ...props }) {
    // Optimization: Skip hook if priority is false (default) to defer non-critical background loads
    // For hero sections or critical LCP elements, pass priority={true} IF the image is critical (rare for glass effect)
    const shouldLoad = priority; 
    
    // We only use the hook if we actually want to load the background image
    const { elementRef, isLoaded, currentUrl } = useLazyBackgroundImage(shouldLoad ? bgImage : null);

    const bgStyle = bgImage && isLoaded ? {
        backgroundImage: `url(${currentUrl})`,
        backgroundSize: 'cover', // Task 3: Ensure cover sizing
        backgroundPosition: 'center',
    } : {};

    // Task 3: Reserve space and fix dimensions
    const dimensionStyle = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        aspectRatio: width && height && typeof width === 'number' && typeof height === 'number' 
            ? `${width}/${height}` 
            : undefined
    };

    return (
        <motion.div
            ref={elementRef}
            className={cn("glass bg-optimized", isLoaded ? "" : "bg-loading-solid", className)}
            style={{ 
                willChange: 'transform, opacity', 
                contain: 'layout paint', // Task 3: Containment
                ...bgStyle,
                ...dimensionStyle 
            }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}