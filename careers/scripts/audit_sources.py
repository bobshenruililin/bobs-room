#!/usr/bin/env python3
"""Produce a cheap source-change queue. Never edits or verifies the job dataset."""
import argparse
import datetime as dt
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ignored = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'):
            self.ignored += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self.ignored = max(0, self.ignored - 1)

    def handle_data(self, data):
        if not self.ignored:
            self.parts.append(data)


def normalize(html):
    parser = VisibleText()
    parser.feed(html)
    return re.sub(r'\s+', ' ', ' '.join(parser.parts)).strip()


def inspect(url, timeout=15):
    request = urllib.request.Request(url, headers={'User-Agent': 'CareerAtlasSourceChecker/1.0 (public job link health only)'})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read(2_000_001)
            if len(raw) > 2_000_000:
                return {'result': 'review', 'reason': 'Page exceeds size limit'}
            text = normalize(raw.decode(response.headers.get_content_charset() or 'utf-8', errors='replace'))
            return {'result': 'fetched', 'http_status': response.status,
                    'final_url': response.url, 'text_length': len(text),
                    'sha256': hashlib.sha256(text.encode()).hexdigest()}
    except urllib.error.HTTPError as error:
        return {'result': 'review', 'http_status': error.code,
                'reason': 'Missing page; confirm removal' if error.code in (404, 410) else 'Blocked or unsuccessful response; manual review'}
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        return {'result': 'review', 'reason': f'Fetch failed: {type(error).__name__}'}


def review_reasons(job, result, previous, today):
    reasons = []
    if job['status'] != 'listed':
        reasons.append('Existing evidence needs review')
    if (today - dt.date.fromisoformat(job['checked_on'])).days > 14:
        reasons.append('Source review is older than 14 days')
    if result['result'] != 'fetched':
        reasons.append(result['reason'])
    elif result.get('text_length', 0) < 300:
        reasons.append('Thin or JavaScript-rendered page; inspect in browser')
    elif not previous:
        reasons.append('First fetch; establish a reviewed baseline')
    elif previous.get('sha256') != result.get('sha256'):
        reasons.append('Source text changed; compare the actual job details')
    if result.get('final_url') and result['final_url'] != job['source_url']:
        reasons.append('Source redirected; confirm the role is still present')
    return reasons


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data', type=Path, default=ROOT / 'data/jobs.json')
    parser.add_argument('--out', type=Path, default=Path('.career-audit'))
    parser.add_argument('--timeout', type=int, default=15)
    args = parser.parse_args()
    data = json.loads(args.data.read_text())
    args.out.mkdir(parents=True, exist_ok=True)
    snapshot_file = args.out / 'source-snapshots.json'
    old = json.loads(snapshot_file.read_text()) if snapshot_file.exists() else {}
    today = dt.date.today()
    results, queue = {}, []
    for job in data['jobs']:
        url = job['source_url']
        if url not in results:
            results[url] = inspect(url, args.timeout)
        result = results[url]
        reasons = review_reasons(job, result, old.get(url), today)
        if reasons:
            queue.append({'id': job['id'], 'company': job['company'], 'title': job['title'],
                          'url': url, 'reasons': reasons, 'last_source_review': job['checked_on']})
    report = {'run_on': today.isoformat(), 'note': 'Link health is not verification of a vacancy. Dataset unchanged.',
              'unique_urls_checked': len(results), 'review_queue': queue}
    (args.out / 'review-queue.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    # Keep a failed fetch from overwriting the previous content fingerprint.
    snapshot = {**old, **{u: r for u, r in results.items() if r['result'] == 'fetched'}}
    snapshot_file.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(results)} URLs checked; {len(queue)} jobs queued. Dataset unchanged.')
    print(args.out / 'review-queue.json')


if __name__ == '__main__':
    main()
