from pathlib import Path
from datetime import date
import json,re,unicodedata,collections,math
G=Path(__file__).resolve().parent;D=G;R=G.parent.parent
profiles=json.load(open(G/'preparacion-cargos.json'))['profiles']
def norm(t):
 t=re.sub(r'(?<=[a-zà-öø-ÿ])(?=[A-ZÀ-ÖØ-Þ])',' ',t)
 return ''.join(c for c in unicodedata.normalize('NFD',t.lower())if unicodedata.category(c)!='Mn')
def years(r):return max(0,(date.fromisoformat(r['end'])-date.fromisoformat(r['start'])).days/365.25)
def role_score(r):
 t=norm(r['roleFR']);t=re.sub(r'^(?:\d+(?:er|re|e|eme)?|deuxieme|troisieme|quatrieme|cinquieme|sixieme|premier(?= vice)|premiere(?= vice))\s+','',t);t=t.replace('gouvernementde','gouvernement de');y=years(r);label='Representación parlamentaria o territorial';score=0
 if re.match(r'^president(?:e)? de la republique',t):score=990;label='Presidencia de la República'
 elif re.match(r'^premier(?:e)? ministre',t):score=960;label='Jefatura del Gobierno'
 elif re.match(r'^president(?:e)? (?:du senat|de l[’\x27]assemblee nationale|du conseil constitutionnel|du parlement europeen)',t):score=875 if y>=2 else 740;label='Presidencia de una institución legislativa o constitucional'
 elif 'banque centrale europeenne'in t and t.startswith('president'):score=860;label='Presidencia del Banco Central Europeo'
 elif 'fonds monetaire international'in t and t.startswith('directeur'):score=855;label='Dirección del Fondo Monetario Internacional'
 elif 'unesco'in t and re.match(r'^direct(?:eur|rice) general',t):score=790;label='Dirección de una agencia internacional de Naciones Unidas'
 elif any(k in t for k in ['nations unies','onu','unies sur'])and re.match(r'^(?:secretaire executif|secretaire executive|directeur|directrice)',t):score=730;label='Responsabilidad ejecutiva internacional en Naciones Unidas'
 elif t.startswith('president')and 'conseil economique, social et environnemental'in t:score=730;label='Presidencia del Consejo Económico, Social y Ambiental'
 elif t.startswith('president')and 'association des maires de france'in t:score=650;label='Presidencia de la representación nacional de alcaldías'
 elif t.startswith('president')and 'comite des finances locales'in t:score=650;label='Presidencia del órgano estatal de finanzas locales'
 elif 'gouverneur de la banque de france'in t and not t.startswith(('sous','vice')):score=785;label='Gobernanza monetaria estatal'
 elif re.search(r'premier(?:e)? president(?:e)? de la cour des comptes',t):score=780;label='Presidencia de la institución estatal de fiscalización'
 elif re.match(r'^(?:vice-president(?:e)?(?: executif| executive)? de la commission europeenne|commissaire europe)',t):score=770;label='Responsabilidad ejecutiva en la Comisión Europea'
 elif re.match(r'^(?:secretaire d[’\x27]etat|haut-commissaire)',t):score=455;label='Secretaría de Estado o alta comisaría'
 elif ('ministre' in t or 'garde des sceaux'in t)and re.match(r'^(?:ministre|garde)',t):
  if 'delegue'in t.split('aupres')[0] or re.match(r'^ministre aupres',t):score=505;label='Ministerio delegado'
  else:
   sovereign=any(k in t for k in ['affaires etrangeres','interieur','justice','defense','armees','economie','finances','budget','comptes publics','education nationale'])
   score=(720 if y>=0.75 else 620 if y>=0.25 else 585)if sovereign else(635 if y>=0.25 else 585)
   if 'ministre d’etat'in t or "ministre d'etat"in t:score+=20
   label='Ministerio de ámbito estatal prioritario'if sovereign else'Ministerio de ámbito estatal'
 elif re.match(r'^(?:president|presidente|premier secretaire|secretaire national|secretaire general|coordinateur|co-president)',t)and 'groupe'not in t and not re.search(r'(?:adjoint|adjointe|delegue)',t.split(' du ')[0].split(' de ')[0])and any(k in t for k in ['parti','republicains','front national','rassemblement national','ecolog','modem','udf','rpr','ump','insoumise','mouvement des citoyens','mouvement republicain','centriste','communiste']):score=650;label='Dirección de una formación política de alcance nacional'
 elif re.match(r'^(?:president|presidente|co-president)',t)and 'delegation'not in t and 'groupe'in t and any(k in t for k in ['parlement europeen','groupe des verts','groupe de la gauche','groupe renew']):score=690;label='Dirección de grupo en el Parlamento Europeo'
 elif re.match(r'^(?:president|presidente|co-president)',t)and 'groupe'in t:score=660;label='Dirección de grupo parlamentario'
 elif re.match(r'^president(?:e)? (?:du |de |d[’\x27])',t)and 'delegue'not in t and any(k in t for k in ['conseil regional','conseil executif','gouvernement de la nouvelle-caledonie','gouvernement de nouvelle-caledonie','de la polynesie','assemblee de guyane','conseil executif de martinique','assemblee de martinique']):score=665;label='Presidencia de un ejecutivo regional o territorial'
 elif re.match(r'^president(?:e)?',t)and 'metropole'in t:score=660;label='Presidencia metropolitana'
 elif re.match(r'^president(?:e)?',t)and any(k in t for k in ['conseil general','conseil departemental']):score=560;label='Presidencia departamental'
 elif re.match(r'^president(?:e)?',t)and any(k in t for k in ['commission','delegation']):score=650 if any(k in t for k in ['finances','lois','defense','affaires etrangeres']) else 630;label='Presidencia de comisión o delegación parlamentaria o reguladora'
 elif re.match(r'^(?:(?:\d+.*|premier|premiere) )?vice-president(?:e)?',t)and 'groupe'in t:score=525;label='Vicepresidencia de grupo parlamentario'
 elif re.match(r'^(?:\d+.*)?vice-president(?:e)?',t)and 'commission'in t:score=550;label='Vicepresidencia de comisión parlamentaria'
 elif re.match(r'^(?:\d+.*)?vice-president(?:e)?',t)and any(k in t for k in ['senat','assemblee nationale','parlement europeen']):score=660;label='Vicepresidencia parlamentaria'
 elif 'secretaire general de la presidence de la republique'in t:score=710;label='Secretaría general de la Presidencia de la República'
 elif 'sous-gouverneur de la banque de france'in t:score=650;label='Subgobernanza del Banco de Francia'
 elif t.startswith('defenseur des droits'):score=735;label='Defensoría de derechos de ámbito estatal'
 elif t.startswith('maire de paris'):score=685;label='Alcaldía de París'
 elif re.match(r'^maire de (?:lyon|marseille)',t):score=645;label='Alcaldía de una gran ciudad estatal'
 elif re.match(r'^maire (?:de |d[’\x27])',t):score=485;label='Responsabilidad ejecutiva municipal'
 elif 'depute europeen'in t or 'deputee europeenne'in t:score=425;label='Representación en el Parlamento Europeo'
 elif any(k in t for k in ['depute francais','deputee francaise','senateur','senatrice']):score=410;label='Representación en una cámara estatal'
 elif t.startswith(('ambassadeur','ambassadrice')):score=475;label='Responsabilidad diplomática estatal'
 elif t.startswith('rapporteur general')and any(k in t for k in ['budget','finances']):score=660;label='Responsabilidad general del presupuesto parlamentario'
 elif 'questeur'in t and any(k in t for k in ['assemblee nationale','senat']):score=630;label='Cuestoría de una cámara estatal'
 elif t.startswith('membre')and 'conseil constitutionnel'in t:score=625;label='Miembro del Consejo Constitucional'
 if score:score+=min(36,y*2)
 return round(score,3),label
legend_groups={
 'Presidencia de la República y trayectoria estatal':['francois-mitterrand','jacques-chirac','nicolas-sarkozy','francois-hollande','valery-giscard-d-estaing'],
 'Jefatura del Gobierno y trayectoria nacional':['lionel-jospin','michel-rocard','laurent-fabius','alain-juppe','francois-fillon','manuel-valls','edouard-philippe','jean-castex','elisabeth-borne','gabriel-attal','francois-bayrou','jean-pierre-raffarin','michel-barnier','sebastien-lecornu','bernard-cazeneuve','dominique-de-villepin','pierre-mauroy','jean-marc-ayrault'],
 'Presidencia parlamentaria estatal sostenida o combinación de altas responsabilidades institucionales':['gerard-larcher','yael-braun-pivet','richard-ferrand','bernard-accoyer','claude-bartolone','jean-pierre-bel','christian-poncelet','jean-louis-debre','louis-mermaz'],
 'Presidencia del Consejo Constitucional y trayectoria legislativa':['robert-badinter'],
 'Presidencia del Parlamento Europeo y responsabilidades ministeriales':['simone-veil'],
 'Alta dirección de una institución económica internacional':['jean-claude-trichet','dominique-strauss-kahn'],
 'Liderazgo nacional sostenido y candidatura presidencial de gran alcance documentada':['jean-luc-melenchon','jean-marie-le-pen','segolene-royal'],
 'Continuidad o combinación de ministerios estatales de primera responsabilidad':['michele-alliot-marie','bruno-le-maire','jean-yves-le-drian','jean-pierre-chevenement'],
 'Trayectoria ministerial cultural y educativa prolongada y medidas de alcance nacional documentadas':['jack-lang']}
legend={id:reason for reason,ids in legend_groups.items()for id in ids};assert len(legend)==44
# Editorial boosts for national leadership/candidacy and combined responsibilities that a single infobox title understates.
overrides={
'martine-aubry':805,'jordan-bardella':805,'anne-hidalgo':760,'laurent-wauquiez':780,'bruno-retailleau':790,'xavier-bertrand':780,'valerie-pecresse':780,'rachida-dati':770,'olivier-faure':750,'fabien-roussel':710,'eric-ciotti':730,'eric-zemmour':665,'marion-marechal':630,'yannick-jadot':680,'raphael-glucksmann':670,'marine-tondelier':650,'francois-ruffin':540,'sandrine-rousseau':500,'clementine-autain':550,'mathilde-panot':720,'manon-aubry':720,'nicolas-dupont-aignan':600,'philippe-poutou':510,'nathalie-arthaud':510,'francois-asselineau':510,'florian-philippot':540,'jean-lassalle':540,'christiane-taubira':775,'francois-baroin':760,'pierre-moscovici':805,'herve-morin':730,'pierre-laurent':715,'olivier-besancenot':610,'marie-george-buffet':735,'robert-hue':720,'daniel-cohn-bendit':735,'jose-bove':675,'jean-marie-cavada':620,'philippe-de-villiers':640,'noel-mamere':640,'dominique-voynet':750,'cecile-duflot':740,'nicolas-hulot':745,'francois-xavier-bellamy':680,'nathalie-loiseau':680,'jean-louis-borloo':790,'martin-hirsch':680,'carole-delga':760,'stephane-sejourne':800,'manuel-bompard':720,'francois-de-rugy':770}
def main():
 rows=[]
 for x in profiles:
  rs=x['datedCareerOffices'];scored=[(*role_score(r),r)for r in rs];score,kind,primary=max(scored,key=lambda a:(a[0],a[2]['start']))
  # Continuity is evaluated through offices, not age, party, surname or batch number.
  public_rs=[r for r in rs if role_score(r)[0]>0];service_span=(date.fromisoformat(max(r['end']for r in public_rs))-date.fromisoformat(min(r['start']for r in public_rs))).days/365.25 if public_rs else 0
  breadth=len({role_score(r)[1]for r in public_rs});cabinet=[r for r in public_rs if role_score(r)[1]in ['Ministerio de ámbito estatal prioritario','Ministerio de ámbito estatal']];intervals=sorted((r['start'],r['end'])for r in cabinet);merged=[]
  for start,end in intervals:
   if merged and start<=merged[-1][1]:merged[-1][1]=max(merged[-1][1],end)
   else:merged.append([start,end])
  cabinet_years=sum((date.fromisoformat(b)-date.fromisoformat(a)).days/365.25 for a,b in merged)
  score+=min(15,service_span/3)+min(12,max(0,breadth-1)*2)+min(45,cabinet_years*3)
  editorial=overrides.get(x['id']);score=max(score,editorial or 0)
  labels=' '.join(norm(r['roleFR'])for r in rs)
  tags=[]
  patterns={'finance':'economie|financ|budget|banque|monetair|comptes|tresor','care':'sante|solidarit|social|handicap|famille|enfance|logement','justice':'justice|constitution|sceaux|droits|lois','security':'interieur|defense|armees|securite','parliament':'groupe|depute|deputee|senat|senateur|senatrice|assemblee|parti|front national|rassemblement|republicains|insoumise|ecologistes','culture':'culture|education|communication|sport|porte-parole|jeunesse','territory':'maire|conseil regional|conseil executif|polynesie|nouvelle-caledonie|guyane|departement|metropole|collectivites|outre-mer','diplomacy':'etrangeres|europeen|europeenne|diplomat|ambassad|cooperation','executive':'premier ministre|premiere ministre|president de la republique'}
  for tag,pattern in patterns.items():
   if re.search(pattern,labels):tags.append(tag)
  if service_span>=25:tags.append('continuity')
  # The biography body supplies candidacy/reform context for these four expressly reviewed cases.
  context={
   'jean-luc-melenchon':'Candidaturas presidenciales de 2017 y 2022, dirección de grupo y construcción de una formación política nacional.',
   'jean-marie-le-pen':'Dirección del FN durante varias décadas y acceso a la segunda vuelta presidencial en 2002.',
   'segolene-royal':'Segunda vuelta presidencial de 2007, responsabilidades ministeriales y presidencia regional.',
   'francois-xavier-bellamy':'Dirección de la delegación francesa del PPE y vicepresidencia ejecutiva de LR, documentadas en la introducción de la biografía.',
   'simone-veil':'Presidencia del Parlamento Europeo (1979–1982), etapa parlamentaria posterior y Ministerio de Asuntos Sociales en 1993–1995.',
   'jack-lang':'Cultura y Educación durante varios gobiernos; ley del precio único del libro y lanzamiento de la Fiesta de la Música.'}.get(x['id'])
  reason=legend.get(x['id'])or kind+'; se ponderan duración y combinación de responsabilidades.'
  if editorial:reason+=' Revisión editorial de alcance nacional y trayectoria combinada.'
  rows.append({'id':x['id'],'name':x['name'],'batch':x['batch'],'source':x['source'],'sourceSha256':x['sourceSha256'],'primaryOffice':primary,'responsibilityClass':kind,'editorialPriority':round(score,3),'editorialOverride':editorial,'legendaryCriterion':legend.get(x['id']),'criterion':reason,'bodyContextEvidence':context,'fullCabinetYears':round(cabinet_years,2),'publicServiceSpanYears':round(service_span,2),'responsibilityBreadth':breadth,'tags':tags})
 rows.sort(key=lambda x:(0 if x['id']in legend else 1,-x['editorialPriority'],-x['responsibilityBreadth'],-x['publicServiceSpanYears'],norm(x['name'])))
 for i,x in enumerate(rows):
  x['globalRank']=i+1;x['rarity']=['legendario','especial','raro','comun'][0 if i<44 else 1 if i<132 else 2 if i<264 else 3]
  start={'legendario':0,'especial':44,'raro':132,'comun':264}[x['rarity']];n={'legendario':44,'especial':88,'raro':132,'comun':176}[x['rarity']];within=i-start
  x['cost']= (5 if within<22 else 4)if x['rarity']=='legendario'else (4 if within<59 else 3)if x['rarity']=='especial'else(3 if within<88 else 2)if x['rarity']=='raro'else(2 if within<117 else 1)
 (G/'decisiones.json').write_text(json.dumps({'date':'2026-11-06','scope':440,'enabled':False,'status':'editorial_draft_pending_cutoff_and_wardrobe_review','method':'Comparación conjunta de responsabilidades, continuidad y alcance nacional. Selección editorial explícita de 44 máximos; resto ordenado por responsabilidades documentadas. No es una métrica objetiva de valor personal. No usa el tier anterior ni cupos por tanda.','targetDistribution':{'legendario':44,'especial':88,'raro':132,'comun':176},'cards':rows},ensure_ascii=False,indent=2)+'\n')
 (D/'tier-review-working.txt').write_text('\n'.join(f"{x['globalRank']:3} {x['rarity']:10} {x['name']:30} {x['editorialPriority']:7.2f} {x['responsibilityClass']} | {x['primaryOffice']['roleFR']}"for x in rows)+'\n')
 print('Draft',collections.Counter(x['rarity']for x in rows));print('Cutoffs')
 for x in rows:
  if x['globalRank']in range(121,143)or x['globalRank']in range(255,275):print(x['globalRank'],x['name'],x['rarity'],x['editorialPriority'],x['primaryOffice']['roleFR'])

if __name__=="__main__":main()
