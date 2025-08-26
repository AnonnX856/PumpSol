import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { Buffer } from 'buffer'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      util: 'util',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'process',
      'buffer',
      'util',
      '@solana/web3.js',
      '@solana/spl-token',
      'bn.js'
    ],
    esbuildOptions: {
      plugins: [
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});
