import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Enhanced responsive breakpoints
    screens: {
      'xs': '375px',   // Small mobile
      'sm': '640px',   // Mobile
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large desktop
    },
    extend: {
      // Design System - Spacing Scale
      spacing: {
        'xs': 'var(--spacing-xs)',     // 8px
        'sm': 'var(--spacing-sm)',     // 12px
        'md': 'var(--spacing-md)',     // 16px
        'lg': 'var(--spacing-lg)',     // 24px
        'xl': 'var(--spacing-xl)',     // 32px
        '2xl': 'var(--spacing-2xl)',   // 48px
        '3xl': 'var(--spacing-3xl)',   // 64px
      },
      
      // Design System - Typography Scale
      fontSize: {
        'display': ['var(--font-size-display)', { lineHeight: 'var(--line-height-display)' }],
        'heading': ['var(--font-size-heading)', { lineHeight: 'var(--line-height-heading)' }],
        'subheading': ['var(--font-size-subheading)', { lineHeight: 'var(--line-height-subheading)' }],
        'body': ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }],
        'caption': ['var(--font-size-caption)', { lineHeight: 'var(--line-height-caption)' }],
        'small': ['var(--font-size-small)', { lineHeight: 'var(--line-height-small)' }],
      },
      
      // Design System - Font Weights
      fontWeight: {
        'light': 'var(--font-weight-light)',
        'regular': 'var(--font-weight-regular)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },
      
      // Design System - Animation Timing
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'medium': 'var(--duration-medium)',
        'slow': 'var(--duration-slow)',
      },
      
      transitionTimingFunction: {
        'ease': 'var(--easing-ease)',
        'ease-in': 'var(--easing-ease-in)',
        'ease-out': 'var(--easing-ease-out)',
        'ease-in-out': 'var(--easing-ease-in-out)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, hsl(var(--background-primary)) 0%, hsl(var(--background-accent)) 100%)',
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      colors: {
        // Enhanced Design System Colors
        'bg-primary': 'hsl(var(--background-primary))',
        'bg-secondary': 'hsl(var(--background-secondary))',
        'bg-accent': 'hsl(var(--background-accent))',
        'bg-card': 'hsl(var(--background-card))',
        
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted': 'hsl(var(--text-muted))',
        'text-accent': 'hsl(var(--text-accent))',
        
        'interactive-primary': 'hsl(var(--interactive-primary))',
        'interactive-secondary': 'hsl(var(--interactive-secondary))',
        'interactive-hover': 'hsl(var(--interactive-hover))',
        'interactive-active': 'hsl(var(--interactive-active))',
        
        'border-primary': 'hsl(var(--border-primary))',
        'border-secondary': 'hsl(var(--border-secondary))',
        'border-accent': 'hsl(var(--border-accent))',
        
        // Legacy shadcn/ui colors for compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
