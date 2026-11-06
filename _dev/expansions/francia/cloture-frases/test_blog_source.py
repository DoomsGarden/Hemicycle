import unittest
from lxml import html
from blog_source import signed_post

class SignedPosts(unittest.TestCase):
    def page(self):
        return html.fromstring('<div><div itemprop="blogPost"><meta itemprop="postId" content="one"><div class="post-body entry-content">Texto propio.</div><span itemprop="author"><span itemprop="name">Jean-François Macaire</span></span><abbr itemprop="datePublished" title="2010-05-24T17:10:00+02:00">17:10</abbr><div class="comments">Texto ajeno.</div></div><div itemprop="blogPost"><meta itemprop="postId" content="two"><div class="post-body">Otro artículo.</div><span itemprop="author"><span itemprop="name">Otro Autor</span></span><abbr itemprop="datePublished" title="2026-11-06">Hoy</abbr></div></div>')

    def test_author_body_and_date_belong_to_the_same_post(self):
        self.assertEqual(signed_post(self.page(),'one','Jean-François Macaire'),('Texto propio.','2010-05-24'))

    def test_another_authors_post_cannot_be_imported(self):
        with self.assertRaises(AssertionError):signed_post(self.page(),'two','Jean-François Macaire')

    def test_missing_post_cannot_fall_back_to_the_page(self):
        with self.assertRaises(AssertionError):signed_post(self.page(),'absent','Jean-François Macaire')

if __name__=='__main__':unittest.main()
