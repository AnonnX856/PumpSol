import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: {
        Buffer: true,
        process: true,
      },
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      '@solana/web3.js',
      '@solana/spl-token',
      'bn.js'
    ]
  }
});