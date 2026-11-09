#!/usr/bin/env python3
"""Convert a captured JobHunt run to a review proposal. Never edits live jobs."""
import argparse
import datetime as dt
import json
from pathlib import Path
from urllib.parse import urlparse


def convert(run):
    """Accept our run envelope, not a bare array whose completeness is unknown."""
    required = ('site', 'nature', 'fetched_at', 'exit_code', 'scope')
    if any(k not in run for k in required):
        raise ValueError('Run needs site, nature, fetched_at, exit_code and scope')
    if run['site'] != 'xiaohongshu':
        raise ValueError('Only the reviewed Xiaohongshu mapping is supported')
    if run['nature'] not in ('intern', 'campus', 'social'):
        raise ValueError('Use one explicit recruitment channel')
    dt.datetime.fromisoformat(run['fetched_at'].replace('Z', '+00:00'))
    report = {'site': run['site'], 'channel': run['nature'], 'scope': run['scope'],
              'last_attempt_at': run['fetched_at'], 'last_success_at': None,
              'collection_status': 'fetch_failed', 'complete': False,
              'result_count': None, 'proposals': [], 'publish_automatically': False}
    if run['exit_code'] == 66:
        report.update(collection_status='empty_unconfirmed',
                      note='CLI EMPTY_RESULT alone does not prove valid schema, complete pagination or no openings.')
        return report
    if run['exit_code'] != 0:
        report['note'] = 'Fetch failed. Preserve all previously known jobs and review dates.'
        return report
    rows = run.get('rows')
    if not isinstance(rows, list):
        report.update(collection_status='schema_changed', note='Successful exit without a valid jobs array')
        return report
    # Independent capture evidence is required: the adapter silently defaults
    # malformed/missing response lists to []. A CLI result alone is insufficient.
    capture = run.get('capture', {})
    complete = (capture.get('response_schema_valid') is True
                and capture.get('all_pages_read') is True
                and type(capture.get('reported_total')) is int
                and capture['reported_total'] == len(rows))
    if not rows:
        report.update(collection_status='empty' if complete else 'empty_unconfirmed',
                      complete=complete, result_count=0 if complete else None,
                      last_success_at=run['fetched_at'] if complete else None,
                      note='No matching openings in the stated scope.' if complete else 'Empty output needs independent response validation.')
        return report
    proposals, seen = [], set()
    for row in rows:
        if not isinstance(row, dict) or not row.get('id') or not row.get('name'):
            report.update(collection_status='schema_changed', note='Missing stable ID or job title')
            return report
        url = urlparse(str(row.get('url', '')))
        if url.scheme != 'https' or url.hostname != 'job.xiaohongshu.com':
            report.update(collection_status='schema_changed', note='Unexpected employer source URL')
            return report
        if row.get('nature_code') != run['nature']:
            report.update(collection_status='schema_changed', note='Unexpected recruitment channel')
            return report
        identity = f'xiaohongshu:{run["nature"]}:{row["id"]}'
        if identity in seen:
            report.update(collection_status='schema_changed', note='Duplicate identity; do not infer coverage')
            return report
        seen.add(identity)
        proposals.append({
            'source_identity': identity, 'company': 'Xiaohongshu',
            'title': row['name'], 'source_url': row['url'],
            'source_url_verification': 'unverified',
            'location_text': row.get('location_names') or None,
            'source_published_at': row.get('updated_at') or None,
            'source_updated_at': None,
            'published_at_origin': 'JobHunt Xiaohongshu updated_at maps from upstream publishTime; raw source format retained',
            'last_fetched_at': run['fetched_at'], 'checked_on': None,
            'status': 'needs_review', 'verification': 'import_unreviewed',
            'description': row.get('description') or None,
            'requirement': row.get('requirement') or None,
        })
    report.update(collection_status='ok' if complete else 'partial', complete=complete,
                  result_count=len(proposals), last_success_at=run['fetched_at'], proposals=proposals,
                  note='Review proposals only. A successful fetch is not a source review or vacancy confirmation.')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run', type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    proposal = convert(json.loads(args.run.read_text()))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(proposal, ensure_ascii=False, indent=2) + '\n')
    print(f'{proposal["collection_status"]}: {len(proposal["proposals"])} proposals; published data unchanged')
