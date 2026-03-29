import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { sfx } from "./hobbit-sounds.jsx";
import { getDatabase, ref, set, get, onValue, update, push, remove, off, onDisconnect, serverTimestamp, query, limitToLast } from "firebase/database";

const FB={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,databaseURL:import.meta.env.VITE_FIREBASE_DATABASE_URL};
const _app=getApps().length?getApps()[0]:initializeApp(FB);
const db=getDatabase(_app);
window.__fbDB={getDatabase:()=>db,ref,set,get,onValue,update,push,remove,off,onDisconnect,serverTimestamp,query,limitToLast};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--gold:#C9A84C;--gold2:#FFD700;--bg:#050302;--border:rgba(201,168,76,.13);--text:#EDE8E0;--muted:rgba(237,232,224,.5);--dim:rgba(237,232,224,.25)}
@keyframes gP{0%,100%{text-shadow:0 0 18px rgba(201,168,76,.5),0 0 36px rgba(201,168,76,.25)}50%{text-shadow:0 0 45px rgba(201,168,76,1),0 0 90px rgba(201,168,76,.6)}}
@keyframes sU{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes zI{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes screenIn{from{opacity:0}to{opacity:1}}
@keyframes rp{0%{r:0;opacity:.8}100%{r:5;opacity:0}}
@keyframes tF{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes dF{to{stroke-dashoffset:-12}}
@keyframes wB{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.1) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes aG{0%,100%{box-shadow:0 0 10px rgba(201,168,76,.2)}50%{box-shadow:0 0 28px rgba(201,168,76,.6),0 0 55px rgba(201,168,76,.2)}}
@keyframes sk{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes sb{0%,100%{opacity:.1}50%{opacity:.9}}
@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-80px);opacity:0}}
@keyframes popIn{0%{transform:scale(0.3);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes smaugBreath{0%,100%{opacity:.4}50%{opacity:.85}}
@keyframes fogMove{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
@keyframes starBlink{0%,100%{opacity:.1}50%{opacity:.85}}
@keyframes coinSpin{0%{transform:rotateY(0deg)}100%{transform:rotateY(360deg)}}
@keyframes searchSlide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
@keyframes rareLegendaryPulse{0%,100%{box-shadow:0 0 8px rgba(255,215,0,.25),0 4px 18px rgba(0,0,0,.5)}50%{box-shadow:0 0 22px rgba(255,215,0,.55),0 4px 28px rgba(0,0,0,.6)}}
@keyframes rareEpicPulse{0%,100%{box-shadow:0 0 6px rgba(155,105,189,.2),0 4px 18px rgba(0,0,0,.5)}50%{box-shadow:0 0 18px rgba(155,105,189,.45),0 4px 24px rgba(0,0,0,.6)}}
@keyframes diceGlowPulse{0%,100%{filter:drop-shadow(0 0 18px rgba(201,168,76,.6)) drop-shadow(0 0 36px rgba(201,168,76,.3))}50%{filter:drop-shadow(0 0 38px rgba(255,215,0,.9)) drop-shadow(0 0 70px rgba(201,168,76,.5))}}
@keyframes tokenFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.05)}}
.btn{position:relative;overflow:hidden;cursor:pointer;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .3s ease,border-color .3s ease,background .3s ease,color .3s ease;outline:none}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,168,76,.16),transparent);transform:translateX(-110%);transition:transform .5s cubic-bezier(.22,1,.36,1)}
.btn:hover::after{transform:translateX(110%)}
.btn:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(201,168,76,.3)!important}
.btn:active{transform:translateY(0) scale(.98)!important;transition:transform .1s!important}
.sc::-webkit-scrollbar{width:3px}.sc::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:2px}
.sc::-webkit-scrollbar-track{background:rgba(0,0,0,.2)}
.shopItem{transition:all .22s;border-radius:4px}
.shopItem:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.6)!important}
`;

const RACES=[
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E",rgb:"107,140,62",name:"Hobbit"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D",rgb:"160,82,45", name:"Törpe"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B",rgb:"58,122,139",name:"Tünde"},
  {id:"human", icon:"⚔️", color:"#8B7355",rgb:"139,115,85",name:"Ember"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB",rgb:"122,74,187",name:"Varázsló"},
];
const raceOf=id=>RACES.find(r=>r.id===id)||RACES[3];
const genId=()=>Math.random().toString(36).slice(2,8).toUpperCase();

// 45 mező – 3 soros kígyó elrendezés (boustrophedon), garantáltan 7px+ távolság
const FIELDS=[
  // 1. sor: alap, bal→jobb (Shire → Mirkwood bejárat)
  {id:0,  n:"Zsákos-domb",         e:"🏡",t:"start",   x:10, y:82},
  {id:1,  n:"Bag End ösvény",      e:"🌿",t:"normal",  x:17, y:83},
  {id:2,  n:"Bywater fogadó",      e:"🍺",t:"bonus",   x:24, y:84},
  {id:3,  n:"Bree kapuja",         e:"🚪",t:"normal",  x:31, y:84},
  {id:4,  n:"Pusztai fogadó",      e:"🌙",t:"quiz",    x:38, y:83},
  {id:5,  n:"Veszélyes ösvény",    e:"⚠️",t:"trap",    x:45, y:82},
  {id:6,  n:"Trollok völgye",      e:"👹",t:"minigame",x:52, y:82},
  {id:7,  n:"Troll barlang",       e:"💀",t:"trap",    x:60, y:83},
  {id:8,  n:"Völgyzugoly",         e:"🏔️",t:"bonus",   x:67, y:83},
  {id:9,  n:"Ködös Hegy lába",     e:"❄️",t:"normal",  x:74, y:82},
  {id:10, n:"Goblin alagút",       e:"👺",t:"minigame",x:81, y:81},
  {id:11, n:"Gollam barlangja",    e:"💍",t:"gollam",  x:88, y:80},
  {id:12, n:"Napfény kapuja",      e:"☀️",t:"bonus",   x:95, y:81},
  {id:13, n:"Beorn háza",          e:"🐻",t:"bonus",   x:102,y:81},
  {id:14, n:"Bakacsinerdő bejárat",e:"🌑",t:"normal",  x:110,y:80},
  // 2. sor: közép, jobb→bal (Mirkwood → Erebor megközelítés)
  {id:15, n:"Bakacsinerdő",        e:"🕸️",t:"trap",    x:110,y:62},
  {id:16, n:"Pókkirálynő",         e:"🕷️",t:"minigame",x:103,y:62},
  {id:17, n:"Thranduil erdeje",    e:"🧝",t:"quiz",    x:96, y:61},
  {id:18, n:"Tündekirály börtöne", e:"🔒",t:"trap",    x:89, y:60},
  {id:19, n:"Hordók a folyón",     e:"🛶",t:"minigame",x:82, y:60},
  {id:20, n:"Tóváros",             e:"🏙️",t:"bonus",   x:75, y:59},
  {id:21, n:"Tóváros piac",        e:"⛵",t:"normal",  x:68, y:59},
  {id:22, n:"Magányos hegy lába",  e:"🏔️",t:"normal",  x:61, y:59},
  {id:23, n:"Sárkány szele",       e:"💨",t:"trap",    x:54, y:58},
  {id:24, n:"Smaug tüze",          e:"🔥",t:"smaug",   x:47, y:58},
  {id:25, n:"Titkos átjáró",       e:"🗝️",t:"bonus",   x:40, y:59},
  {id:26, n:"Öt Sereg Csatája",    e:"⚔️",t:"minigame",x:33, y:60},
  {id:27, n:"Erebor kapuja",       e:"🏰",t:"quiz",    x:26, y:61},
  {id:28, n:"Kincseskamra",        e:"💎",t:"bonus",   x:18, y:62},
  {id:29, n:"Arkenköves trón",     e:"👑",t:"quiz",    x:10, y:63},
  // 3. sor: felső, bal→jobb (Erebor belső → VÉGE)
  {id:30, n:"Törpe bányák",        e:"⛏️",t:"normal",  x:10, y:38},
  {id:31, n:"Smaug kincse",        e:"🪙",t:"bonus",   x:17, y:37},
  {id:32, n:"Bard nyila",          e:"🏹",t:"quiz",    x:24, y:36},
  {id:33, n:"Hollók sziklája",     e:"🐦",t:"normal",  x:31, y:35},
  {id:34, n:"Durin kapuja",        e:"🚪",t:"minigame",x:38, y:34},
  {id:35, n:"Mithril ér",          e:"✨",t:"bonus",   x:45, y:33},
  {id:36, n:"Goblin város",        e:"🏚️",t:"trap",    x:52, y:32},
  {id:37, n:"Sasok fészke",        e:"🦅",t:"bonus",   x:60, y:31},
  {id:38, n:"Carrock sziklája",    e:"🪨",t:"quiz",    x:67, y:30},
  {id:39, n:"Erdei folyó",         e:"🌊",t:"normal",  x:74, y:30},
  {id:40, n:"Nagy tó",             e:"🏞️",t:"normal",  x:81, y:31},
  {id:41, n:"Tünde csarnokok",     e:"🌟",t:"bonus",   x:88, y:32},
  {id:42, n:"Vad mezők",           e:"🌲",t:"normal",  x:95, y:33},
  {id:43, n:"Utolsó állomás",      e:"🌅",t:"quiz",    x:102,y:34},
  {id:44, n:"EREBOR",              e:"🏆",t:"finish",  x:110,y:35},
];

const FC={start:"#1e4d08",finish:"#6b4400",bonus:"#083048",trap:"#4d0000",quiz:"#1e0d50",minigame:"#4a1c00",gollam:"#0a0518",smaug:"#500000",normal:"#141009"};
const FS={start:"#7BC34A",finish:"#FFD700",bonus:"#4DADE2",trap:"#E74C3C",quiz:"#9B69BD",minigame:"#E67E22",gollam:"#8844AD",smaug:"#FF5252",normal:"#6a5030"};
const FR={start:3.8,finish:4.2,bonus:3.1,trap:2.9,quiz:3.1,minigame:3.1,gollam:3.3,smaug:3.8,normal:2.5};

// Random encounters for normal fields
const ENCOUNTERS=[
  {icon:"🧙",text:"Egy vándor varázsló megáll melletted és bátorítást ad.",pts:10,coins:5,label:"Köszönöm, bölcs vándor!"},
  {icon:"🍄",text:"Egy ösvény mentén gyógygombákat találsz. Erőt merítenek!",pts:5,coins:10,label:"Összeszedem!"},
  {icon:"🦊",text:"Egy ravasz róka ellopja az aranyad egy részét, de cserébe megmutat egy rövidebb utat.",pts:15,coins:-10,label:"Megérte..."},
  {icon:"🌿",text:"Pihenőt tartasz egy csendes tisztáson. A szél susog a levelek között.",pts:0,coins:5,label:"Feltöltődtem"},
  {icon:"🗡️",text:"Egy elhagyott kardot találsz az ösvény szélén. Valamit megér a piacon.",pts:5,coins:15,label:"Felkapom!"},
  {icon:"🐦",text:"Egy holló száll le a válladra és rúnát karcol a földbe — jó jel!",pts:10,coins:0,label:"Köszönöm, holló!"},
  {icon:"🌧️",text:"Hirtelen vihar tör ki. Elázol és lecsúszol az ösvényről.",pts:-5,coins:0,label:"Brrr... tovább megyek"},
  {icon:"🏕️",text:"Egy elhagyott táborra bukkansz, maradék élelemmel és néhány arannyal.",pts:5,coins:20,label:"Micsoda szerencse!"},
  {icon:"🐺",text:"Wargok nyomait fedezed fel. Sietsz, nehogy utolérjenek!",pts:-5,coins:0,label:"Futás!"},
  {icon:"🧝",text:"Egy tünde kereskedő felajánlja, hogy meggyógyítja sebeidet.",pts:10,coins:-5,label:"Elfogadom"},
  {icon:"🌟",text:"Egy csillagfényes éjszakán megpillantod Earendil csillagát. Reményt ad.",pts:8,coins:0,label:"Gyönyörű..."},
  {icon:"🗺️",text:"Egy régi térképtöredéket találsz, ami segít eligazodni.",pts:5,coins:0,label:"Hasznos lehet!"},
  {icon:"🍺",text:"Egy barátságos fogadó! Betérsz egy korsóra és pletykákat hallasz.",pts:0,coins:-5,label:"Egészségemre!"},
  {icon:"💎",text:"Megcsillan valami a sziklák között — egy kis drágakő!",pts:0,coins:25,label:"Zsebrevágom!"},
  {icon:"🐻",text:"Beorn medveként átvágtat melletted! Megijedsz, de nem bántott.",pts:0,coins:0,label:"Huhh..."},
  {icon:"🔥",text:"Egy régi tábortűz parázslik. Megmelegszol és pihentetőt alszol.",pts:5,coins:5,label:"Jólesett"},
  {icon:"🦅",text:"A Sasok Ura egy pillanatra letekint rád. Méltónak talál.",pts:15,coins:0,label:"Megtiszteltetés!"},
  {icon:"🌑",text:"Sötét árnyak suhannak az ösvényen. Semmit sem találsz.",pts:0,coins:0,label:"Tovább megyek..."},
];

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

// ═══ BOLT TÁRGYAK ════════════════════════════════════════════════════════════
const SHOP_ITEMS=[
  {id:"extraDice", price:30,  icon:"🎲", name:"Dupla Dobás",    desc:"Dobhatsz kétszer, a magasabbat tartod",       rarity:"common"},
  {id:"shield",    price:40,  icon:"🛡️", name:"Mithril Pajzs",  desc:"Következő csapda/Smaug nem érint",           rarity:"common"},
  {id:"speed",     price:55,  icon:"💨", name:"Szélroham",      desc:"+3 lépés a következő körben",                 rarity:"rare"},
  {id:"wisdom",    price:60,  icon:"📜", name:"Gandalf Tanácsa",desc:"Kvíznél mutatja a helyes választ",            rarity:"rare"},
  {id:"portal",    price:80,  icon:"✨", name:"Mágikus Kapu",   desc:"Ugorj előre 6 mezőt azonnal",                 rarity:"epic"},
  {id:"freeze",    price:70,  icon:"❄️", name:"Jégbűvölet",     desc:"Az utánad következő játékos kimarad",         rarity:"epic"},
  {id:"arkenstone",price:120, icon:"💎", name:"Arkenstone",     desc:"+50 bónusz pont azonnal",                     rarity:"legendary"},
  {id:"smaug",     price:100, icon:"🐉", name:"Smaug Szövetsége",desc:"Smaug tüze a következő mezőn nem hat rád",  rarity:"legendary"},
];
const RARITY_COL={common:"#8a8a9a",rare:"#4DADE2",epic:"#9B69BD",legendary:"#FFD700"};
const PC=SHOP_ITEMS.map(i=>({id:i.id,i:i.icon,n:i.name,d:i.desc}));
const EMOTES=["👍","😄","😱","🤔","🎉","💀","🔥","❄️","🧙","⚔️","💍","🐉"];

// ═══ ELO & RANKED ════════════════════════════════════════════════════════════
const ELO_K=32;
const calcElo=(myElo,oppElo,won)=>{const exp=1/(1+Math.pow(10,(oppElo-myElo)/400));return Math.round(myElo+ELO_K*(won-exp));};
const RANK_TIERS_GAME=[
  {min:2000,label:"Középföld Bajnoka",icon:"👑",color:"#FFD700"},
  {min:1600,label:"Legendás Harcos",icon:"⚔️",color:"#C9A84C"},
  {min:1200,label:"Tapasztalt Kalandor",icon:"🛡️",color:"#A0A0C0"},
  {min:800,label:"Újonc Vándor",icon:"🗡️",color:"#A0522D"},
  {min:0,label:"Kezdő",icon:"🌱",color:"#6B8C3E"},
];
const getGameRank=elo=>RANK_TIERS_GAME.find(r=>elo>=r.min)||RANK_TIERS_GAME[RANK_TIERS_GAME.length-1];

// ═══ 3D KOCKA ═════════════════════════════════════════════════════════════════
const PIPS=[[[.5,.5]],[[.25,.25],[.75,.75]],[[.25,.25],[.5,.5],[.75,.75]],[[.25,.25],[.75,.25],[.25,.75],[.75,.75]],[[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],[[.25,.25],[.75,.25],[.25,.5],[.75,.5],[.25,.75],[.75,.75]]];
const V3=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const DF=[{v:[0,1,2,3],n:[0,0,-1],pi:0},{v:[4,5,6,7],n:[0,0,1],pi:5},{v:[0,4,7,3],n:[-1,0,0],pi:3},{v:[1,5,6,2],n:[1,0,0],pi:2},{v:[0,1,5,4],n:[0,-1,0],pi:1},{v:[3,2,6,7],n:[0,1,0],pi:4}];
const TG={1:{x:0,y:Math.PI},2:{x:-Math.PI/2,y:0},3:{x:0,y:-Math.PI/2},4:{x:0,y:Math.PI/2},5:{x:Math.PI/2,y:0},6:{x:0,y:0}};
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
    if(rolling)vel.current={x:.14+Math.random()*.1,y:.18+Math.random()*.12,z:.06+Math.random()*.08};
    const drawRF=(pts,rad)=>{
      const n=pts.length;ctx.beginPath();
      for(let i=0;i<n;i++){
        const pr=pts[(i-1+n)%n],cu=pts[i],nx=pts[(i+1)%n];
        const d1x=pr[0]-cu[0],d1y=pr[1]-cu[1],d2x=nx[0]-cu[0],d2y=nx[1]-cu[1];
        const l1=Math.sqrt(d1x*d1x+d1y*d1y),l2=Math.sqrt(d2x*d2x+d2y*d2y);
        const r=Math.min(rad,l1*.28,l2*.28);
        const p1x=cu[0]+(d1x/l1)*r,p1y=cu[1]+(d1y/l1)*r;
        const p2x=cu[0]+(d2x/l2)*r,p2y=cu[1]+(d2y/l2)*r;
        if(i===0)ctx.moveTo(p1x,p1y);else ctx.lineTo(p1x,p1y);
        ctx.quadraticCurveTo(cu[0],cu[1],p2x,p2y);
      }
      ctx.closePath();
    };
    function frame(){
      ctx.clearRect(0,0,S,S);
      const {x,y,z}=ang.current;
      const tv=V3.map(v=>{let u=rX(v,x);u=rY(u,y);return rZ(u,z)});
      [...DF].map(f=>({...f,cz:f.v.reduce((a,i)=>a+tv[i][2],0)/4})).sort((a,b)=>a.cz-b.cz).forEach(face=>{
        const pts=face.v.map(i=>proj(tv[i]));
        const tn=rX(rY(face.n,y),x);if(tn[2]<-.04)return;
        const br=Math.max(.25,d3(tn,[.2,-.6,.78])*.7+.35);
        const spec=Math.pow(Math.max(0,d3(tn,[.15,-.5,.85])),16)*.6;
        const cR=S*.14;
        const cx=(pts[0][0]+pts[2][0])/2,cy=(pts[0][1]+pts[2][1])/2;
        drawRF(pts,cR);
        const gd=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
        gd.addColorStop(0,`rgb(${~~(55+br*155+spec*80)},${~~(30+br*95+spec*60)},${~~(15+br*50+spec*30)})`);
        gd.addColorStop(.5,`rgb(${~~(40+br*120+spec*40)},${~~(22+br*70+spec*30)},${~~(10+br*35+spec*15)})`);
        gd.addColorStop(1,`rgb(${~~(30+br*100)},${~~(16+br*58)},${~~(8+br*28)})`);
        ctx.fillStyle=gd;ctx.fill();
        if(spec>.02){
          drawRF(pts,cR);
          const sg=ctx.createRadialGradient(cx-S*.02,cy-S*.04,0,cx,cy,S*.28);
          sg.addColorStop(0,`rgba(255,240,200,${spec*.5})`);
          sg.addColorStop(.4,`rgba(255,220,160,${spec*.2})`);
          sg.addColorStop(1,"rgba(255,220,160,0)");
          ctx.fillStyle=sg;ctx.fill();
        }
        drawRF(pts,cR);
        ctx.strokeStyle=`rgba(200,170,70,${.4*br+spec*.3})`;ctx.lineWidth=S/50;ctx.stroke();
        const inPts=pts.map(p=>[p[0]+(cx-p[0])*.07,p[1]+(cy-p[1])*.07]);
        drawRF(inPts,cR*.85);
        ctx.strokeStyle=`rgba(255,230,160,${.08*br+spec*.15})`;ctx.lineWidth=S/120;ctx.stroke();
        if(tn[2]>.2){
          const pips2=PIPS[face.pi]||[];const [p0,p1,p2,p3]=pts;
          pips2.forEach(([u,v2])=>{
            const t1=[p0[0]+(p1[0]-p0[0])*u,p0[1]+(p1[1]-p0[1])*u];
            const t2=[p3[0]+(p2[0]-p3[0])*u,p3[1]+(p2[1]-p3[1])*u];
            const px=t1[0]+(t2[0]-t1[0])*v2,py=t1[1]+(t2[1]-t1[1])*v2;
            const pr=2.8*(S/72)*Math.sqrt(br);
            ctx.beginPath();ctx.arc(px+pr*.2,py+pr*.25,pr*1.15,0,Math.PI*2);
            ctx.fillStyle=`rgba(0,0,0,${.3*br})`;ctx.fill();
            ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);
            const pg=ctx.createRadialGradient(px-pr*.3,py-pr*.3,0,px,py,pr);
            pg.addColorStop(0,`rgba(255,250,230,${.95*br})`);
            pg.addColorStop(.5,`rgba(235,200,120,${.9*br})`);
            pg.addColorStop(1,`rgba(190,150,70,${.85*br})`);
            ctx.fillStyle=pg;ctx.fill();
            ctx.strokeStyle=`rgba(160,120,50,${.3*br})`;ctx.lineWidth=S/150;ctx.stroke();
            ctx.beginPath();ctx.arc(px-pr*.22,py-pr*.22,pr*.32,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,255,255,${.55*br})`;ctx.fill();
          });
        }
      });
      if(rolling){
        const g=ctx.createRadialGradient(S/2,S/2,S*.2,S/2,S/2,S*.55);
        g.addColorStop(0,"rgba(255,180,50,0)");g.addColorStop(.6,"rgba(255,170,40,.12)");g.addColorStop(1,"rgba(201,168,76,.25)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(S/2,S/2,S*.55,0,Math.PI*2);ctx.fill();
        ang.current.x+=vel.current.x;ang.current.y+=vel.current.y;ang.current.z+=vel.current.z;
        vel.current.x*=.997;vel.current.y*=.997;vel.current.z*=.997;
      } else if(!done.current&&value){
        const t=TG[value]||{x:0,y:0};ang.current.x+=(t.x-ang.current.x)*.13;ang.current.y+=(t.y-ang.current.y)*.13;
        if(Math.abs(t.x-ang.current.x)<.006){done.current=true;ang.current.x=t.x;ang.current.y=t.y;}
      }
      raf.current=requestAnimationFrame(frame);
    }
    raf.current=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(raf.current);
  },[value,rolling,size]);
  return <canvas ref={cvs} style={{width:size,height:size,display:"block",filter:rolling?"drop-shadow(0 0 18px rgba(255,180,50,.9)) drop-shadow(0 0 40px rgba(201,168,76,.5))":"drop-shadow(0 0 8px rgba(180,140,60,.65)) drop-shadow(0 0 3px rgba(0,0,0,.9))",transition:"filter .3s ease"}}/>;
}

function Burst({x,y,color="#C9A84C",onDone}){
  const [pts]=useState(()=>Array.from({length:28},(_,i)=>{const a=Math.random()*Math.PI*2,s=Math.random()*70+35;return{id:i,dx:Math.cos(a)*s,dy:Math.sin(a)*s-40,sz:Math.random()*6+3,dl:Math.random()*.25,em:Math.random()>.65?["✨","⭐","💫","🌟"][~~(Math.random()*4)]:null};}));
  useEffect(()=>{const t=setTimeout(()=>onDone&&onDone(),1000);return()=>clearTimeout(t)},[]);
  return <div style={{position:"fixed",left:x,top:y,zIndex:700,pointerEvents:"none"}}>
    {pts.map(p=><div key={p.id} style={{position:"absolute",width:p.em?16:p.sz,height:p.em?16:p.sz,background:p.em?"transparent":color,borderRadius:"50%",fontSize:p.em?13:0,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:p.em?"none":`0 0 ${p.sz*2}px ${color}88`,animation:`floatUp .9s ${p.dl}s ease-out forwards`,transform:`translate(${p.dx}px,${p.dy}px)`,opacity:0}}>{p.em||""}</div>)}
  </div>;
}

// ═══ MINI JÁTÉKOK ═════════════════════════════════════════════════════════════
function QuizGame({onResult}){
  const [q]=useState(()=>QS[~~(Math.random()*QS.length)]);
  const [sel,setSel]=useState(null);const [t,setT]=useState(12);const [done,setDone]=useState(false);
  useEffect(()=>{if(done)return;const iv=setInterval(()=>setT(x=>{if(x<=1){clearInterval(iv);setDone(true);onResult(false,0);return 0;}return x-1;}),1000);return()=>clearInterval(iv);},[done]);
  const pick=i=>{if(done)return;setSel(i);setDone(true);setTimeout(()=>onResult(i===q.a,i===q.a?20:0),600);};
  const barC=t<=3?"#E74C3C":t<=6?"#E67E22":"var(--gold)";
  return <div style={{display:"flex",flexDirection:"column",gap:12,animation:"sU .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>⚡ Gyors Kvíz</span>
      <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:barC,animation:t<=3?"sk .3s infinite":""}}>{t}s</span>
    </div>
    <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${t/12*100}%`,background:`linear-gradient(90deg,${barC},#FFD700)`,transition:"width 1s linear",boxShadow:`0 0 10px ${barC}`}}/></div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1.05rem",color:"var(--text)",lineHeight:1.65,padding:"8px 0"}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {q.o.map((o,i)=>{let bg="rgba(0,0,0,.32)",bd="rgba(201,168,76,.1)",tc="var(--text)";if(done&&i===q.a){bg="rgba(102,187,106,.18)";bd="#66BB6A";tc="#66BB6A";}else if(done&&sel===i&&i!==q.a){bg="rgba(229,57,53,.15)";bd="#E53935";tc="#EF9A9A";}
        return <button key={i} onClick={()=>pick(i)} className="btn" style={{padding:"10px 14px",background:bg,border:`1px solid ${bd}`,color:tc,fontFamily:"'EB Garamond',serif",fontSize:"1rem",textAlign:"left",cursor:done?"default":"pointer",transition:"all .18s"}}>{done&&i===q.a&&"✓ "}{done&&sel===i&&i!==q.a&&"✗ "}{o}</button>;})}
    </div>
  </div>;
}
function GollamGame({onResult}){
  const [q]=useState(()=>RS[~~(Math.random()*RS.length)]);const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const pick=i=>{if(done)return;setSel(i);setDone(true);setTimeout(()=>onResult(i===q.a,i===q.a?28:0),600);};
  return <div style={{display:"flex",flexDirection:"column",gap:12,animation:"sU .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#9B59B6",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Gollam találós kérdése</div>
    <div style={{padding:"16px",background:"rgba(10,5,22,.75)",border:"1px solid rgba(155,89,182,.35)",fontFamily:"'EB Garamond',serif",fontSize:"1rem",fontStyle:"italic",color:"#D7BDE2",lineHeight:1.75}}><span style={{color:"#8E44AD"}}>Gollam:</span> "Találós kérdés! Ha megfejtesz — élhetsz. Ha nem — megeszünk!"<br/><br/><strong style={{fontStyle:"normal",color:"var(--text)"}}>{q.q}</strong></div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {q.o.map((o,i)=>{let bd="rgba(155,89,182,.22)";if(done&&i===q.a)bd="#66BB6A";else if(done&&sel===i)bd="#E53935";return <button key={i} onClick={()=>pick(i)} className="btn" style={{padding:"10px 14px",background:"rgba(10,5,22,.4)",border:`1px solid ${bd}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:"1rem",textAlign:"left",cursor:done?"default":"pointer",transition:"border .18s"}}>{o}</button>;})}
    </div>
  </div>;
}
function RuneGame({onResult}){
  const [rune]=useState(()=>RN[~~(Math.random()*RN.length)]);const [inp,setInp]=useState("");const [done,setDone]=useState(false);
  const check=()=>{if(done)return;const ok=inp.toUpperCase()===rune.a;setDone(true);setTimeout(()=>onResult(ok,ok?32:0),600);};
  return <div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center",animation:"sU .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#4DADE2",letterSpacing:".1em",textTransform:"uppercase",alignSelf:"flex-start"}}>🔮 Rúna felismerés</div>
    <div style={{fontSize:"6rem",lineHeight:1,filter:"drop-shadow(0 0 24px rgba(58,122,139,.9)) drop-shadow(0 0 48px rgba(58,122,139,.4))",userSelect:"none"}}>{rune.r}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".64rem",color:"var(--dim)",textAlign:"center"}}>({rune.n} — melyik betű?)</div>
    <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Betű..." disabled={done} style={{background:"rgba(0,0,0,.6)",border:"1px solid rgba(58,122,139,.6)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:"1.6rem",padding:"10px 22px",outline:"none",textAlign:"center",width:140,letterSpacing:".18em"}}/>
    {!done&&<button onClick={check} className="btn" style={{padding:"9px 26px",background:"rgba(58,122,139,.15)",border:"1px solid rgba(58,122,139,.55)",color:"#4DADE2",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".1em",textTransform:"uppercase"}}>Elküld</button>}
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".85rem",color:inp.toUpperCase()===rune.a?"#66BB6A":"#EF9A9A"}}>{inp.toUpperCase()===rune.a?"✓ Helyes!":"✗ Helytelen — "+rune.a}</div>}
  </div>;
}
function SpotRing({onResult}){
  const [pos]=useState(()=>~~(Math.random()*9));const [sel,setSel]=useState(null);const [done,setDone]=useState(false);
  const icons=["🗡️","🏹","⚔️","🛡️","🔮","🪓","🗺️","🧢","💰"];
  const pick=i=>{if(done)return;setSel(i);setDone(true);setTimeout(()=>onResult(i===pos,i===pos?42:0),500);};
  return <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",animation:"sU .3s ease"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Hol a Gyűrű?</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".9rem",color:"var(--muted)",textAlign:"center",fontStyle:"italic"}}>Egyik tárgy alatt rejtőzik...</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {icons.map((ic,i)=>{let bd="rgba(201,168,76,.12)",bg="rgba(0,0,0,.32)";if(done&&i===pos){bd="#FFD700";bg="rgba(201,168,76,.2)";}else if(done&&sel===i){bd="#E53935";bg="rgba(229,57,53,.12)";}return <button key={i} onClick={()=>pick(i)} className="btn" style={{width:64,height:64,fontSize:"1.8rem",background:bg,border:`1px solid ${bd}`,cursor:done?"default":"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>{done&&i===pos?"💍":ic}</button>;})}
    </div>
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:sel===pos?"#66BB6A":"#EF9A9A"}}>{sel===pos?"✓ Megtaláltad!":"✗ Nem ott volt..."}</div>}
  </div>;
}

// ═══ EVENT MODAL ══════════════════════════════════════════════════════════════
function EventModal({field,onResult}){
  const [phase,setPhase]=useState("intro");const [won,setWon]=useState(false);const [pts,setPts]=useState(0);
  const [encounter]=useState(()=>ENCOUNTERS[~~(Math.random()*ENCOUNTERS.length)]);
  const INFO={bonus:{c:"#4DADE2",g:"rgba(77,173,226,.35)",t:"Bónusz!"},trap:{c:"#E74C3C",g:"rgba(231,76,60,.35)",t:"Csapda!"},quiz:{c:"#9B69BD",g:"rgba(155,105,189,.35)",t:"Kvíz!"},minigame:{c:"#E67E22",g:"rgba(230,126,34,.35)",t:"Minijáték!"},gollam:{c:"#8844AD",g:"rgba(136,68,173,.4)",t:"Gollam!"},smaug:{c:"#FF5252",g:"rgba(255,82,82,.4)",t:"SMAUG!"},finish:{c:"#FFD700",g:"rgba(255,215,0,.4)",t:"GYŐZELEM!"},normal:{c:"#B8976A",g:"rgba(184,151,106,.3)",t:"Találkozás"},start:{c:"#7BC34A",g:"rgba(123,195,74,.3)",t:"Indulás!"}};
  const info=INFO[field.t]||{c:"var(--gold)",g:"rgba(201,168,76,.2)",t:"Mező"};
  const done=(ok,p)=>{setWon(ok);setPts(p);setPhase("result");setTimeout(()=>onResult({ok,pts:p,field}),1200);};
  return <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(2,1,0,.96)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"zI .22s ease"}}>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 42%,${info.g},transparent 62%)`,pointerEvents:"none"}}/>
    <div style={{width:"100%",maxWidth:420,background:"linear-gradient(170deg,rgba(14,9,5,.99),rgba(4,3,1,.99))",border:`1px solid ${info.c}28`,padding:"24px 22px",display:"flex",flexDirection:"column",gap:16,maxHeight:"84vh",overflowY:"auto",boxShadow:`0 0 70px ${info.g}`,position:"relative",animation:"sU .25s ease"}}>
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h])=><div key={v+h} style={{position:"absolute",[v]:7,[h]:7,width:12,height:12,borderTop:v==="top"?`1px solid ${info.c}45`:"none",borderBottom:v==="bottom"?`1px solid ${info.c}45`:"none",borderLeft:h==="left"?`1px solid ${info.c}45`:"none",borderRight:h==="right"?`1px solid ${info.c}45`:"none"}}/>)}
      {phase==="intro"&&<>
        {(field.t==="normal"||field.t==="start")
        ?<>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"3.2rem",marginBottom:8,filter:`drop-shadow(0 0 22px ${info.g})`}}>{encounter.icon}</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:info.c,animation:"gP 2s ease infinite"}}>{info.t}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",marginTop:5}}>{field.n}</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".95rem",color:"var(--muted)",marginTop:12,fontStyle:"italic",lineHeight:1.7}}>{encounter.text}</div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            {encounter.pts!==0&&<div style={{padding:"6px 12px",background:encounter.pts>0?"rgba(102,187,106,.08)":"rgba(229,57,53,.08)",border:`1px solid ${encounter.pts>0?"rgba(102,187,106,.3)":"rgba(229,57,53,.3)"}`,fontFamily:"'Cinzel',serif",fontSize:".68rem",color:encounter.pts>0?"#66BB6A":"#EF9A9A"}}>{encounter.pts>0?"+":""}{encounter.pts} pont</div>}
            {encounter.coins!==0&&<div style={{padding:"6px 12px",background:encounter.coins>0?"rgba(201,168,76,.08)":"rgba(229,57,53,.08)",border:`1px solid ${encounter.coins>0?"rgba(201,168,76,.3)":"rgba(229,57,53,.3)"}`,fontFamily:"'Cinzel',serif",fontSize:".68rem",color:encounter.coins>0?"var(--gold)":"#EF9A9A"}}>🪙 {encounter.coins>0?"+":""}{encounter.coins}</div>}
            {encounter.pts===0&&encounter.coins===0&&<div style={{padding:"6px 12px",background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.15)",fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gm)"}}>Semmi különös</div>}
          </div>
          <button className="btn" onClick={()=>onResult({ok:encounter.pts>=0,pts:encounter.pts,field,encounterCoins:encounter.coins})} style={{padding:"12px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".1em",textTransform:"uppercase"}}>{encounter.label}</button>
        </>
        :<>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"3.2rem",marginBottom:8,filter:`drop-shadow(0 0 22px ${info.g})`}}>{field.e}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:info.c,animation:"gP 2s ease infinite"}}>{info.t}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",marginTop:5}}>{field.n}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".93rem",color:"var(--muted)",marginTop:10,fontStyle:"italic",lineHeight:1.7}}>{field.t==="smaug"?"Smaug észrevett! Lángjai elérik az ostobákat...":field.t==="finish"?"Elértél Ereborig, kalandor! A törpék kincse a tiéd!":field.t==="trap"?"Csapda! A Középföld nem könyörül a vigyázatlanokra.":field.t==="bonus"?"A szerencse mosolyog rád!":"Kihívás vár — bizonyítsd be bátorságodat!"}</div>
        </div>
        {(field.t==="trap"||field.t==="smaug")&&<>
          <div style={{padding:"12px",background:`${info.g.replace(".35",".12")}`,border:`1px solid ${info.c}28`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".72rem",color:info.c}}>{field.t==="smaug"?"🔥 Smaug tüze — −30 pont!":"⚠️ Visszalépsz 2 mezőt és kimaradsz egy körből!"}</div>
          <button className="btn" onClick={()=>onResult({ok:false,pts:field.t==="smaug"?-30:-5,field})} style={{padding:"12px",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",textTransform:"uppercase"}}>Elfogadom</button>
        </>}
        {field.t==="bonus"&&<>
          <div style={{padding:"12px",background:`${info.g.replace(".35",".12")}`,border:`1px solid ${info.c}35`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".75rem",color:info.c}}>✨ +20 pont!</div>
          <button className="btn" onClick={()=>onResult({ok:true,pts:20,field})} style={{padding:"12px",background:`${info.g.replace(".35",".1")}`,border:`1px solid ${info.c}50`,color:info.c,fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",textTransform:"uppercase"}}>Elfogadom ✓</button>
        </>}
        {field.t==="finish"&&<button className="btn" onClick={()=>onResult({ok:true,pts:100,field,win:true})} style={{padding:"14px",background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.55)",color:"#FFD700",fontFamily:"'Cinzel Decorative',serif",fontSize:".88rem",textShadow:"0 0 24px rgba(255,215,0,.7)",boxShadow:"0 0 40px rgba(255,215,0,.25)"}}>🏆 A KINCS A TIÉD! 🏆</button>}
        {(field.t==="quiz"||field.t==="minigame"||field.t==="gollam")&&<button className="btn" onClick={()=>setPhase("game")} style={{padding:"12px",background:`${info.g.replace(".35",".08")}`,border:`1px solid ${info.c}50`,color:info.c,fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".14em",textTransform:"uppercase",boxShadow:`0 0 20px ${info.g}`}}>⚔️ Kihívás elfogadása</button>}
        </>}
      </>}
      {phase==="game"&&<>
        {(field.t==="quiz"||[4,17,26,27,29,32,38,43].includes(field.id))&&<QuizGame onResult={done}/>}
        {field.t==="gollam"&&<GollamGame onResult={done}/>}
        {[10,34].includes(field.id)&&<RuneGame onResult={done}/>}
        {field.id===16&&<SpotRing onResult={done}/>}
        {field.t==="minigame"&&![10,16,26,34].includes(field.id)&&<QuizGame onResult={done}/>}
      </>}
      {phase==="result"&&<div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:14,alignItems:"center",animation:"wB .5s ease"}}>
        <div style={{fontSize:"4rem",filter:`drop-shadow(0 0 30px ${won?"rgba(255,215,0,.7)":"rgba(229,57,53,.6)"})`}}>{won?"🎉":"😔"}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:won?"var(--gold)":"#EF9A9A",animation:"gP 1.5s ease infinite"}}>{won?"Brilliáns!":"Sajnálom..."}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--muted)"}}>Pontok: <span style={{color:"var(--gold)",fontSize:"1.05rem",fontWeight:"bold"}}>{pts>0?"+":""}{pts}</span></div>
      </div>}
    </div>
  </div>;
}

// ═══ BOLT MODAL ════════════════════════════════════════════════════════════════
function ShopModal({coins,ownedCards,onBuy,onClose}){
  const [msg,setMsg]=useState(null);
  const buy=(item)=>{
    if(coins<item.price){setMsg({t:`Nincs elég arany! (${item.price} kell)`,ok:false});setTimeout(()=>setMsg(null),2000);return;}
    onBuy(item);setMsg({t:`${item.icon} ${item.name} megvásárolva!`,ok:true});setTimeout(()=>setMsg(null),2000);
  };
  return <div style={{position:"fixed",inset:0,zIndex:650,background:"rgba(1,1,0,.96)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"zI .22s ease"}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 40%,rgba(180,130,0,.2),transparent 65%)",pointerEvents:"none"}}/>
    <div style={{width:"100%",maxWidth:520,background:"linear-gradient(170deg,rgba(22,16,7,.99),rgba(8,6,2,.99))",border:"1px solid rgba(201,168,76,.35)",padding:"24px 20px",display:"flex",flexDirection:"column",gap:14,maxHeight:"88vh",position:"relative",animation:"sU .25s ease",boxShadow:"0 0 80px rgba(201,168,76,.15), inset 0 1px 0 rgba(201,168,76,.1), inset 0 0 60px rgba(139,90,43,.06)"}}>
      {/* Parchment corner decorations */}
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h])=><div key={v+h} style={{position:"absolute",[v]:6,[h]:6,width:16,height:16,borderTop:v==="top"?`1px solid rgba(201,168,76,.4)`:"none",borderBottom:v==="bottom"?`1px solid rgba(201,168,76,.4)`:"none",borderLeft:h==="left"?`1px solid rgba(201,168,76,.4)`:"none",borderRight:h==="right"?`1px solid rgba(201,168,76,.4)`:"none",pointerEvents:"none"}}/>)}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)",animation:"gP 2.5s ease infinite"}}>⚒️ Thorin Boltja</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--dim)",letterSpacing:".12em",textTransform:"uppercase",marginTop:3}}>Legendás tárgyak vásárolhatók aranyért</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)"}}>🪙 {coins}</div>
          <button className="btn" onClick={onClose} style={{padding:"6px 12px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.12)",color:"var(--muted)",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer"}}>✕ Bezárás</button>
        </div>
      </div>
      {msg&&<div style={{padding:"8px 12px",background:msg.ok?"rgba(102,187,106,.12)":"rgba(229,57,53,.12)",border:`1px solid ${msg.ok?"rgba(102,187,106,.4)":"rgba(229,57,53,.4)"}`,fontFamily:"'Cinzel',serif",fontSize:".72rem",color:msg.ok?"#66BB6A":"#EF9A9A",textAlign:"center",animation:"sU .2s ease"}}>{msg.t}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,overflowY:"auto"}} className="sc">
        {SHOP_ITEMS.map(item=>{
          const owned=(ownedCards||[]).includes(item.id);
          const canAfford=coins>=item.price;
          const rarCol=RARITY_COL[item.rarity]||"var(--muted)";
          const rarBg={legendary:"rgba(80,60,0,.55)",epic:"rgba(40,20,80,.55)",rare:"rgba(10,35,70,.55)",common:"rgba(20,18,14,.5)"};
          const rarAnim={legendary:"rareLegendaryPulse 2.5s ease-in-out infinite",epic:"rareEpicPulse 2.8s ease-in-out infinite",rare:"none",common:"none"};
          const ownedStyle=owned?{border:`1px solid rgba(102,187,106,.45)`,background:"rgba(20,40,20,.4)"}:{};
          const rarityLabel={legendary:"⭐ Legendás",epic:"💜 Epikus",rare:"🔷 Ritka",common:"⬜ Közönséges"};
          return <div key={item.id} className="shopItem" style={{position:"relative",background:rarBg[item.rarity]||rarBg.common,border:`1.5px solid ${owned?"rgba(102,187,106,.5)":rarCol+"55"}`,padding:"14px 12px",display:"flex",flexDirection:"column",gap:8,opacity:owned?0.7:canAfford?1:0.75,animation:owned||!canAfford?"none":rarAnim[item.rarity],...ownedStyle}}>
            {/* Rarity top bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${rarCol},transparent)`,opacity:owned?0.5:0.9,borderRadius:"4px 4px 0 0"}}/>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1.6rem",filter:`drop-shadow(0 0 10px ${rarCol}88)`}}>{item.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:owned?"#66BB6A":"var(--text)",fontWeight:"bold"}}>{item.name}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:rarCol,textTransform:"uppercase",letterSpacing:".08em"}}>{rarityLabel[item.rarity]||item.rarity}</div>
              </div>
              {owned&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".46rem",color:"#66BB6A",border:"1px solid rgba(102,187,106,.4)",padding:"2px 5px",background:"rgba(20,40,20,.5)",whiteSpace:"nowrap"}}>✓ Megvan</span>}
            </div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--muted)",fontStyle:"italic",lineHeight:1.5}}>{item.desc}</div>
            <button className="btn" onClick={()=>!owned&&buy(item)} style={{padding:"7px",background:owned?"rgba(0,0,0,.15)":canAfford?`rgba(${item.rarity==="legendary"?"100,80,0":item.rarity==="epic"?"60,30,100":item.rarity==="rare"?"10,50,100":"0,0,0"},.22)`:"rgba(0,0,0,.2)",border:`1px solid ${owned?"rgba(102,187,106,.3)":canAfford?rarCol+"66":"rgba(255,255,255,.08)"}`,color:owned?"#66BB6A":canAfford?rarCol:item.rarity==="rare"||item.rarity==="epic"||item.rarity==="legendary"?"rgba(180,180,180,.4)":"var(--dim)",fontFamily:"'Cinzel',serif",fontSize:".62rem",cursor:owned||!canAfford?"default":"pointer",textTransform:"uppercase",letterSpacing:".08em",boxShadow:!owned&&canAfford?`0 0 10px ${rarCol}22`:"none"}}>
              {owned?"✓ Birtokolod":canAfford?"🪙 "+item.price+" arany":"🔒 "+item.price+" arany szükséges"}
            </button>
          </div>;
        })}
      </div>
    </div>
  </div>;
}


// ═══ NAGY KÖZÉPSŐ KOCKA OVERLAY ═══════════════════════════════════════════════
function CenterDiceOverlay({data}){
  // data = {rolling, value, field, playerName, extra}
  if(!data)return null;
  const {rolling,value,field,playerName,extra}=data;
  const fieldColor=field?FS[field.t]||"#C9A84C":"#C9A84C";
  return <div style={{position:"fixed",inset:0,zIndex:550,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    background:"rgba(2,1,0,.88)",
    animation:"zI .2s ease"}}>
    {/* Radial glow */}
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 50%,rgba(201,168,76,.18),transparent 60%)`,pointerEvents:"none"}}/>
    {/* Player name */}
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--muted)",letterSpacing:".2em",textTransform:"uppercase",marginBottom:20,animation:"sU .3s ease"}}>
      {playerName} dob...
    </div>
    {/* THE BIG DICE */}
    <div style={{animation:rolling?"diceGlowPulse 0.6s ease-in-out infinite":"popIn .4s cubic-bezier(.4,0,.2,1)",filter:rolling?"drop-shadow(0 0 28px rgba(255,200,50,.85)) drop-shadow(0 0 60px rgba(201,168,76,.5)) drop-shadow(0 0 100px rgba(201,168,76,.2))":"drop-shadow(0 0 42px rgba(255,215,0,.75)) drop-shadow(0 0 80px rgba(201,168,76,.4))"}}>
      <Dice3D value={value} rolling={rolling} size={160}/>
    </div>
    {/* Result text - only when settled */}
    {!rolling&&field&&<>
      <div style={{marginTop:28,fontFamily:"'Cinzel Decorative',serif",fontSize:"2.5rem",color:"var(--gold)",animation:"gP 1.5s ease infinite",letterSpacing:".1em"}}>
        {value}{extra>0&&<span style={{fontSize:"1.4rem",color:"#E67E22"}}> +{extra}</span>}
      </div>
      <div style={{marginTop:12,display:"flex",alignItems:"center",gap:10,animation:"sU .4s ease"}}>
        <span style={{fontSize:"1.8rem",filter:`drop-shadow(0 0 12px ${fieldColor})`}}>{field.e}</span>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".85rem",color:"var(--gold)",letterSpacing:".08em"}}>{field.n}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:fieldColor,textTransform:"uppercase",marginTop:3}}>{field.t}</div>
        </div>
      </div>
      {/* Countdown bar */}
      <div style={{marginTop:20,width:160,height:3,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${fieldColor},var(--gold))`,borderRadius:2,
          animation:"shrinkBar 2s linear forwards"}}/>
      </div>
      <style>{`@keyframes shrinkBar{from{width:100%}to{width:0%}}`}</style>
    </>}
  </div>;
}

// ═══ EPIK TÁBLA SVG ════════════════════════════════════════════════════════════
function EpicBoard({players,myPos,onFieldClick}){
  const pathD=FIELDS.map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" ");
  const travD=myPos>0?FIELDS.slice(0,myPos+1).map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" "):null;
  // Row connectors (vertical links between rows)
  const conn1=`M${FIELDS[14].x},${FIELDS[14].y} L${FIELDS[15].x},${FIELDS[15].y}`;
  const conn2=`M${FIELDS[29].x},${FIELDS[29].y} L${FIELDS[30].x},${FIELDS[30].y}`;

  // Region zones (background blobs for each area)
  const regions=[
    {cx:25,cy:83,rx:22,ry:6,col:"rgba(107,140,62,.2)"},   // Shire (bottom-left)
    {cx:85,cy:82,rx:18,ry:6,col:"rgba(30,40,20,.25)"},     // Mirkwood bejárat
    {cx:100,cy:61,rx:16,ry:8,col:"rgba(5,20,5,.35)"},      // Mirkwood
    {cx:72,cy:59,rx:12,ry:6,col:"rgba(12,50,100,.3)"},     // Tóváros
    {cx:47,cy:58,rx:8,  ry:5,col:"rgba(150,30,0,.2)"},     // Smaug területe
    {cx:65,cy:32,rx:30, ry:8,col:"rgba(100,70,0,.18)"},    // Erebor (top-right)
  ];

  return <svg viewBox="0 0 120 90" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
    <defs>
      <radialGradient id="bG" cx="30%" cy="70%" r="80%"><stop offset="0%" stopColor="#2a1e0a"/><stop offset="40%" stopColor="#1e1508"/><stop offset="75%" stopColor="#140f05"/><stop offset="100%" stopColor="#0a0702"/></radialGradient>
      <radialGradient id="parchInner" cx="50%" cy="50%" r="70%"><stop offset="0%" stopColor="rgba(62,50,30,.55)"/><stop offset="100%" stopColor="rgba(10,8,3,0)"/></radialGradient>
      <filter id="parchNoise" x="0%" y="0%" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noiseOut"/><feColorMatrix type="saturate" values="0" in="noiseOut" result="grayNoise"/><feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blend"/><feComposite in="blend" in2="SourceGraphic" operator="in"/></filter>
      <filter id="gw" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="sh"><feDropShadow dx=".3" dy=".5" stdDeviation=".6" floodOpacity=".6"/></filter>
      <filter id="fF" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.8" result="b"/><feColorMatrix type="matrix" values="1.2 .4 0 0 0  .3 .08 0 0 0  0 0 0 0 0  0 0 0 1.6 0" in="b" result="fr"/><feMerge><feMergeNode in="fr"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="pF" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.5" result="b"/><feColorMatrix type="matrix" values=".3 0 .6 0 0  0 0 .4 0 0  .6 0 1.1 0 0  0 0 0 1.5 0" in="b" result="pu"/><feMerge><feMergeNode in="pu"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="dotP" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".24" fill="rgba(201,168,76,.04)"/></pattern>
    </defs>
    <rect width="120" height="90" fill="url(#bG)"/>
    <rect width="120" height="90" fill="url(#parchInner)" opacity=".8"/>
    <rect width="120" height="90" fill="url(#dotP)"/>
    {/* Parchment vignette edges */}
    <rect width="120" height="90" fill="none" stroke="rgba(139,90,43,.12)" strokeWidth="8" strokeLocation="inside"/>
    <rect x="1" y="1" width="118" height="88" fill="none" stroke="rgba(201,168,76,.06)" strokeWidth="0.5"/>
    {/* Stars */}
    {[[8,5],[18,7],[32,3],[48,2],[62,5],[77,3],[91,6],[105,4],[112,10],[113,22],[4,20],[3,42],[4,62],[113,45],[111,65],[56,7],[38,8],[88,9]].map(([sx,sy],i)=>
      <circle key={i} cx={sx} cy={sy} r=".2" fill="rgba(255,245,200,.75)" style={{animation:`starBlink ${1.4+i*.27}s ${i*.16}s ease-in-out infinite`}}/>)}
    {/* Region backgrounds */}
    {regions.map((r,i)=><ellipse key={i} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill={r.col}/>)}
    {/* Mirkwood trees (top-right area) */}
    {[[85,10],[91,8],[97,8],[103,10],[108,13],[113,17]].map(([tx,ty],i)=>(
      <g key={i} transform={`translate(${tx},${ty}) scale(.7)`}>
        <polygon points="0,-5 2.5,.5 -2.5,.5" fill="#051205" opacity=".7"/>
        <polygon points="0,-3.5 1.8,.3 -1.8,.3" fill="#091809" opacity=".9"/>
        <rect x="-.4" y=".5" width=".8" height="1.5" fill="#1a0e06" opacity=".8"/>
      </g>))}
    {/* Shire hills (bottom-left) */}
    <ellipse cx="22" cy="88" rx="14" ry="5" fill="rgba(60,100,20,.2)"/>
    <ellipse cx="12" cy="86" rx="6"  ry="3" fill="rgba(60,100,20,.15)"/>
    {/* Erebor mountain (top-right) */}
    <g transform="translate(110,20)">
      <polygon points="0,-16 8,0 -8,0" fill="#5a4a08" opacity=".55"/>
      <polygon points="-2,-8 4,0 -8,0" fill="rgba(0,0,0,.2)"/>
      <polygon points="0,-16 1.8,-10 -1.8,-10" fill="rgba(255,215,0,.35)"/>
    </g>
    <ellipse cx="108" cy="26" rx="7" ry="3" fill="rgba(201,168,76,.1)" style={{animation:"smaugBreath 4s ease-in-out infinite",transformOrigin:"108px 26px"}}/>
    {/* Smaug fire (around field 24) */}
    <ellipse cx="47" cy="57" rx="7" ry="3" fill="rgba(255,50,0,.07)" style={{animation:"smaugBreath 2.5s ease-in-out infinite",transformOrigin:"47px 57px"}}/>
    {/* Lake water (around field 20) */}
    <ellipse cx="75" cy="55" rx="8" ry="4" fill="rgba(15,55,110,.4)"/>
    {[0,1,2].map(i=><line key={i} x1={70+i*4} y1={54+i*.4} x2={73+i*4} y2={54+i*.4} stroke="rgba(100,180,255,.25)" strokeWidth=".5"/>)}
    {/* PATH - 3 layers */}
    {/* Row connectors */}
    <path d={conn1} fill="none" stroke="rgba(0,0,0,.6)" strokeWidth="3.5" strokeLinecap="round"/>
    <path d={conn1} fill="none" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round"/>
    <path d={conn1} fill="none" stroke="rgba(201,168,76,.15)" strokeWidth="1.0" strokeLinecap="round" strokeDasharray="2,3"/>
    <path d={conn2} fill="none" stroke="rgba(0,0,0,.6)" strokeWidth="3.5" strokeLinecap="round"/>
    <path d={conn2} fill="none" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round"/>
    <path d={conn2} fill="none" stroke="rgba(201,168,76,.15)" strokeWidth="1.0" strokeLinecap="round" strokeDasharray="2,3"/>
    {/* Main path */}
    <path d={pathD} fill="none" stroke="rgba(0,0,0,.7)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={pathD} fill="none" stroke="#2e1a0c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={pathD} fill="none" stroke="#5a3818" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,4.5" opacity=".5"/>
    {/* Travelled path glow */}
    {travD&&<>
      <path d={travD} fill="none" stroke="rgba(201,168,76,.2)" strokeWidth="3.0" strokeLinecap="round"/>
      <path d={travD} fill="none" stroke="rgba(255,215,0,.6)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2,4" style={{animation:"dF 1.2s linear infinite"}}/>
    </>}
    {/* FIELDS */}
    {FIELDS.map(f=>{
      const fill=FC[f.t]||"#141009";const stroke=FS[f.t]||"#6a5030";const r=FR[f.t]||2.5;
      const here=players.filter(p=>p.position===f.id);const isMyPos=myPos===f.id;const spec=f.t!=="normal";
      return <g key={f.id} onClick={()=>onFieldClick(f)} style={{cursor:"pointer"}} filter="url(#sh)">
        {spec&&<circle cx={f.x} cy={f.y} r={r+2.5} fill={stroke} opacity={isMyPos?.18:.06}/>}
        {isMyPos&&<>
          <circle cx={f.x} cy={f.y} r={r+5} fill="none" stroke="rgba(255,215,0,.18)" strokeWidth=".55" style={{animation:"rp 2s ease-out infinite"}}/>
          <circle cx={f.x} cy={f.y} r={r+3} fill="none" stroke="rgba(255,215,0,.35)" strokeWidth=".5" style={{animation:"rp 2s .6s ease-out infinite"}}/>
        </>}
        {f.t==="smaug"&&<circle cx={f.x} cy={f.y} r={r+1.4} fill="rgba(255,50,0,.14)" filter="url(#fF)" style={{animation:"smaugBreath 1.8s ease-in-out infinite",transformOrigin:`${f.x}px ${f.y}px`}}/>}
        {f.t==="gollam"&&<circle cx={f.x} cy={f.y} r={r+1.4} fill="rgba(130,60,170,.14)" filter="url(#pF)" style={{animation:"smaugBreath 2.5s ease-in-out infinite",transformOrigin:`${f.x}px ${f.y}px`}}/>}
        <circle cx={f.x} cy={f.y} r={r+.6} fill={fill} opacity=".5"/>
        <circle cx={f.x} cy={f.y} r={r} fill={fill} stroke={isMyPos?"#FFD700":stroke} strokeWidth={isMyPos?.75:spec?.42:.22}/>
        <circle cx={f.x-r*.2} cy={f.y-r*.2} r={r*.46} fill="rgba(255,255,255,.07)"/>
        <text x={f.x} y={f.y+.7} textAnchor="middle" dominantBaseline="middle" fontSize={f.t==="start"||f.t==="finish"?"3.2":spec?"2.25":"2.0"}>{f.e}</text>
        {here.map((p,i)=>{const rc=raceOf(p.race);const ox=(i-(here.length-1)/2)*3.0;const isMe=p.isMe;
          return <g key={p.name} transform={`translate(${f.x+ox},${f.y-r-2.2})`} style={{animation:isMe?"tF 1.4s ease-in-out infinite":"tokenFloat 3s ease-in-out infinite"}} filter={isMe?"url(#gw)":"url(#sh)"}>
            {/* Token glow halo */}
            <circle cx="0" cy="0" r="2.0" fill={rc.color} opacity=".18" filter="url(#gw)"/>
            <ellipse cx=".2" cy="1.8" rx="1.1" ry=".45" fill="rgba(0,0,0,.55)"/>
            {/* Token body with race color gradient */}
            <circle cx="0" cy="0" r="1.5" fill={rc.color} opacity=".35"/>
            <circle cx="0" cy="0" r="1.35" fill={rc.color} stroke={isMe?"#FFD700":`rgba(${rc.rgb},.9)`} strokeWidth={isMe?.55:.32}/>
            <circle cx="-.3" cy="-.3" r=".4" fill="rgba(255,255,255,.35)"/>
            <text x="0" y=".4" textAnchor="middle" dominantBaseline="middle" fontSize="1.0">{rc.icon}</text>
            {isMe&&<circle cx="0" cy="0" r="1.8" fill="none" stroke="rgba(255,215,0,.55)" strokeWidth=".32" style={{animation:"rp 2s ease-out infinite"}}/>}
            {isMe&&<circle cx="0" cy="0" r="2.4" fill="none" stroke={`rgba(${rc.rgb},.28)`} strokeWidth=".22" style={{animation:"rp 2s .5s ease-out infinite"}}/>}
          </g>;
        })}
      </g>;
    })}
    {/* Row labels */}
    <text x="60" y="88.5" textAnchor="middle" fontSize="1.2" fill="rgba(201,168,76,.28)" fontFamily="Cinzel,serif" fontStyle="italic">Shire → Mirkwood bejárat</text>
    <text x="60" y="56" textAnchor="middle" fontSize="1.2" fill="rgba(201,168,76,.22)" fontFamily="Cinzel,serif" fontStyle="italic">Bakacsinerdő ← Tóváros</text>
    <text x="60" y="27.5" textAnchor="middle" fontSize="1.2" fill="rgba(201,168,76,.28)" fontFamily="Cinzel,serif" fontStyle="italic">Erebor mélye → Kincseskamra</text>
    {/* Start/Finish labels */}
    <text x="10" y="87" textAnchor="middle" fontSize="1.4" fill="#7BC34A" fontFamily="Cinzel,serif" opacity=".9">START</text>
    <text x="110" y="40" textAnchor="middle" fontSize="1.4" fill="#FFD700" fontFamily="Cinzel,serif" opacity=".9">CÉL</text>
    {/* Legend */}
    <g transform="translate(1,1)"><rect width="17" height="14" rx="1" fill="rgba(0,0,0,.72)" stroke="rgba(201,168,76,.14)" strokeWidth=".3"/>
      {[["#1e4d08","#7BC34A","Bónusz"],["#4d0000","#E74C3C","Csapda"],["#1e0d50","#9B69BD","Kvíz"],["#4a1c00","#E67E22","Mini"]].map(([f2,s,l],i)=>
        <g key={i} transform={`translate(1.2,${1.8+i*2.8})`}><circle cx="1" cy="0" r=".8" fill={f2} stroke={s} strokeWidth=".28"/><text x="2.6" y=".42" fontSize="1.3" fill="rgba(201,168,76,.55)" fontFamily="Cinzel,serif">{l}</text></g>)}
    </g>
  </svg>;
}

// ═══ SEGÉD KOMPONENSEK ═══════════════════════════════════════════════════════
function Notif({n}){
  if(!n)return null;
  return <div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:500,padding:"9px 18px",background:"rgba(4,2,1,.98)",border:`1px solid ${n.color}`,fontFamily:"'Cinzel',serif",fontSize:".75rem",color:n.color,letterSpacing:".07em",whiteSpace:"nowrap",pointerEvents:"none",boxShadow:`0 0 20px ${n.color}44`,animation:"sU .2s ease",borderRadius:2}}>{n.msg}</div>;
}

function PanelHeader({title,sub}){
  return <div style={{padding:"14px 16px 10px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".72rem",color:"var(--gold)",letterSpacing:".06em",animation:"gP 3s ease infinite"}}>{title}</div>
    {sub&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>{sub}</div>}
  </div>;
}

// ═══ RANKED QUEUE SCREEN ═════════════════════════════════════════════════════
function RankedQueueScreen({pid,user,myElo,onCancel,notif}){
  const race=raceOf(user?.race);const rank=getGameRank(myElo);
  const [dots,setDots]=useState("");const [elapsed,setElapsed]=useState(0);const [queueCount,setQueueCount]=useState(1);
  useEffect(()=>{const iv=setInterval(()=>{setDots(d=>d.length>=3?"":d+".");setElapsed(e=>e+1);},1000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{
    const qRef=ref(db,"ranked_queue");
    onValue(qRef,(snap)=>{const d=snap.val()||{};setQueueCount(Object.keys(d).length);});
    return()=>off(qRef);
  },[]);
  const mins=String(~~(elapsed/60)).padStart(2,"0");const secs=String(elapsed%60).padStart(2,"0");
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 50% 40%,rgba(122,74,187,.15),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style><Notif n={notif}/>
    <div style={{width:"100%",maxWidth:420,background:"linear-gradient(170deg,rgba(22,16,7,.98),rgba(8,6,2,.99))",border:"1px solid rgba(122,74,187,.35)",padding:"34px 26px",display:"flex",flexDirection:"column",alignItems:"center",gap:18,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9), 0 0 40px rgba(122,74,187,.12)",animation:"zI .3s ease"}}>
      <div style={{fontSize:"3rem",animation:"tokenFloat 2s ease-in-out infinite",filter:"drop-shadow(0 0 22px rgba(122,74,187,.6))"}}>⚔️</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.3rem",color:"#B39DDB",animation:"gP 2s ease infinite"}}>Ranked Keresés</div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 18px",background:`rgba(${race.rgb},.08)`,border:`1px solid rgba(${race.rgb},.28)`,borderRadius:3}}>
        <span style={{fontSize:"1.2rem"}}>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{pid}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:rank.color,border:`1px solid ${rank.color}44`,padding:"2px 8px",background:`${rank.color}11`}}>{rank.icon} {myElo}</span>
      </div>
      <div style={{width:"100%",padding:"18px",background:"rgba(122,74,187,.06)",border:"1px solid rgba(122,74,187,.2)",borderRadius:3,textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".9rem",color:"var(--text)",marginBottom:8}}>Ellenfél keresése{dots}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.8rem",color:"#B39DDB",letterSpacing:".15em"}}>{mins}:{secs}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--dim)",marginTop:8}}>{queueCount} játékos a sorban</div>
        {/* Search animation */}
        <div style={{margin:"14px auto 0",width:120,height:4,background:"rgba(122,74,187,.15)",borderRadius:3,overflow:"hidden"}}>
          <div style={{width:"40%",height:"100%",background:"linear-gradient(90deg,transparent,#B39DDB,transparent)",borderRadius:3,animation:"searchSlide 1.5s ease-in-out infinite"}}/>
        </div>
      </div>
      <button className="btn" onClick={onCancel} style={{padding:"12px 28px",background:"rgba(229,57,53,.08)",border:"1px solid rgba(229,57,53,.3)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".1em",textTransform:"uppercase",borderRadius:2}}>✕ Keresés Leállítása</button>
    </div>
  </div>;
}

// ═══ LOBBY / WAITING / FINISHED ════════════════════════════════════════════════
function LobbyScreen({pid,user,friends,invites,onCreateGame,onJoinGame,onAcceptInvite,onDeclineInvite,onInviteFriend,onRankedQueue,myElo,notif,onBack}){
  const [code,setCode]=useState("");const race=raceOf(user?.race);
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 30% 40%,rgba(62,44,14,.6),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style><Notif n={notif}/>
    <div style={{width:"100%",maxWidth:500,background:"linear-gradient(170deg,rgba(22,16,7,.98),rgba(8,6,2,.99))",border:"1px solid rgba(201,168,76,.22)",padding:"30px 26px",display:"flex",flexDirection:"column",gap:16,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9), 0 0 40px rgba(139,90,43,.08), inset 0 1px 0 rgba(201,168,76,.08)",animation:"zI .3s ease"}}>
      {onBack&&<button className="btn" onClick={onBack} style={{alignSelf:"flex-start",padding:"6px 14px",background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",letterSpacing:".08em"}}>← Vissza</button>}
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"2.8rem",marginBottom:8,filter:"drop-shadow(0 0 22px rgba(201,168,76,.6))",animation:"gP 2.5s ease infinite"}}>🎲</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1rem,3vw,1.5rem)",color:"var(--gold)",animation:"gP 3s ease infinite"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--dim)",letterSpacing:".18em",textTransform:"uppercase",marginTop:5}}>Online Társasjáték · 2–4 játékos</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",alignSelf:"center",background:`rgba(${race.rgb},.08)`,border:`1px solid rgba(${race.rgb},.28)`,borderRadius:2}}>
        <span style={{fontSize:"1.2rem",filter:`drop-shadow(0 0 8px ${race.color})`}}>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{pid}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:race.color}}>· {race.name}</span>
      </div>
      {invites.length>0&&<div style={{padding:"11px",background:"rgba(122,74,187,.08)",border:"1px solid rgba(122,74,187,.4)",borderRadius:2,animation:"sU .3s ease"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#B39DDB",letterSpacing:".12em",textTransform:"uppercase",marginBottom:9}}>🎲 Meghívók ({invites.length})</div>
        {invites.map(inv=><div key={inv.from} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(122,74,187,.12)"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)",flex:1}}><span style={{color:"#B39DDB"}}>{inv.from}</span> meghívott!</span>
          <button className="btn" onClick={()=>onAcceptInvite(inv)} style={{padding:"4px 12px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.45)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".58rem",textTransform:"uppercase",borderRadius:2}}>✓ Belép</button>
          <button className="btn" onClick={()=>onDeclineInvite(inv)} style={{padding:"4px 8px",background:"none",border:"1px solid rgba(229,57,53,.22)",color:"rgba(229,57,53,.6)",fontFamily:"'Cinzel',serif",fontSize:".58rem",borderRadius:2}}>✗</button>
        </div>)}
      </div>}
      <button className="btn" onClick={onCreateGame} style={{padding:"13px",background:"linear-gradient(135deg,rgba(201,168,76,.14),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.5)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".14em",textTransform:"uppercase",boxShadow:"0 0 22px rgba(201,168,76,.12)",borderRadius:2}}>✦ Új szoba létrehozása</button>
      <button className="btn" onClick={onRankedQueue} style={{padding:"13px",background:"linear-gradient(135deg,rgba(122,74,187,.18),rgba(122,74,187,.06))",border:"1px solid rgba(122,74,187,.55)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".14em",textTransform:"uppercase",boxShadow:"0 0 22px rgba(122,74,187,.15)",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <span>⚔️</span> Ranked Meccs <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:getGameRank(myElo).color,border:`1px solid ${getGameRank(myElo).color}44`,padding:"1px 6px",background:`${getGameRank(myElo).color}11`}}>{myElo}</span>
      </button>
      <div style={{display:"flex",gap:8}}>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Szoba kód..." maxLength={6}
          style={{flex:1,background:"rgba(0,0,0,.55)",border:"1px solid rgba(201,168,76,.22)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:".85rem",padding:"11px 14px",outline:"none",letterSpacing:".12em",borderRadius:2}}/>
        <button className="btn" onClick={()=>onJoinGame(code)} style={{padding:"11px 18px",background:"rgba(58,122,139,.12)",border:"1px solid rgba(58,122,139,.5)",color:"#4DADE2",fontFamily:"'Cinzel',serif",fontSize:".72rem",textTransform:"uppercase",borderRadius:2}}>Belép</button>
        <button className="btn" onClick={()=>onJoinGame(code,true)} style={{padding:"11px 14px",background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.2)",color:"var(--dim)",fontFamily:"'Cinzel',serif",fontSize:".65rem",borderRadius:2}} title="Néző mód">👁</button>
      </div>
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--dim)",textTransform:"uppercase",marginBottom:8}}>— Barátaim ({friends.length}) —</div>
        {friends.map(f=>{const fr=raceOf(f.race);return <div key={f.name} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.08)",marginBottom:4,borderRadius:2}}>
          <span style={{fontSize:"1rem",filter:`drop-shadow(0 0 7px ${fr.color})`}}>{fr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{f.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:fr.color}}>{fr.name} · {f.score||0}pt</div></div>
          <button className="btn" onClick={()=>onInviteFriend(f.name)} style={{padding:"4px 12px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.38)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",textTransform:"uppercase",borderRadius:2}}>🎲 Meghív</button>
        </div>;})}
      </div>}
    </div>
  </div>;
}

function WaitingScreen({gameId,players,gameData,friends,pid,onStart,onInviteFriend,onLeave,notif}){
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 50% 40%,rgba(50,36,12,.65),rgba(3,2,1,1) 70%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style><Notif n={notif}/>
    <div style={{width:"100%",maxWidth:460,background:"linear-gradient(170deg,rgba(22,16,7,.98),rgba(8,6,2,.99))",border:"1px solid rgba(201,168,76,.22)",padding:"30px 26px",display:"flex",flexDirection:"column",gap:14,borderRadius:3,boxShadow:"0 0 80px rgba(0,0,0,.9), 0 0 40px rgba(139,90,43,.08), inset 0 1px 0 rgba(201,168,76,.08)",animation:"zI .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)",animation:"gP 2.5s ease infinite"}}>Váróterem</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--dim)",marginTop:3}}>{players.length}/4 játékos csatlakozott</div>
        </div>
        <button className="btn" onClick={onLeave} style={{padding:"6px 12px",background:"rgba(229,57,53,.08)",border:"1px solid rgba(229,57,53,.3)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".62rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:".08em",borderRadius:2}}>✕ Kilépés</button>
      </div>
      {/* Szoba kód — MINDIG látható */}
      <div style={{textAlign:"center"}}>
        <div style={{margin:"8px auto",padding:"14px 24px",background:"linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03))",border:"1px solid rgba(201,168,76,.42)",display:"inline-block",borderRadius:2,boxShadow:"0 0 36px rgba(201,168,76,.1)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--dim)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:5}}>Szoba kód — oszd meg!</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.9rem",color:"var(--gold)",letterSpacing:".3em",textShadow:"0 0 22px rgba(201,168,76,.5)"}}>{gameId}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {players.map(p=>{const pr=raceOf(p.race);return <div key={p.name} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",background:`rgba(${pr.rgb},.05)`,border:`1px solid rgba(${pr.rgb},.18)`,borderRadius:2,animation:"sU .3s ease"}}>
          <span style={{fontSize:"1.2rem",filter:`drop-shadow(0 0 9px ${pr.color})`}}>{pr.icon}</span>
          <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{p.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}</div></div>
          {p.name===gameData?.host&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)",border:"1px solid rgba(201,168,76,.35)",padding:"2px 8px",background:"rgba(201,168,76,.06)"}}>HOST</span>}
        </div>;})}
      </div>
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",letterSpacing:".12em",color:"var(--dim)",textTransform:"uppercase",marginBottom:7}}>— Barátok meghívása —</div>
        {friends.map(f=>{const fr=raceOf(f.race);return <div key={f.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 11px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.08)",marginBottom:4,borderRadius:2}}>
          <span>{fr.icon}</span><span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--text)"}}>{f.name}</span>
          <button className="btn" onClick={()=>onInviteFriend(f.name)} style={{padding:"4px 12px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.38)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",textTransform:"uppercase",borderRadius:2}}>🎲 Meghív</button>
        </div>;})}
      </div>}
      {gameData?.host===pid&&<button className="btn" onClick={onStart} style={{padding:"14px",background:"linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.5)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".82rem",letterSpacing:".15em",textTransform:"uppercase",boxShadow:"0 0 26px rgba(201,168,76,.18)",borderRadius:2,marginTop:4}}>▶ Játék Indítása</button>}
    </div>
  </div>;
}

function FinishedScreen({players,gameData,pid,onNewGame,onBack}){
  const isRanked=gameData?.ranked;const eloSnap=gameData?.eloSnapshot||{};const eloRes=gameData?.eloResults||{};
  const iWon=gameData?.winner===pid;
  useEffect(()=>{if(iWon)sfx.achievement();else sfx.error();},[]);
  return <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 50% 40%,rgba(80,60,8,.35),rgba(3,2,1,1) 65%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,zIndex:10}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:420,background:"linear-gradient(170deg,rgba(22,16,7,.98),rgba(8,6,2,.99))",border:"1px solid rgba(201,168,76,.25)",padding:"34px 26px",display:"flex",flexDirection:"column",alignItems:"center",gap:18,borderRadius:3,boxShadow:"0 0 100px rgba(0,0,0,.95), 0 0 50px rgba(139,90,43,.1), inset 0 1px 0 rgba(201,168,76,.1)",animation:"zI .35s ease"}}>
      <div style={{fontSize:"4.5rem",animation:"wB .6s ease",filter:`drop-shadow(0 0 38px ${iWon?"rgba(255,215,0,.8)":"rgba(229,57,53,.6)"})`}}>{iWon?"🏆":"😔"}</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:"var(--gold)",animation:"gP 2s ease infinite",textAlign:"center"}}>{iWon?"GYŐZELEM!":"Jó próbálkozás!"}</div>
      {isRanked&&<div style={{padding:"12px 18px",background:"rgba(122,74,187,.08)",border:"1px solid rgba(122,74,187,.35)",borderRadius:3,textAlign:"center",width:"100%",maxWidth:280,animation:"sU .4s ease"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#B39DDB",letterSpacing:".14em",textTransform:"uppercase",marginBottom:8}}>⚔️ Ranked ELO változás</div>
        {players.map(p=>{const oldElo=eloSnap[p.name]||1000;const newElo=eloRes[p.name]||oldElo;const diff=newElo-oldElo;const newRank=getGameRank(newElo);
          return <div key={p.name} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"6px 0"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:p.isMe?"var(--gold)":"var(--text)"}}>{p.name}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--dim)"}}>{oldElo}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:diff>0?"#66BB6A":"#EF9A9A"}}>→ {newElo} ({diff>0?"+":""}{diff})</span>
            <span style={{fontSize:".7rem"}}>{newRank.icon}</span>
          </div>;
        })}
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:320}}>
        {players.sort((a,b)=>b.score-a.score).map((p,i)=>{const pr=raceOf(p.race);return <div key={p.name} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 14px",background:p.isMe?"rgba(201,168,76,.07)":"rgba(255,255,255,.02)",border:`1px solid ${p.isMe?"rgba(201,168,76,.35)":"rgba(201,168,76,.08)"}`,animation:`sU ${.2+i*.1}s ease`,borderRadius:2}}>
          <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".82rem",color:"var(--gold)",minWidth:22}}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
          <span style={{fontSize:"1.0rem",filter:`drop-shadow(0 0 7px ${pr.color})`}}>{pr.icon}</span>
          <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".72rem",color:p.isMe?"var(--gold)":"var(--text)"}}>{p.name}{p.isMe?" (Te)":""}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",fontWeight:"bold"}}>{p.score}pt</span>
        </div>;})}
      </div>
      <button className="btn" onClick={onNewGame} style={{padding:"12px 28px",background:"linear-gradient(135deg,rgba(201,168,76,.14),rgba(201,168,76,.06))",border:"1px solid rgba(201,168,76,.45)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".13em",textTransform:"uppercase",marginTop:6,borderRadius:2}}>✦ Új Játék</button>
      {onBack&&<button className="btn" onClick={onBack} style={{padding:"8px 22px",background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".65rem",letterSpacing:".08em",cursor:"pointer",borderRadius:2}}>← Vissza a főmenübe</button>}
    </div>
  </div>;
}

// ═══ PLAYING SCREEN ════════════════════════════════════════════════════════════
function PlayingScreen({gd,pid,user,gameId,onRoll,onEventResult,eventField,rolling,diceVals,bursts,notif,coins,onBuyItem,centerDice,onLeave}){
  const [chatMsg,setChatMsg]=useState("");const [selField,setSelField]=useState(null);const [showShop,setShowShop]=useState(false);
  const chatRef=useRef(null);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[gd?.chat]);
  const players=Object.values(gd?.players||{}).map(p=>({...p,isMe:p.name===pid}));
  const myData=gd?.players?.[pid];const isMyTurn=gd?.currentTurn===pid;
  const myPos=myData?.position||0;const curField=FIELDS[myPos];
  const sendChat=async t=>{if(!t?.trim())return;await push(ref(db,`games/${gameId}/chat`),{player:pid,race:user?.race||"human",text:t.trim(),time:Date.now()});setChatMsg("");};

  return <div style={{position:"fixed",inset:0,background:"#050302",display:"flex",overflow:"hidden",zIndex:10,animation:"screenIn .4s ease"}}>
    <style>{CSS}</style>
    {bursts.map(b=><Burst key={b.id} x={b.x} y={b.y} color={b.color} onDone={b.onDone}/>)}
    {centerDice&&<CenterDiceOverlay data={centerDice}/>}
    {eventField&&isMyTurn&&<EventModal field={eventField} onResult={onEventResult}/>}
    {showShop&&<ShopModal coins={coins} ownedCards={myData?.cards||[]} onBuy={item=>{onBuyItem(item);}} onClose={()=>setShowShop(false)}/>}
    <Notif n={notif}/>
    {/* Field tooltip */}
    {selField&&!eventField&&!showShop&&<div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"10px 16px",background:"rgba(4,2,1,.98)",border:`1px solid ${FS[selField.t]||"rgba(201,168,76,.25)"}40`,maxWidth:250,textAlign:"center",animation:"sU .2s ease",boxShadow:"0 8px 36px rgba(0,0,0,.7)",borderRadius:3}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{selField.e} {selField.n}</div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:".84rem",color:"var(--muted)",fontStyle:"italic",marginTop:4,lineHeight:1.5}}>{selField.t==="trap"?"⚠️ Csapda":selField.t==="bonus"?"✨ Bónusz +20pt":selField.t==="quiz"?"❓ Kvíz kihívás":selField.t==="minigame"?"🎮 Minijáték":selField.t==="gollam"?"💍 Gollam találós":selField.t==="smaug"?"🔥 SMAUG −30pt":"Normál mező"}</div>
      <button onClick={()=>setSelField(null)} style={{marginTop:5,background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:".62rem",fontFamily:"'Cinzel',serif"}}>× bezár</button>
    </div>}

    {/* LEFT PANEL */}
    <div className="sc" style={{width:212,flexShrink:0,display:"flex",flexDirection:"column",background:"linear-gradient(180deg,rgba(14,10,5,.98),rgba(7,5,2,.99))",borderRight:"1px solid rgba(201,168,76,.12)",overflowY:"auto",boxShadow:"inset -1px 0 20px rgba(0,0,0,.4)"}}>
      <PanelHeader title="Középföld" sub={`Kör: ${gd?.turnCount||0}`}/>
      {players.map(p=>{
        const pr=raceOf(p.race);const active=gd?.currentTurn===p.name;
        const pDice=diceVals[p.name]||{value:1,rolling:false};
        const cards=(p.cards||[]).map(cid=>PC.find(x=>x.id===cid)).filter(Boolean);
        return <div key={p.name} style={{padding:"12px 13px 10px",borderBottom:"1px solid rgba(201,168,76,.07)",background:active?"rgba(201,168,76,.06)":"transparent",borderLeft:active?"2px solid var(--gold)":"2px solid transparent",transition:"all .25s",position:"relative",flexShrink:0}}>
          {active&&<div style={{position:"absolute",top:0,left:2,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>}
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <span style={{fontSize:"1.05rem",filter:active?`drop-shadow(0 0 9px ${pr.color})`:"none"}}>{pr.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".64rem",color:active?"var(--gold)":"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}{p.isMe?" ★":""}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".46rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}{p.skipTurn?" · 💤":""}</div>
            </div>
            <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".68rem",color:"var(--gold)"}}>{p.score}</span>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:7,filter:active?"drop-shadow(0 0 11px rgba(201,168,76,.4))":"none"}}>
            <Dice3D value={pDice.value||1} rolling={pDice.rolling||false} size={active?60:44}/>
          </div>
          <div style={{height:2.5,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden",marginBottom:cards.length?5:0}}>
            <div style={{height:"100%",width:`${(p.position/44)*100}%`,background:`linear-gradient(90deg,${pr.color},var(--gold))`,borderRadius:2,transition:"width .6s ease"}}/>
          </div>
          {cards.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:3}}>{cards.map((cd,i)=><span key={i} title={`${cd.n}: ${cd.d}`} style={{fontSize:".85rem",cursor:"help"}}>{cd.i}</span>)}</div>}
        </div>;
      })}
    </div>

    {/* CENTER: Board */}
    <div style={{flex:1,position:"relative",overflow:"hidden",minWidth:0,background:"radial-gradient(ellipse at 50% 50%,rgba(62,50,30,.95),rgba(30,22,12,.98))",boxShadow:"inset 0 0 80px rgba(20,14,6,.8)"}}>
      <EpicBoard players={players} myPos={myPos} onFieldClick={f=>setSelField(f===selField?null:f)}/>
    </div>

    {/* RIGHT PANEL */}
    <div className="sc" style={{width:222,flexShrink:0,display:"flex",flexDirection:"column",background:"linear-gradient(180deg,rgba(14,10,5,.98),rgba(7,5,2,.99))",borderLeft:"1px solid rgba(201,168,76,.12)",overflowY:"auto",boxShadow:"inset 1px 0 20px rgba(0,0,0,.4)"}}>
      {/* Current field */}
      <div style={{padding:"12px 14px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--dim)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Jelenlegi mező</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"1.7rem",filter:`drop-shadow(0 0 10px ${FS[curField?.t]||"rgba(201,168,76,.3)"})`}}>{curField?.e}</span>
          <div><div style={{fontFamily:"'Cinzel',serif",fontSize:".66rem",color:"var(--gold)",lineHeight:1.3}}>{curField?.n}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:FS[curField?.t]||"var(--dim)",textTransform:"uppercase",marginTop:2}}>{curField?.t}</div></div>
        </div>
        <div style={{height:2,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden",marginTop:7}}>
          <div style={{height:"100%",width:`${(myPos/44)*100}%`,background:"linear-gradient(90deg,var(--gold),#FFD700)",borderRadius:2,transition:"width .5s ease"}}/>
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--dim)",marginTop:3,textAlign:"right"}}>{myPos}/44 · 🪙 {coins} arany</div>
      </div>
      {/* Turn */}
      <div style={{padding:"11px 14px",borderBottom:"1px solid var(--border)",background:isMyTurn?"rgba(201,168,76,.05)":"transparent",transition:"background .3s",flexShrink:0}}>
        {isMyTurn?<div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".07em",animation:"gP 2s ease infinite"}}>⚔️ A te köröd!</div>
          :<div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",color:"var(--muted)"}}><span style={{color:raceOf(players.find(p=>p.name===gd?.currentTurn)?.race).color}}>{gd?.currentTurn}</span> köre...</div>}
      </div>
      {/* ROLL */}
      <div style={{padding:"14px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <button onClick={onRoll} disabled={!isMyTurn||rolling||!!eventField} className="btn"
          style={{width:"100%",padding:"18px 0",background:isMyTurn&&!rolling&&!eventField?"linear-gradient(135deg,rgba(201,168,76,.25),rgba(139,90,43,.12),rgba(201,168,76,.2))":"rgba(0,0,0,.22)",border:`2px solid ${isMyTurn&&!rolling&&!eventField?"rgba(201,168,76,.7)":"rgba(255,255,255,.06)"}`,color:isMyTurn&&!rolling&&!eventField?"var(--gold)":"var(--dim)",fontFamily:"'Cinzel Decorative',serif",fontSize:".95rem",letterSpacing:".08em",cursor:isMyTurn&&!rolling&&!eventField?"pointer":"default",boxShadow:isMyTurn&&!rolling&&!eventField?"0 0 32px rgba(201,168,76,.3), inset 0 1px 0 rgba(255,215,0,.1)":"none",animation:isMyTurn&&!rolling&&!eventField?"aG 2s ease infinite":"none",borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",gap:4,textShadow:isMyTurn&&!rolling&&!eventField?"0 0 12px rgba(255,215,0,.4)":"none"}}>
          <span style={{fontSize:"2.2rem",filter:isMyTurn&&!rolling&&!eventField?"drop-shadow(0 0 8px rgba(255,215,0,.6))":"none"}}>{rolling?"⏳":"🎲"}</span>
          <span>{rolling?"Gurulás...":isMyTurn?"Kocka Dobása":"Várakozás..."}</span>
        </button>
      </div>
      {/* SHOP BUTTON */}
      <div style={{padding:"10px 14px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <button onClick={()=>setShowShop(true)} className="btn" style={{width:"100%",padding:"10px 0",background:"linear-gradient(135deg,rgba(180,130,0,.15),rgba(100,70,0,.08))",border:"1px solid rgba(201,168,76,.38)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <span>⚔️</span><span>Tóváros Piac</span><span style={{fontSize:".62rem",color:"var(--dim)"}}>({coins}🪙)</span>
        </button>
      </div>
      {/* Emotes */}
      <div style={{padding:"9px 13px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>Gyors emote</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {EMOTES.map(e=><button key={e} onClick={()=>sendChat(e)} className="btn" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(201,168,76,.1)",fontSize:"1.05rem",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:3}}>{e}</button>)}
        </div>
      </div>
      {/* Chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"9px 13px 11px",minHeight:0,gap:7}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--dim)",letterSpacing:".1em",textTransform:"uppercase",flexShrink:0}}>Chat</div>
        <div ref={chatRef} className="sc" style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:2.5,minHeight:50,maxHeight:160}}>
          {Object.values(gd?.chat||{}).slice(-25).map((m,i)=>{const mr=raceOf(m.race);return <div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:".8rem",color:"var(--muted)",lineHeight:1.35,wordBreak:"break-word"}}><span style={{color:mr.color,fontWeight:"bold"}}>{m.player}: </span>{m.text}</div>;})}
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatMsg)} placeholder="Üzenet..."
            style={{flex:1,background:"rgba(0,0,0,.5)",border:"1px solid rgba(201,168,76,.15)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".83rem",padding:"6px 9px",outline:"none",borderRadius:2}}/>
          <button onClick={()=>sendChat(chatMsg)} className="btn" style={{padding:"6px 10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".62rem",cursor:"pointer",borderRadius:2}}>→</button>
        </div>
      </div>
      {/* Legend */}
      <div style={{padding:"9px 13px",borderTop:"1px solid var(--border)",flexShrink:0}}>
        {[["#7BC34A","Bónusz"],["#E74C3C","Csapda"],["#9B69BD","Kvíz"],["#E67E22","Minijáték"],["#FF5252","Smaug"]].map(([c,l])=>
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--dim)"}}>{l}</span>
          </div>)}
      </div>
      {/* Leave */}
      <div style={{padding:"9px 13px",borderTop:"1px solid var(--border)",flexShrink:0}}>
        <button onClick={onLeave} className="btn" style={{width:"100%",padding:"8px 0",background:"rgba(229,57,53,.06)",border:"1px solid rgba(229,57,53,.25)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".62rem",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",borderRadius:2}}>✕ Kilépés</button>
      </div>
    </div>
  </div>;
}

// ═══ CONTROLLER ════════════════════════════════════════════════════════════════
export default function BoardGame({user,onBack}){
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
  const [centerDice,setCenterDice]=useState(null);
  const [myElo,setMyElo]=useState(1000);
  const screenRef=useRef(screen);
  const queueRef=useRef(null);

  const setScreen=s=>{setScreenRaw(s);screenRef.current=s;localStorage.setItem("hb_screen",s);};
  const setGameId=id=>{setGameIdRaw(id);id?localStorage.setItem("hb_gameId",id):localStorage.removeItem("hb_gameId");};
  const notify=(msg,color="var(--gold)",dur=2800)=>{setNotif({msg,color});setTimeout(()=>setNotif(null),dur);};
  const burst=color=>{const id=Date.now()+Math.random();const x=window.innerWidth/2,y=window.innerHeight*.55;setBursts(b=>[...b,{id,x,y,color,onDone:()=>setBursts(b2=>b2.filter(q=>q.id!==id))}]);};

  // Firebase subs
  useEffect(()=>{
    if(!pid)return;
    const fr=ref(db,`users/${pid}/friends`);onValue(fr,s=>setFriends(Object.values(s.val()||{})));
    const ir=ref(db,`users/${pid}/gameInvites`);onValue(ir,s=>setInvites(Object.values(s.val()||{})));
    // Load ELO
    const eloRef=ref(db,`users/${pid}/profile/elo`);
    onValue(eloRef,s=>{const v=s.val();if(typeof v==="number")setMyElo(v);});
    return()=>{off(fr);off(ir);off(eloRef);};
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
    return()=>off(gr);
  },[gameId]);

  const newGD=()=>({status:"waiting",host:pid,created:Date.now(),
    players:{[pid]:{name:pid,race:user?.race||"human",position:0,score:0,coins:50,cards:[],skipTurn:false,extraStep:0}},
    currentTurn:pid,turnCount:0,chat:{},winner:null,diceValues:{}});

  const createGame=async()=>{const id=genId();await set(ref(db,`games/${id}`),newGD());setGameId(id);setScreen("waiting");};

  const [spectating,setSpectating]=useState(false);

  const joinGame=async(code,asSpectator=false)=>{
    const id=(code||"").trim().toUpperCase();if(!id){notify("Írd be a kódot!","#EF9A9A");return;}
    // Easter egg
    if(id==="BILBO"&&localStorage.getItem("hobbit_egg_bilbo")!=="1"){
      const newElo=myElo+10000;setMyElo(newElo);
      await set(ref(db,`users/${pid}/profile/elo`),newElo);
      localStorage.setItem("hobbit_egg_bilbo","1");
      sfx.achievement?.();burst("#FFD700");
      notify("🍀 +10 000 ELO! Bilbo titkát feloldottad!","#66BB6A",4000);return;
    }
    if(id==="BILBO"){notify("Ezt a titkot már feloldottad!","var(--dim)");return;}
    const snap=await get(ref(db,`games/${id}`));if(!snap.exists()){notify("Nincs ilyen szoba!","#EF9A9A");return;}
    const d=snap.val();
    if(asSpectator){
      setGameId(id);setSpectating(true);setScreen(d.status==="finished"?"finished":"playing");notify("Nézőként csatlakoztál! 👁","#B39DDB");return;
    }
    if(d.status!=="waiting"){notify("A játék már elkezdődött!","#EF9A9A");return;}
    if(Object.keys(d.players||{}).length>=4){notify("A szoba tele van!","#EF9A9A");return;}
    await update(ref(db,`games/${id}/players/${pid}`),{name:pid,race:user?.race||"human",position:0,score:0,coins:50,cards:[],skipTurn:false,extraStep:0});
    setGameId(id);setSpectating(false);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };

  const acceptInvite=async inv=>{
    await remove(ref(db,`users/${pid}/gameInvites/${inv.from}`));
    const snap=await get(ref(db,`games/${inv.gameId}`));if(!snap.exists()){notify("Szoba nem létezik!","#EF9A9A");return;}
    await update(ref(db,`games/${inv.gameId}/players/${pid}`),{name:pid,race:user?.race||"human",position:0,score:0,coins:50,cards:[],skipTurn:false,extraStep:0});
    setGameId(inv.gameId);setScreen("waiting");notify("Csatlakoztál!","#66BB6A");
  };

  const inviteFriend=async(friendName,gid)=>{
    let id=gid||gameId;
    if(!id){const newId=genId();await set(ref(db,`games/${newId}`),newGD());setGameId(newId);setScreen("waiting");id=newId;}
    await set(ref(db,`users/${friendName}/gameInvites/${pid}`),{from:pid,gameId:id,sent:Date.now()});
    notify(`Meghívó: ${friendName}!`,"#B39DDB",3500);
  };

  const leaveGame=async()=>{
    if(gameId){
      try{
        await remove(ref(db,`games/${gameId}/players/${pid}`));
        const snap=await get(ref(db,`games/${gameId}`));
        if(snap.exists()&&snap.val().host===pid){
          await remove(ref(db,`games/${gameId}`));
        }
      }catch(e){console.warn("leaveGame:",e);}
    }
    setScreen("lobby");setGameId(null);setGd(null);
    localStorage.removeItem("hb_screen");localStorage.removeItem("hb_gameId");
  };

  // Ranked queue
  const joinRankedQueue=async()=>{
    await set(ref(db,`ranked_queue/${pid}`),{name:pid,race:user?.race||"human",elo:myElo,joined:Date.now()});
    setScreen("ranked_queue");
    // Listen for matches
    const mqRef=ref(db,`ranked_queue`);
    queueRef.current=mqRef;
    onValue(mqRef,async(snap)=>{
      const q=snap.val()||{};
      const entries=Object.values(q).filter(e=>e.name!==pid);
      if(entries.length>0&&screenRef.current==="ranked_queue"){
        // Find closest ELO match
        entries.sort((a,b)=>Math.abs(a.elo-myElo)-Math.abs(b.elo-myElo));
        const opp=entries[0];
        // Lower-name player creates the game to avoid double-creation
        if(pid<opp.name){
          const id=genId();
          const rankedGD={...newGD(),ranked:true,eloSnapshot:{[pid]:myElo,[opp.name]:opp.elo}};
          rankedGD.players[opp.name]={name:opp.name,race:opp.race||"human",position:0,score:0,coins:50,cards:[],skipTurn:false,extraStep:0};
          rankedGD.status="playing";
          await set(ref(db,`games/${id}`),rankedGD);
          // Notify both via ranked_match node
          await set(ref(db,`ranked_match/${pid}`),{gameId:id,opponent:opp.name});
          await set(ref(db,`ranked_match/${opp.name}`),{gameId:id,opponent:pid});
          // Clean queue
          await remove(ref(db,`ranked_queue/${pid}`));
          await remove(ref(db,`ranked_queue/${opp.name}`));
        }
      }
    });
    // Listen for match assignment
    const matchRef=ref(db,`ranked_match/${pid}`);
    onValue(matchRef,async(snap)=>{
      const m=snap.val();
      if(m&&m.gameId){
        off(mqRef);off(matchRef);
        await remove(ref(db,`ranked_match/${pid}`));
        setGameId(m.gameId);setScreen("playing");
        notify(`Ranked meccs: ${m.opponent} ellen!`,"#B39DDB",3500);
      }
    });
  };

  const cancelRankedQueue=async()=>{
    await remove(ref(db,`ranked_queue/${pid}`));
    if(queueRef.current){off(queueRef.current);queueRef.current=null;}
    const matchRef=ref(db,`ranked_match/${pid}`);off(matchRef);
    setScreen("lobby");
  };

  const startGame=async()=>{await update(ref(db,`games/${gameId}`),{status:"playing"});setScreen("playing");};

  const rollDice=async()=>{
    if(!gd||gd.currentTurn!==pid||rolling||eventField||centerDice)return;
    const myData=gd.players?.[pid];
    if(myData?.skipTurn){
      notify("Kimaradsz ebből a körből! 💤","#EF9A9A");
      const pls=Object.keys(gd.players);
      await update(ref(db,`games/${gameId}/players/${pid}`),{skipTurn:false});
      await update(ref(db,`games/${gameId}`),{currentTurn:pls[(pls.indexOf(pid)+1)%pls.length],turnCount:(gd.turnCount||0)+1});
      return;
    }
    const hasExtraDice=(myData?.cards||[]).includes("extraDice");
    setRolling(true);
    sfx.dice();
    // Show big center dice SPINNING
    setCenterDice({rolling:true,value:1,field:null,playerName:pid});
    await update(ref(db,`games/${gameId}/diceValues/${pid}`),{value:0,rolling:true});
    // Spin for 1.4s then settle
    let count=0;
    const iv=setInterval(()=>{
      const v=~~(Math.random()*6)+1;
      setDiceVals(d=>({...d,[pid]:{value:v,rolling:true}}));
      setCenterDice(cd=>cd?{...cd,value:v}:null);
      count++;
    },80);
    setTimeout(async()=>{
      clearInterval(iv);
      let roll=~~(Math.random()*6)+1;
      if(hasExtraDice){
        const r2=~~(Math.random()*6)+1;
        roll=Math.max(roll,r2);
        const newCards=(myData.cards||[]).filter(c=>c!=="extraDice");
        await update(ref(db,`games/${gameId}/players/${pid}`),{cards:newCards});
      }
      const extra=myData?.extraStep||0;
      const newPos=Math.min((myData?.position||0)+roll+extra,FIELDS.length-1);
      const field=FIELDS[newPos];
      // Show settled dice with result for 2 seconds
      setRolling(false);
      setDiceVals(d=>({...d,[pid]:{value:roll,rolling:false}}));
      setCenterDice({rolling:false,value:roll,field,playerName:pid,extra});
      await update(ref(db,`games/${gameId}/diceValues/${pid}`),{value:roll,rolling:false});
      // After 2 seconds: move player, hide overlay, show event
      setTimeout(async()=>{
        setCenterDice(null);
        await update(ref(db,`games/${gameId}/players/${pid}`),{position:newPos,extraStep:0});
        burst(FS[field.t]||"#C9A84C");
        setTimeout(()=>setEventField(field),400);
      },2000);
    },1400);
  };

  const handleEvent=async result=>{
    setEventField(null);
    if(!gd)return;
    const myData=gd.players?.[pid];
    const hasShield=(myData?.cards||[]).includes("shield");
    const hasSmaugProtect=(myData?.cards||[]).includes("smaug");
    // Shield/Smaug protection
    if((result.field.t==="trap"||result.field.t==="smaug")&&(hasShield||hasSmaugProtect)){
      const cardToRemove=hasShield?"shield":"smaug";
      const newCards=(myData.cards||[]).filter((c,i)=>i!==myData.cards.indexOf(cardToRemove));
      await update(ref(db,`games/${gameId}/players/${pid}`),{cards:newCards});
      notify(`🛡️ Pajzs megvédett!`,"#4DADE2");result.pts=0;
    }
    let score=Math.max(0,(myData?.score||0)+result.pts);
    let coins=Math.max(0,(myData?.coins||0));
    const upd={score};
    if(result.pts>0){burst("#66BB6A");notify(`+${result.pts} pont! ✨`,"#66BB6A");}
    else if(result.pts<0){burst("#E74C3C");notify(`${result.pts} pont...`,"#EF9A9A");}
    // Earn coins each turn + encounter coins
    upd.coins=coins+10+(result.pts>0?5:0)+(result.encounterCoins||0);
    if(result.field.t==="trap"){upd.skipTurn=true;upd.position=Math.max(0,(myData?.position||0)-2);}
    if(result.field.id===23)upd.position=Math.max(0,(myData?.position||0)-3);
    if(result.field.id===24){upd.score=Math.max(0,score-30);}
    if(result.field.id===37){upd.position=Math.min((myData?.position||0)+5,FIELDS.length-1);notify("🦅 Sasok megmentettek! +5 mező!","#3A7A8B");}
    if([8,26].includes(result.field.id))upd.position=Math.min((myData?.position||0)+2,FIELDS.length-1);
    // Portal card
    if((myData?.cards||[]).includes("portal")){
      const newCards2=(myData.cards||[]).filter((c,i)=>i!==myData.cards.indexOf("portal"));
      upd.cards=newCards2;upd.position=Math.min((myData?.position||0)+6,FIELDS.length-1);
      notify("✨ Mágikus kapu! +6 mező!","#9B69BD");
    }
    // Wisdom card used in quiz (handled in EventModal via hint prop)
    if(result.field.id===FIELDS.length-1||result.win){
      await update(ref(db,`games/${gameId}/players/${pid}`),upd);
      await update(ref(db,`games/${gameId}`),{status:"finished",winner:pid});
      // ELO update for ranked games
      if(gd.ranked&&gd.eloSnapshot){
        const opponents=Object.keys(gd.eloSnapshot).filter(n=>n!==pid);
        let newElo=myElo;
        for(const opp of opponents){
          newElo=calcElo(newElo,gd.eloSnapshot[opp]||1000,1);
        }
        await update(ref(db,`users/${pid}/profile`),{elo:newElo});
        // Update losers' ELO
        for(const opp of opponents){
          const oppElo=gd.eloSnapshot[opp]||1000;
          const oppNewElo=calcElo(oppElo,gd.eloSnapshot[pid]||1000,0);
          await update(ref(db,`users/${opp}/profile`),{elo:oppNewElo});
        }
        await update(ref(db,`games/${gameId}`),{eloResults:{[pid]:newElo,...Object.fromEntries(opponents.map(o=>[o,calcElo(gd.eloSnapshot[o]||1000,gd.eloSnapshot[pid]||1000,0)]))}});
      }
      burst("#FFD700");setScreen("finished");return;
    }
    await update(ref(db,`games/${gameId}/players/${pid}`),upd);
    const pls=Object.keys(gd.players);
    await update(ref(db,`games/${gameId}`),{currentTurn:pls[(pls.indexOf(pid)+1)%pls.length],turnCount:(gd.turnCount||0)+1});
  };

  const buyItem=async item=>{
    if(!gd)return;
    const myData=gd.players?.[pid];
    const coins=myData?.coins||0;
    if(coins<item.price)return;
    sfx.coin();
    // Instant effect items
    if(item.id==="arkenstone"){
      await update(ref(db,`games/${gameId}/players/${pid}`),{score:(myData?.score||0)+50,coins:coins-item.price});
      burst("#FFD700");notify("💎 Arkenstone: +50 pont!","#FFD700");return;
    }
    if(item.id==="portal"){
      const newPos=Math.min((myData?.position||0)+6,FIELDS.length-1);
      await update(ref(db,`games/${gameId}/players/${pid}`),{position:newPos,coins:coins-item.price});
      burst("#9B69BD");notify("✨ Mágikus kapu aktiválva! +6 mező!","#9B69BD");return;
    }
    // Card items
    const newCards=[...(myData?.cards||[]),item.id];
    await update(ref(db,`games/${gameId}/players/${pid}`),{cards:newCards,coins:coins-item.price});
    notify(`${item.icon} ${item.name} megvásárolva!`,"#B39DDB");
  };

  const players=Object.values(gd?.players||{}).map(p=>({...p,isMe:p.name===pid}));
  const myCoins=gd?.players?.[pid]?.coins||0;

  const resetGame=()=>{setScreen("lobby");setGameId(null);setGd(null);localStorage.removeItem("hb_screen");localStorage.removeItem("hb_gameId");};
  const handleLeaveAndBack=async()=>{await leaveGame();if(onBack)onBack();};

  if(screen==="lobby")return <LobbyScreen pid={pid} user={user} friends={friends} invites={invites} onCreateGame={createGame} onJoinGame={joinGame} onAcceptInvite={acceptInvite} onDeclineInvite={inv=>remove(ref(db,`users/${pid}/gameInvites/${inv.from}`))} onInviteFriend={inviteFriend} onRankedQueue={joinRankedQueue} myElo={myElo} notif={notif} onBack={onBack}/>;
  if(screen==="ranked_queue")return <RankedQueueScreen pid={pid} user={user} myElo={myElo} onCancel={cancelRankedQueue} notif={notif}/>;
  if(screen==="waiting")return <WaitingScreen gameId={gameId} players={players} gameData={gd} friends={friends} pid={pid} onStart={startGame} onInviteFriend={n=>inviteFriend(n,gameId)} onLeave={leaveGame} notif={notif}/>;
  if(screen==="finished")return <FinishedScreen players={players} gameData={gd} pid={pid} onNewGame={resetGame} onBack={()=>{resetGame();if(onBack)onBack();}} spectating={spectating}/>;
  return <>
    {spectating&&<div style={{position:"fixed",top:8,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"5px 16px",background:"rgba(122,74,187,.15)",border:"1px solid rgba(122,74,187,.4)",borderRadius:12,display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#B39DDB",letterSpacing:".12em"}}>👁 NÉZŐ MÓD</span>
      <button onClick={()=>{setSpectating(false);resetGame();}} style={{background:"none",border:"1px solid rgba(122,74,187,.3)",color:"#B39DDB",padding:"2px 8px",fontFamily:"'Cinzel',serif",fontSize:".5rem",cursor:"pointer",borderRadius:3}}>Kilépés</button>
    </div>}
    <PlayingScreen gd={gd} pid={spectating?"__spectator__":pid} user={user} gameId={gameId} onRoll={spectating?()=>{}:rollDice} onEventResult={spectating?()=>{}:handleEvent} eventField={spectating?null:eventField} rolling={rolling} diceVals={diceVals} bursts={bursts} notif={notif} coins={spectating?0:myCoins} onBuyItem={spectating?()=>{}:buyItem} centerDice={centerDice} onLeave={handleLeaveAndBack}/>
  </>;
}
