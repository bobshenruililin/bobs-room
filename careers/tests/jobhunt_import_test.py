import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('import_jobhunt', Path(__file__).resolve().parents[1] / 'scripts/import_jobhunt.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def run(**kw):
    return dict(site='xiaohongshu', nature='intern', fetched_at='2026-11-09T13:00:00Z',
                scope={'query': 'AI', 'channel': 'intern'}, **kw)


class ImportTest(unittest.TestCase):
    def test_network_failure_is_not_empty(self):
        out = mod.convert(run(exit_code=1))
        self.assertEqual(out['collection_status'], 'fetch_failed')
        self.assertIsNone(out['result_count'])
        self.assertIsNone(out['last_success_at'])

    def test_cli_empty_exit_alone_is_unconfirmed(self):
        self.assertEqual(mod.convert(run(exit_code=66))['collection_status'], 'empty_unconfirmed')

    def test_missing_array_is_schema_failure(self):
        self.assertEqual(mod.convert(run(exit_code=0))['collection_status'], 'schema_changed')

    def test_empty_requires_response_and_pagination_evidence(self):
        self.assertEqual(mod.convert(run(exit_code=0, rows=[]))['collection_status'], 'empty_unconfirmed')
        capture = {'response_schema_valid': True, 'all_pages_read': True, 'reported_total': 0}
        self.assertEqual(mod.convert(run(exit_code=0, rows=[], capture=capture))['collection_status'], 'empty')

    def test_publish_time_never_becomes_a_modification_or_review_date(self):
        row = dict(id='22391', name='Example intern', nature_code='intern',
                   url='https://job.xiaohongshu.com/campus/intern/position/22391', updated_at='2026-10-01')
        out = mod.convert(run(exit_code=0, rows=[row]))
        job = out['proposals'][0]
        self.assertEqual(job['source_published_at'], '2026-10-01')
        self.assertIsNone(job['source_updated_at'])
        self.assertIsNone(job['checked_on'])
        self.assertEqual(out['collection_status'], 'partial')


if __name__ == '__main__':
    unittest.main()
