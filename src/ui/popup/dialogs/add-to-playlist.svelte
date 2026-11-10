<script lang="ts">
    import type { Playlist, Song } from "@ts/models"
    import Popup from "@ts/ui/popups/popup.svelte"
    import PlaylistProvider from "@ts/playlist-provider"
    import ItemList from "@ts/ui/item-list.svelte"
    import { IconCirclePlus, IconCircleCheckFilled } from "@tabler/icons-svelte-runes"
    import { onMount } from "svelte"
    import { SvelteMap } from "svelte/reactivity"

    const { song }: {song: Song} = $props()

    let visible = $state(true)
    let selected: Map<id, boolean> = new SvelteMap()

    // svelte-ignore non_reactive_update
    let playlists: Playlist[] = []

    async function Load() {
        playlists = await PlaylistProvider.GetAll()
        for (const playlist of playlists) {
            selected.set(playlist.id, false)
        }
        for (const playlist of await PlaylistProvider.GetWithSong(song.id)) {
            selected.set(playlist.id, true)
        }
    }
    const promise = Load()

    function onItemClick(playlist: Playlist) {
        selected.set(playlist.id, !selected.get(playlist.id))
    }
    function onConfirm() {
        for (const [playlistId, isSelected] of selected) {
            PlaylistProvider.ToggleSongInPlaylist(playlistId, song.id, isSelected)
        }
        visible = false
    }

</script>

<Popup title="Add to Playlist" bind:visible>
    <div class="content">
        {#await promise}
            <div class="loading-text"></div>
        {:then}
            <ItemList items={playlists} onItemClick={onItemClick} >
                {#snippet trailing(playlist: Playlist)}
                    {#if selected.get(playlist.id)}
                        <IconCircleCheckFilled />
                    {:else}
                        <IconCirclePlus />
                    {/if}
                {/snippet}
            </ItemList>
        {/await}
    </div>
    {#snippet buttons()}
        <button onclick={() => visible = false}>Cancel</button>
        {#await promise then}
            <button onclick={onConfirm}>Confirm</button>
        {/await}
    {/snippet}
</Popup>

<style>
    .content {
        min-width: 400px;
        max-height: 50vh;
        overflow-y: scroll;
    }
    @media (max-width: 700px) {
        .content {
            min-width: 200px;
        }
    }
</style>
