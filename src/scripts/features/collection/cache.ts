import type { Collection } from "@ts/models"

class CollectionCache {
    private collections = new Map<string, Collection>()

    public GetMany(ids: id[]): Collection[] {
        return ids.map(id => this.collections.get(id)).filter(collection => collection !== undefined)
    }
    public Get(id: id): Collection | undefined {
        return this.GetMany([id])[0]
    }
    public Set(id: id, song: Collection): void {
        this.collections.set(id, song)
    }
}

const cache = new CollectionCache()
export default cache