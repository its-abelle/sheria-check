"""Data-tool regression tests; fixtures are synthetic and never production content."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
import import_akn
import prepare_legal_content
from traffic_snapshot import parse_snapshot, normalise_space

class SourceToolsTest(unittest.TestCase):
    def test_xml_retains_conditions_and_stays_unverified(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'source.xml'
            path.write_text('''<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0"><act><body><section eId="sec_1"><num>1.</num><heading>TEST ONLY</heading><subsection><num>(1)</num><content><p>Original conditional wording or another alternative.</p></content></subsection></section></body></act></akomaNtoso>''')
            bundle = import_akn.prepare(path, 'test-2024', 'TEST ONLY', '2024', 'https://new.kenyalaw.org/akn/test', 'Synthetic fixture')
            provision = bundle['provisions'][0]
            self.assertIn('(1)', provision['text'])
            self.assertIn('or another alternative.', provision['text'])
            self.assertEqual(provision['position'], 1)
            self.assertIsNone(provision['verified_at'])
            self.assertNotIn('publication_status', provision)
            self.assertEqual(provision['source_url'], 'https://new.kenyalaw.org/akn/test#sec_1')

    def test_html_or_error_pages_are_not_laws(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'error.xml'
            path.write_text('<html><body>Blocked</body></html>')
            with self.assertRaises(ValueError):
                import_akn.prepare(path, 'test', 'TEST', '2024', 'https://new.kenyalaw.org/test', '')

    def test_pdf_excludes_schedule_and_preserves_section_order(self):
        raw = 'Legislation as at 26 April 2024\nThere is no copyright on the legislative content\n'
        raw += '\n1. Short title\nTEST source.\n'
        for number in [42, 43, 44, 47, 49, 52, 120]:
            raw += f'\n{number}. TEST heading\nTEST conditional wording.\n'
        raw += '\nSCHEDULE [s. 117A]\nDo not append this table to Section 120.\n'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf = root / 'test.pdf'; pdf.write_bytes(b'TEST ONLY')
            with patch.object(prepare_legal_content, 'ROOT', root), patch.object(prepare_legal_content.subprocess, 'run', return_value=SimpleNamespace(stdout=raw)):
                bundle = prepare_legal_content.prepare(pdf)
            self.assertNotIn('SCHEDULE', bundle['provisions'][-1]['text'])
            self.assertEqual(bundle['provisions'][-1]['number'], 'Section 120')
            self.assertEqual([p['position'] for p in bundle['provisions']], list(range(1, 9)))
            self.assertTrue(all(p['verified_at'] is None for p in bundle['provisions']))


    def test_wrapped_heading_uses_toc_and_does_not_enter_body(self):
        raw = """Legislation as at 26 April 2024
Contents
1. Short title ........ 2
48. A wrapped heading continued title ........ 7
120. End ........ 8
1. Short title
TEST source.
48. A wrapped heading
    continued title
(1) TEST body.
120. End
TEST ending.
"""
        sections = parse_snapshot(raw)
        self.assertEqual(sections[1].heading, 'A wrapped heading continued title')
        self.assertEqual(sections[1].text, '(1) TEST body.')

    def test_body_numbers_and_uppercase_survive_page_cleanup(self):
        raw = """Legislation as at 26 April 2024
1. Short title
TEST source.
48. TEST heading
(1) Value follows:
123
                RETAIN THIS BODY TEXT
              8Traffic Act (Cap. 403) Kenya
Continued body.
120. End
TEST ending.
              9"""
        section = parse_snapshot(raw)[1]
        self.assertIn('123', section.text)
        self.assertIn('RETAIN THIS BODY TEXT', section.text)
        self.assertNotIn('Traffic Act (Cap.', section.text)
        self.assertEqual(section.first_page, 1)
        self.assertEqual(section.last_page, 2)
        self.assertNotIn('8', section.text)

    def test_toc_disagreement_fails_instead_of_inventing_heading(self):
        raw = """Legislation as at 26 April 2024
Contents
1. Short title ........ 2
48. Different title ........ 7
120. End ........ 8
1. Short title
TEST source.
48. Actual heading
TEST body.
120. End
TEST ending.
"""
        with self.assertRaisesRegex(ValueError, 'differs from the TOC'):
            parse_snapshot(raw)



if __name__ == '__main__':
    unittest.main()
