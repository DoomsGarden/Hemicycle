/* Run with PGLITE_MODULE=/path/to/@electric-sql/pglite. No production credentials. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require(process.env.PGLITE_MODULE||'@electric-sql/pglite');
(async()=>{const db=new PGlite();try{
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');`);
await db.exec("create table public.existing_game_progress(id integer primary key,data jsonb);insert into public.existing_game_progress values (1,'{\"fs\":1500,\"album\":[\"legacy-card\"]}');");
const original=(await db.query('select * from public.existing_game_progress')).rows;
const sql=fs.readFileSync(path.join(__dirname,'../supabase/20261021_account_profiles.sql'),'utf8');await db.exec(sql);await db.exec(sql);assert.deepEqual((await db.query('select * from public.existing_game_progress')).rows,original);console.log('Migration is idempotent and preserves existing game data');
async function user(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);}
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
async function rpc(name,values=[]){return (await db.query('select public.'+name+'('+values.map((_,i)=>'$'+(i+1)).join(',')+') as value',values)).rows[0].value;}
await user(a);let first=await rpc('hemicycle_get_profile');assert.equal(first.user_id,a);assert.equal(first.nickname,null);assert.equal(first.can_rename,true);
for(const nick of ['ab','<script>','x'.repeat(21),'bad\nname'])await assert.rejects(rpc('hemicycle_set_nickname',[nick]));
let named=await rpc('hemicycle_set_nickname',['  Señor Águila  ']);assert.equal(named.nickname,'Señor Águila');assert.equal(named.can_rename,false);assert.ok(Date.parse(named.next_nickname_change_at)>Date.now()+364*86400000);
await assert.rejects(rpc('hemicycle_set_nickname',['Otro jugador']),/cambio gratuito/);let same=await rpc('hemicycle_set_nickname',['Señor Águila']);assert.equal(same.nickname_changed_at,named.nickname_changed_at);
await assert.rejects(db.query("update public.hemicycle_account_profiles set nickname_changed_at=null where user_id=$1",[a]),/permission denied/);
await db.exec('reset role');await db.exec(sql);assert.deepEqual((await db.query('select * from public.existing_game_progress')).rows,original);await user(a);assert.deepEqual(await rpc('hemicycle_get_profile'),named);console.log('Reapplying migration preserves the existing nickname and change date');
await user(b);assert.equal((await db.query('select * from public.hemicycle_account_profiles')).rows.length,0);assert.equal((await rpc('hemicycle_get_profile')).user_id,b);assert.equal((await db.query('select * from public.hemicycle_account_profiles')).rows.length,1);assert.equal((await rpc('hemicycle_set_nickname',['Jugador Dos'])).nickname,'Jugador Dos');
await user('','anon');await assert.rejects(rpc('hemicycle_get_profile'),/permission denied/);await assert.rejects(db.query('select * from public.hemicycle_account_profiles'),/permission denied/);
await db.exec('reset role');await db.query("update public.hemicycle_account_profiles set nickname_changed_at=now()-interval '1 year'-interval '1 second' where user_id=$1",[a]);await user(a);assert.equal((await rpc('hemicycle_get_profile')).can_rename,true);assert.equal((await rpc('hemicycle_set_nickname',['Nuevo Nick'])).nickname,'Nuevo Nick');await assert.rejects(rpc('hemicycle_set_nickname',['Otro Nick']),/cambio gratuito/);
console.log('SQL passed: initial/free annual nickname, Spanish text, unchanged retries, invalid names, yearly renewal, RLS isolation, anonymous and direct-write denial');
}finally{await db.close();}})().catch(e=>{console.error(e);process.exitCode=1});
