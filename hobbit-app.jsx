import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
const RACES = [
  { id:"hobbit", label:"Hobbit",   icon:"🧑‍🌾", title:"A Shire Népe",           desc:"Apró termetű, de nagy szívű lények. Nem keresnek kalandot — a kaland találja meg őket. Bilbo Zsákos is így indult útnak.",      color:"#6B8C3E", glow:"rgba(107,140,62,0.35)",  traits:["Kitartás","Bátorság","Otthon"],   rune:"ᚠ" },
  { id:"dwarf",  label:"Törpe",    icon:"⛏️",  title:"Erebor Mesterei",         desc:"Büszke, rendíthetetlen nép. A hegyeket istenként tisztelik, a követ barátként kezelik. Thorin vére folyik ereikben.",            color:"#A0522D", glow:"rgba(160,82,45,0.35)",   traits:["Büszkeség","Erő","Mesterség"],    rune:"ᚦ" },
  { id:"elf",    label:"Tünde",    icon:"🌿",  title:"Az Erdők Halhatatlanjai", desc:"Bölcsességük korokat ível át. Látnak, amit mások nem, hallanak, amit a szél elsuttog. Középföldé legősibb népe.",               color:"#3A7A8B", glow:"rgba(58,122,139,0.35)",  traits:["Bölcsesség","Gyorsaság","Titok"], rune:"ᛁ" },
  { id:"human",  label:"Ember",    icon:"⚔️",  title:"A Szabad Nép",            desc:"Halandó, mégis a legmerészebb. Ahol mások megtorpannak, az ember tovább megy. Gondor falai az ő akaratukból állnak.",            color:"#8B7355", glow:"rgba(139,115,85,0.35)",  traits:["Szabadság","Merészség","Akarat"], rune:"ᚨ" },
  { id:"wizard", label:"Varázsló", icon:"🔮",  title:"Az Istari Vándor",        desc:"Középföldére küldött, nem született. Titkokat hordoz, melyeket évezredek sem tárnak fel. Gandalf is közéjük tartozott.",        color:"#7A4ABB", glow:"rgba(122,74,187,0.35)", traits:["Hatalom","Titok","Bölcsesség"],   rune:"ᛟ" },
];

const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

// ─── Floating Stones ──────────────────────────────────────────────────────────
function FloatingStones() {
  const ref = useRef(Array.from({ length: 22 }, (_, i) => ({
    id:i, x:Math.random()*100, y:Math.random()*100,
    w:10+Math.random()*36, h:7+Math.random()*24,
    vx:(Math.random()-.5)*.013, vy:(Math.random()-.5)*.009,
    rot:Math.random()*360, vr:(Math.random()-.5)*.025,
    op:0.04+Math.random()*.08, tone:Math.floor(Math.random()*3),
  })));
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      ref.current = ref.current.map(s => ({
        ...s, x:((s.x+s.vx)+100)%100, y:((s.y+s.vy)+100)%100, rot:s.rot+s.vr,
      }));
      tick(n => n+1);
    }, 50);
    return () => clearInterval(id);
  }, []);
  const tones = ["linear-gradient(140deg,#302820,#18120C)","linear-gradient(140deg,#202A18,#0E1208)","linear-gradient(140deg,#28241A,#120E08)"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
      {ref.current.map(s => (
        <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.w,height:s.h,opacity:s.op,transform:`rotate(${s.rot}deg)`,background:tones[s.tone],borderRadius:"1px",border:"0.5px solid rgba(201,168,76,0.06)",boxShadow:"inset 1px 1px 2px rgba(255,255,255,0.02),inset -1px -1px 2px rgba(0,0,0,0.4)",willChange:"transform"}}/>
      ))}
    </div>
  );
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function useParticles(ref) {
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let raf;
    const resize = () => { c.width=c.offsetWidth; c.height=c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({length:38}, () => ({
      x:Math.random()*1400, y:Math.random()*900, r:Math.random()*1.6+0.3,
      vx:(Math.random()-.5)*.13, vy:-(Math.random()*.27+.07),
      o:Math.random(), os:Math.random()*.005+.002,
      color:Math.random()>.5?`hsl(${38+Math.random()*12},80%,${55+Math.random()*18}%)`:`hsl(0,0%,${62+Math.random()*28}%)`,
    }));
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.o+=p.os; if(p.o>1||p.o<0) p.os*=-1;
        if(p.y<-4){p.y=c.height+4;p.x=Math.random()*c.width;}
        ctx.save(); ctx.globalAlpha=Math.min(.72,Math.max(0,p.o));
        ctx.fillStyle=p.color; ctx.shadowBlur=5; ctx.shadowColor=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, [ref]);
}

// ─── Password strength ────────────────────────────────────────────────────────
function pwStrength(pw) {
  if (!pw) return null;
  let s=0;
  if(pw.length>=6)s++; if(pw.length>=10)s++;
  if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++;
  if(/[^A-Za-z0-9]/.test(pw))s++;
  const l=[null,
    {label:"Gyenge — Gollum is kitalálná",color:"#E53935"},
    {label:"Közepes — óvd jobban",color:"#F57F17"},
    {label:"Jó — Sauron küzdene vele",color:"#C9A84C"},
    {label:"Erős — Mithril szintű",color:"#43A047"},
    {label:"Legendás — Gandalf sem törné fel",color:"#1E88E5"},
  ];
  return {...l[s],level:s};
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({step}) {
  const steps=[{rune:"ᚠ",label:"Adatok"},{rune:"ᚦ",label:"Faj"},{rune:"ᛟ",label:"Kész"}];
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{width:42,height:42,border:`1.5px solid ${i<step?"var(--gold)":i===step?"var(--gold-bright)":"rgba(201,168,76,0.16)"}`,background:i<step?"linear-gradient(135deg,rgba(201,168,76,0.22),rgba(201,168,76,0.08))":i===step?"linear-gradient(135deg,rgba(201,168,76,0.1),rgba(201,168,76,0.03))":"transparent",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:i===step?"0 0 16px rgba(201,168,76,0.25)":"none",transform:i===step?"scale(1.1)":"scale(1)",transition:"all 0.4s ease"}}>
              {i<step?<span style={{color:"var(--gold)",fontSize:"0.95rem"}}>✓</span>:<span style={{color:i===step?"var(--gold-bright)":"rgba(201,168,76,0.22)",fontFamily:"serif",fontSize:"1.1rem"}}>{s.rune}</span>}
            </div>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap",color:i===step?"var(--gold)":i<step?"var(--gold-muted)":"rgba(201,168,76,0.2)",transition:"color 0.4s"}}>{s.label}</span>
          </div>
          {i<steps.length-1&&<div style={{width:56,height:1,margin:"0 4px",marginBottom:20,background:i<step?"var(--gold)":"rgba(201,168,76,0.14)",transition:"background 0.5s"}}/>}
        </div>
      ))}
    </div>
  );
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Err({msg}) {
  if(!msg) return null;
  return <div style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 11px",background:"rgba(183,28,28,0.1)",border:"1px solid rgba(229,57,53,0.32)",borderLeft:"3px solid #E53935",color:"#EF9A9A",fontSize:"0.79rem",fontStyle:"italic",fontFamily:"'EB Garamond',serif",animation:"errShake 0.35s ease",marginTop:4,lineHeight:1.4}}><span style={{flexShrink:0,fontSize:"0.73rem",marginTop:1}}>⚠</span>{msg}</div>;
}

function Field({label,icon,error,hint,children}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <label style={{fontFamily:"'Cinzel',serif",fontSize:"0.67rem",letterSpacing:"0.15em",color:"var(--gold-muted)",textTransform:"uppercase",display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:"0.86rem"}}>{icon}</span>{label}
      </label>
      {children}
      {hint&&!error&&<div style={{fontSize:"0.73rem",color:"rgba(106,90,64,0.5)",fontStyle:"italic",paddingLeft:2}}>{hint}</div>}
      <Err msg={error}/>
    </div>
  );
}

function RuneStrip({offset=0}) {
  return (
    <div style={{display:"flex",gap:3,justifyContent:"center",flexWrap:"wrap",margin:"2px 0"}}>
      {RUNES.split("").slice(offset,offset+18).map((r,i)=>(
        <span key={i} style={{color:"var(--gold)",opacity:0.05+(i%5)*0.025,fontFamily:"serif",fontSize:"0.8rem",animation:`runeFlicker ${2.5+i*.22}s ease-in-out infinite`}}>{r}</span>
      ))}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function HobbitApp() {
  const [screen, setScreen] = useState("auth"); // auth | welcome | tasks
  const [user, setUser]     = useState(null);
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const handleAuth = useCallback((u) => {
    setUser(u);
    setScreen("welcome");
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="root">
        <canvas ref={canvasRef} className="canvas"/>
        <FloatingStones/>
        <div className="noise"/>
        <div className="amb amb1"/><div className="amb amb2"/>

        {screen === "auth"    && <AuthScreen    onSuccess={handleAuth}/>}
        {screen === "welcome" && <WelcomeScreen user={user} onEnter={() => setScreen("tasks")}/>}
        {screen === "tasks"   && <TasksScreen   user={user}/>}
      </div>
    </>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({onSuccess}) {
  const [tab, setTab] = useState("login");
  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <div className="card-head">
          <RuneStrip offset={0}/>
          <div className="head-emblem">
            <div className="em-ring em-r1"/><div className="em-ring em-r2"/><div className="em-ring em-r3"/>
            <span className="em-icon">⚔️</span>
          </div>
          <h1 className="head-title">A Hobbit Platform</h1>
          <p className="head-sub">Középföld Kapuja</p>
          <RuneStrip offset={6}/>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab==="login"?"tab-on":""}`} onClick={()=>setTab("login")}>
            <span className="tab-rune">ᚱ</span>Bejelentkezés
          </button>
          <button className={`tab-btn ${tab==="register"?"tab-on":""}`} onClick={()=>setTab("register")}>
            <span className="tab-rune">ᚠ</span>Regisztráció
          </button>
        </div>

        {/* Body */}
        <div key={tab} className="card-body tab-anim">
          {tab === "login"
            ? <LoginForm    onSuccess={onSuccess} onSwitch={()=>setTab("register")}/>
            : <RegisterForm onSuccess={onSuccess} onSwitch={()=>setTab("login")}/>
          }
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────
function LoginForm({onSuccess, onSwitch}) {
  const [form, setForm]       = useState({email:"",password:""});
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalErr, setGE]    = useState("");

  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); setGE(""); };

  const submit = () => {
    const e = {};
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email    = "Érvényes email cím szükséges!";
    if (!form.password)                              e.password = "Add meg a jelszavad!";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("hobbit_users")||"[]");
      const user  = users.find(u => u.email===form.email && u.password===form.password);
      if (!user) { setGE("Hibás email vagy jelszó — próbáld újra, kalandor!"); setLoading(false); return; }
      localStorage.setItem("hobbit_current", JSON.stringify(user));
      onSuccess(user);
    }, 700);
  };

  return (
    <div className="form-wrap">
      <div className="form-title"><span className="form-rune">ᚱ</span>Visszatérés Középföldére</div>

      <div className="fields">
        <Field label="Email Cím" icon="✉️" error={errors.email}>
          <div className="iw">
            <input className={`inp${errors.email?" inp-e":""}`} type="email" placeholder="kalandor@shire.me"
              value={form.email} onChange={e=>upd("email",e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
            {form.email.match(/^[^@]+@[^@]+\.[^@]+$/)&&!errors.email&&<span className="icheck">✓</span>}
          </div>
        </Field>

        <Field label="Jelszó" icon="🔒" error={errors.password}>
          <div className="iw">
            <input className={`inp${errors.password?" inp-e":""}`}
              type={showPw?"text":"password"} placeholder="Titkos jelszó..."
              value={form.password} onChange={e=>upd("password",e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} style={{paddingRight:38}}/>
            <button onClick={()=>setShowPw(s=>!s)} className="eye">{showPw?"🙈":"👁️"}</button>
          </div>
        </Field>

        {globalErr && <Err msg={globalErr}/>}

        <div style={{textAlign:"right"}}>
          <button style={{background:"none",border:"none",color:"var(--text-dim)",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.67rem",letterSpacing:"0.08em",textDecoration:"underline",textUnderlineOffset:"3px"}}>
            Elfelejtett jelszó?
          </button>
        </div>
      </div>

      <button className={`btn-submit${loading?" btn-loading":""}`} onClick={submit} disabled={loading}>
        {loading ? "✦ Kapu nyílik... ✦" : "⚔️  Belépés Középföldére"}
      </button>

      <div className="form-switch">
        Még nincs fiókod?
        <button onClick={onSwitch}>Regisztrálj!</button>
      </div>
    </div>
  );
}

// ─── REGISTER FORM (3-step wizard) ───────────────────────────────────────────
function RegisterForm({onSuccess, onSwitch}) {
  const [step, setStep]       = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState(1);
  const [form, setForm]       = useState({adventureName:"",realName:"",email:"",password:"",confirm:"",race:""});
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [globalErr, setGE]    = useState("");

  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); setGE(""); };

  const validate = (s) => {
    const e={};
    if(s===0){
      if(!form.adventureName.trim())       e.adventureName="Kalandorneved nélkül nem léphetsz Középföldére!";
      else if(form.adventureName.length<3) e.adventureName="Legalább 3 betű kell a névhez!";
      if(!form.realName.trim())            e.realName="Valódi nevedre is szükség van!";
      if(!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email="Ez nem tűnik érvényes levélcímnek...";
      if(form.password.length<6)           e.password="A jelszó legalább 6 karakter legyen!";
      if(form.password!==form.confirm)     e.confirm="A két jelszó nem egyezik!";
    }
    if(s===1){ if(!form.race) e.race="Válassz fajt, hogy megkezdhessed a kalandot!"; }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if(Object.keys(e).length){setErrors(e);return;}
    if(step===2){finish();return;}
    setAnimDir(1); setStep(s=>s+1); setAnimKey(k=>k+1);
  };
  const back = () => { setAnimDir(-1); setStep(s=>s-1); setAnimKey(k=>k+1); };

  const finish = () => {
    const users = JSON.parse(localStorage.getItem("hobbit_users")||"[]");
    if(users.find(u=>u.email===form.email)){
      setGE("Ez az email cím már foglalt — talán már kalandoz valaki?");
      setStep(0); return;
    }
    const user = {id:Date.now(),adventureName:form.adventureName,realName:form.realName,email:form.email,password:form.password,race:form.race,joinedAt:new Date().toISOString(),score:0,completedTasks:[]};
    localStorage.setItem("hobbit_users",JSON.stringify([...users,user]));
    localStorage.setItem("hobbit_current",JSON.stringify(user));
    onSuccess(user);
  };

  const race = RACES.find(r=>r.id===form.race);
  const str  = pwStrength(form.password);

  return (
    <div className="form-wrap">
      <StepIndicator step={step}/>
      {globalErr && <Err msg={globalErr}/>}

      <div key={animKey} style={{animation:`${animDir>0?"slideInR":"slideInL"} 0.35s cubic-bezier(0.22,1,0.36,1) both`}}>

        {/* STEP 1 — Adatok */}
        {step===0 && (
          <div>
            <div className="form-title" style={{marginBottom:14}}><span className="form-rune">ᚠ</span>Ki vagy te, kalandor?</div>
            <div className="fields">
              <Field label="Kalandornév" icon="⚔️" error={errors.adventureName} hint="Ez lesz a neved Középföldén — válaszd bölcsen">
                <div className="iw">
                  <input className={`inp${errors.adventureName?" inp-e":""}`} placeholder="Pl.: Bilbo Zsákos" value={form.adventureName} onChange={e=>upd("adventureName",e.target.value)} maxLength={24}/>
                  {form.adventureName.length>=3&&!errors.adventureName&&<span className="icheck">✓</span>}
                </div>
              </Field>
              <Field label="Valódi Neved" icon="📜" error={errors.realName}>
                <div className="iw">
                  <input className={`inp${errors.realName?" inp-e":""}`} placeholder="Teljes neved" value={form.realName} onChange={e=>upd("realName",e.target.value)}/>
                  {form.realName.length>=2&&!errors.realName&&<span className="icheck">✓</span>}
                </div>
              </Field>
              <Field label="Email Cím" icon="✉️" error={errors.email}>
                <div className="iw">
                  <input className={`inp${errors.email?" inp-e":""}`} type="email" placeholder="kalandor@shire.me" value={form.email} onChange={e=>upd("email",e.target.value)}/>
                  {form.email.match(/^[^@]+@[^@]+\.[^@]+$/)&&!errors.email&&<span className="icheck">✓</span>}
                </div>
              </Field>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Field label="Jelszó" icon="🔒" error={errors.password}>
                  <div className="iw">
                    <input className={`inp${errors.password?" inp-e":""}`} type={showPw?"text":"password"} placeholder="Titkos..." value={form.password} onChange={e=>upd("password",e.target.value)} style={{paddingRight:38}}/>
                    <button onClick={()=>setShowPw(s=>!s)} className="eye">{showPw?"🙈":"👁️"}</button>
                  </div>
                  {str&&<>
                    <div style={{display:"flex",gap:3,marginTop:5}}>
                      {[1,2,3,4,5].map(l=><div key={l} style={{flex:1,height:"3px",borderRadius:2,background:l<=str.level?str.color:"rgba(255,255,255,0.06)",transition:"background 0.3s"}}/>)}
                    </div>
                    <div style={{fontSize:"0.67rem",color:str.color,fontStyle:"italic",marginTop:2}}>{str.label}</div>
                  </>}
                </Field>
                <Field label="Megerősítés" icon="🔐" error={errors.confirm}>
                  <div className="iw">
                    <input className={`inp${errors.confirm?" inp-e":""}`} type={showCf?"text":"password"} placeholder="Ismételd..." value={form.confirm} onChange={e=>upd("confirm",e.target.value)} style={{paddingRight:38}}/>
                    <button onClick={()=>setShowCf(s=>!s)} className="eye">{showCf?"🙈":"👁️"}</button>
                  </div>
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Faj */}
        {step===1 && (
          <div>
            <div className="form-title" style={{marginBottom:14}}><span className="form-rune">ᚦ</span>Melyik nép vére folyik benned?</div>
            <Err msg={errors.race}/>
            <div className="race-grid">
              {RACES.map(r=>(
                <button key={r.id} className={`race-card${form.race===r.id?" race-on":""}`}
                  style={{"--rc":r.color,"--rg":r.glow}} onClick={()=>upd("race",r.id)}>
                  <div className="rc-rune-bg">{r.rune}</div>
                  <span className="rc-icon">{r.icon}</span>
                  <span className="rc-name">{r.label}</span>
                  {form.race===r.id&&<div className="rc-ring"/>}
                </button>
              ))}
            </div>
            {race && (
              <div className="race-detail" style={{"--rc":race.color,"--rg":race.glow}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <span style={{fontSize:"1.8rem"}}>{race.icon}</span>
                  <div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.8rem",color:"var(--gold)",letterSpacing:"0.08em",textTransform:"uppercase"}}>{race.title}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
                      {race.traits.map((t,i)=><span key={i} style={{padding:"2px 7px",border:"1px solid rgba(201,168,76,0.18)",color:"var(--text-dim)",fontSize:"0.63rem",fontFamily:"'Cinzel',serif",background:"rgba(201,168,76,0.03)"}}>{t}</span>)}
                    </div>
                  </div>
                </div>
                <p style={{fontStyle:"italic",color:"var(--text-dim)",fontSize:"0.84rem",lineHeight:1.65}}>{race.desc}</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Összefoglalás */}
        {step===2 && (
          <div>
            <div className="form-title" style={{marginBottom:14}}><span className="form-rune">ᛟ</span>Minden készen áll</div>
            <div className="summary">
              <div className="sum-emblem"><span style={{fontSize:"2.6rem"}}>{race?.icon||"⚔️"}</span></div>
              <div className="sum-name">{form.adventureName}</div>
              <div className="sum-race" style={{color:race?.color||"var(--gold)"}}>{race?.title||""}</div>
              <div className="sum-div"><span>✦</span></div>
              {[{icon:"📜",l:"Valódi Név",v:form.realName},{icon:"✉️",l:"Email",v:form.email},{icon:"🌍",l:"Faj",v:race?.label||"—"}].map((row,i)=>(
                <div key={i} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"7px 12px",background:"rgba(255,255,255,0.016)",border:"1px solid rgba(201,168,76,0.08)"}}>
                  <span style={{fontSize:"0.8rem",flexShrink:0}}>{row.icon}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.63rem",color:"var(--text-dim)",textTransform:"uppercase",letterSpacing:"0.08em",width:80,flexShrink:0}}>{row.l}</span>
                  <span style={{fontSize:"0.9rem",color:"var(--text)",fontStyle:"italic"}}>{row.v}</span>
                </div>
              ))}
              <div style={{width:"100%",fontStyle:"italic",fontSize:"0.79rem",color:"var(--text-dim)",lineHeight:1.65,padding:"9px 12px",borderLeft:"2px solid rgba(201,168,76,0.2)",background:"rgba(201,168,76,0.02)"}}>
                „{race?.desc||"A kaland vár."}"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="form-foot">
        {step>0 ? <button className="btn-back" onClick={back}>← Vissza</button> : <span/>}
        <button className="btn-submit" style={{flex:"unset",padding:"11px 22px"}} onClick={next}>
          {step===0&&"Faj Választása →"}
          {step===1&&"Összefoglalás →"}
          {step===2&&"⚔️  Kaland Kezdete"}
        </button>
      </div>

      <div className="form-switch">
        Már van fiókod?
        <button onClick={onSwitch}>Bejelentkezés</button>
      </div>
    </div>
  );
}

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────
function WelcomeScreen({user, onEnter}) {
  const [phase, setPhase] = useState(0);
  const race = RACES.find(r=>r.id===user?.race) || RACES[3];

  useEffect(()=>{
    const t=[
      setTimeout(()=>setPhase(1), 200),
      setTimeout(()=>setPhase(2), 900),
      setTimeout(()=>setPhase(3), 1800),
      setTimeout(()=>setPhase(4), 2700),
      setTimeout(()=>setPhase(5), 3500),
    ];
    return()=>t.forEach(clearTimeout);
  },[]);

  const raceGreeting = {
    hobbit:  "A Shire kapui megnyílnak előtted. Pipafüst illata, saját tűzhely melege — és valami, ami kalandnak nevezi magát.",
    dwarf:   "Erebor kövei visszhangozzák lépteid. Thorin büszkeséggel tekintene rád, harcostárs. Az arany vár.",
    elf:     "Lothlórien fái suttogják neved az éternek. Legyen utad könnyű, örök vándor — te látod, amit mások nem.",
    human:   "Gondor tornyai hajolnak meg előtted. Az ember szabad — és bátorsága határtalan. Menj előre.",
    wizard:  "Az istari rend befogad téged. Középföldére küldtek — bölcsességgel szolgálj, és a titkok feltárulnak.",
  };

  return (
    <div className="welcome-root">
      {/* Animated gate */}
      <div className={`gate-wrap ${phase>=1?"gate-open":""}`}>
        <div className="gate-panel gate-left">
          <div className="gate-runes">
            {RUNES.split("").map((r,i)=><span key={i} style={{display:"block",color:"rgba(201,168,76,0.3)",fontFamily:"serif",fontSize:"1rem",marginBottom:4}}>{r}</span>)}
          </div>
          <div className="gate-edge"/>
        </div>
        <div className="gate-panel gate-right">
          <div className="gate-runes" style={{textAlign:"right"}}>
            {RUNES.split("").reverse().map((r,i)=><span key={i} style={{display:"block",color:"rgba(201,168,76,0.3)",fontFamily:"serif",fontSize:"1rem",marginBottom:4}}>{r}</span>)}
          </div>
          <div className="gate-edge" style={{left:"auto",right:0}}/>
        </div>
      </div>

      {/* Content */}
      <div className="welcome-content">

        {/* Rune ring */}
        <div className={`rune-orbit ${phase>=2?"orbit-visible":""}`}>
          <div className="orbit-ring orbit-r1">
            {RUNES.split("").map((r,i)=>{
              const a=(i/RUNES.length)*360;
              return <span key={i} className="orbit-rune" style={{transform:`rotate(${a}deg) translateY(-68px)`,color:"var(--gold)",opacity:0.25+Math.sin(i)*0.15}}>{r}</span>;
            })}
          </div>
          <div className="orbit-ring orbit-r2">
            {RUNES.split("").reverse().map((r,i)=>{
              const a=(i/RUNES.length)*360;
              return <span key={i} className="orbit-rune" style={{transform:`rotate(${a}deg) translateY(-45px)`,color:"var(--gold)",opacity:0.12+Math.cos(i)*0.08,fontSize:"0.65rem"}}>{r}</span>;
            })}
          </div>
          <div className={`orbit-center ${phase>=2?"center-pop":""}`}>
            <span style={{fontSize:"2.8rem",display:"block"}}>{race.icon}</span>
          </div>
        </div>

        {/* Greeting */}
        <div className={`wlc-greet ${phase>=3?"wlc-visible":""}`}>
          <div className="wlc-eyebrow">— Középföldére léptél —</div>
          <h1 className="wlc-title">
            Üdvözlégy,<br/>
            <span className="wlc-name" style={{color:race.color,textShadow:`0 0 30px ${race.glow}`}}>
              {user?.adventureName}!
            </span>
          </h1>
          <div className="wlc-race-badge" style={{borderColor:race.color,color:race.color}}>
            {race.icon} {race.title}
          </div>
        </div>

        {/* Lore */}
        <div className={`wlc-lore ${phase>=4?"wlc-visible":""}`} style={{animationDelay:"0.1s"}}>
          <div className="lore-border-top"/>
          <p>{raceGreeting[user?.race]||raceGreeting.human}</p>
          <div className="lore-border-bottom"/>
        </div>

        {/* Stats + CTA */}
        <div className={`wlc-bottom ${phase>=5?"wlc-visible":""}`} style={{animationDelay:"0.2s"}}>
          <div className="wlc-stats">
            <div className="wstat">
              <span className="wstat-val">0</span>
              <span className="wstat-lbl">Feladat</span>
            </div>
            <div className="wstat-sep"/>
            <div className="wstat">
              <span className="wstat-val">0</span>
              <span className="wstat-lbl">Pont</span>
            </div>
            <div className="wstat-sep"/>
            <div className="wstat">
              <span className="wstat-val" style={{fontSize:"1.1rem"}}>Újoncz</span>
              <span className="wstat-lbl">Rang</span>
            </div>
          </div>

          <button className="wlc-cta" onClick={onEnter}>
            <span className="cta-rune">ᚠ</span>
            <span>Feladatok Megkezdése</span>
            <span className="cta-rune">ᚠ</span>
          </button>

          <div className="wlc-hint">
            15 kaland vár — minden teljesítettért pontot kapsz
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── TASKS SCREEN (placeholder) ───────────────────────────────────────────────
function TasksScreen({user}) {
  const race = RACES.find(r=>r.id===user?.race)||RACES[3];
  const tasks = [
    {num:"I",   icon:"❓", title:"Nagy Kvíz",        desc:"Feleletválasztós kérdések"},
    {num:"II",  icon:"⚖️", title:"Igaz vagy Hamis",  desc:"Állítások a történetről"},
    {num:"III", icon:"📜", title:"Hiányos Szöveg",   desc:"Töltsd ki a hiányzó szavakat"},
    {num:"IV",  icon:"🔤", title:"Szókeverő",        desc:"Tolkieni nevek visszafejtése"},
    {num:"V",   icon:"🔗", title:"Párosítás",        desc:"Karakterek és leírásaik"},
    {num:"VI",  icon:"🗺️", title:"Térkép Kaland",   desc:"Eligazodás Középföldén"},
    {num:"VII", icon:"📋", title:"Helyes Sorrend",   desc:"A fejezetek időrendje"},
    {num:"VIII",icon:"ᚱ",  title:"Rúna Dekódoló",   desc:"Titkos tolkieni üzenet"},
    {num:"IX",  icon:"🔮", title:"Jóslat Döntő",     desc:"Te vagy Gandalf — mit tennél?"},
    {num:"X",   icon:"🐾", title:"Útvonaltervező",   desc:"Rajzold be Bilbo útját"},
    {num:"XI",  icon:"💬", title:"Ki Mondta?",       desc:"Idézetek és karakterek"},
    {num:"XII", icon:"💪", title:"Erő Mérleg",       desc:"Rangsorold a karaktereket"},
    {num:"XIII",icon:"🗡️", title:"Tárgy Rejtély",   desc:"Melyik jelenetből való?"},
    {num:"XIV", icon:"📖", title:"Fejezet Mozaik",   desc:"Mondatokból fejezet"},
    {num:"XV",  icon:"🎲", title:"Sors Kockája",     desc:"Random kihívás generátor"},
  ];
  const [hov, setHov] = useState(null);

  return (
    <div className="tasks-root">
      {/* Sticky header */}
      <header className="tasks-hdr">
        <div className="tasks-logo">
          <span style={{color:"var(--gold)",fontFamily:"serif",opacity:0.5}}>ᚠ</span>
          <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",letterSpacing:"0.05em"}}>A HOBBIT</span>
          <span style={{color:"var(--gold)",fontFamily:"serif",opacity:0.5}}>ᚠ</span>
        </div>
        <div className="tasks-user">
          <span style={{fontSize:"1.1rem"}}>{race.icon}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.8rem",color:"var(--text)"}}>{user?.adventureName}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.75rem",color:"var(--gold)",padding:"2px 9px",border:"1px solid rgba(201,168,76,0.28)",background:"rgba(201,168,76,0.05)"}}>0 pt</span>
        </div>
      </header>

      {/* Hero */}
      <div className="tasks-hero">
        <div className="hero-rings">
          {[220,310,400].map((s,i)=><div key={i} className="hero-ring" style={{width:s,height:s,animationDuration:`${10+i*4}s`,animationDirection:i%2?"reverse":"normal"}}/>)}
        </div>
        <h2 className="tasks-hero-title">A Nagy Kaland Vár</h2>
        <p className="tasks-hero-sub">15 kihívás — Teljesítsd mind, és Középföld mestere leszel</p>
        <div className="tasks-progbar">
          <div className="tasks-progfill" style={{width:"0%"}}/>
          <span className="tasks-proglbl">0 / 15 teljesítve</span>
        </div>
      </div>

      {/* Grid */}
      <div className="tasks-grid">
        {tasks.map((t,i)=>(
          <div key={i} className={`task-tile ${hov===i?"tile-hov":""}`}
            style={{animationDelay:`${i*.05}s`}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div className="tile-num">{t.num}</div>
            <div className="tile-icon">{t.icon}</div>
            <div className="tile-title">{t.title}</div>
            <div className="tile-desc">{t.desc}</div>
            <div className="tile-lock">🔒 <small>Hamarosan</small></div>
            <div className="tile-glow"/>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",padding:"20px 16px 30px",fontFamily:"'Cinzel',serif",fontSize:"0.78rem",color:"rgba(201,168,76,0.3)",letterSpacing:"0.1em",borderTop:"1px solid rgba(201,168,76,0.08)",marginTop:10}}>
        ⚔️ Social Feed & Online Társas — <em style={{fontFamily:"'EB Garamond',serif"}}>Hamarosan</em> ⚔️
      </div>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

:root{
  --bg:#080604; --gold:#C9A84C; --gold-bright:#E8C96A; --gold-muted:#7A6030;
  --text:#D4C4A0; --text-dim:#6A5A40; --border:rgba(201,168,76,0.18);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);}

.root{min-height:100vh;background:radial-gradient(ellipse at 18% 18%,rgba(120,30,30,0.07) 0%,transparent 55%),radial-gradient(ellipse at 82% 82%,rgba(60,35,110,0.06) 0%,transparent 55%),radial-gradient(ellipse at 50% 50%,rgba(18,14,10,0.95) 0%,var(--bg) 100%);font-family:'EB Garamond',serif;color:var(--text);position:relative;overflow-x:hidden;}
.canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;}
.noise{position:fixed;inset:0;z-index:1;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E");opacity:0.45;}
.amb{position:fixed;border-radius:50%;pointer-events:none;z-index:2;}
.amb1{width:550px;height:550px;top:-180px;left:-180px;background:radial-gradient(circle,rgba(139,26,26,0.055) 0%,transparent 70%);animation:ambF1 20s ease-in-out infinite;}
.amb2{width:650px;height:650px;bottom:-200px;right:-200px;background:radial-gradient(circle,rgba(60,35,120,0.045) 0%,transparent 70%);animation:ambF2 26s ease-in-out infinite;}
@keyframes ambF1{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,18px)}}
@keyframes ambF2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,-25px)}}
@keyframes runeFlicker{0%,100%{opacity:inherit}50%{opacity:0.05}}

/* ── AUTH ── */
.page{position:relative;z-index:10;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px 16px 32px;}
.card{width:100%;max-width:530px;background:linear-gradient(162deg,rgba(22,17,13,0.97),rgba(10,8,6,0.98));border:1px solid var(--border);box-shadow:0 0 0 1px rgba(201,168,76,0.04),0 50px 120px rgba(0,0,0,0.75),inset 0 1px 0 rgba(201,168,76,0.07);overflow:hidden;}
.card-head{background:linear-gradient(180deg,rgba(201,168,76,0.05),transparent);border-bottom:1px solid rgba(201,168,76,0.12);padding:16px 20px 12px;text-align:center;}
.head-emblem{position:relative;width:60px;height:60px;margin:10px auto 10px;display:flex;align-items:center;justify-content:center;}
.em-ring{position:absolute;border-radius:50%;border:1px solid rgba(201,168,76,0.16);}
.em-r1{width:58px;height:58px;animation:spinR 14s linear infinite;}
.em-r2{width:44px;height:44px;animation:spinR 9s linear infinite reverse;}
.em-r3{width:30px;height:30px;animation:spinR 6s linear infinite;border-color:rgba(201,168,76,0.09);}
@keyframes spinR{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.em-icon{font-size:1.5rem;position:relative;z-index:1;animation:emFl 4s ease-in-out infinite;}
@keyframes emFl{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.head-title{font-family:'Cinzel Decorative',serif;font-size:clamp(0.95rem,4vw,1.4rem);font-weight:700;color:var(--gold);letter-spacing:0.04em;text-shadow:0 0 28px rgba(201,168,76,0.3);}
.head-sub{color:var(--text-dim);font-style:italic;font-size:0.82rem;margin-top:3px;}

.tabs{display:flex;border-bottom:1px solid rgba(201,168,76,0.12);}
.tab-btn{flex:1;padding:12px 16px;background:transparent;border:none;border-bottom:2px solid transparent;color:var(--text-dim);font-family:'Cinzel',serif;font-size:0.73rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.tab-rune{font-family:serif;font-size:1rem;opacity:0.35;transition:opacity 0.2s;}
.tab-btn:hover{color:var(--text);background:rgba(201,168,76,0.03);}
.tab-on{color:var(--gold)!important;border-bottom-color:var(--gold)!important;background:rgba(201,168,76,0.04)!important;}
.tab-on .tab-rune{opacity:0.65!important;}
.card-body{padding:20px 24px 6px;}
.tab-anim{animation:tabIn 0.3s ease both;}
@keyframes tabIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes slideInR{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}
@keyframes slideInL{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}

.form-wrap{display:flex;flex-direction:column;gap:14px;}
.form-title{font-family:'Cinzel',serif;font-size:0.78rem;letter-spacing:0.08em;color:var(--gold-muted);text-transform:uppercase;display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(201,168,76,0.08);}
.form-rune{font-size:1.1rem;color:var(--gold);opacity:0.5;animation:runeFlicker 3s ease-in-out infinite;}
.fields{display:flex;flex-direction:column;gap:12px;}
.iw{position:relative;}
.inp{width:100%;background:rgba(255,255,255,0.02);border:none;border-bottom:1.5px solid rgba(201,168,76,0.2);border-left:1px solid rgba(201,168,76,0.06);color:var(--text);padding:10px 12px;font-family:'EB Garamond',serif;font-size:0.96rem;outline:none;transition:all 0.25s;letter-spacing:0.02em;}
.inp:focus{border-bottom-color:var(--gold);border-left-color:rgba(201,168,76,0.26);background:rgba(201,168,76,0.035);box-shadow:0 2px 16px rgba(201,168,76,0.07);}
.inp::placeholder{color:rgba(106,90,64,0.42);font-style:italic;}
.inp-e{border-bottom-color:rgba(229,57,53,0.52)!important;background:rgba(183,28,28,0.035)!important;}
.icheck{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#66BB6A;font-size:0.8rem;animation:popIn 0.3s ease;}
@keyframes popIn{from{opacity:0;transform:translateY(-50%) scale(0.4)}to{opacity:1;transform:translateY(-50%) scale(1)}}
.eye{position:absolute;right:9px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gold-muted);font-size:0.86rem;padding:2px;line-height:1;}
@keyframes errShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}60%{transform:translateX(5px)}}

.race-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:10px;}
@media(max-width:420px){.race-grid{grid-template-columns:repeat(3,1fr);}}
.race-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:12px 4px 8px;background:rgba(255,255,255,0.012);border:1px solid rgba(201,168,76,0.1);cursor:pointer;overflow:hidden;transition:all 0.2s;color:var(--text-dim);font-family:'Cinzel',serif;font-size:0.58rem;letter-spacing:0.06em;text-transform:uppercase;}
.race-card:hover{border-color:rgba(201,168,76,0.32);background:rgba(201,168,76,0.05);transform:translateY(-2px);}
.race-on{border-color:var(--rc)!important;background:rgba(201,168,76,0.07)!important;box-shadow:0 0 20px var(--rg)!important;color:var(--gold)!important;transform:translateY(-3px)!important;}
.rc-rune-bg{position:absolute;top:3px;right:4px;font-size:0.8rem;opacity:0.1;color:var(--gold);font-family:serif;}
.rc-icon{font-size:1.55rem;transition:transform 0.2s;}
.race-card:hover .rc-icon,.race-on .rc-icon{transform:scale(1.12);}
.rc-name{font-size:0.58rem;}
.rc-ring{position:absolute;inset:-1px;border:1.5px solid var(--rc);animation:rcP 1.6s ease-in-out infinite;pointer-events:none;}
@keyframes rcP{0%,100%{opacity:1}50%{opacity:0.3}}
.race-detail{padding:12px 14px;background:linear-gradient(135deg,rgba(201,168,76,0.04),rgba(201,168,76,0.015));border:1px solid rgba(201,168,76,0.13);border-left:2px solid var(--rc);animation:fadeUp 0.32s ease;box-shadow:0 0 16px var(--rg);}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.summary{display:flex;flex-direction:column;align-items:center;gap:9px;padding:2px 0;}
.sum-emblem{width:68px;height:68px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;background:rgba(201,168,76,0.04);box-shadow:0 0 22px rgba(201,168,76,0.1);animation:emFl 4s ease-in-out infinite;}
.sum-name{font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:var(--gold-bright);text-shadow:0 0 18px rgba(201,168,76,0.36);}
.sum-race{font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;}
.sum-div{width:100%;text-align:center;position:relative;color:var(--gold);margin:2px 0;}
.sum-div::before,.sum-div::after{content:'';position:absolute;top:50%;width:42%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.25));}
.sum-div::before{left:0;}.sum-div::after{right:0;background:linear-gradient(270deg,transparent,rgba(201,168,76,0.25));}
.form-foot{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:12px;border-top:1px solid rgba(201,168,76,0.07);gap:10px;}
.btn-back{background:transparent;border:1px solid rgba(201,168,76,0.16);color:var(--text-dim);padding:9px 15px;font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.08em;cursor:pointer;transition:all 0.18s;flex-shrink:0;}
.btn-back:hover{border-color:var(--gold-muted);color:var(--text);}
.btn-submit{width:100%;padding:12px;background:linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.05));border:1px solid rgba(201,168,76,0.44);color:var(--gold-bright);font-family:'Cinzel',serif;font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;box-shadow:0 0 14px rgba(201,168,76,0.06);}
.btn-submit:hover:not(:disabled){background:linear-gradient(135deg,rgba(201,168,76,0.18),rgba(201,168,76,0.08));box-shadow:0 0 28px rgba(201,168,76,0.15);transform:translateY(-1px);}
.btn-submit:disabled{opacity:0.6;cursor:default;}
.btn-loading{animation:btnP 1.2s ease-in-out infinite;}
@keyframes btnP{0%,100%{opacity:1}50%{opacity:0.55}}
.form-switch{text-align:center;padding:8px 0 4px;color:var(--text-dim);font-size:0.83rem;font-style:italic;}
.form-switch button{background:none;border:none;color:var(--gold);cursor:pointer;font-family:'Cinzel',serif;font-size:0.78rem;text-decoration:underline;text-underline-offset:3px;margin-left:4px;}

/* ── WELCOME ── */
.welcome-root{position:relative;z-index:10;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;}

.gate-wrap{position:absolute;inset:0;display:flex;pointer-events:none;z-index:5;}
.gate-panel{flex:1;background:linear-gradient(to bottom,rgba(8,6,4,0.98),rgba(12,9,6,0.98));transition:transform 1.4s cubic-bezier(0.77,0,0.18,1);display:flex;align-items:center;overflow:hidden;}
.gate-left{justify-content:flex-end;padding-right:20px;}
.gate-right{justify-content:flex-start;padding-left:20px;}
.gate-runes{display:flex;flex-direction:column;opacity:0.4;}
.gate-edge{position:absolute;top:0;bottom:0;width:3px;background:linear-gradient(180deg,transparent,var(--gold),transparent);opacity:0.4;}
.gate-left .gate-edge{right:0;}
.gate-open .gate-left{transform:translateX(-100%);}
.gate-open .gate-right{transform:translateX(100%);}

.welcome-content{position:relative;z-index:6;display:flex;flex-direction:column;align-items:center;text-align:center;padding:40px 24px;max-width:580px;gap:20px;}

.rune-orbit{position:relative;width:160px;height:160px;opacity:0;transition:opacity 0.8s ease 0.6s;}
.orbit-visible{opacity:1!important;}
.orbit-ring{position:absolute;inset:0;animation:orbitSpin 18s linear infinite;}
.orbit-r2{animation-duration:12s;animation-direction:reverse;}
.orbit-rune{position:absolute;top:50%;left:50%;font-family:serif;font-size:0.75rem;transform-origin:center;}
.orbit-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0;transition:opacity 0.6s ease 1s;}
.center-pop{opacity:1!important;}
@keyframes orbitSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

.wlc-greet,.wlc-lore,.wlc-bottom{opacity:0;}
.wlc-visible{animation:wlcReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards;}
@keyframes wlcReveal{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}

.wlc-eyebrow{font-family:'Cinzel',serif;font-size:0.72rem;letter-spacing:0.3em;color:var(--gold-muted);text-transform:uppercase;margin-bottom:10px;}
.wlc-title{font-family:'Cinzel Decorative',serif;font-size:clamp(1.8rem,6vw,3rem);color:var(--text);line-height:1.2;text-shadow:0 0 40px rgba(201,168,76,0.15);}
.wlc-name{display:block;font-size:clamp(1.4rem,5vw,2.3rem);}
.wlc-race-badge{display:inline-block;margin-top:12px;padding:5px 18px;border:1px solid;font-family:'Cinzel',serif;font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;background:rgba(0,0,0,0.3);}

.wlc-lore{max-width:460px;font-style:italic;font-size:1.05rem;color:var(--text-dim);line-height:1.75;position:relative;padding:14px 0;}
.lore-border-top,.lore-border-bottom{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent);margin-bottom:12px;}
.lore-border-bottom{margin-top:12px;margin-bottom:0;}

.wlc-bottom{display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;}
.wlc-stats{display:flex;align-items:center;gap:24px;padding:12px 32px;border:1px solid var(--border);background:rgba(201,168,76,0.03);}
.wstat{display:flex;flex-direction:column;align-items:center;gap:2px;}
.wstat-val{font-family:'Cinzel',serif;font-size:1.5rem;color:var(--gold);}
.wstat-lbl{font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:0.12em;color:var(--text-dim);text-transform:uppercase;}
.wstat-sep{width:1px;height:36px;background:var(--border);}
.wlc-cta{display:flex;align-items:center;gap:14px;padding:15px 36px;background:linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.05));border:1px solid rgba(201,168,76,0.5);color:var(--gold-bright);font-family:'Cinzel',serif;font-size:0.95rem;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
.wlc-cta:hover{background:linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.09));box-shadow:0 0 40px rgba(201,168,76,0.22);transform:scale(1.02);}
.cta-rune{font-family:serif;font-size:1.2rem;opacity:0.5;animation:runeFlicker 2.5s ease-in-out infinite;}
.wlc-hint{font-family:'EB Garamond',serif;font-style:italic;font-size:0.82rem;color:var(--text-dim);}

/* ── TASKS ── */
.tasks-root{position:relative;z-index:10;min-height:100vh;}
.tasks-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:rgba(8,6,4,0.9);border-bottom:1px solid var(--border);backdrop-filter:blur(8px);position:sticky;top:0;z-index:50;}
.tasks-logo{display:flex;align-items:center;gap:12px;}
.tasks-user{display:flex;align-items:center;gap:10px;padding:7px 14px;border:1px solid var(--border);background:rgba(201,168,76,0.03);}
.tasks-hero{position:relative;text-align:center;padding:56px 20px 36px;overflow:hidden;}
.hero-rings{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}
.hero-ring{position:absolute;border-radius:50%;border:1px solid rgba(201,168,76,0.07);top:50%;left:50%;transform:translate(-50%,-50%);animation:orbitSpin 12s linear infinite;}
.tasks-hero-title{position:relative;font-family:'Cinzel Decorative',serif;font-size:clamp(1.5rem,5vw,2.6rem);font-weight:700;color:var(--gold);text-shadow:0 0 50px rgba(201,168,76,0.25);margin-bottom:8px;}
.tasks-hero-sub{color:var(--text-dim);font-style:italic;font-size:0.98rem;margin-bottom:22px;}
.tasks-progbar{position:relative;max-width:480px;margin:0 auto;height:5px;background:rgba(255,255,255,0.05);border:1px solid var(--border);}
.tasks-progfill{height:100%;background:linear-gradient(90deg,var(--gold-muted),var(--gold));box-shadow:0 0 10px rgba(201,168,76,0.4);transition:width 0.5s ease;}
.tasks-proglbl{position:absolute;top:10px;left:50%;transform:translateX(-50%);font-family:'Cinzel',serif;font-size:0.68rem;color:var(--text-dim);letter-spacing:0.1em;white-space:nowrap;}
.tasks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;padding:28px 24px;max-width:1080px;margin:0 auto;}
@media(max-width:480px){.tasks-grid{grid-template-columns:repeat(2,1fr);padding:14px;gap:9px;}}
.task-tile{position:relative;padding:18px 14px 14px;background:linear-gradient(135deg,rgba(255,255,255,0.022),rgba(255,255,255,0.01));border:1px solid rgba(201,168,76,0.1);overflow:hidden;transition:all 0.2s;animation:tileIn 0.5s ease backwards;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;cursor:default;}
@keyframes tileIn{from{opacity:0;transform:translateY(18px) scale(0.96)}to{opacity:1;transform:none}}
.tile-hov{border-color:rgba(201,168,76,0.35)!important;background:linear-gradient(135deg,rgba(201,168,76,0.055),rgba(201,168,76,0.02))!important;transform:translateY(-3px)!important;box-shadow:0 8px 28px rgba(0,0,0,0.35),0 0 18px rgba(201,168,76,0.07)!important;}
.tile-num{font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:0.2em;color:var(--gold-muted);text-transform:uppercase;}
.tile-icon{font-size:1.7rem;transition:transform 0.2s;}
.tile-hov .tile-icon{transform:scale(1.14);}
.tile-title{font-family:'Cinzel',serif;font-size:0.76rem;color:var(--text);letter-spacing:0.04em;line-height:1.3;}
.tile-desc{font-size:0.73rem;color:var(--text-dim);font-style:italic;line-height:1.4;}
.tile-lock{margin-top:5px;display:flex;align-items:center;gap:5px;opacity:0.3;font-size:0.75rem;font-family:'Cinzel',serif;letter-spacing:0.06em;color:var(--text-dim);}
.tile-lock small{font-size:0.6rem;}
.tile-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(201,168,76,0.07),transparent 65%);opacity:0;transition:opacity 0.2s;pointer-events:none;}
.tile-hov .tile-glow{opacity:1;}
`;
