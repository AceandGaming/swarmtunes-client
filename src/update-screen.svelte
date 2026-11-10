<script lang="ts">
    let width: number = $state(0)
    let height: number = $state(0)

    const neuro = $state({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        flip: false,
        dragging: false
    })
    const evil = $state({
        x: 1,
        y: 0,
        vx: 0,
        vy: 0,
        flip: true,
        dragging: false
    })

    function UpdatePlush(plush: typeof neuro | typeof evil) {
        if (plush.dragging) {
            return
        }

        plush.x += plush.vx
        plush.y += plush.vy

        plush.vx *= 0.99
        plush.vy *= 0.99

        if (plush.x < 0) {
            plush.x = 0
            if (plush.vx < 0) {
                plush.vx *= -0.8
            }
        }
        if (plush.x > 1) {
            plush.x = 1
            if (plush.vx > 0) {
                plush.vx *= -0.8
            }
        }
        if (plush.y < 0) {
            plush.y = 0
            if (plush.vy < 0) {
                plush.vy *= -0.8
            }
        }
        if (plush.y > 1) {
            plush.y = 1
            if (plush.vy > 0) {
                plush.vy *= -0.8
            }
        }

        plush.vy -= 0.001

        if (plush.vx > 0) {
            plush.flip = false
        }
        else if (plush.vx < 0) {
            plush.flip = true
        }
    }
    function Update() {
        UpdatePlush(neuro)
        UpdatePlush(evil)
    }

    const mouseStart = {x: 0, y: 0}
    function OnMouseDown(event: MouseEvent) {
        mouseStart.x = event.clientX
        mouseStart.y = event.clientY

        const el = event.target as HTMLElement

        const sx = (event.clientX - 50) / (width - 100)
        const sy = 1 - (event.clientY - 50) / (height - 100)

        if (el.id == "neuro") {
            neuro.dragging = true
            neuro.x = sx
            neuro.y = sy
        } else if (el.id == "evil") {
            evil.dragging = true
            evil.x = sx
            evil.y = sy
        }
    }
    function OnMouseUp(event: MouseEvent) {
        neuro.dragging = false
        evil.dragging = false
    }

    function OnMouseMove(event: MouseEvent) {
        const sx = (event.clientX - 50) / (width - 100)
        const sy = 1 - (event.clientY - 50) / (height - 100)

        if (neuro.dragging) {
            neuro.vx = (sx - neuro.x + neuro.vx) / 2
            neuro.x = sx

            neuro.vy = (sy - neuro.y + neuro.vy) / 2
            neuro.y = sy
        }
        else if (evil.dragging) {
            evil.vx = (sx - evil.x + evil.vx) / 2
            evil.x = sx

            evil.vy = (sy - evil.y + evil.vy) / 2
            evil.y = sy
        }
    }

    setInterval(Update, 1000 / 60)
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<svelte:document onmouseup={OnMouseUp} onmousemove={OnMouseMove} />


<main id="update-screen">
    <div class="center">
        <img src="/icon.png" alt="">
        <h1>Updating Swarmtunes</h1>
    </div>

    <div 
        id="neuro" 
        style={`left: ${neuro.x * (width - 100)}px; top: ${(1 - neuro.y) * (height - 100)}px;`}
        style:transform={neuro.flip ? "scaleX(-1)" : undefined}

        onmousedown={OnMouseDown}
    >
        <img src="https://api.swarmtunes.com/v2/covers/plush/neuro" alt="">
    </div>
    <div 
        id="evil" 
        style={`left: ${evil.x * (width - 100)}px; top: ${(1 - evil.y) * (height - 100)}px;`}
        style:transform={evil.flip ? "scaleX(-1)" : undefined}

        onmousedown={OnMouseDown}
    >
        <img src="https://api.swarmtunes.com/v2/covers/plush/evil" alt="">
    </div>
</main>

<style>
    main {
        position: fixed;
        inset: 0;

        background-color: var(--colour-surface);
    }
    .center {
        position: absolute;

        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    img {
        height: min(40vmin, 300px);
        width: auto;
    }

    h1 {
        width: fit-content;
        font-weight: bold;
        
        font-size: 32px;
    }
    
    h1:after {
        font-family: monospace;
        content: "...";

        clip-path: inset(0 3ch 0 0);
        animation: l4 1s steps(4) infinite;
    }

    #neuro, #evil {
        position: absolute;
        width: 100px;
        height: 100px;

        img {
            width: 100%;
            height: 100%;
        }
    }
</style>