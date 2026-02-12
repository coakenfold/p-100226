import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFileSystemRouter } from '../utils/fsRouter.js';

// Get project root (two levels up from backend/src/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');

// Auto-generate routes from frontend/views/pages/
export const pageRoutes = createFileSystemRouter({
  pagesDir: join(projectRoot, '..', 'frontend', 'views', 'pages'),
  templatePrefix: 'pages/',
});
