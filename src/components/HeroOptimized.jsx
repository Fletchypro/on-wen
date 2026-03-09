import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Optimized Hero Component
 * - Uses plain HTML/CSS for immediate rendering (LCP optimization)
 * - Memoized to prevent re-renders
 * - No heavy animation libraries on critical text
 */
const HeroOptimized = memo(() => {
  return (
    <section className="hero-wrapper container mx-auto px-4">
      {/* 
        Using critical CSS classes defined in src/critical.css 
        to ensure styling is applied before Tailwind loads/parses 
      */}
      <h1 className="hero-heading">
        Plan Smarter. <br /> Live Visually.
      </h1>
      
      <p className="hero-subtext">
        Wen is the image-first calendar app designed for visual planners. Organize events, plan group trips, and see your
        life unfold in a vibrant timeline.
      </p>

      <div className="hero-cta">
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg group hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-transform will-change-transform"
        >
          <Link to="/signup">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
});

HeroOptimized.displayName = 'HeroOptimized';

export default HeroOptimized;