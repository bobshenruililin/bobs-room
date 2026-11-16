# Bob’s Room

Shen Ruililin’s personal website: an introduction to Bob, a few questions that became research and projects, and an invitation to keep the conversation going. The editorial homepage gives a first-time visitor a clear way in; the original walkable pixel room remains available at [`room.html`](room.html).

The site uses static HTML, CSS, native Canvas, and JavaScript modules, with no runtime package dependencies, accounts, or analytics. Fonts, illustrations, photographs, and the CV are served locally. The homepage has its own small enhancement script and does not initialize the game. Inside the room, a browser-local journal remembers the twelve checkpoints and the selected visitor.

## Run locally

Use Node.js 20 or newer. No package installation or build step is required.

```sh
npm run dev
```

Open [localhost:4175](http://127.0.0.1:4175). Run `npm run check` for the configured syntax checks and automated tests, or `npm test` for tests alone.

## Visitor paths

| Where to begin | What it offers |
| --- | --- |
| [`index.html`](index.html) | Bob’s introduction, four selected projects, personal photographs, the CV, and contact links |
| `#project-asterwind`, `#project-crossing`, `#project-heat`, `#project-careers` on the homepage | A direct route to one selected project; ordinary anchor links become a keyboard-operable project selector when JavaScript is available |
| [`room.html`](room.html) | The preserved immersive room: walk as a fox or rabbit, meet Duoji, open objects, and follow discoveries at your own pace |
| [`room.html#room-index`](room.html#room-index) | Read the room’s twelve story summaries, with a no-JavaScript fallback |
| `room.html#story-<id>` | Open a known room story directly, for example [`#story-poetry`](room.html#story-poetry) or [`#story-duoji`](room.html#story-duoji) |
| [`careers/`](careers/) and [`link-s/`](link-s/) | Independent pages for Career Atlas and the LINK-S group introduction game |

All four project descriptions and their links are present in the homepage HTML. Without JavaScript they appear in sequence; with JavaScript the selector shows one at a time. Arrow keys, Home, End, Enter, and Space operate the enhanced selector. Personal-photo cycling and the Hong Kong time label are optional local enhancements. Essential copy and navigation do not depend on animation, sound, a runtime AI call, or a loading sequence.

Existing root `#room-index` links redirect to the preserved room index when JavaScript is available; a static fallback link remains on the homepage. Closing a directly linked room story clears its story fragment without adding another history entry. All room story IDs and the existing `bobs-room:v1` journal key remain unchanged.

## Explore the room

- Move with **WASD** or **arrow keys**, or click the floor to walk. Press **E** near an object to explore it. Touch controls are available on smaller screens.
- Select a glowing object, turn book pages, open research folders, browse photographs, change the window view, or play the arcade. A hidden TV has twelve channels of personal interests and unexpected detours.
- Play **Moonlight Blocks** in the arcade: move, rotate, and drop pieces to complete rows. The floor Go board offers a quiet local two-player 9×9 practice game.
- Unfold the small atlas beside the globe to see Bob’s travel list coloured on a pixel world map. The atlas and Go board are part of the room illustration, with the same glowing markers, walking approaches, and journal entries as the other objects.
- Choose **Wander with me** for a guided visual walk through seventeen stops and twelve room checkpoints. Pause, move between stops, or take over an object to explore at your own pace.
- Use **Read about Bob** for the room index and **Escape** to close an open dialog. The index, CV link, and email remain available without JavaScript.
- **Stillness** reduces ambient movement; the system’s reduced-motion preference is respected initially. Sound starts off and can be enabled explicitly.

## Project map

| File | Responsibility |
| --- | --- |
| `index.html` | Editorial homepage, selected project copy and credits, personal introduction, contact links, and sharing metadata |
| `home.css` / `home.mjs` | Homepage typography and layout; progressive project selector, photo cycling, Hong Kong time, and legacy-index redirect |
| `room.html` | Preserved room structure, accessible controls, biography fallback, and room-specific sharing metadata |
| `app.mjs` | Room input, camera, visitors, dialogs, direct story routing, sound, and local journal |
| `engine.mjs` | World coordinates, walkable floor, obstacles, and pathfinding |
| `stories.mjs` | Room biography, links, photograph descriptions, story markers and approach positions, and validated story-fragment lookup |
| `personal.mjs` | Duoji’s three conversations and twelve TV channels with source links |
| `objects.mjs` / `discoveries.mjs` | Interactive object scenes and their cleanup |
| `drawer.mjs` | Research drawer’s complete open/closed desktop and phone scenes |
| `arcade.mjs` / `arcade.css` | Moonlight Blocks: falling pieces, row clears, scoring, next-piece preview, pause/restart, and cabinet presentation |
| `go.mjs` / `go.css` | Local 9×9 Go practice, legal moves/captures, simple ko, undo/pass, and the generated tabletop |
| `travel.mjs` / `scripts/build-map.mjs` | Editable travel list, Canvas map rendering, and deterministic geographic raster generation |
| `tour.mjs` | Guided stops, object actions, reading time, pause/resume, and visitor takeover |
| `style.css` / `discoveries.css` / `drawer.css` / `sofa.css` / `tour.css` / `personal.css` | Room, object, tour, travel atlas, and contact-note presentation |
| `assets/` | Local art, fonts and their licenses, photographs, CV, and published project imagery |
| `assets/projects/provenance.json` | Original sources, credits, retrieval dates, dimensions, hashes, and limitations for the two project images |
| `tests/` | Room geometry, story/index consistency, direct-story validation, asset presence, approved CV digest, falling-block rules, Go rules, and map data checks |

Read [design and maintenance notes](docs/frontend-design.md) and [art direction and provenance](docs/art-direction.md) before replacing artwork, and [content sources](docs/content-sources.md) before changing biographical copy. A room-art change also requires reviewing story markers, walking approaches, collisions, and interactive hit areas.

The art inventory includes complete desktop/phone compositions for the sofa, drawer, Duoji, fern, globe, trunk, and TV; paired open/closed artwork for the sofa and drawer; two six-panel TV atlases; the generated BOB emblem, the portrait Moonlight Blocks cabinet, and the Go tabletop. The active `room-v4` illustration includes the atlas and floor Go board directly; the earlier separate floor sprite is retained only as production history. Keep source PNGs, optimized WebP files, and their overlay coordinates together when replacing them.

## Updating the travel map

Edit `TRAVELS` in `travel.mjs` to update the list. The current list has thirty-two places, with thirty coloured on the map; Singapore and Hong Kong remain listed without special markers or enlargement at this scale. Other listed places are coloured gold.

The map is a fixed **480 × 240** geographic grid derived from Natural Earth country polygons, not generated artwork. Changing the travel list does not require rebuilding the geography. To regenerate the underlying grid, download the GeoJSON linked in `assets/maps/provenance.json`, then run:

```sh
node scripts/build-map.mjs path/to/ne_50m_admin_0_countries.geojson
```

The script records the source URL, SHA-256 digest, and pixel-cell method alongside `world-pixels.json`. Natural Earth map data is [public domain](https://www.naturalearthdata.com/about/terms-of-use/); see the [map provenance notes](docs/content-sources.md#travel-map-data).

## Publishing

The public repository is [bobshenruililin/bobs-room](https://github.com/bobshenruililin/bobs-room). The homepage destination is [bobshenruililin.github.io/bobs-room/](https://bobshenruililin.github.io/bobs-room/); the preserved room destination is [bobshenruililin.github.io/bobs-room/room.html](https://bobshenruililin.github.io/bobs-room/room.html). Historical deployment checks and new-revision verification belong in [the validation record](docs/frontend-design.md#validation-record); an earlier successful deployment does not verify a later revision.

The repository root is the static site and includes `.nojekyll`. GitHub Pages deploys from the `main` branch and `/ (root)`; pushing changes to `main` publishes an update. No package publishing, compilation step, or custom domain is required. The `private` field in `package.json` prevents accidental npm publication; it does not set the GitHub repository’s visibility.

Preserve relative asset/module links so the site works under `/bobs-room/`; keep `room.html` beside the homepage so existing room paths continue to resolve. If the destination changes, update canonical and social-sharing URLs in both HTML pages. Verify the published homepage, room, direct links, CV, fonts, images, and module requests after deployment.

## Checks and rights

Automated checks cover behavior and selected file references. The separate browser checklist in the design notes covers visual alignment, touch, focus, dialog behavior, and responsive layouts; an automated pass does not establish those results.

The [MIT license](LICENSE) applies to original software code only. Personal photographs, the CV, biographical/editorial content, and artwork are excluded from that grant. Bundled fonts use their own SIL Open Font License notices in `assets/fonts/`. The Natural Earth geographic data has its separate public-domain status. See [content sources](docs/content-sources.md) for provenance and reuse boundaries.
