---
paths:
  - "frontend/**/*.{ts,tsx}"
  - "frontend/**/*.css"
---

# Frontend Development Rules

> PROSE constraints: **Progressive Disclosure** (loaded only when editing frontend
> files) + **Reduced Scope** (focuses attention on UI concerns only).

## React Conventions

- Functional components only — no class components
- Use React hooks for state and side effects
- Implement error boundaries for component trees
- Co-locate tests in `__tests__/` directories alongside source

## Component Structure

```
ComponentName/
├── ComponentName.tsx       # Component implementation
├── ComponentName.test.tsx  # Unit tests
├── ComponentName.css       # Styles (CSS Modules)
└── index.ts                # Re-export
```

## TypeScript

- All props must have an interface (e.g., `interface ButtonProps`)
- Export component prop types from module index
- Use `React.FC` sparingly — prefer explicit return types

## Styling

- Use CSS Modules for component-scoped styles
- Follow BEM naming within modules
- No inline styles except for truly dynamic values

## Accessibility

- All interactive elements need keyboard support
- Images require meaningful `alt` text
- Form inputs require associated `<label>` elements
