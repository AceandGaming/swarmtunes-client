<script lang="ts">
    import Ui from "@ts/state/ui.svelte"
    import PlaybackState from "@ts/features/playback/playback.svelte.ts"
    import MediaControls from "@ui/components/media-controls.svelte"
    import Seek from "@ui/components/seek.svelte"
    import Cover from "@ui/components/cover.svelte"
    import Device from "@ts/environment/device.svelte.ts"
    import { 
        IconDots, 
        IconPlaylistAdd,
        IconPlaylist as IconQueue, 
        IconShare3, 
        IconBrandYoutube as IconVideo, 
        IconBrandYoutubeFilled as IconVideoFilled, 
        IconX,
        IconEdit,
        IconEditFilled
    } from "@tabler/icons-svelte-runes"
    import { ColourCss, GetSongColour } from "@ts/utils/misc"
    import type { Color } from "colorthief"
    import { auth } from "@ts/state/auth.svelte.ts"
    import { DockIFrame } from "@ts/features/playback/iframe-dock.svelte.ts"
    import { CreateSongContextMenu } from "@ts/features/song/context-menu"
    import ContextMenu, { ContextMenuGroup } from "@ui/context-menu/state.svelte.ts"
    import { AddToPlaylist, CopyToClipboard } from "@ui/popup/state.svelte.ts"
    import { ShareSongV1 } from "@ts/api/song.ts"
    import ItemList from "@ui/components/item-list.svelte"
    import { Wakelock } from "@ts/utils/wakelock.svelte.ts"

    let Visability = $derived(Ui.fullscreen)

    let queueVisable = $state(false)
    let largeQueue = $state(false)
    let editQueue = $state(false)

    let videoEnabled: boolean = $state(false)
    let showVideo = $derived(PlaybackState.iframe !== undefined && videoEnabled && Visability.visible && !queueVisable)

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
            queueVisable = false
        }
        offset = 0
    }

    let queueOffset = $state(0)
    let queueStartY = 0

    function OnQueueTouchStart(e: TouchEvent) {
        queueOffset = 0
        queueStartY = e.touches[0].clientY
    }
    function OnQueueTouchMove(e: TouchEvent) {
        if (editQueue) {
            return
        }


        const y = e.touches[0].clientY
        const diff = y - queueStartY

        if (Math.abs(diff) > 20 || queueOffset != 0) {
            queueOffset = diff
        }
        else {
            queueOffset = 0
        }
    }
    function OnQueueTouchEnd(e: TouchEvent) {
        if (queueOffset != 0) {
            e.stopImmediatePropagation()
        }

        
        if (queueOffset > window.innerHeight * 0.1) {
            if (largeQueue) {
                largeQueue = false
                if (queueOffset > window.innerHeight * 0.7) {
                    queueVisable = false
                }
            }
            else {
                queueVisable = false
            }
            
        }
        else if (queueOffset < -window.innerHeight * 0.1) {
            largeQueue = true
        }
        queueOffset = 0
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

    {@attach Wakelock(Visability.visible)}
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
        {#if info.singers}
            <div class="queue-info" ontouchend={() => queueVisable = true}>
                <IconQueue />
                <h3>{info.singers}</h3>
                <b>{PlaybackState.loaded.length}</b>
            </div>
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

    {#if Device.behavesMobile && Device.looksMobile}
        <div 
            class="fullscreen-queue"
            class:visible={queueVisable}
            class:no-animate={queueOffset != 0 || beingResized}
            class:large={largeQueue}
    
            style:--offset={`${queueOffset}px`}

            ontouchstart={OnQueueTouchStart}
            ontouchmove={e => {e.stopPropagation(); OnQueueTouchMove(e)}}
            ontouchend={OnQueueTouchEnd}
        >
            <div 
                class="dragger"
                class:edit={editQueue}


            ></div>
            <button
                class="icon-button edit-button"
                onclick={() => editQueue = !editQueue}
            >
                {#if editQueue}
                    <IconEditFilled size={30} />
                {:else}
                    <IconEdit size={30} />
                {/if}
            </button>
            <div class="scroll">
                <ItemList 
                    items={PlaybackState.queue.slice(0, 20)}
                    extraInfo={false} 
                    animate={true}

                    onItemClick={(song) => PlaybackState.SkipTo(song)}
                    onReorder={editQueue ? ((songs) => PlaybackState.ReorderQueue(songs.map(s => s.id))) : undefined}
                    
                    --font-size="0.9rem" 
                />
            </div>
        </div>
    {/if}
</div>

<style>
    @property --c1 {
        syntax: "<color>";
        inherits: true;
        initial-value: #000;
    }
    @property --c2 {
        syntax: "<color>";
        inherits: true;
        initial-value: #000;
    }


    #fullscreen {
        --c1: var(--colour-surface);
        --c2: var(--colour-surface);

        position: fixed;
        inset: 0;
        z-index: 5;

        padding: clamp(1rem, 5vw, 2rem);
        gap: clamp(0.5rem, 3vh, 2rem);

        font-size: clamp(1rem, 3vmin, 2rem);

        display: grid;
        background: linear-gradient(
            to bottom,
            var(--c1),
            var(--c2)
        );

        transform: translateY(var(--offset));

        grid-template-rows: auto 4fr auto auto auto 1fr;
        grid-template-columns: 1fr;
        grid-template-areas:
            "top"
            "content"
            "queue-info"
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
        display: flex;

        width: 100%;
        padding: 12px;
    
        &::after {
            content: "";
            display: block;
            width: 20vw;
            height: 3px;

            margin: auto;

            background-color: white;
            border-radius: 99px;
        }
    }
    #fullscreen > .dragger {
        position: absolute;
        top: 0;
    }

    .fullscreen-queue {
        position: absolute;
        z-index: 6;

        display: flex;
        flex-direction: column;
        
        width: 100vw;
        height: 100%;
        padding: 0.5rem;
        padding-bottom: 0;

        background-color: color-mix(var(--c2), transparent 40%);
        backdrop-filter: blur(6px);

        border-radius: 20px 20px 0 0;

        transform: translateY(calc(30dvh + var(--offset)));

        transition: transform 0.2s ease, border-radius 0.2s ease;

        &.large {
            transform: translateY(var(--offset));
            border-radius: 0;
        }
        &:not(.visible) {
            transform: translateY(100dvh);
        }
        &.no-animate {
            transition: none;
        }

        .dragger {
            opacity: 1;
            height: 2rem;

            transition: opacity 0.2s ease;

            &.edit {
                opacity: 0;
            }
        }

        .edit-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
        }

        .scroll {
            flex: 1;

            overflow-x: hidden;
            overflow-y: hidden;
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

        gap: 10px;

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
        .queue-info {
            width: calc(100% - 1rem);

            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;

            gap: 10px;

            font-size: 1rem;

            & :global(:first-child) {
                justify-self: start;
            }
            h3 {
                align-self: center;
                text-align: center;

                overflow: hidden;
                min-width: 0;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            & :global(:last-child) {
                justify-self: end;
            }


            * {
                height: 100%;
            }
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