import { SvelteURL } from "svelte/reactivity"

export const url = new SvelteURL(window.location.href)

window.addEventListener('popstate', () => {
    url.href = window.location.href
})


$effect.root(() => {
    $effect(() => {
        window.history.replaceState({}, "", url.href)
    })
})

export function GetSongId() {
    return url.searchParams.get("song")
}
export function ClearParams() {
    window.history.replaceState({}, "", url.href)
}

export function Navigate(path: string) {
    window.history.pushState({}, "", path)
    url.href = window.location.href
}