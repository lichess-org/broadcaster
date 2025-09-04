use tauri::{AppHandle, Manager};
use tauri_plugin_deep_link::DeepLinkExt;

pub fn run() {
    let _ = fix_path_env::fix();

    let mut builder = tauri::Builder::default();

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
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![open_dev_tools])
        .setup(|app| {
            if tauri::is_dev() {
                let window = app.get_webview_window("main").expect("no main window");
                window.open_devtools();
            }

            app.deep_link().register_all()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[allow(clippy::needless_pass_by_value)]
#[tauri::command]
fn open_dev_tools(app_handle: AppHandle) {
    let window = app_handle
        .get_webview_window("main")
        .expect("no main window");
    if window.is_devtools_open() {
        window.close_devtools();
    } else {
        window.open_devtools();
    }
}
