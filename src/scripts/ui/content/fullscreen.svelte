<script lang="ts">
    import Visability from "./fullscreen.svelte.ts"
    import PlaybackState from "@ts/playback.svelte.ts"
    import MediaControls from "@ts/ui/controls/media-controls.svelte"
    import Seek from "@ts/ui/controls/seek.svelte"
    import Cover from "@ts/ui/cover.svelte"
    import Device from "@ts/device.svelte.ts"
    import { IconDots, IconPlaylistAdd, IconShare3, IconBrandYoutube as IconVideo, IconBrandYoutubeFilled as IconVideoFilled, IconX } from "@tabler/icons-svelte-runes"
    import { ColourCss, GetSongColour } from "@ts/misc"
    import type { Color } from "colorthief"
    import { auth } from "@ts/login.svelte.ts"
    import { DockIFrame } from "@ts/iframe-dock.svelte.ts"
    import { CreateSongContextMenu } from "@ts/context-menus/song.ts"
    import ContextMenu, { ContextMenuGroup } from "@ts/context-menu.svelte.ts"
    import { AddToPlaylist, CopyToClipboard } from "@ts/ui/popup.svelte.ts"
    import { ShareSongV1 } from "@ts/api/song.ts"

    let videoEnabled: boolean = $state(false)
    let showVideo = $derived(PlaybackState.iframe !== undefined && videoEnabled && Visability.visible)

    let beingResized = $state(false)
    let resizeTimeout: number | null = null

    const info = $derived.by(() => {
        const song = PlaybackState.currentSong
        return {
            title: song?.displayTitle ?? "Title",
            artists: song?.displayArtists ?? "Artists",
            singers: song?.displaySingers,
            date: song?.displayDate
        }
    })

    let colour: Color | undefined = $state()
    $effect(() => {
        const song = PlaybackState.currentSong
        if (!song) {
            colour = undefined
            return
        }
        GetSongColour(song).then(c => colour = c)
    })

    const colours: {top?: string, bottom?: string} = $derived.by(() => {
        if (!colour) {
            return { }
        }

        return {
            top: ColourCss(colour, (h, s, l) => [h, s * 2, Math.min(l * 1.2, 80)]),
            bottom: ColourCss(colour, (h, s, l) => [h, s * 1.5, Math.min(l / 1.5, 40)])
        }
    })

    let offset = $state(0)
    let startY = 0

    function OnTouchStart(e: TouchEvent) {
        offset = 0
        startY = e.touches[0].clientY
    }
    function OnTouchMove(e: TouchEvent) {
        const y = e.touches[0].clientY
        const diff = y - startY

        if (diff > 20 || offset > 0) {
            offset = diff
        }
        else {
            offset = 0
        }
    }
    function OnTouchEnd() {
        if (offset > window.innerHeight * 0.1) {
            Visability.Hide()
        }
        offset = 0
    }

    function ShowContextMenu(event: MouseEvent|TouchEvent) {
        if (!PlaybackState.currentSong) {
            return   
        }
        const options = CreateSongContextMenu(PlaybackState.currentSong).filter(o => o.group !== ContextMenuGroup.Queue)


        const x = event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX
        const y = event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY

        ContextMenu.Show({ options, x, y })
    }
    async function Share() {
        if (!PlaybackState.currentSong) {
            return
        }

        const url = "https://share.swarmtunes.com/?s=" + (await ShareSongV1(PlaybackState.currentSong.id))
        try {
            CopyToClipboard(url)
        }
        catch {
            console.error("Failed to copy link to clipboard")
        }
    }

</script>

<svelte:window onresize={() => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout)
    }

    beingResized = true

    resizeTimeout = setTimeout(() => {
        beingResized = false
    }, 100)
}} />

{#snippet videoButton()}
    {#if PlaybackState.iframe}
        <button class="video-button icon-button" onclick={() => videoEnabled = !videoEnabled}>
            {#if showVideo}
                <IconVideoFilled size="40" />
            {:else}
                <IconVideo size="40" />
            {/if}
        </button>
    {/if}
{/snippet}

<div 
    id="fullscreen"
    class:visible={Visability.visible}
    class:no-animate={offset > 0 || beingResized}
    class:video={showVideo}

    style:--c1={colours.top}
    style:--c2={colours.bottom}
    style:--offset={`${offset}px`}

    ontouchstart={OnTouchStart}
    ontouchmove={OnTouchMove}
    ontouchend={OnTouchEnd}

    oncontextmenu={ShowContextMenu}
>
    {#if Device.behavesMobile}
        <div class="dragger"></div>
    {/if}
    <div class="top">
        <div>
            {#if showVideo}
                {@render videoButton()}
            {:else}
                {#if PlaybackState.currentSong}
                    <button class="context-menu icon-button" onclick={ShowContextMenu}><IconDots size="100%" /></button>
                {/if}
            {/if}
        </div>
        <h3>{info.date}</h3>
        <div>
            {#if Device.behavesMobile}
                {#if PlaybackState.currentSong}
                    <button class="share icon-button" onclick={Share}><IconShare3 size="100%" /></button>
                {/if}
            {:else}
                <button class="close icon-button" onclick={Visability.Hide}><IconX size="100%" /></button>
            {/if}
        </div>
    </div>

    <div class="content-container">
        <div class="content">
            {#if showVideo}
                <div class="video" {@attach offset == 0 && DockIFrame()}></div>
            {:else}
                <Cover item={PlaybackState.currentSong}/>
            {/if}
            {#if !showVideo}
                {@render videoButton()}
            {/if}
        </div>
        {#if !showVideo}
            <h3>{info.singers}</h3>
        {/if}
    </div>
    <div class="info-container">
        <div class="info">
            <h1>{info.title}</h1>
            <h2>{info.artists}</h2>
        </div>
        
        {#if auth.loggedIn && PlaybackState.currentSong}
            <button class="add-to-playlist icon-button" onclick={() => AddToPlaylist(PlaybackState.currentSong!)}><IconPlaylistAdd size="50"/></button>
        {/if}
    </div>
    <div class="seek">
        <Seek played={PlaybackState.played} duration={PlaybackState.duration} onSeek={(f: number) => PlaybackState.SeekPercent(f)} />
    </div>
    <div class="controls">
        <MediaControls iconSize={40} gap={Device.behavesMobile ? 15 : 5}/>
    </div>
</div>

<style>
    @property --c1 {
        syntax: "<color>";
        inherits: false;
        initial-value: #000;
    }
    @property --c2 {
        syntax: "<color>";
        inherits: false;
        initial-value: #000;
    }


    #fullscreen {
        --c1: var(--colour-surface);
        --c2: var(--colour-surface);

        position: fixed;
        inset: 0;
        z-index: 5;

        padding: clamp(1rem, 5vw, 2rem);
        gap: clamp(1rem, 5vh, 2rem);

        font-size: clamp(1rem, 3vmin, 2rem);

        display: grid;
        background: linear-gradient(
            to bottom,
            var(--c1),
            var(--c2)
        );

        transform: translateY(var(--offset));

        grid-template-rows: auto 5fr auto auto 1fr;
        grid-template-columns: 1fr;
        grid-template-areas:
            "top"
            "content"
            "info"
            "seek"
            "controls";

        transition: --c1 1s ease, --c2 1s ease, transform 0.2s ease;
    }
    #fullscreen.no-animate {
        transition: --c1 1s ease, --c2 1s ease;
    }
    #fullscreen:not(.visible) {
        transform: translateY(100dvh);
    }
    #fullscreen :global(*) {
        color: white;
    }


    .dragger {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);

        padding: 12px;
    
        &:after {
            content: "";
            display: block;
            width: 20vw;
            height: 3px;

            background-color: white;
            border-radius: 99px;
        }
    }
    .top {
        grid-area: top;
        
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        width: 100%;
        
        >div {
            flex: 0 0 32px;
        }
        h3 {
            flex: 1;
            text-align: center;
            font-size: 1rem;
        }
    }

    .content-container {
        grid-area: content;
        container-type: size;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 5px;

        .content {
            position: relative;
            display: inline;

            filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.3));

            > :global(.cover) {
                height: min(100cqw, 100cqh);
            }
            > .video {
                width: min(100cqw, 16/9 * 100cqh);
                height: auto;
                aspect-ratio: 16/9;
            }
            
            .video-button {
                position: absolute;
                bottom: 2%;
                right: 2%;
                z-index: 20;
            }
        }
        h3 {
            font-size: 1rem;
        }
    }

    .info-container {
        grid-area: info;

        display: flex;
        flex-direction: row;
        
        align-items: center;
        justify-content: center;

        .info {
            flex: 1;

            h1, h2 {
                min-width: 0;
                white-space: wrap;
            }
            h1 {
                font-size: 1.5em;
                font-weight: 900;
            }
            h2 {
                font-size: 1em;
                font-weight: bold;
            }
        }
    }

    .controls {
        grid-area: controls;

        display: flex;

        justify-content: center;
    }
    
    .seek {
        grid-area: seek;

        display: flex;
        justify-content: center;

        :global(.seek) {
            height: 100%;
            width: 100%;
        }
    }

    @media (min-aspect-ratio: 1/1) {
        #fullscreen {
            background: linear-gradient(
                to bottom right,
                var(--c1),
                var(--c2)
            );

            grid-template-rows: auto 1fr 1fr 1fr;
            grid-template-columns: 2fr 3fr;
            grid-template-areas:
                "top top"
                "content info"
                "content controls"
                "content seek";
        }
        #fullscreen.video {
            grid-template-rows: 0 auto 6fr auto 1fr;
            grid-template-columns: 1fr;
            grid-template-areas:
                "top"
                "info"
                "content"
                "seek"
                "controls";

            gap: 1rem;
        }

        .info-container  {
            text-align: center;

            button {
                display: none;
            }
        }
    }
</style>