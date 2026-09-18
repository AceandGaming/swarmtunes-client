<script lang="ts" generics="T extends Item">
    import { type Playlist, Song } from "@ts/models"
    import Cover from "@ts/ui/cover.svelte"
    import { flipNoScale, FormatDuration } from "@ts/misc"
    import { IconDotsVertical, IconCircleArrowDownFilled as IconDown, IconHeart, IconHeartFilled } from "@tabler/icons-svelte-runes"
    import { MobileHoldSvelte } from "@ts/mobile-hold"
    import { GetDownloads } from "@ts/song-downloads.svelte"
    import type Sortable from "sortablejs"
    import { onMount, type Snippet } from "svelte"
    import type { ContextMenuOption } from "@ts/context-menu.svelte"
    import ContextMenu from "@ts/context-menu.svelte"
    import { ToggleSongLike, IsSongLiked } from "@ts/liked-songs.svelte"
    import { auth } from "@ts/login.svelte"

    type Item = Playlist | Song
    type Props<T extends Item> = {
        items: T[]
        animate?: boolean
        extraInfo?: boolean
        contextMenu?: (item: T) => ContextMenuOption[]
        onItemClick?: (item: T) => void
        onReorder?: (items: T[]) => void
        trailing?: Snippet<[T]>
    }

    let {
        items = $bindable(),
        animate = false,
        extraInfo = true,
        contextMenu,
        onItemClick,
        onReorder,
        trailing
        
    }: Props<T> = $props();

    let element: HTMLElement

    let toggledFlip = $derived(animate ? flipNoScale : () => ({ duration: 0 }))
    let draggable = $derived(onReorder !== undefined)

    let sortable: Sortable | undefined

    let itemLookup = $derived(new Map(items.map(item => [item.id, item])))

    function OpenContextMenu(event: MouseEvent | TouchEvent, item: T) {
        if (!contextMenu) {
            return
        }
        const menu = contextMenu(item)

        const x = event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX
        const y = event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY

        ContextMenu.Show({ options: menu, x: x, y: y })
    }

    async function CreateSortable() {
        if (!draggable) {
            return
        }

        const Sortable = (await import("sortablejs")).default

        sortable = new Sortable(element, {
            animation: animate ? 150 : 0,
            disabled: !draggable,
            onUpdate: (e) => {
                // @ts-ignore
                const ids: string[] = [...e.to.children].map((el: HTMLElement) => el.dataset.id)
                items = ids.map(id => itemLookup.get(id)).filter(item => item !== undefined)

                onReorder?.(items)
            }
        })
    }

    onMount(() => {
        CreateSortable()

        return () => {
            sortable?.destroy()
        }
    })
    $effect(() => {
        CreateSortable()
        sortable?.option("disabled", !draggable);
    })
</script>

<ul bind:this={element} class="item-list">
    {#each items as item (item.id)}
        <li 
            animate:toggledFlip={{ duration: 300}}
            onclick={() => onItemClick?.(item)}
            class:unavailable={"playable" in item && !item.audioInfo.playable}

            data-id={item.id}
            
            oncontextmenu={(e) => OpenContextMenu(e, item)} 
            {@attach MobileHoldSvelte((e) => OpenContextMenu(e, item))}
        >
            <div class="cover-wrapper">
                <Cover {item} />
                {#if extraInfo && item instanceof Song && GetDownloads().has(item.id)}
                    <IconDown size="unset" />
                {/if}
            </div>
            <div class="info">
                <h1>
                    {item.displayTitle}
                </h1>
                <h2 class="sub-text">{item instanceof Song ? (item.displayArtists) : `${item.songCount} songs`}</h2>
            </div>
            {#if extraInfo}
                <p class="sub-text date-info">{item.displayDate}</p>
            {/if}
            {#if extraInfo && item instanceof Song}
                {#if auth.loggedIn}
                    <button class="like-button icon-button" onclick={e => {e.stopPropagation(); ToggleSongLike(item.id)}}>
                        {#if IsSongLiked(item.id)}
                            <IconHeartFilled />
                        {:else}
                            <IconHeart />
                        {/if}
                    </button>
                {/if}
                <p class="sub-text duration">{FormatDuration(item.seconds, true)}</p>
            {/if}
            {#if contextMenu && extraInfo}
                <button class="context-menu-button icon-button" onclick={(e) => {e.stopPropagation(); OpenContextMenu(e, item)}}>
                    <IconDotsVertical size="100%" />
                </button>
            {/if}
            {#if trailing}
                <div class="trailing">
                    {@render trailing(item)}
                </div>
            {/if}

        </li>
    {/each}
</ul>

<style>
    li {
        container-type: inline-size;

        height: 55px;

        display: flex;
        flex-direction: row;
        align-items: center;
    
        gap: 5px;
        padding: 5px;
    
        border-radius: 10px;

        transition: background-color 0.1s ease;
        cursor: pointer;
    }
    li:hover {
        background-color: #ffffff20;
    }
    li.unavailable {
        filter: grayscale(1);
        opacity: 0.5;
        cursor: not-allowed;
    }

    li .cover-wrapper {
        position: relative;
        height: 100%;
        width: auto;
        aspect-ratio: 1;
    }
    .cover-wrapper > :global(.cover) {
        height: 100%;
        width: 100%;
    }
    .cover-wrapper > :global(svg) {
        position: absolute;
        right: 1px;
        bottom: 1px;
        height: 12px;
        aspect-ratio: 1;
    }

    li > button {
        height: 50%;
        aspect-ratio: 1;
    }
    .duration {
        text-align: center;
    }
    .like-button, .duration {
        width: 30px;
    }

    @media (hover: hover) {
        .context-menu-button {
            opacity: 0;
            transition: opacity 0.1s ease;
        }
        .like-button {
            display: none;
        }
        
        li:hover > .context-menu-button{
            opacity: 1;
        }
        li:hover > .like-button {
            display: block;
        }
        li:hover:has(.like-button) > .duration {
            display: none;
        }
    }
    

    li .info {
        flex: 1;
        min-width: 0;

        display: flex;
        flex-direction: column;
        gap: 1px;
    }
    li .date-info {
        margin-right: 10%;
        text-align: right;
    }

    li :is(h1, h2) {
        font-weight: normal;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    li h1 {
        font-size: var(--font-size, 1rem);
    }
    h1 > :global(svg) {
        display: inline-block;
        vertical-align: middle;
    }
    li h2 {
        font-size: calc(var(--font-size, 1rem) * 0.8);
    }

    @container (max-width: 500px) {
        .date-info {
            display: none !important;
        }
    }
    @container (max-width: 320px) {
        .like-button, .duration {
            display: none !important;
        }
    }
</style>