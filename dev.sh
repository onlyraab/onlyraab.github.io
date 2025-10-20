#!/bin/bash

echo "Starting development environment for OnlyRaab website..."

# Build the TypeScript initially
echo "Building TypeScript..."
npm run build

# Start the development server with file watching
echo "Starting development server with auto-reload..."
echo "Open your browser to http://localhost:3000/docs/"
echo ""
echo "The TypeScript file will be rebuilt automatically when you make changes to src/ts/index.ts"
echo "Press Ctrl+C to stop the development server"
echo ""

# Run both build watch and dev server concurrently
npm run build:watch & npm run dev