<script lang="ts">
    import { type Collection, type Playlist, Song } from "@ts/models"
    import Cover from "@ts/ui/cover.svelte"
    import type { Color } from "colorthief"
    import EmoteText from "@ts/ui/emote-text.svelte"
    import MediaView from "@ts/ui/content/media-view.svelte.ts"

    type item = Song | Collection | Playlist

    let { items }: {items: item[], grid?: boolean} = $props()

    async function OnCardClick(item: item) {
        MediaView.Show(item)
    }
</script>

{#snippet Stick(item: item)}
    {let colour: Color | undefined = $state()}
    {let colourCss = $derived.by(() => {
        if (!colour) {
            return undefined
        }
        const hsl = colour.hsl()

        const topColour = `hsl(${hsl.h}, ${hsl.s * 2}%, ${Math.min(hsl.l * 1, 70)}%)`
        const bottomColour = `hsl(${hsl.h}, ${hsl.s * 1.5}%, ${Math.min(hsl.l / 1.5, 40)}%)`

        return `linear-gradient(to bottom right, ${topColour}, ${bottomColour})`
    })}

    <div 
        class="stick" 
        //style:--colour={colourCss}

        onclick={() => OnCardClick(item)}
    >
        <Cover item={item} bind:colour />
        <div class="info">
            <h1><EmoteText content={item.displayTitle} /></h1>
            <h2 class="sub-text">{item.subtitle}</h2>
        </div>
        
    </div>
{/snippet}


<div 
    class="item-sticks"
>
    {#each items as item}
        {@render Stick(item)}
    {/each}
</div>

<style>
    .item-sticks {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--width, 300px), 1fr));
        gap: var(--gap, 10px);
    }
    
    .stick {
        height: var(--height, auto);

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: left;

        padding: 0.5em;
        gap: 0.8em;
        border-radius: 10px;

        background: var(--colour, var(--colour-surface-raised));
        cursor: pointer;

        transition: filter 0.2s ease, transform 0.2s ease;
    }
    .stick:hover {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }
    .stick :global(.cover) {
        height: 100%;
    }

    .stick .info {
        flex: 1;
        min-width: 0;
    }
    .stick .info h1 {
        font-size: 1em;
        color: #fff;
    }
    .stick .info h2 {
        font-size: 0.8em;
        color: #ffffffcc
    }
    .stick .info > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>