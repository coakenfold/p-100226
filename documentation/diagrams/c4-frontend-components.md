# C4 Level 3: Frontend Component Diagram

Shows the internal structure of the frontend — templates, assets, and the enhancement pipeline.

```mermaid
C4Component
    title Frontend Components — Templates, Assets & Enhancement

    Container_Boundary(frontend, "Frontend") {

        Component(baseLayout, "Base Layout", "layouts/base.njk", "HTML5 boilerplate, meta tags, CSS links, deferred JS script tags, content blocks")

        Component(pages, "Page Templates", "pages/*.njk", "Individual page content: index, 404, error. Extend base layout, receive data from Express routes")

        Component(partials, "Partials", "partials/*.njk", "Reusable template fragments: header (navigation), footer")

        Component(css, "Stylesheets", "public/css/main.css", "CSS reset, custom properties (design tokens), base typography, layout utilities")

        Component(enhancers, "Enhancer Scripts", "src/enhancers/*.ts", "TypeScript modules for progressive enhancement. Find elements by data-enhance attribute and add interactivity")

        Component(vite, "Vite Build", "vite.config.ts", "Bundles enhancer TypeScript to public/js/. Watch mode for development, source maps enabled")

        Component(compiledJs, "Compiled JS", "public/js/*.js", "Bundled enhancer output. Loaded via deferred script tags in base layout")

        Component(feTypes, "Frontend Types", "src/types/", "Frontend-specific TypeScript type definitions")

        Component(feUtils, "Frontend Utils", "src/utils/", "Frontend utility functions")
    }

    Container(express, "Express Server", "Node.js, Express")
    Container(shared, "Shared Package", "@project/shared")

    Rel(express, baseLayout, "Renders via", "res.render()")
    Rel(express, pages, "Passes data to", "template context")
    Rel(pages, baseLayout, "Extends")
    Rel(pages, partials, "Includes")
    Rel(baseLayout, css, "Links")
    Rel(baseLayout, compiledJs, "Loads (deferred)")
    Rel(vite, enhancers, "Bundles")
    Rel(vite, compiledJs, "Outputs to")
    Rel(enhancers, shared, "Imports types")
    Rel(enhancers, feTypes, "Uses")
    Rel(enhancers, feUtils, "Uses")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Component Responsibilities

| Component            | Path                              | Responsibility                                                                                                                                            |
| -------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Base Layout**      | `frontend/views/layouts/base.njk` | Root HTML structure. Defines `{% block %}` regions for title, head, content, and scripts. Links to `main.css` and deferred enhancer scripts.              |
| **Page Templates**   | `frontend/views/pages/*.njk`      | Individual pages. Each extends `base.njk` and fills content blocks. Receives typed data from Express route handlers. Auto-registered by the FS router.    |
| **Partials**         | `frontend/views/partials/*.njk`   | Reusable HTML fragments: navigation header, page footer. Included by layouts and pages via `{% include %}`.                                               |
| **Stylesheets**      | `frontend/public/css/main.css`    | Global styles. CSS custom properties for design tokens, responsive typography, layout grid utilities. No CSS-in-JS or modules.                            |
| **Enhancer Scripts** | `frontend/src/enhancers/*.ts`     | TypeScript source for progressive enhancement. Each enhancer targets elements with `data-enhance="<name>"` attributes and adds client-side interactivity. |
| **Vite Build**       | `frontend/vite.config.ts`         | Build tool. Compiles TypeScript enhancers to `public/js/`. Runs in watch mode during development for fast rebuilds.                                       |
| **Compiled JS**      | `frontend/public/js/*.js`         | Vite build output. Minified JavaScript bundles with source maps. Loaded with `defer` attribute so they execute after DOM is ready.                        |
| **Frontend Types**   | `frontend/src/types/`             | TypeScript types specific to the browser environment.                                                                                                     |
| **Frontend Utils**   | `frontend/src/utils/`             | Helper functions for DOM manipulation and browser APIs.                                                                                                   |

## Progressive Enhancement Flow

```
1. Browser requests page
                ↓
2. Express renders Nunjucks template with server data
                ↓
3. Full HTML page returned (works without JS)
                ↓
4. Browser loads deferred enhancer scripts
                ↓
5. Enhancers find elements with data-enhance="..." attributes
                ↓
6. Enhancers bind event listeners and add interactivity
                ↓
7. Elements get data-enhanced="true" attribute after initialization
```
