// Import necessary libraries
use std::process::Command;
use tauri::command;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// A simple greeting function (you can keep this)
#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Function to invoke the Go code (yt-dlp or your Go logic)
#[command]
fn yt_stream_link(video_id: String) -> String {
    // Running Go code (adjust the path to where your Go binary is or use `go run`)
    let output = Command::new("go")
        .arg("run")
        .arg("backend/main.go") // This path should point to your Go code (relative to the Rust project root)
        .arg(video_id)           // Pass the video ID as an argument to Go
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                // Return the output of the Go code (the stream URL)
                String::from_utf8_lossy(&output.stdout).to_string()
            } else {
                // If Go execution fails, return the error
                format!("Error: {}", String::from_utf8_lossy(&output.stderr))
            }
        }
        Err(e) => format!("Failed to execute Go code: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init()) // Register the file system plugin here if needed
        .invoke_handler(tauri::generate_handler![greet, yt_stream_link]) // Add yt_stream_link to Tauri handler
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
