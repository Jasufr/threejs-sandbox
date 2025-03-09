// import restart from 'vite-plugin-restart'
// import glsl from 'vite-plugin-glsl'

// export default {
//     root: 'src/',
//     publicDir: '../static/',
//     base: './',
//     server: {
//         host: true, // Open to local network and display URL
//         open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
//     },
//     build: {
//         outDir: '../dist', // Output in the dist/ folder
//         emptyOutDir: true, // Empty the folder first
//         sourcemap: true, // Add sourcemap
//         assetsInclude: ['projects/**/*', '**/*.html'] // Include the projects folder and its contents
//     },
//     plugins: [
//         restart({ restart: ['../static/**'] }), // Restart server on static file change
//         glsl() // Handle shader files
//     ]
// }

import { resolve } from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import handlebars from 'vite-plugin-handlebars';
import { pageData } from './src/consts/';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: '/threejs-sandbox/',
  plugins: [
    glsl(),
    handlebars({
      partialDirectory: resolve(__dirname, 'src/templates'),
      context(pagePath) {
        const page = pageData.find((page) => page.path === pagePath);

        if (pagePath === '/index.html') {
          return {
            ...page,
            sketches: pageData.filter((page) => page.path !== '/index.html'),
          };
        }
        return page;
      },
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pageData.map((page) => [
          page.key,
          resolve(__dirname, `src${page.path}`),
        ]),
      ),
      output: {
        dir: resolve(__dirname, 'dist'),
      },
    },
  },
});
