'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Events=require('../js/expansion-event.js'),Presenter=require('../js/event-presenter.js'),Appearance=require('../js/cosmetic-entitlements.js');
const now=Date.parse('2026-11-07T12:00:00Z'),event=Events.review;
function profile(){return {appearance:Appearance.fresh(now),revisionEvent:{id:event.id,announced:true,mailVisited:true,claimed:['fs','comun']}};}
test('a delivery already marked announced or visited can recover its missing local animation without granting anything',()=>{
 const p=profile(),before=JSON.stringify(p);assert.equal(Presenter.shouldPresent(event,p,null,now),true);
 const receipt=Presenter.dismissal(event,now);assert.equal(Presenter.shouldPresent(event,p,receipt,now),false);
 assert.equal(Presenter.reminder(event,p,receipt,now),true);assert.equal(Presenter.reminder(event,p,{...receipt,mailVisited:true},now),false);
 assert.equal(JSON.stringify(p),before);assert.deepEqual(event.pending(p,now).map(g=>g.key),['raro','legendario','mitico']);
});
test('claims remain final and presentations stay separate across events and ineligible accounts',()=>{
 const p=profile(),receipt=Presenter.dismissal(Events,now);assert.equal(Presenter.shouldPresent(event,p,receipt,now),true);
 p.revisionEvent.claimed=event.grants.map(g=>g.key);assert.equal(Presenter.shouldPresent(event,p,null,now),false);assert.equal(Presenter.reminder(event,p,null,now),false);
 const fresh={appearance:Appearance.fresh(Appearance.cutoff)};assert.equal(Presenter.shouldPresent(event,fresh,null,Appearance.cutoff),false);
});
