<script lang="ts">
    import { GetAllEmotes } from "@ts/emotes";
    import { RandomFrom } from "@ts/utils/misc"
    import Emote from "@ui/components/emote.svelte";
    import type { Emote as EmoteType } from "@ts/api/external/7tv";
    import { IconMoodPlus } from "@tabler/icons-svelte-runes";

    const { onEmoteSelect }: { onEmoteSelect: (emote: EmoteType) => any } = $props()

    let open = $state(false)
    let search = $state("")

    const emotes = $derived(GetAllEmotes().filter(emote => emote.name.includes(search)))

    function onclick(emote: EmoteType) {
        onEmoteSelect(emote)

        open = false
    }
</script>

<button 
    title="Select Emote" 
    class="icon-button select-emote"

    onclick={() => open = !open}
>
    <!-- <Emote emote={RandomFrom(GetAllEmotes())}/> -->
     <IconMoodPlus />
</button>
<div class="menu" class:visiable={open}>
    <input type="text" bind:value={search} placeholder="Search Emotes" />
    <div class="clip">
        <div class="emotes">
        {#each emotes as emote}
            <button class="no-defaults" title={emote.name} onclick={() => onclick(emote)}>
                <Emote {emote} --emote-size="50px"/>
            </button>
        {/each}
    </div>
    </div>
    
</div>

<style>
    .select-emote {
        anchor-name: --emote-anchor;
    }

    .menu {
        position: fixed;
        position-anchor: --emote-anchor;
        position-area: right;
        position-try-fallbacks: top, bottom;

        display: flex;
        visibility: hidden;

        flex-direction: column;
        gap: 0.5rem;

        padding: 0.5rem;
        border-radius: 0.5rem;

        background-color: var(--colour-surface-raised);

        border: 1px solid var(--colour-border);

        &.visiable {
            visibility: visible;
        }

        .emotes {
            display: grid;

            grid-template-columns: repeat(5, 50px);
            gap: 5px;

            max-height: 300px;

            border-radius: 4px;

            overflow-y: scroll;
            overflow-x: hidden;

            button {
                width: fit-content;
                height: fit-content;
            }
        }
    }


</style>