<script lang="ts">
    import { FormatDuration } from "@ts/misc"

    type Props = {
        played: number
        duration: number
        showText?: boolean
        thinkness?: number
        class?: string
        onSeek?: (fraction: number) => void
    }

    let { played, duration, showText = true, thinkness = 8, class: className = "seek", onSeek = undefined }: Props = $props()

    let playedPercent = $derived(played / duration || 0)

    let bar: HTMLDivElement
    let seeking = false

    function OnSeek(event: MouseEvent | TouchEvent) {
        if (!onSeek) {
            return
        }

        let x
        if (event instanceof MouseEvent) {
            x = event.clientX
        }
        else if (event instanceof TouchEvent) {
            x = event.changedTouches[0].clientX
        }
        else {
            return
        }
        const rect = bar.getBoundingClientRect()
        
        let fraction = (x - rect.left) / rect.width
        fraction = Math.min(1, Math.max(0, fraction))

        onSeek(fraction)
    }
</script>
<svelte:document
    onmousemove={(e) => {
        if (seeking) {
            OnSeek(e)
        }
    }}
    onmouseup={() => {
        seeking = false
    }}

    ontouchmove={(e) => {
        if (seeking) {
            OnSeek(e)
        }
    }}
    ontouchend={() => {
        seeking = false
    }}
></svelte:document>

<div 
    class={className}
    style:--played={`${(playedPercent * 100)}%`}
    style:--thinkness={`${thinkness}px`}
>
    {#if showText }
        <div class="time sub-text">{FormatDuration(played, true)}</div>
    {/if}
    <div 
        class="bar"
        bind:this={bar}
        onmousedown={(e) => {
            seeking = true
            OnSeek(e)
        }}
        ontouchstart={(e) => {
            seeking = true
            OnSeek(e)
        }}

        role="slider"
        aria-valuenow="{playedPercent * 100}"
        tabindex="0"
    >
    </div>
    {#if showText }
        <div class="time sub-text">{FormatDuration(played - duration, true)}</div>
    {/if}
    
</div>

<style>
    @property --played {
        syntax: "<percentage>";
        inherits: true;
        initial-value: 0%;
    }

    .seek {
        container-type: inline-size;

        display: flex;
        flex-direction: row;
        align-items: center;

        gap: 5px;
    }
    .bar {
        flex: 1;
        height: var(--thinkness);

        background: linear-gradient(
            to right,
            var(--colour-progress) 0%,
            var(--colour-progress) var(--played),
            #00000030 var(--played),
            #00000030 100%
        );
        border-radius: 999px;

        transition: --played 0.2s ease, height 0.2s ease-in-out;
    }
    .bar:hover {
        height: calc(var(--thinkness) + 2px);
    }
    .time {
        width: 45px;
        text-align: center;
        font-size: medium;
    }

    @container (max-width: 200px) {
        .time {
            display: none;
        }
    }
</style>