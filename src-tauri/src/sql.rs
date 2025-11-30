use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        );",
        kind: MigrationKind::Up,
    }]
}
