import type AudioPlayer from "@ts/audio/audio"
import SongQueue from "@ts/song-queue"
import type { Song } from "@ts/models/song"
import OggPlayer from "@ts/audio/ogg"
import YoutubePlayer from "@ts/audio/youtube"
import SwarmFMRadio from "@ts/audio/swarmfm"
import StoredValue from "@ts/stored-value"
import { Connect, GetState, type WSClientPacket } from "@ts/api/player"
import SongProvider from "@ts/song-provider"
import type { PlayState } from "@ts/models/state"
import { HttpError } from "@ts/api/network"

type Callbacks = {
    loadedSong: (song: Song, iframe?: HTMLIFrameElement) => void
    playPause: (playing: boolean) => void
    shuffle: (shuffle: boolean) => void
    repeat: (repeat: boolean) => void
    timeUpdate: (current: number, duration: number) => void
    queueChange: (queue: Song[], loaded: Song[]) => void
    volumeChange: (volume: number) => void
}

class PlaybackController {
    public get currentSong() {
        return this.queue.currentSong
    }

    private volumeStore = new StoredValue("volume", 0.75)

    public get volume() {
        return this.volumeStore.get()
    }
    public set volume(value: number) {
        this.volumeStore.set(value)
        if (this.player) {
            this.player.SetVolume(value)
        }

        this.Trigger("volumeChange", value)
    }

    private shuffleStore = new StoredValue("shuffle", false)

    public get shuffle() {
        return this.shuffleStore.get()
    }
    private set shuffle(value: boolean) {
        this.shuffleStore.set(value)
    }

    private repeatStore = new StoredValue("repeat", false)

    public get repeat() {
        return this.repeatStore.get()
    }
    private set repeat(value: boolean) {
        this.repeatStore.set(value)
    }


    private queue = new SongQueue()

    private player?: AudioPlayer
    private preload?: AudioPlayer

    private callbacks: { [K in keyof Callbacks]?: Function[] } = {}

    private SendPacket: (packet: WSClientPacket) => void

    private LoadPreloaded() {
        this.player = this.preload
        this.preload = undefined
    }

    private OnTimeUpdate() {
        if (!this.player) {
            return
        }

        this.Trigger("timeUpdate",
            this.player.played,
            this.player.duration,
        )
    }

    private async OnStatePacket(state: PlayState) {
        if (state.shuffleActive != this.shuffle) {
            this.shuffle = state.shuffleActive
            this.Trigger("shuffle", state.shuffleActive)
        }
        if (state.playing != this.player?.isPlaying) {
            if (state.playing) {
                this.player?.Play()
            } else {
                this.player?.Pause()
            }
            this.Trigger("playPause", state.playing)
        }

        const lastSong = this.currentSong
        const [queueSongs, loadedSongs] = await SongProvider.GetBatched([state.queue, state.loaded], true)
        this.queue.Override(queueSongs, loadedSongs)
        if (lastSong !== this.currentSong) {
            this.PlaySong(this.currentSong!)
        }

        this.Trigger("queueChange", queueSongs, loadedSongs)

        if (Math.abs(state.currentTime - (this.player?.played ?? 0)) > 2) {
            if (this.player) {
                this.player.played = state.currentTime
            }
            this.Trigger("timeUpdate", state.currentTime, queueSongs[0].seconds)
        }
    }

    constructor() {
        GetState().then(state => {
            if (state) {
                this.OnStatePacket(state)
            }
        })
        this.SendPacket = Connect((p) => {
            if (p instanceof HttpError) {
                throw p
            } else {
                this.OnStatePacket(p)
            }
        })
    }

    private async UpdatePlayer(song: Song): Promise<AudioPlayer> {
        let PlayerClass: typeof AudioPlayer

        if (song.audioInfo!.type === "youtube") {
            PlayerClass = YoutubePlayer
        }
        else {
            PlayerClass = OggPlayer
        }

        if (!this.player || this.player.constructor !== PlayerClass) {
            this.player?.Destroy()
            // @ts-ignore
            this.player = new PlayerClass(
                () => this.Trigger("playPause", true),
                () => this.Trigger("playPause", false),
                () => this.OnTimeUpdate(),
                () => this.Next(),
            ) as AudioPlayer
        }

        this.preload?.Destroy()
        this.preload = undefined

        return this.player
    }
    private SwarmfmPlayer() {
        if (!this.player || this.player.constructor !== SwarmFMRadio) {
            this.player?.Destroy()
            // @ts-ignore
            this.player = new SwarmFMRadio(
                () => { this.Trigger("playPause", true) },
                () => { this.Trigger("playPause", false) },
                () => this.OnTimeUpdate(),
                () => this.Next(),
                (song) => this.Trigger("loadedSong", song, this.player!.GetIframe()),
            ) as AudioPlayer
        }

        this.preload?.Destroy()
        this.preload = undefined

        return this.player
    }

    private async PlaySong(song: Song) {
        if (!song.audioInfo.playable) {
            this.Next()
            return
        }

        const player = await this.UpdatePlayer(song)
        await player.Load(song)
        this.Trigger("loadedSong", song, player.GetIframe())

        player.SetVolume(this.volume)

        player.Play()
    }
    private async PlaySwarmfm() {
        const player = this.SwarmfmPlayer()
        await player.Load(this.currentSong!)

        player.SetVolume(this.volume)

        player.Play()
    }

    public Play({ song, songs, swarmfm = false }: { song?: Song, songs?: Song[], swarmfm?: boolean } = {}) {
        if (swarmfm) {
            this.PlaySwarmfm()
            return
        }

        if (songs) {
            this.queue.PopulateQueue(songs, this.shuffle)
        }
        if (song) {
            if (!songs) {
                this.queue.PopulateQueue([song], this.shuffle)
            }
            this.queue.SkipTo(song)
        }
        if (song || songs) {
            this.TriggerQueue()
            this.PlaySong(this.currentSong!)
            this.SendQueue()
        }
        else {
            this.player?.Play()
        }

        this.SendPacket({ type: "play", data: {} })
    }
    public Pause() {
        this.player?.Pause()

        this.SendPacket({ type: "pause", data: {} })
    }
    public PlayPause() {
        if (this.player?.isPlaying) {
            this.Pause()
        } else {
            this.Play()
        }
    }

    public Seek(time: number) {
        if (!this.player) {
            return
        }

        this.player.played = time

        this.Trigger("timeUpdate", time, this.player.duration)
        this.SendPacket({
            type: "skip", data: {
                time: time
            }
        })
    }
    public SeekPercent(percent: number) {
        if (!this.player) {
            return
        }

        this.Seek(this.player.duration * percent)
    }
    public SeekSkip(relative: number) {
        if (!this.player) {
            return
        }

        this.Seek(this.player.played + relative)
    }

    public SetShuffle(shuffle: boolean) {
        if (this.shuffle === shuffle) return

        this.queue.ReShuffle(shuffle)
        this.TriggerQueue()

        this.shuffle = shuffle
        this.Trigger("shuffle", shuffle)
        this.SendPacket({
            type: "shuffle", data: {
                active: shuffle,
                queue: this.queue.queue.map(s => s.id)
            }
        })
    }
    public ToggleShuffle() {
        this.SetShuffle(!this.shuffle)
    }
    public SetRepeat(repeat: boolean) {
        if (this.repeat === repeat) return

        this.repeat = repeat
        this.Trigger("repeat", repeat)
    }
    public ToggleRepeat() {
        this.SetRepeat(!this.repeat)
    }

    public async Next() {
        if (this.repeat) {
            if (this.player) {
                this.player.played = 0
            }
            return
        }

        const nextSong = this.queue.Next()
        if (!nextSong) {
            return
        }
        this.TriggerQueue()

        if (this.preload) {
            this.LoadPreloaded()
            return
        }

        this.PlaySong(nextSong)
        this.SendPacket({ type: "next", data: {} })
    }
    public async Previous() {
        if (this.repeat || (this.player && this.player.played > 10)) {
            if (this.player) {
                this.player.played = 0
            }
            return
        }

        const nextSong = this.queue.Previous()
        if (!nextSong) {
            return
        }
        this.TriggerQueue()

        this.PlaySong(nextSong)
        this.SendQueue()
    }

    public SkipTo(song: Song) {
        this.queue.SkipTo(song)
        this.TriggerQueue()

        this.PlaySong(this.currentSong!)
        this.SendQueue()
    }
    public AddToQueue(song: Song) {
        this.queue.Add(song)
        this.TriggerQueue()

        this.SendQueue()
    }
    public RemoveFromQueue(song: Song) {
        const previousSong = this.queue.currentSong
        this.queue.Remove(song)

        if (this.currentSong !== previousSong && this.currentSong) {
            this.PlaySong(this.currentSong)
        }

        this.TriggerQueue()
        this.SendQueue()
    }
    public ReorderQueue(ids: id[]) {
        const previousSong = this.currentSong
        this.queue.Reorder(ids)

        if (previousSong !== this.currentSong) {
            this.PlaySong(this.currentSong!)
        }

        this.TriggerQueue()
        this.SendQueue()
    }

    public AddCallback<K extends keyof Callbacks>(event: K, callback: Callbacks[K]) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = []
        }
        this.callbacks[event].push(callback)
    }
    private Trigger(event: keyof Callbacks, ...data: any) {
        if (!this.callbacks[event]) {
            return
        }
        //console.log("Trigged", event, data)
        this.callbacks[event].forEach(callback => callback(...data))
    }
    private TriggerQueue() {
        this.Trigger("queueChange", this.queue.queue, this.queue.loaded)
    }
    private SendQueue() {
        this.SendPacket({
            type: "updateQueue", data: {
                queue: this.queue.queue.map(s => s.id),
                loaded: this.queue.loaded.map(s => s.id)
            }
        })
    }
}


const playbackController = new PlaybackController()
export default playbackController