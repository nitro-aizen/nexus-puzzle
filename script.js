'use strict';
const LS=(()=>{try{const t=window.localStorage;t.setItem('_t','1');t.removeItem('_t');return t}catch(e){const m={};return{getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]}}}})();
/* ===== GLITCH//NEXUS ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let KEY='glitchnexus.v1',CATS=['01 // LOGIC CORE','02 // CIPHER BREAK','03 // GLITCH REALITY'];
const RANKS=[['NOVICE',0],['HACKER',1500],['RUNNER',3500],['BREAKER',6000],['NEXUS',9000]];
const ACH={zero:['ZERO TRACE','Clear a puzzle with no hints'],speed:['SPEED DEMON','Clear a puzzle in under 30s'],hunter:['GLITCH HUNTER','Discover a hidden interaction'],perfect:['PERFECT RUN','Clear all 15 without hints'],breaker:['NEXUS BREAKER','Clear the whole game'],root:['???','SECRET']};
const def=()=>({xp:0,done:{},ach:{},best:null,hints:0,set:{snd:1,g:2,rm:0},last:'0-0'});
let S=def();try{const o=JSON.parse(LS.getItem(KEY));if(o)S=Object.assign(def(),o,{set:Object.assign(def().set,o.set)})}catch(e){}
const rank=()=>RANKS.filter(r=>S.xp>=r[1]).pop()[0],lvl=()=>Math.floor(S.xp/350)+1;
const save=()=>{S.rank=rank();LS.setItem(KEY,JSON.stringify(S))};
const cleared=()=>Object.keys(S.done).length,fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
let cur=null,cc=0,tm=null,fresh='';

/* ---- Sound (Web Audio, no files) ---- */
let AC;const tone=(f,d=.1,t='square',v=.05,dl=0)=>{if(!S.set.snd)return;try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+dl;o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d)}catch(e){}};
const seq=(a,t,d)=>a.forEach((f,i)=>tone(f,d,t,.06,i*.09));
const SFX={click:()=>tone(660,.05),glitch:()=>{tone(120,.15,'sawtooth');tone(90,.2,'square',.04,.05)},ok:()=>seq([523,659,784],'triangle',.12),bad:()=>tone(150,.3,'sawtooth',.07),win:()=>seq([523,659,784,1047,1319],'square',.18),ach:()=>seq([880,1175,1568],'triangle',.15)};

/* ---- Helpers ---- */
const toast=m=>{const d=document.createElement('div');d.textContent=m;$('#toast').append(d);setTimeout(()=>d.remove(),3200)};
const flash=c=>{document.body.classList.add(c);setTimeout(()=>document.body.classList.remove(c),500)};
const unlock=id=>{if(S.ach[id])return;S.ach[id]=1;toast('ACHIEVEMENT: '+ACH[id][0]);SFX.ach();save()};
const hud=()=>$('#stat').textContent=`${USER} · XP ${S.xp} · LV ${lvl()} · ${rank()}`;
const countUp=(el,to)=>{let n=0;const t=setInterval(()=>{n+=Math.ceil(to/30);if(n>=to){n=to;clearInterval(t)}el.textContent=n},30)};
function show(id){const o=$('.screen.on'),n=$('#'+id);SFX.glitch();document.body.classList.add('tr');setTimeout(()=>{o.classList.remove('on');n.classList.add('on');document.body.classList.remove('tr');$('#hud').hidden=id==='land'||id==='login';hud();(R[id]||(()=>{}))();scrollTo(0,0)},220)}
const unlocked=(c,i)=>i===0||S.done[c+'-'+(i-1)];

/* ---- Screens ---- */
const R={
dash(){$('#cards').innerHTML=CATS.map((n,c)=>{const d=[0,1,2,3,4].filter(i=>S.done[c+'-'+i]).length;return`<div class="card t${c}" data-c="${c}"><h3>${n}</h3><p>05 LEVELS</p><div class="meter"><i data-w="${d*20}"></i></div><p>${d}/5 CLEARED</p></div>`}).join('');
 $$('.card[data-c]').forEach(e=>e.onclick=()=>{cc=+e.dataset.c;SFX.click();show('cat')});anim()},
cat(){$('#ctitle').textContent=CATS[cc];$('#lvs').innerHTML=[0,1,2,3,4].map(i=>{const k=cc+'-'+i,s=S.done[k]?'CLEARED':unlocked(cc,i)?'AVAILABLE':'LOCKED';return`<button class="lv st-${s}${fresh===k?' pop':''}" data-i="${i}"><b>${i+1}</b>${LV[cc][i].t}<small>${s==='CLEARED'?'✓ ':''}${s}</small></button>`}).join('');fresh='';
 $$('.lv').forEach(e=>e.onclick=()=>{const i=+e.dataset.i;if(!unlocked(cc,i)){SFX.bad();flash('shake');toast('LEVEL CORRUPTED // CLEAR PREVIOUS');return}SFX.click();openLv(cc,i)})},
profile(){const p=c=>Math.round([0,1,2,3,4].filter(i=>S.done[c+'-'+i]).length*20),b=v=>'█'.repeat(v/10)+'░'.repeat(10-v/10),cols=['--c','--h','--l'];
 $('#pf').innerHTML=`<h2 class="title">PLAYER PROFILE</h2><p>RANK: <b>${rank()}</b> · XP: <b>${S.xp}</b> · LEVEL ${lvl()}</p>`+['LOGIC','CIPHER','GLITCH'].map((n,c)=>`<div class="prow">${n} ${b(p(c))} ${p(c)}%<div class="pbar"><i data-w="${p(c)}" style="background:var(${cols[c]})"></i></div></div>`).join('')+`<p>LEVELS CLEARED: ${cleared()}/15</p><p>BEST TIME: ${S.best==null?'--:--':fmt(S.best)}</p><p>HINTS USED: ${S.hints}</p>`;anim()},
ach(){$('#al').innerHTML=Object.entries(ACH).map(([k,v])=>`<div class="card ac ${S.ach[k]?'got':''}"><b>${S.ach[k]||k!=='root'?v[0]:'???'}</b><p>${S.ach[k]||k!=='root'?v[1]:'Requirement unknown...'}</p></div>`).join('')},
set(){const s=S.set;$('#st').innerHTML=`<h2 class="title">SETTINGS</h2><div class="row"><button class="btn alt" id="s1">SOUND: ${s.snd?'ON':'OFF'}</button><button class="btn alt" id="s2">GLITCH: ${['','LOW','MEDIUM','HIGH'][s.g]}</button><button class="btn alt" id="s3">REDUCED MOTION: ${s.rm?'ON':'OFF'}</button><button class="btn" id="s4" style="background:var(--h)">RESET PROGRESS</button></div>`;
 $('#s1').onclick=()=>{s.snd^=1;SFX.click();apply();R.set()};$('#s2').onclick=()=>{s.g=s.g%3+1;apply();R.set()};$('#s3').onclick=()=>{s.rm^=1;apply();R.set()};
 $('#s4').onclick=()=>{if(confirm('Erase ALL progress? This cannot be undone.')){S=def();save();apply();hud();toast('SYSTEM WIPED');R.set()}};save()}
};
const anim=()=>setTimeout(()=>$$('[data-w]').forEach(e=>e.style.width=e.dataset.w+'%'),60);
const apply=()=>{document.body.dataset.g=S.set.g;document.body.classList.toggle('rm',!!S.set.rm);save()};

/* ---- Puzzle engine ---- */
const sec=()=>Math.round((Date.now()-cur.t0)/1000),norm=v=>String(v).toUpperCase().replace(/\s+/g,'');
function openLv(c,i){const L=LV[c][i];cur={c,i,t0:Date.now(),att:0,hu:0,fin:0};S.last=c+'-'+i;
 $('#ptitle').textContent=`${CATS[c].slice(0,2)}-${i+1} :: ${L.t}`;$('#ptitle').dataset.t=$('#ptitle').textContent;$('#pq').innerHTML=L.q;
 const b=$('#pbox');b.innerHTML='';cur.get=L.ui(b,sub);$('#att').textContent=0;$('#hl').innerHTML='';$('#msg').textContent='';$('#hn').textContent='HINT (3 left)';$('#tm').textContent='00:00';
 clearInterval(tm);tm=setInterval(()=>cur&&!cur.fin&&($('#tm').textContent=fmt(sec())),500);show('puz');setTimeout(()=>cur.t0=Date.now(),230)}
function sub(v){if(!cur||cur.fin)return;if(v===undefined)v=cur.get();const A=LV[cur.c][cur.i].a;if(typeof A==='function'?A(v):norm(v)===norm(A))win();else lose()}
function lose(){cur.att++;$('#att').textContent=cur.att;$('#msg').textContent=['NOPE - the system burped. Try again.','Close... or not. Breathe, retry.','Glitch says no. You got this.','Almost! Shake it off.'][cur.att%4];SFX.bad();flash('bad');flash('shake')}
function win(){cur.fin=1;const t=sec(),k=cur.c+'-'+cur.i,first=!S.done[k];
 const sc={nh:cur.hu?0:100,sp:Math.max(0,120-t*2),pa:Math.min(200,cur.att*30),ph:cur.hu*60};sc.tot=Math.max(100,500+sc.nh+sc.sp-sc.pa-sc.ph);
 const gain=first?sc.tot:0;window.lastGain=gain;if(first){S.xp+=gain;S.done[k]={time:t,hints:cur.hu,att:cur.att};fresh=cur.c+'-'+(cur.i+1)}
 if(S.best==null||t<S.best)S.best=t;SFX.ok();flash('good');
 if(!cur.hu)unlock('zero');if(t<30)unlock('speed');
 const ds=Object.values(S.done);if(ds.length===15){unlock('breaker');if(ds.every(d=>!d.hints))unlock('perfect')}
 save();hud();
 $('#rb').textContent=`BASE XP:        500\nNO HINT BONUS: +${sc.nh}\nSPEED BONUS:   +${sc.sp}\nATTEMPT PENALTY: -${sc.pa}\nHINT PENALTY:    -${sc.ph}\nTIME: ${fmt(t)}  ATTEMPTS: ${cur.att}  HINTS: ${cur.hu}\n${first?'':'(REPLAY: NO XP AWARDED)'}`;
 $('#rx').textContent=0;const last=cur.c===2&&cur.i===4,nx=$('#nx');
 nx.style.display=cur.i<4?'':'none';nx.onclick=()=>openLv(cur.c,cur.i+1);
 setTimeout(()=>{if(last&&first)megaGlitch();else{SFX.win();show('res');setTimeout(()=>countUp($('#rx'),gain),400)}},600)}
function megaGlitch(){document.body.classList.add('mega');SFX.glitch();[200,400,600,800].forEach((f,i)=>tone(f,.4,'sawtooth',.06,i*.2));
 setTimeout(()=>{document.body.classList.remove('mega');$('#rest').hidden=false;SFX.win()},2000)}
$('#rok').onclick=()=>{$('#rest').hidden=true;show('res');setTimeout(()=>countUp($('#rx'),window.lastGain||0),400)};
$('#sbm').onclick=()=>sub();
$('#hn').onclick=()=>{if(!cur||cur.fin||cur.hu>=3)return;cur.hu++;S.hints++;save();$('#hl').insertAdjacentHTML('beforeend',`<p class="hint">HINT 0${cur.hu} // ${LV[cur.c][cur.i].h[cur.hu-1]}</p>`);SFX.click();$('#hn').textContent=cur.hu>=3?'NO HINTS LEFT':`HINT (${3-cur.hu} left)`};

/* ---- UI builders ---- */
const inp=b=>{const i=document.createElement('input');i.placeholder='ENTER ANSWER';i.autocomplete='off';i.onkeydown=e=>{if(e.key==='Enter')sub()};b.append(i);return()=>i.value};
const ch=(b,o)=>{let v='';o.forEach(x=>{const e=document.createElement('button');e.className='opt';e.textContent=x;e.onclick=()=>{v=x;SFX.click();b.querySelectorAll('.opt').forEach(n=>n.classList.toggle('sel',n===e))};b.append(e)});return()=>v};
const bin=s=>[...s].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');

/* ---- All 15 levels ---- */
const LV=[[ // LOGIC CORE
{t:'PATTERN SCAN',q:'The core outputs a corrupted pattern. Choose the missing value.<pre>2 → 4\n3 → 9\n4 → 16\n5 → ?</pre>',a:'25',h:['Compare input and output.','The output is the input times something.','Each input is multiplied by itself.'],ui:b=>ch(b,['10','20','25','30'])},
{t:'SEQUENCE LEAK',q:'Type the next number.<pre>2, 6, 12, 20, 30, ?</pre>',a:'42',h:['Look at the gaps between numbers.','Gaps: 4, 6, 8, 10...','The next gap is 12.'],ui:b=>inp(b)},
{t:'MISSING TILE',q:'Every row and column sums to the same number. Click the tile that fits the "?".',a:'8',h:['Add up a complete row.','Rows sum to 15.','4 + 3 + ? = 15'],ui:b=>{const g=document.createElement('div');g.className='mg';g.innerHTML=[2,7,6,9,5,1,4,3,'?'].map(n=>`<span>${n}</span>`).join('');b.append(g);const d=document.createElement('div');b.append(d);d.style.cssText='display:flex;gap:8px;flex-wrap:wrap';return ch(d,['3','6','8','9'])}},
{t:'GATE KEEPER',q:'Set the switches so the lamp ignites.<pre>OUT = (A AND NOT B) AND (B XOR C)</pre>The lamp is hidden - submit your setting.',a:'101',h:['OUT needs both sides true.','A must be 1 and B must be 0.','With B=0, XOR needs C=1.'],ui:b=>{const s=[0,0,0];'ABC'.split('').forEach((n,k)=>{const e=document.createElement('button');e.className='opt sw';e.textContent=n+': 0';e.onclick=()=>{s[k]^=1;e.textContent=n+': '+s[k];e.classList.toggle('sel',!!s[k]);SFX.click()};b.append(e)});return()=>s.join('')}},
{t:'TRIPLE LOCK',q:'Enter the vault code.<pre>X = next in 1, 4, 9, 16, ...\nY = decimal value of 1010\nZ = 1 AND (0 OR 1)\nCODE = (X + Y) × Z</pre>',a:'35',xp:0,h:['Solve X, Y and Z separately.','X=25 (squares), Y=10 (binary).','Z=1, so CODE = 25 + 10.'],ui:b=>inp(b)}
],[ // CIPHER BREAK
{t:'CAESAR CRACK',q:'Caesar cipher, each letter shifted +3.<pre>FRGH</pre>Decode it.',a:'CODE',h:['Shift each letter backward.','F → C is three steps back.','F-R-G-H becomes C-O-D-?'],ui:b=>inp(b)},
{t:'BINARY DECAY',q:'Convert binary to ASCII text.<pre>'+bin('GLITCH')+'</pre>',a:'GLITCH',h:['Each 8-bit group is one letter.','01000111 = 71 = G.','The word describes this game.'],ui:b=>inp(b)},
{t:'SIGNAL TAP',q:'Intercepted Morse transmission.<pre>-.   .   -..-   ..-   ...</pre>',a:'NEXUS',h:['Spaces separate letters.','"-." is N and "." is E.','X is -..-, U is ..-, S is ...'],ui:b=>inp(b)},
{t:'SYMBOL SWAP',q:'Drag (or tap) letters into the slots to decode the symbols.',a:'SECRET',h:['Match each symbol with the key.','▲ is S, ◉ is E.','The word is SECRET.'],ui:b=>{const k={'▲':'S','◉':'E','◆':'C','▣':'R','✦':'T'};b.innerHTML='<div class="key">'+Object.entries(k).map(([a,c])=>a+' = '+c).join('   ')+'</div><div class="enc" style="width:100%;font-size:1.6rem">▲◉◆▣◉✦</div>';
 const sl=document.createElement('div'),pl=document.createElement('div');sl.className='slots';pl.className='slots';
 const slots=[0,1,2,3,4,5].map(()=>{const e=document.createElement('span');e.className='slot';e.textContent='';e.ondragover=v=>v.preventDefault();e.ondrop=v=>{v.preventDefault();e.textContent=v.dataTransfer.getData('t')};e.onclick=()=>e.textContent='';sl.append(e);return e});
 'SECRTAO'.split('').forEach(c=>{const e=document.createElement('span');e.className='tc';e.textContent=c;e.draggable=true;e.ondragstart=v=>v.dataTransfer.setData('t',c);e.onclick=()=>{const f=slots.find(s=>!s.textContent);if(f)f.textContent=c;SFX.click()};pl.append(e)});
 b.append(sl,pl);return()=>slots.map(s=>s.textContent).join('')}},
{t:'DEEP LAYERS',q:'Two layers. First binary → text, then Caesar (+3 was applied).<pre>'+bin('PHVVDJH')+'</pre>',a:'MESSAGE',xp:0,h:['Decode the binary first.','Binary gives PHVVDJH.','Shift every letter back by 3.'],ui:b=>inp(b)}
],[ // GLITCH REALITY
{t:'SPOT THE DIFF',q:'One symbol in the grid is not like the others. Click it.',a:'OK',h:['Look at the shapes closely.','It is slightly different - filled corner.','Scan row by row for ◬.'],ui:(b,go)=>{const o=Math.floor(Math.random()*30),g=document.createElement('div');g.className='fgrid';for(let i=0;i<30;i++){const e=document.createElement('button');e.className='fcell';e.textContent=i===o?'◬':'△';e.onclick=()=>go(i===o?'OK':'NO');g.append(e)}b.append(g);return()=>''}},
{t:'CORRUPT BYTE',q:'A foreign character is hiding in the text. Click it.',a:'OK',h:['It is not a Latin letter.','Read slowly - one letter looks Cyrillic.','Look for the letter Ж.'],ui:(b,go)=>{const t=document.createElement('div');t.className='txt';[...'REPAIR THE CORE BEFORE THE LOOP CONSUMES ЖVERYTHING'].forEach(c=>{const s=document.createElement('span');s.textContent=c;s.onclick=()=>c!==' '&&go(c==='Ж'?'OK':'NO');t.append(s)});b.append(t);return()=>''}},
{t:'ROGUE BUTTON',q:'Four identical nodes. One of them is lying. Find what it hides, then enter the code.',a:'7',h:['Try touching every node.','Hover (or tap) each node.','The third node reveals a number.'],ui:b=>{const w=document.createElement('div');w.style.cssText='display:flex;gap:8px;width:100%';[0,1,2,3].forEach(i=>{const e=document.createElement('button');e.className='opt';e.textContent='◈';const rv=()=>{e.textContent='7';e.style.color='var(--l)';unlock('hunter')};if(i===2){e.onmouseenter=rv}e.onclick=()=>{if(i===2)rv();else{e.textContent='ERR';setTimeout(()=>e.textContent='◈',500)}};w.append(e)});b.append(w);return inp(b)}},
{t:'SCATTERED CODE',q:'Four fragments are hidden in the interface. Click the <b>heading</b> (this title), the <b>status pill</b> (top bar), the <b>floating object</b> (yellow triangle), and the <b>GLITCH//NEXUS logo</b> (top-left). Combine them in that order.',a:'3137',h:['Each element gives one digit.','Click the title, the XP pill, the triangle.','The last digit hides in the logo.'],ui:b=>inp(b)},
{t:'BREAK THE NEXUS',q:'Final override. Enter 5 digits: the <b>INTEGRITY %</b> shown on the landing screen, followed by the <b>last three digits</b> of the Level 4 code.',a:'73137',h:['Recall the landing screen stats.','Integrity was 73. Level 4 code ended in 137.','Join them: 73 and 137.'],ui:b=>inp(b)}
]];

/* ---- Login (local accounts, one save slot per user) ---- */
let USER='GUEST';
const US=()=>{try{return JSON.parse(LS.getItem('glitchnexus.users'))||{}}catch(e){return{}}};
const hs=t=>{let h=5381;for(const c of t)h=(h*33^c.charCodeAt(0))>>>0;return h.toString(36)};
function loadUser(n,key){USER=n;KEY=key;S=def();try{const o=JSON.parse(LS.getItem(KEY));if(o)S=Object.assign(def(),o,{set:Object.assign(def().set,o.set)})}catch(e){}apply();hud();LS.setItem('glitchnexus.last',n)}
const lastU=LS.getItem('glitchnexus.last');$('#lu').value=lastU&&lastU!=='GUEST'?lastU:'';
const lerr=m=>{$('#lm').textContent=m;SFX.bad();flash('shake')};
$('#lgo').onclick=()=>{const n=$('#lu').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,''),p=$('#lp').value,u=US();
 if(n.length<3)return lerr('USERNAME: 3+ LETTERS OR NUMBERS');if(p.length<3)return lerr('PASSCODE: 3+ CHARACTERS');
 if(u[n]&&u[n]!==hs(p))return lerr('WRONG PASSCODE');
 if(!u[n]){u[n]=hs(p);LS.setItem('glitchnexus.users',JSON.stringify(u));toast('NEW PROFILE CREATED')}
 loadUser(n.toUpperCase(),'glitchnexus.v1.u.'+n);SFX.ok();toast('WELCOME, '+USER);show('land')};
$('#lg').onclick=()=>{loadUser('GUEST','glitchnexus.v1');SFX.click();show('land')};
['#lu','#lp'].forEach(i=>$(i).onkeydown=e=>{if(e.key==='Enter')$('#lgo').click()});
R.login=()=>{$('#lp').value='';$('#lm').textContent=''};
const set0=R.set;R.set=()=>{set0();$('#st .row').insertAdjacentHTML('beforeend',`<button class="btn alt" id="s5">LOGOUT (${USER})</button>`);$('#s5').onclick=()=>{SFX.click();show('login')}};

/* ---- Global wiring ---- */
let lc=0;$('#logo').addEventListener('click',()=>{if(++lc>=7)unlock('root')});
$('#enter').onclick=()=>{SFX.click();show('dash')};
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){SFX.click();show(g.dataset.go)}
 const k=e.target.closest('[data-clue]');if(k&&cur&&!cur.fin&&cur.c===2&&cur.i===3&&$('#puz').classList.contains('on')){toast(`FRAGMENT [${k.dataset.lbl}] = ${k.dataset.clue}`);SFX.ok()}});
/* ambient glitch: briefly distort random headings & scramble text */
const ch_='#%&@$▓░01';setInterval(()=>{if(S.set.rm)return;const n=S.set.g,els=$$('.gl,.scr');if(!els.length||Math.random()>n*.3)return;const e=els[Math.floor(Math.random()*els.length)];SFX.glitch&&n>2&&tone(80,.05,'sawtooth',.02);e.classList.add('on');setTimeout(()=>e.classList.remove('on'),350);
 if(e.classList.contains('scr')&&n>1){const o=e.textContent;e.textContent=[...o].map(c=>Math.random()<.3&&c!==' '?ch_[Math.floor(Math.random()*ch_.length)]:c).join('');setTimeout(()=>e.textContent=o,300)}},2500);
/* memphis background */
(()=>{const cl=['#00f0ff','#ff2e93','#b6ff1f','#ffe600','#a43cff'],z='<svg width="90" height="30" viewBox="0 0 90 30"><polyline points="0,25 15,5 30,25 45,5 60,25 75,5 90,25" fill="none" stroke="K" stroke-width="5"/></svg>',q='<svg width="90" height="30"><path d="M0 15Q11 0 22 15T45 15T67 15T90 15" fill="none" stroke="K" stroke-width="5"/></svg>';
 for(let i=0;i<16;i++){const e=document.createElement('i'),k=cl[i%5],t=i%6;e.className='m '+['circ','sqr','tri','dots','',''][t];e.style.cssText=`--k:${k};--d:${10+Math.random()*12}s;left:${Math.random()*95}%;top:${Math.random()*95}%;`+(t<2?'width:'+(30+Math.random()*50)+'px;height:'+(30+Math.random()*50)+'px;':t===3?'width:80px;height:60px;':'');
  if(t>3)e.innerHTML=(t===4?z:q).replace('K',k);$('#bg').append(e)}})();
apply();hud();

/* ===== STRESS-RELIEF LAYER: particles, trail, Glitch Smash ===== */
const PC=['#00f0ff','#ff2e93','#b6ff1f','#ffe600','#a43cff'];
function burst(x,y,n=12){if(S.set.rm)return;for(let i=0;i<n;i++){const p=document.createElement('i'),a=Math.random()*6.28,d=30+Math.random()*90;p.className='pt';p.style.cssText=`left:${x}px;top:${y}px;--k:${PC[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;${i%2?'border-radius:50%':''}`;document.body.append(p);setTimeout(()=>p.remove(),700)}}
document.addEventListener('pointerdown',e=>burst(e.clientX,e.clientY,6));
let lt=0;document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||Date.now()-lt<50)return;lt=Date.now();burst(e.clientX,e.clientY,1)});
const _w=win;win=function(){_w();for(let i=0;i<5;i++)setTimeout(()=>burst(innerWidth/2,innerHeight/2,30),i*150)};
const d0=R.dash;R.dash=()=>{d0();$('#cards').insertAdjacentHTML('beforeend','<div class="card t3" id="smc"><h3>04 // GLITCH SMASH</h3><p>STRESS RELIEF</p><p>Squash bugs. No pressure.</p></div>');$('#smc').onclick=()=>{SFX.click();show('smash')}};
const sm={on:0,s:0,c:0,t:30,zen:0,iv:0,tv:0,cl:0};
R.smash=()=>{stopSm();$('#sg').innerHTML='';for(let i=0;i<12;i++){const b=document.createElement('button');b.className='hole';b.onclick=e=>{if(!sm.on||!b.classList.contains('bug'))return;e.stopPropagation();b.classList.remove('bug');b.textContent='';sm.s+=10+sm.c;sm.c++;tone(300+Math.min(sm.c,15)*50,.1,'triangle',.08);burst(e.clientX,e.clientY,18);sm.on&&upd()};$('#sg').append(b)}upd()};
const upd=()=>{$('#ss').textContent=sm.s;$('#sc').textContent=sm.c;$('#stm').textContent=sm.zen?'∞':sm.t};
function stopSm(){clearInterval(sm.iv);clearInterval(sm.tv);sm.on=0;$('#sgo').textContent='START'}
function endSm(){stopSm();const g=sm.zen?0:Math.min(100,Math.floor(sm.s/5));S.xp+=g;save();hud();$('#smsg').textContent=sm.zen?'Zen session over. Deep breath. ✔':`TIME! Score ${sm.s} → +${g} XP`;SFX.win();burst(innerWidth/2,innerHeight/2,40)}
$('#szen').onclick=()=>{sm.zen^=1;$('#szen').textContent='ZEN MODE: '+(sm.zen?'ON':'OFF');SFX.click()};
$('#sgo').onclick=()=>{if(sm.on){endSm();return}sm.on=1;sm.s=0;sm.c=0;sm.t=30;upd();$('#sgo').textContent='STOP';$('#smsg').textContent=sm.zen?'Zen mode: pop at your own pace.':'GO GO GO!';
 sm.iv=setInterval(()=>{const hs=$$('.hole'),h=hs[Math.floor(Math.random()*12)];if(h.classList.contains('bug'))return;h.classList.add('bug');h.textContent='👾';setTimeout(()=>{if(h.classList.contains('bug')){h.classList.remove('bug');h.textContent='';sm.c=0;sm.on&&upd()}},sm.zen?1600:900)},sm.zen?800:600);
 if(!sm.zen)sm.tv=setInterval(()=>{sm.t--;upd();if(sm.t<=0)endSm()},1000)};

/* ===== PUZZLE GAMES: Sudoku, Queens, Wordle, Crossclimb (replace 4 levels) ===== */
const mk=(p,c,t,f)=>{const e=document.createElement(p);e.className=c||'';if(t!==undefined)e.textContent=t;if(f)f(e);return e};
// LOGIC 2 - Mini Sudoku 4x4 (tap a cell to cycle numbers)
LV[0][1]={t:'MINI SUDOKU',q:'Fill the grid: digits 1-4 once in every row, column and 2×2 box. Tap a blank cell to cycle its number.',a:'1234341221434321',h:['Row 1 is 1 _ _ 4, so it needs 2 and 3.','Column 2 already has 4 and 3, so top-middle must be 2.','Top row: 1 2 3 4. Then work down column by column.'],
 ui:b=>{const G='1004041020030320'.split('').map(Number),v=[...G],g=mk('div','sd');v.forEach((n,i)=>g.append(mk('button','opt',n||'',e=>{if(n){e.style.color='var(--c)';e.disabled=true;return}e.onclick=()=>{v[i]=(v[i]+1)%5;e.textContent=v[i]||'';SFX.click();burst(e.getBoundingClientRect().x+20,e.getBoundingClientRect().y+20,5)}})));b.append(g);return()=>v.join('')}};
// LOGIC 3 - Queens 5x5
const QR=['AAABB','ABBBB','CCDDB','CDDDE','CCDEE'],QC={A:'#a43cff55',B:'#00f0ff44',C:'#ff2e9355',D:'#b6ff1f44',E:'#ffe60055'};
const qOK=v=>{if(!v)return false;const q=v.split(';').map(s=>s.split(',').map(Number));if(q.length!==5)return false;
 if(new Set(q.map(a=>a[0])).size!==5||new Set(q.map(a=>a[1])).size!==5||new Set(q.map(([a,b])=>QR[a][b])).size!==5)return false;
 return q.every(([a,b],i)=>q.every(([x,y],j)=>i===j||Math.max(Math.abs(a-x),Math.abs(b-y))>1))};
LV[0][2]={t:'QUEENS',q:'Place 5 queens ♛: exactly one per row, column and colour region. No two queens may touch, not even diagonally. Tap a cell to place or remove.',a:qOK,h:['Colour C has only a few cells along the left edge.','Region A and C fight for rows 1-3; try a queen at the top-left area first.','One valid answer: (row,col) 1,2 · 2,4 · 3,1 · 4,3 · 5,5 (count from 1).'],
 ui:b=>{const s=new Set(),g=mk('div','qg');for(let r=0;r<5;r++)for(let c=0;c<5;c++)g.append(mk('button','fcell','',e=>{e.style.background=QC[QR[r][c]];e.onclick=()=>{const k=r+','+c;if(s.has(k)){s.delete(k);e.textContent=''}else{s.add(k);e.textContent='♛'}SFX.click()}}));b.append(g);return()=>[...s].join(';')}};
// CIPHER 3 - Wordle-style
LV[1][2]={t:'WORD.EXE',q:'Guess the 5-letter hidden word in 6 tries. 🟩 right spot · 🟨 wrong spot · ⬛ not in word. Clue: the smallest dot of a screen image.',a:'OK',h:['Starts with P.','It ends with a letter that is also in "level".','P _ X _ L'],
 ui:(b,go)=>{const T='PIXEL',w=mk('div','wd');let row=0;const cells=[];for(let i=0;i<30;i++){const c=mk('span','wc','');cells.push(c);w.append(c)}
  const i=mk('input');i.maxLength=5;i.placeholder='5 LETTERS';const gb=mk('button','btn','GUESS');
  const run=()=>{const g=i.value.toUpperCase();if(!/^[A-Z]{5}$/.test(g)){toast('NEED 5 LETTERS');return}const left=[...T];const col=[...g].map((c,k)=>c===T[k]?(left[k]=0,'#2e9e3a'):'');[...g].forEach((c,k)=>{if(!col[k]){const j=left.indexOf(c);col[k]=j>=0?(left[j]=0,'#b59a00'):'#333'}});
   [...g].forEach((c,k)=>{const e=cells[row*5+k];e.textContent=c;e.style.background=col[k]});i.value='';row++;tone(400+row*60,.1,'triangle');
   if(g===T)go('OK');else if(row>=6){go('NO');toast('OUT OF TRIES - BOARD RESET');row=0;cells.forEach(e=>{e.textContent='';e.style.background=''})}};
  gb.onclick=run;i.onkeydown=e=>{if(e.key==='Enter')run()};b.append(w,i,gb);return()=>''}};
// CIPHER 4 - Crossclimb word ladder
LV[1][3]={t:'CROSSCLIMB',q:'Climb from COLD to WARM. Each word changes exactly one letter from the previous one. Solve the clues to fill the ladder.',a:'CORDCARDWARD',h:['COLD → ? changes one letter: the L.','Rope or string: CORD. Playing ___: CARD.','Hospital room: WARD, then D→M gives WARM.'],
 ui:b=>{const L=mk('div','lad');L.append(mk('div','rung','C O L D'));const ins=[['Rope or cable'],['Playing ___ / ID ___'],['Hospital room']].map(([t])=>{const r=mk('div','rung'),i=mk('input');i.maxLength=4;i.placeholder='????';r.append(i,mk('small',' ','  '+t));L.append(r);return i});L.append(mk('div','rung','W A R M'));b.append(L);return()=>ins.map(i=>i.value).join('')}};

/* ===== ZIP + PATCHES (replace Logic 4 and Logic 5) ===== */
// LOGIC 4 - PATCHES: split the grid into rectangles; each holds exactly one number equal to its area
const PCL={'0,1':4,'2,3':6,'2,4':4,'3,0':6,'4,2':4,'4,4':1};
const pOK=v=>{if(!v)return false;let tot=0;return v.split(';').map(s=>s.split(',').map(Number)).every(([a,b,x,y])=>{const ar=(x-a+1)*(y-b+1);tot+=ar;const cl=Object.entries(PCL).filter(([k])=>{const[r,c]=k.split(',').map(Number);return r>=a&&r<=x&&c>=b&&c<=y});return cl.length===1&&cl[0][1]===ar})&&tot===25};
LV[0][3]={t:'PATCHES',q:'Divide the grid into rectangular patches. Each patch must contain exactly ONE number, and that number is the patch\'s area. Every cell must belong to a patch. Tap two opposite corners to make a patch; tap inside a patch to remove it.',a:pOK,
 h:['Start with the 1: it is a patch of a single cell (bottom-right).','The 4 on the right edge can only be a 4×1 strip going up the right column.','Patches: top-left 2×2, a 3×2 block under it on the left bottom, 2×2 bottom-middle, 3×2 block upper-middle, the strip, and the lone 1.'],
 ui:b=>{const rs=[];let an=null;const cells=[],g=mk('div','qg');
  const hit=(r,c)=>rs.findIndex(([a,b,x,y])=>r>=a&&r<=x&&c>=b&&c<=y);
  const paint=()=>cells.forEach((e,i)=>{const r=Math.floor(i/5),c=i%5,k=hit(r,c);e.style.background=k>=0?`hsl(${k*67+170} 90% 40% / .6)`:'';e.style.outline=an&&an[0]===r&&an[1]===c?'3px solid var(--y)':''});
  for(let r=0;r<5;r++)for(let c=0;c<5;c++){const e=mk('button','fcell',PCL[r+','+c]||'');e.style.color='#fff';e.onclick=()=>{SFX.click();const k=hit(r,c);if(k>=0){rs.splice(k,1);an=null;return paint()}
   if(!an){an=[r,c];return paint()}const a=Math.min(an[0],r),bb=Math.min(an[1],c),x=Math.max(an[0],r),y=Math.max(an[1],c);an=null;
   if(rs.some(([p,q,s,t])=>!(x<p||a>s||y<q||bb>t)))toast('PATCHES CANNOT OVERLAP');else{rs.push([a,bb,x,y]);burst(e.getBoundingClientRect().x+25,e.getBoundingClientRect().y+25,8)}paint()};cells.push(e);g.append(e)}
  b.append(g);return()=>rs.map(r=>r.join(',')).join(';')}};
// LOGIC 5 - ZIP: one continuous path through every cell, passing numbers in order
const Z={'0,0':1,'1,3':2,'2,2':3,'3,1':4,'4,4':5};
const zOK=v=>{if(!v)return false;const p=v.split(',').map(Number);if(p.length!==25||new Set(p).size!==25)return false;const n=p.map(i=>Z[Math.floor(i/5)+','+i%5]).filter(Boolean);return n.join('')==='12345'&&Z[Math.floor(p[24]/5)+','+p[24]%5]===5};
LV[0][4]={t:'ZIP',q:'Draw ONE continuous path starting at 1 that passes through the numbers in order (1→5) and fills EVERY cell. Tap or drag across neighbouring cells; go back over your path to undo.',a:zOK,
 h:['Every cell must be filled, so avoid leaving dead-end pockets.','Both start (1) and end (5) are in opposite corners: think of a snake.','Snake it: row 1 left→right, row 2 right→left, row 3 left→right, row 4 right→left, row 5 left→right.'],
 ui:b=>{const p=[],cells=[],g=mk('div','qg zg');
  const paint=()=>cells.forEach((e,i)=>{const k=p.indexOf(i);e.style.background=k>=0?`hsl(${150+k*9} 100% 42% / .75)`:'';e.style.boxShadow=k===p.length-1?'0 0 14px var(--y)':''});
  const step=(i,drag)=>{const r=Math.floor(i/5),c=i%5,L=p[p.length-1],n=Z[r+','+c];
   if(p.includes(i)){if(drag&&i!==p[p.length-2])return;if(i===L)p.pop();else p.length=p.indexOf(i)+1;return paint()}
   if(!p.length){if(n!==1)return toast('START AT 1')}else if(Math.abs(Math.floor(L/5)-r)+Math.abs(L%5-c)!==1)return;
   if(n&&n!==p.filter(x=>Z[Math.floor(x/5)+','+x%5]).length+1)return toast('NUMBERS MUST BE IN ORDER');
   p.push(i);tone(280+p.length*30,.06,'triangle');paint()};
  for(let i=0;i<25;i++){const e=mk('button','fcell',Z[Math.floor(i/5)+','+i%5]||'');e.style.color='#fff';e._z=i;e.onpointerdown=ev=>{ev.preventDefault();step(i)};cells.push(e);g.append(e)}
  g.onpointermove=ev=>{if(ev.buttons!==1)return;const el=document.elementFromPoint(ev.clientX,ev.clientY);if(el&&el._z!==undefined)step(el._z,true)};
  b.append(g);return()=>p.join(',')}};
