import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Eye, EyeOff } from 'lucide-react';

const FloatingInput = React.forwardRef(({ className, type, label, id, value, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div 
      className="relative"
      onHoverStart={() => setIsFocused(true)}
      onHoverEnd={() => { if(document.activeElement.id !== id) setIsFocused(false) }}
    >
      <motion.label
        htmlFor={id}
        className="absolute left-4 text-neutral-400 pointer-events-none"
        animate={{
          y: (isFocused || value) ? -10 : 20,
          scale: (isFocused || value) ? 0.85 : 1,
          color: (isFocused) ? '#a78bfa' : '#a3a3a3'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {label}
      </motion.label>
      <input
        id={id}
        ref={ref}
        type={inputType}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "h-14 w-full rounded-2xl border-2 border-transparent bg-neutral-900/50 px-4 pt-4 pb-2 text-base text-white ring-offset-black transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </motion.div>
  );
});
FloatingInput.displayName = "FloatingInput";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-white/10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input, FloatingInput };