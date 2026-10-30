import { GetHomePage } from "@ts/api/pages"
import SongProvider from "@ts/song-provider"
import CollectionProvider from "@ts/collection-provider"
import { type SwarmFMMetadata } from "@aceandgaming/swarmfm-api"
import { api as SwarmFM } from "@ts/api/external/swarmfm"


let swarmfm: SwarmFMMetadata | undefined = $state.raw()
let swarmfmInterval: number | null = null
let swarmfmTime = $state(0)

export function GetHome() {
    const contentPromise = GetHomePage()

    const collectionsPromise = contentPromise.then(content =>
        CollectionProvider.GetBatched(
            [content.setlists, content.discs, content.recentlyPlayed],
            true
        )
    )

    const songsPromise = contentPromise.then(content =>
        SongProvider.GetBatched(
            [content.originals, content.mashups],
            true
        )
    )

    return {
        setlists: collectionsPromise.then(([setlists]) => setlists),
        discs: collectionsPromise.then(([, discs]) => discs),
        recentlyPlayed: collectionsPromise.then(([, , recentlyPlayed]) => recentlyPlayed),

        originals: songsPromise.then(([originals]) => originals),
        mashups: songsPromise.then(([, mashups]) => mashups)
    }
}

export function GetSwarmFMMetadata() {
    if (!swarmfmInterval) {
        UpdateSwarmfm()
    }

    return swarmfm
}
export function GetSwarmFMTime() {
    return swarmfmTime
}

async function UpdateSwarmfm() {
    if (swarmfmInterval) {
        clearInterval(swarmfmInterval)
    }

    console.log("Fetching Swarmfm meta")
    const meta = await SwarmFM.FetchMetadata()

    swarmfmTime = meta.position
    swarmfm = meta

    swarmfmInterval = setInterval(UpdateSwarmfm, (meta.current.duration - meta.position) * 1000)
}
setInterval(() => {
    swarmfmTime++
}, 1000)