<script lang="ts">
    import Link from "@ui/components/link.svelte"
</script>

<div class="about">
    <h1>Music Credits</h1>
    <p>
        Swarmtunes would not be possible without the music below.
    </p>

    <h2>Neuro-sama/Evil Neuro Covers</h2>
    <p>All karaoke covers are collected from <b>An Unofficial Neuro Karaoke Archive</b></p>
    <ul>
        <li><Link href="https://discord.com/channels/574720535888396288/1337588612845539349">Discord</Link></li>
        <li><Link href="https://drive.google.com/drive/folders/1B1VaWp-mCKk15_7XpFnImsTdBJPOGx7a">Google Drive</Link></li>
    </ul>

    <h2>Official Releases and Collabs</h2>
    <p>All original and collaboration songs are sourced from YouTube.</p>
    <ul>
        <li><Link href="https://www.youtube.com/@Neurosama">Neuro-sama</Link></li>
        <li><Link href="https://www.youtube.com/channel/UCdjLJvro7Q3V0M2V2pwWfZA">Camila</Link></li>
        <li><Link href="https://www.youtube.com/c/AkumaNihmuneCh">Nihmune</Link></li>
        <li><Link href="https://www.youtube.com/@willstetson">Will Stetson</Link></li>
        <li><Link href="https://www.youtube.com/@obkatiekat">obkatiekat</Link></li>
    </ul>

    <h2>SwarmFM</h2>
    <ul>
        <li><Link href="https://discord.gg/swarm-fm-1327042091200807024">Discord</Link></li>
        <li><Link href="https://player.sw.arm.fm/">Website</Link></li>
    </ul>

    <h1>Art Credits</h1>
    <p>
        All of these artists are very talented!
        <br>
        <i>If you feel you haven't been credited and should be, or have been mis-credited, <b>please let me know!</b></i>
    </p>

    <h2>DISC 1, 3, 5 - <b>@paccha_</b></h2>
    <ul>
        <li><Link href="https://twitter.com/paccha_7">Twitter</Link></li>
        <li><Link href="https://www.pixiv.net/en/users/96121842">Pixiv</Link></li>
        <li><Link href="https://linktr.ee/paccha_">Linktree</Link></li>
    </ul>

    <h2>DISC 2 - <b>@kapxaplus</b></h2>
    <ul>
        <li><Link href="https://twitter.com/kapxapius">Twitter</Link></li>
        <li><Link href="https://www.instagram.com/kapxapius/">Instagram</Link></li>
        <li><Link href="https://www.pixiv.net/en/users/85622115">Pixiv</Link></li>
    </ul>

    <h2>DISC 4 - <b>@ppchan__</b></h2>
    <ul>
        <li><Link href="https://twitter.com/pinkpink939">Twitter</Link></li>
        <li><Link href="https://space.bilibili.com/179061053">Bilibili</Link></li>
    </ul>

    <h2>DISC 6 - <b>@koilccc</b></h2>
    <ul>
        <li><Link href="https://twitter.com/koilccc">Twitter</Link></li>
        <li><Link href="https://bsky.app/profile/koilccc.bsky.social">Bluesky</Link></li>
    </ul>

    <h2>DISC 7 - <b>@nostyx_x</b></h2>
    <ul>
        <li><Link href="https://twitter.com/nostyx_x">Twitter</Link></li>
        <li><Link href="https://linktr.ee/nostyx_x">Linktree</Link></li>
    </ul>

    <h2>DISC 8 - <b>@lukuwo</b></h2>
    <ul>
        <li><Link href="https://twitter.com/lukuwo2333">Twitter</Link></li>
        <li><Link href="https://space.bilibili.com/626079830">Bilibili</Link></li>
    </ul>
    <h2>DISC 9 - <b>@lingyouzzz</b></h2>
    <ul>

    </ul>

    <h2>Extras</h2>
    <ul>
        <li>The Neuro and Evil <Link href="https://images.swarmtunes.com/">covers</Link> were made by me.</li>
        <li><Link href="https://www.makeship.com/shop/creator/vedal">Plush Images</Link></li>
    </ul>

    <h1>Links</h1>
    <ul>
        <li><Link href="https://swarmtunes.com">Main Site</Link></li>
        <li><Link href="https://api.swarmtunes.com">API</Link></li>
        <li><Link href="https://www.twitch.tv/vedal987">Neuro-sama</Link> (Unaffiliated)</li>
        <li><Link href="https://player.sw.arm.fm/">SwarmFM</Link> (Unaffiliated)</li>
        <li>
            GitHub
            <ul>
                <li><Link href="https://github.com/AceandGaming/swarmtunes-client">Client</Link></li>
                <li><Link href="https://github.com/AceandGaming/swarmtunes-server">Server</Link></li>
                <li><Link href="https://github.com/AceandGaming/swarmfm-api">SwarmFM API</Link></li>
            </ul>
        </li>
        <li><Link href="https://discord.com/channels/574720535888396288/1451487201056653365">Discord</Link></li>
    </ul>

    <h1>Special Thanks</h1>
    <img src="https://images.swarmtunes.com/neuro_plush.png" alt="A plush of Neuro-sama">
    <img src="https://images.swarmtunes.com/evil_plush.png" alt="A plush of Evil Neuro">
</div>

<style>
    .about {
        padding: 10px;
        overflow-y: scroll;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: white;
    }

    h1 {
        font-size: 2rem;
    }
    h2 {
        font-size: 1.5rem;
    }

    :is(h1, h2) {
        margin: 20px 10px;
        font-weight: bold;
    }

    h1:not(:first-child) {
        margin-top: 80px;
        margin-bottom: 20px;
    }

    p {
        margin: 10px 20px;
    }

    ul {
        padding-left: 50px;
    }

    img {
        width: 30vw;
    }

    @media (max-width: 600px) {
        p, h1, h2 {
            text-align: center;
        }
    }
</style>