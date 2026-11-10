import type { Playlist } from "@ts/models"
import PlaylistProvider from "@ts/playlist-provider"
import { SvelteSet } from "svelte/reactivity"

let likedSongs: Set<id> = new SvelteSet<id>()

export async function GetLikedSongsPlaylist(): Promise<Playlist> {
    const playlists = await PlaylistProvider.GetAll()
    return playlists.filter(playlist => playlist.type == "likedSongs")[0]
}
export async function Init() {
    const playlist = await GetLikedSongsPlaylist()
    await playlist.LoadSongs()
    likedSongs = new SvelteSet(playlist.GetSongIds())
}

export function IsSongLiked(songId: id) {
    return likedSongs.has(songId)
}
export async function ToggleSongLike(songId: id) {
    const playlist = await GetLikedSongsPlaylist()
    if (!playlist) {
        return
    }

    if (IsSongLiked(songId)) {
        await PlaylistProvider.RemoveSongsFromPlaylist(playlist.id, [songId])
        likedSongs.delete(songId)
    } else {
        await PlaylistProvider.AddSongsToPlaylist(playlist.id, [songId])
        likedSongs.add(songId)
    }
}