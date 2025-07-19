# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui component library
├── hooks/                # Custom React hooks
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utility functions and configurations
│   └── utils.ts          # Common utilities (cn function)
└── [config files]        # Various configuration files
```

## Key Conventions

### Import Aliases
- `@/*` - Maps to project root
- `@/components` - Component imports
- `@/lib/utils` - Utility functions
- `@/hooks` - Custom hooks

### Component Structure
- **UI Components**: Located in `components/ui/` - shadcn/ui components
- **Page Components**: Located in `app/` following App Router structure
- **Custom Hooks**: Located in `hooks/` directory

### Styling Patterns
- **Tailwind Classes**: Use `cn()` utility for conditional classes
- **CSS Variables**: Design tokens defined in `globals.css`
- **Component Variants**: Use `class-variance-authority` for component APIs

### File Naming
- **Components**: PascalCase for React components (`.tsx`)
- **Utilities**: camelCase for utility functions (`.ts`)
- **Hooks**: Prefix with `use-` (e.g., `use-toast.ts`)
- **Config Files**: kebab-case or standard names

### TypeScript Patterns
- **Strict Mode**: Enabled in `tsconfig.json`
- **Type Definitions**: Co-located with components when possible
- **Interfaces**: Use for component props and data structures

### Configuration Files
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.js` - Next.js build configuration
- `tsconfig.json` - TypeScript compiler options