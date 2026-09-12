import { Collection } from "@ts/models/collection"
import { Get, Post } from "./network"

type CollectionType = "setlist" | "collection"

export async function GetCollection(id: id): Promise<Collection> {
    const json = await Get(`/collections/${id}`)
    return Collection.FromDict(json)
}
export async function GetCollections(ids: id[]): Promise<Collection[]> {
    const json = await Post(`/collections/batch`, { ids })
    return json.map(Collection.FromDict)
}

export async function GetAllCollections(ids?: id[], options: { type?: CollectionType, offset?: number, limit?: number } = {}): Promise<Collection[]> {
    const params = new URLSearchParams()

    if (ids) {
        for (const id of ids) {
            params.append("id", id)
        }
    }

    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) {
            params.set(key, String(value))
        }
    }

    const json = await Get(`/collections/?${params.toString()}`)
    return json.map(Collection.FromDict)
}


export async function GetSongsOfCollection(id: id): Promise<id[]> {
    const json = await Get(`/collections/${id}/songs`)
    return json
}