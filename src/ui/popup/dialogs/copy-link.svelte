<script lang="ts">
    import Popup from "@ui/popup/ui.svelte"
    import Toasts from "@ui/toasts/state.svelte.ts"

    const { link }: {link: string} = $props()

    let visible = $state(true)

    function Submit() {
        navigator.clipboard.writeText(link)
        .then(() => {
            visible = false
            Toasts.Add("Copied to clipboard", "success")
        })
        .catch(console.error)
    }
</script>

<Popup bind:visible>
    <input type="text" value={link} readonly>
    {#snippet buttons()}
        <button onclick={Submit}>Copy</button>
    {/snippet}
</Popup>

<style>
    input {
        width: 100%;
        min-width: min(400px, 80vw);
    }
</style>