mod discord;

use discord::{start_discord, update_activity};
use std::sync::Mutex;
use tauri::Manager;

#[tauri::command]
fn update_metadata(
    title: String,
    subtitle: String,
    discord: tauri::State<'_, Mutex<discord_rich_presence::DiscordIpcClient>>,
) -> Result<(), String> {
    let mut client = discord.lock().map_err(|e| e.to_string())?;

    update_activity(&mut client, &title, &subtitle).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let discord = start_discord()?;
            app.manage(Mutex::new(discord));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
