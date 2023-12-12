// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

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

#[tauri::command]
fn get_broadcast_by_token(token: &str) -> BroadcastResponse {
    let url = "https://eoz4efc1xj7c8cl.m.pipedream.net/api/broadcast-by-token";
    let client = reqwest::blocking::Client::new();
    let res = client
        .get(url)
        .bearer_auth(token)
        .send()
        .unwrap()
        .json::<BroadcastResponse>()
        .unwrap();

    res
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_broadcast_by_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
