import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { thirdPartyLicenses } from './vite-plugins/thirdPartyLicenses';

export default defineConfig({
  plugins: [react(), tailwindcss(), thirdPartyLicenses()],
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
        strictExecutionOrder: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
