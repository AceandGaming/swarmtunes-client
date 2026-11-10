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