import React, { useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const LiquidSlider = React.forwardRef(({ className, value, onValueChange, min, max, step, ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const internalValue = value !== undefined ? value[0] : 0;
  const percentage = ((internalValue - min) / (max - min)) * 100;

  const thumbX = useMotionValue(0);
  const springThumbX = useSpring(thumbX, { stiffness: 500, damping: 30 });
  const scale = useTransform(springThumbX, [-10, 0, 10], [1.2, 1, 1.2]);

  const handlePointerMove = (e) => {
    if (isActive) {
      thumbX.set(e.clientX - (e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth / 2));
    }
  };

  const handlePointerLeave = () => {
    thumbX.set(0);
  };
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none select-none items-center group', className)}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => {
        setIsActive(false);
        thumbX.set(0);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
        thumbX.set(0);
      }}
      onPointerMove={handlePointerMove}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-4 w-full grow overflow-hidden rounded-full bg-white/10">
        <SliderPrimitive.Range asChild>
          <motion.div 
            className="absolute h-full bg-gradient-to-r from-sky-500 to-cyan-600"
            style={{ width: `${percentage}%` }}
            animate={{ scaleY: isHovered || isActive ? 1.5 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        </SliderPrimitive.Range>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb asChild>
        <motion.div 
          className="block h-6 w-6 rounded-full border-2 border-sky-200/80 bg-white shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ x: springThumbX, scale }}
          onPointerLeave={handlePointerLeave}
        />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
LiquidSlider.displayName = 'LiquidSlider';

export default LiquidSlider;