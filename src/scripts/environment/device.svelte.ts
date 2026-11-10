import { MediaQuery } from "svelte/reactivity"

export default {
    get behavesMobile() {
        return new MediaQuery("pointer: coarse").current
    },
    get looksMobile() {
        return new MediaQuery("max-width: 600px").current
    }
}