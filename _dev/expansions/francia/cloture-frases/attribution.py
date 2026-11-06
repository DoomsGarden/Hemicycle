"""Recognize explicit speaker changes, including archived Assembly formats."""
import re
from lxml import html
TURN=re.compile(r'^((?:Mme|MM|M)\.?\s+.{2,170}?)(?:\.\s*[-–—]\s*|\s+[-–—]\s+)')
PLAIN_TURN=re.compile(r'^((?:Mme|MM|M)\.?\s+[^.]{2,170}?)\.\s+')
BARE_NAME=re.compile(r"^[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’\-]+(?:[- ][A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’\-]+)*\s+[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý'’\-]+(?:\s+[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý'’\-]+)*$")
NON_NAMES={'Le','La','Les','Un','Une','Des','Ce','Cette','Ces','Notre','Nos','Mon','Ma','Mes','Votre','Vos','Son','Ses','En','Pour','Sans','Avec','Concernant','Monsieur','Madame','Président','Présidente','Présidents','France','Europe','État','Etat','Source'}
REPORTED_REFERENCE=re.compile(r"\b(?:a|avait|ont|avaient|s'est|s'était)\s+(?:décrit|rappelé|indiqué|souligné|expliqué|précisé|ajouté|estimé|fait|présenté|déclaré|noté|observé|demandé|insisté|considéré)\b",re.I)
def is_session_date_heading(text):
 """A law's date inside a subject heading is not the date of the hearing."""
 return len(text)<180 and bool(re.match(r'^(?:Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+\d',text,re.I))
def clean(t):return ' '.join(t.replace('\x92',"'").replace('\x91',"'").split())
def valid_label_name(label):
 identity=re.sub(r'^(?:Mme|MM|M)\.?\s+','',label).split(',')[0].split('(')[0].strip()
 if identity in ['le président','la présidente','le ministre','la ministre','le rapporteur','la rapporteure']:return True
 particles={'de','du','des','le','la','d’',"d'",'van','von'}
 return bool(identity)and all(part[:1].isupper()or part in particles for part in identity.split())
def speaker_marker(element):
 text=clean(element.text_content())
 for pattern in [TURN,PLAIN_TURN]:
  m=pattern.match(text)
  if m and valid_label_name(m[1]):
   if pattern is PLAIN_TURN and REPORTED_REFERENCE.search(m[1]):continue
   tail=m[1].split(',',1)[1].strip()if','in m[1]else''
   if pattern is PLAIN_TURN and re.match(r'^(?:vous|nous|je|tu|il|elle|on|qui|que|ce|cette|ces|si|a |est |en avez|n[’\x27])\b',tail,re.I):continue
   return m[1],m.end()
 bold=element.xpath('.//b|.//strong')
 if bold:
  head=clean(bold[0].text_content())
  if text.startswith(head)and re.match(r'^(?:Mme|MM|M)\.?\s+',head):return head,len(head)
 markup=html.tostring(element,encoding='unicode')
 # A name followed by <br> is a real boundary in the press-conference archive.
 prefix=markup.split('<br',1)[0]
 head=clean(html.fromstring(prefix).text_content())if'<br'in markup else text
 if len(head)<100 and head.split()and head.split()[0]not in NON_NAMES and BARE_NAME.fullmatch(head):return head,len(head)
 return None

def canonical_name(label):
 import unicodedata
 value=re.sub(r'^(?:Mme|MM|M)\.?\s+','',label).split(',')[0].split('(')[0].strip(' .-–—')
 return ''.join(c for c in unicodedata.normalize('NFD',value.lower())if c.isalnum())

def is_editorial_excerpt(element,fragment):
 return any(fragment in clean(n.text_content())for n in element.xpath('.//i|.//em'))

def spoken_text(element):
 """Keep italic loanwords; omit whole editorial paragraphs and stage directions."""
 import copy
 text=clean(element.text_content());annotations=element.xpath('.//i|.//em')
 if any(clean(n.text_content())==text for n in annotations):return ''
 node=copy.deepcopy(element)
 for n in node.xpath('.//i|.//em'):
  value=clean(n.text_content())
  if value.startswith('(')and value.endswith(')'):n.drop_tree()
 return clean(node.text_content())
