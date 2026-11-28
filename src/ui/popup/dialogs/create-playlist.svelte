<script lang="ts">
    import Popup from "@ui/popup/ui.svelte"
    import PlaylistProvider from "@ts/features/playlist/provider"
    import { HttpError } from "@ts/api/network"
    import EmoteSelector from "@ui/components/emote-selector.svelte";

    let visible = $state(true)
    let busy = $state(false)
    let name = $state("")

    let errorMessage = $state("")

    async function Submit() {
        busy = true
        try {
            await PlaylistProvider.CreatePlaylist(name)
        }
        catch (e) {
            if (e instanceof HttpError) {
                errorMessage = e.message
                return
            }
            console.error(e)
            errorMessage = "An unknown error occurred"
        }
        finally {
            busy = false
        }
        
        visible = false
    }
    $effect(() => {
        name;
        errorMessage = ""
    })
</script>

<Popup title="Create Playlist" bind:visible bind:busy>
    <div class="input-wrapper">
        <input 
            class:error={errorMessage} 
            type="text" 
            placeholder="Playlist Name" 
            
            bind:value={name}

    
            onkeydown={(e) => e.key === "Enter" && Submit()}
        >
        <EmoteSelector onEmoteSelect={(emote) => {name += `:${emote.name}`}} />
    </div>
    
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
    {#snippet buttons()}
        <button onclick={Submit}>Create</button>
    {/snippet}
</Popup>

<style>
    p.error {
        color: red;
        font-size: 0.8rem;
    }
    input.error {
        border-color: red;
    }

    .input-wrapper {
        position: relative;
        margin-bottom: 20px;

        width: fit-content;

        > :global(.select-emote) {
            position: absolute;
            top: 50%;
            right: 10px;
            height: 70%;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    input {
        padding-right: 40px;
    }
</style>
