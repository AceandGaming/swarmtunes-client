import "@css/themes.css"
import "@css/styles.css"
import "@css/components.css"
import "@css/custom.css"

import App from "./app.svelte"
import { mount } from "svelte"
import { Initialize as InitializeLogin } from "@ts/state/auth.svelte.ts"
import { InitMediaSession } from "@ts/features/playback/media-session.ts"
import PlaybackController from "@ts/features/playback/playback"
import SongProvider from "@ts/features/song/provider"
import { LoadEmotes } from "@ts/emotes.ts"

import { isTauri } from '@tauri-apps/api/core'
import { platform } from '@tauri-apps/plugin-os';
import { url } from "@ts/environment/location.svelte"

document.cookie = "cookie=A cookie for Neuro-sama; max-age=260000; secure; samesite=none; path=/"

function Main() {
    const songId = url.searchParams.get("song")
    window.history.replaceState({}, "", url.href)

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

    const {default: UpdateScreen} = await import("./update-screen.svelte")
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

