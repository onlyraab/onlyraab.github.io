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
        port: 3000,
        fs: {
          // Allow serving files from outside the root directory
          allow: ['..', '../..']
        }
      },
      publicDir: false,
      resolve: {
        alias: {
          '@mokick/core': '/src/mokick-core'
        }
      }
    }
  }

  // Build mode - standard web application build
  return {
    build: {
      outDir: 'docs',
      emptyOutDir: false,
      rollupOptions: {
        input: {
          index: 'src/ts/index.ts',
          'tools/scheduler': 'src/ts/tools/scheduler.ts'
        },
        output: {
          entryFileNames: '[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return assetInfo.name === 'scheduler.css' ? 'tools/scheduler.css' : 'index.css'
            }
            return '[name].[ext]'
          },
          format: 'es'
        }
      },
      minify: isProduction,
      sourcemap: !isProduction,
      target: 'es2015'
    },
    publicDir: false,
    resolve: {
      alias: {
        '@mokick/core': '/src/mokick-core'
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          // Add any LESS options here if needed
        }
      }
    }
  }
})