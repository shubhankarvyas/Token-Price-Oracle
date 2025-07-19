import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all duration-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group',
  {
    variants: {
      variant: {
        primary: [
          // Base gradient background
          'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600',
          'text-white',
          // Enhanced shadow system
          'shadow-lg shadow-blue-500/25',
          // Hover effects
          'hover:shadow-xl hover:shadow-blue-500/40',
          'hover:scale-105',
          // Active state
          'active:scale-100',
          // Focus state
          'focus-visible:ring-blue-400/50',
          // Disabled state
          'disabled:hover:scale-100 disabled:hover:shadow-blue-500/25',
          // Performance optimization
          'will-change-transform',
        ],
        secondary: [
          'bg-white/10 backdrop-blur-sm border border-white/20',
          'text-white',
          'shadow-lg shadow-black/10',
          'hover:bg-white/15 hover:border-white/30',
          'hover:scale-105',
          'active:scale-100',
          'focus-visible:ring-white/30',
          'disabled:hover:scale-100',
        ],
        ghost: [
          'text-white/70',
          'hover:text-white hover:bg-white/5',
          'hover:scale-105',
          'active:scale-100',
          'focus-visible:ring-white/20',
          'disabled:hover:scale-100',
        ],
        destructive: [
          'bg-gradient-to-r from-red-500 to-red-600',
          'text-white',
          'shadow-lg shadow-red-500/25',
          'hover:shadow-xl hover:shadow-red-500/40',
          'hover:scale-105',
          'active:scale-100',
          'focus-visible:ring-red-400/50',
          'disabled:hover:scale-100',
        ],
      },
      size: {
        sm: 'h-9 px-4 py-2 text-caption rounded-lg',
        default: 'h-12 px-6 py-3 text-body rounded-xl',
        lg: 'h-14 px-8 py-4 text-subheading rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      loading: false,
    },
  }
);

// Ripple effect component
const RippleEffect: React.FC<{ x: number; y: number; show: boolean }> = ({ x, y, show }) => {
  return (
    <span
      className={cn(
        'absolute pointer-events-none rounded-full bg-white/30',
        'animate-ping',
        show ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        transition: 'opacity 0.6s ease-out',
      }}
    />
  );
};

// Loading spinner component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'default' | 'lg' }> = ({ size = 'default' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'border-2 border-white/30 border-t-white rounded-full animate-spin',
        sizeClasses[size]
      )}
    />
  );
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    loadingText,
    asChild = false, 
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        {...props}
      >
        {/* Background gradient overlay for hover effect */}
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-medium rounded-xl" />
        )}
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && <LoadingSpinner size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'} />}
          {loading && loadingText ? loadingText : children}
        </span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
