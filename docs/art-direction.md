# Art direction and provenance

Production record: 7 October 2026. The illustrations were generated for Bob’s Room using the built-in OpenAI image-generation tool. The approved direction is a warm, intimate, lantern-lit pixel room: dark green furnishings, honey-colored wood, quiet harbor light, readable silhouettes, and small objects that invite exploration.

Generated PNGs are retained as source artwork. Paired WebP files are optimized delivery copies; conversion is for web delivery, with no separate artistic post-processing step. The visitor atlas remains a PNG. Runtime crop coordinates, Canvas drawing, and CSS positioning place the generated art within the interactive scene.

## Pixel scale

The main room’s approved composition and native pixel granularity are the visual reference. Its working coordinate space and current image size are **1536 × 1024**. Preserve that scene’s proportions and object placement when maintaining its interactions.

Closeups should feel like zooming into that world. The newer sofa, drawer, dog nook, album, fern, television, globe, trunk, arcade, and note-paper assets intentionally use larger, simpler pixel clusters: approximately **128 × 85 logical pixels** for landscape compositions and **85 × 128** for portraits. These are appearance targets for generation, not claims that the exported PNG has those dimensions. Scene PNGs are 1536 × 1024 in landscape and 1024 × 1536 in portrait; isolated characters and props can have other export sizes.

Character direction targets recognizable **48 × 48** or **64 × 64 logical-pixel** sprites, depending on the character and pose. The generated atlas/export can be larger. Preserve crisp edges and simple poses when selecting frame crops; do not add fine fur, texture, gradients, or tiny highlights that make the sprites look more detailed than the room.

The main room and book established the object identities. Later closeups preserve those identities with the requested coarser treatment. The sofa and drawer now use complete, continuous scenes with their paper drawn into the same image. Their closed states were generated as edits of the open composition, preserving the surroundings. Avoid fine paper grain and painterly detail. Readable text belongs in HTML over blank illustrated paper, with button hit areas aligned to visible objects.

## Asset map

Names below are relative to `assets/art/`. Every basename in the table has both a `.png` source and `.webp` delivery copy, except the explicitly named sprite atlas and JSON files.

| Asset | Role and replacement constraints |
| --- | --- |
| `room-v2` | Active main room and social-sharing image. Coordinate changes require updates to markers, walking approaches, collisions, and starting positions. |
| `book` | Open poetry book. Keep clear page areas for HTML copy, bookmark, and page-turn affordances. |
| `drawer-scene-open`, `drawer-scene-closed` | Complete landscape research-drawer states: drawer on the left, blank paper on the right. Preserve the handle, three folder positions, paper bounds, and tiny toy-brick hit area. |
| `drawer-phone-open`, `drawer-phone-closed` | Complete portrait drawer states: compact drawer above the larger paper. Keep matching composition between states and maintain separate phone overlay coordinates. |
| `sofa-nook`, `sofa-closed` | Complete landscape sofa states; `sofa-nook` is the open/revealed state. Preserve the cushion, hidden remote, and paper for the three introduction pages. |
| `sofa-phone-open`, `sofa-phone-closed` | Complete portrait sofa states. The paper and sofa share one generated composition; preserve the corresponding phone hit areas. |
| `duoji-nook`, `duoji-phone` | Landscape and portrait conversation settings. The portrait is a complete composition; retain the speech-paper area and illustrated dog placement. |
| `shiba-closeup` | Duoji’s isolated closeup character for the desktop conversation. Preserve black-and-tan coloring, coarse silhouette, and transparency. |
| `photo-album` | Open album backing for six real photographs. Match the photo-frame overlay positions and mobile paging presentation. |
| `fern-nook`, `fern-phone` | Landscape and portrait lantern/fern discovery. Preserve lantern and firefly hit areas plus the revealed photograph space. |
| `globe-scene`, `globe-phone` | Landscape and portrait weather folio. Preserve blank paper and the globe/two-page interaction geometry. |
| `trunk-scene`, `trunk-phone` | Landscape and portrait fieldwork trunk, notebook, and map. Preserve paper and both discovery hit areas. |
| `tv-set`, `tv-phone` | Landscape and portrait television housing. Preserve screen bounds, the channel-caption area, and dial/power-control positions for each composition. |
| `tv-hobbies` | Three-column/two-row atlas: agency, LEGO typewriter, Anywhere Door, curated gadget detour, fine dining, Gundam. Match zero-based frames 0–5 in `personal.mjs`. |
| `tv-detours` | Three-column/two-row atlas: medical club, laureate forum, rationality, physics tournament, AI racing, World Scholar’s Cup. Match zero-based frames 0–5 in `personal.mjs`. |
| `bob-emblem` | Generated BOB room mark. WebP is the header image; PNG is the favicon. Essential name text remains in the page. |
| `arcade-cabinet` | Portrait arcade housing. Keep the Canvas screen opening clear and aligned with its overlay. |
| `note-paper` | Portrait paper backing for utility content. Maintain a broad, calm writing surface and minimal grain. |
| `shanghai`, `singapore`, `hong-kong` | Illustrated city views for the window. Preserve shared framing, palette, and recognizable silhouettes. These are imagined views, not photographs. |
| `rug` | Liftable rug. Preserve the curled-corner affordance and matching scene proportions. |
| `shiba` | Duoji’s in-room character art. Preserve his miniature black-and-tan Shiba identity and current crop alignment. |
| `visitors.png` | Fox/rabbit atlas. Keep each pose isolated and compatible with the selected crops. |
| `frames.json` | Sprite-crop metadata used by the renderer; update it whenever the atlas or Shiba source changes. |

`room`, `drawer`, and `cushion` PNG/WebP pairs are retained earlier production references. Current room, drawer, and sofa rendering uses the scene assets above. `assets/favicon.svg` is also retained; the active favicon is `bob-emblem.png`.

Exact prompts retained from selected revisions are in [generation-prompts.json](generation-prompts.json). The continuous drawer’s four production prompts are in [drawer-scene-prompts.json](../assets/art/drawer-scene-prompts.json); the fern, globe, and trunk portrait prompts are in [phone-scenes-prompts.json](../assets/art/phone-scenes-prompts.json); the portrait TV brief is in [tv-phone-prompt.json](../assets/art/tv-phone-prompt.json). These records can include replaced outputs and are separate from the active inventory above.

## Representative reproduction notes

The briefs below are reconstructed production guidance. They summarize the intended result and are **not a verbatim archive of every prompt used**. Generation is nondeterministic; recreating the exact exported pixels is not guaranteed. Use the approved room and relevant existing object as visual references when replacing an asset.

**Main room.** Create a warm, intimate pixel-art apartment at dusk overlooking a magical harbor, with honey-colored lantern light, dark green accents, a research desk, book piles, three arched windows, a sofa and tea table, photograph wall, travel trunk, globe, arcade, and fern. Preserve a readable open floor for small animal visitors. Make the objects distinct enough to explore. Keep signs and paper free of essential lettering so the interface can supply real text.

**Book.** Create a close view of an open book belonging to the same room. Reserve generous, quiet page surfaces for real text and clear space for a bookmark. Match the established palette and hard pixel edges.

**Continuous sofa and drawer states.** Generate a complete room-object composition containing both the object and a large blank cream paper surface. For desktop, arrange the drawer on the left and paper on the right; for a phone, use a compact drawer above a larger paper surface. Make the handle and three folders distinct and include a tiny toy brick. For the sofa, preserve the cushion, hidden remote, and blank introduction paper. Generate each open composition first, then edit only the moving object into its closed state while preserving camera, paper, lighting, and all surroundings. Use chunky pixels with no smooth paper grain. Do not substitute separately assembled paper or a fake cover for the scene.

**Landscape discoveries.** Reimagine the specified room object as a scene drawn on roughly a 128 × 85 logical-pixel grid and enlarged with crisp edges. Use large deliberate pixel clusters, simple lighting, dark green surroundings, and warm paper or wood. Avoid fine grain, high-frequency texture, smooth painting, and embedded words. Preserve the planned blank text/photo areas and object positions. Apply this brief to the sofa nook, Duoji’s nook, album, fern, TV, globe, or trunk with the corresponding composition described in the asset map.

**Portrait arcade and paper.** Draw a chunky pixel-art portrait scene on roughly an 85 × 128 logical-pixel grid. For the arcade, create a warm wooden/green cabinet with a clean rectangular screen opening for a separate game Canvas and recognizable controls. For the note, create a broad cream paper surface with simple edges and restrained shading. Use no text, fine paper grain, or painted microdetail.

**Phone discoveries.** Recompose the fern, globe, trunk, or Duoji scene as a complete 1024 × 1536 portrait using the existing landscape as an object and style reference. Retain the same furniture, palette, and coarse pixel scale. Place the meaningful prop above a large blank writing or photograph area, leaving room for reachable controls and native HTML text.

**TV atlases and BOB mark.** Draw each six-panel TV atlas as a regular three-column/two-row grid. Keep each panel independent, with no shared borders or embedded captions, and illustrate the six subjects in the exact frame order listed above. Draw the BOB mark in the same warm pixel vocabulary with a silhouette that remains legible when displayed small.

**Visitors and Duoji.** Create friendly fox and rabbit visitor poses with a 48 × 48 logical-pixel feel, and a small black-and-tan Shiba Inu with a 64 × 64 logical-pixel feel. Keep clear silhouettes, large readable features, a consistent scale and baseline across poses, and a transparent background where needed. Duoji should be small but spirited; avoid realistic fur. Keep each pose sufficiently separated for reliable cropping.

**City windows and liftable objects.** Match the room’s palette and crisp pixel vocabulary. City scenes should suggest Shanghai, Singapore, and Hong Kong through clear skyline silhouettes and a consistent window framing. The rug should have a clear silhouette and simple highlights. Preserve existing aspect ratios and avoid lettering.

After replacement, inspect the scene in the browser at its actual displayed size and on a phone. The visual impression, readable text, hit areas, and interactions matter more than the exported image’s nominal resolution. Follow the [design maintenance checklist](frontend-design.md) and retain the [content and rights boundaries](content-sources.md).
