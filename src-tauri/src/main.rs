#![warn(clippy::pedantic)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod oauth;
mod pgn;

use crate::oauth::start_oauth_flow;
use crate::pgn::start_watching_folder;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_oauth_flow,
            open_browser,
            start_watching_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_browser(url: String) {
    open::that_detached(url).expect("failed to open url");
}
