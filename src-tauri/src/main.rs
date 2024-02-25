#![warn(clippy::pedantic)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod oauth;

use reqwest::{
    blocking::{Client, RequestBuilder},
    header::{AUTHORIZATION, USER_AGENT},
};
use serde::{Deserialize, Serialize};
use std::{
    collections::{HashMap, VecDeque},
    fs::File,
    io::Read,
    sync::{Arc, Mutex},
};
use tauri::Manager;

use crate::oauth::start_oauth_flow;

#[derive(Default)]
struct UploadQueue {
    jobs: VecDeque<UploadJob>,
}

#[derive(Debug)]
struct UploadJob {
    files: Vec<String>,
    url: String,
    api_token: String,
    user_agent: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct GamePushResult {
    moves: Option<u32>,
    error: Option<String>,
    tags: HashMap<String, String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct LichessPushResponse {
    games: Vec<GamePushResult>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct PgnPushResult {
    response: LichessPushResponse,
    files: Vec<String>,
}

fn main() {
    let upload_queue_state = Arc::new(Mutex::new(UploadQueue::default()));
    let arced_upload_queue = Arc::clone(&upload_queue_state);

    tauri::Builder::default()
        .manage(upload_queue_state)
        .setup(|app| {
            let app_handle = app.handle();

            std::thread::spawn(move || loop {
                let mut queue = arced_upload_queue.lock().unwrap();

                let queue_size = queue.jobs.len();
                app_handle
                    .emit_all("event::queue_size", queue_size)
                    .expect("failed to emit event");

                let next_job = queue.jobs.pop_front();
                drop(queue);

                match next_job {
                    Some(job) => match handle_upload_job(&job) {
                        Ok(response) => {
                            app_handle
                                .emit_all(
                                    "event::upload_success",
                                    PgnPushResult {
                                        response,
                                        files: job.files,
                                    },
                                )
                                .expect("failed to emit event");
                        }
                        Err(err) => {
                            app_handle
                                .emit_all("event::upload_error", err)
                                .expect("failed to emit event");
                        }
                    },
                    None => std::thread::sleep(std::time::Duration::from_secs(1)),
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            add_to_queue,
            open_path,
            start_oauth_flow
        ])
        .plugin(tauri_plugin_fs_watch::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn read_pgn_file(path: &str) -> Result<String, String> {
    let mut file = match File::open(path) {
        Ok(file) => file,
        Err(err) => return Err(err.to_string()),
    };

    let mut file_content = String::new();
    if let Err(err) = file.read_to_string(&mut file_content) {
        return Err(err.to_string());
    }

    Ok(file_content)
}

fn handle_upload_job(job: &UploadJob) -> Result<LichessPushResponse, String> {
    let pgns = job
        .files
        .iter()
        .map(|file| read_pgn_file(file))
        .collect::<Result<Vec<String>, String>>()?;

    post_pgn_to_lichess(&job.url, pgns.join("\n\n"), &job.api_token, &job.user_agent)
}

fn post_pgn_to_lichess(
    url: &str,
    pgn_content: String,
    api_token: &str,
    user_agent: &str,
) -> Result<LichessPushResponse, String> {
    let client = Client::new();
    let request_builder: RequestBuilder = client
        .post(url)
        .header(AUTHORIZATION, format!("Bearer {api_token}"))
        .header(USER_AGENT, user_agent)
        .body(pgn_content);

    let response = match request_builder.send() {
        Ok(response) => response,
        Err(err) => return Err(format!("Error sending request: {err}")),
    };

    if response.status().is_success() {
        match response.json::<LichessPushResponse>() {
            Ok(response) => Ok(response),
            Err(err) => Err(format!("Error parsing response: {err}")),
        }
    } else {
        Err(format!(
            "Error pushing PGN file to Lichess: {:?} - {:?}",
            response.status(),
            response.text()
        ))
    }
}

#[tauri::command]
fn open_path(path: String) {
    open::that_in_background(path);
}

#[allow(clippy::needless_pass_by_value)]
#[tauri::command]
fn add_to_queue(
    files: Vec<String>,
    url: &str,
    api_token: &str,
    user_agent: &str,
    state: tauri::State<'_, Arc<Mutex<UploadQueue>>>,
) {
    let mut queue = state.lock().unwrap();

    queue.jobs.push_back(UploadJob {
        files,
        url: url.to_string(),
        api_token: api_token.to_string(),
        user_agent: user_agent.to_string(),
    });
}
