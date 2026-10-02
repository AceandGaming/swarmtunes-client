type StateDict = {
    currentTime: number
    playing: boolean
    shuffleActive: boolean

    queue: id[]
    loadedSongs: id[]
}

export class PlayState {
    constructor(
        public readonly currentTime: number,
        public readonly playing: boolean,
        public readonly shuffleActive: boolean,

        public readonly queue: id[],
        public readonly loaded: id[]
    ) { }
    public static FromDict(dict: StateDict) {
        return new PlayState(
            dict.currentTime,
            dict.playing,
            dict.shuffleActive,
            dict.queue,
            dict.loadedSongs
        )
    }
}