import PlaybackController from "@ts/playback"
import { ShareSongV1, ExportSong } from "@ts/api/song"
import { ContextMenuGroup, type ContextMenuOption } from "@ts/context-menu.svelte"
import { IconPlus, IconShare3, IconPlaylistAdd, IconFileExport } from "@tabler/icons-svelte-runes"
import type { Song } from "@ts/models/song"
import { AddToPlaylist, CopyToClipboard } from "@ts/ui/popup.svelte.ts"
import { auth } from "@ts/login.svelte"
import Toasts from "@ts/toast.svelte.ts"

export function CreateSongContextMenu(song: Song): ContextMenuOption[] {
    if (song.id == "swarmfm") {
        return []
    }

    return [
        {
            label: "Add to Queue",
            group: ContextMenuGroup.Queue,
            icon: IconPlus,
            Action: () => PlaybackController.AddToQueue(song)
        },
        {
            label: "Add to Playlist",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: () => AddToPlaylist(song),
            visible: auth.loggedIn
        },
        {
            label: "Share",
            group: ContextMenuGroup.Share,
            icon: IconShare3,
            Action: async () => {
                const url = "https://share.swarmtunes.com/?s=" + (await ShareSongV1(song.id))
                CopyToClipboard(url)
            }
        },
        {
            label: "Export",
            group: ContextMenuGroup.Share,
            icon: IconFileExport,
            Action: () => {
                const RemoveToast = Toasts.AddPersistent("Exporting...")
                try {
                    ExportSong(song.id)
                }
                finally {
                    RemoveToast()
                }
            }
        }
    ]
}