# Dashboard design notes

## Direction, 9 November 2026

The user requested a simple dashboard and explicitly prioritized accurate jobs, broadening coverage and cheap future maintenance. The primary screen is therefore a compact searchable collection with requirements and source evidence in each row. There is no animation library, decorative hero image or frontend framework.

References inspected:

- https://www.seesaw.website/websites/midday-v2 — opened the gallery entry and followed its original-site link. The gallery preview image did not load, so it was not used as visual evidence.
- https://midday.ai/ — inspected the original page in-browser and its rendered desktop hero. A restrained navigation, short explanatory line and distinct action hierarchy informed the dashboard's typography and controls. The source DOM also exposes labelled transaction columns. Career Atlas applies a compact row structure to roles, location, function, term and evidence. No assets or component code were copied, and no claim is made about the reference's mobile behavior.
- https://saaspo.com/ — access stopped at a security verification page; its designs were not inspected.

Adaptations: light neutral workspace, a small red accent, native selects, strong title/company hierarchy, persistent source-state labels and a details drawer for longer evidence. On phones, rows become cards and sidebar navigation becomes a top bar. System fonts avoid remote font requests. Native scrolling and reduced-motion rules are retained.

## Verification

The JavaScript syntax check, eight filter/export tests and five dataset/checker tests passed during implementation. The dataset validator checks 28 active records and distinguishes graduation years from internship intake dates. Local HTTP serving is unavailable under the current environment permissions; Visual and interaction validation used the published GitHub Pages URL. Network execution of the maintenance checker is not verified here; deterministic queue behavior is tested.

Live checks: desktop rendering, empty results, combined company/graduation filters, job detail drawer, shortlist persistence after reload, shortlist removal, company navigation, current 28/26 counts and source coverage labels were verified. At a 390 px viewport, cards rendered without horizontal page overflow. The lead/export browser test was interrupted by a browser connection failure; that interaction test is incomplete. CSV formatting and timestamp/failure rules have offline tests.
