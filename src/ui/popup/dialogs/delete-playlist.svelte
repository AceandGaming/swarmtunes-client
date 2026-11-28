<script lang="ts">
    import Popup from "@ui/popup/ui.svelte"
    import Markup from "@ui/components/markup.svelte";
    import type { Playlist } from "@ts/features/playlist/model"
    import PlaylistProvider from "@ts/features/playlist/provider";
    import Toasts from "@ui/toasts/state.svelte.ts"

    const { playlist }: {playlist: Playlist} = $props()

    let visible = $state(true)

    function Submit() {
        PlaylistProvider.DeletePlaylist(playlist.id)
        visible = false
        Toasts.Add("Playlist deleted", "success")
    }


</script>

<Popup title="Confirm Deletion" bind:visible>
    <p>Are you sure you want to delete <b><Markup content={playlist.displayTitle} /></b>?</p>
    {#snippet buttons()}
        <button onclick={() => visible = false}>Cancel</button>
        <button onclick={Submit}>Confirm</button>
    {/snippet}
</Popup>