// vite.config.ts
import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(),dtsPlugin()],
  build: {
    lib: {
      entry: 'lib/index.ts',
      name: 'NamedReactRouter',
      fileName: (format) => `named-react-router.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
});
