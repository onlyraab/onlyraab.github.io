# OnlyRaab Website Development Setup

This project uses Vite to build TypeScript files and serve them with auto-reloading during development.

## Project Structure

```
├── src/
│   ├── ts/
│   │   └── index.ts          # Main TypeScript entry point
│   ├── less/
│   │   └── index.less        # Main LESS entry point
│   └── types/
│       └── styles.d.ts       # Type declarations for style imports
├── docs/
│   ├── index.html           # Main HTML file
│   ├── index.js             # Built JavaScript (generated)
│   ├── index.css            # Built CSS (generated)
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

1. **TypeScript Source**: Your TypeScript code goes in `src/ts/index.ts`
2. **LESS Source**: Your LESS styles go in `src/less/index.less`
3. **Build**: Vite compiles TypeScript to `docs/index.js` and LESS to `docs/index.css`
4. **HTML**: The `docs/index.html` file loads both the compiled JavaScript and CSS
5. **Development**: When you run `npm run start`, both the build process and dev server run concurrently
6. **Auto-reload**: The page automatically reloads when you make changes to your TypeScript or LESS files

## Making Changes

1. **Edit TypeScript**: Modify `src/ts/index.ts` for application logic
2. **Edit LESS**: Modify `src/less/index.less` for styles (supports variables, mixins, nesting)
3. **Auto-rebuild**: The build process automatically detects changes and rebuilds both files
4. **Auto-reload**: The browser automatically refreshes with your changes
5. **Debugging**: Check browser console for TypeScript output and DevTools for CSS changes

## Files Generated

**Production Build (`npm run build`):**
- `docs/index.js` - Minified JavaScript (single line)
- `docs/index.css` - Minified CSS (single line)

**Development Build (`npm run build:dev`):**
- `docs/index.js` - Readable JavaScript with proper formatting
- `docs/index.css` - Readable CSS with proper formatting  
- `docs/index.js.map` - Source map for debugging

These files are automatically generated and should not be edited manually.

## LESS Features Available

- **Variables**: `@primary-color: #333;`
- **Mixins**: `.border-radius(@radius: 4px) { border-radius: @radius; }`
- **Nesting**: Write nested CSS rules
- **Functions**: Use LESS built-in functions like `lighten()`, `darken()`, etc.
- **Import**: Split your styles into multiple files and `@import` them