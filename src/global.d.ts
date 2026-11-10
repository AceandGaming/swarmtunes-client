import type { Network } from "@ts/api/network"
import type { Login } from "@ui/popup/dialogs/login.svelte"
import type { PlaybackController } from "@ts/features/playback/playback"
import type { PlayState } from "@ts/features/playback/playback"
import type { SongQueue } from "@ts/features/playback/playback"
import type { MediaView } from "@ui/views/media-view/media-view.svelte"

declare global {
    type id = string
    type ItemArrays<T> = T extends unknown ? T[] : never

    var YT: any
    var onYouTubeIframeAPIReady: () => void
}