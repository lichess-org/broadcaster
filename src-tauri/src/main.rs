// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::{Path, PathBuf};

use notify::{EventKind, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use tauri::Window;

#[derive(Serialize, Deserialize, Debug)]
struct BroadcastResponse {
    tour: Tournament,
    rounds: Vec<Round>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Tournament {
    id: String,
    name: String,
    description: String,
    slug: String,
    url: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Round {
    id: String,
    name: String,
    slug: String,
    url: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct PgnUploadResponse {
    ok: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FolderChangeEvent {
    kind: String,
    paths: Vec<PathBuf>,
}

#[tauri::command]
fn get_broadcast_by_token(token: &str) -> BroadcastResponse {
    let client = reqwest::blocking::Client::new();
    client
        .get("http://localhost:3000/get-broadcast.json")
        .bearer_auth(token)
        .send()
        .unwrap()
        .json::<BroadcastResponse>()
        .unwrap()
}

#[tauri::command]
fn start_watching_folder(window: Window, token: &str, round: &str, folder: &str) {
    println!("started watching folder: {folder:?}");
    let (tx, rx) = std::sync::mpsc::channel();

    let folder_to_watch = folder.to_string();

    std::thread::spawn(move || {
        let mut watcher = notify::recommended_watcher(
            move |res: Result<notify::Event, notify::Error>| match res {
                Ok(event) => {
                    println!("watch event: {event:?}");

                    match event.kind {
                        EventKind::Create(_) => {
                            tx.send(FolderChangeEvent {
                                kind: "create".to_string(),
                                paths: event.paths,
                            })
                            .unwrap();
                        }
                        EventKind::Modify(_) => {
                            tx.send(FolderChangeEvent {
                                kind: "modified".to_string(),
                                paths: event.paths,
                            })
                            .unwrap();
                        }
                        _ => {
                            println!("other event");
                        }
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

        loop {
            std::thread::sleep(std::time::Duration::from_secs(1));
        }
    });

    let token2 = token.to_string();
    let round2 = round.to_string();
    std::thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            println!("rx: {event:?}");
            window.emit("folder-contents-changed", &event).unwrap();

            for path in event.paths {
                post_pgn_to_lichess(&token2, &round2, path);
            }
        }
    });
}

fn post_pgn_to_lichess(token: &str, round: &str, path: PathBuf) -> PgnUploadResponse {
    println!("posting pgn to lichess: {path:?}");

    let client = reqwest::blocking::Client::new();
    client
        .post(format!("http://localhost:3000/post-pgn.json?round={round}"))
        .bearer_auth(token)
        .body(std::fs::read_to_string(path).unwrap())
        .send()
        .unwrap()
        .json::<PgnUploadResponse>()
        .unwrap()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_broadcast_by_token,
            start_watching_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
