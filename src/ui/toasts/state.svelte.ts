type Toast = {
    id: number
    message: string
    type: "default" | "success" | "failure"
    markup: boolean
}

const toasts: Toast[] = $state([])

export function GetToasts() {
    return toasts
}

export default {
    Add(message: Toast["message"], type: Toast["type"] = "default", useMarkup: boolean = false, duration: number = 3000) {
        const toast = {
            id: Date.now(),
            message,
            type,
            markup: useMarkup
        }

        toasts.push(toast)

        setTimeout(() => {
            const i = toasts.findIndex(t => t.id == toast.id)
            if (i == -1) {
                return
            }
            toasts.splice(i, 1)
        }, duration)
    },
    AddPersistent(message: Toast["message"], useMarkup: boolean = false, type: Toast["type"] = "default") {
        const toast = {
            id: Date.now(),
            message,
            type,
            markup: useMarkup
        }

        toasts.push(toast)

        return () => {
            const i = toasts.findIndex(t => t.id == toast.id)
            if (i == -1) {
                return
            }
            toasts.splice(i, 1)
        }
    }
}