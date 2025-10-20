# MOKICK Core Integration

This setup allows you to import TypeScript interfaces and parsers from your MOKICK core project using clean `@mokick/core` imports.

## Setup Complete ✅

The following has been configured:

1. **Symlink created**: `src/mokick-core` → `/Users/markusraab/Documents/BYPR-Staff/Projects/222-MOKICK-2/02_Production/Code/mokick-mono/packages/@mokick/core/src`
2. **TypeScript path mapping**: `@mokick/core/*` resolves to `src/mokick-core/*`
3. **Vite alias configuration**: Handles the `@mokick/core` imports during build
4. **Git ignore**: Symlink is ignored to avoid committing local paths

## Usage

You can now import from your MOKICK core project using clean import statements:

```typescript
// Import interfaces
import { SomeInterface, DataType } from '@mokick/core/interfaces';

// Import parsers
import { parseData, validateInput } from '@mokick/core/parsers';

// Import utilities
import { formatOutput, processItem } from '@mokick/core/utils';

// Import from subdirectories
import { CoreConfig } from '@mokick/core/config/types';
```

## Example Implementation

Replace the mock functions in `src/ts/mokick-integration.ts` with real imports:

```typescript
// Replace mock imports with real ones from your MOKICK core
import { 
  // Your actual interfaces
  DataInterface,
  ParseResult,
  ConfigType
} from '@mokick/core/interfaces';

import {
  // Your actual parsers
  parseInputData,
  validateSchema,
  transformOutput
} from '@mokick/core/parsers';

// Use them in your application
export function processData(input: string): ParseResult {
  return parseInputData(input);
}
```

## Benefits

- ✅ **Clean imports**: Use `@mokick/core` instead of relative paths
- ✅ **Type safety**: Full TypeScript support for MOKICK interfaces
- ✅ **Auto-completion**: IDE support for MOKICK exports
- ✅ **Up-to-date**: Always uses the latest version from your MOKICK project
- ✅ **Tree shaking**: Only bundles the code you actually import
- ✅ **Source maps**: Debug into MOKICK core code during development

## File Structure

```
src/
├── mokick-core/          # Symlink to MOKICK core sources
├── ts/
│   ├── index.ts          # Main entry point
│   └── mokick-integration.ts  # MOKICK core integration layer
└── ...
```

## Development Workflow

1. **Edit MOKICK core**: Make changes in your main MOKICK project
2. **Use immediately**: Changes are available instantly via the symlink
3. **Build**: Run `npm run build:dev` or `npm run build` as usual
4. **Deploy**: Production builds include only the imported MOKICK code

## Next Steps

1. Replace the mock implementations in `mokick-integration.ts` with real imports from `@mokick/core`
2. Update your main application code to use the MOKICK interfaces and parsers
3. Add any additional MOKICK modules you need by importing them with the `@mokick/core` prefix

## Troubleshooting

**Import errors?**
- Check that the symlink exists: `ls -la src/mokick-core`
- Verify the MOKICK project has the expected exports
- Make sure the MOKICK project compiles without errors

**Build errors?**
- Ensure the MOKICK core TypeScript is compatible
- Check for circular dependencies
- Verify all imported modules exist in the MOKICK project