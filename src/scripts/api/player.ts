import { API_URL, HttpError, Get } from "./network"
import { PlayState } from "@ts/models/state"

const WS_URL = API_URL.replace(/^http/, "ws")

type WSPlay = {
    type: "play"
    data: {}
}
type WSPause = {
    type: "pause"
    data: {}
}
type WSSkip = {
    type: "skip"
    data: { time: number }
}
type WSNext = {
    type: "next"
    data: {}
}
type WSUpdateQueue = {
    type: "updateQueue"
    data: {
        loaded: id[]
        queue: id[]
    }
}
type WSShuffle = {
    type: "shuffle"
    data: {
        active: boolean
        queue: id[]
    }
}

export type WSClientPacket = WSPlay | WSPause | WSSkip | WSNext | WSUpdateQueue | WSShuffle

type WSStatePacket = {
    type: "newState"
    data: any
}
type WSErrorPacket = {
    type: "error"
    data: {
        code: string
        message: string
        details: any
        statusCode: number
    }
}

export type WSServerPacket = WSStatePacket | WSErrorPacket


export async function GetState(): Promise<PlayState | null> {
    const json = await Get("/player/")
    if (!json) {
        return null
    }
    return PlayState.FromDict(json)
}

export function Connect(onPacket: (packet: PlayState | HttpError) => void) {
    const ws = new WebSocket(`${WS_URL}/player/`)

    function Send(packet: WSClientPacket) {
        console.log("Sending packet", packet)
        ws.send(JSON.stringify(packet))
    }
    ws.onmessage = (e) => {
        const packet = JSON.parse(e.data) as WSServerPacket
        console.log("Received packet", packet)
        if (packet.type == "error") {
            onPacket(new HttpError(
                packet.data.code,
                packet.data.message,
                packet.data.details
            ))
        } else {
            onPacket(PlayState.FromDict(packet.data))
        }
    }
    ws.onopen = () => {
        console.log("Connected to server-side player")
    }

    return Send
}