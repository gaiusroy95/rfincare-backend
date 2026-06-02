import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Only chart libraries — avoid pulling clsx/tailwind-merge into this chunk.
          if (id.includes('/recharts/') || id.includes('\\recharts\\')) return 'charts';
          if (id.includes('/d3-') || id.includes('\\d3-')) return 'charts';
          if (id.includes('clsx') || id.includes('tailwind-merge')) return 'utils';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
          if (id.includes('axios')) return 'http';
        },
      },
    },
  },
  plugins: [tsconfigPaths(), react()],
  server: {
    port: '4028',
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],
    proxy: {
      '/auth/oauth': {
        target: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});
