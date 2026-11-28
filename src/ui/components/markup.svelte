<script lang="ts" module>
    type MarkupType = "italic" | "bold" | "plain"

    type TextNode = {
        type: "text"
        text: string
    }
    type EmoteNode = {
        type: "emote"
        emote: EmoteType
    }
    type MarkupNode = TextNode | EmoteNode

    type MarkupSegment = {
        type: MarkupType
        nodes: MarkupNode[]
    }
</script>

<script lang="ts">
    import { GetEmoteByName } from "@ts/emotes"
    import { GetEmoteUrl } from "@ts/api/external/7tv"
    import type { Emote as EmoteType } from "@ts/api/external/7tv"
    import Emote from "@ui/components/emote.svelte"

    const { content }: { content: string } = $props()

    const markup: MarkupSegment[] = $derived.by(() => {
        const markup: MarkupSegment[] = []
        let buffer = ""
        let type: MarkupType = "plain"

        function Segment(): MarkupSegment {
            let segment = markup[markup.length - 1]
            if (segment?.type !== type) {
                segment = { type, nodes: [] }
                markup.push(segment)
            }
            return segment
        }

        function Pop() {
            if (buffer.length === 0) {
                return
            }
            Segment().nodes.push({ type: "text", text: buffer })
            buffer = ""
        }

        function PushEmote(emote: EmoteType) {
            Pop()
            Segment().nodes.push({ type: "emote", emote })
        }

        for (let i = 0; i < content.length; i++) {
            const char = content[i]

            if (char === "*" && type !== "italic") {
                Pop()
                type = type === "plain" ? "bold" : "plain"
                continue
            }
            if (char === "_" && type !== "bold") {
                Pop()
                type = type === "plain" ? "italic" : "plain"
                continue
            }
            if (char === ":" && (i === 0 || /\s/.test(content[i - 1]))) {
                let end = i + 1
                while (end < content.length && !/\s/.test(content[end])) {
                    end++
                }

                const emote = GetEmoteByName(content.slice(i + 1, end))
                if (emote) {
                    PushEmote(emote)
                    i = end - 1
                    continue
                }
            }

            buffer += char
        }

        Pop()

        return markup
    })
</script>

{#snippet inline(nodes: MarkupNode[])}
    {#each nodes as node}
        {#if node.type === "emote"}
            <Emote emote={node.emote} />
        {:else}
            {node.text}
        {/if}
    {/each}
{/snippet}

{#each markup as segment}
    {#if segment.type === "bold"}
        <b>{@render inline(segment.nodes)}</b>
    {:else if segment.type === "italic"}
        <i>{@render inline(segment.nodes)}</i>
    {:else}
        {@render inline(segment.nodes)}
    {/if}
{/each}


