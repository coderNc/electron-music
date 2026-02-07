# Project Structure

```
local-music-player/
├── src/
│   ├── main/              # Main process (Node.js)
│   │   ├── services/      # File system, metadata, persistence
│   │   └── index.ts       # Main entry point
│   ├── preload/           # IPC bridge (context isolation)
│   │   └── index.ts       # Exposes safe APIs to renderer
│   ├── renderer/          # Renderer process (browser)
│   │   └── src/
│   │       ├── components/  # React components
│   │       ├── services/    # Audio playback, IPC client
│   │       ├── stores/      # Zustand stores
│   │       ├── hooks/       # Custom React hooks
│   │       ├── assets/      # CSS, images
│   │       └── test/        # Test setup
│   └── shared/            # Shared between processes
│       └── types/         # TypeScript interfaces
├── build/                 # Build resources (icons)
├── resources/             # App resources
└── out/                   # Build output
```

## Path Aliases

- `@main/*` → `src/main/*`
- `@renderer/*` → `src/renderer/src/*`
- `@shared/*` → `src/shared/*`

## Architecture Patterns

### Process Separation

- Main process: File system, metadata parsing, persistence (Node.js APIs)
- Preload: IPC bridge with context isolation
- Renderer: UI, audio playback, state management (browser APIs)

### Service Pattern

Services export both individual functions and a typed service object:

```typescript
export function doSomething(): void { ... }

export interface MyService {
  doSomething: typeof doSomething
}

export const myService: MyService = { doSomething }
```

### Testing Strategy

- Unit tests: Specific examples, edge cases, error conditions
- Property tests: Use fast-check for invariant verification (100+ iterations)
- Test files: `*.test.ts` alongside source files
- Property test label format: `// Feature: local-music-player, Property {n}: {description}`

### Type Definitions

All shared types go in `src/shared/types/index.ts`. Key interfaces:

- `TrackMetadata` - Audio file metadata
- `FolderInfo` - Scanned folder info
- `Playlist` - User playlists
- `PlaybackState` - Current playback state
- `AppSettings` - User preferences
