# ClipMind — Context-Aware Clipboard Manager

A Chrome Extension (Manifest V3) that silently detects, classifies, and enriches everything you copy. URLs get page titles, code gets language detection, colors get format conversions, and more.

## Architecture

```
Content Script           Background Service Worker         Popup (React)
┌──────────────┐        ┌──────────────────────────┐      ┌──────────────────┐
│ copy event   │──msg──▶│ detector.ts (classify)   │      │ SearchBar        │
│ listener     │        │ storage.ts  (persist)    │◀────▶│ TypeFilter       │
└──────────────┘        │ enrichers/* (async data) │      │ ClipPanel        │
                        │ context menu             │      │ ClipItem cards   │
                        └──────────────────────────┘      │ ClipItemDetail   │
                                                          └──────────────────┘
                        ┌──────────────────────────┐
                        │ Offscreen Document       │
                        │ clipboard read/write     │
                        └──────────────────────────┘
```

### Data flow

1. User copies text on any web page
2. Content script captures the selection via `document.copy` event
3. Sends raw text + source URL to background service worker
4. Background runs the type detector (URL, email, phone, color, code, date, address, name, number, text)
5. Stores the clip immediately in `chrome.storage.local`
6. Kicks off async enrichment (3s timeout, non-blocking)
7. Popup reads from storage and renders the history list
8. Click any item to copy it back to the clipboard

### Type detection priority

| Priority | Type | Detection method |
|----------|------|-----------------|
| 1 | `url` | HTTP/HTTPS regex |
| 2 | `email` | RFC-like email regex |
| 3 | `phone` | Digit pattern with formatting chars |
| 4 | `color` | HEX, RGB, HSL regex |
| 5 | `code` | Multi-line + language indicators (braces, keywords, indentation) |
| 6 | `date` | ISO, US, and written date formats |
| 7 | `address` | Street suffix + ZIP/state heuristic |
| 8 | `name` | 2-4 capitalized words, no numbers |
| 9 | `number` | Numeric with optional commas/decimals |
| 10 | `text` | Fallback |

### Enrichment per type

| Type | Enriched data |
|------|--------------|
| `url` | Page title, description, favicon, OG image |
| `code` | Language, line count, first function/class name |
| `color` | HEX, RGB, HSL conversions + swatch |
| `phone` | E.164 format, local format, country |
| `email` | Name part, domain, Gravatar hash |
| `date` | ISO string, relative time |
| `address` | Google Maps URL, city, country |
| `name` | LinkedIn search URL |
| `number` | Locale-formatted string |
| `text` | Word count, reading time, detected language |

## Tech Stack

- **Manifest V3** — service worker, content script, popup, offscreen document
- **React 19 + TypeScript** — popup and options UI
- **Vite 7 + @crxjs/vite-plugin** — build tooling with HMR
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — Command, Badge, ScrollArea, Tooltip, Popover
- **Zustand** — popup state management
- **Framer Motion** — list entrance animations, pinned item pulse
- **Vitest** — unit testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Chrome

### Development

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev
```

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder in this project
5. The ClipMind icon appears in your toolbar

### Build for production

```bash
npm run build
```

The production build lands in `dist/`. To create a Chrome Web Store zip:

```bash
cd dist && zip -r ../clipmind.zip . && cd ..
```

### Run tests

```bash
npm run test        # single run
npm run test:watch  # watch mode
```

## Project Structure

```
src/
├── background/
│   ├── index.ts              # Service worker entry
│   └── enrichers/            # One file per clip type
│       ├── registry.ts       # Enricher dispatch
│       ├── url.ts
│       ├── code.ts
│       ├── color.ts
│       ├── phone.ts
│       ├── email.ts
│       ├── date.ts
│       ├── address.ts
│       ├── name.ts
│       ├── number.ts
│       └── text.ts
├── content/
│   └── index.ts              # Copy event listener
├── offscreen/
│   ├── offscreen.html
│   └── clipboard.ts          # MV3-compliant clipboard access
├── popup/
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── globals.css           # Dark Glass Terminal theme
│   └── components/
│       ├── ClipPanel.tsx      # Scrollable history list
│       ├── ClipItem.tsx       # Individual item card
│       ├── ClipItemDetail.tsx # Expanded enriched view
│       ├── SearchBar.tsx      # Search input
│       ├── TypeFilter.tsx     # Filter pills
│       ├── Pinned.tsx         # Pinned items section
│       └── LicenseGate.tsx    # Pro feature gate
├── options/
│   ├── index.html
│   ├── main.tsx
│   └── App.tsx               # Settings page
├── shared/
│   ├── types.ts              # All TypeScript types
│   ├── detector.ts           # Type detection engine
│   ├── storage.ts            # chrome.storage wrapper
│   ├── messages.ts           # Typed message passing
│   ├── chrome.ts             # Chrome API helpers
│   └── license.ts            # Pro license validation
├── stores/
│   └── clipStore.ts          # Zustand store
├── lib/
│   └── utils.ts              # cn() utility
├── components/
│   └── ui/                   # shadcn/ui components
└── __tests__/
    ├── detector.test.ts
    └── enrichers.test.ts
```

## Design

The UI follows a **"Dark Glass Terminal"** aesthetic — dark frosted glass panels, monospace type for code/data, subtle glow accents per clip type, and micro-animations on item entrance.

The popup is fixed at 380x560px. Each clip type has a distinct color:
- URL → Blue (#3B82F6)
- Code → Green (#10B981)
- Phone → Amber (#F59E0B)
- Email → Purple (#8B5CF6)
- Date → Orange (#F97316)
- Address → Teal (#14B8A6)
- Name → Pink (#EC4899)
- Text → Neutral gray

## License

Private project. See `src/shared/license.ts` for the Pro tier scaffold.
