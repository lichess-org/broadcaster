use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_logs_table",
            sql: "CREATE TABLE logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('info', 'error')),
                message TEXT NOT NULL,
                broadcast_tournament_id TEXT,
                round_id TEXT,
                game_id TEXT
            );
            CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
            CREATE INDEX idx_logs_type ON logs(type);
            CREATE INDEX idx_logs_round_id ON logs(round_id);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_settings_table",
            sql: "CREATE TABLE settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            INSERT INTO settings (key, value) VALUES ('lichess_url', 'https://lichess.org');",
            kind: MigrationKind::Up,
        },
    ]
}
