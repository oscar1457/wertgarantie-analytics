// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::time::{Duration, Instant};
use std::thread;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main").unwrap();
      let start_time = Instant::now();

      // We listen for the event from the frontend
      main_window.clone().listen("react-ready", move |_event| {
        let elapsed = start_time.elapsed();
        let min_duration = Duration::from_secs(3);

        // If less than 3 seconds have passed, wait for the remaining time
        if elapsed < min_duration {
          let remaining = min_duration - elapsed;
          thread::sleep(remaining);
        }

        // Close the splashscreen and show the main window
        splashscreen_window.close().unwrap();
        main_window.show().unwrap();
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
