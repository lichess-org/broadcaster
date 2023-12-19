use std::path::{Path, PathBuf};

use notify::{EventKind, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use tauri::Window;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PgnUploadResponse {
    moves: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PgnUploaded {
    response: PgnUploadResponse,
    path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FileChangeEvent {
    paths: Vec<PathBuf>,
}

#[tauri::command]
pub fn start_watching_folder(
    window: Window,
    lichess_url: &str,
    api_token: &str,
    broadcast_round_id: &str,
    folder: &str,
) {
    window
        .emit("started_broadcast_thread", broadcast_round_id)
        .unwrap();

    let (tx, rx) = std::sync::mpsc::channel();

    let folder_to_watch = folder.to_string();

    std::thread::spawn(move || {
        let mut watcher = notify::recommended_watcher(
            move |res: Result<notify::Event, notify::Error>| match res {
                Ok(event) => {
                    if let EventKind::Access(_) = event.kind {
                        tx.send(FileChangeEvent { paths: event.paths }).unwrap();
                    }
                }
                Err(e) => {
                    println!("watch error: {e:?}");
                }
            },
        )
        .expect("Failed to create file watcher");

        watcher
            .watch(Path::new(&folder_to_watch), RecursiveMode::Recursive)
            .expect("Failed to watch folder");

        println!("started watching folder: {folder_to_watch:?}");
        loop {
            std::thread::sleep(std::time::Duration::from_secs(1));
        }
    });

    let lichess_url2 = lichess_url.to_string();
    let api_token2 = api_token.to_string();
    let round2 = broadcast_round_id.to_string();
    std::thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            println!("rx: {event:?}");
            window.emit("folder_contents_changed", &event).unwrap();

            for path in event.paths {
                let response = post_pgn_to_lichess(&lichess_url2, &api_token2, &round2, &path);
                window
                    .emit(
                        "pgn_uploaded_event",
                        PgnUploaded {
                            response,
                            path: path.to_str().unwrap().to_string(),
                        },
                    )
                    .unwrap();
            }
        }
    });
}

fn post_pgn_to_lichess(
    lichess_url: &str,
    token: &str,
    round: &str,
    path: &PathBuf,
) -> PgnUploadResponse {
    let client = reqwest::blocking::Client::new();
    client
        .post(format!("{lichess_url}/broadcast/round/{round}/push"))
        .bearer_auth(token)
        .body(std::fs::read_to_string(path).unwrap())
        .send()
        .unwrap()
        .json::<PgnUploadResponse>()
        .unwrap()
}
