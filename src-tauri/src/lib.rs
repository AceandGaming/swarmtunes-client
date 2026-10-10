mod discord;

use discord::{start_discord, update_activity};
use std::sync::Mutex;
use tauri::Manager;

struct DiscordState(Mutex<Option<discord_rich_presence::DiscordIpcClient>>);

fn update_discord(id: &str, title: &str, subtitle: &str, discord: &tauri::State<'_, DiscordState>) {
    let Ok(mut guard) = discord.0.lock() else {
        log::error!("Discord: failed to acquire state lock");
        return;
    };

    if let Some(client) = guard.as_mut() {
        if update_activity(client, id, title, subtitle).is_ok() {
            return;
        }

        log::warn!("Discord: activity update failed");
    }

    *guard = None;

    let mut client = match start_discord() {
        Ok(client) => client,
        Err(error) => {
            log::warn!("Discord: connection failed: {error}");
            return;
        }
    };

    match update_activity(&mut client, id, title, subtitle) {
        Ok(()) => {
            log::info!("Discord: connected and activity updated");
            *guard = Some(client);
        }
        Err(error) => {
            log::error!("Discord: activity update failed after reconnect: {error}");
        }
    }
}

#[tauri::command]
fn update_metadata(
    id: String,
    title: String,
    subtitle: String,
    discord: tauri::State<'_, DiscordState>,
) {
    update_discord(&id, &title, &subtitle, &discord);
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

            app.manage(DiscordState(Mutex::new(None)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
