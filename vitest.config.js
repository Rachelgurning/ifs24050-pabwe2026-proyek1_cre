import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    // Server HTTP in-memory dimatikan setelah setiap berkas uji selesai.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/tests/**', 'src/server.js', 'node_modules/**'],
    },
  },
});
