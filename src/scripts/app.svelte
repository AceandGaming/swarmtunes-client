<script lang="ts" module>
    import { IconLayoutGrid, IconWorld, IconSettings, IconInfoCircle } from "@tabler/icons-svelte-runes";
    import type { Component } from "svelte";
    type Page = {
        name: string
        icon: Component,
        import: () => Promise<{default: any}>,
        label: string,
        hidden: boolean
    }

    const pages: {[key: string]: Page} = {}
    function AddPage(page: Page) {
        pages[page.name] = page
    }

    AddPage({
        name: "library",
        icon: IconLayoutGrid,
        import: () => import("@ts/ui/content/playlists-tab.svelte"),
        label: "Library",
        hidden: false
    })
    AddPage({
        name: "discover",
        icon: IconWorld,
        import: () => import("@ts/ui/content/discover.svelte"),
        label: "Discover",
        hidden: false
    })
    AddPage({
        name: "settings",
        icon: IconSettings,
        import: () => import("@ts/ui/content/settings.svelte"),
        label: "Settings",
        hidden: false
    })
    AddPage({
        name: "about",
        icon: IconInfoCircle,
        import: () => import("@ts/ui/content/about.svelte"),
        label: "About",
        hidden: true
    })
    
</script>


<script lang="ts">
    import NowPlaying from "@ts/ui/now-playing.svelte"
    import CurrentSongBar from "@ts/ui/controls/current-song-bar/index.svelte"
    import Fullscreen from "@ts/ui/content/fullscreen.svelte"
    import { GetPopup } from "@ts/ui/popup.svelte.ts"
    import { MediaQuery } from "svelte/reactivity";
    import MediaView from "@ts/ui/content/media-view.svelte"
    import MediaViewState from "@ts/ui/content/media-view.svelte.ts"
    import { auth, Logout } from "@ts/login.svelte.ts"
    import { ConfirmAction, ShowLogin } from "@ts/ui/popup.svelte.ts";
    import ContextMenu from "@ts/ui/context-menu/index.svelte"
    import Toast from "@ts/ui/toast.svelte"
    import { url, Navigate } from "@ts/urlbar.svelte.ts"
    import Link from "@ts/ui/components/link.svelte"

    let currentPage: Page = $state(pages.discover)
    $effect(() => {
        const name = url.pathname.split("/")[1]
        console.log(name)
        if (name in pages) {
            currentPage = pages[name]
        }
        else {
            url.pathname = "/discover"
        }
    })


    let mobile = new MediaQuery("max-width: 600px")

    const popup = $derived(GetPopup())

    async function OnLoginButtonClick() {
        if (!auth.loggedIn) {
            ShowLogin()
        }
        else {
            if (await ConfirmAction("Are you sure you want to logout?")) {
                await Logout()
            }
        }
    }
</script>


{#snippet tabs()}
    <div class="tabs">
        {#each Object.values(pages) as page}
            {#if !page.hidden}
                <button 
                    class:active={currentPage.name === page.name} 
                    onclick={() => {MediaViewState.Hide(); Navigate("/" + page.name)}}
                >
                    <page.icon />
                    <p>{page.label}</p>
                </button>
            {/if}
        {/each}
    </div>
{/snippet}
{#snippet headerButtons()}
    <div class="buttons">
        <Link style="font-size: 1rem" class="about" href="about">About</Link>
        <button onclick={OnLoginButtonClick}>{auth.loggedIn ? "Logout" : "Login"}</button>
    </div>
{/snippet}


<main id="app">
    {#if mobile.current}
        <footer>
            <CurrentSongBar />
            {@render tabs()}
        </footer>
    {:else}
        <header>
            {@render tabs()}
            {@render headerButtons()}
        </header>
        <footer>
            <CurrentSongBar />
        </footer>
    {/if}
    <NowPlaying />
    <div class="content">
        {#if MediaViewState.visible}
            <MediaView />
        {:else}
            {#await currentPage.import() then page}
                <page.default />
            {/await}
        {/if}
        <Toast />
    </div>
</main>
<ContextMenu />
<Fullscreen />
{#key popup}
    {#if popup}
        {const Comp = popup.component}
        <Comp {...popup.props} />
    {/if}
{/key}

<svelte:document oncontextmenu={e => e.preventDefault()}></svelte:document>

<style>
    main {
        position: fixed;
        inset: 0;

        display: grid;

        background-color: var(--colour-background);

        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr auto;
        grid-template-areas: 
        "now-playing header"
        "now-playing content"
        "footer footer";
    }
    header {
        grid-area: header;

        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 0 5px;

        background: linear-gradient(var(--colour-surface-raised), var(--colour-surface));
        box-shadow: 0 5px 5px -3px #00000050;
    }
    footer {
        grid-area: footer;
        background-color: var(--colour-surface);
    }
    .tabs {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: end;
        gap: 5px;
    }
    header .tabs {
        flex: 1;
        height: 100%;
    }
    footer .tabs {
        justify-content: center;

        padding: 0 5vw;
        padding-bottom: 10px;
    }
    .tabs button {
        flex: 1;
        max-width: 120px;

        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        justify-content: center;

        gap: 5px;
        font-weight: bold;

        background-color: var(--colour-background);
    }
    .tabs button.active {
        background-color: var(--colour-surface);
    }

    header .tabs button { 
        padding: 2px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        font-size: 0.8rem;
    }
    footer .tabs button {
        height: 60px;
        max-width: none;
        justify-content: center;
        flex-direction: column;

        background-color: var(--colour-surface);
        font-size: 0.6rem;
    }
    footer .tabs button.active {
        background-color: var(--colour-background);
    }

    header .buttons {
        display: flex;
        flex-direction: row;
        justify-content: right;
        align-items: center;
        gap: 10px;
        padding: 10px;
    }
    #app > :global(#now-playing) {
        grid-area: now-playing;
        margin-right: 2px;
    }
    .content {
        position: relative;

        grid-area: content;
        min-height: 0;
        overflow: hidden;

        background: var(--surface-image) var(--colour-surface)
    }
    .content > :global(*) {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    @media (max-width: 700px) {
        main {
            grid-template-columns: 1fr;
            grid-template-areas: 
            "header"
            "content"
            "footer";
        }

        #app > :global(#now-playing) {
            display: none !important;
        }
    }
</style>
