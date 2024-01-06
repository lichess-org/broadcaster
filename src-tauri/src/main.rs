#![warn(clippy::pedantic)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod oauth;

use tauri::{api::process::Command, Env};

use crate::oauth::start_oauth_flow;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_path,
            open_with_xdg_open,
            open_with_gio,
            start_oauth_flow,
        ])
        .plugin(tauri_plugin_fs_watch::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_path(path: String) {
    open::that_in_background(path);
}

#[tauri::command]
fn open_with_xdg_open(path: String) {
    let binary_path = tauri::api::process::current_binary(&Env::default()).unwrap();
    let parent = binary_path.parent().unwrap().to_path_buf();

    Command::new("xdg-open")
        .args([path])
        .current_dir(parent)
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn open_with_gio(path: &str) {
    let binary_path = tauri::api::process::current_binary(&Env::default()).unwrap();
    let parent = binary_path.parent().unwrap().to_path_buf();

    Command::new("gio")
        .args(["open", &path])
        .current_dir(parent)
        .output()
        .expect("failed to execute process");
}
