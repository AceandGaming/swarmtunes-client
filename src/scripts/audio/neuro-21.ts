import AudioPlayer from '@ts/audio/audio'
import { Song } from '@ts/models/song'

export default class Neuro21Radio extends AudioPlayer {
    public get played(): number {
        return this.audio.currentTime
    }
    public set played(value: number) { }
    public get duration(): number {
        return 0
    }
    public get isPlaying(): boolean {
        return !this.audio.paused
    }

    public GetIframe() {
        return undefined
    }

    private audio: HTMLAudioElement

    private CreateSong() {
        return new Song(
            "neuro21", 
            "Neuro 21", 
            undefined, 
            [], 
            [],   
            {},
            new Date(Date.now()),
            "cover",
            -1,
            true,
            "neuro21",
            "neuro21",
            false
        )
    }

    constructor(onPlay: () => void, onPause: () => void, onUpdate: () => void, onEnded: () => void, onMetadata: (song: Song) => void) {
        super(onPlay, onPause, onUpdate, onEnded)

        this.audio = new Audio()
    
        this.audio.onplay = onPlay
        this.audio.onpause = onPause
        this.audio.ontimeupdate = onUpdate
        this.audio.onended = onEnded

        this.audio.onloadedmetadata = () => {
            onMetadata(this.CreateSong())
        }
    }

    public async Load(song: Song): Promise<void> {
        this.audio.src = "https://radio.twinskaraoke.com/listen/neuro_21/radio.mp3"
    }


    public Play(): void {
        this.audio.play()
    }
    public Pause(): void {
        this.audio.pause()
    }
    public Destroy(): Promise<void> | void {
        this.audio.src = ""

        this.audio.remove()
        // @ts-ignore
        this.audio = null
    }
    public SetVolume(volume: number): void {
        this.audio.volume = volume
    }
}