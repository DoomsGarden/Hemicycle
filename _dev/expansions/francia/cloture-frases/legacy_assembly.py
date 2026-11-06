"""Read explicit speaker turns in the Assembly's legacy HTML records."""
from attribution import canonical_name, clean, speaker_marker, spoken_text

def legacy_turns(root):
    speaker = chair = chair_evidence = None
    index = -1
    for element in root.xpath('//p|//h5'):
        text = clean(element.text_content())
        if element.tag == 'h5':
            if element.get('class') == 'presidence' and text.startswith('Présidence de '):
                chair_evidence = text
                chair = canonical_name(text[len('Présidence de '):].rstrip(','))
                speaker = None
            continue
        index += 1
        marker = speaker_marker(element)
        if marker:
            speaker = canonical_name(marker[0])
        identity = chair if speaker in ['lepresident', 'lapresidente'] else speaker
        yield index, identity, spoken_text(element), chair_evidence
