import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      external: [
        '@babel/parser',
        '@babel/traverse',
        '@babel/generator',
        '@babel/types',
      ],
      output: {
        // Split heavy vendor libraries into named chunks that cache independently.
        // React.lazy() routes already create per-page chunks automatically.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
            if (id.includes('react-router'))   return 'router';
            if (id.includes('@radix-ui'))       return 'radix';
            if (id.includes('framer-motion'))   return 'motion';
            if (
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('lucide-react')
            )                                   return 'ui-utils';
            if (id.includes('sonner') || id.includes('react-helmet')) return 'ui-extras';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    cors: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});