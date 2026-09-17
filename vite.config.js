import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 如果仓库是 你的用户名.github.io，用 '/'
  // 如果是普通仓库，比如 blog，改成 '/blog/'
  base: '/',
});