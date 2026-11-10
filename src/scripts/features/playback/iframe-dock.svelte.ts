import PlaybackState from "@ts/features/playback/playback.svelte.ts";

export function DockIFrame() {
    return (element: HTMLElement) => {
        element.style.anchorName = "--iframe-dock"

        PlaybackState.iframe?.classList.add("docked")

        return () => {
            element.style.anchorName = ""
            PlaybackState.iframe?.classList.remove("docked")
        }
    }
}