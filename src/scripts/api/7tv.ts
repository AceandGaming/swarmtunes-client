const TV_API_URL = "https://7tv.io/v3"

type EmoteFile = {
    name: string
    width: number
    height: number
    format: string
}
export type Emote = {
    id: string
    name: string
    host: {
        url: string
        files: EmoteFile[]
    }
}

async function GetJSON(url: string) {
    const reponse = await fetch(`${TV_API_URL}/${url}`)
    if (!reponse.ok) {
        throw new Error(`Failed to get ${url}`)
    }
    return reponse.json()
}

export async function GetEmotesOfChannel(channelId: string): Promise<Emote[]> {
    const json = await GetJSON(`emote-sets/${channelId}`)
    const emotes = json.emotes.map((e: any) => e.data)
    return emotes
}
export function GetEmoteUrl(emote: Emote, size: number = 32) {
    let closest
    let minDistance = Infinity
    for (const file of emote.host.files) {
        if (file.format !== "WEBP") {
            continue
        }

        const distance = Math.abs(file.width - size)
        if (distance < minDistance) {
            minDistance = distance
            closest = file
        }
    }

    if (!closest) {
        closest = emote.host.files[0]
    }

    return `https:${emote.host.url}/${closest.name}`
}