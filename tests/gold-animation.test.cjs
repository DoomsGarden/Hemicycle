const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engine = html.slice(html.indexOf('var GOLD_LOOP={'), html.indexOf('\nvar DOCS='));
const asset = fs.readFileSync(path.join(root, 'cards/donald-trump-golden.webp'));

function loadEngine() {
  const context = vm.createContext({ Blob, CardConfetti: require('../js/card-confetti.js') });
  vm.runInContext(engine, context);
  return context;
}

function readFrames(context, bytes = asset) {
  return context.readGoldFrames(Uint8Array.from(bytes).buffer);
}

function timeline(context, durations) {
  context.GOLD_LOOP.frames = durations.map(dur => ({ dur }));
  context.GOLD_LOOP.startedAt = 1000;
  context.buildGoldTimeline();
  return context.GOLD_LOOP;
}

test('the real asset produces 46 independent portrait frames, excluding the particle-only opening', async () => {
  const frames = readFrames(loadEngine());
  assert.equal(frames.length, 46);
  assert.ok(frames.every(f => f.w === 420 && f.h === 560 && f.dur === 56));
  const first = Buffer.from(await frames[0].blob.arrayBuffer());
  assert.equal(first.toString('ascii', 0, 4), 'RIFF');
  assert.equal(first.toString('ascii', 8, 12), 'WEBP');
  assert.equal(first.toString('ascii', 12, 16), 'VP8 ');
  assert.equal(first.readUInt32LE(4) + 8, first.length);
  assert.equal(first.readUInt32LE(16), 18692);
});

test('truncated assets and partial frames fail instead of displaying incomplete portraits', () => {
  const context = loadEngine();
  assert.throws(() => readFrames(context, asset.subarray(0, asset.length - 10)), /Incomplete/);
  assert.throws(() => readFrames(context, Buffer.from('not a WebP')), /Invalid/);
  const partial = Buffer.from(asset);
  const frameHeader = partial.indexOf('ANMF') + 8;
  partial[frameHeader] = 1;
  assert.throws(() => readFrames(context, partial), /requires composition/);
});

test('the real animation overlaps by a fixed 100 ms without duplicating endpoint holds', () => {
  const context = loadEngine();
  const state = timeline(context, readFrames(context).map(f => f.dur));
  assert.equal(state.sequence.length, 90);
  assert.equal(state.duration, 5040);
  assert.equal(state.overlap, 100);
  assert.equal(state.period, 4940);
});

test('individual frame durations determine when the portrait advances', () => {
  const context = loadEngine();
  const state = timeline(context, [120, 240, 360]);
  assert.equal(state.duration, 960);
  for (const [time, expected] of [[0, 0], [119, 0], [120, 1], [359, 1], [360, 2], [719, 2], [720, 1], [959, 1]]) {
    assert.equal(context.getGoldFrameIndex(time), expected, `time ${time}`);
  }
});

test('delayed ticks and long sessions do not accumulate timing drift', () => {
  const context = loadEngine();
  const state = timeline(context, Array(46).fill(56));
  for (const phase of [0, 25, 50, 99, 100, 2000, 4939]) {
    const expected = JSON.stringify(context.getGoldPlayback(state.startedAt + phase));
    for (const cycle of [1, 2, 100, 100000]) {
      assert.equal(JSON.stringify(context.getGoldPlayback(state.startedAt + cycle * state.period + phase)), expected);
    }
  }
});

test('the wrap keeps the outgoing portrait and blends into the prepared incoming sequence', () => {
  const context = loadEngine();
  const state = timeline(context, Array(46).fill(56));
  const before = context.getGoldPlayback(state.startedAt + state.period - 0.001);
  const boundary = context.getGoldPlayback(state.startedAt + state.period);
  const midway = context.getGoldPlayback(state.startedAt + state.period + 50);
  const after = context.getGoldPlayback(state.startedAt + state.period + 100);
  assert.equal(boundary.first, before.first);
  assert.equal(boundary.mix, 0);
  assert.equal(midway.mix, 0.5);
  assert.equal(midway.second, 0);
  assert.equal(after.mix, 0);
  assert.equal(after.first, 1);
});

test('short animations clamp the overlap and a single frame remains a static portrait', () => {
  const context = loadEngine();
  let state = timeline(context, [10, 10]);
  assert.equal(state.overlap, 5);
  assert.equal(state.period, 15);
  state = timeline(context, [56]);
  assert.equal(state.overlap, 0);
  assert.equal(state.period, 56);
  const playback = context.getGoldPlayback(100000000);
  assert.equal(playback.first, 0);
  assert.equal(playback.second, 0);
  assert.equal(playback.mix, 0);
});

test('the original full frames are drawn directly, including their background and expression', () => {
  const c=loadEngine(),state=timeline(c,Array(46).fill(56)),draws=[];
  state.frames.forEach((f,i)=>f.bmp={originalFrame:i,width:420,height:560});
  const ctx={globalAlpha:1,drawImage(...args){draws.push({args,alpha:this.globalAlpha});}};
  state.surface={getContext(){return ctx}};state.w=420;state.h=560;state.state='ready';
  const canvas={width:420,height:560,parentNode:{},getContext(){return{drawImage(){}}}};
  c.document={querySelectorAll(){return[{querySelector(){return canvas},classList:{contains(){return true}}}]}};
  c.drawCurrentGoldFrame(state.startedAt+2000);
  assert.equal(draws.length,1);
  assert.equal(draws[0].args[0],state.frames[c.getGoldFrameIndex(2000)].bmp);
  assert.deepEqual(draws[0].args.slice(1),[0,0,420,560]);
  assert.equal(draws[0].alpha,1);
  draws.length=0;
  c.drawCurrentGoldFrame(state.startedAt+state.period+50);
  const playback=c.getGoldPlayback(state.startedAt+state.period+50);
  assert.equal(draws.length,2);
  assert.equal(draws[0].args[0],state.frames[playback.first].bmp);
  assert.equal(draws[1].args[0],state.frames[playback.second].bmp);
  assert.equal(draws[0].alpha,1);assert.equal(draws[1].alpha,0.5);
  assert.equal(ctx.globalAlpha,1);
});

test('holding an original frame avoids rebuilding or redrawing its picture', () => {
  const c=loadEngine(),state=timeline(c,Array(46).fill(56));
  state.frames.forEach((f,i)=>f.bmp={originalFrame:i});
  let draws=0;
  state.surface={getContext(){return{drawImage(){draws++}}}};
  state.w=420;state.h=560;state.state='ready';
  const canvas={width:420,height:560,parentNode:{},getContext(){return{drawImage(){}}}};
  c.document={querySelectorAll(){return[{querySelector(){return canvas},classList:{contains(){return true}}}]}};
  assert.equal(c.getGoldFrameIndex(1020),c.getGoldFrameIndex(1054));
  c.drawCurrentGoldFrame(state.startedAt+1020);
  c.drawCurrentGoldFrame(state.startedAt+1054);
  assert.equal(draws,1);
});
