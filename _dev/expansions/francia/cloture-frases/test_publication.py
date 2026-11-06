import unittest
from lxml import html
from publication import publication_date

class PublicationDates(unittest.TestCase):
    def test_original_archive_date_precedes_migration_metadata(self):
        root = html.fromstring('<html><head><meta property="article:published_time" content="2016-02-01T07:38:40+11:00"></head><body><span property="dc:date" class="date-display-single" content="2014-08-29T11:00:00+11:00">29 août 2014</span></body></html>')
        self.assertEqual(publication_date(root), '2014-08-29')

    def test_article_publication_not_modification_or_sidebar(self):
        root = html.fromstring('<html><head><script type="application/ld+json">{"@graph":[{"@type":"NewsArticle","datePublished":"2015-03-14T08:00:00Z","dateModified":"2026-11-06"}]}</script></head><body><time class="entry-date" datetime="2026-11-06">Today</time></body></html>')
        self.assertEqual(publication_date(root), '2015-03-14')

    def test_main_article_time_precedes_sidebar(self):
        root = html.fromstring('<div><time class="entry-date updated td-module-date" datetime="2021-06-18T11:35:16+03:00">18 juin 2021</time><aside><time class="entry-date" datetime="2026-11-06">Today</time></aside></div>')
        self.assertEqual(publication_date(root), '2021-06-18')

    def test_no_inference_from_undated_page(self):
        self.assertIsNone(publication_date(html.fromstring('<div>Copyright 2026</div>')))

if __name__ == '__main__':
    unittest.main()
