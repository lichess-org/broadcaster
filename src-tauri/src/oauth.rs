use oauth2::{
    basic::BasicClient, reqwest::http_client, AuthUrl, AuthorizationCode, ClientId, CsrfToken,
    PkceCodeChallenge, RedirectUrl, Scope, TokenUrl,
};
use tauri::{AppHandle, Manager};
use tiny_http::Server;

#[allow(clippy::needless_pass_by_value)]
#[tauri::command]
pub fn start_oauth_flow<R: tauri::Runtime>(
    app_handle: AppHandle<R>,
    oauth_url: String,
    token_url: String,
    scopes: Vec<String>,
) {
    let server = Server::http("0.0.0.0:0").unwrap();
    let port = server.server_addr().to_ip().unwrap().port();
    let localhost_url = format!("http://localhost:{port}/");
    println!("Local server started: {localhost_url}");

    let client = BasicClient::new(
        ClientId::new(app_handle.config().tauri.bundle.identifier.clone()),
        None,
        AuthUrl::new(oauth_url).unwrap(),
        Some(TokenUrl::new(token_url).unwrap()),
    )
    .set_redirect_uri(RedirectUrl::new(localhost_url).unwrap());

    let (code_challenge, code_verify) = PkceCodeChallenge::new_random_sha256();

    let (authorize_url, _) = client
        .authorize_url(CsrfToken::new_random)
        .add_scopes(scopes.iter().map(|s| Scope::new(s.to_string())))
        .set_pkce_challenge(code_challenge)
        .url();

    open::that_detached(authorize_url.to_string()).expect("failed to open url");

    std::thread::spawn(move || {
        if let Some(request) = server.incoming_requests().next() {
            let path = request.url().to_string();
            let parts = serde_urlencoded::from_str::<Vec<(String, String)>>(&path[2..]).unwrap();
            let code = if let Some((_, value)) = parts.iter().find(|(key, _)| key == "code") {
                value.to_string()
            } else {
                let html = generate_html_page("Failed to get code from the request.");
                let header = tiny_http::Header::from_bytes("Content-Type", "text/html").unwrap();
                let _ = request.respond(tiny_http::Response::from_string(html).with_header(header));
                return Err("Failed to get code from the request.".to_string());
            };

            let access_token = client
                .exchange_code(AuthorizationCode::new(code.to_string()))
                .set_pkce_verifier(code_verify)
                .request(http_client)
                .unwrap();

            app_handle
                .emit_all("event::update_access_token", access_token)
                .expect("failed to emit event");

            let html =
                generate_html_page("Thanks! You may now close this window and return to the app.");
            let header = tiny_http::Header::from_bytes("Content-Type", "text/html").unwrap();
            let _ = request.respond(tiny_http::Response::from_string(html).with_header(header));
        }
        Ok(())
    });
}

fn generate_html_page(message: &str) -> String {
    format!(
        r#"<!doctype html>
        <html lang="en">
        
        <head>
            <title>Lichess Broadcaster</title>
        </head>
        
        <body style="background-color: rgb(31 41 55);">
            <div style="padding: 1rem; display: flex; flex-direction: column;">
                <header style="margin-bottom: 3rem;">
                    <img src="https://raw.githubusercontent.com/lichess-org/lila/0b1089fae758088def573be94e5e88b65b706dc2/public/logo/lichess-discord.png" style="width: 3rem; display: inline-block;" alt="Lichess logo">
                </header>
                <h3 style="text-align: center; margin-top: 5rem; font-size: 1.25rem; font-weight: 600; color: rgb(229 231 235);">{message}</h3>
            </div>
        </body>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            }}
        </style>
        
        </html>"#
    )
}
