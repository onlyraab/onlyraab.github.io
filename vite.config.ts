import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const isServing = command === 'serve'

  if (isServing) {
    // Development server mode - serve from docs directory
    return {
      root: 'docs',
      server: {
        open: true,
        port: 3000
      },
      publicDir: false
    }
  }

  // Build mode - standard web application build
  return {
    build: {
      outDir: 'docs',
      emptyOutDir: false,
      rollupOptions: {
        input: 'src/ts/index.ts',
        output: {
          entryFileNames: 'index.js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'index.css'
            }
            return '[name].[ext]'
          },
          format: 'es',
          inlineDynamicImports: true
        }
      },
      minify: isProduction,
      sourcemap: !isProduction,
      target: 'es2015'
    },
    publicDir: false,
    css: {
      preprocessorOptions: {
        less: {
          // Add any LESS options here if needed
        }
      }
    }
  }
})