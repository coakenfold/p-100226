---
paths:
  - "frontend/**/*.ts"
  - "frontend/**/*.css"
  - "frontend/**/*.njk"
---

# Frontend Development Rules

> PROSE constraints: **Progressive Disclosure** (loaded only when editing frontend
> files) + **Reduced Scope** (focuses attention on UI concerns only).

## Progressive Enhancement Principles

- Every page must function fully without JavaScript
- JavaScript enhances server-rendered markup — never replaces it
- Forms submit natively; JS validation is layered on top
- Links navigate with standard `<a href>` — no client-side routing
- Enhancers bind to elements via `data-enhance="<name>"` attributes

## Template Conventions (Nunjucks)

- Use template inheritance: pages extend a base layout
- Extract repeated markup into partials (`{% include %}`)
- Keep logic out of templates — compute values in route handlers
- Use Nunjucks macros for reusable UI patterns (buttons, form fields)

## View/Enhancer Structure

```
views/pages/
├── home.njk                # Page template (extends layout)
├── about.njk
└── ...

views/layouts/
├── base.njk                # Base layout (head, nav, footer)
└── ...

views/partials/
├── header.njk              # Shared fragments
├── footer.njk
└── ...

src/enhancers/
├── form-validation.ts      # Progressive enhancement module
├── dropdown.ts
└── index.ts                # Entry point — registers all enhancers
```

## TypeScript (Enhancers)

- Enhancer modules export an `init` function that receives a root element
- Use strict types — no `any` (use `unknown` with type guards)
- Query DOM elements with `querySelectorAll('[data-enhance="..."]')`
- Enhancers must be idempotent — safe to call multiple times on the same element

## Styling

- Plain CSS (or PostCSS for nesting/custom properties)
- Follow BEM naming convention for class names
- No inline styles except for truly dynamic values (e.g., computed positions)
- No CSS-in-JS or CSS Modules — styles are global, scoped by BEM naming

## Accessibility

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<button>`)
- All interactive elements need keyboard support
- Images require meaningful `alt` text
- Form inputs require associated `<label>` elements
- ARIA attributes only when native semantics are insufficient
- Test with JavaScript disabled to verify baseline functionality
