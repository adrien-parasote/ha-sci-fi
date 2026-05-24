import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/locales/generated/**',
        'src/**/*.d.ts',
        // Pure data files — SVG icon maps, type definitions only, no logic
        'src/**/data/sf-weather-icons.ts',
        'src/**/data/sf-icons.ts',
        'src/types/ha.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
      reportOnFailure: true,
    },
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    // Use happy-dom for LitElement/DOM tests
    environmentMatchGlobs: [
      ['tests/utils/**', 'happy-dom'],
      ['tests/components/**', 'happy-dom'],
      ['tests/cards/**', 'happy-dom'],
      ['tests/selectors/**', 'node'],
      ['tests/types/**', 'node'],
    ],
  },
});
