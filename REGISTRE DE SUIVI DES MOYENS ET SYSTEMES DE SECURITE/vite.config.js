import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  server: {
    port: 5174,
    open: true
  },
  preview: {
    port: 5174
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    modulePreload: false,
    crossOriginLoading: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          export: ['html2pdf.js', 'xlsx']
        }
      }
    }
  }
});
