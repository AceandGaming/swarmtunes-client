import PlaybackController from "@ts/features/playback/playback"
import { ShareSongV1, ExportSong } from "@ts/api/song"
import { ContextMenuGroup, type ContextMenuOption } from "@ui/context-menu/state.svelte.ts"
import { IconPlus, IconShare3, IconPlaylistAdd, IconFileExport, IconEdit } from "@tabler/icons-svelte-runes"
import type { Song } from "@ts/features/song/model"
import { AddToPlaylist, CopyToClipboard, EditSong  } from "@ui/popup/state.svelte.ts"
import { auth } from "@ts/state/auth.svelte.ts"
import Toasts from "@ui/toasts/state.svelte.ts"

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
        },
        {
            label: "Edit Song",
            group: ContextMenuGroup.Admin,
            icon: IconEdit,
            Action: () => EditSong(song)
        }
    ]
}