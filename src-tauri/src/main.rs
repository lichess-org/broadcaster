#![warn(clippy::pedantic)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod oauth;

use tauri::{AppHandle, Manager};

use crate::oauth::start_oauth_flow;

fn main() {
    let _ = fix_path_env::fix();

    let mut builder = tauri::Builder::default().plugin(tauri_plugin_opener::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }

    builder
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![open_dev_tools, start_oauth_flow])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[allow(clippy::needless_pass_by_value)]
#[tauri::command]
fn open_dev_tools(app_handle: AppHandle) {
    let window = app_handle.get_webview_window("main").unwrap();
    if window.is_devtools_open() {
        window.close_devtools();
    } else {
        window.open_devtools();
    }
}
