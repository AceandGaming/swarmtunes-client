import type { Component } from "svelte"
import { Playlist } from "@ts/features/playlist/model"
import type { Song } from "@ts/features/song/model"

import LoginPopup from "@ui/popup/dialogs/login.svelte"
import ConfirmPopup from "@ui/popup/dialogs/confirm-action.svelte"
import SelectPlaylistPopup from "@ui/popup/dialogs/select-playlist.svelte"
import CopyLinkPopup from "@ui/popup/dialogs/copy-link.svelte"
import CreatePlaylistPopup from "@ui/popup/dialogs/create-playlist.svelte"
import RenamePlaylistPopup from "@ui/popup/dialogs/rename-playlist.svelte"
import AddToPlaylistPopup from "@ui/popup/dialogs/add-to-playlist.svelte"
import EditSongPopup from "@ui/popup/dialogs/edit-song.svelte"

import Toasts from "@ui/toasts/state.svelte.ts"


type PopupRequest = {
    component: Component<any>
    props?: Record<string, unknown>
}

let currentPopup: PopupRequest | undefined = $state.raw()

export function GetPopup() {
    return currentPopup
}

export function ShowLogin() {
    currentPopup = {
        component: LoginPopup
    }
}
export function ConfirmAction(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        currentPopup = {
            component: ConfirmPopup,
            props: {
                message,
                resolve
            }
        }
    })
}
export function SelectPlaylist(): Promise<Playlist | undefined> {
    return new Promise((resolve) => {
        currentPopup = {
            component: SelectPlaylistPopup,
            props: {
                resolve
            }
        }
    })
}
export async function CopyToClipboard(link: string) {
    try {
        await navigator.clipboard.writeText(link)
        Toasts.Add("Copied to clipboard", "success")
    }
    catch {
        await new Promise((resolve) => {
            currentPopup = {
                component: CopyLinkPopup,
                props: {
                    resolve,
                    link
                }
            }
        })
    }
}
export function CreatePlaylist() {
    currentPopup = {
        component: CreatePlaylistPopup
    }
}
export function RenamePlaylist(playlist: Playlist) {
    currentPopup = {
        component: RenamePlaylistPopup,
        props: {
            playlist
        }
    }
}
export function AddToPlaylist(song: Song) {
    currentPopup = {
        component: AddToPlaylistPopup,
        props: {
            song
        }
    }
}
export function EditSong(song: Song) {
    currentPopup = {
        component: EditSongPopup,
        props: {
            song
        }
    }
}