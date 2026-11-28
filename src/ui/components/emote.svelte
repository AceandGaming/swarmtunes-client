<script lang="ts">
    import { type Emote, GetEmoteUrl } from "@ts/api/external/7tv";

    const { emote }: { emote: Emote } = $props()
</script>

<img src={GetEmoteUrl(emote)} alt="" aria-hidden="true" loading="lazy">

<style>
    img {
        height: var(--emote-size, 1em);
        max-height: 100%;
        width: auto;
        aspect-ratio: 1;
    }
</style>