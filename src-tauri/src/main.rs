#![warn(clippy::pedantic)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod oauth;

use crate::oauth::start_oauth_flow;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_path, start_oauth_flow,])
        .plugin(tauri_plugin_fs_watch::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_path(path: String) {
    open::that_detached(path).expect("failed to open path");
}
