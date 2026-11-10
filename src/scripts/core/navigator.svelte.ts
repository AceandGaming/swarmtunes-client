import { url as currentUrl } from "@ts/environment/location.svelte.ts"
import { IconLayoutGrid, IconWorld, IconSettings} from "@tabler/icons-svelte-runes";
import type { Component } from "svelte";
import { openUrl } from '@tauri-apps/plugin-opener';
import { isTauri } from '@tauri-apps/api/core'

export type Page = {
    name: string
    icon?: Component,
    import: () => Promise<{default: any}>,
    label: string,
    hidden: boolean
}

const pages: {[key: string]: Page} = {}
function AddPage(page: Page) {
    pages[page.name] = page
}

AddPage({
    name: "library",
    icon: IconLayoutGrid,
    import: () => import("@ui/pages/playlists.svelte"),
    label: "Playlists",
    hidden: false
})
AddPage({
    name: "home",
    icon: IconWorld,
    import: () => import("@ui/pages/home/ui.svelte"),
    label: "Home",
    hidden: false
})
AddPage({
    name: "settings",
    icon: IconSettings,
    import: () => import("@ui/pages/settings.svelte"),
    label: "Settings",
    hidden: false
})
AddPage({
    name: "about",
    import: () => import("@ui/pages/credits.svelte"),
    label: "Credits",
    hidden: true
})
AddPage({
    name: "setlists",
    import: () => import("@ui/pages/setlists.svelte"),
    label: "Setlists",
    hidden: true
})
AddPage({
    name: "mediaview",
    import: () => import("@ui/pages/media-view.svelte"),
    label: "Media View",
    hidden: true
})

let currentPage: Page = $state(pages.home)

$effect.root(() => {
    $effect(() => {
        window.history.pushState({}, "", currentPage.name)
    })
})

export const mediaviewPage = $state(pages.mediaview)

export default {
    get current() {
        return currentPage
    },
    get pages() {
        return pages
    },

    Navigate(href: string) {
        const url = new URL(href, currentUrl)
        if (url.host != currentUrl.host) {
            if (isTauri()) {
                openUrl(url.href)
            }
            else {
                window.open(url.href, "_blank")
            }
            return
        }

        const name = url.pathname.split("/")[1]
        console.log(name)
        if (name in pages) {
            currentPage = pages[name]
        }
        else {
            console.warn(`Page ${name} not found`)
            currentPage = pages.home
        }
    },
    Goto(page: Page) {
        currentPage = page
    },
}