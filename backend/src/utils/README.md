# File System Router

Automatically generates Express routes from Nunjucks templates in `frontend/views/pages/`.

## How It Works

Drop a `.njk` template file in `frontend/views/pages/` and it automatically becomes a route:

| Template File          | URL Path      | Page Title |
| ---------------------- | ------------- | ---------- |
| `pages/index.njk`      | `/`           | Home       |
| `pages/about.njk`      | `/about`      | About      |
| `pages/contact-us.njk` | `/contact-us` | Contact Us |
| `pages/blog/index.njk` | `/blog`       | Blog       |
| `pages/blog/post.njk`  | `/blog/post`  | Post       |

## Conventions

- **Index files** (`index.njk`) map to their directory root
- **File names** are converted to title case for page titles
- **Files starting with `_`** are ignored (use for partials)
- **Special files** like `404.njk` and `500.njk` are skipped (handled separately)

## Usage

```ts
import { createFileSystemRouter } from '../utils/fsRouter.js';

export const pageRoutes = createFileSystemRouter({
  pagesDir: '/absolute/path/to/frontend/views/pages',
  templatePrefix: 'pages/', // Prefix for res.render()
});
```

## Adding a New Page

1. Create `frontend/views/pages/your-page.njk`
2. That's it! No route registration needed.

The route is automatically available at `/your-page` with title "Your Page".

## Debugging

Routes are logged at startup:

```
[FS Router] Registered: /about     → pages/about.njk
[FS Router] Registered: /          → pages/index.njk
```

To see all routes programmatically:

```ts
import { getFileSystemRoutes } from '../utils/fsRouter.js';

const routes = getFileSystemRoutes('/path/to/pages');
console.log(routes); // [{ path: '/', template: 'index.njk', title: 'Home' }, ...]
```
