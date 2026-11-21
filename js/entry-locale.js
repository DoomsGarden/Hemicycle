/* El idioma se elige antes de entrar y comparte la preferencia de Opciones. */
(function(root){
'use strict';
var languages={es:{country:'ES',name:'Español'},en:{country:'GB',name:'English'},fr:{country:'FR',name:'Français'},de:{country:'DE',name:'Deutsch'}};
var flagBase=new URL('../assets/flags/',document.currentScript.src).href;
var releaseNote='El idioma puede elegirse desde la pantalla de inicio y la ventana legal mediante un desplegable con bandera y código de país. La elección se conserva para las siguientes entradas sin cambiar la edad ni la aceptación marcadas.';
root.HemicycleI18n.register([['INICIAR','START','COMMENCER'],[releaseNote,'Choose the language from the start screen or legal window using the flag and country-code dropdown. Your choice is remembered for future visits without changing your selected age or acceptance.','Choisissez la langue dès l’écran de démarrage ou la fenêtre juridique grâce à la liste avec drapeau et code pays. Votre choix est conservé pour les prochaines visites sans modifier l’âge ni le consentement sélectionnés.']]);
var german={INICIAR:'STARTEN'};german[releaseNote]='Die Sprache lässt sich schon auf dem Startbildschirm und im Rechtsfenster über die Auswahl mit Flagge und Ländercode ändern. Die Auswahl bleibt für künftige Besuche gespeichert, ohne die gewählte Altersgruppe oder Zustimmung zu ändern.';root.HemicycleI18n.registerLocale('de',german);
function control(){
 var current=root.HemicycleI18n.locale;
 return '<div class="entry-locale" data-no-translate><select data-entry-locale data-game-locale aria-label="'+root.HemicycleI18n.t('Idioma')+'">'+Object.keys(languages).map(function(locale){var language=languages[locale];return '<option value="'+locale+'"'+(locale===current?' selected':'')+'>'+language.country+' · '+language.name+'</option>';}).join('')+'</select></div>';
}
function paint(target,locale,compact){
 var language=languages[locale];if(!language)return;
 var key=locale+(compact?'-compact':'-full');if(target.dataset.entryLocaleValue===key)return;
 target.dataset.entryLocaleValue=key;target.setAttribute('data-no-translate','');target.classList.add('entry-locale-value');
 var flag=document.createElement('img'),text=document.createElement('span');flag.src=flagBase+language.country.toLowerCase()+'.svg';flag.alt='';flag.width=24;flag.height=16;
 text.textContent=language.country+(compact?'':' · '+language.name);target.replaceChildren(flag,text);
}
function sync(){document.querySelectorAll('[data-entry-locale]').forEach(function(select){select.value=root.HemicycleI18n.locale;if(root.HemicycleSelect)root.HemicycleSelect.scan(select.parentElement);});}
root.HemicycleEntryLocale={control:control,paint:paint};
document.querySelectorAll('[data-entry-locale-slot]').forEach(function(slot){slot.innerHTML=control();});
document.addEventListener('hemicycle:locale',sync);
root.addEventListener('storage',function(event){if(event.key==='hemicycle_locale_v1')sync();});
})(window);
