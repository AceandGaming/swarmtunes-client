import { GetDiscoverPage } from "@ts/api/pages"
import SongProvider from "@ts/song-provider"
import CollectionProvider from "@ts/collection-provider"
import { PromiseAllObject } from "@ts/misc"

let content: Awaited<ReturnType<typeof GetDiscoverPage>> | undefined

export async function GetDiscover() {
    if (!content) {
        content = await GetDiscoverPage()
    }
    return await PromiseAllObject({
        setlists: CollectionProvider.GetMany(content.setlists, true),
        discs: CollectionProvider.GetMany(content.discs, true),
        originals: SongProvider.GetMany(content.originals, true),
        mashups: SongProvider.GetMany(content.mashups, true)
    })
}