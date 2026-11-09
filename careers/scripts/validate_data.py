#!/usr/bin/env python3
"""Validate the public dataset without network access or dependencies."""
import argparse
import datetime as dt
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {'id', 'company', 'title', 'locations', 'category', 'employment',
            'duration_months', 'days_per_week', 'cohort', 'eligibility',
            'summary', 'source_url', 'source_type', 'checked_on', 'status',
            'evidence_note', 'verification', 'source_id'}


def validate(data):
    errors = []
    sources = {s.get('id'): s for s in data.get('sources', [])}
    if len(sources) != len(data.get('sources', [])):
        errors.append('Duplicate source IDs')
    states = {'partial', 'ok', 'empty', 'empty_unconfirmed', 'fetch_failed', 'schema_changed', 'not_connected', 'not_checked'}
    for source in sources.values():
        if source.get('collection_status') not in states:
            errors.append(f'{source.get("id")}: invalid collection state')
        if source.get('collection_status') == 'empty' and not (source.get('collection_complete') is True and source.get('result_count') == 0 and source.get('last_success_at')):
            errors.append(f'{source.get("id")}: empty needs complete successful scan evidence')
        if source.get('collection_status') in ('fetch_failed', 'schema_changed') and source.get('result_count') == 0:
            errors.append(f'{source.get("id")}: failure must not report zero openings')
    ids, postings = set(), set()
    for job in data.get('jobs', []):
        name = job.get('id', '<missing id>')
        missing = REQUIRED - job.keys()
        if missing:
            errors.append(f'{name}: missing {sorted(missing)}')
        if name in ids:
            errors.append(f'{name}: duplicate ID')
        ids.add(name)
        identity = (job.get('company'), job.get('title'), job.get('source_url'))
        if identity in postings:
            errors.append(f'{name}: duplicate posting')
        postings.add(identity)
        if job.get('source_id') not in sources:
            errors.append(f'{name}: unknown source_id')
        u = urlparse(job.get('source_url', ''))
        if u.scheme not in ('http', 'https') or not u.netloc or u.username or u.password:
            errors.append(f'{name}: invalid public source URL')
        if job.get('status') not in ('listed', 'needs_review'):
            errors.append(f'{name}: unsupported status')
        if job.get('verification') not in ('page_read', 'partial_page', 'indexed_only'):
            errors.append(f'{name}: unsupported verification method')
        if job.get('status') == 'listed' and job.get('verification') != 'page_read':
            errors.append(f'{name}: reviewed status requires page_read evidence')
        if not isinstance(job.get('locations'), list) or not job.get('locations'):
            errors.append(f'{name}: at least one location required')
        if not isinstance(job.get('cohort'), list) or any(type(y) is not int or not 2000 <= y <= 2100 for y in job.get('cohort', [])):
            errors.append(f'{name}: cohort must contain graduation years, never intake dates')
        for field in ('duration_months', 'days_per_week'):
            value = job.get(field)
            if value is not None and (type(value) not in (int, float) or value <= 0):
                errors.append(f'{name}: {field} must be positive or null')
        if job.get('days_per_week') is not None and job['days_per_week'] > 7:
            errors.append(f'{name}: days_per_week exceeds seven')
        try:
            checked = dt.date.fromisoformat(job.get('checked_on', ''))
            if checked > dt.date.today():
                errors.append(f'{name}: future review date')
        except (ValueError, TypeError):
            errors.append(f'{name}: invalid review date')
        for field in ('title', 'company', 'eligibility', 'summary', 'evidence_note'):
            if not isinstance(job.get(field), str) or not job.get(field, '').strip():
                errors.append(f'{name}: {field} needs text')
    if not data.get('jobs'):
        errors.append('No jobs supplied')
    return errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('file', nargs='?', type=Path, default=ROOT / 'data/jobs.json')
    args = parser.parse_args()
    data = json.loads(args.file.read_text())
    problems = validate(data)
    for problem in problems:
        print(problem)
    if problems:
        raise SystemExit(1)
    print(f'Valid: {len(data["jobs"])} jobs, {len(data["sources"])} sources/channels')
