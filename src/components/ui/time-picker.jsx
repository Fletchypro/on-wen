import React from 'react';
import { cn } from '@/lib/utils';

export const TimePicker = React.forwardRef(({ className, value, onChange, ...props }, ref) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="p-3 bg-black/30 rounded-xl">
      <input
        type="time"
        value={value || ''}
        onChange={handleChange}
        ref={ref}
        className={cn(
          "w-full bg-transparent text-white focus:outline-none appearance-none",
          "text-2xl font-mono tracking-wider",
          "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          className
        )}
        {...props}
      />
    </div>
  );
});

TimePicker.displayName = "TimePicker";