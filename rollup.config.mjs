import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const dev = process.env.NODE_ENV !== 'production';

export default {
  input: 'src/sci-fi.ts',
  output: {
    file: 'dist/sci-fi.min.js',
    format: 'iife',
    name: 'SciFiCards',
    sourcemap: dev,
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
        '__DEV__': String(dev),
        '__VERSION__': JSON.stringify(version),
      },
    }),
    resolve({ browser: true }),
    // HIGH-02: experimentalDecorators + useDefineForClassFields MUST be passed
    // explicitly here — @rollup/plugin-typescript does NOT inherit them from
    // tsconfig.json reliably. Without these, Lit @property/@state decorators
    // are silently stripped and cards crash at runtime.
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: dev,
      inlineSources: dev,
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    }),
    !dev && terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: { regex: /^__/ },
      },
    }),
  ].filter(Boolean),
};