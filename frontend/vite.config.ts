import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

function getEnhancerEntries(): Record<string, string> {
  const enhancersDir = resolve(__dirname, 'src/enhancers');
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(enhancersDir);
    for (const file of files) {
      if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        const name = file.replace(/\.ts$/, '');
        entries[name] = resolve(enhancersDir, file);
      }
    }
  } catch {
    // No enhancers directory yet — that's fine
  }

  return entries;
}

export default defineConfig({
  publicDir: false,
  build: {
    outDir: resolve(__dirname, 'public/js'),
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: getEnhancerEntries(),
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared'),
      '@frontend': resolve(__dirname, 'src'),
    },
  },
});
