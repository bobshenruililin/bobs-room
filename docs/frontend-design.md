# Frontend design and maintenance

Design record: 7 October 2026. The room is an original personal portfolio presented as a small, explorable pixel world. Physical objects lead to meaningful biographical content; a conventional room index provides another route to that content.

## References and decisions

| Reference | Evidence and adaptation |
| --- | --- |
| [Seesaw: Karim Saleh](https://www.seesaw.website/websites/karim-saleh) → [original portfolio](https://www.karimsaleh.design/) | The original site was visually inspected. Visible C/X/Y keyboard hints and modular, interactive portfolio navigation informed visible keyboard affordances and discovery through a spatial layout. The room does not reproduce its composition or assets. |
| [SearchSystem](https://searchsystem.co/) and [Supahero](https://supahero.io/) | Text research only; their live visual appearance and interactions were not audited. They provided broader design-reference context, not evidence for a specific copied pattern. |
| [Saaspo](https://saaspo.com/) | Considered as a resource; a SaaS landing-page composition was not selected for this room. No project-specific visual audit is claimed. |
| [Phaser scale-manager documentation](https://docs.phaser.io/phaser/concepts/scale-manager) | Current documentation was consulted for the distinction between fitting an entire scene and filling a viewport while preserving its aspect ratio. The sizing concept informed room/camera decisions; Phaser is not a dependency. |
| [Canvas image smoothing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) | Current documentation was consulted to preserve hard pixel edges when drawing sprites. Canvas smoothing is disabled; CSS pixelated rendering is used for relevant art. |

GSAP, Lenis, Vanta, and React Bits were considered. The chosen implementation uses native animation frames for the 2D game, CSS for short transitions, native dialog controls, and ordinary scrolling for reading. This keeps one owner for room animation and avoids adding libraries whose main capabilities are unnecessary here.

## Visual rules

- Keep the lantern-lit room, dark green surroundings, warm paper, and clear pixel silhouettes coherent across every object scene.
- Preserve the approved main room’s native pixel granularity. Closeups should look like enlarged objects from that room. Recent closeup art direction targets a coarse logical grid of approximately **128 × 85** for landscapes and **85 × 128** for portraits, enlarged with hard edges. Avoid fine paper grain, smooth painting, and small decorative detail that contradicts that scale.
- Keep readable copy, links, buttons, page numbers, and status text in semantic HTML over the illustration. Do not bake essential text into generated paper or controls into an inaccessible image.
- Keep each sofa and drawer state as one complete illustrated scene, including its paper. Desktop and phone compositions have their own aligned controls; avoid assembling a drawer or covering paper with unrelated image fragments.
- Use self-hosted Pixelify Sans for the pixel interface. Preserve all bundled font license notices when updating type assets.
- Keep actions visible and labels meaningful. A mouse, touch screen, keyboard, or room index should offer a usable route through the experience.
- Respect reduced motion, keep sound opt-in, and dispose of object listeners and timers when a scene closes. These are continuing verification requirements, not a certification of accessibility.

## Games, atlas, and contact-note revision

The arcade now contains **Moonlight Blocks**, an original falling-block implementation with a ten-column/twenty-row playfield, seven-piece bags, rotation with small wall/floor adjustments, row clearing, increasing speed, next-piece preview, and keyboard/touch controls. A new complete portrait cabinet replaces the old Lantern Catch presentation. Keep its live screen and five controls aligned to the single illustration; keyboard gameplay starts from the focused Canvas and pauses when the page loses focus.

The Go board and folded atlas are painted directly into the active `room-v4` background, matching its perspective, light, and pixel scale. Their separate floor image/Canvas overlays have been removed. Both are normal room checkpoints (`go` and `travel`) with story markers, walk destinations, room-index entries, and journal progress; the room now has twelve checkpoints.

The Go board opens through the same story-dialog lifecycle as the other objects. Its modal uses one generated tabletop with the interactive 9×9 grid drawn over the blank wooden face. Native HTML grid controls allow pointer placement and arrow-key navigation followed by Enter or Space. It is a shared local practice board, with alternating colours, group captures, suicide prevention, simple ko, pass, undo, and clear. Two passes end practice; it does not provide an AI opponent or calculate a winner.

The atlas beside the globe uses a **480 × 240** Canvas with geographic cells built deterministically from Natural Earth polygons. The accurate map appears inside the opened atlas; the folded book painted in the room is a decorative prop. Gold identifies visited places and green identifies other land. Singapore and Hong Kong stay in the written list without enlarged markers; maintain that display choice in `COLOURED_PLACES`. The weather folio also links to the atlas, and the guided route has seventeen stops, including normal walks to the atlas and Go board.

The “Let’s build something” contact note is scaled to **90%** of its previous size inside the approved paper, using a transform origin of `50% 35%`. This leaves more space along the left and lower edges without changing the room’s floor invitation.

The former “Something underneath?” rug button and its brick-stash interaction were removed to keep the lower-right Go area clear. The room’s illustrated rug remains scenery. Removing that optional interaction reduces the guided route to seventeen stops; all twelve checkpoints remain.

## Coordinate maintenance

The illustration coordinate system is **1536 × 1024**, independent of browser size. Do not use screenshot or viewport pixels to position world objects.

| Change | Update together |
| --- | --- |
| Room illustration or furniture placement | `WORLD`, `FLOOR`, and `OBSTACLES` in `engine.mjs`; `marker` and `approach` in `stories.mjs`; starting/companion positions in `app.mjs` |
| Story or discovery | Story ID, copy, links, marker and approach; room-index summary in `index.html`; relevant object interaction and discovery count |
| Visitor sprite sheet | Frame crop bounds in `assets/art/frames.json`, frame assumptions in `app.mjs`, and the matching images |
| Closeup illustration | Image reference, CSS overlay positions/aspect ratio, button hit areas, readable-paper bounds, and mobile layout |
| Sofa or drawer state | Both open/closed images and both desktop/phone compositions; synchronize the picture-source breakpoint with CSS (currently 760px) |
| TV atlas or channel | Three-column/two-row panel layout, zero-based `frame` in `personal.mjs`, caption/source link, and channel references in the tour |
| Guided stop or object control | `TOUR_STOPS` actions in `tour.mjs`, button selectors, reading time, pause/takeover behavior, and phone-specific page progression |
| BOB emblem | PNG favicon and WebP header image references in `index.html`; retain a clear silhouette at small sizes |
| Go or atlas checkpoint | Baked prop position in `room-v4`, `marker`/`approach` in `stories.mjs`, normal hotspot/index/journal entry, object mounting in `objects.mjs`, and tour destination |
| Travel list or geographic data | `TRAVELS`/`COLOURED_PLACES` in `travel.mjs`; retain `assets/maps/provenance.json`; rerun `scripts/build-map.mjs` only when geography changes |
| Moonlight Blocks or Go art | Game screen/grid positions, control hit areas, image aspect ratio, readable paper, and both desktop/phone layouts |
| Photograph or CV | Local file, `PHOTOS`/`CV` references in `stories.mjs`, accurate alternative text, and source notes |
| Deployment destination | Canonical URL, Open Graph URL/image, and README destination |

`marker` positions identify the visible object; `approach` positions identify a safe place for the visitor to stand. Keep those concepts separate. Pathfinding uses a 16-pixel grid with clearance around furniture. The automated reachability checks should pass after any coordinate change, followed by a visual check that the visitor actually stands beside the intended object.

The atlas marker is centred at `(431, 562)` with approach `(510, 590)`; the Go board marker is centred at `(1042, 745)` with approach `(1038, 679)`. These coordinates were checked against the integrated `room-v4` props. Both new markers align, and the original checkpoint positions remain visually aligned with the preserved furniture.

The journal stores only story IDs and visitor choice under `bobs-room:v1` in local storage. The new `travel` and `go` IDs extend the existing journal without discarding earlier discoveries. Keep old or malformed saved values harmless when changing story IDs. A future incompatible storage format should have an explicit migration or a new key.

The guided walk reuses the same story dialogs and controls as free exploration. Keep its reading pauses in step with visible copy, and preserve manual pause, previous/next, exit, and automatic pause when the visitor takes over. It should never activate an external source link. The drawer’s three notes belong to the heat project; weather and fieldwork stay in their own folios, while personal interests and six CV detours belong to the TV.

## Validation record

Automated tests cover all story approaches from the entrance and from one another, movement boundaries and obstacle avoidance, click destinations, malformed saved discoveries, local asset presence, story consistency, falling-block bags, rotation, collision, row clearing, scoring, lock delay and game-over behavior; Go captures, liberties, ko, pass and undo; and map row/index integrity, travel-list membership, and sampled geographic interiors. The asset check includes current generated scene PNG/WebP pairs, responsive and open/closed variants, TV atlases, the BOB emblem, new cabinet and Go scenes, map/provenance JSON, visitor atlas, six photographs, the CV, all five font files, and all four font notices. It does not verify visual alignment or run the tour in a browser.

- Initial-release automated validation: configured syntax checks and all 10 tests passed on 7 October 2026. The new-games/atlas revision has a separate validation record below.
- Publication-file audit: 119 non-Git files were scanned on 7 October 2026. No private absolute paths, common credential-token patterns, secret-key filenames, or symlinks were found. The CV’s extracted text and metadata were included. PNG/WebP files contained no text, EXIF, or XMP metadata chunks, and local Markdown links resolved. This is a scoped file audit, not an exhaustive security review.
- Drawer desktop spot-check: the continuous closed/open scene, three folders, and next-note control were checked at 1280 × 720; the longest notes fit their paper without overflow and no console errors were observed.
- Initial-release browser validation: the full 16-stop guided route completed on desktop with all ten discoveries and no console errors. At 390 × 844, the drawer’s three notes, sofa/remote, TV channel navigation and power, Duoji topics, book pages, field notes, firefly reveal and nested photo, reading index, and tour pause/resume/manual takeover were exercised. The portrait TV now uses a complete tall illustration; its LEGO caption fits without scrolling. The arcade completed a scored round and replayed. A short 844 × 390 landscape drawer stayed within the viewport; long notes remain scrollable inside the illustrated paper. These are browser-emulated viewports, not physical-device tests.
- Initial-release GitHub Pages smoke test: passed on 7 October 2026. The Pages build completed successfully; the public room loaded at `/bobs-room/`, its drawer opened, fonts loaded, no visible images were broken, and no console errors were observed. HTTP checks returned 200 for the page, main modules, styles, current room/drawer/TV assets, pixel font, and CV. City switching, brick add/undo, and the album’s nested photo navigation were also exercised locally before publishing.

### Current games/atlas revision

- Automated validation: `npm run check` passed on 7 October 2026 with the configured syntax checks and all **24 tests**, including the new game rules, geographic checks, all twelve checkpoint approaches/index entries, and expanded local assets including `room-v4`.
- Go component preview: at desktop width and in a 390px-wide browser frame, pointer placement, arrow/Enter controls, two passes, undo, clear, and the rules disclosure were exercised. The initial paper fits without scrolling; expanded rules scroll within it. No console errors were observed. This was an isolated component preview, not the final integrated-page or physical-device test.
- Revision file audit: 40 changed or new public files were scanned for private absolute paths and common credential-like tokens; no matches or symlinks were found. New PNG/WebP files contained no text, EXIF, or XMP metadata chunks. This check included the v4 prompt record and map provenance. Local links in the four updated documentation files resolve.
- Integrated room/desktop checks: the v4 atlas and Go markers align with their painted props; original checkpoint positions remain visually preserved. Go opens as a normal story, stones at E5 and G3 align to the grid, and the journal reaches 12/12. Its client/scroll height was 734/734px. The normal desktop atlas fits after resetting inherited inner padding.
- At an emulated **390 × 844** phone viewport, placing a Go stone at E5 worked and fit the scene. The atlas measured 572/572px client/scroll height without horizontal overflow. The 90% contact note fits its title, body, and footer. Moonlight Blocks play, hard drop, game-over, and replay layouts fit; the cabinet’s height allowance was reduced by 15px to remove residual scrolling.
- Targeted tour checks used **Previous/Next** to visit the atlas, Go, and arcade stops. The atlas initially overflowed; its tour-only compact layout now fits at 501/501px on desktop and 359/359px on phone. Its introductory paragraph and written place list are hidden only while the guide is present. Go fits above the guide at 554/554px, and its scripted demonstration places two stones. Arcade auto-start and manual drop work; taking control pauses the guide while the game continues. No console errors were reported by the local build tab. The complete seventeen-stop automatic route was **not** rerun during this revision.
- The current update’s published GitHub Pages smoke test remains pending. These local checks do not establish deployment success or physical-device behavior.

## Broader maintenance checklist

- [ ] Inspect a wide desktop viewport, a narrow phone viewport, and a short landscape viewport. Keep the room’s aspect ratio correct, controls reachable, and dialogs within the screen.
- [ ] Verify the atlas and Go markers land on their integrated room-v4 props and both increase the twelve-checkpoint journal. Confirm earlier saved discoveries remain present.
- [ ] Explore as both visitors using keyboard, click-to-walk, and touch controls. Check all story approaches against the furniture and actual illustrated objects.
- [ ] Open every room object. Inspect text against generated paper, closeup pixel scale, hit areas, and the complete interaction within each scene.
- [ ] Complete **Wander with me**. Check each stop, reading pauses, previous/next, pause/resume, manual takeover, exit, focus behavior, and reduced-motion behavior without obscuring the highlighted object.
- [ ] Check book navigation and bookmark; all three drawer folders and its open/closed scenes; all three sofa pages and its cushion reveal; city views; photo album/full-photo viewer; folios; lantern discoveries; Duoji’s three topics; all twelve TV channels; Moonlight Blocks, Go, and the travel atlas.
- [ ] Inspect the portrait sofa, drawer, Duoji, fern, globe, trunk, and TV artwork. Confirm transparent hit areas follow the illustrated objects and text stays inside the cream paper or caption area at both sides of the responsive breakpoint.
- [ ] Play Moonlight Blocks using keyboard and touch controls; verify rotation, drop, row clears, pause/restart, and game over. Place and capture Go stones, undo, pass twice, and open the rules. Compare atlas colouring and written places against Bob’s list.
- [ ] Check the contact note’s left/lower paper bounds at desktop and phone sizes after its 90% reduction.
- [ ] Check keyboard focus visibility, dialog focus/close behavior, Escape, nested photo dialogs, and return to the room. Confirm room controls do not move the visitor while reading or playing another scene.
- [ ] Check the room index and skip link; disable JavaScript and confirm the biography summaries, CV, and email remain available.
- [ ] Enable reduced motion and Stillness, then check interaction feedback. Turn sound on/off and verify it starts only after user input.
- [ ] Reload with saved discoveries, clear site storage, and try unavailable storage. Verify the room still opens.
- [ ] Inspect missing-art recovery, browser console errors, and failed asset/module requests. Test the final published `/bobs-room/` URL separately from localhost.
