# Higgsfield handoff for Astra: the gate

The gate works today without any generated media ([direction](where-next.md) · [prototype](../lab/doorway/)). This handoff asks Higgsfield for the motion that makes it a film. Every shot starts and ends on a real frame, and Bob is never generated where he can be composited back from his photograph.

[Machine-readable requests](higgsfield/requests.json) · [Start and landing frames](higgsfield/frames) · [Ledger](higgsfield/ledger.csv) · Frames are rebuilt by `scripts/prepare-requests.py`

## The contract

1. **Render natively in 4K** with `generate_audio: false`. Make three takes per shot and keep the best. Credits are not the constraint. Bob’s photograph and his work are.
2. **Judge each take in context.** Run `npm run dev`, open `/lab/doorway/`, and watch the take in the gate on desktop and phone. Keep it only if it is better than the prototype’s code-built move. Discard it as soon as its failure condition appears.
3. **Crop and encode.** Keep 4K masters out of the repository and link them in the ledger.
   - **L and G shots** play *behind* the photograph’s cut-out. Crop the photograph’s sea rectangle out of the 3:4 master (x 32.81–68.23 %, y 39.84–65.63 %):
     ```sh
     ffmpeg -i master.mp4 -an -vf "crop=iw*0.35417:ih*0.25781:iw*0.328125:ih*0.3984375,scale=1360:-2" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -movflags +faststart lab/doorway/media/motion/G1-carryistic.mp4
     ```
   - **E shots** play full screen. Encode the wide take at 2520 wide and the tall take at 1440 wide, same settings.
4. **Switch it on.** Set `"ready": true` for its slot in `lab/doorway/media/motion.json`, run `npm test`, and add a ledger row (model, settings, job ID, credits, decision, reason). The tests refuse a slot marked ready whose file is missing.
5. **Commit and push** to a branch Opus can merge. Opus screens every clip in the gate before anything reaches `main`.

## L · The gate, alive

| ID | Frames | Model and settings | Motion | Must survive | Discard if |
| --- | --- | --- | --- | --- | --- |
| L1 | Start and end: `L1-gate.jpg` | Seedance 2.5 `omni_reference`, 4K, 3:4, 8 s | The sea moves, its glitter shifts, the clouds over the far shore drift. A loop, so the last frame returns to the first. | The sailing ship and the small boat keep their place and size. The horizon stays level. | A boat moves or a new one appears, a bird or person appears, or the horizon tilts. (Bob, the chains and the stone are composited from the photograph, so their motion doesn’t matter.) |

## G · Through the gate

All six: start `L1-gate.jpg`, end `G#-…-end.jpg`, Seedance 2.5 `omni_reference`, 4K, 3:4, 5 s. Only the opening is used. The end frame is the real work exactly where the page places it, so the clip lands on the still without a jump. If Seedance can’t land a shot, try Kling 4.0 `image-to-video` at 4K with the same two frames.

| ID | Work | What happens beyond the gate | Must survive at the end | Discard if |
| --- | --- | --- | --- | --- |
| G1 | Carryistic | The low sun brightens on the horizon and splits into fifteen flat rays that sweep from right to left. Carry’s profile rises into place inside them. | The rays’ colours, order and hard edges; her profile | The rays glow, blur or bend; a lens flare or sun remains; her face changes |
| G2 | Asterwind | Dusk falls. The sea folds up like a paper set and becomes the lamp-lit studio wall with the *After Hours* machine. | The AFTER HOURS lettering, bottles and buttons; the door at the left | Letters warp in the last second; a person appears |
| G3 | Crossing Lives | The far shore slides toward the gate and becomes the station display, with the Shenzhen and Hong Kong maps side by side. | Both map boards and their headings, as photographed | Map lines are redrawn or garbled in the last second; anyone appears |
| G4 | Heat & health | The glitter on the water slows and hardens into vertical stripes, one per day, the summers turning red. | The exact stripe layout of the end frame (it is the HKO data) | Stripes curve, or colours outside the seven-colour scale appear |
| G5 | Career Atlas | The horizon becomes a ruled line, the sky turns to white paper, and the dashboard’s rows print in from the top like a departure board. | The end frame’s layout | Readable invented text, such as a company or a salary, appears mid-shot |
| G6 | Bob’s Room | Night falls over the water, lights come on across the harbour, and the lantern-lit room fades up in their place. | The room illustration as drawn | The pixel art smears into painting at the end |

## E · Step through

All six, in two aspects: wide 21:9 (desktop, the landing’s framing) and tall 3:4 (phone). Start `E#-…-start-<aspect>.jpg`, end `E#-…-end-<aspect>.jpg`. Seedance 2.5 `omni_reference`, 4K, 4 s; Kling 4.0 `image-to-video` as the alternative.

**Motion, every work:** one steady dolly forward through the gate, passing just above Bob’s raised right hand. The stone slides out past the frame edges, the chains pass on either side, and the work fills the frame and settles. No cut, no tilt, no speed ramp.

| Must survive | Discard if |
| --- | --- |
| Bob stays a back-lit silhouette with both arms raised. He never turns, and no face or facial detail appears. Each stone keeps its shape as it passes. The end frame is the real work. | Bob moves, turns or gains a face; the arms bend; stones swim or multiply; the work’s text warps in the last second; the camera cuts. |

The page plays the wide take between the letterbox bars and lets it grow to the full screen as the bars slide away. The reel then settles the work onto its colour. Leaving a work still uses the code-built zoom.

## W · The walk

| ID | Frames, in order | Model and settings | Motion | Must survive | Discard if |
| --- | --- | --- | --- | --- | --- |
| W1 | start `walk-1884` (daisies) → middle `walk-1921` (church tower) · `walk-2260` (Bob on the rocks above the houses) · `walk-2028` (Bob at the water through trees) · `walk-2341` (rocky coast) · `walk-2278` (boat through branches) · `walk-2094` (arms wide on the rocks) → end `doorway-1920` (the gate). All in `archive/source/`. | Kling 4.0 `image-to-video`, 4K, 30 s, 16:9 and 9:16. Alternative: FLUX 3 Video, 4K, 20 s, same ordered frames. | A walking camera at eye height following the island path through each photograph in turn, in the same late-summer light. Bob appears only where a photograph has him, as he is in it. | Every keyframe, as photographed. The church tower, the rampart and the gate keep their architecture. Bob’s clothes in each keyframe. | Bob’s face is invented or turns toward camera where the photo doesn’t; his clothes change between keyframes; a new building, person or animal appears; the camera cuts. |

W1 is *Play the film* on the landing. Its last four seconds (`walk-2094` → the gate) become the first-visit arrival. **Ask Bob first** whether the seven photographs were one afternoon. If they weren’t, cut W1 as chapters with a hard cut between days rather than one continuous walk.

## R · Real footage (not generated)

The works themselves are never generated. Record each live site in 4K on a real machine, 8–12 s each, with a steady pointer and real clicks, to replace the stills inside the reel:

| ID | Work | What to record |
| --- | --- | --- |
| R1 | Carryistic | The landing sweep, a hover on a ray, opening it, two taps through a work |
| R2 | Asterwind | *Begin*, then into the After Hours studio |
| R3 | Crossing Lives | Close the notice, scroll from “Two places, one life, rearranged” to “Home moves north” |
| R4 | Career Atlas | Filter to Hong Kong, open a role, add it to the shortlist |
| R5 | Bob’s Room | The fox walks to the sofa, opens it, then the arcade |

## Sound, if Astra has room

One bed for the gate: water against stone, a chain’s creak, distant gulls, no melody. Make it a 60 s loop at low level, off until a visitor turns it on, as on Carry’s site. Add one soft sound for the gate changing view.

## Order of work

1. **L1 and G1–G6.** These are what a visitor sees first.
2. **E1–E6 wide**, then tall.
3. **W1**, after Bob answers the one-afternoon question.
4. **R1–R5.**
5. **Sound.**
