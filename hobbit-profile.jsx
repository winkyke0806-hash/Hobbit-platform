import { useState, useEffect, useRef } from "react";

const RACES = [
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E",name:"Hobbit"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D",name:"Törpe"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B",name:"Tünde"},
  {id:"human", icon:"⚔️", color:"#8B7355",name:"Ember"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB",name:"Varázsló"},
];

const TASK_COUNT = 15;

const RANK_TIERS = [
  {min:2500,label:"🏆 Középföld Mestere",color:"#FFD700"},
  {min:1800,label:"⚔️ Legendás Hős",color:"#C9A84C"},
  {min:1000,label:"🛡️ Tapasztalt Vitéz",color:"#A0A0C0"},
  {min:500, label:"📜 Kalandor",color:"#A0522D"},
  {min:100, label:"🌱 Újonc",color:"#6B8C3E"},
  {min:0,   label:"🚶 Vándor",color:"#5A5040"},
];
const getRank = (score) => RANK_TIERS.find(r => score >= r.min) || RANK_TIERS[RANK_TIERS.length-1];

// Fake leaderboard players
const FAKE_PLAYERS = [
  {name:"Legolas",race:"elf",score:2840,tasks:15},
  {name:"Gandalf",race:"wizard",score:2650,tasks:15},
  {name:"Thorin",race:"dwarf",score:2100,tasks:13},
  {name:"Aragorn",race:"human",score:1950,tasks:12},
  {name:"Frodo",race:"hobbit",score:1600,tasks:11},
  {name:"Bilbo",race:"hobbit",score:1400,tasks:10},
  {name:"Gimli",race:"dwarf",score:1100,tasks:9},
  {name:"Elrond",race:"elf",score:800,tasks:7},
];

// Daily challenges
const DAILY_CHALLENGES = [
  {icon:"⚔️",task:"Teljesíts 2 feladatot ma",pts:50,type:"tasks",goal:2},
  {icon:"💍",task:"Szerezz 200 pontot egyetlen feladatban",pts:80,type:"score",goal:200},
  {icon:"🧙",task:"Próbáld ki a Rúna Dekódolót",pts:60,type:"specific",goal:6},
  {icon:"🗺️",task:"Teljesítsd a Térkép összes elérhető feladatát",pts:100,type:"all",goal:3},
  {icon:"⏱️",task:"Teljesíts egy feladatot 30mp alatt",pts:70,type:"speed",goal:30},
];

// Mini bar chart component
function BarChart({data,color}){
  const max = Math.max(...data.map(d=>d.val),1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:4,height:60,padding:"0 4px"}}>
    {data.map((d,i)=>(
      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <div style={{width:"100%",background:`linear-gradient(180deg,${color},${color}66)`,height:`${(d.val/max)*52}px`,minHeight:d.val>0?4:0,borderRadius:"2px 2px 0 0",transition:"height .6s ease",boxShadow:d.val>0?`0 0 8px ${color}44`:"none"}}/>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".04em",textAlign:"center",lineHeight:1.2}}>{d.label}</div>
      </div>
    ))}
  </div>;
}

export default function ProfileTab({user, completed, scores}){
  const race = RACES.find(r=>r.id===user?.race) || RACES[3];
  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const pct = Math.round((completed.length/TASK_COUNT)*100);
  const rank = getRank(totalScore);

  const [tab, setTab] = useState("stats");
  const [friends, setFriends] = useState(()=>JSON.parse(localStorage.getItem("hobbit_friends")||"[]"));
  const [search, setSearch] = useState("");
  const [searchMsg, setSearchMsg] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(()=>localStorage.getItem("hobbit_bio")||"");
  const [bioEdit, setBioEdit] = useState("");
  const [selectedRace, setSelectedRace] = useState(user?.race||"human");

  // Daily challenge
  const todayKey = new Date().toISOString().slice(0,10);
  const [dailyDone, setDailyDone] = useState(()=>JSON.parse(localStorage.getItem("hobbit_daily_"+todayKey)||"[]"));
  const dailyChallenge = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];

  // Stats chart data — points per task type
  const taskTypes = ["quiz","truefalse","fillblank","match","order","rune","quote","scramble","prophecy"];
  const typeLabels = {quiz:"Kvíz",truefalse:"I/H",fillblank:"Hiány",match:"Páros",order:"Sorrend",rune:"Rúna",quote:"Idézet",scramble:"Szókeverő",prophecy:"Jóslat"};

  // Achievements
  const achivs = [
    {icon:"🗡️",name:"Első Vér",desc:"1 feladat",done:completed.length>=1},
    {icon:"🏔️",name:"Hegymászó",desc:"5 feladat",done:completed.length>=5},
    {icon:"💍",name:"Gyűrű Hordozó",desc:"10 feladat",done:completed.length>=10},
    {icon:"🐉",name:"Sárkányölő",desc:"Mind a 15",done:completed.length>=15},
    {icon:"⭐",name:"Ezer Pont",desc:"1000 pont",done:totalScore>=1000},
    {icon:"✨",name:"Arany Rang",desc:"2000 pont",done:totalScore>=2000},
    {icon:"🧙",name:"Varázsló Barát",desc:"1 barát",done:friends.length>=1},
    {icon:"🤝",name:"Szövetségkötő",desc:"3 barát",done:friends.length>=3},
    {icon:"⚡",name:"Villámgyors",desc:"Napi kihívás",done:dailyDone.length>0},
    {icon:"🌟",name:"Legendás",desc:"2500 pont",done:totalScore>=2500},
  ];

  const saveBio = () => {
    localStorage.setItem("hobbit_bio", bioEdit);
    setBio(bioEdit);
    // Save race change
    const cu = JSON.parse(localStorage.getItem("hobbit_current")||"{}");
    cu.race = selectedRace;
    localStorage.setItem("hobbit_current", JSON.stringify(cu));
    setEditMode(false);
  };

  const addFriend = () => {
    const name = search.trim();
    if(!name){setSearchMsg({ok:false,t:"Írj be egy nevet!"});return;}
    if(name.toLowerCase()===user?.adventureName?.toLowerCase()){setSearchMsg({ok:false,t:"Magadat nem adhatod hozzá!"});return;}
    if(friends.find(f=>f.name.toLowerCase()===name.toLowerCase())){setSearchMsg({ok:false,t:"Már a barátod!"});return;}
    const newF = {name, race:RACES[Math.floor(Math.random()*RACES.length)].id, score:Math.floor(Math.random()*1800)+200, added:Date.now(), invited:false};
    const next = [...friends, newF];
    setFriends(next);
    localStorage.setItem("hobbit_friends", JSON.stringify(next));
    setSearch("");
    setSearchMsg({ok:true,t:`${name} hozzáadva! ⚔️`});
    setTimeout(()=>setSearchMsg(null),2500);
  };

  const removeFriend = (name) => {
    const next = friends.filter(f=>f.name!==name);
    setFriends(next);
    localStorage.setItem("hobbit_friends", JSON.stringify(next));
  };

  const inviteFriend = (name) => {
    const next = friends.map(f=>f.name===name?{...f,invited:true}:f);
    setFriends(next);
    localStorage.setItem("hobbit_friends", JSON.stringify(next));
    setTimeout(()=>{
      const reset = friends.map(f=>f.name===name?{...f,invited:false}:f);
      setFriends(reset);
      localStorage.setItem("hobbit_friends", JSON.stringify(reset));
    }, 3000);
  };

  const claimDaily = () => {
    const next = [...dailyDone, dailyChallenge.task];
    setDailyDone(next);
    localStorage.setItem("hobbit_daily_"+todayKey, JSON.stringify(next));
  };

  const isDailyClaimed = dailyDone.includes(dailyChallenge.task);

  // Leaderboard with user injected
  const leaderboard = [...FAKE_PLAYERS, {name:user?.adventureName||"Te",race:user?.race||"human",score:totalScore,tasks:completed.length,isMe:true}]
    .sort((a,b)=>b.score-a.score);

  const TABS2 = [
    {id:"stats",label:"Statok",icon:"📊"},
    {id:"friends",label:"Barátok",icon:"⚔️"},
    {id:"leaderboard",label:"Ranglétra",icon:"🏆"},
    {id:"daily",label:"Napi",icon:"☀️"},
  ];

  const s = (obj) => obj; // style passthrough

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflowY:"auto"}}>

      {/* ── PROFILE HEADER ── */}
      <div style={{padding:"16px 16px 12px",background:"linear-gradient(180deg,rgba(201,168,76,.06),transparent)",borderBottom:"1px solid rgba(201,168,76,.1)"}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          {/* Avatar */}
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:56,height:56,borderRadius:"50%",border:`2px solid ${race.color}`,background:`radial-gradient(circle,${race.color}33,rgba(0,0,0,.8))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",boxShadow:`0 0 18px ${race.color}44`}}>
              {race.icon}
            </div>
            <button onClick={()=>{setEditMode(true);setBioEdit(bio);setSelectedRace(user?.race||"human");}}
              style={{position:"absolute",bottom:-2,right:-2,width:20,height:20,borderRadius:"50%",background:"rgba(201,168,76,.15)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontSize:".6rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
          </div>

          {/* Info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.85rem,2.5vw,1.1rem)",color:"var(--gold)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.adventureName||"Ismeretlen"}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:race.color,letterSpacing:".08em",textTransform:"uppercase",marginTop:1}}>{race.name} · <span style={{color:rank.color}}>{rank.label}</span></div>
            {bio&&<div style={{fontStyle:"italic",fontSize:".75rem",color:"var(--td)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bio}</div>}
            <div style={{marginTop:6,height:3,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${race.color}88,var(--gold))`,transition:"width 1s",borderRadius:2}}/>
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",marginTop:2,letterSpacing:".06em"}}>{completed.length}/{TASK_COUNT} feladat · {pct}%</div>
          </div>

          {/* Score */}
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:"var(--gold)",textShadow:"0 0 12px rgba(201,168,76,.3)"}}>{totalScore}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)",letterSpacing:".1em"}}>PONT</div>
          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editMode&&<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(4,3,2,.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{width:"100%",maxWidth:400,background:"linear-gradient(162deg,rgba(20,15,11,.99),rgba(8,6,4,.99))",border:"1px solid rgba(201,168,76,.22)",padding:20,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",textAlign:"center"}}>Profil Szerkesztése</div>

          {/* Race picker */}
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>Faj választás</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
              {RACES.map(r=>(
                <button key={r.id} onClick={()=>setSelectedRace(r.id)} style={{padding:"8px 4px",background:selectedRace===r.id?`rgba(${r.color.slice(1).match(/../g).map(x=>parseInt(x,16)).join(",")},0.15)`:"rgba(0,0,0,.3)",border:`1px solid ${selectedRace===r.id?r.color:"rgba(201,168,76,.12)"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",transition:"all .15s"}}>
                  <span style={{fontSize:"1.2rem"}}>{r.icon}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:selectedRace===r.id?r.color:"var(--gm)",letterSpacing:".04em"}}>{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Bio</div>
            <textarea
              value={bioEdit}
              onChange={e=>setBioEdit(e.target.value)}
              maxLength={120}
              placeholder="Rövid bemutatkozás (max 120 karakter)..."
              style={{width:"100%",background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.2)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"8px 12px",outline:"none",resize:"none",height:70,boxSizing:"border-box"}}
            />
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",textAlign:"right"}}>{bioEdit.length}/120</div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setEditMode(false)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid rgba(201,168,76,.15)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".08em",cursor:"pointer"}}>Mégse</button>
            <button onClick={saveBio} style={{flex:1,padding:"9px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".08em",cursor:"pointer"}}>Mentés ✓</button>
          </div>
        </div>
      </div>}

      {/* ── SUB TABS ── */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
        {TABS2.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 2px",background:tab===t.id?"rgba(201,168,76,.05)":"transparent",border:"none",borderBottom:`2px solid ${tab===t.id?"var(--gold)":"transparent"}`,color:tab===t.id?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".06em",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all .2s"}}>
            <span style={{fontSize:".9rem"}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── STATS TAB ── */}
      {tab==="stats"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Stat grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {icon:"🏆",label:"Összes pont",val:totalScore,color:"var(--gold)"},
            {icon:"✅",label:"Teljesített",val:`${completed.length}/${TASK_COUNT}`,color:"#66BB6A"},
            {icon:"⚔️",label:"Barátok",val:friends.length,color:"#7A4ABB"},
            {icon:"🎖️",label:"Jelvények",val:`${achivs.filter(a=>a.done).length}/${achivs.length}`,color:"#3A7A8B"},
          ].map(s=>(
            <div key={s.label} style={{padding:"10px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.09)",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:"1.3rem"}}>{s.icon}</span>
              <div>
                <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:s.color}}>{s.val}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".06em",textTransform:"uppercase"}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{padding:"12px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.08)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:10}}>— Pontok feladatonként —</div>
          <BarChart color={race.color} data={[
            {label:"I",val:scores[1]||0},{label:"II",val:scores[2]||0},{label:"III",val:scores[3]||0},
            {label:"IV",val:scores[4]||0},{label:"V",val:scores[5]||0},{label:"VI",val:scores[6]||0},
            {label:"VII",val:scores[7]||0},{label:"VIII",val:scores[8]||0},{label:"IX",val:scores[9]||0},
            {label:"X",val:scores[10]||0},{label:"XI",val:scores[11]||0},{label:"XII",val:scores[12]||0},
            {label:"XIII",val:scores[13]||0},{label:"XIV",val:scores[14]||0},{label:"XV",val:scores[15]||0},
          ]}/>
        </div>

        {/* Achievements */}
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".16em",color:"var(--gm)",textTransform:"uppercase"}}>— Jelvények ({achivs.filter(a=>a.done).length}/{achivs.length}) —</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {achivs.map(a=>(
            <div key={a.name} style={{padding:"8px 10px",background:a.done?"rgba(201,168,76,.06)":"rgba(0,0,0,.15)",border:`1px solid ${a.done?"rgba(201,168,76,.25)":"rgba(255,255,255,.04)"}`,display:"flex",alignItems:"center",gap:8,opacity:a.done?1:.4,transition:"all .3s"}}>
              <span style={{fontSize:"1.2rem",filter:a.done?"none":"grayscale(1)",flexShrink:0}}>{a.icon}</span>
              <div style={{minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:a.done?"var(--gold)":"var(--gm)",letterSpacing:".03em"}}>{a.name}</div>
                <div style={{fontFamily:"'EB Garamond',serif",fontSize:".68rem",color:"var(--td)",fontStyle:"italic"}}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* ── FRIENDS TAB ── */}
      {tab==="friends"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Search & Add */}
        <div style={{padding:"12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.1)"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— Kalandor keresése —</div>
          <div style={{display:"flex",gap:7}}>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addFriend()}
              placeholder="Kalandor neve..."
              style={{flex:1,background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.18)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"7px 10px",outline:"none"}}
            />
            <button onClick={addFriend} style={{padding:"7px 14px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".65rem",letterSpacing:".07em",cursor:"pointer",whiteSpace:"nowrap"}}>+ Add</button>
          </div>
          {searchMsg&&<div style={{marginTop:7,fontFamily:"'Cinzel',serif",fontSize:".65rem",color:searchMsg.ok?"#66BB6A":"#EF9A9A",animation:"fadeIn .2s"}}>{searchMsg.t}</div>}
        </div>

        {/* Friends list */}
        {friends.length===0
          ?<div style={{textAlign:"center",padding:"24px 16px",opacity:.4}}>
            <div style={{fontSize:"2rem",marginBottom:8}}>🤝</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gm)",letterSpacing:".1em"}}>Még nincs barátod</div>
          </div>
          :<div style={{display:"flex",flexDirection:"column",gap:7}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— {friends.length} Szövetséges —</div>
            {[...friends].sort((a,b)=>b.score-a.score).map((f,i)=>{
              const fr = RACES.find(r=>r.id===f.race)||RACES[3];
              return (
                <div key={f.name} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.09)"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",minWidth:14,textAlign:"center"}}>{i+1}.</div>
                  <div style={{width:34,height:34,borderRadius:"50%",border:`1.5px solid ${fr.color}`,background:`radial-gradient(circle,${fr.color}22,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".95rem",flexShrink:0}}>{fr.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:fr.color,letterSpacing:".05em",textTransform:"uppercase"}}>{fr.name}</div>
                  </div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)"}}>{f.score}pt</div>
                  {/* Invite to board game */}
                  <button onClick={()=>inviteFriend(f.name)} style={{padding:"4px 8px",background:f.invited?"rgba(102,187,106,.12)":"rgba(122,74,187,.1)",border:`1px solid ${f.invited?"rgba(102,187,106,.4)":"rgba(122,74,187,.35)"}`,color:f.invited?"#66BB6A":"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",letterSpacing:".04em",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>
                    {f.invited?"✓ Küldve":"🎲 Meghív"}
                  </button>
                  <button onClick={()=>removeFriend(f.name)} style={{background:"none",border:"1px solid rgba(229,57,53,.2)",color:"rgba(229,57,53,.5)",width:22,height:22,cursor:"pointer",fontSize:".65rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                </div>
              );
            })}
          </div>
        }
      </div>}

      {/* ── LEADERBOARD TAB ── */}
      {tab==="leaderboard"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".16em",color:"var(--gm)",textTransform:"uppercase",marginBottom:4}}>— Top Kalandorok —</div>
        {leaderboard.map((p,i)=>{
          const pr = RACES.find(r=>r.id===p.race)||RACES[3];
          const pr_rank = getRank(p.score);
          const isMe = p.isMe;
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
          return (
            <div key={p.name+i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",background:isMe?"rgba(201,168,76,.07)":"rgba(255,255,255,.02)",border:`1px solid ${isMe?"rgba(201,168,76,.3)":"rgba(201,168,76,.07)"}`,transition:"all .2s",boxShadow:isMe?"0 0 14px rgba(201,168,76,.1)":"none"}}>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".75rem",color:i<3?"var(--gold)":"var(--gm)",minWidth:22,textAlign:"center"}}>{medal||`${i+1}.`}</div>
              <div style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${pr.color}`,background:`radial-gradient(circle,${pr.color}22,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem",flexShrink:0}}>{pr.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:isMe?"var(--gold)":"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}{isMe&&" (Te)"}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:pr_rank.color,letterSpacing:".04em"}}>{pr_rank.label}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{p.score}pt</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)"}}>{p.tasks}/{TASK_COUNT} ✓</div>
              </div>
            </div>
          );
        })}
      </div>}

      {/* ── DAILY CHALLENGE TAB ── */}
      {tab==="daily"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".16em",color:"var(--gm)",textTransform:"uppercase"}}>— Mai Napi Kihívás —</div>

        {/* Main daily */}
        <div style={{padding:"16px",background:isDailyClaimed?"rgba(102,187,106,.06)":"rgba(201,168,76,.04)",border:`1px solid ${isDailyClaimed?"rgba(102,187,106,.3)":"rgba(201,168,76,.18)"}`,display:"flex",flexDirection:"column",gap:12,transition:"all .3s"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:"2rem"}}>{dailyChallenge.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:isDailyClaimed?"#66BB6A":"var(--text)",letterSpacing:".04em"}}>{dailyChallenge.task}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",marginTop:3}}>Jutalom: <span style={{color:"var(--gold)"}}>+{dailyChallenge.pts} bónusz pont</span></div>
            </div>
          </div>
          {isDailyClaimed
            ?<div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"#66BB6A",letterSpacing:".1em"}}>✓ Teljesítve! Gyere vissza holnap!</div>
            :<button onClick={claimDaily} style={{padding:"10px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase",letterSpacing:".12em"}}>Teljesítettem ✓</button>
          }
        </div>

        {/* Weekly progress */}
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— Heti Kihívások —</div>
        {DAILY_CHALLENGES.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"rgba(0,0,0,.15)",border:"1px solid rgba(201,168,76,.07)",opacity:i===new Date().getDay()%DAILY_CHALLENGES.length?1:.5}}>
            <span style={{fontSize:"1.1rem"}}>{c.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--text)",fontStyle:"italic"}}>{c.task}</div>
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gold)",flexShrink:0}}>+{c.pts}pt</div>
            {i===new Date().getDay()%DAILY_CHALLENGES.length&&<span style={{fontSize:".75rem",color:"var(--gold)"}}>◀</span>}
          </div>
        ))}
      </div>}

    </div>
  );
}
