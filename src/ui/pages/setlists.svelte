<script>
    import ItemList from "@ui/components/item-list.svelte"
    import { GetAllCollections } from "@ts/api/collection"
    import MediaView from "@ui/views/media-view/media-view.svelte.ts"

</script>

<div id="setlists">
    {#await GetAllCollections(undefined, {type: "setlist", limit: -1})}
        <div class="loading-text"></div>
    {:then collections}
        <ItemList items={collections.sort((a, b) => b.date - a.date)} onItemClick={(collection) => MediaView.Show(collection)}/>
    {/await}
</div>

<style>
    #setlists {
        padding: 2rem;
        overflow-y: auto;
    }
</style>