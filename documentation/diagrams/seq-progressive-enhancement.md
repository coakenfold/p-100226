# Sequence Diagram — Progressive Enhancement

How the browser receives server-rendered HTML, loads bundled JavaScript
enhancers, and progressively upgrades interactive elements.

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant E as Express Server
    participant V as Vite (build time)

    Note over V: Build time (happens once)

    V->>V: Scan frontend/src/enhancers/*.ts
    V->>V: Compile example.ts → ES module
    V->>V: Output to frontend/public/js/example.js

    Note over U,E: Runtime — page load

    U->>B: Navigate to /
    B->>E: GET /
    E-->>B: 200 OK — HTML (fully functional without JS)

    Note over B: HTML includes:<br/>• Server-rendered content<br/>• Elements with data-enhance="example"<br/>• &lt;script src="/js/example.js" type="module" defer&gt;

    B->>B: Parse HTML → render page
    Note over U,B: Page is usable immediately (no JS required)

    par Load static assets
        B->>E: GET /js/example.js
        E-->>B: 200 OK — JavaScript (cached 1 year)

        B->>E: GET /css/styles.css
        E-->>B: 200 OK — CSS (cached 1 year)
    end

    B->>B: Execute example.js module

    Note over B: Enhancer init()

    B->>B: Check document.readyState
    alt Already loaded
        B->>B: Run init() immediately
    else Still loading
        B->>B: addEventListener("DOMContentLoaded", init)
        B->>B: DOMContentLoaded fires → run init()
    end

    B->>B: querySelectorAll('[data-enhance="example"]')

    loop For each matched element
        B->>B: enhance(element)
        B->>B: Find child <li> items
        B->>B: Attach click event listeners
        B->>B: Set element.dataset.enhanced = "true"
    end

    Note over U,B: Page now has enhanced interactivity

    U->>B: Click a list item
    B->>B: Toggle "highlighted" CSS class
    Note over B: No server round-trip needed — JS handles interaction
```
