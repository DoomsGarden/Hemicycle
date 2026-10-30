/* Catálogo único: datos, IDs y validación compartidos por app y servidor. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HemicycleCatalog=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function slug(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
var DOCS=[
 {k:'verborrea',n:'Verborrea',d:'+1 TdP al entrar el Líder y por turno. Las expulsiones reservan +2 TdP para el próximo turno activo. Máximo: 8 TdP.',beats:'guardia',col:'#3b6fd4'},
 {k:'guardia',n:'Vieja Guardia',d:'Tus oradores ganan +1 Zasca al terminar tu turno (máx. +3 mientras esté activa).',beats:'aforado',col:'#8b5cf6'},
 {k:'aforado',n:'Aforado',d:'Cada orador puede evitar una expulsión por debate y quedarse con 3 de Aguante.',beats:'viperina',col:'#28a86b'},
 {k:'giro',n:'Giro de Guion',d:'Quien ataca a un orador tuyo recibe 1 de daño.',beats:'verborrea',col:'#d4a03b'},
 {k:'foco',n:'Foco Mediático',d:'Tu Líder regenera 1 de Aguante por turno y sus ataques suman +1 voto.',beats:'giro',col:'#d43b3b'},
 {k:'viperina',n:'Lengua Viperina',d:'Tus oradores infligen +2 de daño al Líder rival.',beats:'foco',col:'#c026d3'}
];
var DOCM={};DOCS.forEach(function(d){DOCM[d.k]=d;});
DOCS.forEach(function(d){DOCM[d.beats].weak=d.k;});
var MAX_TDP=8;
function doctrineMatchup(k){var d=DOCM[k];return 'Contrarresta: '+DOCM[d.beats].n+'. Debilidad: '+DOCM[d.weak].n+'.';}
var RARS=[{k:'comun',n:'Común',c:'#b07a45',g:3},{k:'raro',n:'Raro',c:'#4a7fb5',g:4},{k:'especial',n:'Especial',c:'#8b5cf6',g:5},{k:'legendario',n:'Legendario',c:'#e8b923',g:6}];
var RARM={};RARS.forEach(function(r){RARM[r.k]=r;});
var BALANCE_VERSION='balance-v3';
var TIER={
 comun:{c:[1,2],costs:[1,2,2,1,2,2,1,2],a:[2,2],h:[4,5],v:2,stats:{1:{a:2,h:4},2:{a:2,h:5}}},
 raro:{c:[2,3],costs:[2,3,3,2,3,3],a:[4,4],h:[6,7],v:3,stats:{2:{a:4,h:6},3:{a:4,h:7}}},
 especial:{c:[3,5],costs:[3,4,4,3],a:[5,6],h:[8,8],v:4,stats:{3:{a:5,h:8},4:{a:6,h:8},5:{a:6,h:8}}},
 legendario:{c:[4,5],a:[7,7],h:[11,14],v:5,stats:{4:{a:7,h:11},5:{a:7,h:14}}}
};
function statsFor(rarity,cost){var tier=TIER[rarity],stats=tier&&tier.stats[cost];if(!stats)throw Error('Coste no definido para esta rareza: '+rarity+'/'+cost);return {a:stats.a,h:stats.h,v:tier.v};}
var TIERORDER={legendario:0,especial:1,raro:2,comun:3};

var ROSTER={
 verborrea:{legendario:['Donald Trump','Boris Johnson'],especial:['Pablo Iglesias','Nigel Farage','Javier Milei','Gabriel Rufián'],raro:['José Luis Rodríguez Zapatero','Pablo Echenique','Íñigo Errejón','Alberto Garzón','Irene Montero','Mónica García'],comun:['Toni Cantó','Antonio Maíllo','Rafael Hernando','Pablo Cambronero','Marta Lois','Nacho Álvarez','Isabel García Tejerina','Jaime de Olano']},
 guardia:{legendario:['Alberto Núñez Feijóo','Angela Merkel'],especial:['José María Aznar','Felipe González','Bernie Sanders','Joe Biden'],raro:['Esperanza Aguirre','Soraya Sáenz de Santamaría','Ana Botella','Cristina Cifuentes','José Manuel García-Margallo','Julio Anguita'],comun:['Celia Villalobos','Alfonso Alonso','Javier Maroto','Juan Vicente Herrera','Carlos Floriano','Miguel Arias Cañete','Dolors Montserrat','Teodoro García Egea']},
 aforado:{legendario:['Mariano Rajoy','Vladímir Putin'],especial:['Santiago Abascal','Giorgia Meloni','Recep Tayyip Erdoğan','Viktor Orbán'],raro:['Pablo Casado','Albert Rivera','Dolores de Cospedal','Jorge Fernández Díaz','Luis de Guindos','Cristóbal Montoro'],comun:['Fátima Báñez','Íñigo Méndez de Vigo','Rafael Catalá','Álvaro Nadal','José Luis Ábalos','Carmen Calvo','Meritxell Batet','Fernando Grande-Marlaska']},
 giro:{legendario:['Carles Puigdemont','Emmanuel Macron'],especial:['Marine Le Pen','Matteo Salvini','Justin Trudeau','Salvador Illa'],raro:['Oriol Junqueras','Jordi Turull','Miriam Nogueras','Laura Borràs','Anna Gabriel','Marta Rovira'],comun:['Quim Torra','Pere Aragonès','Jordi Sànchez','Roger Torrent','Josep Rull','Carme Forcadell','Raül Romeva','Toni Comín']},
 foco:{legendario:['Pedro Sánchez','Isabel Díaz Ayuso'],especial:['Ada Colau','Nicolás Maduro','Andrés Manuel López Obrador','Cristina Fernández de Kirchner'],raro:['Inés Arrimadas','Rocío Monasterio','Cayetana Álvarez de Toledo','Edmundo Bal','Begoña Villacís','Sara Giménez'],comun:['Ana Pastor','Pablo Montesinos','Marta Rivera de la Cruz','Andrea Levy','Cuca Gamarra','Borja Sémper','Esteban González Pons','Elías Bendodo']},
 viperina:{legendario:['Barack Obama','Yolanda Díaz'],especial:['Hillary Clinton','Kamala Harris','Christine Lagarde','Ursula von der Leyen'],raro:['Miquel Iceta','Adriana Lastra','Pilar Alegría','Isabel Cela','María Jesús Montero','Nadia Calviño'],comun:['Óscar Puente','Patxi López','Susana Díaz','Emiliano García-Page','Juan Espadas','Pilar Llop','Reyes Maroto','Raquel Sánchez']}
};
var QBESP={
 "alberto-nunez-feijoo":["El gratis total no hace ningún bien", "No acepto pagar el precio", "Tengo principios, límites y palabra"],
 "angela-merkel":["La tolerancia no significa «todo vale»", "Lo lograremos", "Seguridad, bienestar y paz"],
 "barack-obama":["Let me be clear", "Yes, we can", "We rise or fall together"],
 "boris-johnson":["Get Brexit done", "We are going to rise", "Let's get breakfast done"],
 "carles-puigdemont":["No se ha acabado", "La libertad individual", "Volver a un lugar seguro"],
 "donald-trump":["Fake news!", "You're fired!", "Never, ever give up"],
 "emmanuel-macron":["Al mismo tiempo", "Debemos retomar el control", "Hay que poder resistir"],
 "isabel-diaz-ayuso":["¡Libertad!", "Comunismo o libertad", "Madrid es España"],
 "mariano-rajoy":["Es la realidad", "Fin de la cita", "No tomar ninguna decisión"],
 "pedro-sanchez":["Pese a todas las dificultades", "Como un cohete", "Mejorar la vida de la gente"],
 "vladimir-putin":["Nadie puede cambiar estas cosas", "No tenemos miedo de nada", "Podemos sentirnos seguros"],
 "yolanda-diaz":["Ahora toca gobernar", "No es suficiente", "Una pieza de estabilidad"],
 "ada-colau":["Mucha emoción contenida", "Una victoria de la ciudadanía", "Una segunda oportunidad"],
 "andres-manuel-lopez-obrador":["Ya chole", "Me canso ganso", "Solo el pueblo puede salvar al pueblo"],
 "bernie-sanders":["I am once again asking", "Enough is enough!", "Healthcare is a right"],
 "christine-lagarde":["Tengo mi propio estilo", "Tomaremos todas las medidas necesarias", "Hemos conseguido mantenernos estables"],
 "cristina-fernandez-de-kirchner":["No fue magia", "Soy una exitosa presidente", "Nos vamos a curar"],
 "felipe-gonzalez":["Inventar el futuro", "Galopa hacia la anarquía", "Superar este peligro"],
 "gabriel-rufian":["Competir de tú a tú", "Estoy harto de tener la razón", "Sin renunciar a lo que soy"],
 "giorgia-meloni":["Soy Giorgia", "Estamos preparados", "Defenderemos nuestra identidad"],
 "hillary-clinton":["Deal me in", "We are stronger together", "Women's rights are human rights"],
 "javier-milei":["¡Afuera!", "¡Viva la libertad!", "No hay plata"],
 "joe-biden":["Look, folks", "No malarkey", "Time to heal"],
 "jose-maria-aznar":["El que pueda hablar, que hable", "Váyase, señor presidente", "Tomar posesión de un escaño"],
 "justin-trudeau":["Because it's 2015", "The budget will balance itself", "Diversity is our strength"],
 "kamala-harris":["I'll repeat the question", "We are not going back", "I know we can fix it"],
 "marine-le-pen":["¿Dónde estoy?", "No debemos callarnos", "La defensa de Francia"],
 "matteo-salvini":["Cambiar las cosas desde dentro", "Estamos creciendo", "Nos estamos aliando"],
 "nicolas-maduro":["No se tarde en llegar", "Venga por mí", "Aquí lo espero"],
 "nigel-farage":["Who are you?", "That's not good enough", "I'm not for sale"],
 "pablo-iglesias":["Cuando no se roba, se gobierna mejor", "Por asalto", "Defender la democracia con la ley"],
 "recep-tayyip-erdogan":["One minute", "El mundo es más grande que cinco", "Todos somos seres humanos"],
 "salvador-illa":["Humildad", "Un triunfo de todos", "Las vacunas salvan vidas"],
 "santiago-abascal":["Yo soy español", "¡Viva España!", "Ni monárquico ni republicano"],
 "ursula-von-der-leyen":["This is a watershed moment", "We must fight back", "Freedom is priceless"],
 "viktor-orban":["Debemos afrontar este hecho", "Firmes en nuestra determinación", "Sanar nuestras heridas"],
 "adriana-lastra":["Como siempre, los mejores", "Siempre con ánimo de victoria", "No tira la toalla"],
 "albert-rivera":["Debe ser un mérito", "Matar moscas a cañonazos", "Venimos a ayudar"],
 "alberto-garzon":["La verdad es la verdad", "Hay que formatear", "Moderar el impacto"],
 "ana-botella":["Mala suerte", "Mayor progreso a la humanidad", "Relaxing cup of café con leche"],
 "anna-gabriel":["La clase trabajadora", "Frenaremos a la derecha", "Permanecen donde estaban"],
 "begona-villacis":["Somos gente", "Nada ni nadie va a cohibirnos", "Cumplamos con el compromiso adquirido"],
 "cayetana-alvarez-de-toledo":["Un poco extraño, ¿no?", "No te lo perdonaré jamás", "El último dique de contención"],
 "cristina-cifuentes":["Voy a seguir trabajando", "No me voy, me quedo", "Sin bajar la guardia"],
 "cristobal-montoro":["Las reformas estructurales", "España se levanta sola", "El país no necesita un rescate"],
 "dolores-de-cospedal":["¿Pero esto qué es?", "Que se presenten a las elecciones", "En diferido"],
 "edmundo-bal":["Soy Bal, Edmundo Bal", "No soporto la mentira", "Soy un servidor público"],
 "esperanza-aguirre":["Yo también estoy harta", "Deben dejar sus cargos", "Tenemos que luchar para ello"],
 "ines-arrimadas":["Dar un paso al frente", "Ha llegado la hora", "Unidos y adelante"],
 "inigo-errejon":["Uno a diez en lo estratégico", "Diez a uno en lo táctico", "Construir normalidad"],
 "irene-montero":["El poder se ejerce", "Más rápido y de forma más contundente", "Poner la vida en el centro"],
 "isabel-cela":["Una ley de todos", "Cargada de futuro", "Una gran avenida de oportunidades"],
 "jordi-turull":["No tenía la pretensión", "Mantenemos los compromisos", "Seguirá estando intacto"],
 "jorge-fernandez-diaz":["Nada es mera coincidencia", "Míreme a los ojos: ¡no!", "Siempre ayuda"],
 "jose-luis-rodriguez-zapatero":["A cada descalificación, una idea", "Estamos en la Champions League", "A cada exageración una sonrisa"],
 "jose-manuel-garcia-margallo":["No tengo la menor duda", "Estamos en un mundo nuevo", "Regeneración de las instituciones"],
 "julio-anguita":["Siempre he dicho lo que pensaba", "Nunca me he arredrado", "Libertad de pensamiento"],
 "laura-borras":["Servir al país y a la cultura", "Nada volverá a ser como antes", "Siempre al lado"],
 "luis-de-guindos":["Maximizar los beneficios", "Minimizar los costes", "Te vale para el resto de la vida"],
 "maria-jesus-montero":["Qué vergüenza", "Se enfrentan a gigantes", "Aquí estamos contigo"],
 "marta-rovira":["Confrontar ideas", "Aire fresco", "Energía renovada"],
 "miquel-iceta":["Queda por hacer", "Intenta formar una mayoría de cambio", "¡Aguanta, resiste a las presiones!"],
 "miriam-nogueras":["Y yo pago 49 euros", "El pueblo eres tú, ¿verdad?", "De aquí no marchará nadie"],
 "monica-garcia":["Un cambio en el modelo", "Estamos hablando con un muro", "Aportar soluciones"],
 "nadia-calvino":["Necesitamos una respuesta unida", "No es aceptable", "Triple red de seguridad"],
 "oriol-junqueras":["Una palanca de cambio", "Las cosas que no nos dejan aplicar", "Todo el aprecio y cariño"],
 "pablo-casado":["Una cortina de humo", "Hasta aquí hemos llegado", "Nosotros unimos"],
 "pablo-echenique":["Cascao y neoliberal", "La defunción del bipartidismo", "Por eso, la recurriré"],
 "pilar-alegria":["Una sociedad moderna", "Una apuesta fuerte y directa", "Tenemos que apoyar fuertemente"],
 "rocio-monasterio":["Un acto de servicio", "No quiero que nadie se meta en mi casa", "Esa es la verdadera libertad"],
 "sara-gimenez":["Prejuicios y estereotipos", "¡Ya está bien!", "Somos muchos"],
 "soraya-saenz-de-santamaria":["La razón como argumento", "El morbo frente a la verdad", "Nuestras instituciones"],
 "alfonso-alonso":["Hoy es la última rueda de prensa", "Una decisión firme, irrevocable", "Estar unidos"],
 "alvaro-nadal":["La divergencia de ideas y opiniones", "Contamos nuestros gobiernos por recuperaciones", "Respetar el medio ambiente"],
 "ana-pastor":["Realmente no sé si lo conseguí", "Seguir avanzando como nación", "La unidad de principios y valores"],
 "andrea-levy":["Todos tenemos una fecha de caducidad", "El tiempo nos dio la razón", "No se doblegó"],
 "antonio-maillo":["Un pack, un tándem", "Queremos gobernar y cambiar Andalucía", "Un equipo que suma"],
 "borja-semper":["No le daría otra interpretación", "Estoy convencido", "Sin mala intención"],
 "carlos-floriano":["Ya estamos preparados para gobernar", "Nos ponemos en la senda de ganar", "Un partido más sólido"],
 "carme-forcadell":["Yo no estoy inhabilitada", "Nos dará la razón", "Lo avalará"],
 "carmen-calvo":["El dinero público no es de nadie", "No renuncio", "Soy una tía a la que no doblan"],
 "celia-villalobos":["¡Que pierdo el tren!", "Usted a mí no me da lecciones", "No eche huesos de vaca"],
 "cuca-gamarra":["Hay que estar para servir", "Nos están vendiendo una moto", "Bajaremos el IRPF"],
 "dolors-montserrat":["No puede mirar hacia otro lado", "La independencia judicial no es elegible", "Los jueces deben estar protegidos"],
 "elias-bendodo":["Un clásico", "Se les ha caído entero", "Las pensiones están garantizadas"],
 "emiliano-garcia-page":["Las elecciones son como los melones", "Salir a dar la batalla electoral", "Recuperar entre todos"],
 "esteban-gonzalez-pons":["Con las puertas abiertas", "Trabajamos unidos", "Si soñamos juntos"],
 "fatima-banez":["Los malos también aprenden", "Hacen ataques más sofisticados", "Prepararnos mejor para el futuro"],
 "fernando-grande-marlaska":["Son gajes del oficio", "Impedir la llegada", "La garantía de la seguridad ciudadana"],
 "inigo-mendez-de-vigo":["Si existe la voluntad política", "Dar un salto de calidad", "Un pacto necesario"],
 "isabel-garcia-tejerina":["Somos importantes hoy", "No podemos dejar a España sin alternativa", "La convivencia y la estabilidad"],
 "jaime-de-olano":["Su cuenta corriente", "Nos sobra propaganda", "Para que puedan formar un hogar"],
 "javier-maroto":["Con dureza democrática", "Comprar votos, repito, es corrupción", "Compartir un proyecto juntos"],
 "jordi-sanchez":["Todos estamos conjurados", "Para la victoria inmediata", "Los derechos y libertades de este país"],
 "jose-luis-abalos":["Soy un mero peón", "Tendrán que mirarme a la cara", "Voy a defender mi honor personal"],
 "josep-rull":["Dirigirles la palabra", "Una nación libre", "Seguiremos luchando"],
 "juan-espadas":["No voy a dejar Andalucía", "A ello dedicaré todo mi esfuerzo", "Una segunda opción"],
 "juan-vicente-herrera":["Más pasado que futuro", "Que se acuerden de uno", "Sin distinción de partidos"],
 "marta-lois":["La decisión está tomada", "Un cambio histórico", "Cuento con vosotros y vosotras"],
 "marta-rivera-de-la-cruz":["Chulapear", "Es una irresponsabilidad", "Se han quedado allí"],
 "meritxell-batet":["Somos del pueblo", "Ningún partido representa en exclusiva a España", "La esperanza es el material político"],
 "miguel-arias-canete":["Nos respetan por ello", "No puede jugar sola la partida", "Garantizar el estado de bienestar"],
 "nacho-alvarez":["Estoy orgulloso", "Puso fin al bipartidismo", "Redefinir y oxigenar"],
 "oscar-puente":["No está mal", "Pues no", "Así es la vida"],
 "pablo-cambronero":["Haré lo que prometí hacer", "Lo mantengo", "Voy a defender la democracia"],
 "pablo-montesinos":["Sería una irresponsabilidad", "Una oposición firme", "Pactos de Estado"],
 "patxi-lopez":["Pues va a ser que no", "Tú sabrás", "Velar por la seguridad"],
 "pere-aragones":["Es votando", "Culminar la independencia de Cataluña", "Abrir un nuevo ciclo de crecimiento"],
 "pilar-llop":["Tenemos la obligación", "Esto es intolerable", "Quiero pedirles ayuda"],
 "quim-torra":["La ratafía nos une", "Hemos de atacar", "Nos sentimos seguros, protegidos"],
 "rafael-catala":["Que las cosas funcionen bien", "Un ascenso", "Seguirá haciendo bien su trabajo"],
 "rafael-hernando":["Esa es la representatividad", "¡Inaceptable!", "En todo momento hemos respetado"],
 "raquel-sanchez":["No crece con ladrillos", "No hay dignidad sin vivienda", "Su función social es incuestionable"],
 "raul-romeva":["Soy un culo inquieto", "Se genera incertidumbre", "Trabajo y trabajo"],
 "reyes-maroto":["Esa es la cuestión", "Hoy gana el derecho", "Protección frente a la especulación"],
 "roger-torrent":["Respeto para la voluntad mayoritaria", "Recuperar las instituciones", "Coser la sociedad catalana"],
 "susana-diaz":["Cumplir con mi palabra", "No se puede permitir", "Diálogo, mucho diálogo y consenso"],
 "teodoro-garcia-egea":["Nunca había lanzado más de 11 m", "Ganar abrió una nueva etapa", "Yo soy de Murcia"],
 "toni-canto":["Eso es transfuguismo", "No haces lo que prometes", "Cesen los privilegios"],
 "toni-comin":["Una democracia mundial es posible", "Hay que buscar el desgaste económico", "Erradicar la pobreza en el mundo"]
};

// Keep the original save/image identifier when a corrected surname changes its spelling.
var CARD_NAMES={'isabel-cela':'Isabel Celaá'};
// País de representación política, no lugar de nacimiento ni institución supranacional.
var COUNTRY_NAMES={"ES": "España", "US": "Estados Unidos", "GB": "Reino Unido", "DE": "Alemania", "FR": "Francia", "RU": "Rusia", "IT": "Italia", "TR": "Turquía", "HU": "Hungría", "CA": "Canadá", "VE": "Venezuela", "MX": "México", "AR": "Argentina"};
var COUNTRY_ROSTER={
 "ES":"alberto-nunez-feijoo carles-puigdemont isabel-diaz-ayuso mariano-rajoy pedro-sanchez yolanda-diaz ada-colau felipe-gonzalez gabriel-rufian jose-maria-aznar pablo-iglesias salvador-illa santiago-abascal adriana-lastra albert-rivera alberto-garzon ana-botella anna-gabriel begona-villacis cayetana-alvarez-de-toledo cristina-cifuentes cristobal-montoro dolores-de-cospedal edmundo-bal esperanza-aguirre ines-arrimadas inigo-errejon irene-montero isabel-cela jordi-turull jorge-fernandez-diaz jose-luis-rodriguez-zapatero jose-manuel-garcia-margallo julio-anguita laura-borras luis-de-guindos maria-jesus-montero marta-rovira miquel-iceta miriam-nogueras monica-garcia nadia-calvino oriol-junqueras pablo-casado pablo-echenique pilar-alegria rocio-monasterio sara-gimenez soraya-saenz-de-santamaria alfonso-alonso alvaro-nadal ana-pastor andrea-levy antonio-maillo borja-semper carlos-floriano carme-forcadell carmen-calvo celia-villalobos cuca-gamarra dolors-montserrat elias-bendodo emiliano-garcia-page esteban-gonzalez-pons fatima-banez fernando-grande-marlaska inigo-mendez-de-vigo isabel-garcia-tejerina jaime-de-olano javier-maroto jordi-sanchez jose-luis-abalos josep-rull juan-espadas juan-vicente-herrera marta-lois marta-rivera-de-la-cruz meritxell-batet miguel-arias-canete nacho-alvarez oscar-puente pablo-cambronero pablo-montesinos patxi-lopez pere-aragones pilar-llop quim-torra rafael-catala rafael-hernando raquel-sanchez raul-romeva reyes-maroto roger-torrent susana-diaz teodoro-garcia-egea toni-canto toni-comin".split(' '),
 "US":"donald-trump barack-obama bernie-sanders joe-biden hillary-clinton kamala-harris".split(' '),
 "GB":"boris-johnson nigel-farage".split(' '),
 "DE":"angela-merkel ursula-von-der-leyen".split(' '),
 "FR":"emmanuel-macron marine-le-pen christine-lagarde".split(' '),
 "RU":"vladimir-putin".split(' '),
 "IT":"giorgia-meloni matteo-salvini".split(' '),
 "TR":"recep-tayyip-erdogan".split(' '),
 "HU":"viktor-orban".split(' '),
 "CA":"justin-trudeau".split(' '),
 "VE":"nicolas-maduro".split(' '),
 "MX":"andres-manuel-lopez-obrador".split(' '),
 "AR":"javier-milei cristina-fernandez-de-kirchner".split(' ')
};
var CARD_COUNTRIES={};Object.keys(COUNTRY_ROSTER).forEach(function(code){COUNTRY_ROSTER[code].forEach(function(id){CARD_COUNTRIES[id]=code;});});
var CARDS=[],BYID={};
DOCS.forEach(function(d){
 ['legendario','especial','raro','comun'].forEach(function(t){
  var t2=TIER[t];
  ROSTER[d.k][t].forEach(function(nm,ix){
   var id=slug(nm),cost=t2.costs?t2.costs[ix%t2.costs.length]:t2.c[0]+(ix%(t2.c[1]-t2.c[0]+1)),stats=statsFor(t,cost);
   var c={id:id,n:CARD_NAMES[id]||nm,r:t,pa:d.k,country:CARD_COUNTRIES[id]||null,c:cost,a:stats.a,h:stats.h,v:stats.v};
   c.q=QBESP[c.id].slice();
   CARDS.push(c);BYID[c.id]=c;
  });
 });
});
CARDS.sort(function(a,b){return TIERORDER[a.r]-TIERORDER[b.r]||a.n.localeCompare(b.n,'es');});

var PACKS=[
 {k:'comun',n:'Sobre común',p:400,d:'4 comunes + 20% raro.'},
 {k:'raro',n:'Sobre raro',p:800,d:'4 raros + 25% especial.'},
 {k:'legendario',n:'Sobre legendario',p:1500,d:'1 legendario, 1 especial y 3 raros.'},
 {k:'mitico',n:'Sobre mítico',p:2900,d:'5 legendarios garantizados.'}];
function validate(data){var seen=new Set();for(const c of data.cards){if(!c||!(/^[a-z0-9-]+$/).test(c.id)||seen.has(c.id)||['constructor','prototype','__proto__'].includes(c.id))throw Error('ID de cromo inválido o repetido');seen.add(c.id);if(!c.country||!(/^[A-Z]{2}$/).test(c.country)||!Object.hasOwn(data.countryNames,c.country)||!Object.hasOwn(data.tier,c.r)||!Object.hasOwn(data.roster,c.pa))throw Error('Metadatos incompletos: '+c.id);if(typeof c.n!=='string'||!c.n.trim()||!Array.isArray(c.q)||c.q.length!==3||c.q.some(q=>typeof q!=='string'||!q.trim()))throw Error('Nombre o frases incompletas: '+c.id);for(const k of ['c','a','h','v'])if(!Number.isSafeInteger(c[k])||c[k]<=0)throw Error('Estadística inválida: '+c.id);}return data;}
var data={balanceVersion:BALANCE_VERSION,statsFor:statsFor,cards:CARDS,docs:DOCS,rars:RARS,tier:TIER,roster:ROSTER,quotes:QBESP,countries:CARD_COUNTRIES,countryNames:COUNTRY_NAMES,countryRoster:COUNTRY_ROSTER,tierOrder:TIERORDER,names:CARD_NAMES,packs:PACKS};validate(data);data.validate=validate;return data;});
