import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push, remove, off } from "firebase/database";

const FB={apiKey:"AIzaSyDFvUaUSu_UxF4gkooovxtX-bLq1rRaI2E",authDomain:"hobbit-projekt.firebaseapp.com",projectId:"hobbit-projekt",databaseURL:"https://hobbit-projekt-default-rtdb.europe-west1.firebasedatabase.app"};
const _app=getApps().length?getApps()[0]:initializeApp(FB);
const db=getDatabase(_app);
window.__fbDB={getDatabase:()=>db,ref,set,get,onValue,update,push,remove,off};

// ═══════════════════════════════ CSS ═══════════════════════════════════════════
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box}
:root{
  --gold:#C9A84C;--gold2:#FFD700;--fire:#FF4500;
  --bg:#050302;--panel:#09070400;
  --border:rgba(201,168,76,.12);--borderHi:rgba(201,168,76,.4);
  --text:#EDE8E0;--muted:rgba(237,232,224,.45);--dim:rgba(237,232,224,.22);
}
@keyframes goldPulse{0%,100%{text-shadow:0 0 20px rgba(201,168,76,.5),0 0 40px rgba(201,168,76,.25)}50%{text-shadow:0 0 50px rgba(201,168,76,1),0 0 100px rgba(201,168,76,.6)}}
@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-90px);opacity:0}}
@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes zoomIn{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes ripple{0%{transform:scale(1);opacity:.9}100%{transform:scale(4);opacity:0}}
@keyframes tokenFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes dashFlow{to{stroke-dashoffset:-14}}
@keyframes smaugPulse{0%,100%{opacity:.5;transform:scaleX(1) scaleY(1)}50%{opacity:.95;transform:scaleX(1.08) scaleY(1.12)}}
@keyframes fogDrift{0%{transform:translateX(-6%)}50%{transform:translateX(4%)}100%{transform:translateX(-6%)}}
@keyframes starBlink{0%,100%{opacity:.1}50%{opacity:.9}}
@keyframes winBlast{0%{transform:scale(0) rotate(-12deg);opacity:0}60%{transform:scale(1.1) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes borderShimmer{0%,100%{border-color:rgba(201,168,76,.15)}50%{border-color:rgba(201,168,76,.5)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes activeGlow{0%,100%{box-shadow:0 0 12px rgba(201,168,76,.2)}50%{box-shadow:0 0 28px rgba(201,168,76,.55),0 0 60px rgba(201,168,76,.2)}}
.btn{position:relative;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent);transform:translateX(-110%);transition:transform .38s}
.btn:hover::after{transform:translateX(110%)}
.btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(201,168,76,.3)!important}
.btn:active{transform:translateY(0)}
.panel{background:linear-gradient(180deg,rgba(12,9,5,.97),rgba(6,4,2,.99));border:1px solid var(--border)}
.scrollbar::-webkit-scrollbar{width:3px}
.scrollbar::-webkit-scrollbar-track{background:rgba(0,0,0,.3)}
.scrollbar::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:2px}
`;

// ═══════════════════════════════ DATA ══════════════════════════════════════════
const RACES=[
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E",rgb:"107,140,62", name:"Hobbit"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D",rgb:"160,82,45",  name:"Törpe"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B",rgb:"58,122,139", name:"Tünde"},
  {id:"human", icon:"⚔️", color:"#8B7355",rgb:"139,115,85", name:"Ember"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB",rgb:"122,74,187", name:"Varázsló"},
];
const raceOf=id=>RACES.find(r=>r.id===id)||RACES[3];
const genId=()=>Math.random().toString(36).slice(2,8).toUpperCase();

// 45 mező, 160×90 viewBox, szép spirálos útvonal
const F=[
  {id:0, n:"Zsákos-domb",        e:"🏡",t:"start",   x:8,  y:80},
  {id:1, n:"Bag End ösvény",     e:"🌿",t:"normal",  x:15, y:76},
  {id:2, n:"Bywater fogadó",     e:"🍺",t:"bonus",   x:22, y:73},
  {id:3, n:"Bree kapuja",        e:"🚪",t:"normal",  x:29, y:70},
  {id:4, n:"Pusztai fogadó",     e:"🌙",t:"quiz",    x:35, y:66},
  {id:5, n:"Veszélyes ösvény",   e:"⚠️",t:"trap",    x:40, y:61},
  {id:6, n:"Trollok völgye",     e:"👹",t:"minigame",x:45, y:56},
  {id:7, n:"Troll barlang",      e:"💀",t:"trap",    x:49, y:51},
  {id:8, n:"Völgyzugoly",        e:"🏔️",t:"bonus",   x:53, y:46},
  {id:9, n:"Ködös Hegy lába",    e:"❄️",t:"normal",  x:57, y:41},
  {id:10,n:"Goblin alagút",      e:"👺",t:"minigame",x:61, y:36},
  {id:11,n:"Gollam barlangja",   e:"💍",t:"gollam",  x:65, y:31},
  {id:12,n:"Napfény kapuja",     e:"☀️",t:"bonus",   x:69, y:27},
  {id:13,n:"Vad mezők",          e:"🌲",t:"normal",  x:73, y:23},
  {id:14,n:"Beorn háza",         e:"🐻",t:"bonus",   x:77, y:20},
  {id:15,n:"Bakacsinerdő széle", e:"🌑",t:"normal",  x:81, y:18},
  {id:16,n:"Bakacsinerdő",       e:"🕸️",t:"trap",    x:85, y:17},
  {id:17,n:"Pókkirálynő",        e:"🕷️",t:"minigame",x:89, y:18},
  {id:18,n:"Thranduil erdeje",   e:"🧝",t:"quiz",    x:93, y:20},
  {id:19,n:"Börtön",             e:"🔒",t:"trap",    x:97, y:23},
  {id:20,n:"Hordók a folyón",    e:"🛶",t:"minigame",x:101,y:27},
  {id:21,n:"Tóváros partja",     e:"⛵",t:"normal",  x:104,y:31},
  {id:22,n:"Tóváros",            e:"🏙️",t:"bonus",   x:106,y:36},
  {id:23,n:"Hegy lába",          e:"🏔️",t:"normal",  x:106,y:41},
  {id:24,n:"Sárkány szele",      e:"💨",t:"trap",    x:104,y:46},
  {id:25,n:"Smaug tüze",         e:"🔥",t:"smaug",   x:101,y:50},
  {id:26,n:"Titkos átjáró",      e:"🗝️",t:"bonus",   x:97, y:54},
  {id:27,n:"Öt Sereg Csatája",   e:"⚔️",t:"minigame",x:93, y:57},
  {id:28,n:"Erebor kapuja",      e:"🏰",t:"quiz",    x:89, y:60},
  {id:29,n:"Kincseskamra",       e:"💎",t:"bonus",   x:85, y:63},
  {id:30,n:"Arkenköves trón",    e:"👑",t:"quiz",    x:81, y:65},
  {id:31,n:"Törpe bányák",       e:"⛏️",t:"normal",  x:77, y:67},
  {id:32,n:"Smaug kincse",       e:"🪙",t:"bonus",   x:73, y:68},
  {id:33,n:"Bard nyila",         e:"🏹",t:"quiz",    x:69, y:69},
  {id:34,n:"Hollók sziklája",    e:"🐦",t:"normal",  x:65, y:70},
  {id:35,n:"Durin kapuja",       e:"🚪",t:"minigame",x:61, y:71},
  {id:36,n:"Mithril ér",         e:"✨",t:"bonus",   x:57, y:72},
  {id:37,n:"Goblin város",       e:"🏚️",t:"trap",    x:53, y:73},
  {id:38,n:"Sasok fészke",       e:"🦅",t:"bonus",   x:49, y:72},
  {id:39,n:"Carrock sziklája",   e:"🪨",t:"quiz",    x:45, y:71},
  {id:40,n:"Erdei folyó",        e:"🌊",t:"normal",  x:40, y:72},
  {id:41,n:"Nagy tó",            e:"🏞️",t:"normal",  x:35, y:73},
  {id:42,n:"Tünde csarnokok",    e:"🌟",t:"bonus",   x:29, y:74},
  {id:43,n:"Utolsó állomás",     e:"🌅",t:"quiz",    x:20, y:76},
  {id:44,n:"EREBOR",             e:"🏆",t:"finish",  x:10, y:78},
];

const FC={start:"#1e4d0a",finish:"#6b4500",bonus:"#0a2e4d",trap:"#4d0000",quiz:"#1e0d50",minigame:"#4d1e00",gollam:"#08051a",smaug:"#500000",normal:"#151009"};
const FS={start:"#7BC34A",finish:"#FFD700",bonus:"#4DADE2",trap:"#E74C3C",quiz:"#9B69BD",minigame:"#E67E22",gollam:"#8844AD",smaug:"#FF5252",normal:"#6a5030"};
const FR={start:3.8,finish:4.2,bonus:3.2,trap:3.0,quiz:3.2,minigame:3.2,gollam:3.4,smaug:3.8,normal:2.6};

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
const RN=[{r:"ᚠ",n:"Feoh",a:"F"},{r:"ᚢ",n:"Ur",a:"U"},{r:"ᚦ",n:"Thorn",a:"TH"},{r:"ᚨ",n:"Ansuz",a:"A"},{r:"ᚱ",n:"Raido",a:"R"},{r:"ᚲ",n:"Kauno",a:"K"}];
const PC=[{id:"shield",i:"🛡️",n:"Pajzs",d:"Csapda hatástalan"},{id:"speed",i:"💨",n:"Szélroham",d:"+3 lépés"},{id:"wisdom",i:"📜",n:"Gandalf",d:"Kvíz segítség"},{id:"portal",i:"✨",n:"Kapu",d:"+5 mező"},{id:"freeze",i:"❄️",n:"Jégbűvölet",d:"Ellenfél kimarad"}];
const EMOTES=["👍","😄","😱","🤔","🎉","💀","🔥","❄️","🧙","⚔️","💍","🐉"];

// ═══════════════════════════ 3D KOCKA ══════════════════════════════════════════
const PIPS=[[[.5,.5]],[[.25,.25],[.75,.75]],[[.25,.25],[.5,.5],[.75,.75]],
  [[.25,.25],[.75,.25],[.25,.75],[.75,.75]],
  [[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],
  [[.25,.25],[.75,.25],[.25,.5],[.75,.5],[.25,.75],[.75,.75]]];
const V3=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const DFACES=[{v:[0,1,2,3],n:[0,0,-1],pi:0},{v:[4,5,6,7],n:[0,0,1],pi:5},{v:[0,4,7,3],n:[-1,0,0],pi:3},{v:[1,5,6,2],n:[1,0,0],pi:2},{v:[0,1,5,4],n:[0,-1,0],pi:1},{v:[3,2,6,7],n:[0,1,0],pi:4}];
const TARG={1:{x:0,y:Math.PI},2:{x:-Math.PI/2,y:0},3:{x:0,y:Math.PI/2},4:{x:0,y:-Math.PI/2},5:{x:Math.PI/2,y:0},6:{x:0,y:0}};
const rX=(v,a)=>[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];
const rY=(v,a)=>[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];
const rZ=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];
const dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

function Dice3D({value=1,rolling=false,size=52}){
  const cvs=useRef(null);const raf=useRef(null);
  const ang=useRef({x:.6,y:.4,z:0});const vel=useRef({x:.18,y:.22,z:.08});
  const done=useRef(false);
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
      const sf=[...DFACES].map(f=>{const cz=f.v.reduce((a,i)=>a+tv[i][2],0)/4;return{...f,cz}}).sort((a,b)=>a.cz-b.cz);
      sf.forEach(face=>{
        const pts=face.v.map(i=>proj(tv[i]));
        const tn=rX(rY(face.n,y),x);
        if(tn[2]<-.04)return;
        const br=Math.max(.3,dot3(tn,[.25,-.65,.75])*.72+.32);
        const r2=~~(38+br*170),g2=~~(28+br*128),b2=~~(16+br*65);
        ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
        pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();
        const gd=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
        gd.addColorStop(0,`rgb(${Math.min(255,r2+48)},${Math.min(255,g2+36)},${Math.min(255,b2+18)})`);
        gd.addColorStop(1,`rgb(${r2},${g2},${b2})`);
        ctx.fillStyle=gd;ctx.fill();
        ctx.strokeStyle=`rgba(201,168,76,${.38*br})`;ctx.lineWidth=(S/72);ctx.stroke();
        if(tn[2]>.22){
          const pips2=PIPS[face.pi]||[];
          const [p0,p1,p2,p3]=pts;
          pips2.forEach(([u,v2])=>{
            const t1=[p0[0]+(p1[0]-p0[0])*u,p0[1]+(p1[1]-p0[1])*u];
            const t2=[p3[0]+(p2[0]-p3[0])*u,p3[1]+(p2[1]-p3[1])*u];
            const px=t1[0]+(t2[0]-t1[0])*v2,py=t1[1]+(t2[1]-t1[1])*v2;
            const pr=3.8*(S/72)*br;
            ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,228,140,${.9*br})`;ctx.fill();
            ctx.beginPath();ctx.arc(px-pr*.28,py-pr*.28,pr*.4,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,255,255,${.5*br})`;ctx.fill();
          });
        }
      });
      if(rolling){
        const g=ctx.createRadialGradient(S/2,S/2,S*.25,S/2,S/2,S*.54);
        g.addColorStop(0,"rgba(201,168,76,0)");g.addColorStop(1,"rgba(201,168,76,.25)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(S/2,S/2,S*.54,0,Math.PI*2);ctx.fill();
      }
      if(rolling){
        ang.current.x+=vel.current.x;ang.current.y+=vel.current.y;ang.current.z+=vel.current.z;
        vel.current.x*=.997;vel.current.y*=.997;vel.current.z*=.997;
      } else if(!done.current&&value){
        const t=TARG[value]||{x:0,y:0};
        ang.current.x+=(t.x-ang.current.x)*.13;ang.current.y+=(t.y-ang.current.y)*.13;
        if(Math.abs(t.x-ang.current.x)<.006){done.current=true;ang.current.x=t.x;ang.current.y=t.y;}
      }
      raf.current=requestAnimationFrame(frame);
    }
    raf.current=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(raf.current);
  },[value,rolling,size]);
  return <canvas ref={cvs} style={{width:size,height:size,display:"block",filter:rolling?"drop-shadow(0 0 14px rgba(201,168,76,.7))":"drop-shadow(0 0 5px rgba(0,0,0,.9))"}}/>;
}

// ═══════════════════════════ PARTICLES ═════════════════════════════════════════
function Burst({x,y,color="#C9A84C",onDone}){
  const [pts]=useState(()=>Array.from({length:36},(_,i)=>{
    const a=Math.random()*Math.PI*2,s=Math.random()*90+45;
    return{id:i,dx:Math.cos(a)*s,dy:Math.sin(a)*s-50,sz:Math.random()*7+3,dl:Math.random()*.3,
      em:Math.random()>.6?["✨","⭐","💫","🌟","🎇"][~~(Math.random()*5)]:null};
  }));
  useEffect(()=>{const t=setTimeout(()=>onDone&&onDone(),1200);return()=>clearTimeout(t)},[]);
  return <div style={{position:"fixed",left:x,top:y,zIndex:700,pointerEvents:"none"}}>
    {pts.map(p=><div key={p.id} style={{position:"absolute",width:p.em?20:p.sz,height:p.em?20:p.sz,
      background:p.em?"transparent":color,borderRadius:"50%",fontSize:p.em?16:0,lineHeight:1,
      display:"flex",alignItems:"center",justifyContent:"center",
      boxShadow:p.em?"none":`0 0 ${p.sz*2}px ${color}88`,
      animation:`floatUp 1s ${p.dl}s ease-out forwards`,
      transform:`translate(${p.dx}px,${p.dy}px)`,opacity:0}}>{p.em||""}</div>)}
  </div>;
}

// ═══════════════════════════ MINI JÁTÉKOK ══════════════════════════════════════
function QuizGame({onResult,hint=false}){
  const [q]=useState(()=>QS[~~(Math.random()*QS.length)]);
  const [sel,setSel]=useState(null);const [t,setT]=useState(12);const [done,setDone]=useState(false);
  useEffect(()=>{
    if(done)return;
    const iv=setInterval(()=>setT(x=>{if(x<=1){clearInterval(iv);setDone(true);onResult(false,0);return 0;}return x-1;}),1000);
    return()=>clearInterval(iv);
  },[done]);
  const pick=i=>{if(done)return;setSel(i);setDone(true);const ok=i===q.a;setTimeout(()=>onResult(ok,ok?20:0),650);};
  const barColor=t<=3?"#E74C3C":t<=6?"#E67E22":"var(--gold)";
  return <div style={{display:"flex",flexDirection:"column",gap:14,animation:"slideUp .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",letterSpacing:".12em",textTransform:"uppercase"}}>⚡ Gyors Kvíz</span>
      <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:barColor,animation:t<=3?"shake .3s infinite":""}}>{t}s</span>
    </div>
    <div style={{height:5,background:"rgba(255,255,255,.06)",borderRadius:4,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${t/12*100}%`,background:`linear-gradient(90deg,${barColor},${t<=3?"#FF7043":"#FFD700"})`,transition:"width 1s linear",borderRadius:4,boxShadow:`0 0 12px ${barColor}`}}/>
    </div>
    {hint&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"#9B69BD",padding:"6px 10px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.25)",borderRadius:2}}>📜 Gandalf súg: <strong style={{color:"var(--text)"}}>{q.o[q.a]}</strong></div>}
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1.08rem",color:"var(--text)",lineHeight:1.65,padding:"8px 0"}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {q.o.map((o,i)=>{
        let bg="rgba(0,0,0,.32)",bd="rgba(201,168,76,.1)",tc="var(--text)";
        if(done&&i===q.a){bg="rgba(102,187,106,.18)";bd="#66BB6A";tc="#66BB6A";}
        else if(done&&sel===i&&i!==q.a){bg="rgba(229,57,53,.15)";bd="#E53935";tc="#EF9A9A";}
        return <button key={i} onClick={()=>pick(i)} className="btn"
          style={{padding:"11px 16px",background:bg,border:`1px solid ${bd}`,color:tc,
            fontFamily:"'EB Garamond',serif",fontSize:"1.02rem",textAlign:"left",
            cursor:done?"default":"pointer",transition:"all .18s",borderRadius:3}}>
          {done&&i===q.a&&"✓ "}{done&&sel===i&&i!==q.a&&"✗ "}{o}
        </button>;
      })}
    </div>
  </div>;
}

function GollamGame({onResult}){
  const [q]=useState(()=>RS[~~(Math.random()*RS.length)]);
  const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const pick=i=>{if(done)return;setSel(i);setDone(true);const ok=i===q.a;setTimeout(()=>onResult(ok,ok?28:0),650);};
  return <div style={{display:"flex",flexDirection:"column",gap:14,animation:"slideUp .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"#9B59B6",letterSpacing:".12em",textTransform:"uppercase"}}>💍 Gollam találós kérdése</div>
    <div style={{padding:"18px",background:"rgba(10,5,22,.75)",border:"1px solid rgba(155,89,182,.35)",
      fontFamily:"'EB Garamond',serif",fontSize:"1.02rem",fontStyle:"italic",color:"#D7BDE2",lineHeight:1.8,
      boxShadow:"inset 0 0 40px rgba(142,68,173,.15)"}}>
      <span style={{color:"#8E44AD"}}>Gollam suttog:</span> "Találós kérdés… Ha megfejtesz — élhetsz. Ha nem — megeszünk! Igen, Gollam!"<br/><br/>
      <strong style={{fontStyle:"normal",color:"var(--text)",fontSize:"1.08em"}}>{q.q}</strong>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {q.o.map((o,i)=>{
        let bd="rgba(155,89,182,.22)";
        if(done&&i===q.a)bd="#66BB6A";else if(done&&sel===i)bd="#E53935";
        return <button key={i} onClick={()=>pick(i)} className="btn"
          style={{padding:"11px 16px",background:"rgba(10,5,22,.45)",border:`1px solid ${bd}`,
            color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:"1.02rem",
            textAlign:"left",cursor:done?"default":"pointer",transition:"border .18s",borderRadius:3}}>{o}</button>;
      })}
    </div>
  </div>;
}

function RuneGame({onResult}){
  const [rune]=useState(()=>RN[~~(Math.random()*RN.length)]);
  const [inp,setInp]=useState("");const [done,setDone]=useState(false);
  const check=()=>{if(done)return;const ok=inp.toUpperCase()===rune.a;setDone(true);setTimeout(()=>onResult(ok,ok?32:0),700);};
  return <div style={{display:"flex",flexDirection:"column",gap:18,alignItems:"center",animation:"slideUp .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"#4DADE2",letterSpacing:".12em",textTransform:"uppercase",alignSelf:"flex-start"}}>🔮 Rúna Felismerés</div>
    <div style={{fontSize:"8rem",lineHeight:1,userSelect:"none",
      filter:"drop-shadow(0 0 28px rgba(58,122,139,.95)) drop-shadow(0 0 56px rgba(58,122,139,.45))"}}>{rune.r}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--muted)",textAlign:"center"}}>({rune.n} — melyik betű?)</div>
    <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()}
      placeholder="Betű..." disabled={done}
      style={{background:"rgba(0,0,0,.6)",border:"1px solid rgba(58,122,139,.6)",color:"var(--text)",
        fontFamily:"'Cinzel',serif",fontSize:"1.8rem",padding:"12px 28px",
        outline:"none",textAlign:"center",width:160,letterSpacing:".2em",borderRadius:2}}/>
    {!done&&<button onClick={check} className="btn" style={{padding:"11px 32px",background:"rgba(58,122,139,.15)",
      border:"1px solid rgba(58,122,139,.55)",color:"#4DADE2",fontFamily:"'Cinzel',serif",
      fontSize:".78rem",letterSpacing:".12em",textTransform:"uppercase",borderRadius:2}}>Elküld</button>}
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".9rem",
      color:inp.toUpperCase()===rune.a?"#66BB6A":"#EF9A9A"}}>
      {inp.toUpperCase()===rune.a?"✓ Helyes!":"✗ Helytelen — a válasz: "+rune.a}</div>}
  </div>;
}

function SpotRing({onResult}){
  const [pos]=useState(()=>~~(Math.random()*9));const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const icons=["🗡️","🏹","⚔️","🛡️","🔮","🪓","🗺️","🧢","💰"];
  const pick=i=>{if(done)return;setSel(i);setDone(true);const ok=i===pos;setTimeout(()=>onResult(ok,ok?42:0),600);};
  return <div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center",animation:"slideUp .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",letterSpacing:".12em",textTransform:"uppercase"}}>💍 Hol a Gyűrű?</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".96rem",color:"var(--muted)",textAlign:"center",fontStyle:"italic"}}>Egyik tárgy alatt rejtőzik...</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
      {icons.map((ic,i)=>{
        let bd="rgba(201,168,76,.12)",bg="rgba(0,0,0,.32)",sh="none";
        if(done&&i===pos){bd="#FFD700";bg="rgba(201,168,76,.22)";sh="0 0 24px rgba(255,215,0,.45)";}
        else if(done&&sel===i){bd="#E53935";bg="rgba(229,57,53,.12)";}
        return <button key={i} onClick={()=>pick(i)} className="btn"
          style={{width:70,height:70,fontSize:"2rem",background:bg,border:`1px solid ${bd}`,
            cursor:done?"default":"pointer",transition:"all .2s",display:"flex",
            alignItems:"center",justifyContent:"center",boxShadow:sh,borderRadius:4}}>
          {done&&i===pos?"💍":ic}
        </button>;
      })}
    </div>
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".85rem",
      color:sel===pos?"#66BB6A":"#EF9A9A"}}>
      {sel===pos?"✓ Megtaláltad!":"✗ Nem ott volt..."}</div>}
  </div>;
}

// ═══════════════════════════ FIELD EVENT MODAL ══════════════════════════════════
function EventModal({field,onResult}){
  const [phase,setPhase]=useState("intro");const [won,setWon]=useState(false);const [pts,setPts]=useState(0);
  const INFO={
    bonus: {c:"#4DADE2",g:"rgba(77,173,226,.35)",t:"Bónusz!"},
    trap:  {c:"#E74C3C",g:"rgba(231,76,60,.35)", t:"Csapda!"},
    quiz:  {c:"#9B69BD",g:"rgba(155,105,189,.35)",t:"Kvíz!"},
    minigame:{c:"#E67E22",g:"rgba(230,126,34,.35)",t:"Minijáték!"},
    gollam:{c:"#8844AD",g:"rgba(136,68,173,.4)", t:"Gollam!"},
    smaug: {c:"#FF5252",g:"rgba(255,82,82,.4)",  t:"SMAUG!"},
    finish:{c:"#FFD700",g:"rgba(255,215,0,.4)",  t:"GYŐZELEM!"},
  };
  const info=INFO[field.t]||{c:"var(--gold)",g:"rgba(201,168,76,.2)",t:"Mező"};
  const done=(ok,p)=>{setWon(ok);setPts(p);setPhase("result");setTimeout(()=>onResult({ok,pts:p,field}),1300);};

  return <div style={{position:"fixed",inset:0,zIndex:600,
    background:"rgba(2,1,0,.96)",display:"flex",alignItems:"center",justifyContent:"center",
    padding:24,animation:"zoomIn .25s cubic-bezier(.4,0,.2,1)"}}>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 42%,${info.g},transparent 62%)`,pointerEvents:"none"}}/>
    <div style={{width:"100%",maxWidth:440,background:"linear-gradient(170deg,rgba(14,9,5,.99),rgba(4,3,1,.99))",
      border:`1px solid ${info.c}30`,padding:"28px 26px",display:"flex",flexDirection:"column",gap:18,
      maxHeight:"88vh",overflowY:"auto",boxShadow:`0 0 80px ${info.g},0 0 160px rgba(0,0,0,.9)`,
      position:"relative",borderRadius:2,animation:"slideUp .3s ease"}}>
      {/* Corner ornaments */}
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h])=>
        <div key={v+h} style={{position:"absolute",[v]:8,[h]:8,width:14,height:14,
          borderTop:v==="top"?`1px solid ${info.c}50`:"none",
          borderBottom:v==="bottom"?`1px solid ${info.c}50`:"none",
          borderLeft:h==="left"?`1px solid ${info.c}50`:"none",
          borderRight:h==="right"?`1px solid ${info.c}50`:"none"}}/>)}

      {phase==="intro"&&<>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"3.5rem",marginBottom:10,filter:`drop-shadow(0 0 24px ${info.g})`}}>{field.e}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.15rem",color:info.c,
            animation:"goldPulse 2s ease infinite"}}>{info.t}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gold)",marginTop:6,letterSpacing:".1em"}}>{field.n}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".96rem",color:"var(--muted)",
            marginTop:12,fontStyle:"italic",lineHeight:1.75}}>
            {field.t==="smaug"?"A tűzokádó észrevett! Lángjai elérik az ostobákat...":
             field.t==="finish"?"Elértél Ereborig, kalandor! A törpék kincse a tiéd!":
             field.t==="trap"?"Csapda! A Középföld nem könyörül a vigyázatlanokra.":
             field.t==="bonus"?"A szerencse mosolyog rád, kalandor!":
             "A kihívás vár. Bizonyítsd be bátorságodat!"}
          </div>
        </div>
        {(field.t==="trap"||field.t==="smaug")&&<>
          <div style={{padding:"13px",background:`rgba(${field.t==="smaug"?"255,82,82":"231,76,60"},.08)`,
            border:`1px solid ${info.c}28`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".75rem",color:info.c}}>
            {field.t==="smaug"?"🔥 Smaug tüze: −30 pont!":"⚠️ Visszalépsz 2 mezőt és kimaradsz egy körből!"}
          </div>
          <button className="btn" onClick={()=>onResult({ok:false,pts:field.t==="smaug"?-30:-5,field})}
            style={{padding:"13px",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.3)",
              color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".78rem",
              letterSpacing:".12em",textTransform:"uppercase",borderRadius:2}}>Elfogadom ✗</button>
        </>}
        {field.t==="bonus"&&<>
          <div style={{padding:"13px",background:`rgba(77,173,226,.1)`,
            border:`1px solid ${info.c}35`,textAlign:"center",fontFamily:"'Cinzel',serif",
            fontSize:".78rem",color:info.c,boxShadow:`inset 0 0 24px rgba(77,173,226,.1)`}}>✨ +20 pont!</div>
          <button className="btn" onClick={()=>onResult({ok:true,pts:20,field})}
            style={{padding:"13px",background:`rgba(77,173,226,.1)`,border:`1px solid ${info.c}50`,
              color:info.c,fontFamily:"'Cinzel',serif",fontSize:".78rem",
              letterSpacing:".12em",textTransform:"uppercase",borderRadius:2}}>Elfogadom ✓</button>
        </>}
        {field.t==="finish"&&<button className="btn" onClick={()=>onResult({ok:true,pts:100,field,win:true})}
          style={{padding:"16px",background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.55)",
            color:"#FFD700",fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",
            textShadow:"0 0 24px rgba(255,215,0,.7)",boxShadow:"0 0 40px rgba(255,215,0,.25)",
            borderRadius:2}}>🏆 A KINCS A TIÉD! 🏆</button>}
        {(field.t==="quiz"||field.t==="minigame"||field.t==="gollam")&&
          <button className="btn" onClick={()=>setPhase("game")}
            style={{padding:"14px",background:`${info.g.replace(".35",".08")}`,
              border:`1px solid ${info.c}50`,color:info.c,
              fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".14em",
              textTransform:"uppercase",boxShadow:`0 0 24px ${info.g}`,borderRadius:2}}>⚔️ Kihívás elfogadása</button>}
      </>}
      {phase==="game"&&<>
        {(field.t==="quiz"||[4,18,27,28,30,33,39,43].includes(field.id))&&<QuizGame onResult={done}/>}
        {field.t==="gollam"&&<GollamGame onResult={done}/>}
        {[10,35].includes(field.id)&&<RuneGame onResult={done}/>}
        {field.id===17&&<SpotRing onResult={done}/>}
        {field.t==="minigame"&&![10,17,27,35].includes(field.id)&&<QuizGame onResult={done}/>}
      </>}
      {phase==="result"&&<div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:16,alignItems:"center",animation:"winBlast .5s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{fontSize:"4.5rem",filter:`drop-shadow(0 0 36px ${won?"rgba(255,215,0,.7)":"rgba(229,57,53,.6)"})`}}>{won?"🎉":"😔"}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",
          color:won?"var(--gold)":"#EF9A9A",animation:"goldPulse 1.5s ease infinite"}}>
          {won?"Brilliáns! Sikeres!":"Sajnálom..."}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".85rem",color:"var(--muted)"}}>
          Pontok: <span style={{color:"var(--gold)",fontSize:"1.1rem",fontWeight:"bold"}}>{pts>0?"+":""}{pts}</span></div>
      </div>}
    </div>
  </div>;
}

// ═══════════════════════════ EPIC BOARD SVG ═════════════════════════════════════
function EpicBoard({players,myPos,onFieldClick}){
  const pathD=F.map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" ");
  const travD=myPos>0?F.slice(0,myPos+1).map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" "):null;

  // SVG helper components
  const Tree=({x,y,s=1,dark=false})=>{
    const c1=dark?"#091809":"#2a5812",c2=dark?"#051205":"#1e4008",tr="#1a0e06";
    return <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx=".2" cy=".8" rx="1.8" ry=".65" fill="rgba(0,0,0,.4)"/>
      <polygon points="0,-5.5 3,0.8 -3,0.8" fill={c2} opacity=".7"/>
      <polygon points="0,-4 2.2,0.6 -2.2,0.6" fill={c1} opacity=".9"/>
      <polygon points="0,-5.5 .6,-4 -.6,-4" fill="rgba(255,255,255,.06)"/>
      <rect x="-.5" y=".8" width="1" height="2" fill={tr} opacity=".85"/>
    </g>;
  };
  const Mtn=({x,y,s=1,gold=false})=>{
    const c=gold?"#6b4a08":"#3a3a5a",sh=gold?"#8b6010":"#4a4a7a",sn=gold?"rgba(255,215,0,.35)":"rgba(255,255,255,.35)";
    return <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="0" cy=".5" rx="4" ry="1.2" fill="rgba(0,0,0,.35)"/>
      <polygon points="0,-9 5.5,0.8 -5.5,0.8" fill={c} opacity=".68"/>
      <polygon points="-1.5,-4.5 2.5,0.8 -5.5,0.8" fill="rgba(0,0,0,.22)"/>
      <polygon points="0,-9 1.4,-5.5 -1.4,-5.5" fill={sn}/>
      <polygon points="-1,-5.5 1,-5.5 0,-3" fill={sh} opacity=".3"/>
    </g>;
  };

  return <svg viewBox="0 0 116 90" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
    <defs>
      {/* Background gradients */}
      <radialGradient id="bgG" cx="38%" cy="68%" r="80%">
        <stop offset="0%" stopColor="#201508"/>
        <stop offset="55%" stopColor="#120d04"/>
        <stop offset="100%" stopColor="#060401"/>
      </radialGradient>
      {/* Region gradients */}
      <radialGradient id="shG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#2a7010" stopOpacity=".5"/><stop offset="100%" stopColor="#2a7010" stopOpacity="0"/></radialGradient>
      <radialGradient id="mkG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#04110a" stopOpacity=".9"/><stop offset="100%" stopColor="#04110a" stopOpacity="0"/></radialGradient>
      <radialGradient id="lkG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#083060" stopOpacity=".6"/><stop offset="100%" stopColor="#083060" stopOpacity="0"/></radialGradient>
      <radialGradient id="erG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7a5000" stopOpacity=".5"/><stop offset="100%" stopColor="#7a5000" stopOpacity="0"/></radialGradient>
      <radialGradient id="mnG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#252540" stopOpacity=".5"/><stop offset="100%" stopColor="#252540" stopOpacity="0"/></radialGradient>
      <radialGradient id="rvG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0a4050" stopOpacity=".5"/><stop offset="100%" stopColor="#0a4050" stopOpacity="0"/></radialGradient>

      {/* Filters */}
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="shadow"><feDropShadow dx=".3" dy=".6" stdDeviation=".8" floodOpacity=".65"/></filter>
      <filter id="fireF" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.2" result="b"/>
        <feColorMatrix type="matrix" values="1.2 .4 0 0 0  .3 .08 0 0 0  0 0 0 0 0  0 0 0 1.8 0" in="b" result="fr"/>
        <feMerge><feMergeNode in="fr"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="purF" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.8" result="b"/>
        <feColorMatrix type="matrix" values=".3 0 .6 0 0  0 0 .4 0 0  .6 0 1.2 0 0  0 0 0 1.6 0" in="b" result="pu"/>
        <feMerge><feMergeNode in="pu"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>

      {/* Patterns */}
      <pattern id="dotP" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r=".28" fill="rgba(201,168,76,.05)"/>
      </pattern>
      <pattern id="grassP" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
        <line x1="1" y1="4" x2="1.8" y2="1.5" stroke="rgba(60,110,25,.12)" strokeWidth=".5"/>
        <line x1="3.5" y1="4" x2="2.8" y2="1.8" stroke="rgba(60,110,25,.09)" strokeWidth=".5"/>
      </pattern>
    </defs>

    {/* BG */}
    <rect width="116" height="90" fill="url(#bgG)"/>
    <rect width="116" height="90" fill="url(#dotP)"/>

    {/* Stars */}
    {[[6,4],[12,8],[22,5],[42,3],[58,6],[72,4],[85,7],[92,12],[90,19],[4,25],[2,45],[5,65],[94,35],[96,55],[88,70],[50,8],[68,3],[110,20]].map(([sx,sy],i)=>
      <circle key={i} cx={sx} cy={sy} r=".22" fill="rgba(255,245,200,.7)" style={{animation:`starBlink ${1.4+i*.28}s ${i*.18}s ease-in-out infinite`}}/>
    )}

    {/* TERRAIN REGIONS */}
    <ellipse cx="16" cy="77" rx="20" ry="12" fill="url(#shG)"/>
    <ellipse cx="16" cy="77" rx="20" ry="12" fill="url(#grassP)" opacity=".65"/>
    <ellipse cx="53" cy="45" rx="9" ry="7" fill="url(#rvG)" opacity=".8"/>
    <ellipse cx="61" cy="35" rx="12" ry="11" fill="url(#mnG)"/>
    <ellipse cx="87" cy="18" rx="16" ry="11" fill="url(#mkG)"/>
    <path d="M71,12 Q79,7 95,11 Q105,15 100,26 Q92,32 74,27 Q64,22 71,12Z" fill="rgba(3,12,5,.35)"/>
    <ellipse cx="105" cy="33" rx="10" ry="8" fill="url(#lkG)"/>
    <ellipse cx="90" cy="60" rx="20" ry="15" fill="url(#erG)"/>

    {/* NATURE: Shire trees */}
    <Tree x="4"  y="83" s=".8"/>
    <Tree x="9"  y="85" s="1.0"/>
    <Tree x="25" y="78" s=".7"/>
    <Tree x="30" y="80" s=".85"/>
    <Tree x="35" y="76" s=".6"/>
    {/* Mirkwood dark trees */}
    <Tree x="72" y="10" s=".9"  dark/>
    <Tree x="78" y="8"  s="1.1" dark/>
    <Tree x="85" y="7"  s=".95" dark/>
    <Tree x="92" y="9"  s=".85" dark/>
    <Tree x="98" y="12" s=".8"  dark/>
    <Tree x="68" y="14" s=".75" dark/>
    <Tree x="104" y="17" s=".7" dark/>
    {/* Beorn/wild trees */}
    <Tree x="71" y="22" s=".7"  dark={false}/>
    <Tree x="75" y="24" s=".65" dark={false}/>
    <Tree x="44" y="58" s=".55" dark={false}/>

    {/* MOUNTAINS */}
    <Mtn x="55" y="34" s="1.0"/>
    <Mtn x="61" y="28" s="1.2"/>
    <Mtn x="67" y="31" s=".95"/>
    <Mtn x="88" y="52" s="1.5" gold/>
    {/* Erebor golden glow */}
    <ellipse cx="88" cy="50" rx="6" ry="3.5" fill="rgba(201,168,76,.15)" style={{animation:"smaugPulse 3.5s ease-in-out infinite"}}/>
    <ellipse cx="88" cy="50" rx="3" ry="1.8" fill="rgba(255,215,0,.18)" style={{animation:"smaugPulse 2.5s ease-in-out infinite"}}/>

    {/* WATER - Lake-town */}
    <ellipse cx="105" cy="33" rx="8" ry="5.5" fill="rgba(12,50,100,.5)"/>
    <path d="M97,31 Q101,28 106,30 Q110,28 113,31 Q110,35 106,35 Q101,35 97,31Z" fill="rgba(18,72,150,.32)"/>
    {[0,1,2,3].map(i=><line key={i} x1={98+i*3} y1={31.5+i*.4} x2={101+i*3} y2={31.5+i*.4}
      stroke="rgba(100,185,255,.28)" strokeWidth=".6" key={i}/>)}
    {/* River winding */}
    <path d="M72,28 Q76,31 80,28 Q84,26 88,28 Q92,30 96,28" fill="none"
      stroke="rgba(80,160,225,.22)" strokeWidth=".9"/>

    {/* SMAUG fire atmosphere */}
    <ellipse cx="100" cy="50" rx="10" ry="5" fill="rgba(255,60,0,.07)" style={{animation:"smaugPulse 2s ease-in-out infinite"}}/>
    <ellipse cx="100" cy="50" rx="6"  ry="3" fill="rgba(255,100,0,.06)" style={{animation:"smaugPulse 1.5s .5s ease-in-out infinite"}}/>

    {/* MIRKWOOD fog layers */}
    <ellipse cx="87" cy="19" rx="14" ry="9" fill="rgba(3,14,5,.38)" style={{animation:"fogDrift 9s ease-in-out infinite"}} opacity=".7"/>
    <ellipse cx="90" cy="16" rx="10" ry="6" fill="rgba(5,20,8,.3)"  style={{animation:"fogDrift 12s 3s ease-in-out infinite"}} opacity=".6"/>

    {/* PATH - 3 layers for depth */}
    <path d={pathD} fill="none" stroke="rgba(0,0,0,.75)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={pathD} fill="none" stroke="#332010" strokeWidth="3.0" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={pathD} fill="none" stroke="#5a3c18" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3.5,5" opacity=".55"/>
    {/* Travelled path glow */}
    {travD&&<>
      <path d={travD} fill="none" stroke="rgba(201,168,76,.22)" strokeWidth="3.5" strokeLinecap="round"/>
      <path d={travD} fill="none" stroke="rgba(255,215,0,.6)" strokeWidth="1.6" strokeLinecap="round"
        strokeDasharray="2.5,4" style={{animation:"dashFlow 1.2s linear infinite"}}/>
    </>}

    {/* FIELD NODES */}
    {F.map(f=>{
      const fill=FC[f.t]||"#151009";const stroke=FS[f.t]||"#6a5030";const r=FR[f.t]||2.6;
      const here=players.filter(p=>p.pos===f.id);const isMyPos=myPos===f.id;const spec=f.t!=="normal";
      return <g key={f.id} onClick={()=>onFieldClick(f)} style={{cursor:"pointer"}} filter="url(#shadow)">
        {/* Aura */}
        {spec&&<circle cx={f.x} cy={f.y} r={r+2.8} fill={stroke} opacity={isMyPos?.22:.07}/>}
        {/* Active player pulse rings */}
        {isMyPos&&<>
          <circle cx={f.x} cy={f.y} r={r+5} fill="none" stroke="rgba(255,215,0,.18)" strokeWidth=".6" style={{animation:"ripple 2s ease-out infinite"}}/>
          <circle cx={f.x} cy={f.y} r={r+3} fill="none" stroke="rgba(255,215,0,.35)" strokeWidth=".5" style={{animation:"ripple 2s .5s ease-out infinite"}}/>
        </>}
        {/* Smaug / Gollam special glow */}
        {f.t==="smaug"&&<circle cx={f.x} cy={f.y} r={r+1.5} fill="rgba(255,60,0,.14)" filter="url(#fireF)" style={{animation:"smaugPulse 1.8s ease-in-out infinite"}}/>}
        {f.t==="gollam"&&<circle cx={f.x} cy={f.y} r={r+1.5} fill="rgba(136,68,173,.15)" filter="url(#purF)" style={{animation:"smaugPulse 2.5s ease-in-out infinite"}}/>}
        {/* Field body: outer soft ring */}
        <circle cx={f.x} cy={f.y} r={r+.7} fill={fill} opacity=".5"/>
        {/* Main circle */}
        <circle cx={f.x} cy={f.y} r={r} fill={fill}
          stroke={isMyPos?"#FFD700":stroke}
          strokeWidth={isMyPos?.8:spec?.45:.25}/>
        {/* Inner highlight */}
        <circle cx={f.x-r*.22} cy={f.y-r*.22} r={r*.48} fill="rgba(255,255,255,.07)"/>
        {/* Emoji icon */}
        <text x={f.x} y={f.y+.7} textAnchor="middle" dominantBaseline="middle"
          fontSize={f.t==="start"||f.t==="finish"?"3.2":spec?"2.4":"2.1"}>{f.e}</text>
        {/* Player tokens */}
        {here.map((p,i)=>{
          const rc=raceOf(p.race);const ox=(i-(here.length-1)/2)*3.2;const isMe=p.isMe;
          return <g key={p.name} transform={`translate(${f.x+ox},${f.y-r-2.5})`}
            style={{animation:isMe?"tokenFloat 1.4s ease-in-out infinite":"none"}} filter={isMe?"url(#glow)":"none"}>
            <ellipse cx=".25" cy="1.8" rx="1.2" ry=".5" fill="rgba(0,0,0,.5)"/>
            <circle cx="0" cy="0" r="1.4" fill={rc.color} stroke={isMe?"#FFD700":"rgba(0,0,0,.65)"} strokeWidth={isMe?.45:.22}/>
            <circle cx="-.35" cy="-.35" r=".45" fill="rgba(255,255,255,.3)"/>
            <text x="0" y=".45" textAnchor="middle" dominantBaseline="middle" fontSize="1.1">{rc.icon}</text>
            {isMe&&<circle cx="0" cy="0" r="1.9" fill="none" stroke="rgba(255,215,0,.55)" strokeWidth=".3" style={{animation:"ripple 2s ease-out infinite"}}/>}
          </g>;
        })}
      </g>;
    })}

    {/* Key location labels */}
    {[{id:0,dy:5.5},{id:8,dy:-5},{id:11,dy:4.5},{id:14,dy:-5},{id:22,dy:4},{id:25,dy:-5},{id:28,dy:4.5},{id:44,dy:5.5}].map(({id,dy})=>{
      const f=F[id];const stroke=FS[f.t]||"#6a5030";
      return <text key={id} x={f.x} y={f.y+dy} textAnchor="middle" fontSize="1.5"
        fill={stroke} fontFamily="Cinzel,serif" fontStyle="italic" opacity=".82"
        style={{textShadow:"0 0 6px rgba(0,0,0,1)"}}>{f.n.split(" ")[0]}</text>;
    })}

    {/* LEGEND */}
    <g transform="translate(1,1)">
      <rect width="17" height="14" rx="1" fill="rgba(0,0,0,.7)" stroke="rgba(201,168,76,.15)" strokeWidth=".3"/>
      {[["#1e4d0a","#7BC34A","Bónusz"],["#4d0000","#E74C3C","Csapda"],["#1e0d50","#9B69BD","Kvíz"],["#4d1e00","#E67E22","Mini"]].map(([f2,s,l],i)=>
        <g key={i} transform={`translate(1.2,${1.8+i*2.8})`}>
          <circle cx="1" cy="0" r=".85" fill={f2} stroke={s} strokeWidth=".3"/>
          <text x="2.8" y=".42" fontSize="1.4" fill="rgba(201,168,76,.55)" fontFamily="Cinzel,serif">{l}</text>
        </g>
      )}
    </g>
  </svg>;
}

// ═══════════════════════════ LOBBY / WAITING / FINISHED ═══════════════════════
function LobbyScreen({playerId,user,friends,invites,onCreateGame,onJoinGame,onAcceptInvite,onDeclineInvite,onInviteFriend,notification,gameId}){
  const [joinCode,setJoinCode]=useState("");
  const race=raceOf(user?.race);
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 30% 40%,rgba(40,28,10,.6),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style>
    <div className="panel" style={{width:"100%",maxWidth:520,padding:"32px 28px",display:"flex",flexDirection:"column",gap:18,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9)",animation:"zoomIn .3s ease"}}>
      {/* Header */}
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:10,filter:"drop-shadow(0 0 24px rgba(201,168,76,.6))",animation:"goldPulse 2.5s ease infinite"}}>🎲</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,3vw,1.6rem)",color:"var(--gold)",animation:"goldPulse 3s ease infinite",letterSpacing:".04em"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--dim)",letterSpacing:".18em",textTransform:"uppercase",marginTop:6}}>Online Társasjáték · 2–4 játékos · Firebase Multiplayer</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".92rem",color:"var(--muted)",fontStyle:"italic",marginTop:10,lineHeight:1.7}}>Zsákos-dombtól Ereborig — kvízek, csapdák, Gollam és Smaug tüze vár!</div>
      </div>
      {/* Player badge */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",alignSelf:"center",
        background:`rgba(${race.rgb},.08)`,border:`1px solid rgba(${race.rgb},.28)`,borderRadius:2}}>
        <span style={{fontSize:"1.3rem",filter:`drop-shadow(0 0 10px ${race.color})`}}>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gold)"}}>{playerId}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:race.color}}>· {race.name}</span>
      </div>
      {/* Invites */}
      {invites.length>0&&<div style={{padding:"12px",background:"rgba(122,74,187,.07)",border:"1px solid rgba(122,74,187,.38)",borderRadius:2,animation:"slideUp .3s ease"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#B39DDB",letterSpacing:".12em",textTransform:"uppercase",marginBottom:10}}>🎲 Meghívók ({invites.length})</div>
        {invites.map(inv=><div key={inv.from} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(122,74,187,.12)"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)",flex:1}}><span style={{color:"#B39DDB"}}>{inv.from}</span> meghívott!</span>
          <button className="btn" onClick={()=>onAcceptInvite(inv)} style={{padding:"5px 14px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.45)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".58rem",textTransform:"uppercase",letterSpacing:".08em",borderRadius:2}}>✓ Csatlakozás</button>
          <button className="btn" onClick={()=>onDeclineInvite(inv)} style={{padding:"5px 9px",background:"none",border:"1px solid rgba(229,57,53,.22)",color:"rgba(229,57,53,.6)",fontFamily:"'Cinzel',serif",fontSize:".58rem",borderRadius:2}}>✗</button>
        </div>)}
      </div>}
      {/* Create */}
      <button className="btn" onClick={onCreateGame} style={{padding:"14px",background:"linear-gradient(135deg,rgba(201,168,76,.14),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.5)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".82rem",letterSpacing:".15em",textTransform:"uppercase",boxShadow:"0 0 24px rgba(201,168,76,.12)",borderRadius:2}}>✦ Új szoba létrehozása</button>
      {/* Join */}
      <div style={{display:"flex",gap:9}}>
        <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Szoba kód (pl. AB12CD)..." maxLength={6}
          style={{flex:1,background:"rgba(0,0,0,.55)",border:"1px solid rgba(201,168,76,.22)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:".88rem",padding:"12px 16px",outline:"none",letterSpacing:".12em",borderRadius:2}}/>
        <button className="btn" onClick={()=>onJoinGame(joinCode)} style={{padding:"12px 20px",background:"rgba(58,122,139,.12)",border:"1px solid rgba(58,122,139,.5)",color:"#4DADE2",fontFamily:"'Cinzel',serif",fontSize:".75rem",textTransform:"uppercase",letterSpacing:".1em",borderRadius:2}}>Belép</button>
      </div>
      {/* Friends */}
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".15em",color:"var(--dim)",textTransform:"uppercase",marginBottom:10}}>— Barátaim ({friends.length}) —</div>
        {friends.map(f=>{const fr=raceOf(f.race);return <div key={f.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.08)",marginBottom:5,borderRadius:2}}>
          <span style={{fontSize:"1.1rem",filter:`drop-shadow(0 0 8px ${fr.color})`}}>{fr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{f.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:fr.color}}>{fr.name} · {f.score||0}pt</div></div>
          <button className="btn" onClick={()=>onInviteFriend(f.name)} style={{padding:"5px 14px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.38)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",textTransform:"uppercase",letterSpacing:".08em",borderRadius:2}}>🎲 Meghív</button>
        </div>;})}
      </div>}
      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:notification.color,textAlign:"center",animation:"slideUp .2s ease"}}>{notification.msg}</div>}
    </div>
  </div>;
}

function WaitingScreen({gameId,players,gameData,friends,playerId,onStart,onInviteFriend,notification}){
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 50% 40%,rgba(30,20,8,.7),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style>
    <div className="panel" style={{width:"100%",maxWidth:480,padding:"32px 28px",display:"flex",flexDirection:"column",gap:16,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9)",animation:"zoomIn .3s ease"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:"var(--gold)",animation:"goldPulse 2.5s ease infinite"}}>Váróterem</div>
        <div style={{margin:"14px auto",padding:"16px 26px",background:"linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03))",border:"1px solid rgba(201,168,76,.4)",display:"inline-block",borderRadius:2,boxShadow:"0 0 40px rgba(201,168,76,.12)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--dim)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:6}}>Szoba kód — oszd meg barátaiddal!</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"2rem",color:"var(--gold)",letterSpacing:".3em",textShadow:"0 0 24px rgba(201,168,76,.5)"}}>{gameId}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {players.map(p=>{const pr=raceOf(p.race);return <div key={p.name} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:`rgba(${pr.rgb},.04)`,border:`1px solid rgba(${pr.rgb},.18)`,borderRadius:2,animation:"slideUp .3s ease"}}>
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
          <button className="btn" onClick={()=>onInviteFriend(f.name)} style={{padding:"5px 14px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.38)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",textTransform:"uppercase",letterSpacing:".08em",borderRadius:2}}>🎲 Meghív</button>
        </div>;})}
      </div>}
      {gameData?.host===playerId&&<button className="btn" onClick={onStart} style={{padding:"15px",background:"linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.5)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".85rem",letterSpacing:".16em",textTransform:"uppercase",boxShadow:"0 0 30px rgba(201,168,76,.18)",borderRadius:2,marginTop:4}}>▶ Játék Indítása</button>}
      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:notification.color,textAlign:"center",animation:"slideUp .2s ease"}}>{notification.msg}</div>}
    </div>
  </div>;
}

function FinishedScreen({players,gameData,playerId,onNewGame}){
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 50% 40%,rgba(100,70,0,.3),rgba(3,2,1,1) 65%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style>
    <div className="panel" style={{width:"100%",maxWidth:460,padding:"36px 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:20,borderRadius:3,boxShadow:"0 0 100px rgba(0,0,0,.95)",animation:"zoomIn .35s ease"}}>
      <div style={{fontSize:"5rem",animation:"winBlast .6s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 40px ${gameData?.winner===playerId?"rgba(255,215,0,.8)":"rgba(229,57,53,.6)"})`}}>
        {gameData?.winner===playerId?"🏆":"😔"}
      </div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.5rem",color:"var(--gold)",animation:"goldPulse 2s ease infinite",textAlign:"center"}}>
        {gameData?.winner===playerId?"GYŐZELEM!":"Jó próbálkozás!"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:340}}>
        {players.sort((a,b)=>b.score-a.score).map((p,i)=>{const pr=raceOf(p.race);return <div key={p.name} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:p.isMe?"rgba(201,168,76,.07)":"rgba(255,255,255,.02)",border:`1px solid ${p.isMe?"rgba(201,168,76,.35)":"rgba(201,168,76,.08)"}`,animation:`slideUp ${.2+i*.1}s ease`,borderRadius:2}}>
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

// ═══════════════════════════ PLAYING SCREEN (FULLSCREEN 16:9) ═══════════════════
function PlayingScreen({gameData,playerId,user,onRoll,onChat,onEventResult,eventField,rolling,diceValues,bursts,onFieldClick,selectedField,setSelectedField,notification}){
  const [chatMsg,setChatMsg]=useState("");
  const chatRef=useRef(null);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[gameData?.chat]);
  const players=Object.values(gameData?.players||{}).map(p=>({...p,isMe:p.name===playerId,pos:p.position}));
  const myData=gameData?.players?.[playerId];
  const isMyTurn=gameData?.currentTurn===playerId;
  const myPos=myData?.position||0;
  const curField=F[myPos];

  const sendChat=async(t)=>{
    if(!t?.trim())return;
    await push(ref(db,`games/${gameData.__id}/chat`),{player:playerId,race:user?.race||"human",text:t.trim(),time:Date.now()});
    setChatMsg("");
  };

  return <div style={{position:"fixed",inset:0,background:"#050302",display:"flex",overflow:"hidden",zIndex:10}}>
    <style>{CSS}</style>

    {/* Burst particles */}
    {bursts.map(b=><Burst key={b.id} x={b.x} y={b.y} color={b.color} onDone={b.onDone}/>)}

    {/* Event Modal */}
    {eventField&&isMyTurn&&<EventModal field={eventField} onResult={onEventResult}/>}

    {/* Field tooltip */}
    {selectedField&&!eventField&&<div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",zIndex:200,
      padding:"12px 18px",background:"rgba(4,2,1,.98)",border:`1px solid ${FS[selectedField.t]||"rgba(201,168,76,.25)"}28`,
      maxWidth:280,textAlign:"center",animation:"slideUp .22s ease",
      boxShadow:"0 10px 40px rgba(0,0,0,.7)",borderRadius:3}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:"var(--gold)"}}>{selectedField.e} {selectedField.n}</div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:".88rem",color:"var(--muted)",fontStyle:"italic",marginTop:5,lineHeight:1.5}}>
        {selectedField.t==="trap"?"⚠️ Csapda mező":selectedField.t==="bonus"?"✨ Bónusz mező":selectedField.t==="quiz"?"❓ Kvíz mező":selectedField.t==="minigame"?"🎮 Minijáték":selectedField.t==="gollam"?"💍 Gollam":selectedField.t==="smaug"?"🔥 SMAUG! −30pt":"Normál mező"}
      </div>
      <button onClick={()=>setSelectedField(null)} style={{marginTop:7,background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:".65rem",fontFamily:"'Cinzel',serif"}}>× bezár</button>
    </div>}

    {/* Notification */}
    {notification&&<div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",zIndex:300,
      padding:"9px 20px",background:"rgba(4,2,1,.98)",border:`1px solid ${notification.color}`,
      fontFamily:"'Cinzel',serif",fontSize:".75rem",color:notification.color,
      letterSpacing:".07em",whiteSpace:"nowrap",pointerEvents:"none",
      boxShadow:`0 0 24px ${notification.color}44`,animation:"slideUp .2s ease",borderRadius:2}}>{notification.msg}</div>}

    {/* ── LEFT PANEL: Players ── */}
    <div className="panel scrollbar" style={{width:220,flexShrink:0,display:"flex",flexDirection:"column",gap:0,overflowY:"auto",borderRight:"1px solid var(--border)"}}>
      {/* Header */}
      <div style={{padding:"14px 16px 10px",borderBottom:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".72rem",color:"var(--gold)",letterSpacing:".06em",animation:"goldPulse 3s ease infinite"}}>Középföld</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--dim)",letterSpacing:".12em",textTransform:"uppercase",marginTop:2}}>Honfoglalója</div>
      </div>

      {/* Player cards */}
      {players.map(p=>{
        const pr=raceOf(p.race);const active=gameData?.currentTurn===p.name;
        const pDice=diceValues[p.name]||{value:1,rolling:false};
        const myCards=(p.cards||[]).map(cid=>PC.find(x=>x.id===cid)).filter(Boolean);
        return <div key={p.name} style={{padding:"14px 14px 12px",borderBottom:"1px solid rgba(201,168,76,.07)",
          background:active?"rgba(201,168,76,.05)":"transparent",
          borderLeft:active?"2px solid var(--gold)":"2px solid transparent",
          transition:"all .25s",position:"relative"}}>
          {active&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>}
          {/* Player header */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:"1.2rem",filter:active?`drop-shadow(0 0 10px ${pr.color})`:"none"}}>{pr.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:active?"var(--gold)":"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}{p.isMe?" (Te)":""}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}{p.skipTurn?" · 💤 kimarad":""}</div>
            </div>
          </div>
          {/* 3D Dice */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:10,filter:active?"drop-shadow(0 0 12px rgba(201,168,76,.35))":"none"}}>
            <Dice3D value={pDice.value||1} rolling={pDice.rolling||false} size={active?64:48}/>
          </div>
          {/* Score bar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)"}}>#{p.position} • {F[p.position]?.e}</span>
            <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".75rem",color:"var(--gold)"}}>{p.score}pt</span>
          </div>
          {/* Progress bar */}
          <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(p.position/44)*100}%`,background:`linear-gradient(90deg,${pr.color},var(--gold))`,borderRadius:2,transition:"width .6s ease"}}/>
          </div>
          {/* Power cards */}
          {myCards.length>0&&<div style={{display:"flex",gap:4,marginTop:7,flexWrap:"wrap"}}>
            {myCards.map((cd,i)=><span key={i} title={`${cd.n}: ${cd.d}`} style={{fontSize:".95rem",filter:"drop-shadow(0 0 5px rgba(201,168,76,.5))",cursor:"help"}}>{cd.i}</span>)}
          </div>}
        </div>;
      })}

      {/* Turn counter */}
      <div style={{padding:"12px 14px",marginTop:"auto",borderTop:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase"}}>Körök száma</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",marginTop:2}}>{gameData?.turnCount||0}</div>
      </div>
    </div>

    {/* ── CENTER: Board ── */}
    <div style={{flex:1,position:"relative",overflow:"hidden"}}>
      <EpicBoard players={players} myPos={myPos} onFieldClick={f=>setSelectedField(f)}/>
    </div>

    {/* ── RIGHT PANEL: Action ── */}
    <div className="panel scrollbar" style={{width:230,flexShrink:0,display:"flex",flexDirection:"column",overflowY:"auto",borderLeft:"1px solid var(--border)"}}>
      {/* Current field info */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Jelenlegi mező</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"1.6rem"}}>{curField?.e}</span>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)"}}>{curField?.n}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:FS[curField?.t]||"var(--dim)"}}>{curField?.t}</div>
          </div>
        </div>
      </div>

      {/* Turn info */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",background:isMyTurn?"rgba(201,168,76,.04)":"transparent",animation:isMyTurn?"borderShimmer 2s ease infinite":"none"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:isMyTurn?".72rem":".62rem",color:isMyTurn?"var(--gold)":"var(--muted)",letterSpacing:".06em",marginBottom:4}}>
          {isMyTurn?"⚔️ A TE KÖRÖD!":gameData?.currentTurn+" köre..."}
        </div>
        {isMyTurn&&<div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--muted)",fontStyle:"italic"}}>Dobd meg a kockát a haladáshoz!</div>}
      </div>

      {/* ROLL BUTTON — the hero element */}
      <div style={{padding:"18px 16px",borderBottom:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <button onClick={onRoll} disabled={!isMyTurn||rolling||!!eventField} className="btn"
          style={{width:"100%",padding:"18px 0",
            background:isMyTurn&&!rolling&&!eventField
              ?"linear-gradient(135deg,rgba(201,168,76,.22),rgba(201,168,76,.08),rgba(201,168,76,.18))"
              :"rgba(0,0,0,.25)",
            border:`2px solid ${isMyTurn&&!rolling&&!eventField?"rgba(201,168,76,.6)":"rgba(255,255,255,.06)"}`,
            color:isMyTurn&&!rolling&&!eventField?"var(--gold)":"var(--dim)",
            fontFamily:"'Cinzel Decorative',serif",fontSize:"1.05rem",letterSpacing:".1em",
            cursor:isMyTurn&&!rolling&&!eventField?"pointer":"default",
            boxShadow:isMyTurn&&!rolling&&!eventField?"0 0 32px rgba(201,168,76,.25),0 0 60px rgba(201,168,76,.1)":"none",
            animation:isMyTurn&&!rolling&&!eventField?"activeGlow 2s ease infinite":"none",
            borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:"2rem"}}>{rolling?"⏳":"🎲"}</span>
          <span>{rolling?"Gördülés...":"Kocka Dobása"}</span>
        </button>
        {/* Last dice result display */}
        {diceValues[playerId]?.value>0&&!rolling&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--muted)"}}>Utolsó dobás: <span style={{color:"var(--gold)",fontWeight:"bold"}}>{diceValues[playerId].value}</span></div>}
      </div>

      {/* Emotes */}
      <div style={{padding:"10px 14px",borderBottom:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Gyors emote</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {EMOTES.map(e=><button key={e} onClick={()=>sendChat(e)} className="btn"
            style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(201,168,76,.1)",
              fontSize:"1.1rem",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",borderRadius:3,transition:"all .15s"}}
            onMouseEnter={ev=>{ev.currentTarget.style.background="rgba(201,168,76,.12)";ev.currentTarget.style.transform="scale(1.15)";}}
            onMouseLeave={ev=>{ev.currentTarget.style.background="rgba(255,255,255,.04)";ev.currentTarget.style.transform="scale(1)";}}
          >{e}</button>)}
        </div>
      </div>

      {/* Chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"10px 14px",minHeight:0}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Chat</div>
        <div ref={chatRef} className="scrollbar" style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,marginBottom:8,minHeight:60,maxHeight:160}}>
          {Object.values(gameData?.chat||{}).slice(-20).map((m,i)=>{
            const mr=raceOf(m.race);
            return <div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--muted)",lineHeight:1.4}}>
              <span style={{color:mr.color,textShadow:`0 0 8px ${mr.color}55`,fontWeight:"bold"}}>{m.player}: </span>{m.text}
            </div>;
          })}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatMsg)}
            placeholder="Üzenet..." style={{flex:1,background:"rgba(0,0,0,.5)",border:"1px solid rgba(201,168,76,.15)",
              color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".85rem",
              padding:"6px 10px",outline:"none",borderRadius:2}}/>
          <button onClick={()=>sendChat(chatMsg)} className="btn" style={{padding:"6px 12px",background:"rgba(201,168,76,.08)",
            border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontFamily:"'Cinzel',serif",
            fontSize:".65rem",cursor:"pointer",borderRadius:2}}>→</button>
        </div>
      </div>

      {/* Field legend */}
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)"}}>
        {[["#7BC34A","Bónusz"],["#E74C3C","Csapda"],["#9B69BD","Kvíz"],["#E67E22","Minijáték"],["#FF5252","Smaug"]].map(([c,l])=>
          <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}`,flexShrink:0}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--dim)"}}>{l}</span>
          </div>
        )}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════ MAIN CONTROLLER ════════════════════════════════════
export default function BoardGame({user}){
  const [screen,setScreenRaw]=useState(()=>localStorage.getItem("hb_screen")||"lobby");
  const [gameId,setGameIdRaw]=useState(()=>localStorage.getItem("hb_gameId")||null);
  const [gameData,setGameData]=useState(null);
  const [playerId]=useState(()=>user?.adventureName||"Kalandor_"+genId());
  const [eventField,setEventField]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [diceValues,setDiceValues]=useState({});
  const [notification,setNotification]=useState(null);
  const [invites,setInvites]=useState([]);
  const [friends,setFriends]=useState([]);
  const [bursts,setBursts]=useState([]);
  const [selectedField,setSelectedField]=useState(null);
  const screenRef=useRef(screen);

  const setScreen=s=>{setScreenRaw(s);screenRef.current=s;localStorage.setItem("hb_screen",s);};
  const setGameId=id=>{setGameIdRaw(id);id?localStorage.setItem("hb_gameId",id):localStorage.removeItem("hb_gameId");};
  const notify=(msg,color="var(--gold)",dur=2800)=>{setNotification({msg,color});setTimeout(()=>setNotification(null),dur);};
  const burst=(color="#C9A84C")=>{
    const id=Date.now()+Math.random();
    const x=window.innerWidth/2,y=window.innerHeight/2;
    setBursts(b=>[...b,{id,x,y,color,onDone:()=>setBursts(b2=>b2.filter(q=>q.id!==id))}]);
  };

  // Firebase subscriptions
  useEffect(()=>{
    if(!playerId)return;
    const fr=ref(db,`users/${playerId}/friends`);
    onValue(fr,s=>setFriends(Object.values(s.val()||{})));
    const ir=ref(db,`users/${playerId}/gameInvites`);
    onValue(ir,s=>setInvites(Object.values(s.val()||{})));
    return()=>{off(fr);off(ir);};
  },[playerId]);

  useEffect(()=>{
    if(!gameId)return;
    const gr=ref(db,`games/${gameId}`);
    onValue(gr,s=>{
      const d=s.val();
      if(!d)return;
      setGameData({...d,__id:gameId});
      if(d.status==="playing"&&screenRef.current==="waiting")setScreen("playing");
      if(d.status==="finished"&&screenRef.current==="playing")setScreen("finished");
      if(d.diceValues)setDiceValues(d.diceValues);
    });
    return()=>off(gr);
  },[gameId]);

  // Actions
  const createGame=async()=>{
    const id=genId();
    await set(ref(db,`games/${id}`),{status:"waiting",host:playerId,created:Date.now(),
      players:{[playerId]:{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},
      currentTurn:playerId,turnCount:0,chat:{},winner:null,diceValues:{}});
    setGameId(id);setScreen("waiting");
  };

  const joinGame=async(code)=>{
    const id=(code||"").trim().toUpperCase();
    if(!id){notify("Írd be a szoba kódját!","#EF9A9A");return;}
    const snap=await get(ref(db,`games/${id}`));
    if(!snap.exists()){notify("Nincs ilyen szoba!","#EF9A9A");return;}
    const d=snap.val();
    if(d.status!=="waiting"){notify("A játék már elkezdődött!","#EF9A9A");return;}
    if(Object.keys(d.players||{}).length>=4){notify("A szoba tele van!","#EF9A9A");return;}
    await update(ref(db,`games/${id}/players/${playerId}`),{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(id);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };

  const acceptInvite=async(inv)=>{
    await remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));
    const snap=await get(ref(db,`games/${inv.gameId}`));
    if(!snap.exists()){notify("A szoba már nem létezik!","#EF9A9A");return;}
    await update(ref(db,`games/${inv.gameId}/players/${playerId}`),{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(inv.gameId);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };

  const inviteFriend=async(friendName,gid)=>{
    let id=gid||gameId;
    if(!id){
      const newId=genId();
      await set(ref(db,`games/${newId}`),{status:"waiting",host:playerId,created:Date.now(),
        players:{[playerId]:{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},
        currentTurn:playerId,turnCount:0,chat:{},winner:null,diceValues:{}});
      setGameId(newId);setScreen("waiting");id=newId;
    }
    await set(ref(db,`users/${friendName}/gameInvites/${playerId}`),{from:playerId,gameId:id,sent:Date.now()});
    notify(`Meghívó elküldve: ${friendName}!`,"#B39DDB",4000);
  };

  const startGame=async()=>{
    await update(ref(db,`games/${gameId}`),{status:"playing"});setScreen("playing");
  };

  const rollDice=async()=>{
    if(!gameData||gameData.currentTurn!==playerId||rolling||eventField)return;
    const myData=gameData.players?.[playerId];
    if(myData?.skipTurn){
      notify("Kimaradsz ebből a körből!","#EF9A9A");
      const pls=Object.keys(gameData.players);
      const next=pls[(pls.indexOf(playerId)+1)%pls.length];
      await update(ref(db,`games/${gameId}`),{currentTurn:next,turnCount:(gameData.turnCount||0)+1});
      await update(ref(db,`games/${gameId}/players/${playerId}`),{skipTurn:false});
      return;
    }
    setRolling(true);
    await update(ref(db,`games/${gameId}/diceValues/${playerId}`),{value:0,rolling:true});
    let count=0;
    const iv=setInterval(async()=>{
      const v=~~(Math.random()*6)+1;
      setDiceValues(d=>({...d,[playerId]:{value:v,rolling:true}}));
      count++;
      if(count>14){
        clearInterval(iv);
        const roll=~~(Math.random()*6)+1;
        const extra=myData?.extraStep||0;
        setRolling(false);
        setDiceValues(d=>({...d,[playerId]:{value:roll,rolling:false}}));
        await update(ref(db,`games/${gameId}/diceValues/${playerId}`),{value:roll,rolling:false});
        const newPos=Math.min((myData?.position||0)+roll+extra,F.length-1);
        const field=F[newPos];
        await update(ref(db,`games/${gameId}/players/${playerId}`),{position:newPos,extraStep:0});
        burst(FS[field.t]||"#C9A84C");
        notify(`🎲 ${roll}${extra>0?` +${extra} extra`:""}  →  ${field.e} ${field.n}`);
        setTimeout(()=>setEventField(field),600);
      }
    },75);
  };

  const handleEvent=async(result)=>{
    setEventField(null);
    if(!gameData)return;
    const myData=gameData.players?.[playerId];
    let score=Math.max(0,(myData?.score||0)+result.pts);
    let upd={score};
    if(result.pts>0){notify(`+${result.pts} pont! ✨`,"#66BB6A");burst("#66BB6A");}
    else if(result.pts<0){notify(`${result.pts} pont...`,"#EF9A9A");burst("#E74C3C");}
    if(result.field.t==="trap"){upd.skipTurn=true;upd.position=Math.max(0,(myData?.position||0)-2);}
    if(result.field.id===24)upd.position=Math.max(0,(myData?.position||0)-3);
    if(result.field.id===25){upd.score=Math.max(0,score-30);}
    if(result.field.id===38){upd.position=Math.min((myData?.position||0)+5,F.length-1);notify("🦅 A sasok megmentettek! +5 mező!","#3A7A8B");}
    if([8,26].includes(result.field.id))upd.position=Math.min((myData?.position||0)+2,F.length-1);
    if([2,14,22,29,32,36].includes(result.field.id)){
      const c=PC[~~(Math.random()*PC.length)];
      upd.cards=[...(myData?.cards||[]),c.id];
      notify(`🃏 ${c.n} kártyát kaptál!`,"#7A4ABB");
    }
    if(result.field.id===F.length-1||result.win){
      await update(ref(db,`games/${gameId}`),{status:"finished",winner:playerId});
      await update(ref(db,`games/${gameId}/players/${playerId}`),upd);
      burst("#FFD700");setScreen("finished");return;
    }
    await update(ref(db,`games/${gameId}/players/${playerId}`),upd);
    const pls=Object.keys(gameData.players);
    await update(ref(db,`games/${gameId}`),{currentTurn:pls[(pls.indexOf(playerId)+1)%pls.length],turnCount:(gameData.turnCount||0)+1});
  };

  const players=Object.values(gameData?.players||{}).map(p=>({...p,isMe:p.name===playerId}));

  // Route
  if(screen==="lobby") return <LobbyScreen
    playerId={playerId} user={user} friends={friends} invites={invites}
    onCreateGame={createGame} onJoinGame={joinGame}
    onAcceptInvite={acceptInvite} onDeclineInvite={inv=>remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`))}
    onInviteFriend={inviteFriend} notification={notification} gameId={gameId}/>;

  if(screen==="waiting") return <WaitingScreen
    gameId={gameId} players={players} gameData={gameData} friends={friends} playerId={playerId}
    onStart={startGame} onInviteFriend={n=>inviteFriend(n,gameId)} notification={notification}/>;

  if(screen==="finished") return <FinishedScreen
    players={players} gameData={gameData} playerId={playerId}
    onNewGame={()=>{setScreen("lobby");setGameId(null);setGameData(null);localStorage.removeItem("hb_screen");localStorage.removeItem("hb_gameId");}}/>;

  return <PlayingScreen
    gameData={gameData} playerId={playerId} user={user}
    onRoll={rollDice} onChat={async(t)=>{await push(ref(db,`games/${gameId}/chat`),{player:playerId,race:user?.race||"human",text:t,time:Date.now()});}}
    onEventResult={handleEvent} eventField={eventField} rolling={rolling}
    diceValues={diceValues} bursts={bursts}
    onFieldClick={f=>setSelectedField(f)} selectedField={selectedField} setSelectedField={setSelectedField}
    notification={notification}/>;
}
