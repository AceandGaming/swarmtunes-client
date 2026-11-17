<script>
    import ItemList from "@ui/components/item-list.svelte"
    import { GetAllCollections } from "@ts/api/collection"
    import Ui from "@ts/state/ui.svelte.ts"

</script>

<div id="setlists">
    {#await GetAllCollections(undefined, {type: "setlist", limit: -1})}
        <div class="loading-text"></div>
    {:then collections}
        <ItemList items={collections.sort((a, b) => b.date - a.date)} onItemClick={(collection) => Ui.media.Show(collection)}/>
    {/await}
</div>

<style>
    #setlists {
        padding: 2rem;
        overflow-y: auto;
    }
</style>