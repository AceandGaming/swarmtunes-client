<script lang="ts">
    import Desktop from "./desktop.svelte"
    import Mobile from "./mobile.svelte"
    import Device from "@ts/device.svelte"
</script>

{#if Device.behavesMobile}
    <Mobile />
{:else}
    <Desktop />
{/if}
