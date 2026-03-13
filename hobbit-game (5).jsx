import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push, remove, off } from "firebase/database";

// ── FIREBASE ──────────────────────────────────────────────────────────────────
const firebaseConfig={apiKey:"AIzaSyDFvUaUSu_UxF4gkooovxtX-bLq1rRaI2E",authDomain:"hobbit-projekt.firebaseapp.com",projectId:"hobbit-projekt",storageBucket:"hobbit-projekt.firebasestorage.app",messagingSenderId:"481058932399",appId:"1:481058932399:web:cedeb299a9860b8580765a",databaseURL:"https://hobbit-projekt-default-rtdb.europe-west1.firebasedatabase.app"};
const fbApp=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
const db=getDatabase(fbApp);
window.__fbDB={getDatabase:()=>db,ref,set,get,onValue,update,push,remove,off};

// ── GLOBAL STYLES ──────────────────────────────────────────────────────────────
const EPIC_CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
:root{--gold:#C9A84C;--deep:#080604;--fire:#FF4500;--ice:#00BFFF;--purple:#9B59B6;}
@keyframes orbit{0%{transform:rotate(0deg) translateX(60px) rotate(0deg)}100%{transform:rotate(360deg) translateX(60px) rotate(-360deg)}}
@keyframes goldPulse{0%,100%{text-shadow:0 0 20px rgba(201,168,76,.4),0 0 40px rgba(201,168,76,.2)}50%{text-shadow:0 0 40px rgba(201,168,76,.9),0 0 80px rgba(201,168,76,.5),0 0 120px rgba(201,168,76,.3)}}
@keyframes fireFlicker{0%,100%{filter:drop-shadow(0 0 8px #FF4500) drop-shadow(0 0 16px #FF8C00)}25%{filter:drop-shadow(0 0 16px #FF6600) drop-shadow(0 0 30px #FF4500)}75%{filter:drop-shadow(0 0 6px #FF8C00) drop-shadow(0 0 12px #FFD700)}}
@keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-60px) scale(0);opacity:0}}
@keyframes shakeX{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes zoomIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes ripple{0%{transform:scale(1);opacity:0.8}100%{transform:scale(3);opacity:0}}
@keyframes diceRoll{0%{transform:rotateX(0deg) rotateY(0deg) rotateZ(0deg)}100%{transform:rotateX(720deg) rotateY(540deg) rotateZ(360deg)}}
@keyframes tokenBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes scanline{0%{background-position:0 0}100%{background-position:0 100%}}
@keyframes fogDrift{0%{transform:translateX(-10%) scaleX(1)}50%{transform:translateX(5%) scaleX(1.05)}100%{transform:translateX(-10%) scaleX(1)}}
@keyframes smaugFire{0%{opacity:.6;transform:scaleX(1)}50%{opacity:1;transform:scaleX(1.08)}100%{opacity:.6;transform:scaleX(1)}}
@keyframes heroReveal{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0% 0 0)}}
@keyframes starTwinkle{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
@keyframes pathGlow{0%,100%{stroke-opacity:0.3;stroke-width:1.5}50%{stroke-opacity:0.7;stroke-width:2.2}}
@keyframes fieldPop{0%{transform:scale(1)}50%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes winnerBlast{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.15) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg)}}
.epic-btn{position:relative;overflow:hidden;transition:all .25s cubic-bezier(.4,0,.2,1)!important}
.epic-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent);transform:translateX(-100%);transition:transform .4s}
.epic-btn:hover::before{transform:translateX(100%)}
.epic-btn:hover{transform:translateY(-2px)!important;box-shadow:0 8px 32px rgba(201,168,76,.25)!important}
`;

// ── DATA ───────────────────────────────────────────────────────────────────────
const RACES=[
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E",hex:"107,140,62",name:"Hobbit",title:"Zsákos-dombi"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D",hex:"160,82,45", name:"Törpe", title:"Erebori"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B",hex:"58,122,139",name:"Tünde", title:"Tünde"},
  {id:"human", icon:"⚔️", color:"#8B7355",hex:"139,115,85",name:"Ember", title:"Bátori"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB",hex:"122,74,187",name:"Varázsló",title:"Mágikus"},
];
const FIELDS=[
  {id:0, name:"Zsákos-domb",        icon:"🏡",type:"start",   x:12,y:88,region:"shire"},
  {id:1, name:"Bag End ösvény",     icon:"🌿",type:"normal",  x:18,y:84,region:"shire"},
  {id:2, name:"Bywater fogadó",     icon:"🍺",type:"bonus",   x:24,y:80,region:"shire"},
  {id:3, name:"Bree kapuja",        icon:"🚪",type:"normal",  x:30,y:76,region:"wild"},
  {id:4, name:"Pusztai fogadó",     icon:"🌙",type:"quiz",    x:36,y:72,region:"wild"},
  {id:5, name:"Veszélyes ösvény",   icon:"⚠️",type:"trap",    x:40,y:67,region:"wild"},
  {id:6, name:"Trollok völgye",     icon:"👹",type:"minigame",x:44,y:62,region:"trolls"},
  {id:7, name:"Troll barlang",      icon:"💀",type:"trap",    x:47,y:57,region:"trolls"},
  {id:8, name:"Völgyzugoly",        icon:"🏔️",type:"bonus",   x:50,y:52,region:"rivendell"},
  {id:9, name:"Ködös Hegy lába",    icon:"❄️",type:"normal",  x:54,y:48,region:"mountains"},
  {id:10,name:"Goblin alagút",      icon:"👺",type:"minigame",x:57,y:43,region:"mountains"},
  {id:11,name:"Gollam barlangja",   icon:"💍",type:"gollam",  x:60,y:38,region:"mountains"},
  {id:12,name:"Napfény kapuja",     icon:"☀️",type:"bonus",   x:63,y:34,region:"wild"},
  {id:13,name:"Vad mezők",          icon:"🌲",type:"normal",  x:66,y:30,region:"wild"},
  {id:14,name:"Beorn háza",         icon:"🐻",type:"bonus",   x:69,y:26,region:"beorn"},
  {id:15,name:"Bakacsinerdő széle", icon:"🌑",type:"normal",  x:72,y:23,region:"mirkwood"},
  {id:16,name:"Bakacsinerdő",       icon:"🕸️",type:"trap",    x:75,y:21,region:"mirkwood"},
  {id:17,name:"Pókkirálynő",        icon:"🕷️",type:"minigame",x:78,y:19,region:"mirkwood"},
  {id:18,name:"Thranduil erdeje",   icon:"🧝",type:"quiz",    x:80,y:17,region:"mirkwood"},
  {id:19,name:"Tündekirály börtön", icon:"🔒",type:"trap",    x:82,y:16,region:"mirkwood"},
  {id:20,name:"Hordók a folyón",    icon:"🛶",type:"minigame",x:83,y:19,region:"lake"},
  {id:21,name:"Tóváros partja",     icon:"⛵",type:"normal",  x:82,y:23,region:"lake"},
  {id:22,name:"Tóváros",            icon:"🏙️",type:"bonus",   x:80,y:27,region:"lake"},
  {id:23,name:"Magányos Hegy lába", icon:"🏔️",type:"normal",  x:78,y:31,region:"erebor"},
  {id:24,name:"Sárkány szele",      icon:"💨",type:"trap",    x:76,y:35,region:"erebor"},
  {id:25,name:"Smaug tüze",         icon:"🔥",type:"smaug",   x:74,y:39,region:"erebor"},
  {id:26,name:"Titkos átjáró",      icon:"🗝️",type:"bonus",   x:72,y:43,region:"erebor"},
  {id:27,name:"Öt Sereg Csatája",   icon:"⚔️",type:"minigame",x:70,y:47,region:"erebor"},
  {id:28,name:"Erebor kapuja",      icon:"🏰",type:"quiz",    x:67,y:50,region:"erebor"},
  {id:29,name:"Kincseskamra",       icon:"💎",type:"bonus",   x:64,y:52,region:"erebor"},
  {id:30,name:"Arkenköves trón",    icon:"👑",type:"quiz",    x:60,y:54,region:"erebor"},
  {id:31,name:"Törpe bányák",       icon:"⛏️",type:"normal",  x:57,y:56,region:"erebor"},
  {id:32,name:"Smaug kincse",       icon:"🪙",type:"bonus",   x:54,y:58,region:"erebor"},
  {id:33,name:"Bard nyila",         icon:"🏹",type:"quiz",    x:51,y:59,region:"lake"},
  {id:34,name:"Hollók sziklája",    icon:"🐦",type:"normal",  x:48,y:60,region:"wild"},
  {id:35,name:"Durin kapuja",       icon:"🚪",type:"minigame",x:45,y:61,region:"mountains"},
  {id:36,name:"Mithril ér",         icon:"✨",type:"bonus",   x:42,y:62,region:"mountains"},
  {id:37,name:"Goblin város",       icon:"🏚️",type:"trap",    x:38,y:63,region:"mountains"},
  {id:38,name:"Sasok fészke",       icon:"🦅",type:"bonus",   x:34,y:62,region:"wild"},
  {id:39,name:"Carrock sziklája",   icon:"🪨",type:"quiz",    x:30,y:60,region:"beorn"},
  {id:40,name:"Erdei folyó",        icon:"🌊",type:"normal",  x:26,y:58,region:"mirkwood"},
  {id:41,name:"Nagy tó",            icon:"🏞️",type:"normal",  x:22,y:56,region:"lake"},
  {id:42,name:"Tünde csarnokok",    icon:"🌟",type:"bonus",   x:19,y:53,region:"mirkwood"},
  {id:43,name:"Utolsó állomás",     icon:"🌅",type:"quiz",    x:17,y:49,region:"wild"},
  {id:44,name:"EREBOR",             icon:"🏆",type:"finish",  x:15,y:45,region:"erebor"},
];
const FIELD_COLORS={start:"#4a7a2a",finish:"#b8860b",bonus:"#1a5276",trap:"#7b0000",quiz:"#3b1d6e",minigame:"#7d3c00",gollam:"#1a1a2e",smaug:"#8b0000",normal:"#2e2416"};
const FIELD_STROKES={start:"#8BC34A",finish:"#FFD700",bonus:"#5DADE2",trap:"#E74C3C",quiz:"#A569BD",minigame:"#E67E22",gollam:"#8E44AD",smaug:"#FF5252",normal:"#8D7645"};

const QUIZZES=[
  {q:"Ki volt Bilbo a trolloknak?",opts:["Varázsló","Betörő","Hobbit","Kém"],ok:1},
  {q:"Hány törpe volt Thorinnal?",opts:["10","11","12","13"],ok:3},
  {q:"Mi volt Bilbo kardjának neve?",opts:["Szúró","Fullánk","Marás","Nyílás"],ok:1},
  {q:"Ki ölte meg Smaug sárkányt?",opts:["Thorin","Bilbo","Bard","Gandalf"],ok:2},
  {q:"Mi volt Gollam valódi neve?",opts:["Déagol","Sméagol","Goblin","Mordok"],ok:1},
  {q:"Hol találta Bilbo a Gyűrűt?",opts:["Troll barlang","Goblin alagút","Bakacsinerdő","Tóváros"],ok:1},
  {q:"Ki volt a Tündekirály?",opts:["Elrond","Legolas","Thranduil","Círdan"],ok:2},
  {q:"Mi volt az Arkenstone?",opts:["Gyűrű","Törpék szent köve","Smaug szíve","Varázslat"],ok:1},
  {q:"Hány évig élt Bilbo?",opts:["111","120","100","131"],ok:0},
  {q:"Melyik városból lőtte Bard a sárkányt?",opts:["Völgyzugoly","Tündeváros","Tóváros","Dale"],ok:2},
];
const RIDDLES=[
  {q:"Nincs hangom, de megszólalok. Mi vagyok?",opts:["szél","visszhang","kő","víz"],ok:1},
  {q:"Minél többet veszel, annál több marad.",opts:["lyuk","kincs","arany","levegő"],ok:0},
  {q:"Fogak vannak, de nem harap.",opts:["fésű","kő","fal","Gollam"],ok:0},
];
const RUNES=[{rune:"ᚠ",name:"Feoh",answer:"F"},{rune:"ᚢ",name:"Ur",answer:"U"},{rune:"ᚦ",name:"Thorn",answer:"TH"},{rune:"ᚨ",name:"Ansuz",answer:"A"},{rune:"ᚱ",name:"Raido",answer:"R"}];
const POWER_CARDS=[{id:"shield",icon:"🛡️",name:"Pajzs",desc:"Csapda hatástalan"},{id:"speed",icon:"💨",name:"Szélroham",desc:"+3 lépés"},{id:"wisdom",icon:"📜",name:"Gandalf",desc:"Kvíz segítség"},{id:"portal",icon:"✨",name:"Kapu",desc:"+5 mező"},{id:"freeze",icon:"❄️",name:"Jégbűvölet",desc:"Ellenfél kimarad"}];
const EMOTES=["👍","😄","😱","🤔","🎉","💀","🔥","❄️","🧙","⚔️"];
const genId=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const getRace=(id)=>RACES.find(r=>r.id===id)||RACES[3];

// ── 3D DICE ────────────────────────────────────────────────────────────────────
const DICE_FACES=[
  [[.5,.5]],                                                  // 1
  [[.25,.25],[.75,.75]],                                      // 2
  [[.25,.25],[.5,.5],[.75,.75]],                             // 3
  [[.25,.25],[.75,.25],[.25,.75],[.75,.75]],                 // 4
  [[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],         // 5
  [[.25,.25],[.75,.25],[.25,.5],[.75,.5],[.25,.75],[.75,.75]], // 6
];

function Dice3D({value,rolling,size=72}){
  const canvasRef=useRef(null);
  const animRef=useRef(null);
  const angleRef=useRef({x:0.5,y:0.3,z:0});
  const velRef=useRef({x:rolling?0.18:0,y:rolling?0.22:0,z:rolling?0.08:0});

  const FACE_MAP=[null,[0],[1],[2],[3],[4],[5]]; // value→face index

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const S=size*window.devicePixelRatio||size;
    canvas.width=S;canvas.height=S;
    const sc=S/72;

    const vertices=[
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
    ];
    const faces=[
      {verts:[0,1,2,3],norm:[0,0,-1],faceIdx:0}, // back=1
      {verts:[4,5,6,7],norm:[0,0,1], faceIdx:5}, // front=6
      {verts:[0,4,7,3],norm:[-1,0,0],faceIdx:3}, // left=4
      {verts:[1,5,6,2],norm:[1,0,0], faceIdx:2}, // right=3
      {verts:[0,1,5,4],norm:[0,-1,0],faceIdx:1}, // top=2
      {verts:[3,2,6,7],norm:[0,1,0], faceIdx:4}, // bottom=5
    ];

    // When settled, orient so value face is front
    const targetAngles={
      1:{x:0,y:Math.PI},  2:{x:-Math.PI/2,y:0},  3:{x:0,y:Math.PI/2},
      4:{x:0,y:-Math.PI/2},5:{x:Math.PI/2,y:0},  6:{x:0,y:0},
    };

    function rotX(v,a){return[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];}
    function rotY(v,a){return[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];}
    function rotZ(v,a){return[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];}
    function proj(v){const z=v[2]+4;const f=S*0.32;return[v[0]/z*f+S/2,v[1]/z*f+S/2];}
    function dotProduct(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}

    let settled=false;

    function draw(){
      ctx.clearRect(0,0,S,S);
      const {x,y,z}=angleRef.current;

      // Transform all vertices
      const tv=vertices.map(v=>{let u=rotX(v,x);u=rotY(u,y);u=rotZ(u,z);return u;});

      // Sort faces by Z (painter's algorithm)
      const sortedFaces=[...faces].map(f=>{
        const center=f.verts.reduce((acc,i)=>[acc[0]+tv[i][0]/4,acc[1]+tv[i][1]/4,acc[2]+tv[i][2]/4],[0,0,0]);
        return{...f,centerZ:center[2]};
      }).sort((a,b)=>a.centerZ-b.centerZ);

      sortedFaces.forEach(face=>{
        const pts=face.verts.map(i=>proj(tv[i]));
        // Calculate normal in view space
        const tn=rotX(rotY(face.norm,y),x);
        const light=dotProduct(tn,[0.2,-0.6,0.8]);
        const visible=tn[2]>-0.1;
        if(!visible)return;

        // Face color
        const brightness=Math.max(0.3,light*0.7+0.3);
        const r=Math.round(40+brightness*180);
        const g=Math.round(30+brightness*140);
        const b2=Math.round(20+brightness*80);

        ctx.beginPath();
        ctx.moveTo(pts[0][0],pts[0][1]);
        pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
        ctx.closePath();

        // Face gradient
        const grad=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
        grad.addColorStop(0,`rgba(${Math.min(255,r+30)},${Math.min(255,g+20)},${Math.min(255,b2+10)},1)`);
        grad.addColorStop(1,`rgba(${r},${g},${b2},1)`);
        ctx.fillStyle=grad;
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle=`rgba(201,168,76,${0.3*brightness})`;
        ctx.lineWidth=1*sc;
        ctx.stroke();

        // Pips
        if(visible&&tn[2]>0.3){
          const faceIdx=face.faceIdx;
          const pips=DICE_FACES[faceIdx]||[];
          const [p0,p1,p2,p3]=pts;
          pips.forEach(([u,v])=>{
            // Bilinear interpolation on face
            const tx1=[p0[0]+(p1[0]-p0[0])*u, p0[1]+(p1[1]-p0[1])*u];
            const tx2=[p3[0]+(p2[0]-p3[0])*u, p3[1]+(p2[1]-p3[1])*u];
            const px=tx1[0]+(tx2[0]-tx1[0])*v;
            const py=tx1[1]+(tx2[1]-tx1[1])*v;
            const pr=3.2*sc*brightness;

            ctx.beginPath();
            ctx.arc(px,py,pr,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,230,150,${0.85*brightness})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px-pr*0.3,py-pr*0.3,pr*0.35,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,255,255,${0.4*brightness})`;
            ctx.fill();
          });
        }
      });

      // Outer glow when rolling
      if(rolling){
        const grd=ctx.createRadialGradient(S/2,S/2,S*0.3,S/2,S/2,S*0.52);
        grd.addColorStop(0,"rgba(201,168,76,0)");
        grd.addColorStop(1,"rgba(201,168,76,0.25)");
        ctx.fillStyle=grd;
        ctx.beginPath();ctx.arc(S/2,S/2,S*0.52,0,Math.PI*2);ctx.fill();
      }
    }

    function animate(){
      if(rolling){
        angleRef.current.x+=velRef.current.x;
        angleRef.current.y+=velRef.current.y;
        angleRef.current.z+=velRef.current.z;
        velRef.current.x*=0.995;velRef.current.y*=0.995;velRef.current.z*=0.995;
      } else if(!settled&&value){
        const target=targetAngles[value]||{x:0,y:0};
        angleRef.current.x+=(target.x-angleRef.current.x)*0.1;
        angleRef.current.y+=(target.y-angleRef.current.y)*0.1;
        if(Math.abs(target.x-angleRef.current.x)<0.01&&Math.abs(target.y-angleRef.current.y)<0.01){
          settled=true;angleRef.current.x=target.x;angleRef.current.y=target.y;
        }
      }
      draw();
      animRef.current=requestAnimationFrame(animate);
    }

    if(rolling){velRef.current={x:0.15+Math.random()*0.1,y:0.18+Math.random()*0.12,z:0.06+Math.random()*0.08};}
    settled=false;
    animRef.current=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(animRef.current);
  },[value,rolling,size]);

  return<canvas ref={canvasRef} style={{width:size,height:size,display:"block"}}/>;
}

// ── PARTICLE SYSTEM ────────────────────────────────────────────────────────────
function Particles({x,y,color,count=24,onDone}){
  const [particles]=useState(()=>Array.from({length:count},(_,i)=>{
    const a=Math.random()*Math.PI*2;
    const s=Math.random()*60+30;
    return{id:i,dx:Math.cos(a)*s,dy:Math.sin(a)*s-30,size:Math.random()*6+3,delay:Math.random()*0.2,emoji:Math.random()>.7?["✨","🌟","💫","⭐"][Math.floor(Math.random()*4)]:null};
  }));
  useEffect(()=>{const t=setTimeout(()=>onDone&&onDone(),900);return()=>clearTimeout(t);},[]);
  return<div style={{position:"fixed",left:x,top:y,zIndex:500,pointerEvents:"none"}}>
    {particles.map(p=><div key={p.id} style={{position:"absolute",width:p.size,height:p.size,background:p.emoji?"transparent":color,borderRadius:"50%",boxShadow:p.emoji?"none":`0 0 ${p.size*2}px ${color}`,fontSize:p.emoji?14:0,animation:`floatUp 0.8s ${p.delay}s ease-out forwards`,transform:`translate(${p.dx}px,${p.dy}px)`,opacity:0}}>
      {p.emoji||""}
    </div>)}
  </div>;
}

// ── MINI GAMES ──────────────────────────────────────────────────────────────────
function QuizGame({onResult}){
  const [q]=useState(()=>QUIZZES[Math.floor(Math.random()*QUIZZES.length)]);
  const [sel,setSel]=useState(null);
  const [time,setTime]=useState(10);
  const [done,setDone]=useState(false);
  useEffect(()=>{if(done)return;const t=setInterval(()=>setTime(x=>{if(x<=1){clearInterval(t);setDone(true);onResult(false,0);return 0;}return x-1;}),1000);return()=>clearInterval(t);},[done]);
  const pick=(i)=>{if(done)return;setSel(i);setDone(true);const ok=i===q.ok;setTimeout(()=>onResult(ok,ok?20:0),600);};
  return<div style={{display:"flex",flexDirection:"column",gap:10,animation:"slideUp .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>⚡ Gyors Kvíz</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"1.1rem",color:time<=3?"#EF9A9A":"var(--gold)",fontWeight:"bold",minWidth:30,textAlign:"right"}}>{time}s</div>
    </div>
    <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${time/10*100}%`,background:`linear-gradient(90deg,${time<=3?"#E74C3C":"var(--gold)"},${time<=3?"#FF5722":"#FFD700"})`,transition:"width 1s linear",boxShadow:`0 0 8px ${time<=3?"#E74C3C":"var(--gold)"}`}}/>
    </div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1rem",color:"#EDE8E0",lineHeight:1.5,padding:"10px 0"}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {q.opts.map((o,i)=>{
        let bg="rgba(0,0,0,.3)",border="rgba(201,168,76,.12)",tc="var(--text)";
        if(done&&i===q.ok){bg="rgba(102,187,106,.18)";border="#66BB6A";tc="#66BB6A";}
        else if(done&&sel===i&&i!==q.ok){bg="rgba(229,57,53,.15)";border="#E53935";tc="#EF9A9A";}
        return<button key={i} onClick={()=>pick(i)} style={{padding:"9px 14px",background:bg,border:`1px solid ${border}`,color:tc,fontFamily:"'EB Garamond',serif",fontSize:".92rem",textAlign:"left",cursor:done?"default":"pointer",transition:"all .2s",borderRadius:2}}>
          {done&&i===q.ok&&"✓ "}{done&&sel===i&&i!==q.ok&&"✗ "}{o}
        </button>;
      })}
    </div>
  </div>;
}

function GollamGame({onResult}){
  const [q]=useState(()=>RIDDLES[Math.floor(Math.random()*RIDDLES.length)]);
  const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const pick=(i)=>{if(done)return;setSel(i);setDone(true);const ok=i===q.ok;setTimeout(()=>onResult(ok,ok?25:0),600);};
  return<div style={{display:"flex",flexDirection:"column",gap:10,animation:"slideUp .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"#9B59B6",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Gollam találós kérdése</div>
    <div style={{padding:"14px",background:"rgba(20,10,40,.6)",border:"1px solid rgba(155,89,182,.3)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",fontStyle:"italic",color:"#D7BDE2",lineHeight:1.7,boxShadow:"inset 0 0 30px rgba(155,89,182,.1)"}}>
      <span style={{color:"#9B59B6",fontSize:"1.1em"}}>Gollam:</span> "Találós kérdés! Találós kérdés! Ha megfejtesz — élhetsz. Ha nem — megeszünk, igen Gollam Gollam!"<br/><br/><strong style={{fontStyle:"normal",color:"#EDE8E0",fontSize:"1.05em"}}>{q.q}</strong>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {q.opts.map((o,i)=>{
        let border="rgba(155,89,182,.25)";
        if(done&&i===q.ok)border="#66BB6A";else if(done&&sel===i)border="#E53935";
        return<button key={i} onClick={()=>pick(i)} style={{padding:"9px 14px",background:"rgba(20,10,40,.4)",border:`1px solid ${border}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",textAlign:"left",cursor:done?"default":"pointer",transition:"border .2s"}}>{o}</button>;
      })}
    </div>
  </div>;
}

function RuneGame({onResult}){
  const [rune]=useState(()=>RUNES[Math.floor(Math.random()*RUNES.length)]);
  const [input,setInput]=useState("");const [done,setDone]=useState(false);
  const check=()=>{if(done)return;const ok=input.toUpperCase()===rune.answer;setDone(true);setTimeout(()=>onResult(ok,ok?30:0),600);};
  return<div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",animation:"slideUp .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"#3A7A8B",letterSpacing:".1em",textTransform:"uppercase",alignSelf:"flex-start"}}>🔮 Rúna Felismerés</div>
    <div style={{fontSize:"5.5rem",lineHeight:1,filter:"drop-shadow(0 0 20px rgba(58,122,139,.8)) drop-shadow(0 0 40px rgba(58,122,139,.4))"}}>{rune.rune}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",textAlign:"center"}}>({rune.name} — melyik betű?)</div>
    <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Betű..." disabled={done}
      style={{background:"rgba(0,0,0,.5)",border:"1px solid rgba(58,122,139,.5)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:"1.5rem",padding:"8px 20px",outline:"none",textAlign:"center",width:120,letterSpacing:".15em"}}/>
    {!done&&<button className="epic-btn" onClick={check} style={{padding:"8px 24px",background:"rgba(58,122,139,.15)",border:"1px solid rgba(58,122,139,.5)",color:"#5DADE2",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",letterSpacing:".1em",textTransform:"uppercase"}}>Elküld</button>}
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:input.toUpperCase()===rune.answer?"#66BB6A":"#EF9A9A"}}>{input.toUpperCase()===rune.answer?"✓ Helyes!":"✗ Helytelen!"}</div>}
  </div>;
}

function SpotRing({onResult}){
  const [pos]=useState(()=>Math.floor(Math.random()*9));
  const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const icons=["🗡️","🏹","⚔️","🛡️","🔮","🪓","🗺️","🧢","💰"];
  const pick=(i)=>{if(done)return;setSel(i);setDone(true);const ok=i===pos;setTimeout(()=>onResult(ok,ok?40:0),500);};
  return<div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center",animation:"slideUp .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Hol a Gyűrű?</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",textAlign:"center",fontStyle:"italic"}}>Egyik tárgy alatt rejtőzik...</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
      {icons.map((ic,i)=>{
        let brd="rgba(201,168,76,.12)",bg="rgba(0,0,0,.3)";
        if(done&&i===pos){brd="#FFD700";bg="rgba(201,168,76,.18)";}else if(done&&sel===i){brd="#E53935";bg="rgba(229,57,53,.1)";}
        return<button key={i} onClick={()=>pick(i)} style={{width:54,height:54,fontSize:"1.6rem",background:bg,border:`1px solid ${brd}`,cursor:done?"default":"pointer",transition:"all .18s",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:done&&i===pos?"0 0 16px rgba(255,215,0,.4)":"none"}}>
          {done&&i===pos?"💍":ic}
        </button>;
      })}
    </div>
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:sel===pos?"#66BB6A":"#EF9A9A"}}>{sel===pos?"✓ Megtaláltad!":"✗ Nem ott volt..."}</div>}
  </div>;
}

// ── FIELD EVENT MODAL ──────────────────────────────────────────────────────────
function FieldEventModal({field,onResult}){
  const [phase,setPhase]=useState("intro");
  const [pts,setPts]=useState(0);const [won,setWon]=useState(false);
  const typeInfo={
    bonus:{color:"#5DADE2",bg:"rgba(26,82,118,.25)",glow:"rgba(93,173,226,.3)",title:"Bónusz!",icon:"✨"},
    trap:{color:"#E74C3C",bg:"rgba(123,0,0,.25)",glow:"rgba(231,76,60,.3)",title:"Csapda!",icon:"⚠️"},
    quiz:{color:"#A569BD",bg:"rgba(59,29,110,.25)",glow:"rgba(165,105,189,.3)",title:"Kvíz Kihívás!",icon:"❓"},
    minigame:{color:"#E67E22",bg:"rgba(125,60,0,.25)",glow:"rgba(230,126,34,.3)",title:"Minijáték!",icon:"🎮"},
    gollam:{color:"#8E44AD",bg:"rgba(20,10,40,.5)",glow:"rgba(142,68,173,.4)",title:"Gollam!",icon:"💍"},
    smaug:{color:"#FF5252",bg:"rgba(139,0,0,.35)",glow:"rgba(255,82,82,.4)",title:"SMAUG!",icon:"🔥"},
    finish:{color:"#FFD700",bg:"rgba(184,134,11,.2)",glow:"rgba(255,215,0,.4)",title:"GYŐZELEM!",icon:"🏆"},
  };
  const info=typeInfo[field.type]||{color:"var(--gold)",bg:"rgba(0,0,0,.3)",glow:"rgba(201,168,76,.2)",title:"Mező",icon:"🗺️"};
  const handleResult=(ok,p)=>{setWon(ok);setPts(p);setPhase("result");setTimeout(()=>onResult({ok,pts:p,field}),1200);};

  return<div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(2,1,0,.97)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"zoomIn .25s cubic-bezier(.4,0,.2,1)"}}>
    {/* Background glow */}
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 40%,${info.glow},transparent 65%)`,pointerEvents:"none"}}/>
    <div style={{width:"100%",maxWidth:380,background:`linear-gradient(170deg,rgba(15,10,6,.98),rgba(5,3,2,.98))`,border:`1px solid ${info.color}33`,padding:"22px 20px",display:"flex",flexDirection:"column",gap:16,maxHeight:"85vh",overflowY:"auto",boxShadow:`0 0 60px ${info.glow},0 0 120px rgba(0,0,0,.8)`,position:"relative"}}>
      {/* Corner ornaments */}
      {["tl","tr","bl","br"].map(c=><div key={c} style={{position:"absolute",[c.includes("t")?"top":"bottom"]:6,[c.includes("l")?"left":"right"]:6,width:12,height:12,borderTop:c.includes("t")?`1px solid ${info.color}55`:"none",borderBottom:c.includes("b")?`1px solid ${info.color}55`:"none",borderLeft:c.includes("l")?`1px solid ${info.color}55`:"none",borderRight:c.includes("r")?`1px solid ${info.color}55`:"none"}}/>)}

      {phase==="intro"&&<>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"3rem",marginBottom:8,filter:`drop-shadow(0 0 20px ${info.glow})`}}>{field.icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:info.color,animation:"goldPulse 2s ease infinite"}}>{info.title}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",marginTop:5,letterSpacing:".08em"}}>{field.name}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".9rem",color:"var(--td)",marginTop:10,fontStyle:"italic",lineHeight:1.7}}>
            {field.type==="smaug"?"A tűzokádó sárkány észrevett! Lángjai elérnek téged, kalandor!":field.type==="finish"?"Elértél Ereborig! A törpék kincse a tiéd! A kaland véget ért!":field.type==="trap"?"Csapda! A Középföld nem könyörül a vigyázatlanokra...":field.type==="bonus"?"A szerencse mosolyog rád, kalandor!":"A kihívás vár. Bizonyítsd be bátorságodat!"}
          </div>
        </div>

        {(field.type==="trap"||field.type==="smaug")&&<>
          <div style={{padding:"12px",background:info.bg,border:`1px solid ${info.color}30`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".7rem",color:info.color}}>
            {field.type==="smaug"?"🔥 Smaug tüze: −30 pont!":"⚠️ Visszalépsz 2 mezőt és kimaradsz egy körből!"}
          </div>
          <button className="epic-btn" onClick={()=>onResult({ok:false,pts:field.type==="smaug"?-30:-5,field})} style={{padding:"11px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:".1em"}}>Elfogadom ✗</button>
        </>}
        {field.type==="bonus"&&<>
          <div style={{padding:"12px",background:info.bg,border:`1px solid ${info.color}35`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".75rem",color:info.color,boxShadow:`inset 0 0 20px ${info.glow}`}}>✨ +20 pont!</div>
          <button className="epic-btn" onClick={()=>onResult({ok:true,pts:20,field})} style={{padding:"11px",background:info.bg,border:`1px solid ${info.color}55`,color:info.color,fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:".1em"}}>Elfogadom ✓</button>
        </>}
        {field.type==="finish"&&<button className="epic-btn" onClick={()=>onResult({ok:true,pts:100,field,win:true})} style={{padding:"14px",background:"rgba(184,134,11,.15)",border:"1px solid rgba(255,215,0,.5)",color:"#FFD700",fontFamily:"'Cinzel Decorative',serif",fontSize:".85rem",cursor:"pointer",textShadow:"0 0 20px rgba(255,215,0,.6)",boxShadow:"0 0 30px rgba(255,215,0,.2)"}}>🏆 A KINCS A TIÉD! 🏆</button>}
        {(field.type==="quiz"||field.type==="minigame"||field.type==="gollam")&&
          <button className="epic-btn" onClick={()=>setPhase("game")} style={{padding:"12px",background:info.bg,border:`1px solid ${info.color}55`,color:info.color,fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase",boxShadow:`0 0 20px ${info.glow}`}}>⚔️ Kihívás elfogadása</button>
        }
      </>}

      {phase==="game"&&<>
        {(field.type==="quiz"||[27,28,30,33,39,43].includes(field.id))&&<QuizGame onResult={handleResult}/>}
        {field.type==="gollam"&&<GollamGame onResult={handleResult}/>}
        {[10,35].includes(field.id)&&<RuneGame onResult={handleResult}/>}
        {field.id===17&&<SpotRing onResult={handleResult}/>}
        {field.type==="minigame"&&![10,17,27,35].includes(field.id)&&<QuizGame onResult={handleResult}/>}
      </>}

      {phase==="result"&&<div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:14,alignItems:"center",animation:"winnerBlast .5s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{fontSize:"4rem",filter:`drop-shadow(0 0 30px ${won?"rgba(255,215,0,.6)":"rgba(229,57,53,.5)"})`}}>{won?"🎉":"😔"}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:won?"var(--gold)":"#EF9A9A",animation:"goldPulse 1.5s ease infinite"}}>{won?"Brilliáns! Sikeres!":"Sajnálom, nem sikerült..."}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:"var(--gm)"}}>Pontok: <span style={{color:"var(--gold)",fontSize:"1rem",fontWeight:"bold"}}>{pts>0?"+":""}{pts}</span></div>
      </div>}
    </div>
  </div>;
}

// ── EPIC ISOMETRIC BOARD ───────────────────────────────────────────────────────
function EpicBoard({players,myPosition,onFieldClick}){
  const pathD=FIELDS.map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" ");
  const travelledD=myPosition>0?FIELDS.slice(0,myPosition+1).map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" "):null;

  // Fog overlay for Mirkwood
  const fogFields=FIELDS.filter(f=>f.region==="mirkwood");
  const fogCX=fogFields.reduce((a,f)=>a+f.x,0)/fogFields.length;
  const fogCY=fogFields.reduce((a,f)=>a+f.y,0)/fogFields.length;

  function Tree3D({x,y,s=1,dark=false}){
    const col=dark?"#0d2a0d":"#3a6820";const col2=dark?"#0a1f0a":"#2a5015";
    return<g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="0" cy="0.5" rx="1.5" ry="0.6" fill="rgba(0,0,0,0.35)"/>
      <polygon points="0,-4 2.5,0.5 -2.5,0.5" fill={col2} opacity="0.75"/>
      <polygon points="0,-3 1.8,0 -1.8,0" fill={col} opacity="0.9"/>
      <rect x="-0.4" y="0.5" width="0.8" height="1.5" fill="#2a1a0a" opacity="0.8"/>
    </g>;
  }

  function Mountain3D({x,y,s=1,gold=false}){
    const col=gold?"#8B6914":"#4a4a6a";const snow=gold?"rgba(255,215,0,.4)":"rgba(255,255,255,.35)";
    return<g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="0" cy="0.5" rx="3" ry="1" fill="rgba(0,0,0,0.3)"/>
      <polygon points="0,-7 4.5,0.5 -4.5,0.5" fill={col} opacity="0.7"/>
      <polygon points="-1.5,-3.5 2,0.5 -4.5,0.5" fill="rgba(0,0,0,0.2)"/>
      <polygon points="0,-7 1.2,-4.5 -1.2,-4.5" fill={snow}/>
    </g>;
  }

  const typeR={start:2.7,finish:3.0,bonus:2.3,trap:2.1,quiz:2.3,minigame:2.3,gollam:2.3,smaug:2.7,normal:1.9};

  return(
    <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
      {/* Stars background */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%,rgba(30,20,10,.0) 0%,rgba(5,3,2,1) 100%)"}}/>

      <svg viewBox="0 0 96 96" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="bg2" cx="35%" cy="65%" r="80%">
            <stop offset="0%" stopColor="#221808"/>
            <stop offset="50%" stopColor="#150f05"/>
            <stop offset="100%" stopColor="#060402"/>
          </radialGradient>
          <radialGradient id="shireRg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#2a6a10" stopOpacity="0.55"/><stop offset="100%" stopColor="#2a6a10" stopOpacity="0"/></radialGradient>
          <radialGradient id="mirkRg"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#050f05" stopOpacity="0.85"/><stop offset="100%" stopColor="#050f05" stopOpacity="0"/></radialGradient>
          <radialGradient id="erebRg"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#8b6200" stopOpacity="0.5"/><stop offset="100%" stopColor="#8b6200" stopOpacity="0"/></radialGradient>
          <radialGradient id="lakeRg"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0a3a6a" stopOpacity="0.55"/><stop offset="100%" stopColor="#0a3a6a" stopOpacity="0"/></radialGradient>
          <radialGradient id="mountRg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#2a2a4a" stopOpacity="0.45"/><stop offset="100%" stopColor="#2a2a4a" stopOpacity="0"/></radialGradient>

          <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="deepShadow"><feDropShadow dx="0.3" dy="0.6" stdDeviation="0.6" floodOpacity="0.6"/></filter>
          <filter id="fireGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b"/><feColorMatrix type="matrix" values="1 0.3 0 0 0  0.3 0.1 0 0 0  0 0 0 0 0  0 0 0 1.5 0" in="b" result="fire"/>
            <feMerge><feMergeNode in="fire"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Animated travelled path */}
          <style>{`
            @keyframes dashFlow{to{stroke-dashoffset:-10}}
            @keyframes fieldPulse{0%,100%{r:var(--r)}50%{r:calc(var(--r) + 0.4px)}}
          `}</style>

          <pattern id="grassT" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="1" y1="3" x2="1.5" y2="1" stroke="rgba(50,100,20,0.1)" strokeWidth="0.4"/>
            <line x1="3" y1="3" x2="2.5" y2="1.2" stroke="rgba(50,100,20,0.08)" strokeWidth="0.4"/>
          </pattern>
          <pattern id="stoneT" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.3" fill="rgba(100,80,50,0.08)"/>
          </pattern>
        </defs>

        {/* BG */}
        <rect width="96" height="96" fill="url(#bg2)"/>
        <rect width="96" height="96" fill="url(#stoneT)" opacity="0.5"/>

        {/* Starfield */}
        {[[8,5],[15,12],[25,8],[45,3],[60,7],[72,4],[85,9],[90,15],[88,22],[5,30],[3,50],[7,70],[91,40],[93,60],[87,75]].map(([sx,sy],i)=>
          <circle key={i} cx={sx} cy={sy} r="0.25" fill="rgba(255,240,200,.6)" style={{animation:`starTwinkle ${1.5+i*0.3}s ${i*0.2}s ease-in-out infinite`}}/>
        )}

        {/* TERRAIN REGIONS */}
        <ellipse cx="20" cy="84" rx="18" ry="12" fill="url(#shireRg)"/>
        <ellipse cx="20" cy="84" rx="18" ry="12" fill="url(#grassT)" opacity="0.7"/>
        <ellipse cx="50" cy="51" rx="9" ry="7" fill="url(#lakeRg)" opacity="0.7"/>
        <ellipse cx="59" cy="40" rx="11" ry="11" fill="url(#mountRg)"/>
        <ellipse cx="77" cy="19" rx="14" ry="11" fill="url(#mirkRg)"/>
        <path d="M63,13 Q70,8 83,12 Q91,16 86,28 Q78,34 64,28 Q56,22 63,13Z" fill="rgba(5,15,5,0.35)"/>
        <ellipse cx="82" cy="23" rx="9" ry="6" fill="url(#lakeRg)"/>
        <ellipse cx="71" cy="47" rx="17" ry="14" fill="url(#erebRg)"/>

        {/* NATURE DECORATIONS */}
        <Tree3D x="7"  y="89" s="0.75" dark={false}/>
        <Tree3D x="11" y="91" s="0.9"  dark={false}/>
        <Tree3D x="28" y="86" s="0.65" dark={false}/>
        <Tree3D x="33" y="88" s="0.7"  dark={false}/>
        <Tree3D x="64" y="11" s="0.85" dark={true}/>
        <Tree3D x="70" y="9"  s="1.0"  dark={true}/>
        <Tree3D x="82" y="10" s="0.9"  dark={true}/>
        <Tree3D x="87" y="13" s="0.75" dark={true}/>
        <Tree3D x="60" y="15" s="0.7"  dark={true}/>
        <Tree3D x="37" y="64" s="0.6"  dark={false}/>
        <Tree3D x="50" y="55" s="0.5"  dark={false}/>

        <Mountain3D x="55" y="34" s="0.9"/>
        <Mountain3D x="61" y="29" s="1.1"/>
        <Mountain3D x="67" y="33" s="0.85"/>
        <Mountain3D x="71" y="37" s="1.4" gold={true}/>
        {/* Erebor golden peak glow */}
        <ellipse cx="71" cy="35" rx="4" ry="2" fill="rgba(201,168,76,.12)" style={{animation:"smaugFire 3s ease-in-out infinite"}}/>

        {/* Water - Lake-town shimmer */}
        <ellipse cx="82" cy="23" rx="7" ry="4.5" fill="rgba(15,60,110,.4)"/>
        <path d="M75,22 Q78,20 82,21 Q86,20 89,22 Q87,25 82,25 Q77,25 75,22Z" fill="rgba(20,80,150,.25)"/>
        {[0,1,2].map(i=><line key={i} x1={76+i*3} y1={22+i*0.5} x2={79+i*3} y2={22+i*0.5} stroke="rgba(100,180,255,.25)" strokeWidth="0.5"/>)}
        <path d="M68,28 Q72,30 76,28 Q80,26 83,28" fill="none" stroke="rgba(80,160,220,.2)" strokeWidth="0.7"/>

        {/* SMAUG FIRE atmosphere */}
        <ellipse cx="74" cy="40" rx="8" ry="4" fill="rgba(255,70,0,.06)" style={{animation:"smaugFire 2s ease-in-out infinite"}}/>

        {/* MIRKWOOD FOG */}
        <ellipse cx={fogCX} cy={fogCY} rx="14" ry="10" fill="rgba(5,20,5,.3)" style={{animation:"fogDrift 8s ease-in-out infinite"}} opacity="0.6"/>
        <ellipse cx={fogCX+3} cy={fogCY-2} rx="10" ry="7" fill="rgba(10,30,10,.25)" style={{animation:"fogDrift 10s 2s ease-in-out infinite"}} opacity="0.5"/>

        {/* ROAD - 3 layers for depth */}
        <path d={pathD} fill="none" stroke="rgba(0,0,0,.7)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={pathD} fill="none" stroke="#3a2810" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={pathD} fill="none" stroke="#5a4025" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,4" opacity="0.6"/>
        {/* Travelled glow */}
        {travelledD&&<>
          <path d={travelledD} fill="none" stroke="rgba(201,168,76,.18)" strokeWidth="2.8" strokeLinecap="round"/>
          <path d={travelledD} fill="none" stroke="rgba(201,168,76,.55)" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,3" style={{animation:"dashFlow 1s linear infinite"}}/>
        </>}

        {/* FIELD NODES */}
        {FIELDS.map(f=>{
          const fill=FIELD_COLORS[f.type]||"#2e2416";
          const stroke=FIELD_STROKES[f.type]||"#8D7645";
          const r=typeR[f.type]||1.9;
          const playersHere=players.filter(p=>p.position===f.id);
          const isMyPos=myPosition===f.id;
          const isSpecial=f.type!=="normal";

          return<g key={f.id} onClick={()=>onFieldClick(f)} style={{cursor:"pointer"}} filter="url(#deepShadow)">
            {/* Field aura */}
            {isSpecial&&<circle cx={f.x} cy={f.y} r={r+2.5} fill={stroke} opacity={isMyPos?"0.18":"0.08"}/>}
            {isMyPos&&<>
              <circle cx={f.x} cy={f.y} r={r+4} fill="none" stroke="rgba(255,215,0,.2)" strokeWidth="0.5" style={{animation:"ripple 1.5s ease-out infinite"}}/>
              <circle cx={f.x} cy={f.y} r={r+2.5} fill="none" stroke="rgba(255,215,0,.4)" strokeWidth="0.5" style={{animation:"ripple 1.5s .4s ease-out infinite"}}/>
            </>}
            {/* Field body */}
            <circle cx={f.x} cy={f.y} r={r+0.6} fill={fill} opacity="0.45"/>
            <circle cx={f.x} cy={f.y} r={r} fill={fill} stroke={isMyPos?"#FFD700":stroke} strokeWidth={isMyPos?"0.7":isSpecial?"0.45":"0.25"}/>
            {/* Inner highlight */}
            <circle cx={f.x-r*0.22} cy={f.y-r*0.22} r={r*0.5} fill="rgba(255,255,255,0.07)"/>
            {/* Smaug fire effect */}
            {f.type==="smaug"&&<circle cx={f.x} cy={f.y} r={r+1} fill="rgba(255,60,0,.12)" filter="url(#fireGlow)" style={{animation:"smaugFire 1.5s ease-in-out infinite"}}/>}
            {/* Gollam glow */}
            {f.type==="gollam"&&<circle cx={f.x} cy={f.y} r={r+1.2} fill="rgba(142,68,173,.1)" filter="url(#glow2)" style={{animation:"smaugFire 2s ease-in-out infinite"}}/>}
            {/* Icon */}
            <text x={f.x} y={f.y+0.7} textAnchor="middle" dominantBaseline="middle" fontSize={f.type==="start"||f.type==="finish"?"2.8":isSpecial?"2.2":"1.95"}>{f.icon}</text>
            {/* Player tokens */}
            {playersHere.map((p,i)=>{
              const rc=getRace(p.race);
              const ox=(i-(playersHere.length-1)/2)*2.8;
              const isMe2=p.name===players.find(pl=>pl.isMe)?.name;
              return<g key={p.name} transform={`translate(${f.x+ox},${f.y-r-2.0})`} style={{animation:isMe2?"tokenBounce 1.2s ease-in-out infinite":"none"}}>
                <ellipse cx="0.2" cy="1.6" rx="1.0" ry="0.4" fill="rgba(0,0,0,0.45)"/>
                <circle cx="0" cy="0" r="1.25" fill={rc.color} stroke={isMe2?"#FFD700":"rgba(0,0,0,.6)"} strokeWidth={isMe2?"0.4":"0.2"}/>
                <circle cx="-0.35" cy="-0.35" r="0.4" fill="rgba(255,255,255,.28)"/>
                <text x="0" y="0.4" textAnchor="middle" dominantBaseline="middle" fontSize="1.0">{rc.icon}</text>
                {isMe2&&<circle cx="0" cy="0" r="1.6" fill="none" stroke="rgba(255,215,0,.5)" strokeWidth="0.25" style={{animation:"ripple 1.8s ease-out infinite"}}/>}
              </g>;
            })}
          </g>;
        })}

        {/* Key location labels */}
        {[{id:0,dy:4},{id:8,dy:-4.5},{id:11,dy:4},{id:14,dy:-4.5},{id:22,dy:3.5},{id:25,dy:-4.5},{id:28,dy:3.5},{id:44,dy:-4.5}].map(({id,dy})=>{
          const f=FIELDS[id];
          const stroke=FIELD_STROKES[f.type]||"#8D7645";
          return<text key={id} x={f.x} y={f.y+dy} textAnchor="middle" fontSize="1.3" fill={stroke} fontFamily="Cinzel,serif" fontStyle="italic" opacity="0.8">{f.name.split(" ")[0]}</text>;
        })}

        {/* LEGEND */}
        <g transform="translate(2,2)">
          <rect width="15" height="12" rx="1" fill="rgba(0,0,0,.6)" stroke="rgba(201,168,76,.12)" strokeWidth="0.3"/>
          {[["#4a7a2a","#8BC34A","Bónusz"],["#7b0000","#E74C3C","Csapda"],["#3b1d6e","#A569BD","Kvíz"],["#7d3c00","#E67E22","Mini"]].map(([f,s,l],i)=>
            <g key={i} transform={`translate(1,${1.4+i*2.4})`}>
              <circle cx="1" cy="0" r="0.75" fill={f} stroke={s} strokeWidth="0.3"/>
              <text x="2.5" y="0.4" fontSize="1.2" fill="rgba(201,168,76,.5)" fontFamily="Cinzel,serif">{l}</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

// ── MAIN BOARD GAME ────────────────────────────────────────────────────────────
export default function BoardGame({user}){
  const [screen,setScreenRaw]=useState(()=>localStorage.getItem("hb_screen")||"lobby");
  const [gameId,setGameIdRaw]=useState(()=>localStorage.getItem("hb_gameId")||null);
  const [gameData,setGameData]=useState(null);
  const [playerId]=useState(()=>user?.adventureName||"Játékos_"+genId());
  const [chatMsg,setChatMsg]=useState("");
  const [eventField,setEventField]=useState(null);
  const [diceValues,setDiceValues]=useState({}); // per-player dice
  const [rolling,setRolling]=useState(false);
  const [notification,setNotification]=useState(null);
  const [joinCode,setJoinCode]=useState("");
  const [selectedField,setSelectedField]=useState(null);
  const [invites,setInvites]=useState([]);
  const [friends,setFriends]=useState([]);
  const [particles,setParticles]=useState([]);
  const chatRef=useRef(null);
  const screenRef=useRef(screen);
  const race=getRace(user?.race);

  const setScreen=(s)=>{setScreenRaw(s);screenRef.current=s;localStorage.setItem("hb_screen",s);};
  const setGameId=(id)=>{setGameIdRaw(id);id?localStorage.setItem("hb_gameId",id):localStorage.removeItem("hb_gameId");};

  const notify=(msg,color="var(--gold)",dur=2800)=>{setNotification({msg,color});setTimeout(()=>setNotification(null),dur);};

  const spawnParticles=(color="#C9A84C")=>{
    const id=Date.now();
    setParticles(p=>[...p,{id,x:window.innerWidth/2,y:window.innerHeight/2,color}]);
    setTimeout(()=>setParticles(p=>p.filter(x=>x.id!==id)),1000);
  };

  useEffect(()=>{
    if(!playerId)return;
    const fr=ref(db,`users/${playerId}/friends`);
    onValue(fr,(s)=>setFriends(Object.values(s.val()||{})));
    const ir=ref(db,`users/${playerId}/gameInvites`);
    onValue(ir,(s)=>setInvites(Object.values(s.val()||{})));
    return()=>{off(fr);off(ir);};
  },[playerId]);

  useEffect(()=>{
    if(!gameId)return;
    const gr=ref(db,`games/${gameId}`);
    onValue(gr,(s)=>{
      const d=s.val();
      if(d){
        setGameData(d);
        if(d.status==="playing"&&screenRef.current==="waiting")setScreen("playing");
        if(d.status==="finished"&&screenRef.current==="playing")setScreen("finished");
        // Sync dice values for all players
        if(d.diceValues)setDiceValues(d.diceValues);
      }
    });
    return()=>off(gr);
  },[gameId]);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[gameData?.chat]);

  const inviteFriendToGame=async(friendName,gid)=>{
    let id=gid||gameId;
    if(!id){
      const newId=genId();
      await set(ref(db,`games/${newId}`),{status:"waiting",host:playerId,created:Date.now(),players:{[playerId]:{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},currentTurn:playerId,turnCount:0,chat:{},winner:null,diceValues:{}});
      setGameId(newId);setScreen("waiting");id=newId;
    }
    await set(ref(db,`users/${friendName}/gameInvites/${playerId}`),{from:playerId,gameId:id,sent:Date.now()});
    notify(`Meghívó elküldve: ${friendName}! 🎲`,"#B39DDB",4000);
  };
  const acceptInvite=async(inv)=>{
    await remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));
    const snap=await get(ref(db,`games/${inv.gameId}`));
    if(!snap.exists()){notify("A szoba már nem létezik!","#EF9A9A");return;}
    await update(ref(db,`games/${inv.gameId}/players/${playerId}`),{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(inv.gameId);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };
  const declineInvite=async(inv)=>remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));

  const createGame=async()=>{
    const id=genId();
    await set(ref(db,`games/${id}`),{status:"waiting",host:playerId,created:Date.now(),players:{[playerId]:{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},currentTurn:playerId,turnCount:0,chat:{},winner:null,diceValues:{}});
    setGameId(id);setScreen("waiting");
  };
  const joinGame=async()=>{
    const id=joinCode.trim().toUpperCase();
    if(!id){notify("Írd be a szoba kódját!","#EF9A9A");return;}
    const snap=await get(ref(db,`games/${id}`));
    if(!snap.exists()){notify("Nincs ilyen szoba!","#EF9A9A");return;}
    const data=snap.val();
    if(data.status!=="waiting"){notify("A játék már elkezdődött!","#EF9A9A");return;}
    if(Object.keys(data.players||{}).length>=4){notify("A szoba tele van!","#EF9A9A");return;}
    await update(ref(db,`games/${id}/players/${playerId}`),{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(id);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };
  const startGame=async()=>{
    await update(ref(db,`games/${gameId}`),{status:"playing"});setScreen("playing");
  };

  const rollDice=async()=>{
    if(!gameData||gameData.currentTurn!==playerId||rolling||eventField)return;
    const myData=gameData.players?.[playerId];
    if(myData?.skipTurn){
      notify("Kimaradsz ebből a körből...","#EF9A9A");
      const pls=Object.keys(gameData.players);
      const next=pls[(pls.indexOf(playerId)+1)%pls.length];
      await update(ref(db,`games/${gameId}`),{currentTurn:next,turnCount:(gameData.turnCount||0)+1});
      await update(ref(db,`games/${gameId}/players/${playerId}`),{skipTurn:false});
      return;
    }
    setRolling(true);
    // Broadcast rolling state
    await update(ref(db,`games/${gameId}/diceValues/${playerId}`),{value:0,rolling:true});

    let count=0;
    const iv=setInterval(async()=>{
      const v=Math.floor(Math.random()*6)+1;
      setDiceValues(d=>({...d,[playerId]:{value:v,rolling:true}}));
      count++;
      if(count>12){
        clearInterval(iv);
        const roll=Math.floor(Math.random()*6)+1;
        const extra=myData?.extraStep||0;
        const final=roll+extra;
        setRolling(false);
        setDiceValues(d=>({...d,[playerId]:{value:roll,rolling:false}}));
        await update(ref(db,`games/${gameId}/diceValues/${playerId}`),{value:roll,rolling:false});
        const newPos=Math.min((myData?.position||0)+final,FIELDS.length-1);
        const field=FIELDS[newPos];
        await update(ref(db,`games/${gameId}/players/${playerId}`),{position:newPos,extraStep:0});
        notify(`🎲 ${roll}${extra>0?` +${extra} bónusz`:""} — ${field.name}`);
        spawnParticles(FIELD_STROKES[field.type]||"#C9A84C");
        setTimeout(()=>setEventField(field),500);
      }
    },80);
  };

  const handleEventResult=async(result)=>{
    setEventField(null);
    if(!gameData)return;
    const myData=gameData.players?.[playerId];
    let newScore=Math.max(0,(myData?.score||0)+result.pts);
    let updates={score:newScore};
    if(result.pts>0){notify(`+${result.pts} pont! ✨`,"#66BB6A");spawnParticles("#66BB6A");}
    else if(result.pts<0){notify(`${result.pts} pont...`,"#EF9A9A");spawnParticles("#E74C3C");}
    if(result.field.type==="trap"){updates.skipTurn=true;updates.position=Math.max(0,(myData?.position||0)-2);}
    if(result.field.id===24)updates.position=Math.max(0,(myData?.position||0)-3);
    if(result.field.id===25)updates.score=Math.max(0,newScore-30);
    if(result.field.id===38){updates.position=Math.min((myData?.position||0)+5,FIELDS.length-1);notify("🦅 Sasok megmentettek! +5 mező!","#3A7A8B");}
    if([8,26].includes(result.field.id))updates.position=Math.min((myData?.position||0)+2,FIELDS.length-1);
    if([2,14,22,29,32,36].includes(result.field.id)){
      const c=POWER_CARDS[Math.floor(Math.random()*POWER_CARDS.length)];
      updates.cards=[...(myData?.cards||[]),c.id];
      notify(`🃏 ${c.name} kártyát kaptál!`,"#7A4ABB");
    }
    if(result.field.id===FIELDS.length-1||result.win){
      await update(ref(db,`games/${gameId}`),{status:"finished",winner:playerId});
      await update(ref(db,`games/${gameId}/players/${playerId}`),updates);
      setScreen("finished");
      spawnParticles("#FFD700");return;
    }
    await update(ref(db,`games/${gameId}/players/${playerId}`),updates);
    const pls=Object.keys(gameData.players);
    await update(ref(db,`games/${gameId}`),{currentTurn:pls[(pls.indexOf(playerId)+1)%pls.length],turnCount:(gameData.turnCount||0)+1});
  };

  const sendChat=async(t)=>{
    if(!t.trim()||!gameId)return;
    await push(ref(db,`games/${gameId}/chat`),{player:playerId,race:user?.race||"human",text:t.trim(),time:Date.now()});
    setChatMsg("");
  };

  const myData=gameData?.players?.[playerId];
  const players=Object.values(gameData?.players||{}).map(p=>({...p,isMe:p.name===playerId}));
  const isMyTurn=gameData?.currentTurn===playerId;

  // ── LOBBY ──
  if(screen==="lobby")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:16,padding:20,overflowY:"auto",background:"radial-gradient(circle at 30% 30%,rgba(30,20,10,.4),transparent 60%)"}}>
      <style>{EPIC_CSS}</style>
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{fontSize:"2.8rem",marginBottom:8,filter:"drop-shadow(0 0 20px rgba(201,168,76,.5))",animation:"goldPulse 2.5s ease infinite"}}>🎲</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1rem,4vw,1.5rem)",color:"var(--gold)",animation:"goldPulse 3s ease infinite",letterSpacing:".05em"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)",letterSpacing:".18em",textTransform:"uppercase",marginTop:5}}>Online Társasjáték · 2–4 játékos · Firebase Multiplayer</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",fontStyle:"italic",marginTop:8,lineHeight:1.7}}>Zsákos-dombtól Ereborig. Kvízek, csapdák, Gollam találós kérdések és Smaug tüze vár rád!</div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:`rgba(${race.hex||"139,115,85"},.08)`,border:`1px solid rgba(${race.hex||"139,115,85"},.25)`,alignSelf:"center"}}>
        <span style={{fontSize:"1.3rem",filter:`drop-shadow(0 0 8px ${race.color})`}}>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{playerId}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:race.color}}>· {race.name}</span>
      </div>

      {invites.length>0&&<div style={{padding:"12px",background:"rgba(122,74,187,.07)",border:"1px solid rgba(122,74,187,.35)",boxShadow:"0 0 20px rgba(122,74,187,.1)",animation:"slideUp .3s ease"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#B39DDB",letterSpacing:".12em",textTransform:"uppercase",marginBottom:10}}>🎲 Játék meghívók ({invites.length})</div>
        {invites.map(inv=><div key={inv.from} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(122,74,187,.1)"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)",flex:1}}><span style={{color:"#B39DDB"}}>{inv.from}</span> meghívott! <span style={{color:"var(--gm)",fontSize:".58rem"}}>#{inv.gameId}</span></span>
          <button className="epic-btn" onClick={()=>acceptInvite(inv)} style={{padding:"5px 12px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.4)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:".08em"}}>✓ Csatlakozás</button>
          <button className="epic-btn" onClick={()=>declineInvite(inv)} style={{padding:"5px 8px",background:"none",border:"1px solid rgba(229,57,53,.2)",color:"rgba(229,57,53,.55)",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✗</button>
        </div>)}
      </div>}

      <button className="epic-btn" onClick={createGame} style={{padding:"13px",background:"linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.45)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".14em",cursor:"pointer",textTransform:"uppercase",boxShadow:"0 0 20px rgba(201,168,76,.1)"}}>✦ Új szoba létrehozása</button>
      <div style={{display:"flex",gap:8}}>
        <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Szoba kód..." maxLength={6}
          style={{flex:1,background:"rgba(0,0,0,.5)",border:"1px solid rgba(201,168,76,.2)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:".85rem",padding:"11px 14px",outline:"none",letterSpacing:".12em"}}/>
        <button className="epic-btn" onClick={joinGame} style={{padding:"11px 18px",background:"rgba(58,122,139,.12)",border:"1px solid rgba(58,122,139,.45)",color:"#5DADE2",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",letterSpacing:".08em",textTransform:"uppercase"}}>Belép</button>
      </div>

      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— Barátaim ({friends.length}) —</div>
        {friends.map(f=>{const fr=getRace(f.race);return<div key={f.name} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.07)",marginBottom:5}}>
          <span style={{fontSize:"1rem",filter:`drop-shadow(0 0 6px ${fr.color})`}}>{fr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{f.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:fr.color}}>{fr.name} · {f.score||0}pt</div></div>
          <button className="epic-btn" onClick={()=>inviteFriendToGame(f.name)} style={{padding:"5px 12px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:".08em"}}>🎲 Meghív</button>
        </div>;})}
      </div>}

      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:notification.color,textAlign:"center",padding:"8px",animation:"slideUp .2s ease"}}>{notification.msg}</div>}
    </div>
  );

  // ── WAITING ROOM ──
  if(screen==="waiting")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,padding:20,overflowY:"auto"}}>
      <style>{EPIC_CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)",animation:"goldPulse 2.5s ease infinite"}}>Váróterem</div>
        <div style={{margin:"12px auto",padding:"14px 22px",background:"linear-gradient(135deg,rgba(201,168,76,.07),rgba(201,168,76,.03))",border:"1px solid rgba(201,168,76,.35)",display:"inline-block",boxShadow:"0 0 30px rgba(201,168,76,.1)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:5}}>Szoba kód — oszd meg barátaiddal!</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.8rem",color:"var(--gold)",letterSpacing:".25em",textShadow:"0 0 20px rgba(201,168,76,.4)"}}>{gameId}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {players.map(p=>{const pr=getRace(p.race);return<div key={p.name} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",background:`rgba(${pr.hex||"139,115,85"},.04)`,border:`1px solid rgba(${pr.hex||"139,115,85"},.15)`,animation:"slideUp .3s ease"}}>
          <span style={{fontSize:"1.3rem",filter:`drop-shadow(0 0 8px ${pr.color})`}}>{pr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{p.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}</div></div>
          {p.name===gameData?.host&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)",border:"1px solid rgba(201,168,76,.35)",padding:"2px 8px",background:"rgba(201,168,76,.05)"}}>HOST</span>}
        </div>;})}
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",textAlign:"center"}}>{players.length}/4 játékos csatlakozott</div>
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",letterSpacing:".12em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— Barátok meghívása —</div>
        {friends.map(f=>{const fr=getRace(f.race);return<div key={f.name} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.07)",marginBottom:5}}>
          <span>{fr.icon}</span><span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--text)"}}>{f.name}</span>
          <button className="epic-btn" onClick={()=>inviteFriendToGame(f.name,gameId)} style={{padding:"4px 12px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer",textTransform:"uppercase"}}>🎲 Meghív</button>
        </div>;})}
      </div>}
      {gameData?.host===playerId&&<button className="epic-btn" onClick={startGame} style={{padding:"14px",background:"linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.45)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".14em",cursor:"pointer",textTransform:"uppercase",boxShadow:"0 0 24px rgba(201,168,76,.15)",marginTop:4}}>▶ Játék Indítása</button>}
      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:notification.color,textAlign:"center",animation:"slideUp .2s ease"}}>{notification.msg}</div>}
    </div>
  );

  // ── FINISHED ──
  if(screen==="finished")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:24,textAlign:"center"}}>
      <style>{EPIC_CSS}</style>
      <div style={{fontSize:"4rem",animation:"winnerBlast .6s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 30px ${gameData?.winner===playerId?"rgba(255,215,0,.6)":"rgba(229,57,53,.5)"})`}}>{gameData?.winner===playerId?"🏆":"😔"}</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.3rem",color:"var(--gold)",animation:"goldPulse 2s ease infinite"}}>{gameData?.winner===playerId?"GYŐZELEM!":"Jó próbálkozás!"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:300}}>
        {players.sort((a,b)=>b.score-a.score).map((p,i)=>{const pr=getRace(p.race);return<div key={p.name} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 14px",background:p.isMe?"rgba(201,168,76,.06)":"rgba(255,255,255,.02)",border:`1px solid ${p.isMe?"rgba(201,168,76,.3)":"rgba(201,168,76,.07)"}`,animation:`slideUp ${.2+i*.1}s ease`}}>
          <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",color:i<3?"var(--gold)":"var(--gm)",minWidth:22}}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
          <span style={{fontSize:"1rem",filter:`drop-shadow(0 0 6px ${pr.color})`}}>{pr.icon}</span>
          <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:p.isMe?"var(--gold)":"var(--text)"}}>{p.name}{p.isMe?" (Te)":""}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{p.score}pt</span>
        </div>;})}
      </div>
      <button className="epic-btn" onClick={()=>{setScreen("lobby");setGameId(null);setGameData(null);localStorage.removeItem("hb_screen");localStorage.removeItem("hb_gameId");}} style={{padding:"12px 28px",background:"linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.05))",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase",marginTop:6}}>✦ Új Játék</button>
    </div>
  );

  // ── PLAYING ──
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <style>{EPIC_CSS}</style>

      {/* Particles */}
      {particles.map(p=><Particles key={p.id} x={p.x} y={p.y} color={p.color} onDone={()=>setParticles(ps=>ps.filter(x=>x.id!==p.id))}/>)}

      {/* Floating notification */}
      {notification&&<div style={{position:"fixed",top:58,left:"50%",transform:"translateX(-50%)",zIndex:400,padding:"8px 18px",background:"rgba(5,3,2,.97)",border:`1px solid ${notification.color}`,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:notification.color,letterSpacing:".06em",whiteSpace:"nowrap",pointerEvents:"none",boxShadow:`0 0 20px ${notification.color}44`,animation:"slideUp .2s ease"}}>{notification.msg}</div>}

      {/* Field event */}
      {eventField&&isMyTurn&&<FieldEventModal field={eventField} onResult={handleEventResult}/>}

      {/* Field tooltip */}
      {selectedField&&!eventField&&<div style={{position:"fixed",top:58,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"10px 16px",background:"rgba(5,3,2,.97)",border:"1px solid rgba(201,168,76,.25)",maxWidth:250,textAlign:"center",animation:"slideUp .2s ease",boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{selectedField.icon} {selectedField.name}</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".8rem",color:"var(--td)",fontStyle:"italic",marginTop:4,lineHeight:1.5}}>{selectedField.type==="trap"?"Csapda mező!":selectedField.type==="bonus"?"Bónusz mező!":selectedField.type==="quiz"?"Kvíz mező!":selectedField.type==="minigame"?"Minijáték mező!":selectedField.type==="gollam"?"Gollam találós kérdése!":selectedField.type==="smaug"?"SMAUG MEZŐ! −30pt!":"Normál mező"}</div>
        <button onClick={()=>setSelectedField(null)} style={{marginTop:6,background:"none",border:"none",color:"var(--gm)",cursor:"pointer",fontSize:".62rem",fontFamily:"'Cinzel',serif"}}>× bezár</button>
      </div>}

      {/* BOARD */}
      <div style={{flex:1,minHeight:0,position:"relative"}}>
        <EpicBoard players={players} myPosition={myData?.position||0} onFieldClick={setSelectedField}/>
      </div>

      {/* HUD */}
      <div style={{background:"linear-gradient(180deg,rgba(6,4,2,.97),rgba(4,3,1,1))",borderTop:"1px solid rgba(201,168,76,.12)",flexShrink:0}}>

        {/* Players + 3D Dice strip */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,.07)"}}>
          {players.map(p=>{
            const pr=getRace(p.race);
            const active=gameData?.currentTurn===p.name;
            const pDice=diceValues[p.name]||{value:null,rolling:false};
            return<div key={p.name} style={{flex:1,padding:"6px 4px",background:active?"rgba(201,168,76,.07)":"transparent",borderBottom:`2px solid ${active?"var(--gold)":"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all .25s",position:"relative"}}>
              {active&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>}
              {/* 3D Dice per player */}
              <Dice3D value={pDice.value||1} rolling={pDice.rolling||false} size={36}/>
              <span style={{fontSize:".8rem",filter:active?`drop-shadow(0 0 6px ${pr.color})`:"none"}}>{pr.icon}{p.skipTurn?"💤":""}</span>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:active?"var(--gold)":"var(--gm)",maxWidth:55,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center"}}>{p.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)",fontWeight:"bold"}}>{p.score}</div>
            </div>;
          })}
        </div>

        {/* Roll + info row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"}}>
          {/* Big roll button */}
          <button onClick={rollDice} disabled={!isMyTurn||rolling||!!eventField}
            style={{width:54,height:54,fontSize:isMyTurn&&!rolling?"1.8rem":"1.4rem",background:isMyTurn&&!rolling?"linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.08))":"rgba(0,0,0,.25)",border:`1px solid ${isMyTurn&&!rolling?"rgba(201,168,76,.5)":"rgba(255,255,255,.05)"}`,cursor:isMyTurn&&!rolling?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",boxShadow:isMyTurn&&!rolling?"0 0 20px rgba(201,168,76,.2)":"none",transform:isMyTurn&&!rolling?"scale(1.05)":"scale(1)"}}>
            {rolling?"🎲":"🎲"}
          </button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:isMyTurn?"var(--gold)":"var(--gm)",letterSpacing:".05em"}}>
              {isMyTurn?"⚔️ A te köröd!":` ${gameData?.currentTurn||"?"} köre...`}
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",marginTop:1.5}}>
              {FIELDS[myData?.position||0]?.icon} {FIELDS[myData?.position||0]?.name} · {myData?.score||0}pt
            </div>
            {(myData?.cards||[]).length>0&&<div style={{display:"flex",gap:3,marginTop:3}}>
              {myData.cards.map((c,i)=>{const cd=POWER_CARDS.find(x=>x.id===c);return cd?<span key={i} title={cd.name} style={{fontSize:".85rem",filter:"drop-shadow(0 0 4px rgba(201,168,76,.5))"}}>{cd.icon}</span>:null;})}
            </div>}
          </div>
        </div>

        {/* Emotes */}
        <div style={{display:"flex",gap:3,padding:"2px 12px 3px",overflowX:"auto"}}>
          {EMOTES.map(e=><button key={e} onClick={()=>sendChat(e)} style={{background:"none",border:"none",fontSize:".95rem",cursor:"pointer",padding:"2px 3px",flexShrink:0,filter:"drop-shadow(0 0 3px rgba(201,168,76,.3))",transition:"transform .15s"}}
            onMouseEnter={ev=>ev.target.style.transform="scale(1.3)"} onMouseLeave={ev=>ev.target.style.transform="scale(1)"}>{e}</button>)}
        </div>

        {/* Chat */}
        <div style={{borderTop:"1px solid rgba(201,168,76,.06)",padding:"5px 10px"}}>
          <div ref={chatRef} style={{maxHeight:48,overflowY:"auto",marginBottom:5,display:"flex",flexDirection:"column",gap:1}}>
            {Object.values(gameData?.chat||{}).slice(-7).map((m,i)=>{
              const mr=getRace(m.race);
              return<div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)"}}><span style={{color:mr.color,textShadow:`0 0 6px ${mr.color}55`}}>{m.player}: </span>{m.text}</div>;
            })}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatMsg)} placeholder="Chat..."
              style={{flex:1,background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.12)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".82rem",padding:"5px 9px",outline:"none"}}/>
            <button onClick={()=>sendChat(chatMsg)} style={{padding:"5px 10px",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer"}}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
