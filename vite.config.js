import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/supa-utils/'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/supa-utils/index.ts'),
      name: 'SupaWR',
      fileName: 'supa-wr',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['@supabase/supabase-js', 'swr'],
      output: {
        globals: {
          '@supabase/supabase-js': 'supabase',
          swr: 'SWR',
        },
      },
    },
  },
});
