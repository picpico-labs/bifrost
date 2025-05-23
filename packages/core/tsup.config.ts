import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/machines/index.ts', 'src/adapters/index.ts', 'src/engine/index.ts', 'src/lib/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  treeshake: true,
  tsconfig: 'tsconfig.prod.json',
});
