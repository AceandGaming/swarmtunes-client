import { GetEmotesOfChannel, type Emote } from "@ts/api/7tv"

const CHANEL_IDS = [
    "01K1H87ZZVE92Y3Z37H3ES6BK8",   //Swarmfm
    "01GN2QZDS0000BKRM8E4JJD3NV"    //Vedal
]

const emotes: Map<string, Emote> = new Map()

export async function LoadEmotes() {
    for (const channelId of CHANEL_IDS) {
        const emotesOfChannel = await GetEmotesOfChannel(channelId)
        for (const emote of emotesOfChannel) {
            emotes.set(emote.name, emote)
        }
    }
}
export function GetEmoteByName(name: string): Emote | undefined {
    return emotes.get(name)
}