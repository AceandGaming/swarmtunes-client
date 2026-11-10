<script lang="ts">
    import PlaylistStore from "@ts/features/playlist/store.svelte.ts"
    import ItemCards from "@ui/components/item-cards.svelte"
    import { auth } from "@ts/state/auth.svelte.ts"
    import { ShowLogin, CreatePlaylist } from "@ui/popup/state.svelte.ts"
    import { session } from "@ts/state/session.svelte.ts";
    import ErrorScreen from "@ui/components/error-screen.svelte"

</script>

<div id="playlists-tab">
    {#if auth.loggedIn}
        {#if session.loading}
            <div class="loading-text"></div>
        {:else}
            <button onclick={() => CreatePlaylist()}>Create Playlist</button>
            <ItemCards items={PlaylistStore.GetAll()} grid={true} />
        {/if}
    {:else}
        <ErrorScreen title="Login Required" >
            <button onclick={() => ShowLogin()}>Login</button>
        </ErrorScreen>
    {/if}
</div>

<style>
    #playlists-tab {
        display: flex;
        flex-direction: column;
        padding: 20px;
        overflow-y: auto;
    }

    button {
        width: 140px;
        margin-bottom: 20px;
    }

    .loading-text {
        margin: 20px auto;
    }

    @media (max-width: 600px) {
        #playlists-tab {
            padding: 10px;
        }
        button {
            margin: 20px auto;
            padding: 5px 8px;
        }
    }
</style>