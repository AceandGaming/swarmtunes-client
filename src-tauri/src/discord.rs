use discord_rich_presence::{
    activity::{Activity, ActivityType, Assets, Button},
    DiscordIpc, DiscordIpcClient,
};

const CLIENT_ID: &str = "1397887833351655454";

pub fn start_discord() -> Result<DiscordIpcClient, Box<dyn std::error::Error>> {
    let mut discord = DiscordIpcClient::new(CLIENT_ID);

    discord.connect()?;

    Ok(discord)
}

pub fn update_activity(
    discord: &mut DiscordIpcClient,
    song_id: &str,
    details: &str,
    state: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    discord.set_activity(
        Activity::new()
            .activity_type(ActivityType::Listening)
            .details(details)
            .state(state)
            .assets(Assets::new().large_image("icon").large_text("Swarmtunes"))
            .buttons(vec![Button::new(
                "Listen on Swarmtunes",
                format!("https://swarmtunes.com/?song={}", song_id),
            )]),
    )?;

    Ok(())
}
