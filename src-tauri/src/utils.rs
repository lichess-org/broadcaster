/// Opens a URL or file path in the OS default application
/// <https://github.com/fitztrev/lichess-tauri/issues/26>
/// implementing solution from: <https://github.com/tauri-apps/tauri/issues/6172#issuecomment-1557017115>
pub fn open_path(path: String) {
    // `open` required to run in separate thread, to avoid blocking on some
    // platforms (eg Fedora38 blocks)
    std::thread::spawn(|| {
        for mut cmd in open::commands(path) {
            // required to set path to good one to use `open` on Ubuntu 22
            // (otherwise can be permission error)
            cmd.current_dir(std::env::temp_dir());
            if cmd.status().is_ok() {
                break;
            };
        }
    });
}
