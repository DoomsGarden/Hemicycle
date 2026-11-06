"""Read publication dates from explicit publisher metadata, never URL guesses."""
import json

def publication_date(root):
    # Archived Drupal pages expose their original date as dc:date; the social
    # published_time can instead be the date of the site's 2016 migration.
    dates = root.xpath('//span[@property="dc:date" and contains(@class,"date-display-single")]/@content')
    if dates:
        return dates[0][:10]
    dates = root.xpath('//meta[@property="article:published_time"]/@content')
    if dates:
        return dates[0][:10]
    for script in root.xpath('//script[@type="application/ld+json"]/text()'):
        try:
            data = json.loads(script)
        except (ValueError, TypeError):
            continue
        nodes = data if isinstance(data, list) else [data]
        for node in nodes:
            if isinstance(node, dict):
                nodes.extend(node.get('@graph', []))
                types = node.get('@type', [])
                types = [types] if isinstance(types, str) else types
                if any(t in ['NewsArticle', 'Article', 'ReportageNewsArticle'] for t in types):
                    date = node.get('datePublished')
                    if isinstance(date, str):
                        return date[:10]
    # Mayotte Hebdo's main article date precedes the sidebar's recent stories.
    dates = root.xpath('(//time[contains(concat(" ",normalize-space(@class)," ")," entry-date ") and @datetime])[1]/@datetime')
    return dates[0][:10] if dates else None
