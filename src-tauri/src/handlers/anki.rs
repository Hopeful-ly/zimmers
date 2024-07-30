use std::result::Result;

use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct AnkiConnectResponse<T> {
    result: Option<T>,
    error: Option<String>,
}

#[tauri::command]
pub async fn anki(data: String) -> Result<String, String> {
    let client = Client::new();

    println!("Sending to AnkiConnect: {}", data);
    let response_result = client
        .post("http://localhost:8765")
        .body(data)
        .header("Content-Type", "application/json")
        .send()
        .await;

    if response_result.is_err() {
        return Err("Failed to connect to AnkiConnect".into());
    }

    let response = response_result.unwrap();
    let response_result = response.text().await;

    if let Err(_) = response_result {
        return Err("Failed to parse AnkiConnect response".into());
    }

    let response_str = response_result.unwrap();

    println!("AnkiConnect response: {}", response_str);
    let result = Ok(response_str);
    result
}
