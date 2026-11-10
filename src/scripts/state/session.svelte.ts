import { auth } from "@ts/state/auth.svelte.ts"
import PlaylistProvider from "@ts/features/playlist/provider"
import playlistStore from "@ts/features/playlist/store.svelte.ts"
import { Init as InitLiked } from "@ts/state/liked-songs.svelte.ts"

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