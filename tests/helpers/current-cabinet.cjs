'use strict';
const C=require('../../js/orator-catalog.js'),A=require('../../js/action-cards.js');
// Complete valid historical test fixtures to the current format, keeping their
// named leaders and selected cards. Invalid-input tests construct their own input.
function complete(raw){const ids=[...new Set(raw.orators||raw.ids||[])];for(const c of C.cards.filter(c=>c.r==='comun'))if(ids.length<8&&!ids.includes(c.id))ids.push(c.id);const actions=[...new Set(raw.actions||[])];for(const c of A.cards)if(actions.length<4&&!actions.includes(c.id))actions.push(c.id);return {...raw,orators:ids,leader:raw.leader||ids[0],actions};}
module.exports={complete};
