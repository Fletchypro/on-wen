// Configuration for image optimization and processing
// Used to define sizes, quality settings, and format fallback strategies

export const ImageConfig = {
    // Breakpoints for responsive images
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        largeDesktop: 1920,
    },

    // Quality settings (0-100)
    quality: {
        photo: 85,      // High detail for photos
        graphic: 95,    // Sharp edges for graphics/screenshots
        thumbnail: 70,  // Lower quality for small thumbnails to save bandwidth
    },

    // Format priority list for browsers that support them
    formats: ['webp', 'jpeg'],

    // CDN specific settings (if applicable in future)
    cdn: {
        provider: 'supabase', // or 'cloudinary', 'imgix', etc.
        baseUrl: '',          // Base URL for the image service
    },

    // Standard dimensions for common UI elements
    dimensions: {
        avatar: {
            small: { width: 48, height: 48 },
            medium: { width: 80, height: 80 },
            large: { width: 128, height: 128 },
        },
        eventCard: {
            mobile: { width: 350, height: 200 },
            desktop: { width: 400, height: 300 },
        },
        hero: {
            mobile: { width: 480, height: 300 },
            desktop: { width: 1920, height: 1080 },
        },
    },
};

export default ImageConfig;