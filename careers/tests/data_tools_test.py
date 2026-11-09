import copy
import datetime as dt
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / f'{name}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


audit, validator = module('audit_sources'), module('validate_data')


class DataToolsTest(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT / 'data/jobs.json').read_text())

    def test_published_dataset_validates(self):
        self.assertEqual(validator.validate(self.data), [])

    def test_intake_dates_cannot_be_graduation_years(self):
        self.data['jobs'][0]['cohort'] = ['Jan–Jun 2027']
        self.assertTrue(any('graduation years' in x for x in validator.validate(self.data)))

    def test_indexed_evidence_cannot_be_marked_reviewed(self):
        self.data['jobs'][0]['verification'] = 'indexed_only'
        self.assertTrue(any('page_read' in x for x in validator.validate(self.data)))

    def test_page_fingerprint_ignores_scripts_and_spacing(self):
        self.assertEqual(audit.normalize('<p>AI   intern</p><script>new Date()</script>'), 'AI intern')

    def test_http_success_cannot_refresh_stale_review(self):
        job = copy.deepcopy(self.data['jobs'][0])
        job['checked_on'] = '2026-01-01'
        result = {'result': 'fetched', 'text_length': 800, 'sha256': 'same'}
        reasons = audit.review_reasons(job, result, result, dt.date(2026, 11, 9))
        self.assertIn('Source review is older than 14 days', reasons)
        self.assertEqual(job['checked_on'], '2026-01-01')


if __name__ == '__main__':
    unittest.main()
