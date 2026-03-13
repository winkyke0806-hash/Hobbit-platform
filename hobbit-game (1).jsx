import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push, remove, off } from "firebase/database";

// ── FIREBASE ────────────────────────────────────────────────────────────────────
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

// Export to window so ProfileTab can use Firebase too
window.__fbDB = { getDatabase:()=>db, ref, set, get, onValue, update, push, remove, off };

// ── RACES ───────────────────────────────────────────────────────────────────────
const RACES = [
  {id:"hobbit", icon:"🧑‍🌾", color:"#6B8C3E", name:"Hobbit",   bonus:"Lopakodás: átlép egy csapdán"},
  {id:"dwarf",  icon:"⛏️",  color:"#A0522D", name:"Törpe",    bonus:"Kitartás: dobás után +1 lépés"},
  {id:"elf",    icon:"🌿",  color:"#3A7A8B", name:"Tünde",    bonus:"Látás: mező előnézet"},
  {id:"human",  icon:"⚔️",  color:"#8B7355", name:"Ember",    bonus:"Bátorság: kvíz +10 bónusz"},
  {id:"wizard", icon:"🔮",  color:"#7A4ABB", name:"Varázsló", bonus:"Mágia: kártyahúzás"},
];

// ── BOARD FIELDS (45 mezős útvonal) ─────────────────────────────────────────────
const FIELDS = [
  {id:0,  name:"Zsákos-domb",        icon:"🏡", type:"start",   desc:"A kaland kezdete!",                          x:8,  y:82},
  {id:1,  name:"Hobbitlyuk ösvény",  icon:"🌿", type:"normal",  desc:"Békés ösvény a dombok között",               x:14, y:75},
  {id:2,  name:"Bywater",            icon:"🍺", type:"bonus",   desc:"Fogadó! +15 pont és egy ital",               x:18, y:68},
  {id:3,  name:"Bree kapuja",        icon:"🚪", type:"normal",  desc:"Az első nagyobb város",                      x:22, y:62},
  {id:4,  name:"Pusztai Inn",        icon:"🌙", type:"quiz",    desc:"Kvíz a fogadósnál!",                         x:26, y:57},
  {id:5,  name:"Veszélyes ösvény",   icon:"⚠️", type:"trap",    desc:"Csapda! Visszaesés 2 mezőt",                 x:30, y:53},
  {id:6,  name:"Trollok völgye",     icon:"👹", type:"minigame",desc:"A trollok foglyul ejthetnek!",               x:33, y:48},
  {id:7,  name:"Trollok barlangja",  icon:"💀", type:"trap",    desc:"Kővé változtál! Kimaradsz egy körből",        x:37, y:44},
  {id:8,  name:"Völgyzugoly",        icon:"🏔️", type:"bonus",   desc:"Elrond gyógyít! +20 pont, tovább 1",         x:40, y:40},
  {id:9,  name:"Misty Mountains",    icon:"❄️", type:"normal",  desc:"Hóvihar a hegyeken",                         x:42, y:35},
  {id:10, name:"Goblin alagút",      icon:"👺", type:"minigame",desc:"A goblinok labirintusa! Rúna kihívás",        x:44, y:30},
  {id:11, name:"Gollam barlangja",   icon:"💍", type:"gollam",  desc:"Találós kérdések! Nyerj vagy veszíts",       x:46, y:26},
  {id:12, name:"Napfény kapuja",     icon:"☀️", type:"bonus",   desc:"Megszabadultál! +25 pont",                   x:48, y:22},
  {id:13, name:"Vad mezők",          icon:"🌲", type:"normal",  desc:"Ismeretlen vidék",                           x:51, y:19},
  {id:14, name:"Beorn háza",         icon:"🐻", type:"bonus",   desc:"Beorn vendéglátása! +20 pont, kártya",       x:54, y:17},
  {id:15, name:"Bakacsinerdő széle", icon:"🌑", type:"normal",  desc:"Az erdő sötétedik...",                       x:57, y:15},
  {id:16, name:"Bakacsinerdő",       icon:"🕸️", type:"trap",    desc:"Pókháló! Kimaradsz egy körből",              x:60, y:14},
  {id:17, name:"Pókkirálynő",        icon:"🕷️", type:"minigame",desc:"Harcol a pókokkal! Gyors kvíz",              x:63, y:13},
  {id:18, name:"Tündekirály erdeje", icon:"🧝", type:"quiz",    desc:"Thranduil kihívása — kvíz!",                 x:66, y:13},
  {id:19, name:"Tündekirály börtöne",icon:"🔒", type:"trap",    desc:"Börtön! Kimaradsz egy körből",               x:69, y:14},
  {id:20, name:"Hordók a folyón",    icon:"🛶", type:"minigame",desc:"Menekülés hordókban! Memória játék",          x:71, y:16},
  {id:21, name:"Tóváros partja",     icon:"⛵", type:"normal",  desc:"Tóváros közeledik",                          x:73, y:19},
  {id:22, name:"Tóváros",            icon:"🏙️", type:"bonus",   desc:"Bard segít! +15 pont és kártya",             x:75, y:22},
  {id:23, name:"Magányos Hegy lába", icon:"🏔️", type:"normal",  desc:"Erebor látszik a távolban",                  x:76, y:26},
  {id:24, name:"Sárkány szele",      icon:"💨", type:"trap",    desc:"Smaug észrevett! Vissza 3 mezőt",            x:77, y:30},
  {id:25, name:"Smaug tüze",         icon:"🔥", type:"smaug",   desc:"SMAUG! Veszítesz 30 pontot",                 x:78, y:34},
  {id:26, name:"Titkos átjáró",      icon:"🗝️", type:"bonus",   desc:"Thorin térképe! +20 pont, előre 2",          x:78, y:38},
  {id:27, name:"Csatamező",          icon:"⚔️", type:"minigame",desc:"Az Öt Sereg Csatája! Párbaj kvíz",           x:77, y:42},
  {id:28, name:"Erebor kapuja",      icon:"🏰", type:"quiz",    desc:"Végső kihívás a kapunál!",                   x:76, y:46},
  {id:29, name:"Kincseskamra",       icon:"💎", type:"bonus",   desc:"Törpe kincs! +30 pont",                      x:75, y:50},
  {id:30, name:"Arkenköves trón",    icon:"👑", type:"quiz",    desc:"Arkenköves kvíz — a végső próba!",           x:74, y:54},
  // extra mezők a 40+ eléréséhez
  {id:31, name:"Dwarf Mines",        icon:"⛏️", type:"normal",  desc:"Törpe bányák mélyén",                        x:72, y:57},
  {id:32, name:"Dragon's Hoard",     icon:"🪙", type:"bonus",   desc:"Smaug kincse! +25 pont",                     x:70, y:60},
  {id:33, name:"Black Arrow",        icon:"🏹", type:"quiz",    desc:"Bard nyila — kvíz!",                         x:68, y:62},
  {id:34, name:"Raven's Rock",       icon:"🐦", type:"normal",  desc:"Hollók a sziklán",                           x:66, y:64},
  {id:35, name:"Durin's Door",       icon:"🚪", type:"minigame",desc:"Durin kapuja — rúna rejtvény",               x:64, y:65},
  {id:36, name:"Mithril Vein",       icon:"✨", type:"bonus",   desc:"Mithril ér! +20 pont és kártya",             x:62, y:66},
  {id:37, name:"Goblin Town",        icon:"🏚️", type:"trap",    desc:"Goblin város! Vissza 4 mezőt",               x:60, y:66},
  {id:38, name:"Eagles' Eyrie",      icon:"🦅", type:"bonus",   desc:"Sasok mentik meg! Előre 5 mezőt",            x:58, y:65},
  {id:39, name:"Carrock",            icon:"🪨", type:"quiz",    desc:"Beorn sziklája — kvíz",                      x:56, y:64},
  {id:40, name:"Forest River",       icon:"🌊", type:"normal",  desc:"Erdei folyó",                                x:54, y:62},
  {id:41, name:"Long Lake",          icon:"🏞️", type:"normal",  desc:"Nagy tó partja",                             x:52, y:60},
  {id:42, name:"Elvenking's Halls",  icon:"🌟", type:"bonus",   desc:"Tünde csarnokok! +15 pont",                  x:50, y:58},
  {id:43, name:"The Last Stage",     icon:"🌅", type:"quiz",    desc:"Utolsó próbatétel!",                         x:48, y:56},
  {id:44, name:"EREBOR — Célba ért!",icon:"🏆", type:"finish",  desc:"GYŐZELEM! Elértél Ereborig!",                x:46, y:54},
];

// ── QUIZ QUESTIONS ───────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {q:"Ki volt Bilbo Zsákos a trolloknak?",opts:["Varázsló","Betörő","Hobbit","Kém"],ok:1},
  {q:"Hány törpe volt Thorin társaságában?",opts:["10","11","12","13"],ok:3},
  {q:"Mi volt Bilbo kardjának neve?",opts:["Szúró","Fullánk","Marás","Nyílás"],ok:1},
  {q:"Ki ölte meg Smaug sárkányt?",opts:["Thorin","Bilbo","Bard","Gandalf"],ok:2},
  {q:"Mi volt Gollam igazi neve?",opts:["Déagol","Sméagol","Goblin","Mordok"],ok:1},
  {q:"Hol találta Bilbo a Gyűrűt?",opts:["Trollok barlangja","Goblin alagút","Bakacsinerdő","Tóváros"],ok:1},
  {q:"Ki volt a Tündekirály Bakacsinerdőben?",opts:["Elrond","Legolas","Thranduil","Círdan"],ok:2},
  {q:"Melyik hegyen laktak a goblinok?",opts:["Erebor","Ködös Hegy","Magányos Hegy","Vasbegy"],ok:1},
  {q:"Mi volt az Arankő (Arkenstone)?",opts:["Gyűrű","Törpék szent köve","Smaug szíve","Varázslat"],ok:1},
  {q:"Hány évig élt Bilbo?",opts:["111","120","100","131"],ok:0},
  {q:"Mi volt Thorin Tölgypajzsos apjának neve?",opts:["Dáin","Thráin","Glóin","Balin"],ok:1},
  {q:"Melyik városból lőtte le Bard a sárkányt?",opts:["Völgyzugoly","Tündeváros","Tóváros","Dale"],ok:2},
];

const GOLLAM_RIDDLES = [
  {q:"Nincs hangom, de megszólalok. Mi vagyok?",a:"visszhang",opts:["szél","visszhang","kő","víz"],ok:1},
  {q:"Minél többet veszel, annál több marad. Mi vagyok?",a:"lyuk",opts:["lyuk","kincs","arany","levegő"],ok:0},
  {q:"Fogak vannak, de nem harap. Mi vagyok?",a:"fésű",opts:["fésű","kő","fal","Gollam"],ok:0},
  {q:"Vízben születtem, vízben élek, de ha megiszom, meghalok. Mi vagyok?",a:"só",opts:["hal","só","jég","kő"],ok:1},
  {q:"Nap süt rám, de árnyékom nincs. Mi vagyok?",a:"árnyék",opts:["tükör","árnyék","fény","felhő"],ok:1},
];

const RUNE_CHALLENGES = [
  {rune:"ᚠ", name:"Feoh", meaning:"F - Gazdagság", answer:"F"},
  {rune:"ᚢ", name:"Ur",   meaning:"U - Erő",       answer:"U"},
  {rune:"ᚦ", name:"Thorn",meaning:"TH - Tövis",    answer:"TH"},
  {rune:"ᚨ", name:"Ansuz",meaning:"A - Istenek",   answer:"A"},
  {rune:"ᚱ", name:"Raido",meaning:"R - Utazás",    answer:"R"},
  {rune:"ᚲ", name:"Kauno",meaning:"K - Fáklya",    answer:"K"},
  {rune:"ᚷ", name:"Gebo", meaning:"G - Ajándék",   answer:"G"},
  {rune:"ᚹ", name:"Wunjo",meaning:"W - Öröm",      answer:"W"},
  {rune:"ᚺ", name:"Haglaz",meaning:"H - Jégeső",   answer:"H"},
  {rune:"ᛁ", name:"Isa",  meaning:"I - Jég",       answer:"I"},
];

const POWER_CARDS = [
  {id:"shield",  icon:"🛡️", name:"Pajzs",        desc:"Következő csapda hatástalan"},
  {id:"speed",   icon:"💨", name:"Szélroham",    desc:"+3 lépés következő körben"},
  {id:"wisdom",  icon:"📜", name:"Gandalf tanácsa",desc:"Kvíznél mutatja a helyes választ"},
  {id:"steal",   icon:"🗡️", name:"Tolvaj fogás", desc:"Lopj el egy kártyát az előtted járótól"},
  {id:"portal",  icon:"✨", name:"Mágikus kapu", desc:"Ugorj előre 5 mezőt"},
  {id:"freeze",  icon:"❄️", name:"Jégbűvölet",   desc:"Az utánad jövő játékos kihagy egy kört"},
];

const EMOTES = ["👍","😄","😱","🤔","🎉","💀","🔥","❄️","🧙","⚔️"];

// ── HELPERS ──────────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2,8).toUpperCase();
const getRace = (id) => RACES.find(r=>r.id===id)||RACES[3];

// ── SVG BOARD PATH ───────────────────────────────────────────────────────────────
function BoardSVGPath(){
  const pts = FIELDS.map(f=>`${f.x},${f.y}`).join(" L ");
  return <polyline points={pts.replace(/ L /g," ")} fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8" strokeDasharray="2,2"/>;
}

// ── FIELD COMPONENT ───────────────────────────────────────────────────────────────
function BoardField({field, players, isHighlighted, onClick}){
  const typeColors = {
    start:"#6B8C3E", finish:"#FFD700", bonus:"#3A7A8B",
    trap:"#C0392B", quiz:"#7A4ABB", minigame:"#E67E22",
    gollam:"#2C3E50", smaug:"#E74C3C", normal:"#5A5040"
  };
  const color = typeColors[field.type]||"#5A5040";
  const playersHere = players.filter(p=>p.position===field.id);

  return (
    <g onClick={onClick} style={{cursor:"pointer"}} transform={`translate(${field.x},${field.y})`}>
      {/* Glow for special fields */}
      {field.type!=="normal"&&<circle r="2.2" fill={color} opacity="0.3"/>}
      {/* Main circle */}
      <circle r="1.6" fill={`rgba(${hexToRgb(color)},0.85)`} stroke={isHighlighted?"#FFD700":color} strokeWidth={isHighlighted?"0.6":"0.3"}/>
      {/* Icon */}
      <text textAnchor="middle" dominantBaseline="middle" fontSize="1.8" y="0.1">{field.icon}</text>
      {/* Player tokens */}
      {playersHere.map((p,i)=>{
        const rc = getRace(p.race);
        return <circle key={p.id} cx={(i-playersHere.length/2+0.5)*1.5} cy="-2.2" r="0.9" fill={rc.color} stroke="#FFD700" strokeWidth="0.2"/>;
      })}
    </g>
  );
}

function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ── MINI GAMES ───────────────────────────────────────────────────────────────────
function QuizGame({onResult}){
  const [q]=useState(()=>QUIZ_QUESTIONS[Math.floor(Math.random()*QUIZ_QUESTIONS.length)]);
  const [sel,setSel]=useState(null);
  const [time,setTime]=useState(10);
  const [done,setDone]=useState(false);

  useEffect(()=>{
    if(done) return;
    const t=setInterval(()=>setTime(x=>{
      if(x<=1){clearInterval(t);setDone(true);onResult(false,0);return 0;}
      return x-1;
    }),1000);
    return ()=>clearInterval(t);
  },[done]);

  const pick=(i)=>{
    if(done) return;
    setSel(i);setDone(true);
    const ok=i===q.ok;
    setTimeout(()=>onResult(ok, ok?20:0),800);
  };

  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>⚡ Gyors Kvíz — {time}mp</div>
    <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${time/10*100}%`,background:"linear-gradient(90deg,#E74C3C,var(--gold))",transition:"width 1s linear"}}/>
    </div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1rem",color:"var(--text)",lineHeight:1.5,padding:"10px 0"}}>{q.q}</div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {q.opts.map((o,i)=>{
        let bg="rgba(0,0,0,.3)";
        let border="rgba(201,168,76,.15)";
        if(done&&sel===i) {bg=i===q.ok?"rgba(102,187,106,.15)":"rgba(229,57,53,.15)";border=i===q.ok?"#66BB6A":"#E53935";}
        else if(done&&i===q.ok){bg="rgba(102,187,106,.1)";border="#66BB6A";}
        return <button key={i} onClick={()=>pick(i)} style={{padding:"8px 12px",background:bg,border:`1px solid ${border}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",textAlign:"left",cursor:done?"default":"pointer",transition:"all .2s"}}>{o}</button>;
      })}
    </div>
  </div>;
}

function GollamGame({onResult}){
  const [q]=useState(()=>GOLLAM_RIDDLES[Math.floor(Math.random()*GOLLAM_RIDDLES.length)]);
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);

  const pick=(i)=>{
    if(done) return;
    setSel(i);setDone(true);
    const ok=i===q.ok;
    setTimeout(()=>onResult(ok,ok?25:0),800);
  };

  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#9B59B6",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Gollam Találós Kérdése</div>
    <div style={{padding:"12px",background:"rgba(44,62,80,.4)",border:"1px solid rgba(155,89,182,.3)",fontFamily:"'EB Garamond',serif",fontSize:".95rem",fontStyle:"italic",color:"#D7BDE2",lineHeight:1.6}}>
      "Találós kérdés! Találós kérdés! Ha megfejtesz — élhetsz. Ha nem — MEGESZÜNK, igen, Gollam!"<br/><br/>
      <strong style={{fontStyle:"normal",color:"var(--text)"}}>{q.q}</strong>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {q.opts.map((o,i)=>{
        let border="rgba(155,89,182,.3)";
        if(done&&i===q.ok) border="#66BB6A";
        else if(done&&sel===i) border="#E53935";
        return <button key={i} onClick={()=>pick(i)} style={{padding:"8px 12px",background:"rgba(44,62,80,.3)",border:`1px solid ${border}`,color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",textAlign:"left",cursor:done?"default":"pointer"}}>{o}</button>;
      })}
    </div>
  </div>;
}

function RuneGame({onResult}){
  const [rune]=useState(()=>RUNE_CHALLENGES[Math.floor(Math.random()*RUNE_CHALLENGES.length)]);
  const [input,setInput]=useState("");
  const [done,setDone]=useState(false);
  const [shake,setShake]=useState(false);

  const check=()=>{
    if(done) return;
    const ok=input.toUpperCase()===rune.answer;
    setDone(true);
    if(!ok){setShake(true);setTimeout(()=>setShake(false),500);}
    setTimeout(()=>onResult(ok,ok?30:0),800);
  };

  return <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#3A7A8B",letterSpacing:".1em",textTransform:"uppercase",alignSelf:"flex-start"}}>🔮 Rúna Felismerés</div>
    <div style={{fontSize:"5rem",lineHeight:1,textShadow:"0 0 30px rgba(58,122,139,.8)",animation:"emFl 2s ease-in-out infinite"}}>{rune.rune}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",textAlign:"center"}}>Mi a neve ennek a rúnának?<br/><span style={{color:"var(--td)",fontSize:".6rem"}}>(Hint: {rune.name})</span></div>
    <input
      value={input}
      onChange={e=>setInput(e.target.value)}
      onKeyDown={e=>e.key==="Enter"&&check()}
      placeholder="Írd be a betűt..."
      disabled={done}
      style={{background:"rgba(0,0,0,.4)",border:"1px solid rgba(58,122,139,.4)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:"1.2rem",padding:"8px 16px",outline:"none",textAlign:"center",width:140,animation:shake?"errShake .35s ease":"none"}}
    />
    {!done&&<button onClick={check} style={{padding:"8px 20px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.4)",color:"#3A7A8B",fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",cursor:"pointer"}}>Elküld</button>}
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:input.toUpperCase()===rune.answer?"#66BB6A":"#EF9A9A"}}>{input.toUpperCase()===rune.answer?"✓ Helyes!":"✗ Helytelen! Volt: "+rune.meaning}</div>}
  </div>;
}

function MemoryGame({onResult}){
  const CARDS_DATA=["💍","⚔️","🔮","🐉","🌿","🏔️"];
  const [cards]=useState(()=>[...CARDS_DATA,...CARDS_DATA].map((c,i)=>({id:i,val:c,flipped:false,matched:false})).sort(()=>Math.random()-.5));
  const [state,setState]=useState(cards);
  const [open,setOpen]=useState([]);
  const [moves,setMoves]=useState(0);
  const [done,setDone]=useState(false);

  const flip=(idx)=>{
    if(done) return;
    if(state[idx].flipped||state[idx].matched) return;
    if(open.length===2) return;
    const next=state.map((c,i)=>i===idx?{...c,flipped:true}:c);
    setState(next);
    const newOpen=[...open,idx];
    if(newOpen.length===2){
      setMoves(m=>m+1);
      if(next[newOpen[0]].val===next[newOpen[1]].val){
        setTimeout(()=>{
          setState(s=>s.map((c,i)=>newOpen.includes(i)?{...c,matched:true}:c));
          setOpen([]);
          const allDone=next.filter(c=>c.matched||newOpen.includes(c.id)).length===next.length;
          if(allDone){setDone(true);onResult(true,35);}
        },400);
      } else {
        setTimeout(()=>{
          setState(s=>s.map((c,i)=>newOpen.includes(i)?{...c,flipped:false}:c));
          setOpen([]);
        },700);
      }
    } else {
      setOpen(newOpen);
    }
  };

  const matched=state.filter(c=>c.matched).length/2;

  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#E67E22",letterSpacing:".1em",textTransform:"uppercase"}}>🛶 Memória Párosítás — {matched}/6</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
      {state.map((c,i)=>(
        <button key={c.id} onClick={()=>flip(i)} style={{aspectRatio:"1",background:c.matched?"rgba(102,187,106,.1)":c.flipped?"rgba(201,168,76,.1)":"rgba(0,0,0,.4)",border:`1px solid ${c.matched?"rgba(102,187,106,.4)":c.flipped?"rgba(201,168,76,.4)":"rgba(201,168,76,.12)"}`,fontSize:"1.4rem",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {c.flipped||c.matched?c.val:"?"}
        </button>
      ))}
    </div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)"}}>Lépések: {moves}</div>
  </div>;
}

function SpotTheDiff({onResult}){
  // "Hol a gyűrű?" mini game
  const [pos]=useState(()=>Math.floor(Math.random()*9));
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const icons=["🗡️","🏹","⚔️","🛡️","🔮","🪓","🗺️","🧢","💰"];

  const pick=(i)=>{
    if(done) return;
    setSel(i);setDone(true);
    const ok=i===pos;
    setTimeout(()=>onResult(ok,ok?40:0),600);
  };

  return <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase"}}>💍 Hol a Gyűrű?</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",textAlign:"center",fontStyle:"italic"}}>Az egyik tárgy alatt rejtőzik a Gyűrű...<br/>Találd meg!</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
      {icons.map((ic,i)=>{
        let border="rgba(201,168,76,.15)";
        let bg="rgba(0,0,0,.3)";
        if(done&&i===pos){border="#FFD700";bg="rgba(201,168,76,.15)";}
        else if(done&&sel===i){border="#E53935";bg="rgba(229,57,53,.1)";}
        return <button key={i} onClick={()=>pick(i)} style={{width:52,height:52,fontSize:"1.6rem",background:bg,border:`1px solid ${border}`,cursor:done?"default":"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {done&&i===pos?"💍":ic}
        </button>;
      })}
    </div>
    {done&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:sel===pos?"#66BB6A":"#EF9A9A"}}>{sel===pos?"✓ Megtaláltad!":"✗ Nem ott volt..."}</div>}
  </div>;
}

// ── EVENT MODAL ───────────────────────────────────────────────────────────────────
function FieldEventModal({field, playerRace, cards, onClose, onResult}){
  const [phase,setPhase]=useState("intro"); // intro | game | result
  const [points,setPoints]=useState(0);
  const [won,setWon]=useState(false);

  const startGame=()=>setPhase("game");

  const handleResult=(ok,pts)=>{
    setWon(ok);setPoints(pts);setPhase("result");
    setTimeout(()=>onResult({ok,pts,field}),1500);
  };

  const typeInfo={
    bonus:{color:"#3A7A8B",icon:"✨",title:"Bónusz Mező!"},
    trap:{color:"#C0392B",icon:"⚠️",title:"Csapda!"},
    quiz:{color:"#7A4ABB",icon:"❓",title:"Kvíz Kihívás!"},
    minigame:{color:"#E67E22",icon:"🎮",title:"Minijáték!"},
    gollam:{color:"#2C3E50",icon:"💍",title:"Gollam!"},
    smaug:{color:"#E74C3C",icon:"🔥",title:"SMAUG!"},
    finish:{color:"#FFD700",icon:"🏆",title:"GYŐZELEM!"},
  };
  const info=typeInfo[field.type]||{color:"var(--gold)",icon:"🗺️",title:"Mező"};

  return <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(4,3,2,.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{width:"100%",maxWidth:380,background:"linear-gradient(162deg,rgba(20,15,11,.99),rgba(8,6,4,.99))",border:`1px solid ${info.color}44`,padding:20,display:"flex",flexDirection:"column",gap:14,maxHeight:"85vh",overflowY:"auto"}}>

      {phase==="intro"&&<>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"2.5rem",marginBottom:8}}>{field.icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:info.color}}>{info.title}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",marginTop:4,letterSpacing:".08em"}}>{field.name}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".9rem",color:"var(--td)",marginTop:8,fontStyle:"italic",lineHeight:1.6}}>{field.desc}</div>
        </div>

        {/* Trap/Smaug = auto */}
        {(field.type==="trap"||field.type==="smaug")&&<>
          <div style={{padding:"10px",background:`rgba(${field.type==="smaug"?"231,76,60":"192,57,43"},.1)`,border:`1px solid ${info.color}44`,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".72rem",color:info.color}}>
            {field.type==="smaug"?"🔥 Smaug tüze elér! -30 pont!":"⚠️ Visszalépsz 2 mezőt és kimaradsz egy körből!"}
          </div>
          <button onClick={()=>onResult({ok:false,pts:field.type==="smaug"?-30:-10,field})} style={{padding:"10px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Elfogadom ✗</button>
        </>}

        {/* Bonus = auto */}
        {field.type==="bonus"&&<>
          <div style={{padding:"10px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.3)",textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"#3A7A8B"}}>✨ +20 pont!</div>
          <button onClick={()=>onResult({ok:true,pts:20,field})} style={{padding:"10px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.4)",color:"#3A7A8B",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Elfogadom ✓</button>
        </>}

        {field.type==="finish"&&<>
          <div style={{textAlign:"center",fontFamily:"'Cinzel Decorative',serif",fontSize:"1.3rem",color:"#FFD700",textShadow:"0 0 30px rgba(255,215,0,.5)"}}>🏆 GYŐZTÉL! 🏆</div>
          <button onClick={()=>onResult({ok:true,pts:100,field,win:true})} style={{padding:"12px",background:"rgba(255,215,0,.15)",border:"1px solid rgba(255,215,0,.5)",color:"#FFD700",fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",cursor:"pointer"}}>A KINCS A TIÉD!</button>
        </>}

        {/* Games */}
        {(field.type==="quiz"||field.type==="minigame"||field.type==="gollam")&&
          <button onClick={startGame} style={{padding:"11px",background:`rgba(${hexToRgb(info.color)},.1)`,border:`1px solid ${info.color}66`,color:info.color,fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase"}}>Kihívás elfogadása ⚔️</button>
        }
      </>}

      {phase==="game"&&<>
        {(field.type==="quiz"||field.name.includes("Csata")||field.name.includes("Kvíz")||field.name.includes("Thranduil")||field.name.includes("Carrock")||field.name.includes("Last")||field.name.includes("Arrow")||field.name.includes("Arken"))&&<QuizGame onResult={handleResult}/>}
        {field.type==="gollam"&&<GollamGame onResult={handleResult}/>}
        {(field.name.includes("Goblin")||field.name.includes("Durin")||field.name.includes("Rúna"))&&<RuneGame onResult={handleResult}/>}
        {field.name.includes("Hordó")&&<MemoryGame onResult={handleResult}/>}
        {field.name.includes("Pók")||field.name.includes("tőr")?<QuizGame onResult={handleResult}/>:null}
        {field.type==="minigame"&&!field.name.includes("Goblin")&&!field.name.includes("Durin")&&!field.name.includes("Hordó")&&!field.name.includes("Csata")&&<SpotTheDiff onResult={handleResult}/>}
      </>}

      {phase==="result"&&<div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{fontSize:"3rem"}}>{won?"🎉":"😔"}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:won?"var(--gold)":"#EF9A9A"}}>{won?"Sikeres!":"Nem sikerült..."}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gm)"}}>Pontok: <span style={{color:"var(--gold)"}}>{points>0?"+":""}{points}</span></div>
      </div>}
    </div>
  </div>;
}

// ── MAIN BOARD GAME ───────────────────────────────────────────────────────────────
export default function BoardGame({user}){
  const [screen,setScreen]=useState("lobby"); // lobby|waiting|playing|finished
  const [gameId,setGameId]=useState(null);
  const [gameData,setGameData]=useState(null);
  const [playerId]=useState(()=>user?.adventureName||"Játékos_"+genId());
  const [chatMsg,setChatMsg]=useState("");
  const [invites,setInvites]=useState([]); // bejövő játék meghívók
  const [friends,setFriends]=useState([]);
  const [eventField,setEventField]=useState(null);
  const [diceResult,setDiceResult]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [notification,setNotification]=useState(null);
  const [joinCode,setJoinCode]=useState("");
  const [selectedField,setSelectedField]=useState(null);
  const chatRef=useRef(null);

  const race=getRace(user?.race);

  const notify=(msg,color="var(--gold)")=>{
    setNotification({msg,color});
    setTimeout(()=>setNotification(null),2500);
  };

  // Firebase listener — friends & invites
  useEffect(()=>{
    if(!playerId) return;
    const friendsRef=ref(db,`users/${playerId}/friends`);
    onValue(friendsRef,(snap)=>setFriends(Object.values(snap.val()||{})));
    const invRef=ref(db,`users/${playerId}/gameInvites`);
    onValue(invRef,(snap)=>setInvites(Object.values(snap.val()||{})));
    return ()=>{off(friendsRef);off(invRef);};
  },[playerId]);

  // Firebase listener
  useEffect(()=>{
    if(!gameId) return;
    const gameRef=ref(db,`games/${gameId}`);
    onValue(gameRef,(snap)=>{
      const data=snap.val();
      if(data) setGameData(data);
    });
    return ()=>off(gameRef);
  },[gameId]);

  // Auto scroll chat
  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight;
  },[gameData?.chat]);

  // Invite friend to game
  const inviteFriendToGame=async(friendName, existingGameId)=>{
    const gid=existingGameId||gameId;
    if(!gid){notify("Először hozz létre szobát!","#EF9A9A");return;}
    await set(ref(db,`users/${friendName}/gameInvites/${playerId}`),{
      from:playerId, gameId:gid, sent:Date.now()
    });
    notify(`Meghívó elküldve: ${friendName}! 🎲`,"#B39DDB");
  };

  // Accept invite
  const acceptInvite=async(inv)=>{
    await remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));
    setJoinCode(inv.gameId);
    // auto join
    const gameRef2=ref(db,`games/${inv.gameId}`);
    const snap=await get(gameRef2);
    if(!snap.exists()){notify("A szoba már nem létezik!","#EF9A9A");return;}
    await update(ref(db,`games/${inv.gameId}/players/${playerId}`),{
      name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0
    });
    setGameId(inv.gameId);
    setScreen("waiting");
    notify("Csatlakoztál!","#66BB6A");
  };

  const declineInvite=async(inv)=>{
    await remove(ref(db,`users/${playerId}/gameInvites/${inv.from}`));
  };

  // Create game
  const createGame=async()=>{
    const id=genId();
    const gameRef=ref(db,`games/${id}`);
    const newGame={
      status:"waiting",
      host:playerId,
      created:Date.now(),
      players:{
        [playerId]:{
          name:playerId,
          race:user?.race||"human",
          position:0,
          score:0,
          cards:[],
          skipTurn:false,
          extraStep:0,
        }
      },
      currentTurn:playerId,
      turnCount:0,
      chat:{},
      winner:null,
    };
    await set(gameRef,newGame);
    setGameId(id);
    setScreen("waiting");
    notify(`Szoba létrehozva! Kód: ${id}`,"#66BB6A");
  };

  // Join game
  const joinGame=async()=>{
    const id=joinCode.trim().toUpperCase();
    if(!id){notify("Írd be a szoba kódját!","#EF9A9A");return;}
    const gameRef=ref(db,`games/${id}`);
    const snap=await get(gameRef);
    if(!snap.exists()){notify("Nincs ilyen szoba!","#EF9A9A");return;}
    const data=snap.val();
    if(data.status!=="waiting"){notify("A játék már elkezdődött!","#EF9A9A");return;}
    if(Object.keys(data.players||{}).length>=4){notify("A szoba tele van!","#EF9A9A");return;}
    await update(ref(db,`games/${id}/players/${playerId}`),{
      name:playerId,race:user?.race||"human",position:0,score:0,cards:[],skipTurn:false,extraStep:0
    });
    setGameId(id);
    setScreen("waiting");
    notify("Csatlakoztál!","#66BB6A");
  };

  // Start game
  const startGame=async()=>{
    if(!gameId||!gameData) return;
    const players=Object.keys(gameData.players||{});
    if(players.length<1){notify("Legalább 1 játékos kell!","#EF9A9A");return;}
    await update(ref(db,`games/${gameId}`),{status:"playing"});
    setScreen("playing");
  };

  // Roll dice
  const rollDice=async()=>{
    if(!gameData||gameData.currentTurn!==playerId||rolling) return;
    const myData=gameData.players?.[playerId];
    if(myData?.skipTurn){
      notify("Kimaradsz ebből a körből...","#EF9A9A");
      const players=Object.keys(gameData.players);
      const idx=players.indexOf(playerId);
      const nextPlayer=players[(idx+1)%players.length];
      await update(ref(db,`games/${gameId}`),{
        currentTurn:nextPlayer,
        turnCount:(gameData.turnCount||0)+1,
      });
      await update(ref(db,`games/${gameId}/players/${playerId}`),{skipTurn:false});
      return;
    }

    setRolling(true);
    let count=0;
    const interval=setInterval(()=>{
      setDiceResult(Math.floor(Math.random()*6)+1);
      count++;
      if(count>8){
        clearInterval(interval);
        const roll=Math.floor(Math.random()*6)+1;
        const extra=myData?.extraStep||0;
        const finalRoll=roll+extra;
        setDiceResult(roll);
        setRolling(false);

        const newPos=Math.min((myData?.position||0)+finalRoll,FIELDS.length-1);
        const field=FIELDS[newPos];

        update(ref(db,`games/${gameId}/players/${playerId}`),{position:newPos,extraStep:0});
        notify(`${race.icon} Dobtál: ${roll}${extra>0?` +${extra} bónusz`:""}! → ${field.name}`);
        setEventField(field);
      }
    },100);
  };

  // Handle field event result
  const handleEventResult=async(result)=>{
    setEventField(null);
    if(!gameData) return;
    const myData=gameData.players?.[playerId];
    let newScore=(myData?.score||0)+result.pts;
    let updates={score:Math.max(0,newScore)};

    if(result.pts<0){notify(`${result.pts} pont...`,"#EF9A9A");}
    else if(result.pts>0){notify(`+${result.pts} pont!`,"#66BB6A");}

    // Trap effects
    if(result.field.type==="trap"||result.field.id===7||result.field.id===16||result.field.id===19){
      updates.skipTurn=true;
    }
    if(result.field.id===5||result.field.id===24){
      const newPos=Math.max(0,(myData?.position||0)-(result.field.id===24?3:2));
      updates.position=newPos;
    }
    if(result.field.id===25){updates.score=Math.max(0,newScore-30);}
    if(result.field.id===38){// Eagles
      const newPos=Math.min((myData?.position||0)+5,FIELDS.length-1);
      updates.position=newPos;
      notify("🦅 A Sasok megmentettek! +5 mező!","#3A7A8B");
    }
    if(result.field.id===26){// Secret passage
      const newPos=Math.min((myData?.position||0)+2,FIELDS.length-1);
      updates.position=newPos;
    }
    if(result.field.id===14||result.field.id===22||result.field.id===36){// Card bonus
      const randomCard=POWER_CARDS[Math.floor(Math.random()*POWER_CARDS.length)];
      const cards=[...(myData?.cards||[]),randomCard.id];
      updates.cards=cards;
      notify(`🃏 Kártyát kaptál: ${randomCard.name}!`,"#7A4ABB");
    }

    // Win check
    if(result.field.id===FIELDS.length-1||result.win){
      await update(ref(db,`games/${gameId}`),{status:"finished",winner:playerId});
      await update(ref(db,`games/${gameId}/players/${playerId}`),updates);
      setScreen("finished");
      return;
    }

    await update(ref(db,`games/${gameId}/players/${playerId}`),updates);

    // Next turn
    const players=Object.keys(gameData.players);
    const idx=players.indexOf(playerId);
    const nextPlayer=players[(idx+1)%players.length];
    await update(ref(db,`games/${gameId}`),{
      currentTurn:nextPlayer,
      turnCount:(gameData.turnCount||0)+1,
    });
  };

  // Send chat
  const sendChat=async(text)=>{
    if(!text.trim()||!gameId) return;
    const chatRef2=ref(db,`games/${gameId}/chat`);
    await push(chatRef2,{player:playerId,race:user?.race||"human",text:text.trim(),time:Date.now()});
    setChatMsg("");
  };

  const sendEmote=(e)=>sendChat(e);

  const myData=gameData?.players?.[playerId];
  const players=Object.values(gameData?.players||{});
  const isMyTurn=gameData?.currentTurn===playerId;
  const DICE_ICONS=["","⚀","⚁","⚂","⚃","⚄","⚅"];

  // ── LOBBY ──
  if(screen==="lobby") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:16,padding:20,overflowY:"auto"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"2.5rem",marginBottom:6,animation:"emFl 3s ease-in-out infinite"}}>🎲</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1rem,3vw,1.4rem)",color:"var(--gold)"}}>Középföld Honfoglalója</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".15em",textTransform:"uppercase",marginTop:4}}>— Online Társasjáték —</div>
      </div>

      {/* Player badge */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.15)",alignSelf:"center"}}>
        <span style={{fontSize:"1.1rem"}}>{race.icon}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{playerId}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:race.color}}>· {race.name}</span>
      </div>

      {/* Incoming game invites */}
      {invites.length>0&&<div style={{padding:"12px",background:"rgba(122,74,187,.05)",border:"1px solid rgba(122,74,187,.3)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".12em",color:"#B39DDB",textTransform:"uppercase",marginBottom:8}}>🎲 Játék meghívók ({invites.length})</div>
        {invites.map(inv=>(
          <div key={inv.from} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(122,74,187,.1)"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)",flex:1}}><span style={{color:"#B39DDB"}}>{inv.from}</span> meghívott!</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)"}}>#{inv.gameId}</span>
            <button onClick={()=>acceptInvite(inv)} style={{padding:"4px 10px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.4)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✓ Csatlakozás</button>
            <button onClick={()=>declineInvite(inv)} style={{padding:"4px 8px",background:"none",border:"1px solid rgba(229,57,53,.25)",color:"rgba(229,57,53,.6)",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✗</button>
          </div>
        ))}
      </div>}

      {/* Actions */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <button onClick={createGame} style={{padding:"12px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase"}}>+ Új Szoba létrehozása</button>
        <div style={{display:"flex",gap:7}}>
          <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Szoba kód..." maxLength={6} style={{flex:1,background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.18)",color:"var(--text)",fontFamily:"'Cinzel',serif",fontSize:".85rem",padding:"10px 12px",outline:"none",letterSpacing:".1em"}}/>
          <button onClick={joinGame} style={{padding:"10px 16px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.4)",color:"#3A7A8B",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer"}}>Belép</button>
        </div>
      </div>

      {/* Friends list with invite */}
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— Barátaim ({friends.length}) —</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {friends.map(f=>{
            const fr=getRace(f.race);
            return <div key={f.name} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.08)"}}>
              <span style={{fontSize:"1rem"}}>{fr.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{f.name}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:fr.color}}>{fr.name} · {f.score||0}pt</div>
              </div>
              <button onClick={()=>inviteFriendToGame(f.name)} disabled={!gameId} style={{padding:"4px 10px",background:gameId?"rgba(122,74,187,.1)":"rgba(0,0,0,.2)",border:`1px solid ${gameId?"rgba(122,74,187,.35)":"rgba(255,255,255,.05)"}`,color:gameId?"#B39DDB":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:gameId?"pointer":"default",whiteSpace:"nowrap"}}>
                {gameId?"🎲 Meghív":"Hozz létre szobát"}
              </button>
            </div>;
          })}
        </div>
      </div>}

      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:notification.color,textAlign:"center"}}>{notification.msg}</div>}
    </div>
  );

  // ── WAITING ROOM ──
  if(screen==="waiting") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:16,padding:20}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)"}}>Váróterem</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--gm)",marginTop:4,letterSpacing:".1em"}}>Szoba kód: <span style={{color:"var(--gold)",fontSize:".85rem"}}>{gameId}</span></div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--td)",marginTop:2}}>Küldd el a kódot a barátaidnak!</div>
      </div>
      {/* Invite friends directly */}
      {friends.length>0&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".12em",color:"var(--gm)",textTransform:"uppercase",marginBottom:6}}>— Barátok meghívása —</div>
        {friends.map(f=>{
          const fr=getRace(f.race);
          return <div key={f.name} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.07)",marginBottom:5}}>
            <span>{fr.icon}</span>
            <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{f.name}</span>
            <button onClick={()=>inviteFriendToGame(f.name,gameId)} style={{padding:"4px 10px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>🎲 Meghív</button>
          </div>;
        })}
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {players.map(p=>{
          const pr=getRace(p.race);
          return <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.1)"}}>
            <span style={{fontSize:"1.2rem"}}>{pr.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{p.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:pr.color,textTransform:"uppercase"}}>{pr.name}</div>
            </div>
            {p.name===gameData?.host&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gold)",border:"1px solid rgba(201,168,76,.3)",padding:"2px 6px"}}>HOST</span>}
          </div>;
        })}
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",textAlign:"center"}}>{players.length}/4 játékos</div>
      {gameData?.host===playerId&&<button onClick={startGame} style={{padding:"13px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase"}}>▶ Játék Indítása</button>}
      {notification&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:notification.color,textAlign:"center"}}>{notification.msg}</div>}
    </div>
  );

  // ── FINISHED ──
  if(screen==="finished") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24,textAlign:"center"}}>
      <div style={{fontSize:"4rem",animation:"emFl 2s ease-in-out infinite"}}>{gameData?.winner===playerId?"🏆":"😔"}</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.3rem",color:"var(--gold)"}}>{gameData?.winner===playerId?"GYŐZELEM!":"Jó próbálkozás!"}</div>
      {gameData?.winner&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gm)"}}>Győztes: <span style={{color:"var(--gold)"}}>{gameData.winner}</span></div>}
      <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:280}}>
        {players.sort((a,b)=>b.score-a.score).map((p,i)=>{
          const pr=getRace(p.race);
          return <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)"}}>
            <span>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
            <span style={{fontSize:"1rem"}}>{pr.icon}</span>
            <span style={{flex:1,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{p.name}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{p.score}pt</span>
          </div>;
        })}
      </div>
      <button onClick={()=>{setScreen("lobby");setGameId(null);setGameData(null);}} style={{padding:"11px 24px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase",marginTop:8}}>Új Játék</button>
    </div>
  );

  // ── PLAYING ──
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>

      {/* Notification */}
      {notification&&<div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:400,padding:"8px 16px",background:"rgba(8,6,4,.95)",border:`1px solid ${notification.color}`,fontFamily:"'Cinzel',serif",fontSize:".7rem",color:notification.color,letterSpacing:".06em",whiteSpace:"nowrap",animation:"fadeIn .2s"}}>{notification.msg}</div>}

      {/* Field event modal */}
      {eventField&&isMyTurn&&<FieldEventModal field={eventField} playerRace={user?.race} cards={myData?.cards||[]} onClose={()=>setEventField(null)} onResult={handleEventResult}/>}

      {/* Field info tooltip */}
      {selectedField&&!eventField&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:200,padding:"10px 14px",background:"rgba(8,6,4,.95)",border:"1px solid rgba(201,168,76,.25)",maxWidth:260,textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)"}}>{selectedField.icon} {selectedField.name}</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".8rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>{selectedField.desc}</div>
        <button onClick={()=>setSelectedField(null)} style={{marginTop:6,background:"none",border:"none",color:"var(--gm)",cursor:"pointer",fontSize:".65rem",fontFamily:"'Cinzel',serif"}}>× bezár</button>
      </div>}

      {/* BOARD */}
      <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>
        <svg viewBox="0 0 90 95" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
          {/* Background */}
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#1a1208"/>
              <stop offset="100%" stopColor="#080604"/>
            </radialGradient>
          </defs>
          <rect width="90" height="95" fill="url(#bgGrad)"/>

          {/* Decorative elements */}
          <text x="5" y="8" fontSize="4" opacity="0.06">🏔️</text>
          <text x="75" y="8" fontSize="4" opacity="0.06">🐉</text>
          <text x="40" y="50" fontSize="8" opacity="0.03">🗺️</text>

          {/* Path */}
          <BoardSVGPath/>

          {/* Fields */}
          {FIELDS.map(f=>(
            <BoardField
              key={f.id}
              field={f}
              players={players}
              isHighlighted={myData?.position===f.id}
              onClick={()=>setSelectedField(f)}
            />
          ))}

          {/* START label */}
          <text x="8" y="89" fontSize="1.2" fill="rgba(107,140,62,.6)" fontFamily="serif">START</text>
          {/* FINISH label */}
          <text x="40" y="52" fontSize="1.2" fill="rgba(255,215,0,.6)" fontFamily="serif">FINISH</text>
        </svg>
      </div>

      {/* BOTTOM HUD */}
      <div style={{background:"rgba(8,6,4,.97)",borderTop:"1px solid rgba(201,168,76,.12)",flexShrink:0}}>

        {/* Players strip */}
        <div style={{display:"flex",gap:1,borderBottom:"1px solid rgba(201,168,76,.08)"}}>
          {players.map(p=>{
            const pr=getRace(p.race);
            const isActive=gameData?.currentTurn===p.name;
            return <div key={p.name} style={{flex:1,padding:"5px 6px",background:isActive?"rgba(201,168,76,.07)":"transparent",borderBottom:`2px solid ${isActive?"var(--gold)":"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:".85rem"}}>{pr.icon}</span>
                {p.skipTurn&&<span style={{fontSize:".55rem"}}>💤</span>}
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:isActive?"var(--gold)":"var(--gm)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:60,textAlign:"center"}}>{p.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)"}}>{p.score}pt</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--td)"}}>#{p.position}</div>
            </div>;
          })}
        </div>

        {/* Dice & action row */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"}}>
          {/* Dice */}
          <button
            onClick={rollDice}
            disabled={!isMyTurn||rolling||!!eventField}
            style={{width:48,height:48,fontSize:"1.8rem",background:isMyTurn&&!rolling?"rgba(201,168,76,.1)":"rgba(0,0,0,.2)",border:`1px solid ${isMyTurn&&!rolling?"rgba(201,168,76,.4)":"rgba(255,255,255,.05)"}`,cursor:isMyTurn&&!rolling?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",animation:rolling?"spin .1s linear infinite":"none"}}
          >
            {diceResult?DICE_ICONS[diceResult]:"🎲"}
          </button>

          {/* Status */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:isMyTurn?"var(--gold)":"var(--gm)",letterSpacing:".06em"}}>
              {isMyTurn?"⚔️ A te köröd!":` ${gameData?.currentTurn} köre...`}
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",marginTop:2}}>
              {FIELDS[myData?.position||0]?.icon} {FIELDS[myData?.position||0]?.name} · {myData?.score||0}pt
            </div>
            {(myData?.cards||[]).length>0&&<div style={{display:"flex",gap:3,marginTop:3}}>
              {(myData.cards).map((c,i)=>{
                const card=POWER_CARDS.find(x=>x.id===c);
                return card?<span key={i} title={card.name} style={{fontSize:".85rem"}}>{card.icon}</span>:null;
              })}
            </div>}
          </div>

          {/* Chat button */}
          <button onClick={()=>setSelectedField(selectedField?"__chat__":null)} style={{width:36,height:36,background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.3)",color:"#3A7A8B",fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>💬</button>
        </div>

        {/* Emotes */}
        <div style={{display:"flex",gap:4,padding:"4px 12px 4px",overflowX:"auto"}}>
          {EMOTES.map(e=><button key={e} onClick={()=>sendEmote(e)} style={{background:"none",border:"none",fontSize:"1rem",cursor:"pointer",padding:"2px 3px",flexShrink:0}}>{e}</button>)}
        </div>

        {/* Chat */}
        <div style={{borderTop:"1px solid rgba(201,168,76,.06)",padding:"6px 10px"}}>
          <div ref={chatRef} style={{maxHeight:60,overflowY:"auto",marginBottom:5,display:"flex",flexDirection:"column",gap:2}}>
            {Object.values(gameData?.chat||{}).slice(-10).map((m,i)=>{
              const mr=getRace(m.race);
              return <div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:".8rem",color:"var(--td)"}}>
                <span style={{color:mr.color}}>{m.player}: </span>{m.text}
              </div>;
            })}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input
              value={chatMsg}
              onChange={e=>setChatMsg(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendChat(chatMsg)}
              placeholder="Chat..."
              style={{flex:1,background:"rgba(0,0,0,.3)",border:"1px solid rgba(201,168,76,.12)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".85rem",padding:"5px 8px",outline:"none"}}
            />
            <button onClick={()=>sendChat(chatMsg)} style={{padding:"5px 10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer"}}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
