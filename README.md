## Development Setup

### Prerequisites

1. Follow prerequisities for installing Rust + Tauri here: https://tauri.app/v1/guides/getting-started/prerequisites
2. Install pnpm
   ```bash
    npm install -g pnpm
    ```

### Run

1. Start the mock Lichess endpoints (in a separate terminal)

    ```bash
    cd mock
    node serve.js
    ```

    http://0.0.0.0:3000/get-broadcast.json

    http://0.0.0.0:3000/post-pgn.json

2. Start the app

    ```bash
    pnpm install
    pnpm tauri dev
    ```
