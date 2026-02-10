import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

// Vite 설정 문서: https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'development' ? '/' : '/thinkcomma/',
  optimizeDeps: {
    include: ['@myorg/shared'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@myorg/shared': path.resolve(
        __dirname,
        '../../packages/shared/src/index.ts'
      ),
    },
    dedupe: ['vue', 'vue-router', 'pinia'],
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages\/shared\/src/],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/styles/_variables.scss" as *;
        @use "@/styles/_mixins.scss" as *;
        `,
      },
    },
  },
}));
