import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'underline' | 'filled' | 'outlined';
  label?: string;
  helperText?: string;
  error?: boolean;
  animated?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = 'outlined',
    label,
    helperText,
    error = false,
    animated = true,
    value,
    placeholder,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(() => Boolean(value));

    React.useEffect(() => {
      setHasValue(Boolean(value));
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const isLabelFloating = isFocused || hasValue;

    if (variant === 'underline') {
      return (
        <div className="relative w-full">
          <div className="relative group">
            <input
              type={type}
              value={value}
              className={cn(
                'w-full bg-transparent border-0 border-b-2 py-3 px-0 text-body placeholder-transparent focus:outline-none transition-all duration-300',
                error 
                  ? 'border-red-400 focus:border-red-500' 
                  : 'border-white/20 focus:border-blue-400',
                'peer',
                className
              )}
              placeholder={placeholder || label || ''}
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={ref}
              {...props}
            />
            
            {/* Animated underline */}
            <div className={cn(
              'absolute bottom-0 left-0 h-0.5 transition-all duration-300',
              error 
                ? 'bg-gradient-to-r from-red-400 to-red-500' 
                : 'bg-gradient-to-r from-blue-400 to-purple-400',
              isFocused ? 'w-full' : 'w-0'
            )} />
            
            {/* Floating label */}
            {label && (
              <label className={cn(
                'absolute left-0 transition-all duration-300 pointer-events-none',
                isLabelFloating
                  ? 'top-0 -translate-y-6 text-caption'
                  : 'top-3 text-body',
                error 
                  ? 'text-red-400' 
                  : isFocused 
                    ? 'text-blue-400' 
                    : 'text-white/60'
              )}>
                {label}
              </label>
            )}
          </div>
          
          {/* Helper text */}
          {helperText && (
            <p className={cn(
              'mt-2 text-small transition-colors duration-300',
              error ? 'text-red-400' : 'text-white/60'
            )}>
              {helperText}
            </p>
          )}
        </div>
      );
    }

    if (variant === 'filled') {
      return (
        <div className="relative w-full">
          <div className="relative group">
            <input
              type={type}
              value={value}
              className={cn(
                'w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-body placeholder-transparent focus:outline-none transition-all duration-300',
                error 
                  ? 'border-red-400 focus:border-red-500 focus:bg-red-500/5' 
                  : 'focus:border-blue-400 focus:bg-white/10',
                'peer',
                animated && 'hover:bg-white/8',
                className
              )}
              placeholder={placeholder || label || ''}
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={ref}
              {...props}
            />
            
            {/* Focus glow effect */}
            {animated && (
              <div className={cn(
                'absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none',
                isFocused 
                  ? error 
                    ? 'shadow-lg shadow-red-500/20' 
                    : 'shadow-lg shadow-blue-500/20'
                  : 'shadow-none'
              )} />
            )}
            
            {/* Floating label */}
            {label && (
              <label className={cn(
                'absolute left-4 transition-all duration-300 pointer-events-none',
                isLabelFloating
                  ? 'top-2 text-caption'
                  : 'top-4 text-body',
                error 
                  ? 'text-red-400' 
                  : isFocused 
                    ? 'text-blue-400' 
                    : 'text-white/60'
              )}>
                {label}
              </label>
            )}
          </div>
          
          {/* Helper text */}
          {helperText && (
            <p className={cn(
              'mt-2 text-small transition-colors duration-300',
              error ? 'text-red-400' : 'text-white/60'
            )}>
              {helperText}
            </p>
          )}
        </div>
      );
    }

    // Default outlined variant
    return (
      <div className="relative w-full">
        <div className="relative group">
          <input
            type={type}
            value={value}
            className={cn(
              'w-full bg-transparent border-2 rounded-xl py-4 px-4 text-body placeholder-transparent focus:outline-none transition-all duration-300',
              error 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-white/20 focus:border-blue-400',
              'peer',
              animated && 'hover:border-white/30',
              className
            )}
            placeholder={placeholder || label || ''}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={ref}
            {...props}
          />
          
          {/* Focus glow effect */}
          {animated && (
            <div className={cn(
              'absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none',
              isFocused 
                ? error 
                  ? 'shadow-lg shadow-red-500/20' 
                  : 'shadow-lg shadow-blue-500/20'
                : 'shadow-none'
            )} />
          )}
          
          {/* Floating label */}
          {label && (
            <label className={cn(
              'absolute left-4 px-2 transition-all duration-300 pointer-events-none',
              isLabelFloating
                ? 'top-0 -translate-y-1/2 text-caption bg-black/80 rounded'
                : 'top-4 text-body',
              error 
                ? 'text-red-400' 
                : isFocused 
                  ? 'text-blue-400' 
                  : 'text-white/60'
            )}>
              {label}
            </label>
          )}
        </div>
        
        {/* Helper text */}
        {helperText && (
          <p className={cn(
            'mt-2 text-small transition-colors duration-300',
            error ? 'text-red-400' : 'text-white/60'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
