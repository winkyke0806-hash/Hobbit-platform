import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push, remove, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFvUaUSu_UxF4gkooovxtX-bLq1rRaI2E",
  authDomain: "hobbit-projekt.firebaseapp.com",
  projectId: "hobbit-projekt",
  storageBucket: "hobbit-projekt.firebasestorage.app",
  messagingSenderId: "481058932399",
  appId: "1:481058932399:web:cedeb299a9860b8580765a",
  databaseURL: "https://hobbit-projekt-default-rtdb.europe-west1.firebasedatabase.app"
};
const fbApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(fbApp);
window.__fbDB = { getDatabase:()=>db, ref, set, get, onValue, update, push, remove, off };

const RACES=[
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E",name:"Hobbit"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D",name:"Törpe"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B",name:"Tünde"},
  {id:"human", icon:"⚔️", color:"#8B7355",name:"Ember"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB",name:"Varázsló"},
];

// 45 mezős tábla kanyargós útvonallal
const FIELDS=[
  {id:0, name:"Zsákos-domb",       icon:"🏡",type:"start",   color:"#6B8C3E", x:12,y:88, region:"shire"},
  {id:1, name:"Bag End ösvény",    icon:"🌿",type:"normal",  color:"#5A5040", x:18,y:84, region:"shire"},
  {id:2, name:"Bywater fogadó",    icon:"🍺",type:"bonus",   color:"#3A7A8B", x:24,y:80, region:"shire"},
  {id:3, name:"Bree kapuja",       icon:"🚪",type:"normal",  color:"#5A5040", x:30,y:76, region:"wild"},
  {id:4, name:"Pusztai fogadó",    icon:"🌙",type:"quiz",    color:"#7A4ABB", x:36,y:72, region:"wild"},
  {id:5, name:"Veszélyes ösvény",  icon:"⚠️",type:"trap",    color:"#C0392B", x:40,y:67, region:"wild"},
  {id:6, name:"Trollok völgye",    icon:"👹",type:"minigame",color:"#E67E22", x:44,y:62, region:"trolls"},
  {id:7, name:"Troll barlang",     icon:"💀",type:"trap",    color:"#C0392B", x:47,y:57, region:"trolls"},
  {id:8, name:"Völgyzugoly",       icon:"🏔️",type:"bonus",   color:"#3A7A8B", x:50,y:52, region:"rivendell"},
  {id:9, name:"Ködös Hegy lába",   icon:"❄️",type:"normal",  color:"#5A5040", x:54,y:48, region:"mountains"},
  {id:10,name:"Goblin alagút",     icon:"👺",type:"minigame",color:"#E67E22", x:57,y:43, region:"mountains"},
  {id:11,name:"Gollam barlangja",  icon:"💍",type:"gollam",  color:"#2C3E50", x:60,y:38, region:"mountains"},
  {id:12,name:"Napfény kapuja",    icon:"☀️",type:"bonus",   color:"#3A7A8B", x:63,y:34, region:"wild"},
  {id:13,name:"Vad mezők",         icon:"🌲",type:"normal",  color:"#5A5040", x:66,y:30, region:"wild"},
  {id:14,name:"Beorn háza",        icon:"🐻",type:"bonus",   color:"#3A7A8B", x:69,y:26, region:"beorn"},
  {id:15,name:"Bakacsinerdő széle",icon:"🌑",type:"normal",  color:"#5A5040", x:72,y:23, region:"mirkwood"},
  {id:16,name:"Bakacsinerdő",      icon:"🕸️",type:"trap",    color:"#C0392B", x:75,y:21, region:"mirkwood"},
  {id:17,name:"Pókkirálynő",       icon:"🕷️",type:"minigame",color:"#E67E22", x:78,y:19, region:"mirkwood"},
  {id:18,name:"Thranduil erdeje",  icon:"🧝",type:"quiz",    color:"#7A4ABB", x:80,y:17, region:"mirkwood"},
  {id:19,name:"Tündekirály börtön",icon:"🔒",type:"trap",    color:"#C0392B", x:82,y:16, region:"mirkwood"},
  {id:20,name:"Hordók a folyón",   icon:"🛶",type:"minigame",color:"#E67E22", x:83,y:19, region:"lake"},
  {id:21,name:"Tóváros partja",    icon:"⛵",type:"normal",  color:"#5A5040", x:82,y:23, region:"lake"},
  {id:22,name:"Tóváros",           icon:"🏙️",type:"bonus",   color:"#3A7A8B", x:80,y:27, region:"lake"},
  {id:23,name:"Magányos Hegy lába",icon:"🏔️",type:"normal",  color:"#5A5040", x:78,y:31, region:"erebor"},
  {id:24,name:"Sárkány szele",     icon:"💨",type:"trap",    color:"#C0392B", x:76,y:35, region:"erebor"},
  {id:25,name:"Smaug tüze",        icon:"🔥",type:"smaug",   color:"#E74C3C", x:74,y:39, region:"erebor"},
  {id:26,name:"Titkos átjáró",     icon:"🗝️",type:"bonus",   color:"#3A7A8B", x:72,y:43, region:"erebor"},
  {id:27,name:"Öt Sereg Csatája",  icon:"⚔️",type:"minigame",color:"#E67E22", x:70,y:47, region:"erebor"},
  {id:28,name:"Erebor kapuja",     icon:"🏰",type:"quiz",    color:"#7A4ABB", x:67,y:50, region:"erebor"},
  {id:29,name:"Kincseskamra",      icon:"💎",type:"bonus",   color:"#FFD700", x:64,y:52, region:"erebor"},
  {id:30,name:"Arkenköves trón",   icon:"👑",type:"quiz",    color:"#7A4ABB", x:60,y:54, region:"erebor"},
  {id:31,name:"Törpe bányák",      icon:"⛏️",type:"normal",  color:"#5A5040", x:57,y:56, region:"erebor"},
  {id:32,name:"Smaug kincse",      icon:"🪙",type:"bonus",   color:"#3A7A8B", x:54,y:58, region:"erebor"},
  {id:33,name:"Bard nyila",        icon:"🏹",type:"quiz",    color:"#7A4ABB", x:51,y:59, region:"lake"},
  {id:34,name:"Hollók sziklája",   icon:"🐦",type:"normal",  color:"#5A5040", x:48,y:60, region:"wild"},
  {id:35,name:"Durin kapuja",      icon:"🚪",type:"minigame",color:"#E67E22", x:45,y:61, region:"mountains"},
  {id:36,name:"Mithril ér",        icon:"✨",type:"bonus",   color:"#3A7A8B", x:42,y:62, region:"mountains"},
  {id:37,name:"Goblin város",      icon:"🏚️",type:"trap",    color:"#C0392B", x:38,y:63, region:"mountains"},
  {id:38,name:"Sasok fészke",      icon:"🦅",type:"bonus",   color:"#3A7A8B", x:34,y:62, region:"wild"},
  {id:39,name:"Carrock sziklája",  icon:"🪨",type:"quiz",    color:"#7A4ABB", x:30,y:60, region:"beorn"},
  {id:40,name:"Erdei folyó",       icon:"🌊",type:"normal",  color:"#5A5040", x:26,y:58, region:"mirkwood"},
  {id:41,name:"Nagy tó",           icon:"🏞️",type:"normal",  color:"#5A5040", x:22,y:56, region:"lake"},
  {id:42,name:"Tünde csarnokok",   icon:"🌟",type:"bonus",   color:"#3A7A8B", x:19,y:53, region:"mirkwood"},
  {id:43,name:"Utolsó állomás",    icon:"🌅",type:"quiz",    color:"#7A4ABB", x:17,y:49, region:"wild"},
  {id:44,name:"EREBOR — Cél!",     icon:"🏆",type:"finish",  color:"#FFD700", x:15,y:45, region:"erebor"},
];

const REGION_COLORS={
  shire:"rgba(107,140,62,0.12)", wild:"rgba(90,80,64,0.08)",
  trolls:"rgba(192,57,43,0.1)", rivendell:"rgba(58,122,139,0.12)",
  mountains:"rgba(80,80,100,0.1)", mirkwood:"rgba(30,40,30,0.15)",
  lake:"rgba(40,80,120,0.1)", beorn:"rgba(139,100,50,0.1)",
  erebor:"rgba(160,100,20,0.12)"
};

const QUIZ_QUESTIONS=[
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
const GOLLAM_RIDDLES=[
  {q:"Nincs hangom, de megszólalok. Mi vagyok?",opts:["szél","visszhang","kő","víz"],ok:1},
  {q:"Minél többet veszel, annál több marad. Mi vagyok?",opts:["lyuk","kincs","arany","levegő"],ok:0},
  {q:"Fogak vannak, de nem harap. Mi vagyok?",opts:["fésű","kő","fal","Gollam"],ok:0},
  {q:"Vízben születtem, vízben élek, de ha megiszom, meghalok. Mi vagyok?",opts:["hal","só","jég","kő"],ok:1},
];
const RUNE_CHALLENGES=[
  {rune:"ᚠ",name:"Feoh",meaning:"F — Gazdagság",answer:"F"},
  {rune:"ᚢ",name:"Ur",  meaning:"U — Erő",      answer:"U"},
  {rune:"ᚦ",name:"Thorn",meaning:"TH — Tövis",  answer:"TH"},
  {rune:"ᚨ",name:"Ansuz",meaning:"A — Istenek", answer:"A"},
  {rune:"ᚱ",name:"Raido",meaning:"R — Utazás",  answer:"R"},
  {rune:"ᚲ",name:"Kauno",meaning:"K — Fáklya",  answer:"K"},
];
const POWER_CARDS=[
  {id:"shield",icon:"🛡️",name:"Pajzs",      desc:"Következő csapda hatástalan"},
  {id:"speed", icon:"💨",name:"Szélroham",  desc:"+3 lépés következő körben"},
  {id:"wisdom",icon:"📜",name:"Gandalf",    desc:"Kvíznél mutatja a helyes választ"},
  {id:"portal",icon:"✨",name:"Mágikus kapu",desc:"Ugorj előre 5 mezőt"},
  {id:"freeze",icon:"❄️",name:"Jégbűvölet", desc:"Az utánad jövő kihagy egy kört"},
];
const EMOTES=["👍","😄","😱","🤔","🎉","💀","🔥","❄️","🧙","⚔️"];
const genId=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const getRace=(id)=>RACES.find(r=>r.id===id)||RACES[3];

// ── MINI GAMES ───────────────────────────────────────────────────────────────────
function QuizGame({onResult}){
  const [q]=useState(()=>QUIZ_QUESTIONS[Math.floor(Math.random()*QUIZ_QUESTIONS.length)]);
  const [sel,setSel]=useState(null);
  const [time,setTime]=useState(10);
  const [done,setDone]=useState(false);
  useEffect(()=>{
    if(done)return;
    const t=setInterval(()=>setTime(x=>{if(x<=1){clearInterval(t);setDone(true);onResult(false,0);return 0;}return x-1;}),1000);
    return()=>clearInterval(t);
  },[done]);
  const pick=(i)=>{if(done)return;setSel(i);setDone(true);const ok=i===q.ok;setTimeout(()=>onResult(ok,ok?20:0),800);};
  return<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>⚡ Gyors Kvíz — {time}mp</div>
    <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${time/10*100}%`,background:"linear-gradient(90deg,#E74C3C,var(--gold))",transition:"width 1s linear"}}/>
    </div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1rem",color:"var(--text)",lineHeight:1.5,padding:"8px 0"}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {q.opts.map((o,i)=>{
        let bg="rgba(0,0,0,.3)",border="rgba(201,168,76,.15)";
        if(done&&sel===i){bg=i===q.ok?"rgba(102,187,106,.15)":"rgba(229,57,53,.15)";border=i===q.ok?"#66BB6A":"#E53935";}
        else if(done&&i===q.ok){bg="rgba(102,187,106,.1)";border="#66BB6A";}
        return<button key={i} onClick={()=>pick(i)} style={{padding:"8px 12px",background:bg,border:`1px solid ${border}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",textAlign:"left",cursor:done?"default":"pointer",transition:"all .2s"}}>{o}</button>;
      })}
    </div>
  </div>;
}

function GollamGame({onResult}){
  const [q]=useState(()=>GOLLAM_RIDDLES[Math.floor(Math.random()*GOLLAM_RIDDLES.length)]);
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const pick=(i)=>{if(done)return;setSel(i);setDone(true);const ok=i===q.ok;setTimeout(()=>onResult(ok,ok?25:0),800);};
  return<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#9B59B6",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Gollam találós kérdése</div>
    <div style={{padding:"12px",background:"rgba(44,62,80,.4)",border:"1px solid rgba(155,89,182,.3)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",fontStyle:"italic",color:"#D7BDE2",lineHeight:1.6}}>
      "Találós kérdés, vagy megeszünk, igen Gollam!"<br/><br/>
      <strong style={{fontStyle:"normal",color:"var(--text)"}}>{q.q}</strong>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {q.opts.map((o,i)=>{
        let border="rgba(155,89,182,.3)";
        if(done&&i===q.ok)border="#66BB6A";
        else if(done&&sel===i)border="#E53935";
        return<button key={i} onClick={()=>pick(i)} style={{padding:"8px 12px",background:"rgba(44,62,80,.3)",border:`1px solid ${border}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",textAlign:"left",cursor:done?"default":"pointer"}}>{o}</button>;
      })}
    </div>
  </div>;
}

function RuneGame({onResult}){
  const [rune]=useState(()=>RUNE_CHALLENGES[Math.floor(Math.random()*RUNE_CHALLENGES.length)]);
  const [input,setInput]=useState("");
  const [done,setDone]=useState(false);
  const check=()=>{if(done)return;const ok=input.toUpperCase()===rune.answer;setDone(true);setTimeout(()=>onResult(ok,ok?30:0),800);};
  return<div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#3A7A8B",letterSpacing:".1em",textTransform:"uppercase",alignSelf:"flex-start"}}>🔮 Rúna Felismerés</div>
    <div style={{fontSize:"5rem",lineHeight:1,textShadow:"0 0 30px rgba(58,122,139,.8)"}}>{rune.rune}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--gm)",textAlign:"center"}}>Mi a neve? <span style={{color:"var(--td)"}}>({rune.name})</span></div>
    <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Betű..." disabled={done}
      style={{background:"rgba(0,0,0,.4)",border:"1px solid rgba(58,122,139,.4)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:"1.2rem",padding:"8px 16px",outline:"none",textAlign:"center",width:120}}/>
    {!done&&<button onClick={check} style={{padding:"8px 20px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.4)",color:"#3A7A8B",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer"}}>Elküld</button>}
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:input.toUpperCase()===rune.answer?"#66BB6A":"#EF9A9A"}}>{input.toUpperCase()===rune.answer?"✓ Helyes!":"✗ Volt: "+rune.meaning}</div>}
  </div>;
}

function SpotRing({onResult}){
  const [pos]=useState(()=>Math.floor(Math.random()*9));
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const icons=["🗡️","🏹","⚔️","🛡️","🔮","🪓","🗺️","🧢","💰"];
  const pick=(i)=>{if(done)return;setSel(i);setDone(true);const ok=i===pos;setTimeout(()=>onResult(ok,ok?40:0),600);};
  return<div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Hol a Gyűrű?</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",textAlign:"center",fontStyle:"italic"}}>Az egyik tárgy alatt rejtőzik...</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
      {icons.map((ic,i)=>{
        let border="rgba(201,168,76,.15)",bg="rgba(0,0,0,.3)";
        if(done&&i===pos){border="#FFD700";bg="rgba(201,168,76,.15)";}
        else if(done&&sel===i){border="#E53935";bg="rgba(229,57,53,.1)";}
        return<button key={i} onClick={()=>pick(i)} style={{width:52,height:52,fontSize:"1.6rem",background:bg,border:`1px solid ${border}`,cursor:done?"default":"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {done&&i===pos?"💍":ic}
        </button>;
      })}
    </div>
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:sel===pos?"#66BB6A":"#EF9A9A"}}>{sel===pos?"✓ Megtaláltad!":"✗ Nem ott volt..."}</div>}
  </div>;
}

// ── FIELD EVENT MODAL ─────────────────────────────────────────────────────────────
function FieldEventModal({field,onResult}){
  const [phase,setPhase]=useState("intro");
  const [pts,setPts]=useState(0);
  const [won,setWon]=useState(false);
  const typeInfo={
    bonus:{color:"#3A7A8B",title:"Bónusz!"},trap:{color:"#C0392B",title:"Csapda!"},
    quiz:{color:"#7A4ABB",title:"Kvíz!"},minigame:{color:"#E67E22",title:"Minijáték!"},
    gollam:{color:"#2C3E50",title:"Gollam!"},smaug:{color:"#E74C3C",title:"SMAUG!"},
    finish:{color:"#FFD700",title:"GYŐZELEM!"},
  };
  const info=typeInfo[field.type]||{color:"var(--gold)",title:"Mező"};
  const handleResult=(ok,p)=>{setWon(ok);setPts(p);setPhase("result");setTimeout(()=>onResult({ok,pts:p,field}),1200);};
  const isAutoField=field.type==="trap"||field.type==="smaug"||field.type==="bonus"||field.type==="finish";

  return<div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(4,3,2,.96)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{width:"100%",maxWidth:360,background:"linear-gradient(162deg,rgba(20,15,11,.99),rgba(8,6,4,.99))",border:`1px solid ${info.color}44`,padding:20,display:"flex",flexDirection:"column",gap:14,maxHeight:"82vh",overflowY:"auto"}}>
      {phase==="intro"&&<>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"2.5rem",marginBottom:6}}>{field.icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:info.color}}>{info.title}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",marginTop:4}}>{field.name}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".88rem",color:"var(--td)",marginTop:8,fontStyle:"italic",lineHeight:1.6}}>{field.desc||"..."}</div>
        </div>
        {field.type==="trap"&&<>
          <div style={{padding:"10px",background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#EF9A9A"}}>⚠️ Visszalépsz 2 mezőt!</div>
          <button onClick={()=>onResult({ok:false,pts:-5,field})} style={{padding:"10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Elfogadom ✗</button>
        </>}
        {field.type==="smaug"&&<>
          <div style={{padding:"10px",background:"rgba(231,76,60,.1)",border:"1px solid rgba(231,76,60,.3)",textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#EF9A9A"}}>🔥 Smaug tüze! −30 pont!</div>
          <button onClick={()=>onResult({ok:false,pts:-30,field})} style={{padding:"10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Elszenvedem ✗</button>
        </>}
        {field.type==="bonus"&&<>
          <div style={{padding:"10px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.3)",textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#81D4FA"}}>✨ +20 pont!</div>
          <button onClick={()=>onResult({ok:true,pts:20,field})} style={{padding:"10px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.4)",color:"#81D4FA",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Elfogadom ✓</button>
        </>}
        {field.type==="finish"&&<>
          <div style={{textAlign:"center",fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:"#FFD700",textShadow:"0 0 24px rgba(255,215,0,.5)"}}>🏆 GYŐZTÉL! 🏆</div>
          <button onClick={()=>onResult({ok:true,pts:100,field,win:true})} style={{padding:"12px",background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.5)",color:"#FFD700",fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",cursor:"pointer"}}>A KINCS A TIÉD!</button>
        </>}
        {(field.type==="quiz"||field.type==="minigame"||field.type==="gollam")&&
          <button onClick={()=>setPhase("game")} style={{padding:"11px",background:`rgba(${field.type==="gollam"?"44,62,80":"122,74,187"},.15)`,border:`1px solid ${info.color}55`,color:info.color,fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase"}}>Kihívás elfogadása ⚔️</button>
        }
      </>}
      {phase==="game"&&<>
        {(field.type==="quiz"||field.id===27||field.id===28||field.id===30||field.id===33||field.id===39||field.id===43)&&<QuizGame onResult={handleResult}/>}
        {field.type==="gollam"&&<GollamGame onResult={handleResult}/>}
        {(field.id===10||field.id===35)&&<RuneGame onResult={handleResult}/>}
        {field.id===17&&<SpotRing onResult={handleResult}/>}
        {field.type==="minigame"&&field.id!==10&&field.id!==17&&field.id!==27&&field.id!==35&&<QuizGame onResult={handleResult}/>}
      </>}
      {phase==="result"&&<div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontSize:"3rem"}}>{won?"🎉":"😔"}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:won?"var(--gold)":"#EF9A9A"}}>{won?"Sikeres!":"Nem sikerült..."}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gm)"}}>Pontok: <span style={{color:"var(--gold)"}}>{pts>0?"+":""}{pts}</span></div>
      </div>}
    </div>
  </div>;
}

// ── ILLUSTRATED BOARD (Everdell-stílusú) ─────────────────────────────────────────
function Tree({x,y,s=1,col="#4a7a2a"}){
  return<g transform={`translate(${x},${y}) scale(${s})`}>
    <polygon points="0,-3.5 2.2,0 -2.2,0"    fill={col} opacity="0.85"/>
    <polygon points="0,-5.5 2.8,0.5 -2.8,0.5" fill={col} opacity="0.6" transform="translate(0,1)"/>
    <rect x="-0.5" y="0" width="1" height="2" fill="#3a2a18" opacity="0.7"/>
  </g>;
}
function Mountain({x,y,s=1}){
  return<g transform={`translate(${x},${y}) scale(${s})`}>
    <polygon points="0,-6 4,0 -4,0" fill="#5a5a7a" opacity="0.5"/>
    <polygon points="-1,-3 2,0 -4,0" fill="#7a7a9a" opacity="0.3"/>
    <polygon points="0,-6 1,-4 -1,-4" fill="rgba(255,255,255,0.25)"/>
  </g>;
}
function Water({x,y,w=8,h=3,col="#2a6090"}){
  return<g transform={`translate(${x},${y})`}>
    <ellipse cx={w/2} cy={h/2} rx={w/2} ry={h/2} fill={col} opacity="0.35"/>
    <path d={`M0,${h/2} Q${w*0.25},${h*0.2} ${w*0.5},${h/2} Q${w*0.75},${h*0.8} ${w},${h/2}`}
      fill="none" stroke="rgba(120,200,255,0.3)" strokeWidth="0.5"/>
  </g>;
}

function GameBoard({players, myPosition, onFieldClick}){
  const pathD=FIELDS.map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" ");
  const travelledD=myPosition>0?FIELDS.slice(0,myPosition+1).map((f,i)=>i===0?`M${f.x},${f.y}`:`L${f.x},${f.y}`).join(" "):null;

  const typeStyle={
    start:   {fill:"#4a7a2a", stroke:"#8BC34A", r:2.6, shadow:"rgba(107,140,62,0.5)"},
    finish:  {fill:"#b8860b", stroke:"#FFD700", r:2.8, shadow:"rgba(255,215,0,0.6)"},
    bonus:   {fill:"#1a5276", stroke:"#5DADE2", r:2.2, shadow:"rgba(58,122,139,0.5)"},
    trap:    {fill:"#6e1a1a", stroke:"#E74C3C", r:2.0, shadow:"rgba(192,57,43,0.5)"},
    quiz:    {fill:"#3b1d6e", stroke:"#A569BD", r:2.2, shadow:"rgba(122,74,187,0.5)"},
    minigame:{fill:"#7d3c00", stroke:"#E67E22", r:2.2, shadow:"rgba(230,126,34,0.5)"},
    gollam:  {fill:"#1a1a2e", stroke:"#8E44AD", r:2.2, shadow:"rgba(142,68,173,0.6)"},
    smaug:   {fill:"#7b1010", stroke:"#FF5252", r:2.6, shadow:"rgba(231,76,60,0.7)"},
    normal:  {fill:"#2e2416", stroke:"#8D7645", r:1.8, shadow:"rgba(0,0,0,0.3)"},
  };

  return(
    <svg viewBox="0 0 96 96" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Background gradient — parchment/earth tone */}
        <radialGradient id="bgG" cx="40%" cy="60%" r="80%">
          <stop offset="0%"   stopColor="#2a1f0e"/>
          <stop offset="60%"  stopColor="#17110a"/>
          <stop offset="100%" stopColor="#0d0905"/>
        </radialGradient>

        {/* Region fills */}
        <radialGradient id="shireG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#4a7a2a" stopOpacity="0.4"/><stop offset="100%" stopColor="#4a7a2a" stopOpacity="0"/></radialGradient>
        <radialGradient id="mirkG"   cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0d2e0d" stopOpacity="0.7"/><stop offset="100%" stopColor="#0d2e0d" stopOpacity="0"/></radialGradient>
        <radialGradient id="lakeG"   cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1a4a6e" stopOpacity="0.5"/><stop offset="100%" stopColor="#1a4a6e" stopOpacity="0"/></radialGradient>
        <radialGradient id="ereborG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#6b4a0a" stopOpacity="0.45"/><stop offset="100%" stopColor="#6b4a0a" stopOpacity="0"/></radialGradient>
        <radialGradient id="mountG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3a3a5a" stopOpacity="0.4"/><stop offset="100%" stopColor="#3a3a5a" stopOpacity="0"/></radialGradient>
        <radialGradient id="rivG"    cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1a5a6e" stopOpacity="0.4"/><stop offset="100%" stopColor="#1a5a6e" stopOpacity="0"/></radialGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.0" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.5" in="SourceAlpha" result="s"/>
          <feOffset dx="0.3" dy="0.4" in="s" result="so"/>
          <feMerge><feMergeNode in="so"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Path texture */}
        <pattern id="pathPat" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.25" fill="rgba(201,168,76,0.08)"/>
        </pattern>
        <pattern id="grassPat" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <line x1="1" y1="3" x2="1" y2="1.5" stroke="rgba(80,120,40,0.12)" strokeWidth="0.4"/>
          <line x1="3" y1="3" x2="3.5" y2="1" stroke="rgba(80,120,40,0.1)" strokeWidth="0.4"/>
        </pattern>
      </defs>

      {/* ── BACKGROUND ── */}
      <rect width="96" height="96" fill="url(#bgG)"/>
      <rect width="96" height="96" fill="url(#pathPat)"/>

      {/* ── TERRAIN REGIONS (organic shapes) ── */}
      {/* Shire — lush green rolling hills */}
      <ellipse cx="20" cy="84" rx="16" ry="10" fill="url(#shireG)"/>
      <ellipse cx="20" cy="84" rx="16" ry="10" fill="url(#grassPat)" opacity="0.6"/>
      <text x="14" y="93" fontSize="1.3" fill="rgba(107,140,62,0.45)" fontFamily="Cinzel,serif" fontStyle="italic">Zsákos-domb</text>

      {/* Rivendell — cool blue glow */}
      <ellipse cx="50" cy="51" rx="9" ry="7" fill="url(#rivG)"/>
      <text x="46" y="61" fontSize="1.1" fill="rgba(93,173,226,0.4)" fontFamily="Cinzel,serif" fontStyle="italic">Völgyzugoly</text>

      {/* Misty Mountains — dark purple peaks */}
      <ellipse cx="59" cy="39" rx="10" ry="10" fill="url(#mountG)"/>
      <text x="54" y="50.5" fontSize="1.1" fill="rgba(130,130,180,0.4)" fontFamily="Cinzel,serif" fontStyle="italic">Ködös Hegy</text>

      {/* Mirkwood — dark oppressive green */}
      <ellipse cx="76" cy="19" rx="13" ry="10" fill="url(#mirkG)"/>
      <path d="M63,14 Q70,9 83,13 Q90,17 85,27 Q78,32 65,27 Q58,23 63,14Z" fill="rgba(10,30,10,0.3)"/>
      <text x="68" y="30.5" fontSize="1.2" fill="rgba(50,120,50,0.45)" fontFamily="Cinzel,serif" fontStyle="italic">Bakacsinerdő</text>

      {/* Lake-town — shimmering water */}
      <ellipse cx="82" cy="23" rx="8" ry="6" fill="url(#lakeG)"/>
      <path d="M74,20 Q78,17 86,19 Q90,22 86,27 Q82,30 76,27 Q72,24 74,20Z" fill="rgba(26,74,110,0.25)"/>
      <text x="76" y="31" fontSize="1.1" fill="rgba(90,170,220,0.45)" fontFamily="Cinzel,serif" fontStyle="italic">Tóváros</text>

      {/* Erebor — golden mountain */}
      <ellipse cx="71" cy="46" rx="16" ry="13" fill="url(#ereborG)"/>
      <text x="65" y="61" fontSize="1.3" fill="rgba(180,120,20,0.45)" fontFamily="Cinzel,serif" fontStyle="italic">Erebor</text>

      {/* ── DECORATIVE NATURE ELEMENTS ── */}
      {/* Shire trees */}
      <Tree x="8"  y="88" s="0.7" col="#5a8c30"/>
      <Tree x="12" y="90" s="0.9" col="#4a7a2a"/>
      <Tree x="28" y="85" s="0.6" col="#6a9a3a"/>
      <Tree x="32" y="87" s="0.7" col="#5a8c30"/>
      {/* Mirkwood dark trees */}
      <Tree x="65" y="12" s="0.8" col="#1a3a1a"/>
      <Tree x="70" y="10" s="1.0" col="#152a15"/>
      <Tree x="82" y="11" s="0.9" col="#1a3a1a"/>
      <Tree x="87" y="14" s="0.7" col="#122012"/>
      <Tree x="60" y="16" s="0.7" col="#1e3e1e"/>
      {/* Wild trees */}
      <Tree x="36" y="64" s="0.6" col="#3a6020"/>
      <Tree x="48" y="54" s="0.5" col="#4a7a2a"/>
      {/* Beorn woods */}
      <Tree x="64" y="22" s="0.7" col="#7a5a20"/>
      <Tree x="73" y="20" s="0.6" col="#8a6a28"/>

      {/* Mountains */}
      <Mountain x="54" y="34" s="0.9"/>
      <Mountain x="60" y="30" s="1.1"/>
      <Mountain x="66" y="33" s="0.8"/>
      {/* Erebor peak */}
      <Mountain x="68" y="38" s="1.3"/>
      <polygon points="71,36 74,42 68,42" fill="#c9a84c" opacity="0.2"/>

      {/* Water — Lake-town */}
      <Water x="76" y="20" w="10" h="5" col="#1a6090"/>
      {/* River near Mirkwood */}
      <path d="M72,27 Q75,29 78,27 Q81,25 84,27" fill="none" stroke="rgba(80,160,220,0.25)" strokeWidth="0.8"/>

      {/* ── ROAD / PATH ── */}
      {/* Road shadow */}
      <path d={pathD} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Road base — dirt track */}
      <path d={pathD} fill="none" stroke="#4a3820" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Road texture — lighter centre */}
      <path d={pathD} fill="none" stroke="#6a5030" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2,3"/>
      {/* Travelled portion glow */}
      {travelledD&&<path d={travelledD} fill="none" stroke="rgba(201,168,76,0.45)" strokeWidth="1.6" strokeLinecap="round" filter="url(#glow)"/>}

      {/* ── FIELD NODES ── */}
      {FIELDS.map(f=>{
        const ts=typeStyle[f.type]||typeStyle.normal;
        const playersHere=players.filter(p=>p.position===f.id);
        const isMyPos=myPosition===f.id;
        const isSpecial=f.type!=="normal";
        const r=ts.r;

        return(
          <g key={f.id} onClick={()=>onFieldClick(f)} style={{cursor:"pointer"}} filter={isMyPos?"url(#glow)":"url(#softShadow)"}>
            {/* Outer glow halo for special fields */}
            {isSpecial&&<circle cx={f.x} cy={f.y} r={r+1.8} fill={ts.shadow} opacity={isMyPos?0.7:0.35}/>}
            {/* My position large pulse ring */}
            {isMyPos&&<circle cx={f.x} cy={f.y} r={r+3.0} fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5"/>}
            {isMyPos&&<circle cx={f.x} cy={f.y} r={r+1.8} fill="none" stroke="rgba(255,215,0,0.5)" strokeWidth="0.4"/>}

            {/* Badge background — hexagonal feel via layered circles */}
            <circle cx={f.x} cy={f.y} r={r+0.5} fill={ts.fill} opacity="0.4"/>
            <circle cx={f.x} cy={f.y} r={r} fill={ts.fill} stroke={isMyPos?"#FFD700":ts.stroke} strokeWidth={isMyPos?"0.7":isSpecial?"0.4":"0.25"}/>
            {/* Inner highlight */}
            <circle cx={f.x-r*0.25} cy={f.y-r*0.25} r={r*0.45} fill="rgba(255,255,255,0.08)"/>

            {/* Emoji icon */}
            <text x={f.x} y={f.y+0.65}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={f.type==="start"||f.type==="finish"?"2.6":isSpecial?"2.1":"1.85"}>
              {f.icon}
            </text>

            {/* Player tokens — little coloured pawns above the field */}
            {playersHere.map((p,i)=>{
              const rc=getRace(p.race);
              const ox=(i-(playersHere.length-1)/2)*2.4;
              return(
                <g key={p.name} transform={`translate(${f.x+ox},${f.y-r-1.8})`}>
                  {/* Pawn shadow */}
                  <ellipse cx="0.2" cy="1.4" rx="0.8" ry="0.4" fill="rgba(0,0,0,0.4)"/>
                  {/* Pawn body */}
                  <circle cx="0" cy="0" r="1.1" fill={rc.color} stroke={p.isMe?"#FFD700":"rgba(0,0,0,0.6)"} strokeWidth={p.isMe?"0.35":"0.2"}/>
                  {/* Pawn highlight */}
                  <circle cx="-0.3" cy="-0.3" r="0.35" fill="rgba(255,255,255,0.25)"/>
                  {/* Race icon tiny */}
                  <text x="0" y="0.35" textAnchor="middle" dominantBaseline="middle" fontSize="0.9">{rc.icon}</text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ── KEY LOCATION LABELS ── */}
      {[
        {id:0,  side:-1}, {id:8,  side:-1}, {id:11, side:1},
        {id:14, side:1},  {id:22, side:1},  {id:25, side:-1},
        {id:28, side:1},  {id:44, side:1},
      ].map(({id,side})=>{
        const f=FIELDS[id];
        const ts=typeStyle[f.type]||typeStyle.normal;
        const offset=side*(typeStyle[f.type]?.r||1.8)+side*3.5;
        const isVert=Math.abs(f.x-50)<15;
        return(
          <g key={id}>
            <text
              x={isVert?f.x:f.x}
              y={isVert?f.y+offset:f.y+(f.y<50?-4:4.5)}
              textAnchor="middle"
              fontSize="1.25"
              fill={ts.stroke}
              fontFamily="Cinzel,serif"
              fontStyle="italic"
              opacity="0.75"
              style={{textShadow:"0 0 4px rgba(0,0,0,0.8)"}}>
              {f.name.split(" ")[0]}
            </text>
          </g>
        );
      })}

      {/* ── LEGEND / COMPASS ── */}
      <g transform="translate(3,3)">
        <rect width="16" height="10" rx="0.8" fill="rgba(0,0,0,0.5)" stroke="rgba(201,168,76,0.15)" strokeWidth="0.3"/>
        {[
          {col:"#4a7a2a",stroke:"#8BC34A",label:"Bónusz"},
          {col:"#6e1a1a",stroke:"#E74C3C",label:"Csapda"},
          {col:"#3b1d6e",stroke:"#A569BD",label:"Kvíz"},
          {col:"#7d3c00",stroke:"#E67E22",label:"Mini"},
        ].map((l,i)=>(
          <g key={i} transform={`translate(1,${1.5+i*2})`}>
            <circle cx="1" cy="0" r="0.7" fill={l.col} stroke={l.stroke} strokeWidth="0.25"/>
            <text x="2.5" y="0.45" fontSize="1.1" fill="rgba(201,168,76,0.55)" fontFamily="Cinzel,serif">{l.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── MAIN BOARD GAME ───────────────────────────────────────────────────────────────
export default function BoardGame({user}){
  const [screen,setScreen]=useState("lobby");
  const [gameId,setGameId]=useState(null);
  const [gameData,setGameData]=useState(null);
  const [playerId]=useState(()=>user?.adventureName||"Játékos_"+genId());
  const [chatMsg,setChatMsg]=useState("");
  const [eventField,setEventField]=useState(null);
  const [diceResult,setDiceResult]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [notification,setNotification]=useState(null);
  const [joinCode,setJoinCode]=useState("");
  const [selectedField,setSelectedField]=useState(null);
  const [invites,setInvites]=useState([]);
  const [friends,setFriends]=useState([]);
  const chatRef=useRef(null);
  const race=getRace(user?.race);

  const notify=(msg,color="var(--gold)",dur=2500)=>{
    setNotification({msg,color});
    setTimeout(()=>setNotification(null),dur);
  };

  // Listen to friends & invites
  useEffect(()=>{
    if(!playerId)return;
    const friendsRef=ref(db,`users/${playerId}/friends`);
    onValue(friendsRef,(snap)=>setFriends(Object.values(snap.val()||{})));
    const invRef=ref(db,`users/${playerId}/gameInvites`);
    onValue(invRef,(snap)=>setInvites(Object.values(snap.val()||{})));
    return()=>{off(friendsRef);off(invRef);};
  },[playerId]);

  // Listen to game
  useEffect(()=>{
    if(!gameId)return;
    const gameRef=ref(db,`games/${gameId}`);
    onValue(gameRef,(snap)=>{const d=snap.val();if(d){setGameData(d);if(d.status==="playing"&&screen==="waiting")setScreen("playing");}});
    return()=>off(gameRef);
  },[gameId]);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[gameData?.chat]);

  const inviteFriendToGame=async(friendName,gid)=>{
    let id=gid||gameId;
    if(!id){
      const newId=genId();
      await set(ref(db,`games/${newId}`),{status:"waiting",host:playerId,created:Date.now(),players:{[playerId]:{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},currentTurn:playerId,turnCount:0,chat:{},winner:null});
      setGameId(newId);
      setScreen("waiting");
      id=newId;
    }
    await set(ref(db,`users/${friendName}/gameInvites/${playerId}`),{from:playerId,gameId:id,sent:Date.now()});
    notify(`Meghívó elküldve: ${friendName}! Szoba: ${id} 🎲`,"#B39DDB",4000);
  };

  const acceptInvite=async(inv)=>{
    await remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));
    const gameRef2=ref(db,`games/${inv.gameId}`);
    const snap=await get(gameRef2);
    if(!snap.exists()){notify("A szoba már nem létezik!","#EF9A9A");return;}
    await update(ref(db,`games/${inv.gameId}/players/${playerId}`),{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0});
    setGameId(inv.gameId);
    setScreen("waiting");
    notify("Csatlakoztál!","#66BB6A");
  };

  const declineInvite=async(inv)=>await remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));

  const createGame=async()=>{
    const id=genId();
    await set(ref(db,`games/${id}`),{
      status:"waiting",host:playerId,created:Date.now(),
      players:{[playerId]:{name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0}},
      currentTurn:playerId,turnCount:0,chat:{},winner:null,
    });
    setGameId(id);
    setScreen("waiting");
    // No disappearing notification — gameId shown persistently in UI
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
    setGameId(id);
    setScreen("waiting");
    notify("Csatlakoztál!","#66BB6A");
  };

  const startGame=async()=>{
    await update(ref(db,`games/${gameId}`),{status:"playing"});
    setScreen("playing");
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
    let count=0;
    const iv=setInterval(()=>{
      setDiceResult(Math.floor(Math.random()*6)+1);
      count++;
      if(count>10){
        clearInterval(iv);
        const roll=Math.floor(Math.random()*6)+1;
        const extra=myData?.extraStep||0;
        setDiceResult(roll);setRolling(false);
        const newPos=Math.min((myData?.position||0)+roll+extra,FIELDS.length-1);
        update(ref(db,`games/${gameId}/players/${playerId}`),{position:newPos,extraStep:0});
        notify(`🎲 Dobtál: ${roll}${extra>0?` +${extra}`:""}! → ${FIELDS[newPos].name}`);
        setTimeout(()=>setEventField(FIELDS[newPos]),400);
      }
    },80);
  };

  const handleEventResult=async(result)=>{
    setEventField(null);
    if(!gameData)return;
    const myData=gameData.players?.[playerId];
    let newScore=Math.max(0,(myData?.score||0)+result.pts);
    let updates={score:newScore};
    if(result.pts>0)notify(`+${result.pts} pont! ✨`,"#66BB6A");
    else if(result.pts<0)notify(`${result.pts} pont...`,"#EF9A9A");
    // Special effects
    if(result.field.type==="trap"){updates.skipTurn=true;const np=Math.max(0,(myData?.position||0)-2);updates.position=np;}
    if(result.field.id===24){const np=Math.max(0,(myData?.position||0)-3);updates.position=np;}
    if(result.field.id===25){updates.score=Math.max(0,newScore-30);}
    if(result.field.id===38){const np=Math.min((myData?.position||0)+5,FIELDS.length-1);updates.position=np;notify("🦅 Sasok mentik meg! +5 mező!","#3A7A8B");}
    if(result.field.id===26||result.field.id===8){const np=Math.min((myData?.position||0)+2,FIELDS.length-1);updates.position=np;}
    if([2,14,22,36].includes(result.field.id)){
      const card=POWER_CARDS[Math.floor(Math.random()*POWER_CARDS.length)];
      updates.cards=[...(myData?.cards||[]),card.id];
      notify(`🃏 Kártyát kaptál: ${card.name}!`,"#7A4ABB");
    }
    if(result.field.id===FIELDS.length-1||result.win){
      await update(ref(db,`games/${gameId}`),{status:"finished",winner:playerId});
      await update(ref(db,`games/${gameId}/players/${playerId}`),updates);
      setScreen("finished");return;
    }
    await update(ref(db,`games/${gameId}/players/${playerId}`),updates);
    const pls=Object.keys(gameData.players);
    const next=pls[(pls.indexOf(playerId)+1)%pls.length];
    await update(ref(db,`games/${gameId}`),{currentTurn:next,turnCount:(gameData.turnCount||0)+1});
  };

  const sendChat=async(text)=>{
    if(!text.trim()||!gameId)return;
    await push(ref(db,`games/${gameId}/chat`),{player:playerId,race:user?.race||"human",text:text.trim(),time:Date.now()});
    setChatMsg("");
  };

  const myData=gameData?.players?.[playerId];
  const players=Object.values(gameData?.players||{}).map(p=>({...p,isMe:p.name===playerId}));
  const isMyTurn=gameData?.currentTurn===playerId;
  const DICE_ICONS=["","⚀","⚁","⚂","⚃","⚄","⚅"];

  // ── LOBBY ──
  if(screen==="lobby")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,padding:18,overflowY:"auto"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"2.2rem",marginBottom:4}}>🎲</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.95rem,3vw,1.3rem)",color:"var(--gold)"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)",letterSpacing:".14em",textTransform:"uppercase",marginTop:3}}>Online Társasjáték · 2–4 játékos</div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.14)",alignSelf:"center"}}>
        <span>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{playerId}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:race.color}}>· {race.name}</span>
      </div>

      {/* Incoming invites */}
      {invites.length>0&&<div style={{padding:"10px 12px",background:"rgba(122,74,187,.06)",border:"1px solid rgba(122,74,187,.3)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"#B39DDB",letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>🎲 Meghívók ({invites.length})</div>
        {invites.map(inv=>(
          <div key={inv.from} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(122,74,187,.1)"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--text)",flex:1}}><span style={{color:"#B39DDB"}}>{inv.from}</span> meghívott!</span>
            <button onClick={()=>acceptInvite(inv)} style={{padding:"4px 10px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.4)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✓ Csatlakozás</button>
            <button onClick={()=>declineInvite(inv)} style={{padding:"4px 8px",background:"none",border:"1px solid rgba(229,57,53,.2)",color:"rgba(229,57,53,.6)",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✗</button>
          </div>
        ))}
      </div>}

      {/* Create / Join */}
      <button onClick={createGame} style={{padding:"12px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase"}}>+ Új szoba létrehozása</button>
      <div style={{display:"flex",gap:7}}>
        <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Szoba kód (pl. AB12CD)..." maxLength={6}
          style={{flex:1,background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.18)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:".82rem",padding:"10px 12px",outline:"none",letterSpacing:".1em"}}/>
        <button onClick={joinGame} style={{padding:"10px 16px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.4)",color:"#3A7A8B",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Belép</button>
      </div>

      {/* Friends */}
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",letterSpacing:".12em",color:"var(--gm)",textTransform:"uppercase",marginBottom:7}}>— Barátaim —</div>
        {friends.map(f=>{const fr=getRace(f.race);return(
          <div key={f.name} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.07)",marginBottom:5}}>
            <span>{fr.icon}</span>
            <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--text)"}}>{f.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:fr.color}}>{fr.name} · {f.score||0}pt</div></div>
            <button onClick={()=>inviteFriendToGame(f.name)}
              style={{padding:"4px 10px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer",whiteSpace:"nowrap"}}>
              🎲 Meghív
            </button>
          </div>
        );})}
      </div>}

      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:notification.color,textAlign:"center",padding:"6px"}}>{notification.msg}</div>}
    </div>
  );

  // ── WAITING ROOM ──
  if(screen==="waiting")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,padding:18,overflowY:"auto"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)"}}>Váróterem</div>
        {/* PERSISTENT game code — does not disappear! */}
        <div style={{margin:"10px auto",padding:"10px 18px",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.3)",display:"inline-block"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Szoba kód — oszd meg barátaiddal!</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.6rem",color:"var(--gold)",letterSpacing:".2em"}}>{gameId}</div>
        </div>
      </div>

      {/* Players */}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {players.map(p=>{const pr=getRace(p.race);return(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.1)"}}>
            <span style={{fontSize:"1.2rem"}}>{pr.icon}</span>
            <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{p.name}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}</div></div>
            {p.name===gameData?.host&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)",border:"1px solid rgba(201,168,76,.3)",padding:"2px 6px"}}>HOST</span>}
          </div>
        );})}
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)",textAlign:"center"}}>{players.length}/4 játékos</div>

      {/* Invite friends */}
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".12em",color:"var(--gm)",textTransform:"uppercase",marginBottom:7}}>— Barátok meghívása —</div>
        {friends.map(f=>{const fr=getRace(f.race);return(
          <div key={f.name} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.07)",marginBottom:5}}>
            <span>{fr.icon}</span>
            <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--text)"}}>{f.name}</span>
            <button onClick={()=>inviteFriendToGame(f.name,gameId)} style={{padding:"4px 10px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer"}}>🎲 Meghív</button>
          </div>
        );})}
      </div>}

      {gameData?.host===playerId&&<button onClick={startGame} style={{padding:"13px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase",marginTop:4}}>▶ Játék Indítása</button>}
      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:notification.color,textAlign:"center"}}>{notification.msg}</div>}
    </div>
  );

  // ── FINISHED ──
  if(screen==="finished")return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24,textAlign:"center"}}>
      <div style={{fontSize:"3.5rem"}}>{gameData?.winner===playerId?"🏆":"😔"}</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:"var(--gold)"}}>{gameData?.winner===playerId?"GYŐZELEM!":"Jó próbálkozás!"}</div>
      {players.sort((a,b)=>b.score-a.score).map((p,i)=>{const pr=getRace(p.race);return(
        <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",width:"100%",maxWidth:280}}>
          <span>{i===0?"🥇":i===1?"🥈":"🥉"}</span><span>{pr.icon}</span>
          <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:p.isMe?"var(--gold)":"var(--text)"}}>{p.name}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{p.score}pt</span>
        </div>
      );})}
      <button onClick={()=>{setScreen("lobby");setGameId(null);setGameData(null);}} style={{padding:"11px 24px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase",marginTop:8}}>Új Játék</button>
    </div>
  );

  // ── PLAYING ──
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      {notification&&<div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",zIndex:400,padding:"7px 14px",background:"rgba(8,6,4,.97)",border:`1px solid ${notification.color}`,fontFamily:"'Cinzel',serif",fontSize:".68rem",color:notification.color,letterSpacing:".05em",whiteSpace:"nowrap",pointerEvents:"none"}}>{notification.msg}</div>}
      {eventField&&isMyTurn&&<FieldEventModal field={eventField} onResult={handleEventResult}/>}

      {/* Field tooltip */}
      {selectedField&&!eventField&&<div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"9px 14px",background:"rgba(8,6,4,.96)",border:"1px solid rgba(201,168,76,.22)",maxWidth:240,textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)"}}>{selectedField.icon} {selectedField.name}</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".8rem",color:"var(--td)",fontStyle:"italic",marginTop:3}}>{selectedField.desc||""}</div>
        <button onClick={()=>setSelectedField(null)} style={{marginTop:5,background:"none",border:"none",color:"var(--gm)",cursor:"pointer",fontSize:".62rem",fontFamily:"'Cinzel',serif"}}>× bezár</button>
      </div>}

      {/* BOARD */}
      <div style={{flex:1,minHeight:0,position:"relative"}}>
        <GameBoard players={players} myPosition={myData?.position||0} onFieldClick={(f)=>setSelectedField(f)}/>
      </div>

      {/* HUD */}
      <div style={{background:"rgba(6,4,2,.98)",borderTop:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
        {/* Players strip */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,.07)"}}>
          {players.map(p=>{const pr=getRace(p.race);const active=gameData?.currentTurn===p.name;return(
            <div key={p.name} style={{flex:1,padding:"5px 4px",background:active?"rgba(201,168,76,.06)":"transparent",borderBottom:`2px solid ${active?"var(--gold)":"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:1.5,transition:"all .2s"}}>
              <span style={{fontSize:".88rem"}}>{pr.icon}{p.skipTurn?"💤":""}</span>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:active?"var(--gold)":"var(--gm)",maxWidth:55,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center"}}>{p.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)"}}>{p.score}pt</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--td)"}}>#{p.position}</div>
            </div>
          );})}
        </div>

        {/* Dice row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"}}>
          <button onClick={rollDice} disabled={!isMyTurn||rolling||!!eventField}
            style={{width:46,height:46,fontSize:"1.7rem",background:isMyTurn&&!rolling?"rgba(201,168,76,.1)":"rgba(0,0,0,.2)",border:`1px solid ${isMyTurn&&!rolling?"rgba(201,168,76,.4)":"rgba(255,255,255,.05)"}`,cursor:isMyTurn&&!rolling?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
            {rolling?"🎲":diceResult?DICE_ICONS[diceResult]:"🎲"}
          </button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:isMyTurn?"var(--gold)":"var(--gm)",letterSpacing:".05em"}}>
              {isMyTurn?"⚔️ A te köröd!":`${gameData?.currentTurn||"?"} köre...`}
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",marginTop:1}}>
              {FIELDS[myData?.position||0]?.icon} {FIELDS[myData?.position||0]?.name} · {myData?.score||0}pt
            </div>
            {(myData?.cards||[]).length>0&&<div style={{display:"flex",gap:3,marginTop:2}}>
              {myData.cards.map((c,i)=>{const card=POWER_CARDS.find(x=>x.id===c);return card?<span key={i} title={card.name} style={{fontSize:".82rem"}}>{card.icon}</span>:null;})}
            </div>}
          </div>
        </div>

        {/* Emotes */}
        <div style={{display:"flex",gap:3,padding:"2px 12px 3px",overflowX:"auto"}}>
          {EMOTES.map(e=><button key={e} onClick={()=>sendChat(e)} style={{background:"none",border:"none",fontSize:".95rem",cursor:"pointer",padding:"2px",flexShrink:0}}>{e}</button>)}
        </div>

        {/* Chat */}
        <div style={{borderTop:"1px solid rgba(201,168,76,.06)",padding:"5px 10px"}}>
          <div ref={chatRef} style={{maxHeight:52,overflowY:"auto",marginBottom:5,display:"flex",flexDirection:"column",gap:1}}>
            {Object.values(gameData?.chat||{}).slice(-8).map((m,i)=>{const mr=getRace(m.race);return(
              <div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)"}}><span style={{color:mr.color}}>{m.player}: </span>{m.text}</div>
            );})}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat(chatMsg)} placeholder="Chat..."
              style={{flex:1,background:"rgba(0,0,0,.3)",border:"1px solid rgba(201,168,76,.1)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".82rem",padding:"5px 8px",outline:"none"}}/>
            <button onClick={()=>sendChat(chatMsg)} style={{padding:"5px 10px",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.22)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer"}}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
