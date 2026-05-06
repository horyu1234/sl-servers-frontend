import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3185,
    open: false,
  },
  build: {
    outDir: 'build',
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20_000,
          maxSize: 450_000,
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|react-router-dom|scheduler)[\\/]/,
              priority: 40,
            },
            {
              name: 'state-vendor',
              test: /node_modules[\\/](?:react-redux|redux|@reduxjs)[\\/]/,
              priority: 35,
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](?:@radix-ui|lucide-react|vaul|cmdk|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              priority: 30,
            },
            {
              name: 'charts-vendor',
              test: /node_modules[\\/](?:recharts|d3-|victory-vendor)[\\/]/,
              priority: 30,
            },
            {
              name: 'map-vendor',
              test: /node_modules[\\/](?:leaflet|react-leaflet|@react-leaflet)[\\/]/,
              priority: 30,
            },
            {
              name: 'swagger-vendor',
              test: /node_modules[\\/](?:swagger-ui-react|swagger-ui-dist)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
