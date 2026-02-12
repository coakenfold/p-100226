import { Router, Request, Response } from 'express';
import { readdirSync, statSync } from 'fs';
import { join, relative, parse } from 'path';
import { logger } from './logger.js';

export interface PageRoute {
  path: string;
  template: string;
  title: string;
}

interface RouteOptions {
  pagesDir: string;
  templatePrefix?: string;
}

/**
 * Derives a URL path from a template file path.
 *
 * Examples:
 *   pages/index.njk       → /
 *   pages/about.njk       → /about
 *   pages/blog/index.njk  → /blog
 *   pages/blog/post.njk   → /blog/post
 */
function templatePathToRoute(relativePath: string): string {
  const parsed = parse(relativePath);
  const dir = parsed.dir;
  const name = parsed.name;

  // Handle index files as directory roots
  if (name === 'index') {
    return dir === '' ? '/' : `/${dir}`;
  }

  // Handle named pages
  return dir === '' ? `/${name}` : `/${dir}/${name}`;
}

/**
 * Derives a page title from a filename.
 *
 * Examples:
 *   index.njk       → Home
 *   about.njk       → About
 *   contact-us.njk  → Contact Us
 */
function filenameToTitle(filename: string): string {
  const name = parse(filename).name;

  // Special case: index becomes "Home"
  if (name === 'index') {
    return 'Home';
  }

  // Convert kebab-case or snake_case to Title Case
  return name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Recursively scans a directory for .njk template files.
 */
function scanTemplates(dir: string, baseDir: string): PageRoute[] {
  const routes: PageRoute[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      routes.push(...scanTemplates(fullPath, baseDir));
    } else if (entry.endsWith('.njk')) {
      // Skip layouts, partials, and special files
      const fileName = parse(entry).name;
      if (
        fileName.startsWith('_') ||
        fileName === '404' ||
        fileName === '500'
      ) {
        continue;
      }

      const relativePath = relative(baseDir, fullPath);
      const urlPath = templatePathToRoute(relativePath.replace(/\.njk$/, ''));
      const template = relativePath;
      const title = filenameToTitle(entry);

      routes.push({ path: urlPath, template, title });
    }
  }

  return routes;
}

/**
 * Creates an Express router with auto-generated routes from the file system.
 *
 * Scans the specified pages directory and creates a route for each .njk template.
 * Routes are derived from file paths following these conventions:
 *
 * - index.njk maps to the directory root (/ or /subdir)
 * - other.njk maps to /other (or /subdir/other)
 * - Files starting with _ are ignored (partials)
 * - 404.njk and 500.njk are handled separately
 *
 * @param options.pagesDir - Absolute path to the pages directory
 * @param options.templatePrefix - Optional prefix for template paths (e.g., "pages/")
 */
export function createFileSystemRouter(options: RouteOptions): Router {
  const { pagesDir, templatePrefix = '' } = options;
  const router = Router();

  // Scan templates at startup
  const routes = scanTemplates(pagesDir, pagesDir);

  // Sort routes by specificity (longer paths first) to avoid conflicts
  routes.sort((a, b) => b.path.split('/').length - a.path.split('/').length);

  // Register each route
  for (const route of routes) {
    const templatePath = templatePrefix + route.template;

    router.get(route.path, (_req: Request, res: Response) => {
      res.render(templatePath, {
        title: route.title,
      });
    });

    logger.info(
      `[FS Router] Registered: ${route.path.padEnd(30)} → ${templatePath}`
    );
  }

  return router;
}

/**
 * Gets all registered routes without creating the router.
 * Useful for debugging or generating sitemaps.
 */
export function getFileSystemRoutes(pagesDir: string): PageRoute[] {
  return scanTemplates(pagesDir, pagesDir);
}
