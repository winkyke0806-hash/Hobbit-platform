import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push, remove, off } from "firebase/database";

const FB={apiKey:"AIzaSyDFvUaUSu_UxF4gkooovxtX-bLq1rRaI2E",authDomain:"hobbit-projekt.firebaseapp.com",projectId:"hobbit-projekt",databaseURL:"https://hobbit-projekt-default-rtdb.europe-west1.firebasedatabase.app"};
const _app=getApps().length?getApps()[0]:initializeApp(FB);
const db=getDatabase(_app);
window.__fbDB={getDatabase:()=>db,ref,set,get,onValue,update,push,remove,off};

// ─── CSS ────────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--gold:#C9A84C;--gold2:#FFD700;--bg:#050302;--border:rgba(201,168,76,.13);--text:#EDE8E0;--muted:rgba(237,232,224,.5);--dim:rgba(237,232,224,.25)}
@keyframes gP{0%,100%{text-shadow:0 0 20px rgba(201,168,76,.5),0 0 40px rgba(201,168,76,.25)}50%{text-shadow:0 0 55px rgba(201,168,76,1),0 0 110px rgba(201,168,76,.6)}}
@keyframes sU{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes zI{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes rp{0%{transform:scale(1);opacity:.9}100%{transform:scale(4);opacity:0}}
@keyframes tF{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes dF{to{stroke-dashoffset:-14}}
@keyframes sP{0%,100%{opacity:.5;transform:scaleX(1)}50%{opacity:1;transform:scaleX(1.07)}}
@keyframes fg{0%{transform:translateX(-7%)}50%{transform:translateX(4%)}100%{transform:translateX(-7%)}}
@keyframes sb{0%,100%{opacity:.12}50%{opacity:.95}}
@keyframes wB{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.1) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes aG{0%,100%{box-shadow:0 0 10px rgba(201,168,76,.2)}50%{box-shadow:0 0 30px rgba(201,168,76,.6),0 0 60px rgba(201,168,76,.2)}}
@keyframes sk{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes mv{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
@keyframes popIn{0%{transform:scale(0.5);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.btn{position:relative;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;outline:none}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent);transform:translateX(-110%);transition:transform .4s}
.btn:hover::after{transform:translateX(110%)}
.btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(201,168,76,.32)!important}
.btn:active{transform:translateY(0)!important}
.sc::-webkit-scrollbar{width:3px}.sc::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:2px}
.sc::-webkit-scrollbar-track{background:rgba(0,0,0,.2)}
`;

// ─── DATA ────────────────────────────────────────────────────────────────────────
const RACES=[
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E",rgb:"107,140,62",name:"Hobbit"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D",rgb:"160,82,45", name:"Törpe"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B",rgb:"58,122,139",name:"Tünde"},
  {id:"human", icon:"⚔️", color:"#8B7355",rgb:"139,115,85",name:"Ember"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB",rgb:"122,74,187",name:"Varázsló"},
];
const raceOf=id=>RACES.find(r=>r.id===id)||RACES[3];
const genId=()=>Math.random().toString(36).slice(2,8).toUpperCase();

// 44 mező (0..44), elrendezés: bal-lent → jobb-fent → jobb-lent → bal-lent kanyaros
// viewBox: 0 0 120 90
const FIELDS=[
  {id:0,  n:"Zsákos-domb",        e:"🏡",t:"start",   x:10, y:82},
  {id:1,  n:"Hobbitnori ösvény",  e:"🌿",t:"normal",  x:18, y:78},
  {id:2,  n:"Bywater fogadó",     e:"🍺",t:"bonus",   x:26, y:74},
  {id:3,  n:"Bree kapuja",        e:"🚪",t:"normal",  x:34, y:70},
  {id:4,  n:"Pusztai fogadó",     e:"🌙",t:"quiz",    x:42, y:66},
  {id:5,  n:"Veszélyes ösvény",   e:"⚠️",t:"trap",    x:50, y:62},
  {id:6,  n:"Trollok völgye",     e:"👹",t:"minigame",x:58, y:58},
  {id:7,  n:"Troll barlang",      e:"💀",t:"trap",    x:64, y:53},
  {id:8,  n:"Völgyzugoly",        e:"🏔️",t:"bonus",   x:68, y:47},
  {id:9,  n:"Ködös Hegy lába",    e:"❄️",t:"normal",  x:71, y:41},
  {id:10, n:"Goblin alagút",      e:"👺",t:"minigame",x:74, y:35},
  {id:11, n:"Gollam barlangja",   e:"💍",t:"gollam",  x:77, y:29},
  {id:12, n:"Napfény kapuja",     e:"☀️",t:"bonus",   x:81, y:23},
  {id:13, n:"Beorn háza",         e:"🐻",t:"bonus",   x:86, y:18},
  {id:14, n:"Bakacsinerdő bejárat",e:"🌑",t:"normal", x:91, y:15},
  {id:15, n:"Bakacsinerdő",       e:"🕸️",t:"trap",    x:97, y:14},
  {id:16, n:"Pókkirálynő",        e:"🕷️",t:"minigame",x:103,y:15},
  {id:17, n:"Thranduil erdeje",   e:"🧝",t:"quiz",    x:108,y:18},
  {id:18, n:"Tündekirály börtöne",e:"🔒",t:"trap",    x:111,y:23},
  {id:19, n:"Hordók a folyón",    e:"🛶",t:"minigame",x:112,y:29},
  {id:20, n:"Tóváros",            e:"🏙️",t:"bonus",   x:111,y:35},
  {id:21, n:"Tóváros piac",       e:"⛵",t:"normal",  x:108,y:41},
  {id:22, n:"Magányos hegy lába", e:"🏔️",t:"normal",  x:104,y:47},
  {id:23, n:"Sárkány szele",      e:"💨",t:"trap",    x:100,y:52},
  {id:24, n:"Smaug tüze",         e:"🔥",t:"smaug",   x:96, y:57},
  {id:25, n:"Titkos átjáró",      e:"🗝️",t:"bonus",   x:91, y:61},
  {id:26, n:"Öt Sereg Csatája",   e:"⚔️",t:"minigame",x:85, y:65},
  {id:27, n:"Erebor kapuja",      e:"🏰",t:"quiz",    x:79, y:68},
  {id:28, n:"Kincseskamra",       e:"💎",t:"bonus",   x:73, y:70},
  {id:29, n:"Arkenköves trón",    e:"👑",t:"quiz",    x:67, y:71},
  {id:30, n:"Törpe bányák",       e:"⛏️",t:"normal",  x:61, y:72},
  {id:31, n:"Smaug kincse",       e:"🪙",t:"bonus",   x:55, y:73},
  {id:32, n:"Bard nyila",         e:"🏹",t:"quiz",    x:49, y:74},
  {id:33, n:"Hollók sziklája",    e:"🐦",t:"normal",  x:43, y:75},
  {id:34, n:"Durin kapuja",       e:"🚪",t:"minigame",x:37, y:76},
  {id:35, n:"Mithril ér",         e:"✨",t:"bonus",   x:31, y:77},
  {id:36, n:"Goblin város",       e:"🏚️",t:"trap",    x:25, y:78},
  {id:37, n:"Sasok fészke",       e:"🦅",t:"bonus",   x:19, y:79},
  {id:38, n:"Carrock sziklája",   e:"🪨",t:"quiz",    x:14, y:77},
  {id:39, n:"Erdei folyó",        e:"🌊",t:"normal",  x:10, y:74},
  {id:40, n:"Nagy tó",            e:"🏞️",t:"normal",  x:8,  y:70},
  {id:41, n:"Tünde csarnokok",    e:"🌟",t:"bonus",   x:7,  y:66},
  {id:42, n:"Vad mezők",          e:"🌲",t:"normal",  x:7,  y:61},
  {id:43, n:"Utolsó állomás",     e:"🌅",t:"quiz",    x:8,  y:56},
  {id:44, n:"EREBOR",             e:"🏆",t:"finish",  x:10, y:51},
];

const FC={start:"#1e4d08",finish:"#6b4400",bonus:"#083048",trap:"#4d0000",quiz:"#1e0d50",minigame:"#4a1c00",gollam:"#0a0518",smaug:"#500000",normal:"#141009"};
const FS={start:"#7BC34A",finish:"#FFD700",bonus:"#4DADE2",trap:"#E74C3C",quiz:"#9B69BD",minigame:"#E67E22",gollam:"#8844AD",smaug:"#FF5252",normal:"#6a5030"};
const FR={start:3.8,finish:4.2,bonus:3.1,trap:2.9,quiz:3.1,minigame:3.1,gollam:3.3,smaug:3.8,normal:2.5};

const QS=[
  {q:"Ki volt Bilbo a trolloknak?",o:["Varázsló","Betörő","Hobbit","Kém"],a:1},
  {q:"Hány törpe volt Thorinnal?",o:["10","11","12","13"],a:3},
  {q:"Mi volt Bilbo kardjának neve?",o:["Szúró","Fullánk","Marás","Nyílás"],a:1},
  {q:"Ki ölte meg Smaug sárkányt?",o:["Thorin","Bilbo","Bard","Gandalf"],a:2},
  {q:"Mi volt Gollam valódi neve?",o:["Déagol","Sméagol","Goblin","Mordok"],a:1},
  {q:"Hol találta Bilbo a Gyűrűt?",o:["Troll barlang","Goblin alagút","Bakacsinerdő","Tóváros"],a:1},
  {q:"Ki volt a Tündekirály?",o:["Elrond","Legolas","Thranduil","Círdan"],a:2},
  {q:"Mi volt az Arkenstone?",o:["Gyűrű","Törpék köve","Smaug szíve","Varázslat"],a:1},
  {q:"Hány évig élt Bilbo?",o:["111","120","100","131"],a:0},
  {q:"Bard melyik városból lőtte Smaugot?",o:["Völgyzugoly","Tündeváros","Tóváros","Dale"],a:2},
  {q:"Ki volt Thorin apja?",o:["Dáin","Thráin","Glóin","Balin"],a:1},
  {q:"Milyen állat volt Beorn?",o:["Farkas","Sas","Medve","Oroszlán"],a:2},
];
const RS=[
  {q:"Nincs hangom, de megszólalok. Mi vagyok?",o:["szél","visszhang","kő","víz"],a:1},
  {q:"Minél többet veszel, annál több marad.",o:["lyuk","kincs","arány","levegő"],a:0},
  {q:"Fogak vannak, de nem harap.",o:["fésű","kő","fal","csont"],a:0},
  {q:"Vízben születtem, ha megiszom meghalok.",o:["hal","só","jég","kő"],a:1},
];
const RN=[{r:"ᚠ",n:"Feoh",a:"F"},{r:"ᚢ",n:"Ur",a:"U"},{r:"ᚦ",n:"Thorn",a:"TH"},{r:"ᚨ",n:"Ansuz",a:"A"},{r:"ᚱ",n:"Raido",a:"R"}];
const PC=[{id:"shield",i:"🛡️",n:"Pajzs",d:"Csapda hatástalan"},{id:"speed",i:"💨",n:"Szélroham",d:"+3 lépés"},{id:"wisdom",i:"📜",n:"Gandalf",d:"Kvíz tipp"},{id:"portal",i:"✨",n:"Kapu",d:"+5 mező"},{id:"freeze",i:"❄️",n:"Jégbűvölet",d:"Ellenfél kimarad"}];
const EMOTES=["👍","😄","😱","🤔","🎉","💀","🔥","❄️","🧙","⚔️","💍","🐉"];

// ─── 3D DICE ─────────────────────────────────────────────────────────────────────
const PIPS=[[[.5,.5]],[[.25,.25],[.75,.75]],[[.25,.25],[.5,.5],[.75,.75]],
  [[.25,.25],[.75,.25],[.25,.75],[.75,.75]],
  [[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],
  [[.25,.25],[.75,.25],[.25,.5],[.75,.5],[.25,.75],[.75,.75]]];
const V3=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const DF=[{v:[0,1,2,3],n:[0,0,-1],pi:0},{v:[4,5,6,7],n:[0,0,1],pi:5},{v:[0,4,7,3],n:[-1,0,0],pi:3},{v:[1,5,6,2],n:[1,0,0],pi:2},{v:[0,1,5,4],n:[0,-1,0],pi:1},{v:[3,2,6,7],n:[0,1,0],pi:4}];
const TG={1:{x:0,y:Math.PI},2:{x:-Math.PI/2,y:0},3:{x:0,y:Math.PI/2},4:{x:0,y:-Math.PI/2},5:{x:Math.PI/2,y:0},6:{x:0,y:0}};
const rX=(v,a)=>[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];
const rY=(v,a)=>[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];
const rZ=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];
const d3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

function Dice3D({value=1,rolling=false,size=52}){
  const cvs=useRef(null);const raf=useRef(null);
  const ang=useRef({x:.6,y:.4,z:0});const vel=useRef({x:.18,y:.22,z:.08});const done=useRef(false);
  useEffect(()=>{
    const c=cvs.current;if(!c)return;
    const ctx=c.getContext("2d");const dp=Math.min(window.devicePixelRatio||1,2);
    const S=size*dp;c.width=S;c.height=S;
    const proj=v=>{const z=v[2]+4.4;const fov=S*.31;return[v[0]/z*fov+S/2,v[1]/z*fov+S/2]};
    done.current=false;
    if(rolling){vel.current={x:.14+Math.random()*.1,y:.18+Math.random()*.12,z:.06+Math.random()*.08};}
    function frame(){
      ctx.clearRect(0,0,S,S);
      const {x,y,z}=ang.current;
      const tv=V3.map(v=>{let u=rX(v,x);u=rY(u,y);return rZ(u,z)});
      [...DF].map(f=>({...f,cz:f.v.reduce((a,i)=>a+tv[i][2],0)/4})).sort((a,b)=>a.cz-b.cz).forEach(face=>{
        const pts=face.v.map(i=>proj(tv[i]));
        const tn=rX(rY(face.n,y),x);if(tn[2]<-.04)return;
        const br=Math.max(.3,d3(tn,[.25,-.65,.75])*.72+.32);
        const r2=~~(38+br*170),g2=~~(28+br*128),b2=~~(16+br*65);
        ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();
        const gd=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
        gd.addColorStop(0,`rgb(${Math.min(255,r2+50)},${Math.min(255,g2+38)},${Math.min(255,b2+18)})`);
        gd.addColorStop(1,`rgb(${r2},${g2},${b2})`);
        ctx.fillStyle=gd;ctx.fill();
        ctx.strokeStyle=`rgba(201,168,76,${.38*br})`;ctx.lineWidth=(S/72);ctx.stroke();
        if(tn[2]>.22){
          const pips2=PIPS[face.pi]||[];const [p0,p1,p2,p3]=pts;
          pips2.forEach(([u,v2])=>{
            const t1=[p0[0]+(p1[0]-p0[0])*u,p0[1]+(p1[1]-p0[1])*u];
            const t2=[p3[0]+(p2[0]-p3[0])*u,p3[1]+(p2[1]-p3[1])*u];
            const px=t1[0]+(t2[0]-t1[0])*v2,py=t1[1]+(t2[1]-t1[1])*v2,pr=3.8*(S/72)*br;
            ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fillStyle=`rgba(255,228,140,${.9*br})`;ctx.fill();
            ctx.beginPath();ctx.arc(px-pr*.28,py-pr*.28,pr*.4,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${.5*br})`;ctx.fill();
          });
        }
      });
      if(rolling){
        const g=ctx.createRadialGradient(S/2,S/2,S*.25,S/2,S/2,S*.54);
        g.addColorStop(0,"rgba(201,168,76,0)");g.addColorStop(1,"rgba(201,168,76,.28)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(S/2,S/2,S*.54,0,Math.PI*2);ctx.fill();
      }
      if(rolling){ang.current.x+=vel.current.x;ang.current.y+=vel.current.y;ang.current.z+=vel.current.z;vel.current.x*=.997;vel.current.y*=.997;vel.current.z*=.997;}
      else if(!done.current&&value){
        const t=TG[value]||{x:0,y:0};ang.current.x+=(t.x-ang.current.x)*.13;ang.current.y+=(t.y-ang.current.y)*.13;
        if(Math.abs(t.x-ang.current.x)<.006){done.current=true;ang.current.x=t.x;ang.current.y=t.y;}
      }
      raf.current=requestAnimationFrame(frame);
    }
    raf.current=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(raf.current);
  },[value,rolling,size]);
  return <canvas ref={cvs} style={{width:size,height:size,display:"block",filter:rolling?"drop-shadow(0 0 14px rgba(201,168,76,.8))":"drop-shadow(0 0 4px rgba(0,0,0,.9))"}}/>;
}

// ─── PARTICLES ──────────────────────────────────────────────────────────────────
function Burst({x,y,color="#C9A84C",onDone}){
  const [pts]=useState(()=>Array.from({length:32},(_,i)=>{
    const a=Math.random()*Math.PI*2,s=Math.random()*80+40;
    return{id:i,dx:Math.cos(a)*s,dy:Math.sin(a)*s-45,sz:Math.random()*7+3,dl:Math.random()*.28,
      em:Math.random()>.65?["✨","⭐","💫","🌟"][~~(Math.random()*4)]:null};
  }));
  useEffect(()=>{const t=setTimeout(()=>onDone&&onDone(),1100);return()=>clearTimeout(t)},[]);
  return <div style={{position:"fixed",left:x,top:y,zIndex:700,pointerEvents:"none"}}>
    {pts.map(p=><div key={p.id} style={{position:"absolute",width:p.em?18:p.sz,height:p.em?18:p.sz,
      background:p.em?"transparent":color,borderRadius:"50%",fontSize:p.em?14:0,lineHeight:1,
      display:"flex",alignItems:"center",justifyContent:"center",
      boxShadow:p.em?"none":`0 0 ${p.sz*2}px ${color}88`,
      animation:`sU .9s ${p.dl}s ease-out forwards`,
      transform:`translate(${p.dx}px,${p.dy}px)`,opacity:0}}>{p.em||""}</div>)}
  </div>;
}

// ─── MINI JÁTÉKOK ────────────────────────────────────────────────────────────────
function QuizGame({onResult}){
  const [q]=useState(()=>QS[~~(Math.random()*QS.length)]);
  const [sel,setSel]=useState(null);const [t,setT]=useState(12);const [done,setDone]=useState(false);
  useEffect(()=>{
    if(done)return;
    const iv=setInterval(()=>setT(x=>{if(x<=1){clearInterval(iv);setDone(true);onResult(false,0);return 0;}return x-1;}),1000);
    return()=>clearInterval(iv);
  },[done]);
  const pick=i=>{if(done)return;setSel(i);setDone(true);const ok=i===q.a;setTimeout(()=>onResult(ok,ok?20:0),600);};
  const barC=t<=3?"#E74C3C":t<=6?"#E67E22":"var(--gold)";
  return <div style={{display:"flex",flexDirection:"column",gap:12,animation:"sU .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>⚡ Gyors Kvíz</span>
      <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:barC,animation:t<=3?"sk .3s infinite":""}}>{t}s</span>
    </div>
    <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${t/12*100}%`,background:`linear-gradient(90deg,${barC},#FFD700)`,transition:"width 1s linear",boxShadow:`0 0 10px ${barC}`}}/>
    </div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1.05rem",color:"var(--text)",lineHeight:1.65,padding:"8px 0"}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {q.o.map((o,i)=>{
        let bg="rgba(0,0,0,.32)",bd="rgba(201,168,76,.1)",tc="var(--text)";
        if(done&&i===q.a){bg="rgba(102,187,106,.18)";bd="#66BB6A";tc="#66BB6A";}
        else if(done&&sel===i&&i!==q.a){bg="rgba(229,57,53,.15)";bd="#E53935";tc="#EF9A9A";}
        return <button key={i} onClick={()=>pick(i)} className="btn"
          style={{padding:"10px 15px",background:bg,border:`1px solid ${bd}`,color:tc,
            fontFamily:"'EB Garamond',serif",fontSize:"1rem",textAlign:"left",cursor:done?"default":"pointer",transition:"all .18s"}}>
          {done&&i===q.a&&"✓ "}{done&&sel===i&&i!==q.a&&"✗ "}{o}</button>;
      })}
    </div>
  </div>;
}
function GollamGame({onResult}){
  const [q]=useState(()=>RS[~~(Math.random()*RS.length)]);
  const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const pick=i=>{if(done)return;setSel(i);setDone(true);const ok=i===q.a;setTimeout(()=>onResult(ok,ok?28:0),600);};
  return <div style={{display:"flex",flexDirection:"column",gap:12,animation:"sU .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#9B59B6",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Gollam találós kérdése</div>
    <div style={{padding:"16px",background:"rgba(10,5,22,.75)",border:"1px solid rgba(155,89,182,.35)",fontFamily:"'EB Garamond',serif",fontSize:"1rem",fontStyle:"italic",color:"#D7BDE2",lineHeight:1.75}}>
      <span style={{color:"#8E44AD"}}>Gollam:</span> "Találós kérdés! Ha megfejtesz — élhetsz. Ha nem — megeszünk! Gollam!"<br/><br/>
      <strong style={{fontStyle:"normal",color:"var(--text)"}}>{q.q}</strong>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {q.o.map((o,i)=>{let bd="rgba(155,89,182,.22)";if(done&&i===q.a)bd="#66BB6A";else if(done&&sel===i)bd="#E53935";
        return <button key={i} onClick={()=>pick(i)} className="btn"
          style={{padding:"10px 15px",background:"rgba(10,5,22,.4)",border:`1px solid ${bd}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:"1rem",textAlign:"left",cursor:done?"default":"pointer",transition:"border .18s"}}>{o}</button>;
      })}
    </div>
  </div>;
}
function RuneGame({onResult}){
  const [rune]=useState(()=>RN[~~(Math.random()*RN.length)]);
  const [inp,setInp]=useState("");const [done,setDone]=useState(false);
  const check=()=>{if(done)return;const ok=inp.toUpperCase()===rune.a;setDone(true);setTimeout(()=>onResult(ok,ok?32:0),600);};
  return <div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center",animation:"sU .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#4DADE2",letterSpacing:".1em",textTransform:"uppercase",alignSelf:"flex-start"}}>🔮 Rúna felismerés</div>
    <div style={{fontSize:"7rem",lineHeight:1,filter:"drop-shadow(0 0 26px rgba(58,122,139,.9)) drop-shadow(0 0 52px rgba(58,122,139,.4))",userSelect:"none"}}>{rune.r}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".64rem",color:"var(--dim)",textAlign:"center"}}>({rune.n} — melyik betű?)</div>
    <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Betű..." disabled={done}
      style={{background:"rgba(0,0,0,.6)",border:"1px solid rgba(58,122,139,.6)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:"1.6rem",padding:"10px 24px",outline:"none",textAlign:"center",width:150,letterSpacing:".18em"}}/>
    {!done&&<button onClick={check} className="btn" style={{padding:"10px 28px",background:"rgba(58,122,139,.15)",border:"1px solid rgba(58,122,139,.55)",color:"#4DADE2",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".1em",textTransform:"uppercase"}}>Elküld</button>}
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".85rem",color:inp.toUpperCase()===rune.a?"#66BB6A":"#EF9A9A"}}>{inp.toUpperCase()===rune.a?"✓ Helyes!":"✗ Helytelen — "+rune.a}</div>}
  </div>;
}
function SpotRing({onResult}){
  const [pos]=useState(()=>~~(Math.random()*9));const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const icons=["🗡️","🏹","⚔️","🛡️","🔮","🪓","🗺️","🧢","💰"];
  const pick=i=>{if(done)return;setSel(i);setDone(true);const ok=i===pos;setTimeout(()=>onResult(ok,ok?42:0),500);};
  return <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",animation:"sU .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Hol a Gyűrű?</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".9rem",color:"var(--muted)",textAlign:"center",fontStyle:"italic"}}>Egyik tárgy alatt rejtőzik a Gyűrű...</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {icons.map((ic,i)=>{let bd="rgba(201,168,76,.12)",bg="rgba(0,0,0,.32)";if(done&&i===pos){bd="#FFD700";bg="rgba(201,168,76,.2)";}else if(done&&sel===i){bd="#E53935";bg="rgba(229,57,53,.12)";}
        return <button key={i} onClick={()=>pick(i)} className="btn"
          style={{width:66,height:66,fontSize:"1.85rem",background:bg,border:`1px solid ${bd}`,cursor:done?"default":"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:done&&i===pos?"0 0 20px rgba(255,215,0,.4)":"none"}}>
          {done&&i===pos?"💍":ic}</button>;
      })}
    </div>
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:sel===pos?"#66BB6A":"#EF9A9A"}}>{sel===pos?"✓ Megtaláltad!":"✗ Nem ott volt..."}</div>}
  </div>;
}

// ─── EVENT MODAL ─────────────────────────────────────────────────────────────────
function EventModal({field,onResult}){
  const [phase,setPhase]=useState("intro");const [won,setWon]=useState(false);const [pts,setPts]=useState(0);
  const INFO={bonus:{c:"#4DADE2",g:"rgba(77,173,226,.35)",t:"Bónusz!"},trap:{c:"#E74C3C",g:"rgba(231,76,60,.35)",t:"Csapda!"},quiz:{c:"#9B69BD",g:"rgba(155,105,189,.35)",t:"Kvíz!"},minigame:{c:"#E67E22",g:"rgba(230,126,34,.35)",t:"Minijáték!"},gollam:{c:"#8844AD",g:"rgba(136,68,173,.4)",t:"Gollam!"},smaug:{c:"#FF5252",g:"rgba(255,82,82,.4)",t:"SMAUG!"},finish:{c:"#FFD700",g:"rgba(255,215,0,.4)",t:"GYŐZELEM!"}};
  const info=INFO[field.t]||{c:"var(--gold)",g:"rgba(201,168,76,.2)",t:"Mező"};
  const done=(ok,p)=>{setWon(ok);setPts(p);setPhase("result");setTimeout(()=>onResult({ok,pts:p,field}),1200);};
  return <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(2,1,0,.96)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"zI .22s cubic-bezier(.4,0,.2,1)"}}>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 42%,${info.g},transparent 62%)`,pointerEvents:"none"}}/>
    <div style={{width:"100%",maxWidth:430,background:"linear-gradient(170deg,rgba(14,9,5,.99),rgba(4,3,1,.99))",border:`1px solid ${info.c}28`,padding:"26px 22px",display:"flex",flexDirection:"column",gap:16,maxHeight:"86vh",overflowY:"auto",boxShadow:`0 0 80px ${info.g},0 0 160px rgba(0,0,0,.9)`,position:"relative",animation:"sU .3s ease"}}>
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h])=>
        <div key={v+h} style={{position:"absolute",[v]:7,[h]:7,width:13,height:13,borderTop:v==="top"?`1px solid ${info.c}45`:"none",borderBottom:v==="bottom"?`1px solid ${info.c}45`:"none",borderLeft:h==="left"?`1px solid ${info.c}45`:"none",borderRight:h==="right"?`1px solid ${info.c}45`:"none"}}/>)}
      {phase==="intro"&&<>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"3.2rem",marginBottom:8,filter:`drop-shadow(0 0 22px ${info.g})`}}>{field.e}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:info.c,animation:"gP 2s ease infinite"}}>{info.t}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",marginTop:5,letterSpacing:".08em"}}>{field.n}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".93rem",color:"var(--muted)",marginTop:10,fontStyle:"italic",lineHeight:1.7}}>
            {field.t==="smaug"?"Smaug észrevett! Lángjai elérik az ostobákat...":field.t==="finish"?"Elértél Ereborig, kalandor! A törpék kincse a tiéd!":field.t==="trap"?"Csapda! A Középföld nem könyörül a vigyázatlanokra.":field.t==="bonus"?"A szerencse mosolyog rád!":"Kihívás vár — bizonyítsd be bátorságodat!"}
          </div>
        </div>
        {(field.t==="trap"||field.t==="smaug")&&<>
          <div style={{padding:"12px",background:`${info.g.replace(".35",".12")}`,border:`1px solid ${info.c}28`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".72rem",color:info.c}}>
            {field.t==="smaug"?"🔥 Smaug tüze — −30 pont!":"⚠️ Visszalépsz 2 mezőt és kimaradsz egy körből!"}
          </div>
          <button className="btn" onClick={()=>onResult({ok:false,pts:field.t==="smaug"?-30:-5,field})} style={{padding:"12px",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",textTransform:"uppercase"}}>Elfogadom</button>
        </>}
        {field.t==="bonus"&&<>
          <div style={{padding:"12px",background:`${info.g.replace(".35",".12")}`,border:`1px solid ${info.c}35`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".75rem",color:info.c}}>✨ +20 pont!</div>
          <button className="btn" onClick={()=>onResult({ok:true,pts:20,field})} style={{padding:"12px",background:`${info.g.replace(".35",".1")}`,border:`1px solid ${info.c}50`,color:info.c,fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",textTransform:"uppercase"}}>Elfogadom ✓</button>
        </>}
        {field.t==="finish"&&<button className="btn" onClick={()=>onResult({ok:true,pts:100,field,win:true})} style={{padding:"15px",background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.55)",color:"#FFD700",fontFamily:"'Cinzel Decorative',serif",fontSize:".88rem",textShadow:"0 0 24px rgba(255,215,0,.7)",boxShadow:"0 0 40px rgba(255,215,0,.25)"}}>🏆 A KINCS A TIÉD! 🏆</button>}
        {(field.t==="quiz"||field.t==="minigame"||field.t==="gollam")&&<button className="btn" onClick={()=>setPhase("game")} style={{padding:"13px",background:`${info.g.replace(".35",".08")}`,border:`1px solid ${info.c}50`,color:info.c,fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".14em",textTransform:"uppercase",boxShadow:`0 0 22px ${info.g}`}}>⚔️ Kihívás elfogadása</button>}
      </>}
      {phase==="game"&&<>
        {(field.t==="quiz"||[4,17,26,27,29,32,38,43].includes(field.id))&&<QuizGame onResult={done}/>}
        {field.t==="gollam"&&<GollamGame onResult={done}/>}
        {[10,34].includes(field.id)&&<RuneGame onResult={done}/>}
        {field.id===16&&<SpotRing onResult={done}/>}
        {field.t==="minigame"&&![10,16,26,34].includes(field.id)&&<QuizGame onResult={done}/>}
      </>}
      {phase==="result"&&<div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:14,alignItems:"center",animation:"wB .5s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{fontSize:"4rem",filter:`drop-shadow(0 0 32px ${won?"rgba(255,215,0,.7)":"rgba(229,57,53,.6)"})`}}>{won?"🎉":"😔"}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.15rem",color:won?"var(--gold)":"#EF9A9A",animation:"gP 1.5s ease infinite"}}>{won?"Brilliáns!":"Sajnálom..."}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--muted)"}}>Pontok: <span style={{color:"var(--gold)",fontSize:"1.05rem",fontWeight:"bold"}}>{pts>0?"+":""}{pts}</span></div>
      </div>}
    </div>
  </div>;
}

// ─── EPIC BOARD ───────────────────────────────────────────────────────────────────
function EpicBoard({players,myPos,onFieldClick,lastMoved}){
  const pathD=FIELDS.map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" ");
  const travD=myPos>0?FIELDS.slice(0,myPos+1).map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" "):null;
  const Tree=({x,y,s=1,dark=false})=>{const c1=dark?"#091809":"#2a5812",c2=dark?"#051205":"#1e4008";
    return <g transform={`translate(${x},${y}) scale(${s})`}><ellipse cx=".2" cy=".8" rx="1.8" ry=".6" fill="rgba(0,0,0,.4)"/><polygon points="0,-5.5 3,.8 -3,.8" fill={c2} opacity=".72"/><polygon points="0,-4 2.2,.6 -2.2,.6" fill={c1} opacity=".88"/><polygon points="0,-5.5 .6,-4 -.6,-4" fill="rgba(255,255,255,.05)"/><rect x="-.5" y=".8" width="1" height="2" fill="#1a0e06" opacity=".8"/></g>;};
  const Mtn=({x,y,s=1,gold=false})=>{const c=gold?"#6b4a08":"#3a3a5a",sn=gold?"rgba(255,215,0,.38)":"rgba(255,255,255,.35)";
    return <g transform={`translate(${x},${y}) scale(${s})`}><ellipse cx="0" cy=".5" rx="4" ry="1.2" fill="rgba(0,0,0,.35)"/><polygon points="0,-9 5.5,.8 -5.5,.8" fill={c} opacity=".68"/><polygon points="-1.5,-4.5 2.5,.8 -5.5,.8" fill="rgba(0,0,0,.2)"/><polygon points="0,-9 1.4,-5.5 -1.4,-5.5" fill={sn}/></g>;};
  return <svg viewBox="0 0 120 90" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="bG" cx="35%" cy="72%" r="85%"><stop offset="0%" stopColor="#201608"/><stop offset="55%" stopColor="#120d04"/><stop offset="100%" stopColor="#060401"/></radialGradient>
      <radialGradient id="shG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#2a7010" stopOpacity=".55"/><stop offset="100%" stopColor="#2a7010" stopOpacity="0"/></radialGradient>
      <radialGradient id="mkG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#041004" stopOpacity=".92"/><stop offset="100%" stopColor="#041004" stopOpacity="0"/></radialGradient>
      <radialGradient id="lkG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#083060" stopOpacity=".62"/><stop offset="100%" stopColor="#083060" stopOpacity="0"/></radialGradient>
      <radialGradient id="erG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7a5000" stopOpacity=".52"/><stop offset="100%" stopColor="#7a5000" stopOpacity="0"/></radialGradient>
      <radialGradient id="mnG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#252545" stopOpacity=".5"/><stop offset="100%" stopColor="#252545" stopOpacity="0"/></radialGradient>
      <filter id="gw" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="sh"><feDropShadow dx=".3" dy=".6" stdDeviation=".7" floodOpacity=".65"/></filter>
      <filter id="fF" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2" result="b"/><feColorMatrix type="matrix" values="1.2 .4 0 0 0  .3 .08 0 0 0  0 0 0 0 0  0 0 0 1.8 0" in="b" result="fr"/><feMerge><feMergeNode in="fr"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="pF" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.8" result="b"/><feColorMatrix type="matrix" values=".3 0 .6 0 0  0 0 .4 0 0  .6 0 1.2 0 0  0 0 0 1.6 0" in="b" result="pu"/><feMerge><feMergeNode in="pu"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="dotP" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".25" fill="rgba(201,168,76,.05)"/></pattern>
    </defs>
    <rect width="120" height="90" fill="url(#bG)"/>
    <rect width="120" height="90" fill="url(#dotP)"/>
    {/* Stars */}
    {[[6,4],[14,7],[28,3],[44,2],[60,5],[76,3],[90,6],[106,4],[114,11],[112,20],[4,22],[2,42],[4,62],[112,40],[110,62],[55,6],[38,8],[88,9]].map(([sx,sy],i)=>
      <circle key={i} cx={sx} cy={sy} r=".22" fill="rgba(255,245,200,.7)" style={{animation:`sb ${1.4+i*.27}s ${i*.17}s ease-in-out infinite`}}/>)}
    {/* TERRAIN */}
    <ellipse cx="22" cy="79" rx="22" ry="12" fill="url(#shG)"/>
    <ellipse cx="68" cy="43" rx="9" ry="7" fill="rgba(58,122,139,.2)"/>
    <ellipse cx="75" cy="30" rx="12" ry="10" fill="url(#mnG)"/>
    <ellipse cx="97" cy="15" rx="16" ry="10" fill="url(#mkG)"/>
    <path d="M81,10 Q90,6 107,10 Q117,14 112,24 Q104,30 86,25 Q76,20 81,10Z" fill="rgba(3,12,4,.38)"/>
    <ellipse cx="111" cy="31" rx="10" ry="7" fill="url(#lkG)"/>
    <ellipse cx="90" cy="63" rx="22" ry="16" fill="url(#erG)"/>
    {/* Trees */}
    <Tree x="4" y="86" s=".8"/><Tree x="9" y="88" s="1.0"/><Tree x="26" y="81" s=".7"/><Tree x="31" y="83" s=".85"/><Tree x="36" y="78" s=".65"/>
    <Tree x="82" y="8" s=".9" dark/><Tree x="88" y="6" s="1.1" dark/><Tree x="95" y="6" s=".95" dark/><Tree x="101" y="8" s=".85" dark/><Tree x="107" y="11" s=".8" dark/><Tree x="78" y="12" s=".75" dark/>
    <Tree x="79" y="22" s=".65"/><Tree x="83" y="24" s=".6"/>
    {/* Mountains */}
    <Mtn x="65" y="32" s="1.0"/><Mtn x="72" y="26" s="1.2"/><Mtn x="78" y="29" s=".9"/>
    <Mtn x="88" y="55" s="1.6" gold/>
    <ellipse cx="88" cy="53" rx="7" ry="4" fill="rgba(201,168,76,.14)" style={{animation:"sP 3s ease-in-out infinite"}}/>
    <ellipse cx="88" cy="53" rx="3.5" ry="2" fill="rgba(255,215,0,.16)" style={{animation:"sP 2.2s ease-in-out infinite"}}/>
    {/* Water */}
    <ellipse cx="111" cy="31" rx="9" ry="6" fill="rgba(12,50,100,.55)"/>
    <path d="M102,29 Q106,26 111,28 Q116,26 119,29 Q116,34 111,34 Q106,34 102,29Z" fill="rgba(18,72,150,.35)"/>
    {[0,1,2,3].map(i=><line key={i} x1={103+i*3.5} y1={30+i*.4} x2={106+i*3.5} y2={30+i*.4} stroke="rgba(100,185,255,.28)" strokeWidth=".6"/>)}
    <path d="M78,28 Q83,31 88,28 Q93,25 97,28" fill="none" stroke="rgba(80,160,225,.2)" strokeWidth=".8"/>
    {/* Smaug fire */}
    <ellipse cx="96" cy="57" rx="11" ry="5.5" fill="rgba(255,60,0,.07)" style={{animation:"sP 2s ease-in-out infinite"}}/>
    {/* Mirkwood fog */}
    <ellipse cx="97" cy="15" rx="15" ry="9" fill="rgba(3,14,5,.38)" style={{animation:"fg 9s ease-in-out infinite"}} opacity=".7"/>
    <ellipse cx="100" cy="12" rx="10" ry="6" fill="rgba(5,20,8,.3)" style={{animation:"fg 12s 3s ease-in-out infinite"}} opacity=".6"/>
    {/* PATH */}
    <path d={pathD} fill="none" stroke="rgba(0,0,0,.75)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={pathD} fill="none" stroke="#332010" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={pathD} fill="none" stroke="#5a3c18" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3.5,5" opacity=".55"/>
    {travD&&<>
      <path d={travD} fill="none" stroke="rgba(201,168,76,.2)" strokeWidth="3.2" strokeLinecap="round"/>
      <path d={travD} fill="none" stroke="rgba(255,215,0,.65)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2.5,4" style={{animation:"dF 1.2s linear infinite"}}/>
    </>}
    {/* FIELDS */}
    {FIELDS.map(f=>{
      const fill=FC[f.t]||"#141009";const stroke=FS[f.t]||"#6a5030";const r=FR[f.t]||2.5;
      const here=players.filter(p=>p.position===f.id);const isMyPos=myPos===f.id;const spec=f.t!=="normal";
      const justMoved=lastMoved===f.id;
      return <g key={f.id} onClick={()=>onFieldClick(f)} style={{cursor:"pointer"}} filter="url(#sh)">
        {spec&&<circle cx={f.x} cy={f.y} r={r+2.8} fill={stroke} opacity={isMyPos?.2:.07}/>}
        {isMyPos&&<>
          <circle cx={f.x} cy={f.y} r={r+5} fill="none" stroke="rgba(255,215,0,.18)" strokeWidth=".6" style={{animation:"rp 2s ease-out infinite"}}/>
          <circle cx={f.x} cy={f.y} r={r+3} fill="none" stroke="rgba(255,215,0,.36)" strokeWidth=".5" style={{animation:"rp 2s .6s ease-out infinite"}}/>
        </>}
        {justMoved&&<circle cx={f.x} cy={f.y} r={r+3} fill={stroke} opacity=".25" style={{animation:"mv .4s ease-out"}}/>}
        {f.t==="smaug"&&<circle cx={f.x} cy={f.y} r={r+1.5} fill="rgba(255,60,0,.15)" filter="url(#fF)" style={{animation:"sP 1.8s ease-in-out infinite"}}/>}
        {f.t==="gollam"&&<circle cx={f.x} cy={f.y} r={r+1.5} fill="rgba(136,68,173,.15)" filter="url(#pF)" style={{animation:"sP 2.5s ease-in-out infinite"}}/>}
        <circle cx={f.x} cy={f.y} r={r+.7} fill={fill} opacity=".5"/>
        <circle cx={f.x} cy={f.y} r={r} fill={fill} stroke={isMyPos?"#FFD700":stroke} strokeWidth={isMyPos?.8:spec?.45:.25}/>
        <circle cx={f.x-r*.22} cy={f.y-r*.22} r={r*.48} fill="rgba(255,255,255,.07)"/>
        <text x={f.x} y={f.y+.7} textAnchor="middle" dominantBaseline="middle" fontSize={f.t==="start"||f.t==="finish"?"3.2":spec?"2.3":"2.1"}>{f.e}</text>
        {here.map((p,i)=>{
          const rc=raceOf(p.race);const ox=(i-(here.length-1)/2)*3.2;const isMe=p.isMe;
          return <g key={p.name} transform={`translate(${f.x+ox},${f.y-r-2.4})`} style={{animation:isMe?"tF 1.4s ease-in-out infinite":"none"}} filter={isMe?"url(#gw)":"none"}>
            <ellipse cx=".25" cy="1.7" rx="1.1" ry=".45" fill="rgba(0,0,0,.5)"/>
            <circle cx="0" cy="0" r="1.4" fill={rc.color} stroke={isMe?"#FFD700":"rgba(0,0,0,.65)"} strokeWidth={isMe?.45:.22}/>
            <circle cx="-.32" cy="-.32" r=".42" fill="rgba(255,255,255,.28)"/>
            <text x="0" y=".42" textAnchor="middle" dominantBaseline="middle" fontSize="1.05">{rc.icon}</text>
            {isMe&&<circle cx="0" cy="0" r="1.9" fill="none" stroke="rgba(255,215,0,.55)" strokeWidth=".3" style={{animation:"rp 2s ease-out infinite"}}/>}
          </g>;
        })}
      </g>;
    })}
    {/* Labels */}
    {[{id:0,dy:5.5},{id:11,dy:4.5},{id:15,dy:-5},{id:19,dy:4},{id:24,dy:-5},{id:27,dy:4.5},{id:44,dy:-5.5}].map(({id,dy})=>{
      const f=FIELDS[id];const stroke=FS[f.t]||"#6a5030";
      return <text key={id} x={f.x} y={f.y+dy} textAnchor="middle" fontSize="1.5" fill={stroke} fontFamily="Cinzel,serif" fontStyle="italic" opacity=".82">{f.n.split(" ")[0]}</text>;
    })}
    {/* Legend */}
    <g transform="translate(1,1)">
      <rect width="17" height="14" rx="1" fill="rgba(0,0,0,.7)" stroke="rgba(201,168,76,.14)" strokeWidth=".3"/>
      {[["#1e4d08","#7BC34A","Bónusz"],["#4d0000","#E74C3C","Csapda"],["#1e0d50","#9B69BD","Kvíz"],["#4a1c00","#E67E22","Mini"]].map(([f2,s,l],i)=>
        <g key={i} transform={`translate(1.2,${1.8+i*2.8})`}><circle cx="1" cy="0" r=".82" fill={f2} stroke={s} strokeWidth=".28"/><text x="2.7" y=".42" fontSize="1.4" fill="rgba(201,168,76,.55)" fontFamily="Cinzel,serif">{l}</text></g>)}
    </g>
  </svg>;
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────────
function Notif({n}){
  if(!n)return null;
  return <div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:500,padding:"9px 20px",background:"rgba(4,2,1,.98)",border:`1px solid ${n.color}`,fontFamily:"'Cinzel',serif",fontSize:".75rem",color:n.color,letterSpacing:".07em",whiteSpace:"nowrap",pointerEvents:"none",boxShadow:`0 0 22px ${n.color}44`,animation:"sU .2s ease",borderRadius:2}}>{n.msg}</div>;
}

function LobbyScreen({pid,user,friends,invites,onCreateGame,onJoinGame,onAcceptInvite,onDeclineInvite,onInviteFriend,notif}){
  const [code,setCode]=useState("");const race=raceOf(user?.race);
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 30% 40%,rgba(40,28,10,.7),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style><Notif n={notif}/>
    <div style={{width:"100%",maxWidth:520,background:"linear-gradient(180deg,rgba(12,9,5,.98),rgba(6,4,2,.99))",border:"1px solid var(--border)",padding:"32px 28px",display:"flex",flexDirection:"column",gap:18,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9)",animation:"zI .3s ease"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:10,filter:"drop-shadow(0 0 24px rgba(201,168,76,.6))",animation:"gP 2.5s ease infinite"}}>🎲</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,3vw,1.6rem)",color:"var(--gold)",animation:"gP 3s ease infinite"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--dim)",letterSpacing:".18em",textTransform:"uppercase",marginTop:6}}>Online Társasjáték · 2–4 játékos</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".9rem",color:"var(--muted)",fontStyle:"italic",marginTop:10,lineHeight:1.7}}>Zsákos-dombtól Ereborig — kvízek, csapdák, Gollam és Smaug vár!</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",alignSelf:"center",background:`rgba(${race.rgb},.08)`,border:`1px solid rgba(${race.rgb},.28)`,borderRadius:2}}>
        <span style={{fontSize:"1.3rem",filter:`drop-shadow(0 0 10px ${race.color})`}}>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gold)"}}>{pid}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:race.color}}>· {race.name}</span>
      </div>
      {invites.length>0&&<div style={{padding:"12px",background:"rgba(122,74,187,.08)",border:"1px solid rgba(122,74,187,.4)",borderRadius:2,animation:"sU .3s ease"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#B39DDB",letterSpacing:".12em",textTransform:"uppercase",marginBottom:10}}>🎲 Meghívók ({invites.length})</div>
        {invites.map(inv=><div key={inv.from} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(122,74,187,.12)"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)",flex:1}}><span style={{color:"#B39DDB"}}>{inv.from}</span> meghívott!</span>
          <button className="btn" onClick={()=>onAcceptInvite(inv)} style={{padding:"5px 14px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.45)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".58rem",textTransform:"uppercase",borderRadius:2}}>✓ Belép</button>
          <button className="btn" onClick={()=>onDeclineInvite(inv)} style={{padding:"5px 9px",background:"none",border:"1px solid rgba(229,57,53,.22)",color:"rgba(229,57,53,.6)",fontFamily:"'Cinzel',serif",fontSize:".58rem",borderRadius:2}}>✗</button>
        </div>)}
      </div>}
      <button className="btn" onClick={onCreateGame} style={{padding:"14px",background:"linear-gradient(135deg,rgba(201,168,76,.14),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.5)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".82rem",letterSpacing:".15em",textTransform:"uppercase",boxShadow:"0 0 24px rgba(201,168,76,.12)",borderRadius:2}}>✦ Új szoba létrehozása</button>
      <div style={{display:"flex",gap:9}}>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Szoba kód..." maxLength={6}
          style={{flex:1,background:"rgba(0,0,0,.55)",border:"1px solid rgba(201,168,76,.22)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:".88rem",padding:"12px 16px",outline:"none",letterSpacing:".12em",borderRadius:2}}/>
        <button className="btn" onClick={()=>onJoinGame(code)} style={{padding:"12px 20px",background:"rgba(58,122,139,.12)",border:"1px solid rgba(58,122,139,.5)",color:"#4DADE2",fontFamily:"'Cinzel',serif",fontSize:".75rem",textTransform:"uppercase",borderRadius:2}}>Belép</button>
      </div>
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".15em",color:"var(--dim)",textTransform:"uppercase",marginBottom:10}}>— Barátaim ({friends.length}) —</div>
        {friends.map(f=>{const fr=raceOf(f.race);return <div key={f.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.08)",marginBottom:5,borderRadius:2}}>
          <span style={{fontSize:"1.1rem",filter:`drop-shadow(0 0 8px ${fr.color})`}}>{fr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{f.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:fr.color}}>{fr.name} · {f.score||0}pt</div></div>
          <button className="btn" onClick={()=>onInviteFriend(f.name)} style={{padding:"5px 14px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.38)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",textTransform:"uppercase",borderRadius:2}}>🎲 Meghív</button>
        </div>;})}
      </div>}
    </div>
  </div>;
}

function WaitingScreen({gameId,players,gameData,friends,pid,onStart,onInviteFriend,notif}){
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 50% 40%,rgba(30,20,8,.7),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style><Notif n={notif}/>
    <div style={{width:"100%",maxWidth:480,background:"linear-gradient(180deg,rgba(12,9,5,.98),rgba(6,4,2,.99))",border:"1px solid var(--border)",padding:"32px 28px",display:"flex",flexDirection:"column",gap:16,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9)",animation:"zI .3s ease"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:"var(--gold)",animation:"gP 2.5s ease infinite"}}>Váróterem</div>
        <div style={{margin:"14px auto",padding:"16px 28px",background:"linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03))",border:"1px solid rgba(201,168,76,.42)",display:"inline-block",borderRadius:2,boxShadow:"0 0 40px rgba(201,168,76,.12)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--dim)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:6}}>Szoba kód — oszd meg!</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"2rem",color:"var(--gold)",letterSpacing:".3em",textShadow:"0 0 24px rgba(201,168,76,.5)"}}>{gameId}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {players.map(p=>{const pr=raceOf(p.race);return <div key={p.name} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:`rgba(${pr.rgb},.05)`,border:`1px solid rgba(${pr.rgb},.18)`,borderRadius:2,animation:"sU .3s ease"}}>
          <span style={{fontSize:"1.3rem",filter:`drop-shadow(0 0 10px ${pr.color})`}}>{pr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--text)"}}>{p.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}</div></div>
          {p.name===gameData?.host&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gold)",border:"1px solid rgba(201,168,76,.38)",padding:"3px 10px",background:"rgba(201,168,76,.06)"}}>HOST</span>}
        </div>;})}
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--dim)",textAlign:"center"}}>{players.length}/4 játékos</div>
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".12em",color:"var(--dim)",textTransform:"uppercase",marginBottom:9}}>— Barátok meghívása —</div>
        {friends.map(f=>{const fr=raceOf(f.race);return <div key={f.name} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 12px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.08)",marginBottom:5,borderRadius:2}}>
          <span>{fr.icon}</span><span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{f.name}</span>
          <button className="btn" onClick={()=>onInviteFriend(f.name)} style={{padding:"5px 14px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.38)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",textTransform:"uppercase",borderRadius:2}}>🎲 Meghív</button>
        </div>;})}
      </div>}
      {gameData?.host===pid&&<button className="btn" onClick={onStart} style={{padding:"15px",background:"linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.5)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".85rem",letterSpacing:".16em",textTransform:"uppercase",boxShadow:"0 0 28px rgba(201,168,76,.2)",borderRadius:2,marginTop:4}}>▶ Játék Indítása</button>}
    </div>
  </div>;
}

function FinishedScreen({players,gameData,pid,onNewGame}){
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 50% 40%,rgba(100,70,0,.3),rgba(3,2,1,1) 65%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:440,background:"linear-gradient(180deg,rgba(12,9,5,.98),rgba(6,4,2,.99))",border:"1px solid var(--border)",padding:"36px 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:20,borderRadius:3,boxShadow:"0 0 100px rgba(0,0,0,.95)",animation:"zI .35s ease"}}>
      <div style={{fontSize:"5rem",animation:"wB .6s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 40px ${gameData?.winner===pid?"rgba(255,215,0,.8)":"rgba(229,57,53,.6)"})`}}>{gameData?.winner===pid?"🏆":"😔"}</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.5rem",color:"var(--gold)",animation:"gP 2s ease infinite",textAlign:"center"}}>{gameData?.winner===pid?"GYŐZELEM!":"Jó próbálkozás!"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:340}}>
        {players.sort((a,b)=>b.score-a.score).map((p,i)=>{const pr=raceOf(p.race);return <div key={p.name} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:p.isMe?"rgba(201,168,76,.07)":"rgba(255,255,255,.02)",border:`1px solid ${p.isMe?"rgba(201,168,76,.35)":"rgba(201,168,76,.08)"}`,animation:`sU ${.2+i*.1}s ease`,borderRadius:2}}>
          <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".85rem",color:"var(--gold)",minWidth:24}}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
          <span style={{fontSize:"1.1rem",filter:`drop-shadow(0 0 8px ${pr.color})`}}>{pr.icon}</span>
          <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".75rem",color:p.isMe?"var(--gold)":"var(--text)"}}>{p.name}{p.isMe?" (Te)":""}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gold)",fontWeight:"bold"}}>{p.score}pt</span>
        </div>;})}
      </div>
      <button className="btn" onClick={onNewGame} style={{padding:"13px 32px",background:"linear-gradient(135deg,rgba(201,168,76,.14),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.45)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".14em",textTransform:"uppercase",marginTop:8,borderRadius:2}}>✦ Új Játék</button>
    </div>
  </div>;
}

// ─── PLAYING SCREEN ───────────────────────────────────────────────────────────────
function PlayingScreen({gd,pid,user,gameId,onRoll,onEventResult,eventField,rolling,diceVals,bursts,notif}){
  const [chatMsg,setChatMsg]=useState("");const [selField,setSelField]=useState(null);
  const chatRef=useRef(null);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[gd?.chat]);

  const players=Object.values(gd?.players||{}).map(p=>({...p,isMe:p.name===pid}));
  const myData=gd?.players?.[pid];const isMyTurn=gd?.currentTurn===pid;
  const myPos=myData?.position||0;const curField=FIELDS[myPos];
  const [lastMoved,setLastMoved]=useState(null);

  // Track movement for animation
  const prevPos=useRef(myPos);
  useEffect(()=>{
    if(myPos!==prevPos.current){setLastMoved(myPos);prevPos.current=myPos;setTimeout(()=>setLastMoved(null),500);}
  },[myPos]);

  const sendChat=async t=>{
    if(!t?.trim())return;
    await push(ref(db,`games/${gameId}/chat`),{player:pid,race:user?.race||"human",text:t.trim(),time:Date.now()});
    setChatMsg("");
  };

  return <div style={{position:"fixed",inset:0,background:"#050302",display:"flex",overflow:"hidden",zIndex:10}}>
    <style>{CSS}</style>
    {bursts.map(b=><Burst key={b.id} x={b.x} y={b.y} color={b.color} onDone={b.onDone}/>)}
    {eventField&&isMyTurn&&<EventModal field={eventField} onResult={onEventResult}/>}
    <Notif n={notif}/>

    {/* Field tooltip */}
    {selField&&!eventField&&<div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"11px 18px",background:"rgba(4,2,1,.98)",border:`1px solid ${FS[selField.t]||"rgba(201,168,76,.25)"}40`,maxWidth:260,textAlign:"center",animation:"sU .2s ease",boxShadow:"0 10px 40px rgba(0,0,0,.7)",borderRadius:3}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gold)"}}>{selField.e} {selField.n}</div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:".86rem",color:"var(--muted)",fontStyle:"italic",marginTop:4,lineHeight:1.5}}>{selField.t==="trap"?"⚠️ Csapda":selField.t==="bonus"?"✨ Bónusz +20pt":selField.t==="quiz"?"❓ Kvíz kihívás":selField.t==="minigame"?"🎮 Minijáték":selField.t==="gollam"?"💍 Gollam találós":selField.t==="smaug"?"🔥 SMAUG −30pt":"Normál mező"}</div>
      <button onClick={()=>setSelField(null)} style={{marginTop:6,background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:".62rem",fontFamily:"'Cinzel',serif"}}>× bezár</button>
    </div>}

    {/* LEFT PANEL */}
    <div className="sc" style={{width:216,flexShrink:0,display:"flex",flexDirection:"column",background:"linear-gradient(180deg,rgba(10,8,4,.98),rgba(5,4,2,.99))",borderRight:"1px solid var(--border)",overflowY:"auto"}}>
      <div style={{padding:"14px 16px 10px",borderBottom:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".75rem",color:"var(--gold)",letterSpacing:".06em",animation:"gP 3s ease infinite"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>Kör: {gd?.turnCount||0}</div>
      </div>
      {players.map(p=>{
        const pr=raceOf(p.race);const active=gd?.currentTurn===p.name;
        const pDice=diceVals[p.name]||{value:1,rolling:false};
        const cards=(p.cards||[]).map(cid=>PC.find(x=>x.id===cid)).filter(Boolean);
        return <div key={p.name} style={{padding:"13px 14px 11px",borderBottom:"1px solid rgba(201,168,76,.07)",background:active?"rgba(201,168,76,.06)":"transparent",borderLeft:active?"2px solid var(--gold)":"2px solid transparent",transition:"all .25s",position:"relative"}}>
          {active&&<div style={{position:"absolute",top:0,left:2,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
            <span style={{fontSize:"1.1rem",filter:active?`drop-shadow(0 0 10px ${pr.color})`:"none"}}>{pr.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".66rem",color:active?"var(--gold)":"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}{p.isMe?" ★":""}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}{p.skipTurn?" · 💤":""}</div>
            </div>
            <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".7rem",color:"var(--gold)"}}>{p.score}</span>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8,filter:active?"drop-shadow(0 0 12px rgba(201,168,76,.4))":"none"}}>
            <Dice3D value={pDice.value||1} rolling={pDice.rolling||false} size={active?62:46}/>
          </div>
          <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden",marginBottom:cards.length?6:0}}>
            <div style={{height:"100%",width:`${(p.position/44)*100}%`,background:`linear-gradient(90deg,${pr.color},var(--gold))`,borderRadius:2,transition:"width .6s ease"}}/>
          </div>
          {cards.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:4}}>{cards.map((cd,i)=><span key={i} title={`${cd.n}: ${cd.d}`} style={{fontSize:".88rem",cursor:"help"}}>{cd.i}</span>)}</div>}
        </div>;
      })}
    </div>

    {/* CENTER: Board */}
    <div style={{flex:1,position:"relative",overflow:"hidden",minWidth:0}}>
      <EpicBoard players={players} myPos={myPos} onFieldClick={f=>setSelField(f===selField?null:f)} lastMoved={lastMoved}/>
    </div>

    {/* RIGHT PANEL */}
    <div className="sc" style={{width:226,flexShrink:0,display:"flex",flexDirection:"column",background:"linear-gradient(180deg,rgba(10,8,4,.98),rgba(5,4,2,.99))",borderLeft:"1px solid var(--border)",overflowY:"auto"}}>
      {/* Current field */}
      <div style={{padding:"13px 15px",borderBottom:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:7}}>Jelenlegi mező</div>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:"1.8rem",filter:`drop-shadow(0 0 12px ${FS[curField?.t]||"rgba(201,168,76,.3)"})`}}>{curField?.e}</span>
          <div><div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)",lineHeight:1.3}}>{curField?.n}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:FS[curField?.t]||"var(--dim)",textTransform:"uppercase",marginTop:2}}>{curField?.t}</div></div>
        </div>
        <div style={{height:2,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden",marginTop:8}}>
          <div style={{height:"100%",width:`${(myPos/44)*100}%`,background:"linear-gradient(90deg,var(--gold),#FFD700)",borderRadius:2,transition:"width .5s ease"}}/>
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--dim)",marginTop:4,textAlign:"right"}}>{myPos}/44 mező</div>
      </div>

      {/* Turn status */}
      <div style={{padding:"13px 15px",borderBottom:"1px solid var(--border)",background:isMyTurn?"rgba(201,168,76,.05)":"transparent",transition:"background .3s"}}>
        {isMyTurn
          ?<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",letterSpacing:".07em",animation:"gP 2s ease infinite"}}>⚔️ A te köröd!</div>
          :<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--muted)"}}><span style={{color:raceOf(players.find(p=>p.name===gd?.currentTurn)?.race||"human").color}}>{gd?.currentTurn}</span> köre...</div>
        }
      </div>

      {/* ROLL BUTTON */}
      <div style={{padding:"16px 15px",borderBottom:"1px solid var(--border)"}}>
        <button onClick={onRoll} disabled={!isMyTurn||rolling||!!eventField} className="btn"
          style={{width:"100%",padding:"20px 0",background:isMyTurn&&!rolling&&!eventField?"linear-gradient(135deg,rgba(201,168,76,.22),rgba(201,168,76,.08),rgba(201,168,76,.18))":"rgba(0,0,0,.22)",border:`2px solid ${isMyTurn&&!rolling&&!eventField?"rgba(201,168,76,.65)":"rgba(255,255,255,.06)"}`,color:isMyTurn&&!rolling&&!eventField?"var(--gold)":"var(--dim)",fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",letterSpacing:".08em",cursor:isMyTurn&&!rolling&&!eventField?"pointer":"default",boxShadow:isMyTurn&&!rolling&&!eventField?"0 0 36px rgba(201,168,76,.28),0 0 64px rgba(201,168,76,.1)":"none",animation:isMyTurn&&!rolling&&!eventField?"aG 2s ease infinite":"none",borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <span style={{fontSize:"2.2rem"}}>{rolling?"⏳":"🎲"}</span>
          <span>{rolling?"Gurulás...":isMyTurn?"Kocka Dobása":"Várakozás..."}</span>
        </button>
      </div>

      {/* Emotes */}
      <div style={{padding:"10px 14px",borderBottom:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:7}}>Gyors emote</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {EMOTES.map(e=><button key={e} onClick={()=>sendChat(e)} className="btn" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(201,168,76,.1)",fontSize:"1.1rem",width:35,height:35,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:3}}>{e}</button>)}
        </div>
      </div>

      {/* Chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"10px 14px 12px",minHeight:0,gap:8}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase"}}>Chat</div>
        <div ref={chatRef} className="sc" style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,minHeight:60,maxHeight:180}}>
          {Object.values(gd?.chat||{}).slice(-25).map((m,i)=>{const mr=raceOf(m.race);return <div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--muted)",lineHeight:1.35,wordBreak:"break-word"}}><span style={{color:mr.color,fontWeight:"bold"}}>{m.player}: </span>{m.text}</div>;})}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatMsg)} placeholder="Üzenet..."
            style={{flex:1,background:"rgba(0,0,0,.5)",border:"1px solid rgba(201,168,76,.15)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".85rem",padding:"7px 10px",outline:"none",borderRadius:2}}/>
          <button onClick={()=>sendChat(chatMsg)} className="btn" style={{padding:"7px 12px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",borderRadius:2}}>→</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)"}}>
        {[["#7BC34A","Bónusz"],["#E74C3C","Csapda"],["#9B69BD","Kvíz"],["#E67E22","Minijáték"],["#FF5252","Smaug"]].map(([c,l])=>
          <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`,flexShrink:0}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--dim)"}}>{l}</span>
          </div>)}
      </div>
    </div>
  </div>;
}

// ─── CONTROLLER ───────────────────────────────────────────────────────────────────
export default function BoardGame({user}){
  const [screen,setScreenRaw]=useState(()=>localStorage.getItem("hb_screen")||"lobby");
  const [gameId,setGameIdRaw]=useState(()=>localStorage.getItem("hb_gameId")||null);
  const [gd,setGd]=useState(null);
  const [pid]=useState(()=>user?.adventureName||"Kalandor_"+genId());
  const [eventField,setEventField]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [diceVals,setDiceVals]=useState({});
  const [notif,setNotif]=useState(null);
  const [invites,setInvites]=useState([]);
  const [friends,setFriends]=useState([]);
  const [bursts,setBursts]=useState([]);
  const screenRef=useRef(screen);

  const setScreen=s=>{setScreenRaw(s);screenRef.current=s;localStorage.setItem("hb_screen",s);};
  const setGameId=id=>{setGameIdRaw(id);id?localStorage.setItem("hb_gameId",id):localStorage.removeItem("hb_gameId");};
  const notify=(msg,color="var(--gold)",dur=2800)=>{setNotif({msg,color});setTimeout(()=>setNotif(null),dur);};
  const burst=color=>{const id=Date.now()+Math.random();const x=window.innerWidth/2,y=window.innerHeight*.6;setBursts(b=>[...b,{id,x,y,color,onDone:()=>setBursts(b2=>b2.filter(q=>q.id!==id))}]);};

  useEffect(()=>{
    if(!pid)return;
    const fr=ref(db,`users/${pid}/friends`);onValue(fr,s=>setFriends(Object.values(s.val()||{})));
    const ir=ref(db,`users/${pid}/gameInvites`);onValue(ir,s=>setInvites(Object.values(s.val()||{})));
    return()=>{off(ref(db,`users/${pid}/friends`));off(ref(db,`users/${pid}/gameInvites`));};
  },[pid]);

  useEffect(()=>{
    if(!gameId)return;
    const gr=ref(db,`games/${gameId}`);
    onValue(gr,s=>{
      const d=s.val();if(!d)return;
      setGd(d);
      if(d.diceValues)setDiceVals(d.diceValues);
      if(d.status==="playing"&&screenRef.current==="waiting")setScreen("playing");
      if(d.status==="finished"&&screenRef.current==="playing")setScreen("finished");
    });
    return()=>off(ref(db,`games/${gameId}`));
  },[gameId]);

  const newGameData=(id)=>({status:"waiting",host:pid,created:Date.now(),
    players:{[pid]:{name:pid,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},
    currentTurn:pid,turnCount:0,chat:{},winner:null,diceValues:{}});

  const createGame=async()=>{const id=genId();await set(ref(db,`games/${id}`),newGameData(id));setGameId(id);setScreen("waiting");};
  const joinGame=async code=>{
    const id=(code||"").trim().toUpperCase();if(!id){notify("Írd be a kódot!","#EF9A9A");return;}
    const snap=await get(ref(db,`games/${id}`));if(!snap.exists()){notify("Nincs ilyen szoba!","#EF9A9A");return;}
    const d=snap.val();
    if(d.status!=="waiting"){notify("A játék már elkezdődött!","#EF9A9A");return;}
    if(Object.keys(d.players||{}).length>=4){notify("A szoba tele van!","#EF9A9A");return;}
    await update(ref(db,`games/${id}/players/${pid}`),{name:pid,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(id);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };
  const acceptInvite=async inv=>{
    await remove(ref(db,`users/${pid}/gameInvites/${inv.from}`));
    const snap=await get(ref(db,`games/${inv.gameId}`));if(!snap.exists()){notify("Szoba nem létezik!","#EF9A9A");return;}
    await update(ref(db,`games/${inv.gameId}/players/${pid}`),{name:pid,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(inv.gameId);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };
  const inviteFriend=async(friendName,gid)=>{
    let id=gid||gameId;
    if(!id){const newId=genId();await set(ref(db,`games/${newId}`),newGameData(newId));setGameId(newId);setScreen("waiting");id=newId;}
    await set(ref(db,`users/${friendName}/gameInvites/${pid}`),{from:pid,gameId:id,sent:Date.now()});
    notify(`Meghívó elküldve: ${friendName}!`,"#B39DDB",4000);
  };
  const startGame=async()=>{await update(ref(db,`games/${gameId}`),{status:"playing"});setScreen("playing");};

  const rollDice=async()=>{
    if(!gd||gd.currentTurn!==pid||rolling||eventField)return;
    const myData=gd.players?.[pid];
    // Skip turn handling
    if(myData?.skipTurn){
      notify("Kimaradsz ebből a körből! 💤","#EF9A9A");
      const pls=Object.keys(gd.players);const idx=pls.indexOf(pid);
      const next=pls[(idx+1)%pls.length];
      await update(ref(db,`games/${gameId}/players/${pid}`),{skipTurn:false});
      await update(ref(db,`games/${gameId}`),{currentTurn:next,turnCount:(gd.turnCount||0)+1});
      return;
    }
    setRolling(true);
    await update(ref(db,`games/${gameId}/diceValues/${pid}`),{value:0,rolling:true});
    // Animate dice
    let count=0;
    const iv=setInterval(async()=>{
      const v=~~(Math.random()*6)+1;
      setDiceVals(d=>({...d,[pid]:{value:v,rolling:true}}));
      count++;
      if(count>14){
        clearInterval(iv);
        const roll=~~(Math.random()*6)+1;
        const extra=myData?.extraStep||0;
        const total=roll+extra;
        setRolling(false);
        setDiceVals(d=>({...d,[pid]:{value:roll,rolling:false}}));
        // Sync dice to Firebase
        await update(ref(db,`games/${gameId}/diceValues/${pid}`),{value:roll,rolling:false});
        // Move player
        const newPos=Math.min((myData?.position||0)+total,FIELDS.length-1);
        await update(ref(db,`games/${gameId}/players/${pid}`),{position:newPos,extraStep:0});
        const field=FIELDS[newPos];
        burst(FS[field.t]||"#C9A84C");
        notify(`🎲 Dobás: ${roll}${extra>0?` (+${extra})`:""} → ${field.e} ${field.n}`);
        setTimeout(()=>setEventField(field),550);
      }
    },75);
  };

  const handleEvent=async result=>{
    setEventField(null);
    if(!gd)return;
    const myData=gd.players?.[pid];
    let score=Math.max(0,(myData?.score||0)+result.pts);
    const upd={score};
    if(result.pts>0){burst("#66BB6A");notify(`+${result.pts} pont! ✨`,"#66BB6A");}
    else if(result.pts<0){burst("#E74C3C");notify(`${result.pts} pont...`,"#EF9A9A");}

    // Field effects
    if(result.field.t==="trap"){upd.skipTurn=true;upd.position=Math.max(0,(myData?.position||0)-2);}
    if(result.field.id===23)upd.position=Math.max(0,(myData?.position||0)-3);
    if(result.field.id===24){upd.score=Math.max(0,score-30);} // Smaug extra
    if(result.field.id===37){// Sasok fészke bonus
      upd.position=Math.min((myData?.position||0)+5,FIELDS.length-1);
      notify("🦅 Sasok megmentettek! +5 mező!","#3A7A8B");
    }
    // Cards on bonus fields
    if([2,13,19,25,28,31,41].includes(result.field.id)){
      const c=PC[~~(Math.random()*PC.length)];
      upd.cards=[...(myData?.cards||[]),c.id];
      notify(`🃏 ${c.n} kártya!`,"#7A4ABB");
    }
    // Win condition
    if(result.field.id===FIELDS.length-1||result.win){
      await update(ref(db,`games/${gameId}/players/${pid}`),upd);
      await update(ref(db,`games/${gameId}`),{status:"finished",winner:pid});
      burst("#FFD700");setScreen("finished");return;
    }
    await update(ref(db,`games/${gameId}/players/${pid}`),upd);
    // Next player's turn
    const pls=Object.keys(gd.players);const idx=pls.indexOf(pid);
    await update(ref(db,`games/${gameId}`),{currentTurn:pls[(idx+1)%pls.length],turnCount:(gd.turnCount||0)+1});
  };

  const players=Object.values(gd?.players||{}).map(p=>({...p,isMe:p.name===pid}));
  const resetGame=()=>{setScreen("lobby");setGameId(null);setGd(null);localStorage.removeItem("hb_screen");localStorage.removeItem("hb_gameId");};

  if(screen==="lobby")return <LobbyScreen pid={pid} user={user} friends={friends} invites={invites} onCreateGame={createGame} onJoinGame={joinGame} onAcceptInvite={acceptInvite} onDeclineInvite={inv=>remove(ref(db,`users/${pid}/gameInvites/${inv.from}`))} onInviteFriend={inviteFriend} notif={notif}/>;
  if(screen==="waiting")return <WaitingScreen gameId={gameId} players={players} gameData={gd} friends={friends} pid={pid} onStart={startGame} onInviteFriend={n=>inviteFriend(n,gameId)} notif={notif}/>;
  if(screen==="finished")return <FinishedScreen players={players} gameData={gd} pid={pid} onNewGame={resetGame}/>;
  return <PlayingScreen gd={gd} pid={pid} user={user} gameId={gameId} onRoll={rollDice} onEventResult={handleEvent} eventField={eventField} rolling={rolling} diceVals={diceVals} bursts={bursts} notif={notif}/>;
}
