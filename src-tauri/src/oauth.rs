use std::borrow::Cow;

use reqwest::Url;
use serde::{Deserialize, Serialize};
use tauri::Window;
use tauri_plugin_oauth::OauthConfig;

const OAUTH_CLIENT_ID: &str = "github.com/fitztrev/pgn-broadcaster";

#[derive(Serialize, Deserialize, Debug, Clone)]
struct AccessTokenResponse {
    token_type: String,
    access_token: String,
    expires_in: i32,
}

pub fn start_oauth_flow(window: Window, lichess_url: String) {
    let (code_challenge, code_verify) = oauth2::PkceCodeChallenge::new_random_sha256();

    let lichess_url_copy = lichess_url.clone();

    let port = tauri_plugin_oauth::start_with_config(
        OauthConfig {
            ports: None,
            response: Some(Cow::Borrowed(include_str!("../public/oauth_response.html"))),
        },
        move |url| {
            let url = Url::parse(&url).unwrap();
            let code = url.query_pairs().find(|(key, _)| key == "code").unwrap().1;

            let access_token = reqwest::blocking::Client::new()
                .post(format!("{lichess_url}/api/token"))
                .form(&[
                    ("grant_type", "authorization_code"),
                    ("client_id", OAUTH_CLIENT_ID),
                    ("code", code.to_string().as_str()),
                    (
                        "redirect_uri",
                        format!("http://localhost:{}/", url.port().unwrap()).as_str(),
                    ),
                    ("code_verifier", code_verify.secret()),
                ])
                .send()
                .unwrap()
                .json::<AccessTokenResponse>()
                .unwrap();
            window.emit("update_access_token", access_token).unwrap();
        },
    )
    .unwrap();

    let redirect_url = format!("http://localhost:{port}/");
    println!("Local server started: {redirect_url}");

    let url = format!(
        "{}/oauth?response_type=code&client_id={}&redirect_uri={}&code_challenge_method=S256&code_challenge={}&scope={}",
        lichess_url_copy,
        OAUTH_CLIENT_ID,
        redirect_url,
        code_challenge.as_str(),
        ["study:read", "study:write"].join(" ")
    );

    open::that_detached(url).expect("failed to open url");
}
