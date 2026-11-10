<script lang="ts">
    import Desktop from "./desktop.svelte"
    import Mobile from "./mobile.svelte"
    import Device from "@ts/environment/device.svelte.ts"
</script>

{#if Device.looksMobile}
    <Mobile />
{:else}
    <Desktop />
{/if}
