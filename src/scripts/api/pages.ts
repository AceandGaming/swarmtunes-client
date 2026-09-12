import { Get } from "./network"

export async function GetDiscoverPage() {
    const json = await Get("/discover-ids")
    return {
        setlists: json.setlists as id[],
        discs: json.discs as id[],
        originals: json.originals as id[],
        mashups: json.mashups as id[]
    }
}