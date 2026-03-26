# Contributing to ClipMind

## Adding a New Clip Type + Enricher

This guide walks through adding a new content type to ClipMind's detection and enrichment pipeline.

### Step 1: Define the type

In `src/shared/types.ts`:

1. Add your type to the `ClipType` union:

```typescript
export type ClipType =
  | 'url'
  | 'email'
  // ...existing types...
  | 'your_type'   // <-- add here
  | 'text'        // text must remain last (fallback)
```

2. Add enriched data interface:

```typescript
export interface EnrichedYourTypeData {
  readonly someField: string
  readonly anotherField: number
}
```

3. Add it to the `EnrichedData` union:

```typescript
export type EnrichedData =
  // ...existing entries...
  | { readonly type: 'your_type'; readonly data: EnrichedYourTypeData }
```

4. Add labels and colors:

```typescript
export const CLIP_TYPE_LABELS: Record<ClipType, string> = {
  // ...
  your_type: 'Your Type',
}

export const CLIP_TYPE_COLORS: Record<ClipType, string> = {
  // ...
  your_type: 'var(--clip-your-type)',
}
```

### Step 2: Add the detector

In `src/shared/detector.ts`:

1. Create a detection function:

```typescript
export function isYourType(text: string): boolean {
  // Return true if the text matches your type
  return YOUR_REGEX.test(text.trim())
}
```

2. Add it to the `detect()` function **before** the `text` fallback but in the correct priority position:

```typescript
export function detect(raw: string): ClipType {
  // ...existing checks in priority order...
  if (isYourType(trimmed)) return 'your_type'
  // 'text' fallback must be last
  return 'text'
}
```

### Step 3: Build the enricher

Create `src/background/enrichers/your_type.ts`:

```typescript
import type { EnrichedData } from '../../shared/types'

export async function enrichYourType(raw: string): Promise<EnrichedData | null> {
  // Process the raw text and return enriched data
  // This runs in the service worker context
  // Must complete within 3 seconds (enforced by caller)

  return {
    type: 'your_type',
    data: {
      someField: 'processed value',
      anotherField: 42,
    },
  }
}
```

Register it in `src/background/enrichers/registry.ts`:

```typescript
import { enrichYourType } from './your_type'

const enrichers: Record<string, Enricher> = {
  // ...existing enrichers...
  your_type: enrichYourType,
}
```

### Step 4: Update the UI

1. Add a CSS glow class in `src/popup/globals.css`:

```css
.clip-glow-your-type { box-shadow: 0 0 12px rgba(R, G, B, 0.15); }
```

2. Add the CSS variable:

```css
:root {
  --clip-your-type: #HEXCOLOR;
}
```

3. Add the glow mapping in `src/popup/components/ClipItem.tsx`:

```typescript
const GLOW_CLASSES: Record<string, string> = {
  // ...
  your_type: 'clip-glow-your-type',
}
```

4. Add a case in `EnrichedView` inside `src/popup/components/ClipItemDetail.tsx` to render your enriched data.

### Step 5: Write tests

Add tests in `src/__tests__/detector.test.ts`:

```typescript
describe('isYourType', () => {
  it('detects valid input', () => {
    expect(isYourType('valid input')).toBe(true)
  })

  it('rejects invalid input', () => {
    expect(isYourType('not valid')).toBe(false)
  })
})
```

Add enricher tests in `src/__tests__/enrichers.test.ts`:

```typescript
describe('enrichYourType', () => {
  it('returns enriched data', async () => {
    const result = await enrichYourType('valid input')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('your_type')
  })
})
```

### Step 6: Verify

```bash
npm run test       # all tests pass
npm run build      # builds without errors
```

Load the unpacked extension and test with real clipboard data.

## Code Standards

- Full TypeScript with strict mode — no `any`
- All component props use `Readonly<>` interfaces
- Enrichers must handle errors gracefully (return `null` on failure)
- All async enrichment has a 3-second timeout enforced by the caller
- Chrome API calls go through typed helpers in `src/shared/chrome.ts`
