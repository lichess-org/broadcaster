use oauth2::{
    basic::BasicClient, reqwest::http_client, AuthUrl, AuthorizationCode, ClientId, CsrfToken,
    PkceCodeChallenge, RedirectUrl, Scope, TokenUrl,
};
use tauri::Window;
use tiny_http::Server;

const OAUTH_CLIENT_ID: &str = "github.com/fitztrev/broadcaster";

#[tauri::command]
pub fn start_oauth_flow(window: Window, lichess_url: &str) {
    let server = Server::http("0.0.0.0:0").unwrap();
    let port = server.server_addr().to_ip().unwrap().port();
    let localhost_url = format!("http://localhost:{port}/");
    println!("Local server started: {localhost_url}");

    let client = BasicClient::new(
        ClientId::new(OAUTH_CLIENT_ID.to_string()),
        None,
        AuthUrl::new(format!("{lichess_url}/oauth")).unwrap(),
        Some(TokenUrl::new(format!("{lichess_url}/api/token")).unwrap()),
    )
    .set_redirect_uri(RedirectUrl::new(localhost_url).unwrap());

    let (code_challenge, code_verify) = PkceCodeChallenge::new_random_sha256();

    let (authorize_url, _) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("study:read".to_string()))
        .add_scope(Scope::new("study:write".to_string()))
        .set_pkce_challenge(code_challenge)
        .url();

    open::that_detached(authorize_url.to_string()).expect("failed to open url");

    std::thread::spawn(move || {
        if let Some(request) = server.incoming_requests().next() {
            let path = request.url().to_string();
            let parts = serde_urlencoded::from_str::<Vec<(String, String)>>(&path[2..]).unwrap();
            let code = parts
                .iter()
                .find(|(key, _)| key == "code")
                .unwrap()
                .1
                .to_string();

            let access_token = client
                .exchange_code(AuthorizationCode::new(code.to_string()))
                .set_pkce_verifier(code_verify)
                .request(http_client)
                .unwrap();

            window
                .emit("event::update_access_token", access_token)
                .unwrap();

            let _ = request.respond(tiny_http::Response::from_string(
                "Thanks! You may now close this window and return to the app.",
            ));
        }
    });
}
