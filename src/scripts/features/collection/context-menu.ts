import PlaybackController from "@ts/features/playback/playback"
import PlaylistProvider from "@ts/features/playlist/provider"
import type { Collection } from "@ts/features/collection/model"
import { ContextMenuGroup, type ContextMenuOption } from "@ui/context-menu/state.svelte.ts"
import { IconPlaylistAdd, IconPlayerPlayFilled } from "@tabler/icons-svelte-runes"
import { auth } from "@ts/state/auth.svelte.ts"
import Toasts from "@ui/toasts/state.svelte.ts"

export function CreateCollectionContextMenu(collection: Collection): ContextMenuOption[] {
    return [
        {
            label: "Play Now",
            icon: IconPlayerPlayFilled,
            Action: async () => PlaybackController.Play({ songs: await collection.GetSongs() })
        },
        {
            label: "Add To Library",
            group: ContextMenuGroup.Playlist,
            icon: IconPlaylistAdd,
            Action: async () => {
                await collection.LoadSongs()
                try {
                    await PlaylistProvider.CreatePlaylist(collection.title, collection.GetSongIds())
                    Toasts.Add(`Added ${collection.title} to library`, "success")
                }
                catch (e) {
                    console.error(e)
                    Toasts.Add(`Failed to add ${collection.title} to library`, "failure")
                }
            },
            visible: auth.loggedIn
        }
    ]
}