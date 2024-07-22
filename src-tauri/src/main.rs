#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

use handlers::lemmatize::{initialize_spacy, lemmatize};

mod clipboard;
mod handlers;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            clipboard::run_clipboard_listener(app.app_handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![lemmatize, initialize_spacy])
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    ()
}
