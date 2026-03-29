// ── HOBBIT PLATFORM — SOUND & MUSIC SYSTEM ──────────────────────────────────

// ── SFX (pre-loaded Audio elements) ─────────────────────────────────────────
const SFX_FILES={
  click:"/audio/sfx/click.mp3",
  success:"/audio/sfx/success.mp3",
  error:"/audio/sfx/error.mp3",
  dice:"/audio/sfx/dice.mp3",
  achievement:"/audio/sfx/achievement.mp3",
  coin:"/audio/sfx/coin.mp3",
  cardFlip:"/audio/sfx/card-flip.mp3",
  notify:"/audio/sfx/notify.mp3",
};

// Pre-load all SFX into Audio objects
const _sfxCache={};
const _loadSfx=(key)=>{
  if(_sfxCache[key])return _sfxCache[key];
  const url=SFX_FILES[key];
  if(!url)return null;
  const audio=new Audio(url);
  audio.preload="auto";
  audio.volume=0.5;
  _sfxCache[key]=audio;
  return audio;
};
// Eagerly pre-load all
if(typeof window!=="undefined"){Object.keys(SFX_FILES).forEach(_loadSfx);}

const _playSfx=(key,vol)=>{
  if(_muted)return;
  try{
    const orig=_loadSfx(key);
    if(!orig)return;
    // Clone so overlapping plays work
    const a=orig.cloneNode();
    a.volume=vol??0.5;
    a.play().catch(()=>{});
  }catch(e){}
};

// ── MUSIC (background, looped, crossfade) ───────────────────────────────────
const MUSIC_TRACKS={
  theme:"/audio/music/theme.mp3",
  tavern:"/audio/music/tavern.mp3",
  battle:"/audio/music/battle.mp3",
};

let _currentTrack=null;  // "theme"|"tavern"|"battle"|null
let _musicEl=null;        // current <audio> element
let _musicVol=0.25;       // music volume (0–1)
let _fadeInterval=null;

const _fadeOut=(el,dur=800,cb)=>{
  if(!el)return cb?.();
  const step=30;
  const dec=el.volume/(dur/step);
  const id=setInterval(()=>{
    el.volume=Math.max(0,el.volume-dec);
    if(el.volume<=0.01){
      clearInterval(id);
      el.pause();
      el.currentTime=0;
      cb?.();
    }
  },step);
  return id;
};

const _fadeIn=(el,targetVol,dur=1200)=>{
  if(!el)return;
  el.volume=0;
  el.play().catch(()=>{});
  const step=30;
  const inc=targetVol/(dur/step);
  const id=setInterval(()=>{
    el.volume=Math.min(targetVol,el.volume+inc);
    if(el.volume>=targetVol-0.01){
      el.volume=targetVol;
      clearInterval(id);
    }
  },step);
};

const playMusic=(track)=>{
  if(_muted||!MUSIC_TRACKS[track])return;
  if(_currentTrack===track&&_musicEl&&!_musicEl.paused)return; // already playing

  // Fade out current, then fade in new
  if(_fadeInterval)clearInterval(_fadeInterval);
  _fadeInterval=_fadeOut(_musicEl,600,()=>{
    const el=new Audio(MUSIC_TRACKS[track]);
    el.loop=true;
    el.preload="auto";
    _musicEl=el;
    _currentTrack=track;
    _fadeIn(el,_musicVol,1200);
  });
};

const stopMusic=(dur=800)=>{
  if(_fadeInterval)clearInterval(_fadeInterval);
  _fadeInterval=_fadeOut(_musicEl,dur,()=>{
    _musicEl=null;
    _currentTrack=null;
  });
};

const setMusicVolume=(v)=>{
  _musicVol=Math.max(0,Math.min(1,v));
  if(_musicEl&&!_musicEl.paused)_musicEl.volume=_musicVol;
};

const getMusicVolume=()=>_musicVol;
const getCurrentTrack=()=>_currentTrack;

// ── MUTE MANAGEMENT ─────────────────────────────────────────────────────────
let _muted=false;
try{_muted=localStorage.getItem("hobbit_muted")==="true";}catch(e){}

const isMuted=()=>_muted;
const toggleMute=()=>{
  _muted=!_muted;
  try{localStorage.setItem("hobbit_muted",String(_muted));}catch(e){}
  if(_muted){
    // Pause music immediately
    if(_musicEl&&!_musicEl.paused){_musicEl.pause();}
  }else{
    // Resume music if there was a track
    if(_currentTrack&&_musicEl){_musicEl.play().catch(()=>{});}
  }
  return _muted;
};

// ── PUBLIC API ──────────────────────────────────────────────────────────────
// sfx proxy: sfx.click(), sfx.success(), sfx.dice(), etc.
const sfx=new Proxy({},{
  get:(_,key)=>(vol)=>_playSfx(key,vol)
});

export {sfx,isMuted,toggleMute,playMusic,stopMusic,setMusicVolume,getMusicVolume,getCurrentTrack};
