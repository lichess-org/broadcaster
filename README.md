# Lichess Broadcaster

This is a cross-platform desktop application for automatically uploading PGN from your local computer to a live [Lichess Broadcast](https://lichess.org/broadcast).

Some smart chess boards can write PGN files to a folder on your computer. This app watches that folder and uploads the PGN in real-time using the [Lichess API](https://lichess.org/api).

![image](https://github.com/lichess-org/broadcaster/assets/271432/2ec27912-0ef2-4ac6-9870-130e01f444aa)

## About

This app is built with [Tauri](https://tauri.app/), a framework for building desktop apps with web technologies. It's written in Rust and TypeScript.

Contributions are welcome. Please read our [Contributing](https://lichess.org/help/contribute) guide if you're interested in helping with this or our other projects.

## Download

To download the latest version, go to the [Releases](https://github.com/lichess-org/broadcaster/releases) and download the installer for your operating system.

## Development Setup

### Prerequisites

1. Follow steps for installing Rust + Tauri here: https://tauri.app/v1/guides/getting-started/prerequisites
2. Install pnpm
   ```bash
    npm install -g pnpm
   ```

### Run

```bash
pnpm install
pnpm tauri dev
```

### Formatting / Linting / Tests

```bash
pnpm format
pnpm tsc

pnpm test
# or
pnpm test:watch
```

### PGN Testing

#### Simulate boards writing PGN to a folder:

1. In the app, select a Round and start a folder watch.
2. Run this to automatically write a bunch of PGN to the folder:

```bash
pnpm esrun sample-data/generate/index.ts games path/to/folder
```

Test errors by writing bad PGN files:

```bash
pnpm esrun sample-data/generate/index.ts errors path/to/folder
```

### Icon Generation

Given a source image file, generate the icon files for the app:

```bash
pnpm tauri icon public/lichess-favicon-1024.png
```

### Test Release Build

```bash
pnpm tauri build
```

Release artifacts are in `src-tauri/target/release/bundle/`

## Release (for maintainers)

1. Tag the new version:

   ```bash
   git checkout main
   npm version 0.x.x
   git push origin main --tags
   ```

1. Github workflow will build the app for each OS, create a release, and attach the artifacts.
