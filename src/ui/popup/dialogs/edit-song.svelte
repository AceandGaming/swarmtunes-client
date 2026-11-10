<script lang="ts">
    import { Song } from "@ts/models/song"
    import { GetCoverUrl, type PutData, PutSong } from "@ts/api/song"
    import "@ts/ui/cover.svelte"
    import Popup from "@ts/ui/popups/popup.svelte"
    import Cover from "@ts/ui/cover.svelte"
    import { IconUpload, IconX, IconTrash } from "@tabler/icons-svelte-runes"
    import { UploadCover } from "@ts/api/song"

    let visible = $state(true)
    let busy = $state(false)

    let files = $state<FileList | null>(null)
    let fileUrl: string | undefined = $state(undefined)

    $effect(() => {
        if (!files) {
            fileUrl = undefined
            return
        }

        const url = URL.createObjectURL(files[0])
        fileUrl = url

        return () => {
            URL.revokeObjectURL(url)
        }
    })


    const { song }: {song: Song} = $props()

    // svelte-ignore state_referenced_locally
    const newSong: PutData = $state({
        title: song.title,
        titleOriginal: song.titleOriginal,
    
        artists: song.artists.map(artist => ({ name: artist.name, originalName: artist.nameOriginal })),
        singers: song.singers.map(artist => ({ name: artist.name, originalName: artist.nameOriginal })),
        type: song.type,

        dateReleased: song.dateReleased.toISOString(),
        seconds: song.seconds,

        customArtwork: song.artworks["custom"],
    })

    async function Submit() {
        busy = true
        try {
            if (files) {
                if (!newSong.customArtwork) {
                    busy = false
                    return
                }
                await UploadCover("custom/" + newSong.customArtwork, files[0])
            }
            await PutSong(song.id, newSong)
        }
        finally {
            busy = false
        }

        visible = false
    }

    const coverObject = {
        GetArtwork(size: "small" | "medium" | "large"): string | undefined {
            if (fileUrl) {
                return fileUrl
            }

            let art
            if (newSong.customArtwork) {
                art = "custom/" + newSong.customArtwork
            }
            else if (newSong.singers.length > 0) {
                const totals: Record<string, number> = {}
                for (const singer of newSong.singers) {
                    const total = totals[singer.name] ?? 0
                    totals[singer.name] = total + 1
                }
                
                const max = Math.max(...Object.values(totals))
                const names = Object.keys(totals).filter(name => totals[name] == max)
                
                if (names.length > 1) {
                    art = "default/duet"
                }
                else if (names[0] === "Neuro-sama") {
                    art = "default/neuro"
                }
                else if (names[0] === "Evil Neuro") {
                    art = "default/evil"
                }
            }

            if (!art) {
                return
            }
            return GetCoverUrl(art, size)
        }
    }

</script>

<Popup title="Edit Song" bind:visible bind:busy >
    <div class="edit-song-popup">
        <div class="art-container">
            <Cover item={coverObject} --size={"256px"}/>
            {#if (files && !newSong.customArtwork)}
                <p style="color: red">Please enter a cover name</p>
            {/if}
            <div class="custom-input">
                <input bind:value={newSong.customArtwork} type="text" placeholder="Custom Artwork" />
                {#if (files !== null)}
                    <button class="icon-button" onclick={() => files = null}><IconTrash size={32}/></button>
                {:else}
                    {let input: HTMLInputElement | undefined = $state()}
                    <input bind:this={input} bind:files type="file" id="coverInput" accept="image/png" hidden>
                    <button class="icon-button" onclick={() => input?.click()}><IconUpload size={32}/></button>
                {/if}
            </div>
        </div>
        <div class="input-container">
            <input bind:value={newSong.title} type="text" placeholder="Title" />
            <input bind:value={newSong.titleOriginal} type="text" placeholder="Original Title" />
            <select bind:value={newSong.type}>
                <option value="cover">Cover</option>
                <option value="original">Original</option>
                <option value="collab">Collab</option>
                <option value="mashup">Mashup</option>
            </select>
        </div>
        <div class="artists-container">
            <ol>
                {#each newSong.artists as artist, index }
                    <li>
                        <input bind:value={artist.name} type="text" placeholder="Artist Name" />
                        <input bind:value={artist.originalName} type="text" placeholder="Original Artist Name" />
                        <button class="icon-button" onclick={() => newSong.artists.splice(index, 1)}><IconX size="auto"/></button>
                    </li>
                {/each}
            </ol>
            <button onclick={() => newSong.artists.push({ name: "", originalName: "" })}>Add Artist</button>
            <div class="spacer"></div>
            <ol>
                {#each newSong.singers as singer, index }
                    <li>
                       <input bind:value={singer.name} type="text" placeholder="Singer Name" />
                       <input bind:value={singer.originalName} type="text" placeholder="Original Singer Name" />
                       <button class="icon-button" onclick={() => newSong.singers.splice(index, 1)}><IconX size="auto"/></button>
                    </li>
                {/each}
            </ol>
            <button onclick={() => newSong.singers.push({ name: "", originalName: "" })}>Add Singer</button>
        </div>
    </div>
    

    {#snippet buttons()}
        <button onclick={() => visible = false}>Cancel</button>
        <button onclick={Submit}>Confirm</button>
    {/snippet}
</Popup>

<style>
    .edit-song-popup {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto 1fr;

        gap: 1rem;
    }

    .art-container, .input-container, .artists-container {
        display: flex;
        flex-direction: column;

        gap: 5px;

        .custom-input {
            display: flex;
            align-items: center;
        }
    }

    .art-container {
        grid-row: 1;
        grid-column: 1;
    }

    .input-container {
        grid-row: 1;
        grid-column: 2;
    }

    .artists-container  {
        grid-row: 2;
        grid-column: 1/3;

        .spacer {
            position: relative;
            height: 1rem;
            
            &:after {
                content: "";
                display: block;
                
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;

                height: 1px;
                background-color: var(--colour-text-muted);
                
            }
        }

        ol {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        li {
            display: flex;
            align-items: center;
            gap: 0.2rem;

            input {
                flex: 1;
            }
            button {
                flex: 0 0 32px;
            }
        }
    }

    ol {
        list-style: none;
    }
</style>