# Tech Stack

## Core Framework

- Electron (desktop app framework)
- electron-vite (build tooling)
- React 19 + TypeScript
- Vite 7

## UI & Styling

- Tailwind CSS 4
- shadcn/ui components

## State Management

- Zustand

## Audio & Media

- Howler.js (audio playback)
- music-metadata (metadata parsing)

## Performance

- react-virtuoso (virtualized lists)

## Data Persistence

- electron-store

## Testing

- Vitest (test runner)
- fast-check (property-based testing)
- @testing-library/react
- happy-dom

## Code Quality

- ESLint with TypeScript config
- Prettier

## Common Commands

```bash
# Development
npm run dev          # Start dev mode with hot reload

# Testing
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI

# Code Quality
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier formatting

# Build
npm run build        # Build for production
npm run build:win    # Package for Windows
npm run build:mac    # Package for macOS
npm run build:linux  # Package for Linux
```

## Code Style (Prettier)

- Single quotes
- No semicolons
- 100 char print width
- No trailing commas
