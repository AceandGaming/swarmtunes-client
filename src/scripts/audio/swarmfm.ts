import SwarmFMApi from '@aceandgaming/swarmfm-api'
import type { SwarmFMMetadata, SwarmFMSong } from '@aceandgaming/swarmfm-api'
import AudioPlayer from '@ts/audio/audio'
import { Song } from '@ts/models/song'
import { GetCoverUrl } from '@ts/api/song'
import Toasts from "@ts/toast.svelte.ts"

export default class SwarmFMRadio extends AudioPlayer {
    public get played(): number {
        return this.api.currentTime
    }
    public set played(value: number) { }
    public get duration(): number {
        return this.api.current?.duration || 0
    }
    public get isPlaying(): boolean {
        return this.api.playing
    }

    private iframe: HTMLIFrameElement
    private api: SwarmFMApi

    public GetIframe() {
        return this.iframe
    }

    private CreateSongFromMetadata(meta: SwarmFMSong) {
        const singers = []
        for (let name of meta.singer) {
            singers.push({ "neuro": "Neuro-sama", "evil": "Evil Neuro" }[name.toLowerCase()] || name)
        }
        const hasNeuro = meta.singer.includes("neuro")
        const hasEvil = meta.singer.includes("evil")

        let coverUrl

        if (!meta.album_cover_id) {
            let name
            if (hasNeuro && hasEvil) {
                name = "duet"
            }
            else if (hasNeuro) {
                name = "neuro"
            }
            else if (hasEvil) {
                name = "evil"
            }

            coverUrl = GetCoverUrl(`default/${name}`, "large")
        }
        else {
            coverUrl = `https://swarmfm-assets.boopdev.com/album_covers/${meta.album_cover_id}.png`
        }

        const song = new Song(
            "swarmfm",
            meta.name,
            undefined,
            [{ name: meta.artist }],
            singers.map(a => ({ name: a })),
            {},
            new Date(Date.now()),
            "cover",
            meta.duration,
            true,
            "swarmfm",
            meta.id,
            false,
            coverUrl
        )

        return song
    }

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void, onMetadata: (song: Song) => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        this.api = new SwarmFMApi()

        this.iframe = this.api.CreateIFrame({
            silent: "all",
            autoplay: false,
            controls: false
        })

        this.api.addEventListener("onplay", onPlay)
        this.api.addEventListener("onpause", onPause)
        this.api.addEventListener("ontimeupdate", onUpdate)
        this.api.addEventListener("onmetadatachange", async (meta: SwarmFMMetadata) => {
            const current = meta.current

            const song = this.CreateSongFromMetadata(current)

            onMetadata(song)
        })

        document.body.append(this.iframe)
    }

    public async Load(song: Song): Promise<void> {
        const RemoveToast = Toasts.AddPersistent("Loading...")
        try {
            await this.api.WaitForReady()
        }
        finally {
            RemoveToast()
        }
    }


    public Play(): void {
        this.api.Play()
    }
    public Pause(): void {
        this.api.Pause()
    }
    public Destroy(): Promise<void> | void {
        this.iframe.remove()
    }
    public SetVolume(volume: number): void {
        this.api.volume = volume
    }
}