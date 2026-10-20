let visible: boolean = $state(false)

export default {
    get visible() {
        return visible
    },

    Show() {
        visible = true
    },

    Hide() {
        visible = false
    }
}

let wakeLock: any

async function UpdateWakeLock() {
    if (!('wakeLock' in navigator)) {
        console.warn('Screen Wake Lock API not supported.');
        return
    }
    if (document.visibilityState !== 'visible') {
        return
    }

    if (visible) {
        if (wakeLock) {
            return
        }
        console.log("Requesting wake lock")

        wakeLock = await navigator.wakeLock.request('screen')
        wakeLock.addEventListener('release', () => {
            console.log("Wake lock released")
            wakeLock = undefined
            if (visible) {
                UpdateWakeLock()
            }
        })
        console.log("Wake lock acquired")
    }
    else {
        console.log("Releasing wake lock")
        wakeLock?.release()
        wakeLock = undefined
    }
}

$effect.root(() => {
    $effect(() => {
        UpdateWakeLock()
    })
})

document.addEventListener("visibilitychange", UpdateWakeLock)