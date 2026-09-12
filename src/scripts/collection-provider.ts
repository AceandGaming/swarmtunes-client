import { Collection } from "@ts/models/collection"
import CollectionCache from "@ts/collection-cache"
import { GetCollection, GetCollections } from "@ts/api/collection"

export default class CollectionProvider {
    public static async Get(id: id): Promise<Collection> {
        let collection = CollectionCache.Get(id)
        if (collection) {
            return collection
        }

        collection = await GetCollection(id)
        CollectionCache.Set(id, collection)
        return collection
    }
    public static async GetMany(ids: id[], retainOrder = false): Promise<Collection[]> {
        const collections = CollectionCache.GetMany(ids)
        const storedIds = collections.map(collection => collection.id)

        const missing = ids.filter(id => !storedIds.includes(id))
        if (missing.length == 0) {
            return collections
        }

        const newCollections = await GetCollections(missing)
        for (const collection of newCollections) {
            CollectionCache.Set(collection.id, collection)
        }

        const result = [...collections, ...newCollections]
        if (retainOrder) {
            return result.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
        }

        return result
    }
}