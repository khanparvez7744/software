import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

// ----------------------------------------------------------------------

const API_BASE_URL = 'http://0.0.0.0:3322';
const API_KEY = 'c1358d74-c0ab-4e40-a53f-9be502077fee';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 4433,
    proxy: {
      '/api': API_BASE_URL,
    },
  },
  preview: {
    port: 4433,
  },
});
