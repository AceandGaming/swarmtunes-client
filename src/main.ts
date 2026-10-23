import "@css/themes.css"
import "@css/styles.css"
import "@css/components.css"
import "@css/custom.css"

import App from "@ts/app.svelte"
import { mount } from "svelte"
import { Initialize as InitializeLogin } from "@ts/login.svelte.ts"
import { InitMediaSession } from "@ts/media-session.ts"
import { ClearParams, GetSongId } from "@ts/urlbar.svelte"
import PlaybackController from "@ts/playback"
import SongProvider from "@ts/song-provider"
import { LoadEmotes } from "@ts/emotes.ts"

import { isTauri } from '@tauri-apps/api/core'
import { platform } from '@tauri-apps/plugin-os';

document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=none; path=/"

function Main() {
    const songId = GetSongId()
    ClearParams()

    InitializeLogin()
    InitMediaSession()
    mount(App, { target: document.body })

    LoadEmotes()
    if (songId) {
        SongProvider.Get(songId).then(song => {
            if (song) {
                console.log("Found song", song)
                PlaybackController.Play({ song })
            }
        })
    }
}
async function Update() {
    const { check } = await import("@tauri-apps/plugin-updater")
    let update
    try {
        update = await check()
    } catch (e) {
        console.error(e)
    }
    if (!update) {
        return Main()
    }

    const {default: UpdateScreen} = await import("@ts/update-screen.svelte")
    mount(UpdateScreen, { target: document.body })

    const { relaunch } = await import("@tauri-apps/plugin-process")

    await update.downloadAndInstall();
    await relaunch();
}

if (isTauri() && platform() == "windows") {
    Update()
}
else {
    Main()
}

