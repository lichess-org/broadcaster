#![warn(clippy::pedantic)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::{Path, PathBuf};

use notify::{EventKind, RecursiveMode, Watcher};
use oauth::start_oauth_flow;
use serde::{Deserialize, Serialize};
use tauri::Window;
use utils::open_path;

mod oauth;
mod utils;

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
    ok: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FolderChangeEvent {
    kind: String,
    paths: Vec<PathBuf>,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            login_with_lichess,
            open_browser,
            start_watching_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_browser(url: String) {
    open_path(url);
}

#[tauri::command]
fn login_with_lichess(window: Window, lichess_url: String) {
    start_oauth_flow(window, lichess_url);
}

#[tauri::command]
fn start_watching_folder(
    window: Window,
    lichess_url: &str,
    api_token: &str,
    broadcast_round_id: &str,
    folder: &str,
) {
    println!("started watching folder: {folder:?}");
    let (tx, rx) = std::sync::mpsc::channel();

    let folder_to_watch = folder.to_string();

    std::thread::spawn(move || {
        let mut watcher = notify::recommended_watcher(
            move |res: Result<notify::Event, notify::Error>| match res {
                Ok(event) => match event.kind {
                    EventKind::Create(_) => {
                        println!("CREATE event: {event:?}");
                        tx.send(FolderChangeEvent {
                            kind: "create".to_string(),
                            paths: event.paths,
                        })
                        .unwrap();
                    }
                    EventKind::Modify(_) => {
                        println!("MODIFIED event: {event:?}");
                        tx.send(FolderChangeEvent {
                            kind: "modified".to_string(),
                            paths: event.paths,
                        })
                        .unwrap();
                    }
                    _ => {
                        println!("other event: {event:?}");
                    }
                },
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

    let lichess_url2 = lichess_url.to_string();
    let api_token2 = api_token.to_string();
    let round2 = broadcast_round_id.to_string();
    std::thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            println!("rx: {event:?}");
            window.emit("folder-contents-changed", &event).unwrap();

            for path in event.paths {
                post_pgn_to_lichess(&lichess_url2, &api_token2, &round2, path);
            }
        }
    });
}

fn post_pgn_to_lichess(
    lichess_url: &str,
    token: &str,
    round: &str,
    path: PathBuf,
) -> PgnUploadResponse {
    println!("posting pgn to lichess: {path:?}");

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
