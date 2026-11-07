/* Localización de interfaz, independiente del texto editorial atribuido. */
(function(root){'use strict';
var locale='es',KEY='hemicycle_locale_v1';try{var saved=localStorage.getItem(KEY);if(['es','en','fr'].includes(saved))locale=saved;}catch(ignore){}
var rows=`Hemiciclo|Hemicycle|Hémicycle
CARA A CARA|FACE TO FACE|FACE À FACE
Toma la palabra|Take the floor|Prenez la parole
Iniciar|Start|Commencer
Activar música|Enable music|Activer la musique
Desactivar música|Disable music|Désactiver la musique
Opciones|Options|Options
Idioma|Language|Langue
Lectura|Reading|Lecture
Tamaño del texto|Text size|Taille du texte
Tamaño de iconos|Icon size|Taille des icônes
Sonido|Sound|Son
Música|Music|Musique
Volumen|Volume|Volume
Efectos|Effects|Effets
Cerrar|Close|Fermer
Cancelar|Cancel|Annuler
Confirmar|Confirm|Confirmer
Entendido|Understood|Compris
Genial!|Great!|Super !
¡Genial!|Great!|Super !
Volver|Back|Retour
Menú|Menu|Menu
Jugar|Play|Jouer
Jugadores|Players|Joueurs
Perfil de jugador|Player profile|Profil du joueur
Tu bancada|Your bench|Votre groupe
Invitado|Guest|Invité
Tu cuenta|Your account|Votre compte
Tu colección|Your collection|Votre collection
TU COLECCIÓN|YOUR COLLECTION|VOTRE COLLECTION
Colección|Collection|Collection
Tienda|Shop|Boutique
Liga|League|Ligue
Mercado|Market|Marché
Logros|Achievements|Succès
Desafíos|Challenges|Défis
Historial|History|Historique
Historial de combates|Battle history|Historique des débats
Historial de partidas|Match history|Historique des parties
Ayuda|Help|Aide
Novedades y cambios|News and changes|Nouveautés et modifications
Novedades|What's new|Nouveautés
Gabinete|Cabinet|Équipe
Gabinetes|Cabinets|Équipes
Editar perfil|Edit profile|Modifier le profil
Cuenta y guardado|Account and save|Compte et sauvegarde
Más estadísticas|More statistics|Plus de statistiques
Experiencia|Experience|Expérience
Guardar|Save|Enregistrer
Guardar cambios|Save changes|Enregistrer les modifications
Nick de jugador|Player nickname|Pseudo du joueur
Elige tu nick|Choose your nickname|Choisissez votre pseudo
Continuar sin cuenta|Continue as guest|Continuer sans compte
Continuar con Google|Continue with Google|Continuer avec Google
Acceder con correo|Sign in with email|Se connecter par e-mail
Crear cuenta|Create account|Créer un compte
Recuperar acceso|Recover access|Récupérer l'accès
Correo electrónico|Email address|Adresse e-mail
Contraseña|Password|Mot de passe
Nueva contraseña|New password|Nouveau mot de passe
Entrar|Sign in|Se connecter
Salir|Sign out|Se déconnecter
Reintentar conexión|Retry connection|Réessayer la connexion
Comprobando sesión…|Checking session…|Vérification de la session…
Sin conexión|Offline|Hors connexion
Nube|Cloud|Cloud
Reclamar|Claim|Récupérer
Reclamado|Claimed|Récupéré
Reclamado!|Claimed!|Récupéré !
Reclamar sobre|Claim pack|Récupérer le paquet
¡Tienes recompensas sin reclamar!|You have unclaimed rewards!|Des récompenses vous attendent !
Buzón|Inbox|Messagerie
TUS RECOMPENSAS|YOUR REWARDS|VOS RÉCOMPENSES
Todo al día|All caught up|Tout est à jour
Evento de ampliación|Expansion event|Événement d'extension
Regalo|Gift|Cadeau
¡Celebramos la ampliación!|Let's celebrate the expansion!|Fêtons l'extension !
¡Recompensa guardada!|Reward saved!|Récompense enregistrée !
Ya tienes los 10.000 FS del evento en tu saldo.|The event's 10,000 FS have been added to your balance.|Les 10 000 FS de l'événement ont été ajoutés à votre solde.
No se ha reclamado la entrega|Delivery not claimed|Récompense non récupérée
10.000 FS para preparar tus gabinetes.|10,000 FS to prepare your cabinets.|10 000 FS pour préparer vos équipes.
Tres sobres generales de este tipo, con cinco cromos cada uno. Se recogen juntos.|Three general packs of this type, with five cards each. Claim them together.|Trois paquets généraux de ce type, de cinq cartes chacun. À récupérer ensemble.
Cinco entregas para reclamar por separado, una vez por cuenta. ¡Prueba las novedades y prepara tus gabinetes!|Five separate deliveries, once per account. Try the new features and prepare your cabinets!|Cinq récompenses séparées, une fois par compte. Découvrez les nouveautés et préparez vos équipes !
Volver al buzón|Back to inbox|Retour à la messagerie
Volver al menú|Back to menu|Retour au menu
Recoger recompensa|Collect reward|Récupérer la récompense
Tabla de loot|Loot table|Table du butin
Tabla|Loot|Table
de loot|table|du butin
Probabilidades|Probabilities|Probabilités
Sobres generales|General packs|Paquets généraux
Sobres por país|Country packs|Paquets par pays
País|Country|Pays
General|General|Général
Todos los países|All countries|Tous les pays
Sobre común|Common pack|Paquet commun
Sobre raro|Rare pack|Paquet rare
Sobre legendario|Legendary pack|Paquet légendaire
Sobre mítico|Mythic pack|Paquet mythique
Sobre diario|Daily pack|Paquet quotidien
Sobre semanal|Weekly pack|Paquet hebdomadaire
Común|Common|Commun
Raro|Rare|Rare
Especial|Special|Spécial
Legendario|Legendary|Légendaire
COMÚN|COMMON|COMMUN
RARO|RARE|RARE
LEGENDARIO|LEGENDARY|LÉGENDAIRE
MÍTICO|MYTHIC|MYTHIQUE
DIARIO|DAILY|QUOTIDIEN
SEMANAL|WEEKLY|HEBDOMADAIRE
Gratis|Free|Gratuit
Sin FS|Insufficient FS|FS insuffisants
No disponible|Unavailable|Indisponible
Cortar y revelar|Cut and reveal|Ouvrir et révéler
Sobre abierto|Pack opened|Paquet ouvert
Anterior|Previous|Précédent
Colección de oradores|Orator collection|Collection d'orateurs
Oradores|Orators|Orateurs
Acciones|Actions|Actions
Buscar|Search|Rechercher
Buscar por nombre|Search by name|Rechercher par nom
Todos|All|Tous
Todas|All|Toutes
Filtros activos|Active filters|Filtres actifs
Limpiar filtros|Clear filters|Effacer les filtres
Rareza|Rarity|Rareté
Doctrina|Doctrine|Doctrine
Líder|Leader|Chef
Líderes|Leaders|Chefs
Elegir líder|Choose leader|Choisir le chef
Seleccionar|Select|Sélectionner
Seleccionado|Selected|Sélectionné
Editar en Colección|Edit in Collection|Modifier dans Collection
Confirmar gabinete|Confirm cabinet|Confirmer l'équipe
Empezar debate|Start debate|Commencer le débat
Gabinete confirmado|Cabinet confirmed|Équipe confirmée
Partida normal|Normal match|Partie normale
Partida rápida|Quick match|Partie rapide
Clasificatoria|Ranked|Classée
Clasificatorias|Ranked|Classées
Debate|Debate|Débat
Pasar turno|End turn|Fin du tour
Abandonar|Resign|Abandonner
Restar votos|Remove votes|Retirer des voix
Ataque normal|Basic retort|Réplique simple
Ataque fuerte|Strong retort|Réplique puissante
Defensa|Defense|Défense
Curación|Healing|Soin
Aguante|Stamina|Endurance
Tiempo de Palabra|Speaking time|Temps de parole
Acta|Record|Compte rendu
Tu Tribuna|Your bench|Votre groupe
Rival|Opponent|Adversaire
Tu equipo|Your team|Votre équipe
El equipo rival|Opponent's team|Équipe adverse
Volver a desafíos|Back to challenges|Retour aux défis
Colección completa|Complete collection|Collection complète
Victorias parlamentarias|Parliamentary victories|Victoires parlementaires
Debates disputados|Debates played|Débats disputés
Victorias en Clasificatoria|Ranked victories|Victoires classées
Victorias en Liga|League victories|Victoires en ligue
Cromos diferentes|Different cards|Cartes différentes
Legendarios diferentes|Different legendary cards|Cartes légendaires différentes
Cromos vendidos|Cards sold|Cartes vendues
Cromos comprados|Cards bought|Cartes achetées
Intercambios completados|Completed trades|Échanges terminés
Vence con distintas doctrinas|Win with different doctrines|Gagnez avec différentes doctrines
Alcanza Elo|Reach Elo|Atteindre un Elo
Diarios|Daily|Quotidiens
Semanales|Weekly|Hebdomadaires
Mensuales|Monthly|Mensuels
Fácil|Easy|Facile
Normal|Normal|Normal
Difícil|Hard|Difficile
Rara|Rare|Rare
Recompensas anteriores|Previous rewards|Récompenses précédentes
Tipografía|Typeface|Police
Aspectos|Appearance|Apparence
Tapete|Playmat|Tapis
Reverso|Card back|Dos de carte
Moneda|Coin|Pièce
Menú de inicio|Home menu|Menu d'accueil
Del estilo|Theme default|Police du thème
Clara|Clear|Lisible
Clásica|Classic|Classique
Editorial|Editorial|Éditoriale
Orbital|Orbital|Orbitale
Gatitos|Kittens|Chatons
Jardín|Garden|Jardin
Holográfica|Holographic|Holographique
Hemiciclo clásico|Classic Hemicycle|Hémicycle classique
Senado realista|Realistic senate|Sénat réaliste
Papiro parlamentario|Parliamentary papyrus|Papyrus parlementaire
Libro de actas|Book of records|Registre des débats
Tribuna orbital|Orbital chamber|Tribune orbitale
Archivo holográfico|Holographic archive|Archives holographiques
Jardín del consenso|Garden of consensus|Jardin du consensus
Gatitos diplomáticos|Diplomatic kittens|Chatons diplomatiques
Clásico|Classic|Classique
Mármol azul|Blue marble|Marbre bleu
Senado imperial|Imperial senate|Sénat impérial
¡Nuevo aspecto en tu colección!|New appearance in your collection!|Nouvelle apparence dans votre collection !
Comprar|Buy|Acheter
Vender|Sell|Vendre
Intercambiar|Trade|Échanger
Ventas|Sales|Ventes
Compras|Purchases|Achats
Intercambios|Trades|Échanges
Actividad|Activity|Activité
Repetidos|Duplicates|Doubles
Cantidad|Quantity|Quantité
Precio|Price|Prix
Tu gabinete marca la diferencia|Your cabinet makes the difference|Votre équipe fait la différence
Cinco políticos. Una estrategia.|Five politicians. One strategy.|Cinq politiques. Une stratégie.
Consigue los 100 votos del debate.|Reach 100 votes in the debate.|Obtenez les 100 voix du débat.
Información legal|Legal information|Informations légales
Ayuda y soporte|Help and support|Aide et assistance
Privacidad y derechos|Privacy and rights|Confidentialité et droits
Volver al juego|Back to game|Retour au jeu
Aceptar y continuar|Accept and continue|Accepter et continuer
Elige una opción|Choose an option|Choisissez une option
Tu tramo de edad|Your age group|Votre tranche d'âge
Menos de 12 años|Under 12|Moins de 12 ans
18 años o más|18 or older|18 ans ou plus
Documentos legales|Legal documents|Documents juridiques
Condiciones de uso|Terms of use|Conditions d'utilisation
Política de privacidad|Privacy policy|Politique de confidentialité
España|Spain|Espagne
Francia|France|France
Estados Unidos|United States|États-Unis
Reino Unido|United Kingdom|Royaume-Uni
Alemania|Germany|Allemagne
Rusia|Russia|Russie
Italia|Italy|Italie
Turquía|Türkiye|Turquie
Hungría|Hungary|Hongrie
Canadá|Canada|Canada
Venezuela|Venezuela|Venezuela
México|Mexico|Mexique
Argentina|Argentina|Argentine`;
var dictionary=Object.create(null);(root.HemicycleLocaleData&&root.HemicycleLocaleData.rows||[]).forEach(function(p){dictionary[p[0]]={es:p[0],en:p[1],fr:p[2]};});rows.split('\n').forEach(function(row){var p=row.split('|');dictionary[p[0]]={es:p[0],en:p[1],fr:p[2]};});
var patterns=[
 [/^Nivel (\d+)$/,'Level $1','Niveau $1'],[/^(\d+) pendientes$/,'$1 pending','$1 en attente'],[/^Sobre (\d+) de (\d+)$/,'Pack $1 of $2','Paquet $1 sur $2'],[/^Siguiente sobre \((\d+)\/(\d+)\)$/,'Next pack ($1/$2)','Paquet suivant ($1/$2)'],[/^3 sobres comunes$/,'3 common packs','3 paquets communs'],[/^3 sobres raros$/,'3 rare packs','3 paquets rares'],[/^3 sobres legendarios$/,'3 legendary packs','3 paquets légendaires'],[/^3 sobres míticos$/,'3 mythic packs','3 paquets mythiques'],[/^Lidera con (.+)$/,'Lead with $1','Menez avec $1'],[/^Ronda (\d+)$/,'Round $1','Manche $1'],[/^(\d+) cartas?$/,'$1 cards','$1 cartes'],[/^(\d+) oradores · (\d+) acciones · gabinete de 8 \+ 4$/,'$1 orators · $2 actions · cabinet of 8 + 4','$1 orateurs · $2 actions · équipe de 8 + 4']
];
var fragments=null,protectedText=null,reverse=null,cache=new Map();
function protectedStrings(){if(!protectedText){protectedText=(root.HemicycleCatalog?root.HemicycleCatalog.cards.map(function(c){return c.n;}):[]).concat(root.HemicycleLocaleData&&root.HemicycleLocaleData.englishQuotes||[]).filter(Boolean).sort(function(a,b){return b.length-a.length;});}return protectedText;}
function canonical(text){if(dictionary[text]||protectedStrings().includes(text)||text.length<3||!/\p{L}/u.test(text))return text;if(!reverse){reverse=Object.create(null);Object.keys(dictionary).forEach(function(k){['en','fr'].forEach(function(l){var v=dictionary[k][l];if(v&&!reverse[v])reverse[v]=k;});});}return reverse[text]||text;}
function units(text){return text.replace(/\bTdP\b/g,locale==='en'?'STP':'PP').replace(/\bFS\b/g,locale==='en'?'SF':'FS').replace(/\bZ(?=\s*\d)/g,'R').replace(/\bA(?=\s*\d)/g,locale==='en'?'S':'E');}
function fragmentIndex(){if(!fragments){fragments=Object.create(null);Object.keys(dictionary).forEach(function(k){if((k.length<2&&!['y','o','a'].includes(k))||protectedStrings().includes(k))return;(fragments[k[0]]||(fragments[k[0]]=[])).push(k);});Object.keys(fragments).forEach(function(k){fragments[k].sort(function(a,b){return b.length-a.length;});});}return fragments;}
function word(c){return !!c&&/[\p{L}\p{N}_]/u.test(c);}
function compose(source){var list=fragmentIndex(),out='',i=0;while(i<source.length){var rest=source.slice(i),keep=protectedStrings().find(function(k){return rest.startsWith(k)&&(!word(source[i-1])||!word(k[0]))&&(!word(source[i+k.length])||!word(k[k.length-1]));});if(keep){out+=keep;i+=keep.length;continue;}var match=(list[source[i]]||[]).find(function(k){return rest.startsWith(k)&&(!word(source[i-1])||!word(k[0]))&&(!word(source[i+k.length])||!word(k[k.length-1]));});if(match){out+=dictionary[match][locale]||match;i+=match.length;}else out+=source[i++];}return out;}
function t(source){source=String(source);if(!/\p{L}/u.test(source))return source;source=canonical(source);if(locale==='es'||!source)return source;var key=locale+'\0'+source;if(cache.has(key))return cache.get(key);var output=source;if(protectedStrings().includes(source)){cache.set(key,source);return source;}var exact=dictionary[source];if(exact)output=exact[locale]||source;else{var matched=false;for(var i=0;i<patterns.length;i++){var p=patterns[i];if(p[0].test(source)){output=source.replace(p[0],p[locale==='en'?1:2]);matched=true;break;}}if(!matched)output=compose(source);}output=units(output);cache.set(key,output);return output;}
function quote(source){var text=String(source),english=root.HemicycleLocaleData&&root.HemicycleLocaleData.englishQuotes||[];if(locale==='es'||english.includes(text))return text;return t(text);}

var records=new WeakMap(),attrRecords=new WeakMap(),queued=false;
function translateNode(node){if(node.parentElement&&node.parentElement.closest('script,style,textarea,code,[data-no-translate],.senate-quote,.battle-spoken,[data-player-nick],[data-user-text]'))return;var old=records.get(node),raw=old&&node.data===old.output?old.source:node.data,trim=raw.trim(),output=trim?raw.replace(trim,locale!=='es'&&node.parentElement.closest('.card-stat')&&trim==='Z'?'R':locale!=='es'&&node.parentElement.closest('.card-stat')&&trim==='A'?(locale==='en'?'S':'E'):t(trim)):raw;if(node.data!==output)node.data=output;records.set(node,{source:raw,output:output});}
function brand(){document.querySelectorAll('.profile-brand').forEach(function(image){var next=image.nextElementSibling;if(!next||!next.classList.contains('profile-localized-brand')){next=document.createElement('span');next.className='localized-brand profile-localized-brand';next.setAttribute('data-no-translate','');image.after(next);}if(next.textContent!==t('Hemiciclo'))next.textContent=t('Hemiciclo');});document.querySelectorAll('.brand').forEach(function(el){if(!el.dataset.localizedBrand){el.dataset.localizedBrand='true';var span=document.createElement('span');span.className='localized-brand';span.setAttribute('data-no-translate','');el.appendChild(span);}if(el.querySelector('.localized-brand').textContent!==t('Hemiciclo'))el.querySelector('.localized-brand').textContent=t('Hemiciclo');});document.querySelectorAll('.brand>.localized-brand').forEach(function(span){if(span.dataset.wordmarkLocale!==locale||!span.querySelector('svg')){span.dataset.wordmarkLocale=locale;span.setAttribute('aria-label',t('Hemiciclo'));span.innerHTML=root.HemicycleLocalizedTitle.wordmark(locale);}});var launch=document.getElementById('launchTitle');if(launch){launch.setAttribute('aria-label',t('Hemiciclo'));if(!launch.querySelector('.localized-brand')){var s=document.createElement('span');s.className='localized-brand';s.setAttribute('data-no-translate','');launch.prepend(s);}if(launch.querySelector('.localized-brand').textContent!==t('Hemiciclo'))launch.querySelector('.localized-brand').textContent=t('Hemiciclo');}document.querySelectorAll('.senate-title').forEach(function(el){el.setAttribute('aria-label',t('Toma la palabra'));if(!el.querySelector('.localized-cta')){var s=document.createElement('span');s.className='localized-cta';s.setAttribute('data-no-translate','');el.appendChild(s);}var art=el.querySelector('.localized-cta');if(art.dataset.locale!==locale){art.dataset.locale=locale;art.innerHTML=locale==='es'?'':root.HemicycleLocalizedTitle.html(locale);}});}
function legalCopies(){document.querySelectorAll('.legal-document-body').forEach(function(body){var note=body.previousElementSibling;if(!note||!note.classList.contains('legal-language-note')){note=document.createElement('div');note.className='legal-language-note';note.setAttribute('data-no-translate','');var text=document.createElement('p'),button=document.createElement('button');button.type='button';button.className='btn sm';button.setAttribute('data-legal-original','');note.append(text,button);body.before(note);}note.hidden=locale==='es';var original=body.dataset.showOriginal==='true',message=locale==='fr'?'Traduction informative. Le texte original espagnol reste disponible.':'Informative translation. The original Spanish text remains available.',label=locale==='fr'?(original?'Afficher la traduction':'Afficher l’original espagnol'):(original?'Show translation':'Show Spanish original');if(note.firstChild.textContent!==message)note.firstChild.textContent=message;if(note.lastChild.textContent!==label)note.lastChild.textContent=label;});}
function apply(){queued=false;if(typeof document==='undefined')return;document.documentElement.lang=locale;var manifest=document.querySelector('link[rel=manifest]'),manifestURL='manifest'+(locale==='es'?'':'.'+locale)+'.json?v=32.0.0';if(manifest&&manifest.getAttribute('href')!==manifestURL)manifest.setAttribute('href',manifestURL);document.documentElement.dataset.locale=locale;legalCopies();var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),node;while(node=walker.nextNode())translateNode(node);document.querySelectorAll('[title],[aria-label],[placeholder],[alt]').forEach(function(el){var saved=attrRecords.get(el)||{};['title','aria-label','placeholder','alt'].forEach(function(k){if(!el.hasAttribute(k))return;var value=el.getAttribute(k),old=saved[k],source=old&&old.output===value?old.source:value,output=t(source);if(value!==output)el.setAttribute(k,output);saved[k]={source:source,output:output};});attrRecords.set(el,saved);});brand();document.querySelectorAll('[data-game-locale]').forEach(function(el){el.value=locale;});document.title=t('Hemiciclo')+({es:': Cara a Cara',en:': Face to Face',fr:' : Face à face'})[locale];}
function queue(){if(!queued){queued=true;requestAnimationFrame(apply);}}
function select(value){if(!['es','en','fr'].includes(value))throw Error('Idioma no válido.');locale=value;try{localStorage.setItem(KEY,value);}catch(ignore){}apply();document.dispatchEvent(new CustomEvent('hemicycle:locale',{detail:value}));}
function register(entries){fragments=null;reverse=null;cache.clear();entries.forEach(function(p){dictionary[p[0]]={es:p[0],en:p[1],fr:p[2]};});queue();}
function control(){return '<fieldset class="locale-options"><legend>'+t('Idioma')+'</legend><label for="gameLocale">'+t('Idioma')+'</label><select id="gameLocale" data-game-locale aria-label="'+t('Idioma')+'"><option value="es"'+(locale==='es'?' selected':'')+'>Español</option><option value="en"'+(locale==='en'?' selected':'')+'>English</option><option value="fr"'+(locale==='fr'?' selected':'')+'>Français</option></select></fieldset>';}
root.HemicycleI18n={t:t,quote:quote,select:select,apply:apply,control:control,register:register,get locale(){return locale;},get tag(){return {es:'es-ES',en:'en-GB',fr:'fr-FR'}[locale];},dictionary:dictionary};
function start(){new MutationObserver(function(mutations){if(mutations.some(function(m){return m.type==='childList'||m.type==='characterData'&&(!records.has(m.target)||records.get(m.target).output!==m.target.data);}))queue();}).observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('click',function(e){var button=e.target.closest('[data-legal-original]');if(!button)return;var body=button.parentElement.nextElementSibling;if(!body||!body.classList.contains('legal-document-body'))return;var show=body.dataset.showOriginal!=='true';body.dataset.showOriginal=String(show);if(show){body.setAttribute('data-no-translate','');var walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),node;while(node=walker.nextNode()){var record=records.get(node);if(record){node.data=record.source;records.set(node,{source:record.source,output:record.source});}}}else body.removeAttribute('data-no-translate');apply();});document.addEventListener('change',function(e){if(e.target.matches('[data-game-locale]'))select(e.target.value);});document.addEventListener('storage',function(e){if(e.key===KEY&&['es','en','fr'].includes(e.newValue)){locale=e.newValue;apply();}});apply();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(window);
