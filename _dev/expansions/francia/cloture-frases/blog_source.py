"""Read a signed Blogger post without including comments or neighbouring posts."""
from attribution import canonical_name, clean

def signed_post(root, post_id, expected_name):
    posts=root.xpath('//div[@itemprop="blogPost" and .//meta[@itemprop="postId" and @content=$id]]',id=post_id)
    assert len(posts)==1, 'The exact signed post must be present once.'
    post=posts[0]
    authors=post.xpath('.//*[@itemprop="author"]//*[@itemprop="name"]')
    assert len(authors)==1 and canonical_name(clean(authors[0].text_content()))==canonical_name(expected_name)
    dates=post.xpath('.//abbr[@itemprop="datePublished"]/@title')
    assert len(dates)==1
    bodies=post.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," post-body ")]')
    assert len(bodies)==1
    return clean(bodies[0].text_content()), dates[0][:10]
