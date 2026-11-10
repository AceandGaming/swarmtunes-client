import { url } from "@ts/reactive/location.svelte"

export function Navigate(path: string) {
    window.history.pushState({}, "", path)
    url.href = window.location.href
}