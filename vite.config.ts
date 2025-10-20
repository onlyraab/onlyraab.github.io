import { defineConfig } from 'vite'

export default defineConfig({
  // Build configuration
  build: {
    // Output directory
    outDir: 'docs',
    // Don't clear the docs directory (preserve existing files like index.html)
    emptyOutDir: false,
    lib: {
      entry: 'src/ts/index.ts',
      name: 'OnlyRaab',
      fileName: () => 'index.js',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        // Ensure we get a single file
        inlineDynamicImports: true
      }
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Target modern browsers
    target: 'es2015'
  },
  
  // Development server configuration for serving the docs folder
  server: {
    // Serve the docs directory
    fs: {
      allow: ['..']
    },
    // Auto-open browser
    open: '/docs/',
    // Hot reload
    hmr: true,
    port: 3000
  },
  
  // Public directory
  publicDir: 'docs'
})