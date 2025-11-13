import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: 'dist', insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // or 'src/index.tsx' if your entry uses JSX
      name: 'CopilotLCW',
      fileName: (format) => `index${format === 'cjs' ? '.cjs' : ''}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
  },
});
