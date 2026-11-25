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

    function clear() {
        console.log("CLEAR")

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = undefined
        startPos = undefined
    }

    function pointerDown(e: PointerEvent) {
        console.log(e.pointerType, e.button)

        fired = false
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
            console.log("HELD")

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

        if (!fired) {
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