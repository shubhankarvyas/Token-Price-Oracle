# Tech Stack

## Framework & Runtime
- **Next.js 13.5.1** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type safety and development experience
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Icon library
- **CSS Variables** - Design system tokens via Tailwind

## Key Libraries
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **clsx + tailwind-merge** - Conditional CSS classes
- **Sonner** - Toast notifications

## Build & Development
- **Static Export** - Configured for static site generation
- **ESLint** - Code linting (ignored during builds)
- **PostCSS + Autoprefixer** - CSS processing

## Common Commands
```bash
# Development
npm run dev          # Start development server on localhost:3000

# Production
npm run build        # Build for production (static export)
npm run start        # Start production server (after build)

# Code Quality
npm run lint         # Run ESLint (currently ignored in builds)

# Package Management
npm install          # Install dependencies
```

## Configuration Notes
- Static export enabled (`output: 'export'`)
- Images unoptimized for static hosting
- ESLint ignored during builds
- Path aliases configured (`@/*` maps to root)