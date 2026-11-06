/* Copia de tienda y acciones, separada de citas personales y documentos fuente. */
(function(root){'use strict';var I=root.HemicycleI18n,A=root.HemicycleActions;if(!I||!A)return;
var rows=`Tu buzón tiene 10.000 FS y 3 sobres generales de cada tipo: común, raro, legendario y mítico.|Your inbox has 10,000 FS and 3 general packs of each type: common, rare, legendary and mythic.|Votre messagerie contient 10 000 FS et 3 paquets généraux de chaque type : commun, rare, légendaire et mythique.
Oradores del país seleccionado y acciones de cualquier país. Precio doble que el sobre general.|Orators from the selected country and actions from any country. Twice the general pack price.|Orateurs du pays choisi et actions de tous les pays. Prix double du paquet général.
Las portadas cambian cada lunes y no garantizan un cromo concreto. Los sobres generales incluyen todos los países. Un 40 % incluye una acción de la misma rareza en lugar de un orador; en el mítico, un 25 %.|Covers change every Monday and do not guarantee a specific card. General packs include all countries. 40% replace one orator with an action of the same rarity; for mythic packs, 25%.|Les couvertures changent chaque lundi et ne garantissent pas une carte précise. Les paquets généraux incluent tous les pays. 40 % remplacent un orateur par une action de même rareté ; pour les paquets mythiques, 25 %.
Probabilidad de obtener al menos una copia en un sobre de cinco cromos. Un mismo orador puede repetirse. Las acciones no tienen país.|Chance of getting at least one copy in a five-card pack. An orator may appear more than once. Actions have no country.|Probabilité d'obtenir au moins un exemplaire dans un paquet de cinq cartes. Un orateur peut apparaître plusieurs fois. Les actions n'ont pas de pays.
Este país no tiene oradores de todas las rarezas de este sobre. El sobre no se puede comprar.|This country does not have orators of every rarity required by this pack. This pack is unavailable.|Ce pays n'a pas d'orateurs de toutes les raretés requises. Ce paquet n'est pas disponible.
Sin oradores de alguna rareza de este sobre.|Missing orators of a required rarity.|Une rareté requise ne possède pas d'orateur.
Cromo|Card|Carte
Tipo|Type|Type
Por sobre|Per pack|Par paquet
Acción|Action|Action
Gratuitos|Free packs|Paquets gratuits
Diario|Daily|Quotidien
Semanal|Weekly|Hebdomadaire
Abrir|Open|Ouvrir
4 comunes + 20% raro.|4 common + 20% chance of a rare.|4 communes + 20 % de chance d'une rare.
4 raros + 25% especial.|4 rare + 25% chance of a special.|4 rares + 25 % de chance d'une spéciale.
1 legendario + 1 especial + 3 raros.|1 legendary + 1 special + 3 rare.|1 légendaire + 1 spéciale + 3 rares.
5 legendarios.|5 legendary cards.|5 cartes légendaires.
Elige la letra independientemente del menú. Se conserva en tu perfil.|Choose a typeface independently of the menu. It is saved in your profile.|Choisissez une police indépendamment du menu. Elle est enregistrée dans votre profil.
Las frases de combate y las lecturas extensas conservan su letra. Iniciar mantiene su estilo original.|Battle quotes and long texts keep their own lettering. Start keeps its original style.|Les citations de combat et les textes longs conservent leur police. Commencer garde son style d'origine.
Tipografía guardada en tu perfil.|Typeface saved in your profile.|Police enregistrée dans votre profil.
Preparando tipografía…|Preparing typeface…|Préparation de la police…
Ajusta texto y botones; conserva el tamaño de los cromos. Las etiquetas inferiores se reducen al ampliar el texto.|Adjust text and buttons while keeping card sizes. Bottom labels shrink when text is enlarged.|Ajustez le texte et les boutons en conservant la taille des cartes. Les libellés inférieurs diminuent lorsque le texte est agrandi.
Aviso de riesgo activado|Risk notice enabled|Avertissement de risque activé
Reactivar aviso de riesgo|Enable risk notice again|Réactiver l'avertissement de risque
Efectos de sonido|Sound effects|Effets sonores
Silenciar|Mute|Couper le son
Volumen general|Master volume|Volume général
Menú principal|Main menu|Menu principal
Mostrar Buzón e Historial|Show inbox and history|Afficher la messagerie et l'historique
Ocultar botones adicionales|Hide additional buttons|Masquer les boutons supplémentaires
PRELANZAMIENTO · CARA A CARA|PRELAUNCH · FACE TO FACE|PRÉLANCEMENT · FACE À FACE
Elige tu estilo|Choose your style|Choisissez votre style
Secciones|Sections|Sections
Recompensas sin reclamar|Unclaimed rewards|Récompenses à récupérer
Registrar hito|Record milestone|Valider le palier
Calendario de Madrid · reinicio diario, lunes y primer día del mes. Las recompensas ganadas se conservan.|Madrid calendar · resets daily, on Mondays and on the first of each month. Earned rewards are kept.|Calendrier de Madrid · réinitialisation quotidienne, le lundi et le premier du mois. Les récompenses acquises sont conservées.
Juega debates|Play debates|Jouez des débats
Gana debates|Win debates|Gagnez des débats
Consigue votos|Earn votes|Obtenez des voix
Gana en Normal|Win normal matches|Gagnez des parties normales
Gana en Clasificatoria|Win ranked matches|Gagnez des parties classées
Gana partidas rápidas|Win quick matches|Gagnez des parties rapides
Gana en Liga|Win league matches|Gagnez des parties de ligue
Gana con 100 votos|Win with 100 votes|Gagnez avec 100 voix
Gana por menos de 25 votos|Win by fewer than 25 votes|Gagnez avec moins de 25 voix d'écart
Gana por 50 votos de diferencia|Win by 50 votes|Gagnez avec 50 voix d'écart
Gana con doctrinas distintas|Win with different doctrines|Gagnez avec différentes doctrines
Gana con líderes distintos|Win with different leaders|Gagnez avec différents chefs
Participa en más debates|Play more debates|Participez à plus de débats
Acumula votos parlamentarios|Accumulate parliamentary votes|Accumulez des voix parlementaires
Encadena tu progreso de victorias|Build your victory progress|Faites progresser vos victoires
Afianza tu Clasificatoria|Build your ranked progress|Progressez en classement
Copias totales|Total copies|Nombre total d'exemplaires
Cromos distintos|Different cards|Cartes différentes
Partidas|Matches|Parties
Victorias|Wins|Victoires
Derrotas|Losses|Défaites
Rango|Rank|Rang
Sobres pendientes|Pending packs|Paquets en attente
Un debate por ganar.|A debate to win.|Un débat à gagner.
Turno de palabra|Speaking turn|Tour de parole
Réplica|Retort|Réplique
Receso|Recess|Pause
Disciplina de grupo|Group discipline|Discipline de groupe
Pregunta incómoda|Awkward question|Question gênante
Pausa parlamentaria|Parliamentary recess|Pause parlementaire
Escudo parlamentario|Parliamentary shield|Bouclier parlementaire
Interpelación|Interpellation|Interpellation
Debate abierto|Open debate|Débat ouvert
Moción de censura|Motion of no confidence|Motion de censure
Mayoría reforzada|Reinforced majority|Majorité renforcée
Acuerdo de Estado|National agreement|Accord national`;
I.register(rows.split('\n').map(function(s){return s.split('|');}));
var names=[
[['Tangled question','Crossed arguments','Confusing debate','Parliamentary labyrinth'],['Question embrouillée','Arguments croisés','Débat confus','Labyrinthe parlementaire']],
[['Reasonable doubt','Weakened argument','Uncertain bench','Weary discourse'],['Doute raisonnable','Argument affaibli','Groupe incertain','Discours usé']],
[['Conviction','Steady voice','Group spirit','Parliamentary resolve'],['Conviction','Voix assurée','Élan collectif','Force parlementaire']],
[['Restorative pause','Fulfillment','Serene bench','Full wellbeing'],['Pause réparatrice','Plénitude','Groupe serein','Bien-être collectif']],
[['Water at the podium','Scheduled rest','Restorative relief','Collective recovery'],["Eau à la tribune",'Repos programmé','Relève réparatrice','Récupération collective']],
[['Constant pressure','Persistent retort','Endless sitting','Question marathon'],['Pression constante','Réplique persistante','Séance interminable','Marathon de questions']],
[['Steady lectern','Resilience','Shields of consensus','Institutional resilience'],['Pupitre solide','Résistance','Boucliers du consensus','Solidité institutionnelle']],
[['Open flank','Incisive spotlight','Exposed bench','Full scrutiny'],['Flanc ouvert','Projecteur incisif','Groupe exposé','Examen approfondi']],
[['Words of encouragement','Composure','Shared listening','Comforting agreement'],["Mots d'encouragement",'Apaisement','Écoute partagée','Accord réconfortant']],
[['Exhausting sitting','Without rest','Bench fatigue','General exhaustion'],['Séance épuisante','Sans repos','Fatigue collective','Épuisement général']],
[['Accurate fact','Rhetorical accuracy','Shared report','Collective precision'],['Donnée précise','Justesse rhétorique','Rapport partagé','Précision collective']],
[['Apathy','Discouragement','Silent benches','Demobilization'],['Apathie','Découragement','Silence sur les bancs','Démobilisation']],
[['Sharp aside','Direct argument','Round of retorts','Chamber retort'],['Remarque piquante','Argument direct','Tour de répliques',"Réplique de l'hémicycle"]],
[['Glass of water','Timely breather','Bench recess','Restorative agreement'],["Verre d'eau",'Répit opportun','Pause du groupe','Accord réparateur']],
[['Timely note','Argumentative momentum','Shared script','Choral speech'],['Note opportune','Élan argumentatif','Trame partagée','Discours choral']],
[['Protective folder','Prudent turn','Bench protection','Parliamentary cordon'],['Dossier protecteur','Tour prudent','Protection collective','Cordon parlementaire']],
[['Clarification','Point of order','Enlightening consensus','Bench renewal'],['Clarification',"Rappel au règlement",'Consensus éclairant','Renouveau du groupe']],
[['Fact checking','Critical review','Bench oversight','Full oversight'],['Vérification des faits','Examen critique','Contrôle du groupe','Contrôle complet']],
[['Close support','Restorative dialogue','Recovery pact','Consensus renewal'],['Soutien rapproché','Dialogue réparateur','Pacte de récupération','Renouveau du consensus']],
[['Decisive nuance','Counter-retort','Collective questioning','Scrutiny motion'],['Nuance décisive','Contre-réplique','Interrogatoire collectif',"Motion d'examen"]]
];
var statusNames={confused:['Confused','Confus'],weakness:['Weakness','Faiblesse'],strength:['Strength','Force'],fullness:['Fulfillment','Plénitude'],regeneration:['Regeneration','Régénération'],attrition:['Attrition','Usure'],fortress:['Resilience','Résistance'],exposed:['Exposed','Exposé'],relief:['Composure','Apaisement'],wound:['Exhaustion','Épuisement'],precision:['Precision','Précision'],fatigue:['Discouragement','Découragement']};
var effects={confused:['Cannot target an empty bench with retorts.','Ne peut pas viser un banc vide avec ses répliques.'],weakness:['Reduces retort power, to a minimum of 1.','Réduit la puissance des répliques, au minimum 1.'],strength:['Increases retort power.','Augmente la puissance des répliques.'],fullness:['Reduces incoming damage by 1 and improves healing.','Réduit de 1 les dégâts reçus et améliore les soins.'],regeneration:['Restores stamina at the start of upcoming turns.','Restaure de l’endurance au début des prochains tours.'],attrition:['Loses stamina at the start of upcoming turns; may be expelled.','Perd de l’endurance au début des prochains tours ; peut être expulsé.'],fortress:['Reduces incoming damage, to a minimum of 0.','Réduit les dégâts reçus, au minimum 0.'],exposed:['Increases incoming damage.','Augmente les dégâts reçus.'],relief:['Improves the stamina restored by healing.','Améliore l’endurance restaurée par les soins.'],wound:['Reduces healing, to a minimum of 0.','Réduit les soins, au minimum 0.'],precision:['Retorts pierce the 50% defense.','Les répliques traversent la défense de 50 %.'],fatigue:['Reduces the orator’s passive votes, to a minimum of 0.','Réduit les voix passives de l’orateur, au minimum 0.']};
var entries=[];A.cards.forEach(function(c){if(c.artFamily===undefined)return;var n=names[c.artFamily];entries.push([c.n,n[0][c.artVariant],n[1][c.artVariant]]);var translated=[0,1].map(function(lang){var all=c.target.startsWith('all'),rival=c.target.includes('rival'),who=lang===0?(all?(rival?'all opposing orators':'all your orators'):(rival?'an opposing orator':'one of your orators')):(all?(rival?'tous les orateurs adverses':'tous vos orateurs'):(rival?'un orateur adverse':'un de vos orateurs'));
 if(c.effect==='status')return lang===0?'Applies '+statusNames[c.status][0]+' (power '+c.value+') to '+who+' through the end of their next '+c.duration+' own turns. '+effects[c.status][0]:'Applique '+statusNames[c.status][1]+' (puissance '+c.value+') à '+who+' jusqu’à la fin de ses '+c.duration+' prochains tours. '+effects[c.status][1];
 if(c.effect==='damage')return lang===0?'Deals '+c.value+' damage to '+who+'.':'Inflige '+c.value+' dégâts à '+who+'.';
 if(c.effect==='heal')return lang===0?'Restores '+c.value+' stamina to '+who+'.':'Restaure '+c.value+' endurance à '+who+'.';
 if(c.effect==='boost')return lang===0?'Adds '+c.value+' retort power to '+who+' during their active turn.':'Ajoute '+c.value+' de puissance à '+who+' pendant son tour actif.';
 if(c.effect==='guard')return lang===0?'Prepares 50% defense for '+who+' until their next own turn.':'Prépare une défense de 50 % pour '+who+' jusqu’au prochain tour propre.';
 if(c.effect==='cleanse')return lang===0?'Removes negative action states from '+who+'.':'Retire les états négatifs d’actions de '+who+'.';
 if(c.effect==='purge')return lang===0?'Removes positive action states and defense from '+who+'.':'Retire les états positifs d’actions et la défense de '+who+'.';
 if(c.effect==='cleanse-heal')return lang===0?'Removes negative action states and restores '+c.value+' stamina to '+who+'.':'Retire les états négatifs d’actions et restaure '+c.value+' endurance à '+who+'.';
 return lang===0?'Removes positive action states and defense, then deals '+c.value+' damage to '+who+'.':'Retire les états positifs d’actions et la défense, puis inflige '+c.value+' dégâts à '+who+'.';
 });entries.push([c.text,translated[0],translated[1]]);
});I.register(entries);
})(window);
