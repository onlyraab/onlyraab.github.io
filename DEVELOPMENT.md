# OnlyRaab Website Development Setup

This project uses Vite to build TypeScript files and serve them with auto-reloading during development.

## Project Structure

```
├── src/
│   └── ts/
│       └── index.ts          # Main TypeScript entry point
├── docs/
│   ├── index.html           # Main HTML file
│   ├── index.js             # Built JavaScript (generated)
│   └── index.js.map         # Source map (generated)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── dev.sh                   # Development helper script
```

## Development Commands

### Start Development Environment
```bash
npm run start
```
This command will:
1. Build your TypeScript files in development mode (unminified) and watch for changes
2. Start a development server with auto-reload
3. Open your browser to `http://localhost:3000/docs/`

### Production Build (Minified)
```bash
npm run build
```
Builds the TypeScript file once to `docs/index.js` with minification and no source maps

### Development Build (Unminified)
```bash
npm run build:dev
```
Builds the TypeScript file once to `docs/index.js` without minification and with source maps

### Build with Watch Mode
```bash
npm run build:watch
```
Builds in development mode (unminified) and watches for changes to rebuild automatically

### Development Server Only
```bash
npm run dev
```
Starts the Vite development server

### Full Development Setup
```bash
npm run dev:full
```
Builds in development mode first, then starts the full development environment

## How It Works

1. **Source**: Your TypeScript code goes in `src/ts/index.ts`
2. **Build**: Vite compiles it to `docs/index.js`
3. **HTML**: The `docs/index.html` file loads the compiled JavaScript
4. **Development**: When you run `npm run start`, both the build process and dev server run concurrently
5. **Auto-reload**: The page automatically reloads when you make changes to your TypeScript files

## Making Changes

1. Edit your TypeScript code in `src/ts/index.ts`
2. The build process will automatically detect changes and rebuild
3. The browser will automatically reload with your changes
4. Check the browser console to see your TypeScript code in action

## Files Generated

- `docs/index.js` - The compiled JavaScript
- `docs/index.js.map` - Source map for debugging

These files are automatically generated and should not be edited manually.