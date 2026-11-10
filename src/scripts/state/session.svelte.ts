import { auth } from "@ts/login.svelte.ts"
import PlaylistProvider from "@ts/playlist-provider"
import playlistStore from "@ts/playlist-store.svelte"
import { Init as InitLiked } from "@ts/liked-songs.svelte"

let loading = $state(false)

async function OnLogin() {
    await PlaylistProvider.Init()
    await InitLiked()
}

$effect.root(() => {
    $effect(() => {
        const id = auth.user?.id

        if (!id) {
            playlistStore.Clear()
            return
        }

        loading = true
        OnLogin().finally(() => {
            loading = false
        })
    })
})

export const session = {
    get loading() {
        return loading
    }
}