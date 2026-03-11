import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';
import { motion } from 'framer-motion';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-xl text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px]',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
				secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
        glow: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_theme(colors.purple.600)] hover:shadow-[0_0_30px_theme(colors.purple.500)]'
			},
			size: {
				default: 'h-12 px-6 py-2',
				sm: 'h-10 min-h-[44px] rounded-xl px-4',
				lg: 'h-14 rounded-2xl px-8 text-lg',
				icon: 'h-12 w-12 min-h-[44px] min-w-[44px] rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : motion.button;
	return (
		<Comp
      whileTap={{ scale: 0.95 }}
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };