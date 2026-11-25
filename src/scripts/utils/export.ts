import { downloadDir, join } from "@tauri-apps/api/path";
import { download } from "@tauri-apps/plugin-upload";
import { isTauri } from "@tauri-apps/api/core";
import { GetSongExportUrl } from "@ts/api/song";
import type { Song } from "@ts/features/song/model"
import Toasts from "@ui/toasts/state.svelte.ts"
import { HttpError } from "@ts/api/network"

async function ExportSongTauri(url: string, filename: string) {
    const absUrl = new URL(url, location.origin).href

    const path = await join(await downloadDir(), filename)

    try {
        await download(absUrl, path)
    }
    catch (e) {
        console.error(e)
    }
    
}

async function ExportSongWeb(url: string) {
    const a = document.createElement("a")
    a.href = url
    a.click()
    a.remove()
}

export async function ExportSong(song: Song) {
    let url;
    try {
        url = await GetSongExportUrl(song.id)
    }
    catch (e) {
        if (e instanceof HttpError) {
            if (e.code = "SONG_NOT_EXPORTABLE") {
                Toasts.Add("Song is not exportable", "failure")
                return
            }
        }

        console.error(e)
        Toasts.Add("A unknown error occurred", "failure")
        return
    }

    const clearToast = Toasts.AddPersistent("Exporting song...")

    try {
        if (isTauri()) {
            console.log("Exporting song for tauri")
            await ExportSongTauri(url, `${song.displayTitle} - ${song.displayCredits}.mp3`)
        }
        else {
            console.log("Exporting song for web")
            await ExportSongWeb(url)
        }
        Toasts.Add("Song exported", "success")
    }
    catch (e) {
        console.error(e)
        Toasts.Add("A unknown error occurred", "failure")
        return
    }
    finally {
        clearToast()
    }
}