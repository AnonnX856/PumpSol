import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'process/browser',
      'buffer',
      'util',
      '@solana/web3.js',
      '@solana/spl-token',
      'bn.js'
    ],
  },
});