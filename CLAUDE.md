# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lichess Broadcaster is a cross-platform desktop application built with Tauri (Rust + TypeScript) that automatically uploads PGN files from local folders to Lichess Broadcasts in real-time. It monitors folders where chess boards write PGN files and uploads them via the Lichess API, enabling live streaming of over-the-board tournaments.

## Technology Stack

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS + Vite
- **Backend**: Rust (Tauri v2)
- **State Management**: Pinia with persistence via sqlite
- **Routing**: Vue Router
- **API Client**: openapi-fetch with @lichess-org/types
- **Testing**: Vitest with jsdom

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development environment (starts Tauri app)
pnpm tauri dev

# Type checking
pnpm tsc

# Build for production
pnpm build

# Format code
pnpm format

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Architecture

### Core Application Flow

1. **Authentication**: OAuth flow via Tauri plugin (`src/stores/user.ts`) with token persistence
2. **Deep Links**: Handle `lichess-broadcaster://` URLs to navigate to broadcasts/rounds (`src/deep-links.ts`)
3. **Folder Watching**: Use Tauri FS plugin to monitor PGN files with 1s debounce (`src/components/FolderWatcher.vue`)
4. **Upload Logic**: Aggregate PGN files and push to Lichess API (`src/upload.ts`)

### File Upload Priority

The app handles two upload modes:

- **Multi-game mode**: If `games.pgn` exists, it's used exclusively (ignores individual game files)
- **Individual mode**: Upload all `game-*.pgn` files sorted by game ID

Multi-game PGN files also get force-updated every 60 seconds to ensure sync.

### Key Stores (Pinia)

- **user**: Authentication state, access tokens, username
- **settings**: Lichess URL, app version
- **logs**: Application logs with color-coded messages and error notifications
- **status**: Track active folder watches per round
- **favorites**: User's favorited broadcasts

### API Client

The `lichessApiClient` in `src/client.ts` wraps openapi-fetch with:

- Automatic Authorization header from user store
- Custom User-Agent format: `{version} as:{username}`
- Uses Tauri's fetch plugin for HTTP requests
- Type-safe API calls via @lichess-org/types

### Routing

Routes mirror Lichess broadcast URLs:

- `/` - Status/Dashboard
- `/find-broadcast` - Search broadcasts
- `/broadcast/by/:user` - User's broadcasts
- `/broadcast/:ts/:rs/:id` - Specific round view
- `/settings` - App settings

### Tauri Rust Backend

The Rust side (`src-tauri/src/lib.rs`) initializes:

- Single instance enforcement (desktop only)
- Deep link registration (non-macOS)
- All Tauri plugins (fs, http, dialog, updater, etc.)
- DevTools in development mode
- Custom command: `open_dev_tools`

## Testing Utilities

The repository includes test data generators in `sample-data/generate/`:

```bash
# Create test broadcasts with rounds
pnpx tsx sample-data/generate/add-broadcasts.ts

# Simulate boards writing PGN to a folder
pnpx tsx sample-data/generate/index.ts games path/to/folder

# Test multi-game PGN priority
pnpx tsx sample-data/generate/index.ts multigame path/to/folder

# Test error handling with bad PGN
pnpx tsx sample-data/generate/index.ts errors path/to/folder
```

## Important Implementation Details

### PGN File Watching

- Watch debounce: 1000ms
- Upload queue processes modified files every 1000ms
- Recursive directory watching enabled
- Filter events: only process write/create/modify (ignore metadata/read-only access)

### Error Handling

- API errors are logged to the logs store with red color
- Desktop notifications sent for errors
- Per-game errors from Lichess API are extracted and logged individually
- Success metrics tracked: games uploaded, moves added

### State Persistence

User, settings, and favorites stores use sqlite to persist data across app restarts.

### Type Safety

The project uses @lichess-org/types for full type safety with the Lichess API. All API operations have typed request/response bodies.
