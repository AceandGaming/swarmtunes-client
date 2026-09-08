<script lang="ts" module>
    type Image = {
        type: "img",
        url: string
    }
    type Text = {
        type: "text",
        text: string
    }
</script>

<script lang="ts">
    import { GetEmoteByName } from "@ts/emotes"
    import { GetEmoteUrl } from "@ts/api/7tv"

    const { content }: {content: string} = $props()


    const elements: (Image | Text)[] = $derived.by(() => {
        const split = content.split(/(?=\s+)/g)
        const elements: (Image | Text)[] = []

        for (const word of split) {
            const trimmed = word.trim()
            if (trimmed.startsWith(":")) {
                const emote = GetEmoteByName(trimmed.slice(1))
                if (emote) {
                    elements.push({
                        type: "img",
                        url: GetEmoteUrl(emote)
                    })
                    continue
                }
            }

            elements.push({
                type: "text",
                text: word
            })
        }

        const merged = []
        let last: Text | Image | undefined = undefined
        for (const element of elements) {
            if (element.type === "text" && last?.type === "text") {
                last.text += element.text
            } else {
                last = element
                merged.push(element)
            }
        }

        return merged
    })
</script>


{#each elements as element}
    {#if element.type === "img"}
        <img src={element.url} alt="" aria-hidden="true">
    {:else}
        {element.text}
    {/if}
{/each}

<style>
    img {
        height: 1em;
        max-height: 100%;
        width: auto;
        aspect-ratio: 1;

        margin-left: 0.2em;
    }
</style>