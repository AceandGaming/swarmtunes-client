import type { Playlist } from "@ts/features/playlist/model"
import { SvelteMap } from "svelte/reactivity"
import "@ts/state/session.svelte.ts"

class PlaylistStore {
    private playlists = new SvelteMap<string, Playlist>()
    private playlistArray = $derived(Array.from(this.playlists.values()))

    public Init(playlists: Playlist[]) {
        for (const playlist of playlists) {
            this.playlists.set(playlist.id, playlist)
        }
    }
    public Clear() {
        this.playlists.clear()
    }

    public Get(id: id) {
        return this.playlists.get(id)
    }
    public GetMany(ids: id[]) {
        return ids.map(id => this.Get(id)).filter(playlist => playlist !== undefined)
    }
    public GetAll() {
        return this.playlistArray
    }


    public Set(id: id, playlist: Playlist) {
        this.playlists.set(id, playlist)
    }
    public Delete(id: id) {
        this.playlists.delete(id)
    }

    public async AddSongsToPlaylist(id: id, songIds: id[]) {
        const playlist = this.Get(id)
        if (!playlist) {
            console.error("Playlist not found", id)
            return
        }

        await playlist.LoadSongs()

        for (const songId of songIds) {
            playlist.AddSong(songId)
        }
        this.Set(id, playlist)
    }

    public async RemoveSongsToPlaylist(id: id, songIds: id[]) {
        const playlist = this.Get(id)
        if (!playlist) {
            console.error("Playlist not found", id)
            return
        }

        await playlist.LoadSongs()

        for (const songId of songIds) {
            playlist.RemoveSong(songId)
        }
        this.Set(id, playlist)
    }
}

const playlistStore = new PlaylistStore()
export default playlistStore