import { url } from "@ts/environment/location.svelte.ts"

export function Navigate(path: string) {
    window.history.pushState({}, "", path)
    url.href = window.location.href
}