let wakeLock: WakeLockSentinel | undefined

export async function UpdateWakeLock(visible: boolean) {
    if (!("wakeLock" in navigator)) {
        return
    }

    if (document.visibilityState !== "visible" || !visible) {
        await wakeLock?.release()
        wakeLock = undefined
        return
    }

    if (wakeLock) return

    try {
        wakeLock = await navigator.wakeLock.request("screen")

        wakeLock.addEventListener("release", () => {
            wakeLock = undefined
        })
    } catch (error) {
        console.warn("Failed to acquire wake lock:", error)
    }
}