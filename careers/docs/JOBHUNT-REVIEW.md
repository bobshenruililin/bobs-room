# JobHunt-CLI integration review

Inspected on 9 November 2026 at commit `8174c17d32e515494d3cad65668d1cbe344147d7`, package version 0.2.6. The source was read through GitHub. The CLI was not installed or live-run in this restricted network environment. Our import bridge is independently written and tested with synthetic inputs, not a validated live API integration.

## Useful scope

JobHunt offers a common command and field model across employer recruitment sites. The Xiaohongshu adapter uses **job.xiaohongshu.com**, with `social`, `campus` and `intern` recruitment categories. `social` means 社招, experienced-hire recruitment. It does not collect recruiting posts in the Xiaohongshu social feed.

The common identity, location, category and source link fields suit this dashboard. Compact JSON can keep model context small. A local full export plus content fingerprints can identify changed jobs before sending a small set of descriptions to a model. Do not assume all adapters have the same timestamp meaning or channel coverage.

## Findings that matter

| Observation | Dashboard decision |
|---|---|
| Xiaohongshu `normalizeJob` assigns upstream `publishTime` to `updated_at`. | Import it as `source_published_at`, keep `source_updated_at` unknown. Fetch time and human/source review time remain separate. |
| HTTP, non-JSON and API failures have distinct error codes. Empty results use exit code 66. | Preserve failure and empty states separately; never replace known jobs with an empty dataset after a failed run. |
| `fetchJobs` turns a missing/non-array `data.list` into `[]`, and defaults total to zero. | A zero-result CLI exit alone cannot prove no openings. Require independently validated response schema, scope and completed pagination. |
| `all` paginates and deduplicates; `--max` can truncate results. It also stops on a short page. | Record the query, channel, cap, reported total and whether every page was read. A capped/partial scan is never complete coverage. |
| Detail lookup scans up to 20 pages of 50 jobs; it is not a direct detail endpoint. | A failed detail lookup can be a scan limit, not vacancy closure. Repeated detail calls may waste requests. |
| `jobUrl` constructs query-style URLs. The generated internship URL for ID 22391 redirected to the recruitment homepage in a browser test on 9 November. | Keep the verified `/campus/intern/position/22391` detail link. Validate generated URLs before publishing new candidates; HTTP success can land on the wrong page. |

## Thin review bridge

`scripts/import_jobhunt.py` converts a **captured-run envelope** into review proposals. It never changes `data/jobs.json` or promotes imported data to source-reviewed. The current implementation intentionally supports only the inspected Xiaohongshu timestamp mapping.

Envelope fields:

```json
{
  "site": "xiaohongshu",
  "nature": "intern",
  "fetched_at": "2026-11-09T13:00:00Z",
  "exit_code": 0,
  "scope": {"query": "AI", "channel": "intern", "max": 100},
  "rows": [],
  "capture": {
    "response_schema_valid": false,
    "all_pages_read": false,
    "reported_total": null
  }
}
```

The example is a schema illustration, not a real successful capture. Never fill `capture` with optimistic values. A CLI-only run generally remains `partial` or `empty_unconfirmed`; validating raw responses/completeness needs an adapter-level capture or independent check. Do not retain cookies or credentials.

```sh
python3 careers/scripts/import_jobhunt.py /tmp/jobhunt-run.json --out /tmp/jobhunt-review.json
python3 careers/tests/jobhunt_import_test.py
```

For later network-enabled evaluation, use the installed CLI's explicit `--nature intern`, record its version and exit status, and export JSON. Keep stderr separate. Use `--view compact` for model discovery, or a full JSON export for local change detection. Preserve the original run scope and caps. Do not wrap errors with a shell fallback that writes `[]`.

Suggested sequence: validate one Xiaohongshu run against the official page → retain raw response evidence without credentials → test pagination/empty/failure cases → expand adapters one employer at a time. Source fetches can be automated without model calls; only new or changed job requirements need small-model review.

## Exact references

- [Adapter and pagination](https://github.com/Enzoding/JobHunt-CLI/blob/8174c17d32e515494d3cad65668d1cbe344147d7/src/sites/xiaohongshu/index.js)
- [Timestamp, response parsing, source URLs and detail lookup](https://github.com/Enzoding/JobHunt-CLI/blob/8174c17d32e515494d3cad65668d1cbe344147d7/src/sites/xiaohongshu/utils.js)
- [Error codes](https://github.com/Enzoding/JobHunt-CLI/blob/8174c17d32e515494d3cad65668d1cbe344147d7/src/core/errors.js)
- [Compact/full/debug projections](https://github.com/Enzoding/JobHunt-CLI/blob/8174c17d32e515494d3cad65668d1cbe344147d7/src/core/projection.js)
- [Coverage matrix and evidence standard](https://github.com/Enzoding/JobHunt-CLI/blob/8174c17d32e515494d3cad65668d1cbe344147d7/docs/RECRUITMENT_NATURES.md)
