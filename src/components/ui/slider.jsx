import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    {/* Track: uses your global glass classes */}
    <div className="relative w-full">
      <div className="relative h-3 rounded-full overflow-hidden glass-strong">
        <div className="specular" />
        <div className="sweep" />

        <SliderPrimitive.Track className="absolute inset-0">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-sky-400/70 via-cyan-400/75 to-teal-400/70 shadow-[0_0_18px_rgba(56,189,248,0.35)]" />
        </SliderPrimitive.Track>

        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/15" />
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]" />
      </div>
    </div>

    {/* Thumb: glossy puck */}
    <SliderPrimitive.Thumb
      className={cn(
        "relative block h-6 w-6 -ml-3 rounded-full",
        "shadow-[0_8px_22px_rgba(0,0,0,0.45)] border border-white/20",
        "bg-[radial-gradient(120%_120%_at_20%_-10%,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.22)_30%,rgba(0,0,0,0.25)_100%)]",
        "backdrop-blur-md transition-transform will-change-transform",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };