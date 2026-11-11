import type { Attachment } from "svelte/attachments"

export function Wakelock(visible: boolean): Attachment {
    return (element) => {
        let wakeLock: WakeLockSentinel | undefined
        let disposed = false

        async function update() {
            if (!("wakeLock" in navigator)) return

            if (
                !visible ||
                document.visibilityState !== "visible"
            ) {
                //console.log("Unlock")

                await wakeLock?.release()
                wakeLock = undefined
                return
            }

            if (wakeLock) return

            try {
                //console.log("Lock")

                const lock = await navigator.wakeLock.request("screen")

                if (disposed) {
                    await lock.release()
                    return
                }

                wakeLock = lock

                lock.addEventListener("release", () => {
                    if (wakeLock === lock) {
                        wakeLock = undefined
                    }
                })
            } catch (error) {
                console.warn("Failed to acquire wake lock:", error)
            }
        }

        const visibilityChange = () => update()

        document.addEventListener("visibilitychange", visibilityChange)
        update()

        return () => {
            disposed = true
            document.removeEventListener("visibilitychange", visibilityChange)
            wakeLock?.release()
            wakeLock = undefined
        }
    }
}