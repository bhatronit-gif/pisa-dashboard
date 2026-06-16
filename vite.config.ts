import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false, // Disabling auto-open to avoid launching browser during dev/tests on headless systems
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**', '**/tests/e2e/**', '**/.agents/**'],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

