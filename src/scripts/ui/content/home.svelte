<script lang="ts">
    import PlaybackState from "@ts/playback.svelte"
    import ItemSticks from "@ts/ui/components/item-sticks.svelte"
    import { GetHome, GetSwarmFMMetadata, GetSwarmFMTime } from "@ts/ui/content/home.svelte.ts"
    import Cover from "@ts/ui/cover.svelte"
    import EmoteText from "@ts/ui/emote-text.svelte"
    import MediaView from "@ts/ui/content/media-view.svelte.ts"
    import ItemCards from "@ts/ui/item-cards.svelte"
    import ItemList from "@ts/ui/item-list.svelte"
    import Link from "@ts/ui/components/link.svelte"
    import Seek from "@ts/ui/controls/seek.svelte"
    import { IconPlayerPlayFilled, IconX } from "@tabler/icons-svelte-runes"
    import { Search } from "@ts/api/song"
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


<div id="home">
    <div class="search">
        <input type="search" bind:value={query} placeholder="search for a song!">
        {#if searching}
            <button class="clear-search icon-button" onclick={() => query = ""}><IconX /></button>
        {/if}
    </div>

    {#if searching}
        {#await Promise.all([Search(debouncedQuery), ImportItemList()])}
            <div class="loading-text"></div>
        {:then [songs, ItemList]}
            <ItemList items={songs} onItemClick={(song) => PlaybackState.Play({song, songs})} contextMenu={CreateSongContextMenu}/>
        {/await}
    {:else}
        {#await GetHome()}
            <div class="loading-text"></div>
        {:then {recentlyPlayed, setlists, discs, originals, mashups}}
            {#if recentlyPlayed.length > 0}
                <section class="recently-played">
                    <ItemSticks items={recentlyPlayed} --height="70px"/>
                </section>
            {/if}
            <section>
                <div class="recent">
                    {const recent = setlists[0]}
                    {#if recent}
                        <div class="box">
                            <div class="text">
                                <h2>Recent Setlist</h2>
                                <Link class="sub-text" href="setlists">More Setlists</Link>
                            </div>
                            <div class="recent-setlist">
                                <Cover item={recent} />
                                <div class="info">
                                    <h1><EmoteText content={recent.displayTitle} /></h1>
                                    <h2><EmoteText content={recent.displayDate!} /></h2>
                                    <h2>{recent.subtitle}</h2>
                                </div>
                                <div class="buttons">
                                    <button class="primary" onclick={async () => PlaybackState.Play({songs: await recent.GetSongs()})}>Play</button>
                                    <button onclick={() => MediaView.Show(recent)}>View</button>
                                </div>
                            </div>
                        </div>
                    {/if}
                    <div class="box">
                        <div class="text">
                            <h2>SwarmFM</h2>
                        </div>
                        <div class="swarmfm">
                            {const meta = $derived(GetSwarmFMMetadata())}
                            {const song = $derived(meta ? meta.current : undefined)}
                            
                            <div class="cover" onclick={() => PlaybackState.Play({swarmfm: true})} role="button" tabindex="0">
                                <img src="/swarmfm.png" alt="">
                                <div class="overlay"><IconPlayerPlayFilled size="unset" /></div>
                            </div>
                            <div class="info">
                                {#if song === undefined}
                                    <div class="loading-text"></div>
                                {:else}
                                    <h1>{song.name}</h1>
                                    <h2 class="sub-text">{song.artist}</h2>
                                {/if}
                            </div>
                            <Seek played={GetSwarmFMTime()} duration={song ? song.duration : 0} />
                        </div>
         
                    </div>
                </div>
            </section>
            <section>
                <h1 class="neuro-text">Originals</h1>
                <ItemCards items={originals} />
            </section>
            <section>
                <h1 class="neuro-text">Explore</h1>
                <div class="more">
                    <div class="box">
                        <h2>Mashups</h2>
                        <ItemList items={mashups} onItemClick={(song) => PlaybackState.Play({song, songs: mashups})} />
                    </div>
                    <div class="box">
                        <h2>Discs</h2>
                        <ItemList items={discs} onItemClick={(collection) => MediaView.Show(collection)}/>
                    </div>
                </div>
            </section>
        {/await}
    {/if}
</div>

<style>
    .search {
        position: relative;
        margin-bottom: 20px;

        width: fit-content;
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

    #home {
        padding: clamp(1rem, 2vw, 2rem);
        overflow-y: auto;
    }
    section:not(:first-child) {
        margin-top: 2rem;
    }
    section > h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    .loading-text {
        margin: auto;
    }

    .box {
        position: relative;

        background-color: color-mix(var(--colour-surface-raised), transparent 20%);
        border-radius: 20px;
        border: solid 1px var(--colour-border);

        padding: 1rem;
    }

    .recent {
        display: grid;
        grid-template-columns: 2fr 2fr;
        grid-template-rows: 1fr;
        gap: 1rem;
    }
    .box > .text {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        align-items: center;

        margin-bottom: 1rem;
    }
    .recent-setlist {
        display: grid;
        gap: 1rem;

        grid-template-rows: auto auto;
        grid-template-columns: auto 1fr;
        align-items: center;

        grid-template-areas:
        "cover info"
        "cover buttons";

        height: clamp(200px, 20vw, 300px);
    }
    .recent-setlist > :global(.cover) {
        grid-area: cover;
        height: 100%;
        min-height: 0;
    }
    .recent-setlist .info {
        grid-area: info;

        display: flex;
        flex-direction: column;
        gap: 5px;

        margin-top: auto
    }
    .recent-setlist .buttons {
        grid-area: buttons;
        margin-bottom: auto;
    }
    :is(.recent-setlist, .swarmfm) h1 {
        font-size: 2.2rem;
        font-weight: 900;
        color: white;
    }
    :is(.recent-setlist, .swarmfm) h2 {
        font-size: 1rem;
        font-weight: normal;
        color: #FFFFFFCC;
    }

    .swarmfm {
        display: grid;
        gap: 1rem;

        grid-template-rows: auto auto;
        grid-template-columns: auto 1fr;
        grid-template-areas: 
        "cover info"
        "cover seek";

        height: clamp(200px, 20vw, 300px);
    }
    .swarmfm .info {
        grid-area: info;

        display: flex;
        flex-direction: column;
        gap: 5px;

        margin-top: auto;
        min-width: 0;
    }
    .swarmfm > :global(.seek) {
        grid-area: seek;   
    }
    .swarmfm > .cover {
        position: relative;
        grid-area: cover;
        height: 100%;
        min-height: 0;

        cursor: pointer;
    }
    .swarmfm > .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @media (hover: hover) {
        .swarmfm > .cover:hover img {
            filter: brightness(0.5);
        }
    }
    .swarmfm > .cover .overlay {
        position: absolute;
        inset: 0;
    
        display: flex;
        
        align-items: center;
        justify-content: center;

        opacity: 0;
        transform: scale(0.4);
        
        transition: opacity 0.1s ease-in-out, transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        color: white;
    }
    .swarmfm > .cover:hover .overlay {
        opacity: 1;
        transform: scale(0.75);
    }

    .swarmfm :is(h1, h2) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
    }

    .more {
        display: grid;
        gap: 1rem;

        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr;
        align-items: start;
    }
    .more h2 {
        margin-left: 5px;
        margin-bottom: 0.5rem;
    }

    @media (max-width: 1200px) {
        .more, .recent {
            grid-template-columns: 1fr;
        }
        .swarmfm > .cover {
            max-width: unset;
        }
    }
    @media (max-width: 600px) {
        .recent-setlist, .swarmfm {
            height: 150px;
        }
        :is(.recent-setlist, .swarmfm) h1 {
            font-size: 1rem;
        }
        :is(.recent-setlist, .swarmfm) h2 {
            font-size: 0.8rem;
        }

        .recently-played > :global(*) {
            --height: 50px !important;
            --width: 150px !important;
            font-size: 0.8rem;
        }        
    }
</style>