import type { Song } from "@ts/features/song/model"

export default class SongQueue {
    public get queue() {
        return this.songs.slice(this.queuePointer, this.songs.length)
    }
    public get currentSong(): Song | undefined {
        return this.songs[this.queuePointer]
    }
    public get loaded() {
        return this.loadedSongs
    }

    private songs: Song[] = [];
    private loadedSongs: Song[] = [];
    private queuePointer: number = 0;

    public Next() {
        this.queuePointer++
        if (this.queuePointer > this.songs.length - 1) {
            this.queuePointer = 0
        }
        return this.currentSong
    }
    public Previous() {
        this.queuePointer--
        if (this.queuePointer < 0) {
            this.queuePointer = this.songs.length - 1
        }
        return this.currentSong
    }

    public PopulateQueue(
        songs: Song[],
        shuffle: boolean = false
    ) {
        this.LoadSongs(songs)
        this.UpdateQueue(shuffle)
    }

    public Add(song: Song) {
        this.songs.splice(this.queuePointer + 1, 0, song)
    }
    public Remove(song: Song) {
        const index = this.songs.findIndex((s) => s.id == song.id)
        if (index == -1) {
            console.error("Song not found in queue")
            return
        }
        this.songs.splice(index, 1)
    }
    public Reorder(ids: id[]) {
        const start = this.queuePointer
        const queueLength = this.songs.length - start

        if (ids.length !== queueLength) {
            console.error(`Cannot reorder queue: expected ${queueLength} ids, got ${ids.length}`)
            return
        }

        const songsById = new Map(this.songs.slice(start).map((song) => [song.id, song]))
        const reordered: Song[] = []

        for (const id of ids) {
            const song = songsById.get(id)
            if (!song) {
                console.error(`Cannot reorder queue: song ${id} is not in the queue`)
                return
            }
            reordered.push(song)
        }

        this.songs = [...this.songs.slice(0, start), ...reordered]
    }


    public ReShuffle(shuffle: boolean = true) {
        const song = this.currentSong
        this.UpdateQueue(shuffle)
        if (song) {
            if (shuffle) {
                const index = this.songs.findIndex(s => s.id === song.id)

                if (index !== -1) {
                    this.songs.splice(index, 1)
                }

                this.songs.unshift(song)
            }
            this.SkipTo(song)
        }
    }
    public SkipTo(song: Song) {
        const index = this.songs.findIndex((s) => s.id == song.id)
        if (index == -1) {
            console.error("Song not found in queue")
            return
        }
        this.queuePointer = index
    }
    public Clear() {
        this.loadedSongs = []
        this.songs = []
        this.queuePointer = 0
    }

    private LoadSongs(songs: Song[]) {
        this.loadedSongs = [...songs]
        this.queuePointer = 0
    }
    private UpdateQueue(shuffle: boolean = false) {
        if (!shuffle) {
            this.songs = [...this.loadedSongs]
            return
        }
        const newQueue = []
        const songsRemaining = [...this.loadedSongs]
        while (songsRemaining.length > 0) {
            const index = Math.floor(Math.random() * (songsRemaining.length - 1))
            newQueue.push(...songsRemaining.splice(index, 1))
        }
        this.songs = newQueue
    }
}