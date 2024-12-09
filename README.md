# Lichess Broadcaster

This is a cross-platform desktop application for automatically uploading PGN files (chess game notation) from your local computer to a live [Lichess Broadcast](https://lichess.org/broadcast).

Some smart chess boards used in OTB (over the board) events can write PGN files to a folder on your computer. This application monitors that folder and uploads the PGN file in real-time using the [Lichess API](https://lichess.org/api). In practice, this means anyone with internet access can follow the ongoing OTB games live and with minimal additional effort from tournament organisers. Lichess freely provides the infrastructure to show the tournament games to thousands of spectators, which would otherwise be a costly or technically challenging task for organizers.

![image](https://github.com/lichess-org/broadcaster/assets/271432/2ec27912-0ef2-4ac6-9870-130e01f444aa)

## About

This app is built with [Tauri](https://tauri.app/), a framework for building desktop apps with web technologies. It's written in Rust and TypeScript.

Contributions are welcome. Please read our [Contributing](https://lichess.org/help/contribute) guide if you're interested in helping with this or our other projects.

## Download

To download the latest version, go to the [Releases](https://github.com/lichess-org/broadcaster/releases) and download the installer for your operating system.

## Code signing policy

This program uses free code signing provided by [SignPath.io](https://signpath.io?utm_source=foundation&utm_medium=github&utm_campaign=lichess) and a certificate by the [SignPath Foundation](https://signpath.org?utm_source=foundation&utm_medium=github&utm_campaign=lichess)

## Privacy Policy

This program will not transfer any information to other networked systems unless specifically requested by the user or the person installing or operating it. See the Lichess [Privacy Policy](https://lichess.org/privacy).

## Development Setup

### Prerequisites

1. Follow steps for installing Rust + Tauri here: https://tauri.app/start/prerequisites/
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

### Testing

#### To seed a bunch of test broadcasts with rounds:

```bash
pnpx tsx sample-data/generate/add-broadcasts.ts
```

#### To simulate boards writing PGN to a folder:

1. In the app, select a Round and start a folder watch.
2. Run this to automatically write a bunch of PGN to the folder:

```bash
pnpx tsx sample-data/generate/index.ts games path/to/folder
```

#### Test errors by writing bad PGN files:

```bash
pnpx tsx sample-data/generate/index.ts errors path/to/folder
```

### Icon Generation

Given a source image file, generate the icon files for the app:

```bash
convert src/assets/app-icon.png -size 702x702 xc:none -fill white -draw "roundrectangle 0,0,702,702,351,351" src/assets/mask.png
convert src/assets/app-icon.png \( src/assets/mask-1.png -alpha off \) -compose copy_opacity -composite src/assets/rounded.png
pnpm tauri icon src/assets/rounded.png
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

2. Github workflow will build the app for each OS, create a release, and attach the artifacts.

   - Approve the signing request in the SignPath dashboard when the workflow gets to that step.

3. When ready to recommend the update, update the ["Check for Updates" endpoint](https://lichess-org.github.io/broadcaster/version.json) ([source](https://github.com/lichess-org/broadcaster/blob/main/updater/version.json)):

   ```bash
   python scripts/updater.py
   ```

   Then push the change to Github. Workflow will automatically publish to Github Pages.
