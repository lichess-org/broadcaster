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

#### Testing

##### Simulate boards writing PGN to a folder:

1. In the app, select a Round and start a folder watch.
2. Run this to automatically write a bunch of PGN to the folder:

```bash
pnpm esrun sample-data/generate/index.ts sample-data/tournaments/simulated
```

## Formatting / Linting

```bash
pnpm dlx @biomejs/biome ci .
pnpm tsc
```

## Icon Generation

Given a source image file, generate the icon files for the app:

```bash
pnpm tauri icon public/lichess-favicon-1024.png
```

## Test Build

```bash
pnpm tauri build
```

Release artifacts are in `src-tauri/target/release/bundle/`

## Release

1. Tag the new version:

    ```bash
    git checkout main
    npm version 0.x.x
    git push origin main --tags
    ```

    Github workflow will build the app for each OS and attach them as artifacts to a draft release.

1. Manually edit the release once the builds are done, update the release notes, and publish.
