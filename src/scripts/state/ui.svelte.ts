import type { Collection } from "@ts/features/collection/model"
import type { Playlist } from "@ts/features/playlist/model"
import type { Song } from "@ts/features/song/model"
import type { Page }  from "@ts/core/navigator.svelte"
import Navigator, { mediaviewPage } from "@ts/core/navigator.svelte"

type Media = Collection | Playlist | Song

let currentMedia: Media | undefined = $state.raw()
let fullscreenVisible = $state(false)

let lastPage: Page | undefined

export default {
    media: {
        get current() {
            return currentMedia
        },

        Show(media: Media) {
            lastPage = Navigator.current

            currentMedia = media
            Navigator.Goto(mediaviewPage)
        },
        Hide() {
            currentMedia = undefined
            if (lastPage) {
                Navigator.Goto(lastPage)
            }
        }
    },

    fullscreen: {
        get visible() {
            return fullscreenVisible
        },

        Show() {
            fullscreenVisible = true
        },
        Hide() {
            fullscreenVisible = false
        }
    }
}