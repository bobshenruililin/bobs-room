# Bob’s Room

A walkable pixel room for Shen Ruililin: real stories about health, climate, computation, poetry, photography, and the places he calls home. Explore as a fox or rabbit, meet Duoji, open objects, and follow small discoveries at your own pace.

The room uses static HTML, CSS, native Canvas, and JavaScript modules. It has no runtime package dependencies, accounts, or analytics. Fonts, illustrations, photographs, and the CV are served locally. A browser-local journal remembers discovered stories and the selected visitor.

## Run locally

Use Node.js 20 or newer. No package installation or build step is required.

```sh
npm run dev
```

Open [localhost:4175](http://127.0.0.1:4175). Run `npm run check` for the configured syntax checks and automated tests, or `npm test` for tests alone.

## Explore

- Move with **WASD** or **arrow keys**, or click the floor to walk. Press **E** near an object to explore it. Touch controls are available on smaller screens.
- Select a glowing object, turn book pages, open research folders, browse photographs, change the window view, or play the arcade. A hidden TV has twelve channels of personal interests and unexpected detours.
- Choose **Wander with me** for a guided visual walk through the room. Pause, move between stops, or take over an object to explore at your own pace.
- Use **Read about Bob** for the room index and **Escape** to close an open dialog. The index, CV link, and email remain available without JavaScript.
- **Stillness** reduces ambient movement; the system’s reduced-motion preference is respected initially. Sound starts off and can be enabled explicitly.

## Project map

| File | Responsibility |
| --- | --- |
| `index.html` | Page structure, accessible controls, biography fallback, and sharing metadata |
| `app.mjs` | Room input, camera, visitors, dialogs, sound, and local journal |
| `engine.mjs` | World coordinates, walkable floor, obstacles, and pathfinding |
| `stories.mjs` | Biography, links, photograph descriptions, story markers, and approach positions |
| `personal.mjs` | Duoji’s three conversations and twelve TV channels with source links |
| `objects.mjs` / `discoveries.mjs` | Interactive object scenes and their cleanup |
| `drawer.mjs` | Research drawer’s complete open/closed desktop and phone scenes |
| `arcade.mjs` | Arcade presentation and independently testable game rules |
| `tour.mjs` | Guided stops, object actions, reading time, pause/resume, and visitor takeover |
| `style.css` / `discoveries.css` / `drawer.css` / `sofa.css` / `tour.css` | Room, object, and tour presentation, including responsive scene overlays |
| `assets/` | Local art, fonts and their licenses, photographs, and CV |
| `tests/` | Room geometry, story consistency, asset presence, and arcade tests |

Read [design and maintenance notes](docs/frontend-design.md) and [art direction and provenance](docs/art-direction.md) before replacing artwork, and [content sources](docs/content-sources.md) before changing biographical copy. A room-art change also requires reviewing story markers, walking approaches, collisions, and interactive hit areas.

The art inventory includes complete desktop/phone compositions for the sofa, drawer, Duoji, fern, globe, trunk, and TV; paired open/closed artwork for the sofa and drawer; two six-panel TV atlases; and the generated BOB emblem. Keep source PNGs, optimized WebP files, and their overlay coordinates together when replacing them.

## Publishing

The intended public repository is `bobshenruililin/bobs-room`; the expected GitHub Pages address is [bobshenruililin.github.io/bobs-room/](https://bobshenruililin.github.io/bobs-room/). Deployment has not yet been verified. These are the intended destination and URL, not a claim that the site is live.

The repository root is the static site and includes `.nojekyll`. After reviewing, committing, and pushing this folder to the intended repository, configure GitHub Pages to deploy from the `main` branch and `/ (root)`. No package publishing, compilation step, or custom domain is required. The `private` field in `package.json` prevents accidental npm publication; it does not set the GitHub repository’s visibility.

Preserve relative asset/module links so the site works under `/bobs-room/`; if the destination changes, update the canonical and social-sharing URLs in `index.html`. Verify the published page, its CV, fonts, images, and module requests after deployment.

## Checks and rights

Automated checks cover behavior and selected file references. The separate browser checklist in the design notes covers visual alignment, touch, focus, dialog behavior, and responsive layouts; an automated pass does not establish those results.

The [MIT license](LICENSE) applies to original software code only. Personal photographs, the CV, biographical/editorial content, and artwork are excluded from that grant. Bundled fonts use their own SIL Open Font License notices in `assets/fonts/`. See [content sources](docs/content-sources.md) for provenance and reuse boundaries.
