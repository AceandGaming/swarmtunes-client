<script lang="ts">
    import type { Playlist } from "@ts/features/playlist/model"
    import Popup from "@ui/popup/ui.svelte"
    import PlaylistProvider from "@ts/features/playlist/provider"
    import { untrack } from "svelte"
    import ItemList from "@ui/components/item-list.svelte"

    const { resolve }: {resolve: (playlist: Playlist|undefined) => any} = $props()

    let visible = $state(true)

    function onItemClick(playlist: Playlist) {
        resolve(playlist)
        untrack(() => visible = false)
    }

    $effect(() => {
        visible;
        if (!visible) {
            resolve(undefined)
        }
    })

</script>

<Popup title="Select Playlist" bind:visible>
    <div>
        {#await PlaylistProvider.GetAll()}
            <div class="loading-text"></div>
        {:then playlists}
            <ItemList items={playlists} {onItemClick} ></ItemList>
        {/await}
    </div>
    
</Popup>

<style>
    div {
        min-width: 400px;
        max-height: 50vh;
        overflow-y: scroll;
    }
    @media (max-width: 700px) {
        div {
            min-width: 200px;
        }
    }
</style>
