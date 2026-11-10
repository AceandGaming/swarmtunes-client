<script lang="ts">
    import NowPlaying from "@ui/now-playing.svelte"
    import CurrentSongBar from "@ui/current-song-bar/index.svelte"
    import Fullscreen from "@ui/views/fullscreen.svelte"
    import { GetPopup } from "@ui/popup/state.svelte.ts"
    import { auth, Logout } from "@ts/state/auth.svelte.ts"
    import { ConfirmAction, ShowLogin } from "@ui/popup/state.svelte.ts";
    import ContextMenu from "@ui/context-menu/index.svelte"
    import Toast from "@ui/toasts/ui.svelte"
    import Navigator from "@ts/core/navigator.svelte"
    import Link from "@ui/components/link.svelte"
    import Device from "@ts/environment/device.svelte.ts"

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
        {#each Object.values(Navigator.pages) as page}
            {#if !page.hidden}
                <button 
                    class:active={Navigator.current.name === page.name} 
                    onclick={() => {Navigator.Goto(page)}}
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
        <Link style="font-size: 1rem" class="about" href="/about">Credits</Link>
        <button onclick={OnLoginButtonClick}>{auth.loggedIn ? "Logout" : "Login"}</button>
    </div>
{/snippet}


<main id="app">
    {#if Device.behavesMobile && Device.looksMobile}
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
        {#await Navigator.current.import() then page}
            <page.default />
        {/await}
    </div>
</main>

<ContextMenu />
<Fullscreen />
<Toast />

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
    }
    @media (display-mode: standalone) {
        footer .tabs {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
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
        border-radius: 10px 10px 0 0;
        font-size: 0.8rem;
    }
    footer .tabs button {
        height: 60px;
        max-width: none;
        justify-content: center;
        flex-direction: column;

        background-color: var(--colour-surface);
        font-size: 0.6rem;

        border-radius: 5px;
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
