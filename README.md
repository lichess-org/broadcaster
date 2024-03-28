# Lichess Broadcaster

This is a cross-platform desktop application for automatically uploading PGN files (chess game notation) from your local computer to a live [Lichess Broadcast](https://lichess.org/broadcast).

Some smart chess boards used in OTB (over the board) events can write PGN files to a folder on your computer. This application monitors that folder and uploads the PGN file in real-time using the [Lichess API](https://lichess.org/api). In practice, this means anyone with internet access can follow the ongoing OTB games live and with minimal additional effort from tournament organisers. Lichess freely provides the infrastructure to show the tournament games to thousands of spectators, which would otherwise be a costly or technically challenging task for organizers.

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
   ./scripts/release
   ```

1. Github workflow will build the app for each OS, create a release, and attach the artifacts.

1. Update the "Check for Updates" endpoint

   When ready to recommend the update, change [`version.json`](https://github.com/lichess-org/broadcaster/blob/main/updater/version.json)
