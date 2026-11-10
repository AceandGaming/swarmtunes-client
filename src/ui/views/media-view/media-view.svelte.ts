import type { Collection } from "@ts/features/collection/model"
import type { Playlist } from "@ts/features/playlist/model"
import type { Song } from "@ts/features/song/model"

type Media = Collection | Playlist | Song
let currentMedia: Media | undefined = $state.raw()

export default {
    get media() {
        return currentMedia
    },
    get visible() {
        return currentMedia !== undefined
    },

    Show(media: Media) {
        currentMedia = media
    },
    Hide() {
        currentMedia = undefined
    }
}