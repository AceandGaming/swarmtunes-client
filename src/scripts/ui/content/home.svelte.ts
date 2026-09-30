import { GetHomePage } from "@ts/api/pages"
import SongProvider from "@ts/song-provider"
import CollectionProvider from "@ts/collection-provider"
import { type SwarmFMMetadata } from "@aceandgaming/swarmfm-api"
import { api as SwarmFM } from "@ts/api/external/swarmfm"

let content: Awaited<ReturnType<typeof GetHomePage>> | undefined

let swarmfm: SwarmFMMetadata | undefined = $state.raw()
let swarmfmLoopActive = false
let swarmfmTime = $state(0)

export async function GetHome() {
    if (!content) {
        content = await GetHomePage()
    }

    const [[setlists, discs, recentlyPlayed], [originals, mashups]] = await Promise.all([
        CollectionProvider.GetBatched([content.setlists, content.discs, content.recentlyPlayed], true),
        SongProvider.GetBatched([content.originals, content.mashups], true)
    ])

    return {
        recentlyPlayed,
        setlists,
        discs,
        originals,
        mashups
    }
}
export function GetSwarmFMMetadata() {
    if (!swarmfmLoopActive) {
        swarmfmLoopActive = true
        UpdateSwarmfm()
    }

    return swarmfm
}
export function GetSwarmFMTime() {
    return swarmfmTime
}

async function UpdateSwarmfm() {
    console.log("Fetching Swarmfm meta")
    const meta = await SwarmFM.FetchMetadata()

    swarmfmTime = meta.position
    swarmfm = meta

    setTimeout(UpdateSwarmfm, (meta.current.duration - meta.position) * 1000)
}
setInterval(() => {
    swarmfmTime++
}, 1000)