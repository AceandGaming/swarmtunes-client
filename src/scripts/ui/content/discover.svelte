<script lang="ts">
    import ItemCards from "@ts/ui/item-cards.svelte"
    import PlaybackState from "@ts/playback.svelte"
    import { Search } from "@ts/api/song"
    import { IconX } from "@tabler/icons-svelte-runes"
    import { GetDiscover } from "./discover.svelte.ts"
    import ErrorScreen from "@ts/ui/error-screen.svelte"
    import IconSwarmFM from "@assets/swarmfm.svelte"
    import { CreateSongContextMenu } from "@ts/context-menus"

    let query: string = $state("")
    let debouncedQuery = $state('');
    let searching = $derived(query.length > 0)

    $effect(() => {
        query;
        const timeout = setTimeout(() => {
            debouncedQuery = query
        }, 200)

        return () => clearTimeout(timeout);
    })

    async function ImportItemList() {
        const { default: ItemList } = await import("@ts/ui/item-list.svelte")
        return ItemList
    }

</script>

<div id="discover">
    <div class="top">
        {#if !window.isMobile}
            <button class="swarmfm-button" title="Play SwarmFM!" onclick={() => PlaybackState.Play({ swarmfm: true})}><IconSwarmFM /></button>
        {/if}
        <div class="search">
            <input type="search" bind:value={query} placeholder="search for a song!">
            {#if searching}
                <button class="clear-search icon-button" onclick={() => query = ""}><IconX /></button>
            {/if}
        </div>
    </div>

    {#if searching}
        {#await Promise.all([Search(debouncedQuery), ImportItemList()])}
            <div class="loading-text"></div>
        {:then [songs, ItemList]}
            <ItemList items={songs} onItemClick={(song) => PlaybackState.Play({song, songs})} contextMenu={CreateSongContextMenu}/>
        {/await}
    {:else}
        {#await GetDiscover()}
            <div class="loading-text"></div>
        {:then {setlists, discs, originals, mashups}}
            <h1 class="neuro-text">Setlists</h1>
            <ItemCards items={setlists} />

            <h1 class="neuro-text">Originals</h1>
            <ItemCards items={originals} />

            <h1 class="neuro-text">Mashups</h1>
            <ItemCards items={mashups} />

            <h1 class="neuro-text">Discs</h1>
            <ItemCards items={discs} />
        {:catch error}
            {console.error(error)}
            <ErrorScreen title="Error Loading Discover">{error}</ErrorScreen>
        {/await}
    {/if}
</div>

<style>
    .loading-text {
        margin: auto;
    }

    #discover {
        padding-left: 20px;
        padding-top: 20px;
        overflow-y: auto;
    }

    .top {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px;

        margin-bottom: 20px;
    }

    .swarmfm-button {
        width: 50px;
        height: auto;
        min-height: 50px;
        border-radius: 50%;
        padding: 0;
    }
    .swarmfm-button > :global(svg) {
        width: 80%;
        height: auto;
        margin: auto;
    }

    .search {
        position: relative;
    }

    .search input {
        padding-right: 40px;
    }


    .clear-search {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        cursor: pointer;
    }
    .clear-search:active {
        transform: translateY(-50%) scale(0.9);
    }

    h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 500;
    }

    .loading-text {
        margin: 0 auto;
    }

    #discover > :global(.item-cards) {
        margin-bottom: 40px;
    }

    @media (max-width: 600px) {
        .top {
            justify-content: center;
        }
    }
</style>
