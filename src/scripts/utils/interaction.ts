export function Interaction({onClick, onHeld, onContextMenu, holdSeconds = 0.5, maxDistance = 10}: {
    onClick?: (e: PointerEvent) => void, 
    onHeld?: (e: PointerEvent) => void, 
    onContextMenu?: (e: PointerEvent) => void, 
    holdSeconds?: number 
    maxDistance?: number
}) {
    let timeout: ReturnType<typeof setTimeout> | undefined
    let startPos: { x: number, y: number } | undefined

    let fired = false
    let moved = false

    function clear() {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = undefined
        startPos = undefined
    }

    function pointerDown(e: PointerEvent) {
        fired = false
        moved = false

        if (e.pointerType === "mouse") {
            if (e.button === 2) {
                onContextMenu?.(e)
            }
            else if (e.button !== 0) {
                return
            }
        }

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {

            fired = true

            onHeld?.(e)
            if (e.pointerType === "touch") {
                onContextMenu?.(e)
            }
        }, holdSeconds * 1000)

        startPos = { x: e.clientX, y: e.clientY }
    }
    function pointerUp(e: PointerEvent) {
        if (e.button !== 0) {
            return
        }

        if (!fired && !moved) {
            onClick?.(e)
        }
        clear()
    }
    function pointerMove(e: PointerEvent) {
        if (!startPos) {
            return
        }
        let x = e.clientX
        let y = e.clientY

        let distance = Math.sqrt((x - startPos.x) ** 2 + (y - startPos.y) ** 2)
        if (distance > maxDistance) {
            clear()
            moved = true
        }
    }
    function pointerLeave(e: PointerEvent) {
        clear()
    }

    return (el: HTMLElement) => {
       el.addEventListener("pointerdown", pointerDown)
       el.addEventListener("pointerup", pointerUp)
       el.addEventListener("pointermove", pointerMove)
       el.addEventListener("pointerleave", pointerLeave)

       return () => {
           el.removeEventListener("pointerdown", pointerDown)
           el.removeEventListener("pointerup", pointerUp)
           el.removeEventListener("pointermove", pointerMove)
           el.removeEventListener("pointerleave", pointerLeave)
           clear()
       }
    }
}