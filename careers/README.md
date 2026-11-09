# Career Atlas

A small internship dashboard built around evidence and visible requirements.

**Live:** https://bobshenruililin.github.io/bobs-room/careers/

Search and filter by company, location, function, graduation year, minimum term and evidence quality. Save a local shortlist, export CSV, or capture Xiaohongshu/job links in a local lead inbox. No account, server, paid API, analytics or frontend dependency is required.

The initial collection contains 29 roles from 15 employers. Eleven employer-page descriptions were read; eighteen candidates need further review. This is a starting collection, not exhaustive market coverage. Xiaohongshu's corporate careers listings are distinct from its social posts; the social platform is not connected.

## Files

- `data/jobs.json`: source-linked job records and coverage register.
- `app.mjs`, `logic.mjs`, `style.css`, `index.html`: dependency-free interface.
- `scripts/validate_data.py`: dataset checks, including evidence and graduation-year types.
- `scripts/audit_sources.py`: link health and source-text change queue; never changes the dataset.
- [Maintenance guide](docs/MAINTAIN.md): field semantics, review prompt and low-cost workflow.

## Development

From the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/careers/`. GitHub Pages serves this directory directly; no build step is needed.

```sh
node --test careers/tests/logic.test.mjs
python3 careers/tests/data_tools_test.py
python3 careers/scripts/validate_data.py
```

Publishing a change to `main` uses the parent repository's existing GitHub Pages deployment. Only `careers/` is part of this application.
