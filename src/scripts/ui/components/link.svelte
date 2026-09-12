<script lang="ts">
    import { Navigate } from "@ts/urlbar.svelte.ts"
    import type { Snippet } from "svelte"

    let { href, children, ...props }: { href: string, children: Snippet, [prop: string]: any } = $props()
</script>

<a
    {href}
    onclick={(e) => {
        if (
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
        ) {
            return
        }

        e.preventDefault()
        Navigate(href)
    }}
    {...props}
>
    {@render children()}
</a>