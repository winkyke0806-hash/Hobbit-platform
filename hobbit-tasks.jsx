import { useState, useEffect, useRef, useCallback, Component } from "react";
import { auth } from "./hobbit-app.jsx";
import { signOut } from "firebase/auth";
import BoardGame from "./hobbit-game.jsx";
import { sfx, isMuted, toggleMute, playMusic, stopMusic } from "./hobbit-sounds.jsx";

class ErrorCatch extends Component{constructor(p){super(p);this.state={err:null};}static getDerivedStateFromError(e){return{err:e};}componentDidCatch(e,i){console.error("ProfileTab crash:",e,i);}render(){if(this.state.err)return <div style={{padding:20,color:"#EF9A9A",fontFamily:"monospace",fontSize:".8rem",whiteSpace:"pre-wrap"}}><b>Hiba a profilban:</b><br/>{this.state.err.toString()}<br/>{this.state.err.stack}</div>;return this.props.children;}}

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const RACES = [
  {id:"hobbit",icon:"🧑‍🌾",color:"#6B8C3E"},
  {id:"dwarf", icon:"⛏️", color:"#A0522D"},
  {id:"elf",   icon:"🌿", color:"#3A7A8B"},
  {id:"human", icon:"⚔️", color:"#8B7355"},
  {id:"wizard",icon:"🔮", color:"#7A4ABB"},
];
const RUNES="ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
const RM={A:"ᚨ",B:"ᛒ",C:"ᚲ",D:"ᛞ",E:"ᛖ",F:"ᚠ",G:"ᚷ",H:"ᚺ",I:"ᛁ",J:"ᛃ",K:"ᚲ",L:"ᛚ",M:"ᛗ",N:"ᚾ",O:"ᛟ",P:"ᛈ",R:"ᚱ",S:"ᛊ",T:"ᛏ",U:"ᚢ",V:"ᚢ",W:"ᚹ",X:"ᛉ",Y:"ᛃ",Z:"ᛉ"};
const enc=w=>w.split("").map(c=>RM[c]||c).join("");

// ── ALL 15 TASKS ───────────────────────────────────────────────────────────────
const TASKS=[
  {id:1,num:"I",  type:"quiz",    title:"Bilbo Öröksége",      subtitle:"A Zsákos-domb titkai",         location:"Zsákos-domb",   icon:"🏡",mx:14,my:54,color:"#6B8C3E",glow:"rgba(107,140,62,0.5)",  timeLimit:90, basePoints:100,
   story:"Csendes reggelen Bilbo pipájából füstkarikákat fúj. Kezdjük az elején — mennyit tudsz erről a kis hobbitról?",
   raceStory:{hobbit:"Ismerős illat — pipafüst és meleg kenyér. Pontosan mint a te otthonodon...",dwarf:"Puha falak, alacsony mennyezet. De a tudásuk hasznos — különösen most.",elf:"A hobbitoknál töltött idő mindig tanulságos. Apró lények, nagy történetek.",human:"Egy egyszerű lyuk a földben — mégis innen indult az egyik legnagyobb kaland.",wizard:"Gandalf maga sem tudott mindent a hobbitokról. De te megpróbálhatod..."},
   data:{questions:[
     {q:"Mi Bilbo ajtajának a színe?",opts:["Kék","Zöld","Piros","Fekete"],ok:1,hint:"Mint a Shire friss mezői..."},
     {q:"Hány törpe látogatta meg Bilbót?",opts:["11","13","12","15"],ok:1,hint:"Thorin + tizenkét társ"},
     {q:"Mire volt szükség Bilbo beleegyezéséhez?",opts:["Aranyra","Szerződésre","Kardra","Varázslatokra"],ok:1,hint:"Papírra vetett, hivatalos dokumentum"},
     {q:"Minek nevezte Gandalf Bilbót a törpék szerződésében?",opts:["Betörőnek","Varázslónak","Kalauznak","Harcosnak"],ok:0,hint:"Ez a foglalkozás szerepelt a hivatalos szerződésben"},
     {q:"Mit talált Bilbo a trollok barlangjában?",opts:["Aranyat","Pipát","Fullánkot — tündékardot","Térképet"],ok:2,hint:"Kis kék pengéjű tündefegyver, amit Fullánknak nevezett el"},
   ]}},
  {id:2,num:"II", type:"truefalse",title:"Legenda vagy Hazugság",subtitle:"Igazságok Középföldéről",      location:"Rivendell",     icon:"🏰",mx:33,my:28,color:"#3A7A8B",glow:"rgba(58,122,139,0.5)",  timeLimit:75, basePoints:100,
   story:"A tünde-völgyben az igazság és a legenda keveredik. Döntsd el melyik állítás igaz és melyik hamis!",
   raceStory:{hobbit:"Néhány ezek közül talán ismős — de vigyázz, a részletek csapdát rejtenek!",dwarf:"A mi néptörténetünkben minden szónak súlya van. Hazugság itt nem marad rejtve.",elf:"Mi hosszú emlékezetünkkel mindent megőrzünk. Hallgatásból is tudunk igazat.",human:"Az emberi bátorság abban rejlik, hogy a kényes igazságokat is ki merjük mondani.",wizard:"A bölcsesség kezdete felismerni, mit nem tudunk. Most teszteld a tudásodat!"},
   data:{statements:[
     {s:"Gandalf varázsló volt, mielőtt Középföldére jött.",         ok:true,  exp:"Gandalf Maia — isteni lény, akit Középföldére küldtek."},
     {s:"Bilbo soha nem talált Gyűrűt az útja során.",               ok:false, exp:"Bilbo megtalálta Az Egy Gyűrűt Gollam barlangjában!"},
     {s:"Tölgypajzsos Thorin Erebor jogos örökös törpe királya volt.",       ok:true,  exp:"Tölgypajzsos Thorin valóban a jogos örökös és király volt — Smaug elűzte, de ez nem változtat ezen."},
     {s:"A trollok napfényre érve kővé válnak.",                     ok:true,  exp:"Bert, Tom és William is így járt hajnalban."},
     {s:"Smaug a Magányos Hegyet legyőzte csatában.",               ok:false, exp:"Smaug éjjel, lopva támadta meg Erebort."},
     {s:"Gollam a gyűrűt évszázadokon át rejtegette.",          ok:true,  exp:"Kb. 500 évig őrizte a föld alatt — ő maga sem tudta, hogy Ez Az Egy Gyűrű."},
   ]}},
  {id:3,num:"III",type:"fillblank",title:"Az Elveszett Szavak",    subtitle:"Töltsd ki a hiányzó részt!",   location:"Bakacsinerdő",      icon:"🌲",mx:58,my:36,color:"#5A7A2E",glow:"rgba(90,122,46,0.5)",  timeLimit:100,basePoints:120,
   story:"A sötét erdőben az ős-szövegek töredeztek. Pótold a hiányzó szavakat a tolkieni mondatokban!",
   raceStory:{hobbit:"Bilbo maga is mondta ezeket — jól figyeltél a regény olvasásakor?",dwarf:"A szavak éppoly élesek, mint egy csatabárd. Töltsd ki helyesen!",elf:"Mi minden szót megőrzünk az emlékezetünkben. A te próbád most következik.",human:"Az ember emlékezete véges — de a lényeg megmarad. Próbáld meg!",wizard:"A varázsló szavai soha nem véletlenek. Figyeld a kontextust!"},
   data:{sentences:[
     {before:'Bilbo azt mondta: Jó reggelt! — kérdezte',after:', mit ért rajta egyáltalán?',word:"Gandalf",opts:["Gandalf","Thorin","Balin","Gloin"]},
     {before:"Az úton nem megy minden",after:"— tartotta Thorin.",word:"simán",opts:["simán","gyorsan","könnyen","jól"]},
     {before:"Bilbo érezte, hogy valami",after:"csúszik az ujjára — és láthatatlanná vált.",word:"hideg",opts:["hideg","forró","arany","nehéz"]},
     {before:"„Drágaságom... az én egyetlen",after:'... — suttogta Gollam.',word:"drágaságom",opts:["drágaságom","kincsem","gyűrűm","szerelmem"]},
     {before:"Smaug",after:"volt a legnagyobb és legkegyetlenebb sárkány a maga korában.",word:"Glaurung",opts:["Glaurung","Ancalagon","Túlságosan","Kétségkívül"]},
   ]}},
  {id:4,num:"IV", type:"match",   title:"Karakterek és Titkok",   subtitle:"Párosítsd össze a leírásokat!",  location:"Goblin város",  icon:"👺",mx:22,my:42,color:"#7A5020",glow:"rgba(122,80,32,0.5)",  timeLimit:90, basePoints:120,
   story:"A Goblin-városban rejtélyes listák kerültek elő. Ki kicsoda Középföldén? Párosítsd a karaktert a leírásával!",
   raceStory:{hobbit:"Néhány arcot talán ismersz — de vigyázz, a goblinok összekeverték a lapokat!",dwarf:"A mi néptörténetünk fontos neveket tartalmaz. Ismerd meg őket mind!",elf:"Hosszú életünk alatt mindannyiukat láttuk már. Most te próbáld azonosítani.",human:"Az ember akkor bölcs, ha felismeri szövetségeseit és ellenségeit egyaránt.",wizard:"Figyelj a jellemzőkre — minden szereplő egyedi nyomot hagy."},
   data:{pairs:[
     {char:"Gandalf",   desc:"Szürke vándor varázsló, a kaland elindítója"},
     {char:"Gollam",    desc:"Barlangban élő, gyűrűjét őrző nyomorult lény"},
     {char:"Beorn",     desc:"Medve-ember, aki segítette a törpéket"},
     {char:"Elrond",    desc:"Rivendell tünde ura, a térképet elolvasta"},
     {char:"Bard",      desc:"Tóváros íjásza, aki végül megölte Smaugot"},
     {char:"Smaug",     desc:"Vörös-arany sárkány, Erebor foglalója"},
   ]}},
  {id:5,num:"V",  type:"order",   title:"Az Út Állomásai",        subtitle:"Rendezd sorba az eseményeket!",  location:"Carrock",       icon:"🪨",mx:42,my:48,color:"#8B7355",glow:"rgba(139,115,85,0.5)", timeLimit:110,basePoints:130,
   story:"Beorn sziklájáról belátni az egész utat. De az eseményeket összekeverték a szelek — állítsd helyre a helyes sorrendet!",
   raceStory:{hobbit:"Bilbo mindezt mind átélte — te emlékszel a sorrendre?",dwarf:"A csaták és kalandok sorrendje döntő fontosságú a stratégiában.",elf:"Az időrend a történelem alapja. Ismerd és tiszteld az eseményeket.",human:"A múlt leckéit csak akkor tanulhatjuk, ha tudjuk, mi következett mi után.",wizard:"Minden esemény az előzőből fakad. A sorrend feltárja az összefüggést."},
   data:{events:[
       "Bilbo és a törpék elhagyják Zsákos-dombot",
       "A trollok elfogják a törpéket",
       "Bilbo megtalálja a Gyűrűt Gollam barlangjában",
       "Bakacsinerdő sötét erdején átkelnek",
       "A törpék fogságba esnek a tündéknél",
       "Smaug meghal Bard nyilától",
       "Az Öt Sereg Csatája lezajlik",
   ]}},
  {id:6,num:"VI", type:"rune",    title:"Az Elveszett Üzenet",    subtitle:"Thorin rúnás titkosírása",       location:"Denevér-öböl",  icon:"🦇",mx:66,my:30,color:"#8B6030",glow:"rgba(139,96,48,0.5)",  timeLimit:120,basePoints:150,
   story:"Thorin Tölgypajzs kőbe vésett üzenete rúnákban rejtőzik. Fejtsd meg!",
   raceStory:{hobbit:"Rúnák? Bilbo sem tudta eleinte — de megtanulta. Te is megtanulhatod!",dwarf:"A saját őseid írása! Szégyen lenne nem olvasni. Koncentrálj!",elf:"Mi ismerjük ezeket évezredek óta. A te próbád most.",human:"Idegen jelek — de minden rúna egy betű, minden betű egy titok.",wizard:"A rúnák nem hazudnak. Hallgass a formájukra..."},
   data:{puzzles:[
     {word:"EREBOR",  hint:"A törpék elveszett otthona — a Magányos Hegy"},
     {word:"SMAUG",   hint:"A tűzokádó neve, aki elfoglalta a hegyet"},
     {word:"BILBO",   hint:"A mi kis hősünk keresztneve"},
     {word:"GANDALF", hint:"A szürke varázsló, aki mindent elindított"},
     {word:"THORIN",  hint:"A törpe vezér, Oakenshield"},
   ]}},
  {id:7,num:"VII",type:"quote",   title:"Kinek a Szava Ez?",      subtitle:"Középföldé hangjai",             location:"Bakacsinerdő mélyén",icon:"💬",mx:72,my:52,color:"#3A6A2E",glow:"rgba(58,106,46,0.5)", timeLimit:90, basePoints:120,
   story:"Sötét erdőben hangok suttognak. Ki mondta ezeket a szavakat?",
   raceStory:{hobbit:"Ismerős hangok? Talán igen, talán nem. De minden szónak van gazdája.",dwarf:"A szavak éppoly élesek, mint egy csatabárd. Tudd, ki ejtette ki őket.",elf:"Mi minden szót hallottunk, amit itt valaha kimondtak.",human:"A történelem szavakban él. Találd meg a hangjukat.",wizard:"Én is mondtam néhányat ezek közül. Felismered melyeket?"},
   data:{quotes:[
     {text:"„Nem minden arany, ami csillog, nem alszik el minden vándor, aki elvész...",chars:["Gandalf","Bilbo","Thorin","Aragorn"],ok:0},
     {text:"„Drágaságom... az én egyetlen drágaságom...",chars:["Smaug","Gollam","Thorin","Bilbo"],ok:1},
     {text:"„Az arany betegség — aki egyszer megfertőzte magát, nem gyógyul meg könnyen.",chars:["Gandalf","Thorin","Smaug","Elrond"],ok:0},
     {text:"„Ha több ételt hoznál és kevesebbet beszélnél, hálás lennék.",chars:["Thorin","Bilbo","Gloin","Balin"],ok:0},
     {text:"„A legnagyobb kalandok azok, amelyekre nem számítottunk.",chars:["Bilbo","Gandalf","Balin","Thorin"],ok:1},
   ]}},
  {id:8,num:"VIII",type:"scramble",title:"Az Elveszett Nevek",   subtitle:"Thorin társainak rejtvénye",     location:"Magányos Hegy", icon:"⛰️",mx:82,my:22,color:"#A0522D",glow:"rgba(160,82,45,0.5)",  timeLimit:100,basePoints:130,
   story:"A Magányos Hegy kapuja előtt összekevert nevek vésődtek kőbe. Fejtsd meg!",
   raceStory:{hobbit:"Bilbo is összekeveredett volna ezek nélkül. Segíts rendbe tenni!",dwarf:"A saját néped nevei! Szégyen lenne nem ismerni.",elf:"Mi mind ismerjük a törpék nevét — hosszú emlékezetünk van.",human:"Idegen nevek — de a bátraknak mindez tanulható.",wizard:"A névben erő lakozik. Találd meg a helyes sorrendet."},
   data:{words:[
     {letters:["O","R","I","N","H","T"],answer:"THORIN",hint:"A büszke vezér"},
     {letters:["I","N","L","A","B"],    answer:"BALIN", hint:"A bölcs, ősz hajú törpe"},
     {letters:["F","I","L","I"],           answer:"FILI",  hint:"Tölgypajzsos Thorin fiatalabb unokaöccse"},
     {letters:["K","I","L","I"],           answer:"KILI",  hint:"Az íjász testvér"},
     {letters:["G","L","O","I","N"],   answer:"GLOIN", hint:"Gimli apja"},
   ]}},
  {id:9,num:"IX", type:"truefalse",title:"Smaug Titkai",         subtitle:"Igaz vagy hamis a sárkányról?",  location:"Smaug barlangja",icon:"🔥",mx:88,my:40,color:"#B03020",glow:"rgba(176,48,32,0.5)",  timeLimit:70, basePoints:100,
   story:"Smaug barlangja forró arannyal van tele. De az igazságok és legendák is izzanak itt...",
   raceStory:{hobbit:"Smaug félelmetes — de a tudás véd. Döntsd el, mi igaz!",dwarf:"A sárkány elvette az otthonunkat. Ismerd meg jól az ellenséget!",elf:"Mi már Smaug előtt is voltunk. A valóság és a mítosz közt éles a határ.",human:"Bard ismerte Smaug gyengéjét. Te is ismerd meg az igazságot.",wizard:"A bölcsesség: tudni mit tudunk és mit nem. Most tesztelj!"},
   data:{statements:[
     {s:"Smaug képes volt a láthatatlanságra.",                     ok:false,exp:"Smaug nem volt láthatatlan, de ravasz és közeledést érzékelt."},
     {s:"Smaug bal mellkasán volt a sebezhető pontja.",             ok:false,exp:"A jobb mellkasán, ahol egy pikkelye hiányzott."},
     {s:"Smaug évszázadokon át aludt Ereborban.",                   ok:true, exp:"Körülbelül 150 évig aludt az arany felett."},
     {s:"Bard közönséges nyíllal ölte meg Smaugot.",               ok:false,exp:"A Fekete Nyíllal — ősörökölt halálos fegyverével."},
     {s:"Smaug ismerte Bilbo valódi nevét, miután megérezte.",      ok:false,exp:"Bilbo rejtjelekkel mutatkozott be: (Üvegrepesztő) stb."},
   ]}},
  {id:10,num:"X", type:"fillblank",title:"A Sötét Erdő Rejtélye", subtitle:"Bakacsinerdő elveszett mondatai",  location:"Tünde-király udv.",icon:"🍃",mx:74,my:64,color:"#2A6A4A",glow:"rgba(42,106,74,0.5)",  timeLimit:90, basePoints:110,
   story:"A Tünde-király udvarában feliratok töredeztek. Pótold a hiányzó szavakat!",
   raceStory:{hobbit:"Thranduil börtönében Bilbo is elveszett — de te nem fogsz!",dwarf:"A tündék fogvatartottak bennünket. Most mi fogvatartjuk a szavakat.",elf:"Thranduil udvara a mi otthonaink egyike. Jól ismerjük ezeket.",human:"Az erdő mélye veszélyes — de a tudás ösvényt mutat.",wizard:"A varázsló minden helyen olvas. Bakacsinerdőben sem kivétel."},
   data:{sentences:[
     {before:"A tündék",after:"az erdőben éltek, arany és ezüst fényekben.",word:"királyok",opts:["királyok","harcosok","varázslók","bölcsek"]},
     {before:"Bilbo a",after:"segítségével szökött ki a tündék börtönéből.",word:"hordókkal",opts:["hordókkal","gyűrűvel","karddal","térképpel"]},
     {before:"Thranduil a",after:"tünde király volt, Legolas apja.",word:"mirkwoodi",opts:["mirkwoodi","lothlórieni","rivendelli","sötéterdei"]},
     {before:"A pókokat Bilbo",after:"nevezte el, és rettegtek tőle.",word:"Szúrójával",opts:["Szúrójával","hangjával","varázslatával","bátorságával"]},
   ]}},
  {id:11,num:"XI", type:"match",  title:"Fegyverek és Gazdáik",  subtitle:"Ki viselte ezt a fegyvert?",    location:"Fegyverterem",  icon:"⚔️",mx:50,my:20,color:"#707080",glow:"rgba(112,112,128,0.5)", timeLimit:85, basePoints:120,
   story:"A fegyverteremben számos legendás fegyver sorakozik. Párosítsd a fegyvert a gazdájával!",
   raceStory:{hobbit:"Bilbo Szúrója kicsi volt, de pontosan illett hozzá.",dwarf:"A mi fegyvereink ismertek — de a többieket is tudnod kell.",elf:"A tünde fegyverek saját fénnyel ragyognak. Ismerd fel gazdáikat.",human:"Bard nyila örök — de a többi fegyvert is meg kell ismerned.",wizard:"A hatalom nem csak varázslatban rejlik. Minden fegyvernek gazdája van."},
   data:{pairs:[
     {char:"Bilbo",  desc:"Szúró — a kis tünde tőr"},
     {char:"Gandalf",desc:"Glamdring — az Ellenség szétverője"},
     {char:"Thorin", desc:"Orcrist — a Goblinhasító"},
     {char:"Bard",   desc:"Fekete Nyíl — az örökölt végzet"},
     {char:"Elrond", desc:"Hadhafang — az ősök fegyvere"},
     {char:"Legolas",desc:"Hosszú íj és fehér kések"},
   ]}},
  {id:12,num:"XII",type:"order",  title:"A Csata Menete",        subtitle:"Az Öt Sereg sorba rendezve",    location:"Csatamező",     icon:"🏴",mx:62,my:76,color:"#6A3030",glow:"rgba(106,48,48,0.5)",  timeLimit:100,basePoints:130,
   story:"Az Öt Sereg Csatája kaotikus volt. Rendezd sorba az eseményeket!",
   raceStory:{hobbit:"Bilbo eszméletét vesztette a csata elején — de te emlékszel?",dwarf:"A mi dicsőséges csatánk — minden részletét emlékezd meg!",elf:"Mi jelen voltunk. Az eseményeket pontosan ismerjük.",human:"Bard vezette az embereket. Tiszteld az áldozatukat.",wizard:"Gandalf késve érkezett — de épp időben. Emlékszel, mikor?"},
   data:{events:[
     "A törpék megtagadják az arany megosztását",
     "Tünde és emberi seregek vonulnak Erebor felé",
     "A goblinok és farkasok megtámadják mindenkit",
     "Beorn medve-alakban lecsap a csatára",
     "Thorin kirohan Fili-vel és Kili-vel",
     "Thorin halálos sebet kap",
     "Thorin megbékél Bilbóval a halála előtt",
   ]}},
  {id:13,num:"XIII",type:"quiz",  title:"A Gyűrű Rejtélye",      subtitle:"Az Egy Gyűrű titkai",           location:"Gollam barlangja",icon:"💍",mx:30,my:68,color:"#9A8020",glow:"rgba(154,128,32,0.5)", timeLimit:80, basePoints:110,
   story:"Gollam barlangjában a Gyűrű vár. De mennyit tudsz Az Egy Gyűrűről?",
   raceStory:{hobbit:"Bilbo megtalálta — te megismered?",dwarf:"Az arany minket illet — de ez az arany más. Ismerd meg!",elf:"Mi régóta sejtettük a Gyűrű erejét. Most teszteld a tudásodat!",human:"A Gyűrű végig kíséri a történetet. Figyelj a részletekre!",wizard:"Gandalf sokáig vizsgálta. Vajon te is felismernéd?"},
   data:{questions:[
     {q:"Mit csinál a Gyűrű viselőjével?",opts:["Repülővé teszi","Láthatatlanná teszi","Erőssé teszi","Gazdaggá teszi"],ok:1,hint:"Bilbo is tapasztalta a Zsákhegyi bulira indulva..."},
     {q:"Hol találta Bilbo a Gyűrűt?",opts:["A trollok barlangjában","A goblin alagutakban","A folyóban","Bakacsinerdőben"],ok:1,hint:"Gollam közelében, sötét helyen"},
     {q:"Mi Gollam valódi neve?",opts:["Goblin","Sméagol","Déagol","Mordok"],ok:1,hint:"Hajdanán a Folyósnép tagja volt"},
     {q:"Mennyi ideig volt Golamnál a Gyűrű?",opts:["kb. 50 évig","kb. 500 évig","kb. 5 évig","kb. 5000 évig"],ok:1,hint:"Öt évszázad a föld alatt..."},
   ]}},
  {id:14,num:"XIV",type:"scramble",title:"A Törpék Dala",        subtitle:"Rendezd helyre a neveket!",      location:"Zsákos-domb 2.", icon:"🎵",mx:20,my:76,color:"#6050A0",glow:"rgba(96,80,160,0.5)", timeLimit:110,basePoints:130,
   story:"Thorin társai éneke betöltötte Zsákos-dom-bot. De ki volt ki köztük? Fejtsd meg a neveket!",
   raceStory:{hobbit:"Mind a tizenkét törpe eljött az estére. Te emlékszel mindegyikükre?",dwarf:"A saját testvéreid, rokonaid! Ne feledd a nevüket!",elf:"Mi nem kedveltük a törpéket mindig — de nevüket ismerjük.",human:"A törpe nevek idegenek — de a bátorság megismeri az összes szövetségest.",wizard:"Gandalf meghívta mindet. Nekem mind ismerős — de neked?"},
   data:{words:[
     {letters:["B","I","F","U","R"], answer:"BIFUR",  hint:"Az egyik Zs-netes rokon"},
     {letters:["F","U","R","B","O"], answer:"BOFUR",  hint:"A vidám, hegedűs törpe"},
     {letters:["B","O","M","B","U","R"], answer:"BOMBUR", hint:"A legkövérebb, álmos törpe"},
     {letters:["R","O","I","D"],     answer:"DORI",   hint:"Az erős, kicsit zsörtölődős"},
     {letters:["I","R","O","N"],     answer:"NORI",   hint:"A tolvaj hírű törpe"},
   ]}},
  {id:15,num:"XV", type:"prophecy",title:"Gandalf Döntése",      subtitle:"Te vagy az öreg varázsló",       location:"Dol Guldur",    icon:"🔮",mx:48,my:82,color:"#7A4ABB",glow:"rgba(122,74,187,0.5)", timeLimit:0,  basePoints:200,
   story:"Dol Guldurban sötétség gyűlik. Te vagy Gandalf — döntéseket kell hoznod, amelyek Középföldé sorsát befolyásolják.",
   raceStory:{hobbit:"Te, egy hobbit, Gandalf bőrében? Talán épp ez a kaland csúcsa!",dwarf:"A varázslók döntései rátok is hatottak. Mit tettél volna Thorin helyett?",elf:"Mi Gandalfot Mithrandir-nak hívjuk. Az ő terhét viseled — légy méltó.",human:"Gondor függ Gandalf döntéseitől. Emberi bátorság és varázsló-bölcsesség.",wizard:"Ez a te valódi próbád. Mit választ egy igazi varázsló?"},
   data:{tree:{
     q:"Dol Guldur kapuja előtt állsz. Sötétséget érzesz belülről. Mit teszel?",
     opts:[
       {label:"Bemegyek egyedül felderíteni",icon:"🗡️",
        q2:"Belül Thráint találod — Thorin apját — börtönben. Átadhatja Erebor kulcsát. De az Árnyék is közel van...",
        opts2:[{label:"Kiszabadítom Thráint, bármi áron",pts:200,good:true,result:"Thráin szabad! Átadja a kulcsot. Erebor útja megnyílt. ⚔️ +200 pont"},{label:"Visszavonulok — túl nagy a kockázat",pts:80,good:false,result:"Thráin elveszett, de te életben maradtál. 🛡️ +80 pont"}]},
       {label:"Küldöm Radagastot hírszerzésre",icon:"🦅",
        q2:"Radagast visszatér: Sauron ereje valóban növekszik. A Fehér Tanács összehívható...",
        opts2:[{label:"Összehívom a Fehér Tanácsot azonnal",pts:180,good:true,result:"A Fehér Tanács elűzi Sauront! ✨ +180 pont"},{label:"Egyedül rohanok be, míg gyenge",pts:60,good:false,result:"Megsebesülsz, visszavonulsz. 💥 +60 pont"}]},
       {label:"Elkerülöm és figyelmeztetek másokat",icon:"📜",
        q2:"Rivendellbe sietsz. Elrond meghallgat, de Saruman kétkedik. Bizonyíték nélkül nem cselekszenek.",
        opts2:[{label:"Bizonyítékot szerzek, visszamegyek",pts:190,good:true,result:"A bizonyíték meggyőz mindenkit! 🌟 +190 pont"},{label:"A tanács nélkül cselekszem",pts:70,good:false,result:"Önfejű döntés. Egyedül nehéz. 🎭 +70 pont"}]},
     ]
   }}},
];

// ── MAP PATHS ──────────────────────────────────────────────────────────────────
// ── REGIONS ───────────────────────────────────────────────────────────────────
const REGIONS=[
  {id:"shire",name:"Zsákos-domb",color:"#6B8C3E",glow:"rgba(107,140,62,0.4)",icon:"🏡",tasks:[1,2,3],nodes:[{x:10,y:62},{x:18,y:72},{x:12,y:80}],label:{x:15,y:53},terrain:"hills"},
  {id:"rivendell",name:"Völgyzugoly",color:"#3A7A8B",glow:"rgba(58,122,139,0.4)",icon:"🏰",tasks:[4,5,6],nodes:[{x:28,y:32},{x:36,y:40},{x:30,y:48}],label:{x:32,y:24},terrain:"valley"},
  {id:"mirkwood",name:"Bakacsinerdő",color:"#5A7A2E",glow:"rgba(90,122,46,0.4)",icon:"🌲",tasks:[7,8,9],nodes:[{x:50,y:52},{x:56,y:60},{x:52,y:68}],label:{x:53,y:44},terrain:"forest"},
  {id:"mountains",name:"Ködös Hegyek",color:"#8B7355",glow:"rgba(139,115,85,0.4)",icon:"⛰️",tasks:[10,11,12],nodes:[{x:70,y:24},{x:77,y:32},{x:73,y:40}],label:{x:74,y:16},terrain:"mountains"},
  {id:"erebor",name:"Magányos Hegy",color:"#A0522D",glow:"rgba(160,82,45,0.4)",icon:"🏔️",tasks:[13,14,15],nodes:[{x:86,y:42},{x:92,y:52},{x:88,y:60}],label:{x:89,y:34},terrain:"mountain"},
];
function isRegionUnlocked(regionIdx,completed){
  if(regionIdx===0)return true;
  const prev=REGIONS[regionIdx-1];
  const doneCount=prev.tasks.filter(t=>completed.includes(t)).length;
  return doneCount>=2;
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────────────────
const ACHIEVEMENTS=[
  {id:"first_blood",icon:"🗡️",name:"Első Vér",desc:"Teljesítsd az első feladatot",check:s=>s.completed>=1,progress:s=>({current:Math.min(s.completed,1),target:1})},
  {id:"mountaineer",icon:"🏔️",name:"Hegymászó",desc:"Teljesíts 5 feladatot",check:s=>s.completed>=5,progress:s=>({current:Math.min(s.completed,5),target:5})},
  {id:"ring_bearer",icon:"💍",name:"Gyűrű Hordozó",desc:"Teljesíts 10 feladatot",check:s=>s.completed>=10,progress:s=>({current:Math.min(s.completed,10),target:10})},
  {id:"dragon_slayer",icon:"🐉",name:"Sárkányölő",desc:"Mind a 15 feladat teljesítve",check:s=>s.completed>=15,progress:s=>({current:Math.min(s.completed,15),target:15})},
  {id:"thousand",icon:"⭐",name:"Ezer Pont",desc:"Gyűjts össze 1000 pontot",check:s=>s.score>=1000,progress:s=>({current:Math.min(s.score,1000),target:1000})},
  {id:"gold_rank",icon:"✨",name:"Arany Rang",desc:"Gyűjts össze 2000 pontot",check:s=>s.score>=2000,progress:s=>({current:Math.min(s.score,2000),target:2000})},
  {id:"legendary",icon:"🌟",name:"Legendás",desc:"Gyűjts össze 2500 pontot",check:s=>s.score>=2500,progress:s=>({current:Math.min(s.score,2500),target:2500})},
  {id:"wizard_friend",icon:"🧙",name:"Varázsló Barát",desc:"Szerezz 1 barátot",check:s=>s.friends>=1,progress:s=>({current:Math.min(s.friends,1),target:1})},
  {id:"alliance",icon:"🤝",name:"Szövetségkötő",desc:"Szerezz 3 barátot",check:s=>s.friends>=3,progress:s=>({current:Math.min(s.friends,3),target:3})},
  {id:"lightning",icon:"⚡",name:"Villámgyors",desc:"Teljesíts egy napi kihívást",check:s=>s.daily>=1},
  {id:"shire_hero",icon:"🏡",name:"A Megye Hőse",desc:"Teljesítsd a Zsákos-domb összes feladatát",check:s=>[1,2,3].every(t=>s.completedIds.includes(t))},
  {id:"erebor_conqueror",icon:"⛰️",name:"Erebor Meghódítója",desc:"Teljesítsd a Magányos Hegy összes feladatát",check:s=>[13,14,15].every(t=>s.completedIds.includes(t))},
  {id:"high_scorer",icon:"🎯",name:"Mesterlövész",desc:"Szerezz 150+ pontot egy feladaton",check:s=>Object.values(s.scores).some(v=>v>=150)},
  {id:"perfectionist",icon:"💎",name:"Perfekcionista",desc:"Teljesíts 5 feladatot 100+ ponttal",check:s=>Object.values(s.scores).filter(v=>v>=100).length>=5,progress:s=>({current:Math.min(Object.values(s.scores).filter(v=>v>=100).length,5),target:5})},
  {id:"half_way",icon:"🛤️",name:"Félúton",desc:"Teljesítsd a feladatok felét",check:s=>s.completed>=8,progress:s=>({current:Math.min(s.completed,8),target:8})},
];
const _getAchievementStats=(completed,scores,friends=0,daily=0)=>({completed:completed.length,completedIds:completed,score:Object.values(scores).reduce((a,b)=>a+b,0),scores,friends,daily});

// ── SHARED UI ──────────────────────────────────────────────────────────────────
function FloatingStones({count=14}){
  const r=useRef(Array.from({length:count},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,w:10+Math.random()*30,h:7+Math.random()*20,vx:(Math.random()-.5)*.012,vy:(Math.random()-.5)*.009,rot:Math.random()*360,vr:(Math.random()-.5)*.022,op:.04+Math.random()*.07,t:i%3})));
  const [,s]=useState(0);
  useEffect(()=>{const id=setInterval(()=>{r.current=r.current.map(s=>({...s,x:((s.x+s.vx)+100)%100,y:((s.y+s.vy)+100)%100,rot:s.rot+s.vr}));s(n=>n+1)},50);return()=>clearInterval(id)},[]);
  const bg=["linear-gradient(140deg,#302820,#18120C)","linear-gradient(140deg,#202A18,#0E1208)","linear-gradient(140deg,#28241A,#120E08)"];
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>{r.current.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.w,height:s.h,opacity:s.op,transform:`rotate(${s.rot}deg)`,background:bg[s.t],borderRadius:"1px",border:".5px solid rgba(201,168,76,.06)"}}/>)}</div>;
}

function useTimer(limit,onExp){
  const [left,setLeft]=useState(limit);
  useEffect(()=>{
    if(!limit)return;
    setLeft(limit);
    const id=setInterval(()=>setLeft(l=>{if(l<=1){clearInterval(id);onExp?.();return 0;}return l-1;}),1000);
    return()=>clearInterval(id);
  },[limit]);
  return{left,pct:limit?(left/limit)*100:100};
}

function TimerBar({left,pct,limit}){
  if(!limit)return null;
  const c=pct>60?"#C9A84C":pct>30?"#F57F17":"#E53935";
  return <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 18px",borderBottom:"1px solid rgba(201,168,76,.1)",background:"rgba(0,0,0,.3)"}}>
    <span style={{color:c}}>⏳</span>
    <div style={{flex:1,height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:c,transition:"width 1s linear",boxShadow:`0 0 8px ${c}88`}}/></div>
    <span style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:c,minWidth:28}}>{left}s</span>
  </div>;
}

function RadialTimer({total,left,size=56}){
  if(!total)return null;
  const pct=left/total;
  const c=pct>.6?"#C9A84C":pct>.3?"#F57F17":"#E53935";
  const r=(size-6)/2;const circ=2*Math.PI*r;const offset=circ*(1-pct);
  return <div role="timer" aria-label={`Hátralévő idő: ${left} másodperc`} style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:size>50?".75rem":".6rem",color:c,fontWeight:600}}>{left}</div>
    {pct<.3&&left>0&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",border:`1px solid ${c}`,opacity:.4,animation:"nodePulse 1.5s ease-in-out infinite"}}/>}
  </div>;
}

function Feedback({good,text,onNext}){
  useEffect(()=>{if(good)sfx.success();else sfx.error();},[]);
  return <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:good?"rgba(8,24,8,.96)":"rgba(24,8,8,.96)",zIndex:20,animation:"fadeIn .3s ease",gap:18,padding:24,textAlign:"center"}}>
    <div style={{fontSize:"3.5rem",animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)"}}>{good?"✨":"💀"}</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,4vw,1.7rem)",color:good?"#66BB6A":"#E53935",textShadow:`0 0 24px ${good?"rgba(102,187,106,.5)":"rgba(229,57,53,.5)"}`}}>{good?"Helyes!":"Nem egészen..."}</div>
    <div style={{fontStyle:"italic",color:"var(--td)",fontSize:".94rem",lineHeight:1.7,maxWidth:360}}>{text}</div>
    <button className="btn-nq" onClick={onNext}>Tovább →</button>
  </div>;
}

function TaskResult({task,score,maxScore,onBack,onRetry,stats}){
  const pct=Math.round((score/maxScore)*100);
  const tier=pct>=80?"🏆 Mester":pct>=60?"⚔️ Hős":pct>=40?"🛡️ Vitéz":"📜 Tanuló";
  const [p,setP]=useState(0);
  const [displayScore,setDisplayScore]=useState(0);
  useEffect(()=>{const t=[setTimeout(()=>setP(1),200),setTimeout(()=>setP(2),900),setTimeout(()=>setP(3),1600)];return()=>t.forEach(clearTimeout)},[]);
  // Animated count-up
  useEffect(()=>{if(p<2)return;let start=0;const dur=1200;const t0=performance.now();const step=(now)=>{const elapsed=now-t0;const progress=Math.min(elapsed/dur,1);const eased=1-Math.pow(1-progress,3);const val=Math.round(eased*score);setDisplayScore(val);if(progress<1)requestAnimationFrame(step);};requestAnimationFrame(step);},[p>=2,score]);
  return <div role="status" aria-label={`Eredmény: ${score} pont a ${maxScore}-ból`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px",textAlign:"center",gap:18}}>
    <div style={{opacity:p>=1?1:0,transition:"all .8s ease",fontSize:"3rem",filter:`drop-shadow(0 0 14px ${task.glow})`}}>{task.icon}</div>
    <div style={{opacity:p>=2?1:0,transition:"all .8s ease .2s"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".25em",color:"var(--gm)",textTransform:"uppercase",marginBottom:6}}>— Feladat Befejezve —</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.4rem,5vw,2.3rem)",color:"var(--gold)",textShadow:"0 0 18px rgba(201,168,76,.3)"}}>{displayScore}<span style={{fontSize:".5em",opacity:.6}}> / {maxScore}</span></div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--gold)",letterSpacing:".1em",marginTop:4,animation:p>=2?"popIn .5s cubic-bezier(.34,1.56,.64,1) 1s both":"none"}}>{tier}</div>
    </div>
    <div style={{opacity:p>=2?1:0,transition:"all .8s .3s",width:"100%",maxWidth:340}}>
      <div style={{height:7,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden",border:"1px solid rgba(201,168,76,.1)"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--gm),var(--gold))",transition:"width 1s ease .5s",borderRadius:3}}/>
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",color:"var(--gm)",letterSpacing:".1em",marginTop:5}}>{pct}% pontosság</div>
    </div>
    {stats&&<div style={{opacity:p>=3?1:0,transition:"all .8s .2s",fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gm)",letterSpacing:".06em",display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
      {stats.correct!=null&&<span>Helyes: <span style={{color:"#66BB6A"}}>{stats.correct}</span></span>}
      {stats.wrong!=null&&<span>· Helytelen: <span style={{color:"#E53935"}}>{stats.wrong}</span></span>}
      {stats.timeUsed!=null&&<span>· Idő: <span style={{color:"var(--gold)"}}>{stats.timeUsed}s</span></span>}
    </div>}
    <div style={{opacity:p>=3?1:0,transition:"all .8s .4s",display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
      {onRetry&&score<maxScore&&<button onClick={onRetry} style={{padding:"9px 20px",background:"rgba(201,168,76,.08)",border:`1px solid ${task.color}`,color:task.color,fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",cursor:"pointer",transition:"all .18s"}}>↻ Újra Próbálom</button>}
      <button className="btn-back-map" onClick={onBack}>← Vissza a Térképre</button>
    </div>
  </div>;
}

function StoryIntro({task,user,onStart}){
  const [p,setP]=useState(0);
  const [typed,setTyped]=useState("");
  const [typeDone,setTypeDone]=useState(false);
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const text=task.raceStory?.[user?.race]||task.story;
  useEffect(()=>{const t=[setTimeout(()=>setP(1),300),setTimeout(()=>setP(2),900)];return()=>t.forEach(clearTimeout)},[]);
  // Typewriter effect for the story text
  useEffect(()=>{
    if(p<2)return;
    let i=0;const id=setInterval(()=>{i++;if(i>=text.length){clearInterval(id);setTypeDone(true);}setTyped(text.slice(0,i));},28);
    return()=>clearInterval(id);
  },[p,text]);
  const skipType=()=>{setTyped(text);setTypeDone(true);};
  return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 24px",textAlign:"center",gap:20}}>
    {/* Cinematic bars */}
    <div style={{position:"absolute",top:0,left:0,right:0,height:28,background:"linear-gradient(180deg,rgba(0,0,0,.7),transparent)",pointerEvents:"none",zIndex:1}}/>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:28,background:"linear-gradient(0deg,rgba(0,0,0,.7),transparent)",pointerEvents:"none",zIndex:1}}/>
    <div style={{opacity:p>=1?1:0,transition:"all .8s ease",fontSize:"3.2rem",filter:`drop-shadow(0 0 18px ${task.glow})`,animation:p>=1?"gentlePop .6s ease both":"none"}}>{task.icon}</div>
    <div style={{opacity:p>=1?1:0,transition:"all .8s ease .2s"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".28em",color:"var(--gm)",textTransform:"uppercase",marginBottom:7}}>— {task.location} —</div>
      <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,4vw,1.8rem)",color:task.color,textShadow:`0 0 28px ${task.glow}`,marginBottom:3}}>{task.title}</h2>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gm)",letterSpacing:".1em"}}>{task.subtitle}</div>
    </div>
    <div onClick={!typeDone?skipType:undefined} style={{opacity:p>=2?1:0,transition:"opacity .8s ease .4s",maxWidth:440,fontStyle:"italic",fontSize:"1rem",color:"var(--td)",lineHeight:1.8,padding:"14px 18px",border:"1px solid rgba(201,168,76,.13)",borderLeft:`3px solid ${task.color}`,background:"rgba(0,0,0,.2)",textAlign:"left",cursor:!typeDone?"pointer":"default",minHeight:60}}>
      <span style={{color:race.color,marginRight:8}}>{race.icon}</span>{typed}{!typeDone&&<span style={{color:task.color,animation:"runeFlicker 1s ease-in-out infinite"}}>|</span>}
    </div>
    <div style={{opacity:typeDone?1:0,transition:"all .5s ease",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
      {task.timeLimit>0&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",letterSpacing:".12em"}}>⏳ {task.timeLimit} MÁSODPERC &nbsp;·&nbsp; 🏆 MAX {task.basePoints} PONT</div>}
      {!task.timeLimit&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",letterSpacing:".12em"}}>🔮 JÓSLAT-KALAND &nbsp;·&nbsp; 🏆 MAX {task.basePoints} PONT</div>}
      <button className="btn-start" onClick={onStart} style={{"--tc":task.color}}>
        <span>ᚠ</span>Kaland Kezdete<span>ᚠ</span>
      </button>
    </div>
  </div>;
}

// ── TASK TYPES ─────────────────────────────────────────────────────────────────
function QuizTask({task,onDone,onRetry}){
  const {questions}=task.data;
  const [qi,setQi]=useState(0);const [sel,setSel]=useState(null);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(0);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perQ=Math.round(task.basePoints/questions.length);
  const pick=(i)=>{if(sel!==null||fb)return;const q=questions[qi];const good=i===q.ok;setSel(i);if(good){setScore(s=>s+perQ+Math.round(left/task.timeLimit*18));setCorrect(c=>c+1);}setFb({good,text:good?`Kiváló! ${q.hint||""}`:`Helyes válasz: „${q.opts[q.ok]}". ${q.hint||""}`});};
  const nextQ=()=>{setSel(null);setFb(null);if(qi+1>=questions.length)setDone(true);else setQi(q=>q+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+questions.length*18} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct,wrong:questions.length-correct,timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  const q=questions[qi];
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"20px 18px",display:"flex",flexDirection:"column",gap:16,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>KÉRDÉS {qi+1}/{questions.length}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(.98rem,3vw,1.2rem)",color:"var(--text)",lineHeight:1.6,padding:"13px 15px",border:"1px solid rgba(201,168,76,.13)",background:"rgba(201,168,76,.03)",minHeight:70}}>{q.q}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {q.opts.map((o,i)=><button key={i} onClick={()=>pick(i)} className={`quiz-opt ${sel===i?(i===q.ok?"opt-ok":"opt-err"):sel!==null&&i===q.ok?"opt-ok":""}`}><span className="opt-l">{["A","B","C","D"][i]}</span>{o}</button>)}
      </div>
    </div>
    {fb&&<Feedback good={fb.good} text={fb.text} onNext={nextQ}/>}
  </div>;
}

function TrueFalseTask({task,onDone,onRetry}){
  const {statements}=task.data;
  const [si,setSi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(0);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perS=Math.round(task.basePoints/statements.length);
  const pick=(v)=>{if(fb)return;const s=statements[si];const good=v===s.ok;if(good){setScore(sc=>sc+perS+Math.round(left/task.timeLimit*16));setCorrect(c=>c+1);}setFb({good,text:good?`Pontosan! ${s.exp}`:`Tévedtél. ${s.exp}`});};
  const next=()=>{setFb(null);if(si+1>=statements.length)setDone(true);else setSi(s=>s+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+statements.length*16} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct,wrong:statements.length-correct,timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  const s=statements[si];
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"20px 18px",display:"flex",flexDirection:"column",gap:20,overflowY:"auto",justifyContent:"center"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>ÁLLÍTÁS {si+1}/{statements.length}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{padding:"22px 18px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.15)",fontStyle:"italic",fontSize:"clamp(.98rem,2.8vw,1.2rem)",color:"var(--text)",lineHeight:1.75,minHeight:80,textAlign:"center"}}>{s.s}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
        <button onClick={()=>pick(true)}  className="tf-btn tf-true"><span style={{fontSize:"1.6rem"}}>✓</span><span>IGAZ</span></button>
        <button onClick={()=>pick(false)} className="tf-btn tf-false"><span style={{fontSize:"1.6rem"}}>✗</span><span>HAMIS</span></button>
      </div>
    </div>
    {fb&&<Feedback good={fb.good} text={fb.text} onNext={next}/>}
  </div>;
}

function FillBlankTask({task,onDone,onRetry}){
  const {sentences}=task.data;
  const [si,setSi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(0);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perS=Math.round(task.basePoints/sentences.length);
  const pick=(o)=>{if(fb)return;const s=sentences[si];const good=o===s.word;if(good){setScore(sc=>sc+perS+Math.round(left/task.timeLimit*20));setCorrect(c=>c+1);}setFb({good,text:good?`Pontosan illik a mondatba!`:`A helyes szó: ${s.word}`});};
  const next=()=>{setFb(null);if(si+1>=sentences.length)setDone(true);else setSi(s=>s+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+sentences.length*20} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct,wrong:sentences.length-correct,timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  const s=sentences[si];
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"20px 18px",display:"flex",flexDirection:"column",gap:18,overflowY:"auto",justifyContent:"center"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>MONDAT {si+1}/{sentences.length}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{padding:"18px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.15)",fontSize:"clamp(.96rem,2.8vw,1.15rem)",color:"var(--text)",lineHeight:1.8}}>
        {s.before} <span style={{display:"inline-block",minWidth:80,borderBottom:"2px solid var(--gold)",textAlign:"center",color:"var(--gold)",padding:"0 8px",fontStyle:"italic"}}>_____</span> {s.after}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {s.opts.map((o,i)=><button key={i} onClick={()=>pick(o)} className="fill-opt">{o}</button>)}
      </div>
    </div>
    {fb&&<Feedback good={fb.good} text={fb.text} onNext={next}/>}
  </div>;
}

function MatchTask({task,onDone,onRetry}){
  const {pairs}=task.data;
  const [score,setScore]=useState(0);const [done,setDone]=useState(false);
  const [selChar,setSelChar]=useState(null);const [matched,setMatched]=useState([]);const [wrong,setWrong]=useState(null);const [wrongCount,setWrongCount]=useState(0);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const chars=[...pairs].map(p=>p.char).sort(()=>Math.random()-.5);
  const descs=[...pairs].map(p=>p.desc).sort(()=>Math.random()-.5);
  const perP=Math.round(task.basePoints/pairs.length);
  const pickDesc=(desc)=>{
    if(!selChar||matched.find(m=>m.desc===desc))return;
    const pair=pairs.find(p=>p.char===selChar);
    if(pair.desc===desc){setScore(s=>s+perP+Math.round(left/task.timeLimit*15));setMatched(m=>[...m,{char:selChar,desc}]);setSelChar(null);if(matched.length+1>=pairs.length)setTimeout(()=>setDone(true),600);}
    else{setWrong({char:selChar,desc});setWrongCount(w=>w+1);setTimeout(()=>setWrong(null),700);setSelChar(null);}
  };
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+pairs.length*15} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct:matched.length,wrong:wrongCount,timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"16px 14px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>PÁROSÍTÁS — válassz karaktert, majd leírást</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {chars.map(c=>{const isDone=matched.find(m=>m.char===c);return <button key={c} onClick={()=>!isDone&&setSelChar(c)} className={`match-char ${selChar===c?"match-sel":""} ${isDone?"match-done":""} ${wrong?.char===c?"match-err":""}`}>{c}</button>;})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {descs.map(d=>{const isDone=matched.find(m=>m.desc===d);return <button key={d} onClick={()=>pickDesc(d)} className={`match-desc ${isDone?"match-done":""} ${wrong?.desc===d?"match-err":""}`}>{d}</button>;})}
        </div>
      </div>
    </div>
  </div>;
}

function OrderTask({task,onDone,onRetry}){
  const {events}=task.data;
  const [order,setOrder]=useState(()=>[...events].sort(()=>Math.random()-.5));
  const [submitted,setSubmitted]=useState(false);const [score,setScore]=useState(0);const [done,setDone]=useState(false);
  const [drag,setDrag]=useState(null);
  const {left,pct}=useTimer(task.timeLimit,()=>check());
  const move=(i,dir)=>{if(submitted)return;const a=[...order];const j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setOrder(a);};
  const check=()=>{
    let correct=0;order.forEach((e,i)=>{if(e===events[i])correct++;});
    const s=Math.round((correct/events.length)*task.basePoints)+Math.round(left/(task.timeLimit||1)*30);
    setScore(Math.min(s,task.basePoints+30));setSubmitted(true);setTimeout(()=>setDone(true),2000);
  };
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+30} onBack={()=>onDone(score)} onRetry={onRetry} stats={{timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>Rendezd helyes sorrendbe — ↑↓ gombokkal</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {order.map((e,i)=>{
          const correct=submitted&&e===events[i];const wrong2=submitted&&e!==events[i];
          return <div key={e} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:correct?"rgba(102,187,106,.08)":wrong2?"rgba(229,57,53,.08)":"rgba(255,255,255,.02)",border:`1px solid ${correct?"#66BB6A":wrong2?"#E53935":"rgba(201,168,76,.14)"}`,transition:"all .3s"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",minWidth:18,textAlign:"center"}}>{i+1}</span>
            <span style={{flex:1,fontSize:".88rem",color:"var(--text)",fontStyle:"italic"}}>{e}</span>
            {!submitted&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
              <button onClick={()=>move(i,-1)} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",width:22,height:18,cursor:"pointer",fontSize:".65rem",lineHeight:1}}>↑</button>
              <button onClick={()=>move(i,1)}  style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",width:22,height:18,cursor:"pointer",fontSize:".65rem",lineHeight:1}}>↓</button>
            </div>}
            {submitted&&<span style={{fontSize:"1rem"}}>{correct?"✅":"❌"}</span>}
          </div>;
        })}
      </div>
      {!submitted&&<button className="btn-nq" onClick={check} style={{marginTop:4}}>Sorrendet ellenőrzöm ✓</button>}
      {submitted&&<div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--gold)",padding:8}}>Eredmény kiszámítva... {score} pont</div>}
    </div>
  </div>;
}

function RuneTask({task,onDone,onRetry}){
  const {puzzles}=task.data;
  const [pi,setPi]=useState(0);const [typed,setTyped]=useState([]);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(0);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perP=Math.round(task.basePoints/puzzles.length);
  const puzz=puzzles[pi];const encoded=enc(puzz.word);
  const addL=(l)=>{if(fb||typed.length>=puzz.word.length)return;const n=[...typed,l];setTyped(n);if(n.length===puzz.word.length){const good=n.join("")===puzz.word;if(good){setScore(s=>s+perP+Math.round(left/task.timeLimit*28));setCorrect(c=>c+1);}setFb({good,text:good?`Pontosan! „${puzz.word}" — ${puzz.hint}`:`Helyes szó: „${puzz.word}". ${puzz.hint}`});}};
  const next=()=>{setTyped([]);setFb(null);if(pi+1>=puzzles.length)setDone(true);else setPi(p=>p+1);};
  const alpha="ABCDEFGHIJKLMNOPRSTUVWZ".split("");
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+puzzles.length*28} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct,wrong:puzzles.length-correct,timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"16px 14px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>RÚNA {pi+1}/{puzzles.length}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{textAlign:"center",padding:"16px 10px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.18)"}}>
        <div style={{fontFamily:"serif",fontSize:"clamp(1.6rem,5vw,2.4rem)",letterSpacing:".3em",color:"var(--gold)",textShadow:"0 0 18px rgba(201,168,76,.4)",marginBottom:6}}>{encoded}</div>
        <div style={{fontStyle:"italic",fontSize:".8rem",color:"var(--td)"}}>💡 {puzz.hint}</div>
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
        {puzz.word.split("").map((_,i)=><div key={i} style={{width:36,height:42,border:`1.5px solid ${i<typed.length?"var(--gold)":"rgba(201,168,76,.2)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"var(--gold)",background:i<typed.length?"rgba(201,168,76,.1)":"transparent",transition:"all .2s"}}>{typed[i]||""}</div>)}
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
        {alpha.map(l=><button key={l} onClick={()=>addL(l)} className="rune-key"><span style={{fontFamily:"serif",fontSize:".65rem",color:"rgba(201,168,76,.35)",display:"block"}}>{RM[l]||"·"}</span><span style={{fontSize:".75rem"}}>{l}</span></button>)}
        <button onClick={()=>setTyped(t=>t.slice(0,-1))} className="rune-key" style={{borderColor:"rgba(229,57,53,.4)",color:"#EF9A9A",minWidth:44}}>⌫</button>
      </div>
    </div>
    {fb&&<Feedback good={fb.good} text={fb.text} onNext={next}/>}
  </div>;
}

function QuoteTask({task,onDone,onRetry}){
  const {quotes}=task.data;
  const [qi,setQi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(0);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perQ=Math.round(task.basePoints/quotes.length);
  const pick=(i)=>{if(fb)return;const q=quotes[qi];const good=i===q.ok;if(good){setScore(s=>s+perQ+Math.round(left/task.timeLimit*18));setCorrect(c=>c+1);}setFb({good,text:good?`Igen! ${q.chars[q.ok]} mondta.`:`Nem — ${q.chars[q.ok]} mondta ezeket.`});};
  const next=()=>{setFb(null);if(qi+1>=quotes.length)setDone(true);else setQi(q=>q+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+quotes.length*18} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct,wrong:quotes.length-correct,timeUsed:task.timeLimit?task.timeLimit-left:null}}/>;
  const q=quotes[qi];
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"18px 16px",display:"flex",flexDirection:"column",gap:18,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>IDÉZET {qi+1}/{quotes.length}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{padding:"18px 16px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.13)",borderLeft:"3px solid var(--gold)",fontStyle:"italic",fontSize:"clamp(.94rem,2.5vw,1.1rem)",color:"var(--text)",lineHeight:1.8,minHeight:90}}>{q.text}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".15em",color:"var(--gm)",textAlign:"center",textTransform:"uppercase"}}>— Ki mondta? —</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {q.chars.map((c,i)=><button key={i} onClick={()=>pick(i)} className="quote-char">{c}</button>)}
      </div>
    </div>
    {fb&&<Feedback good={fb.good} text={fb.text} onNext={next}/>}
  </div>;
}

function ScrambleTask({task,onDone,onRetry}){
  const {words}=task.data;
  const [wi,setWi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(0);
  const [typed,setTyped]=useState([]);const [avail,setAvail]=useState(()=>[...words[0].letters].map((l,i)=>({l,i,used:false})));
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));const startTime=useRef(Date.now());
  const word=words[wi];const perW=Math.round(task.basePoints/words.length);
  const addL=(idx)=>{if(fb||avail[idx].used)return;const na=avail.map((a,i)=>i===idx?{...a,used:true}:a);const nt=[...typed,{l:avail[idx].l,srcIdx:idx}];setAvail(na);setTyped(nt);if(nt.length===word.answer.length){const good=nt.map(t=>t.l).join("")===word.answer;if(good){setScore(s=>s+perW+Math.round(left/task.timeLimit*22));setCorrect(c=>c+1);}setFb({good,text:good?`Pontos! „${word.answer}" — ${word.hint}`:`Helyes szó: „${word.answer}". ${word.hint}`});}};
  const rmLast=()=>{if(!typed.length||fb)return;const last=typed[typed.length-1];setAvail(a=>a.map((x,i)=>i===last.srcIdx?{...x,used:false}:x));setTyped(t=>t.slice(0,-1));};
  const next=()=>{setFb(null);if(wi+1>=words.length){setDone(true);return;}const nw=words[wi+1];setWi(w=>w+1);setTyped([]);setAvail([...nw.letters].map((l,i)=>({l,i,used:false})));};
  if(done){const timeUsed=Math.round((Date.now()-startTime.current)/1000);return <TaskResult task={task} score={score} maxScore={task.basePoints+words.length*22} onBack={()=>onDone(score)} onRetry={onRetry} stats={{correct,wrong:words.length-correct,timeUsed}}/>;}
  return <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <TimerBar left={left} pct={pct} limit={task.timeLimit}/>
    <div style={{flex:1,padding:"16px 14px",display:"flex",flexDirection:"column",gap:14,overflowY:"auto",alignItems:"center"}}>
      <div style={{display:"flex",justifyContent:"space-between",width:"100%"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".15em",color:"var(--gm)"}}>NÉV {wi+1}/{words.length}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".73rem",color:"var(--gold)"}}>{score} pt</div></div>
      <div style={{fontStyle:"italic",fontSize:".84rem",color:"var(--td)",borderLeft:"2px solid rgba(201,168,76,.2)",paddingLeft:10,alignSelf:"flex-start"}}>💡 {word.hint}</div>
      <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
        {word.answer.split("").map((_,i)=><div key={i} style={{width:40,height:48,border:`1.5px solid ${i<typed.length?"var(--gold)":"rgba(201,168,76,.18)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:"1.2rem",color:"var(--gold)",background:i<typed.length?"rgba(201,168,76,.1)":"transparent",transition:"all .15s"}}>{typed[i]?.l||""}</div>)}
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap"}}>
        {avail.map((a,i)=><button key={i} onClick={()=>addL(i)} style={{width:44,height:52,border:`1.5px solid ${a.used?"rgba(201,168,76,.08)":"rgba(201,168,76,.4)"}`,background:a.used?"rgba(0,0,0,.3)":"rgba(201,168,76,.06)",color:a.used?"rgba(201,168,76,.15)":"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:"1.1rem",cursor:a.used?"default":"pointer",transition:"all .15s",opacity:a.used?.25:1}}>{a.l}</button>)}
      </div>
      <button onClick={rmLast} style={{background:"none",border:"1px solid rgba(229,57,53,.3)",color:"#EF9A9A",padding:"6px 16px",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer",letterSpacing:".1em"}}>⌫ Utolsó törlése</button>
    </div>
    {fb&&<Feedback good={fb.good} text={fb.text} onNext={next}/>}
  </div>;
}

function ProphecyTask({task,onDone}){
  const {tree}=task.data;
  const [phase,setPhase]=useState(0);const [chosen,setChosen]=useState(null);const [score,setScore]=useState(0);const [result,setResult]=useState(null);
  const pick1=(i)=>{setChosen(i);setPhase(1);};
  const pick2=(i)=>{const r=tree.opts[chosen].opts2[i];setScore(r.pts);setResult(r);setPhase(2);};
  if(phase===2)return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px",textAlign:"center",gap:18}}>
    <div style={{fontSize:"3rem",animation:"popIn .5s cubic-bezier(.34,1.56,.64,1)"}}>{result.good?"🌟":"💀"}</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1rem,3.5vw,1.5rem)",color:result.good?"#C9A84C":"#E57373"}}>{result.good?"Bölcs döntés!":"Tanulságos döntés..."}</div>
    <div style={{fontStyle:"italic",color:"var(--td)",fontSize:".96rem",lineHeight:1.75,maxWidth:400,padding:"13px 16px",border:"1px solid rgba(201,168,76,.13)",background:"rgba(0,0,0,.3)"}}>{result.result}</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.8rem",color:"var(--gold)"}}>{score} <span style={{fontSize:".5em"}}>pont</span></div>
    <button className="btn-back-map" onClick={()=>onDone(score)}>← Vissza a Térképre</button>
  </div>;
  const node=phase===0?tree:tree.opts[chosen];
  const opts=phase===0?tree.opts:tree.opts[chosen].opts2;
  const pick=phase===0?pick1:pick2;
  return <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 16px",gap:18,overflowY:"auto"}}>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",letterSpacing:".2em",color:"var(--gm)",textAlign:"center",textTransform:"uppercase"}}>— Gandalf Döntése — {phase===1?"2. szint":""}</div>
    <div style={{padding:"16px",background:"rgba(122,74,187,.06)",border:"1px solid rgba(122,74,187,.2)",borderLeft:"3px solid #7A4ABB",fontStyle:"italic",fontSize:"1rem",color:"var(--text)",lineHeight:1.8}}>{node.q||node.text}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".15em",color:"var(--gm)",textAlign:"center",textTransform:"uppercase"}}>— Mit teszel? —</div>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {opts.map((o,i)=><button key={i} onClick={()=>pick(i)} className="prophecy-opt">{o.icon&&<span style={{fontSize:"1.2rem",marginRight:9}}>{o.icon}</span>}{o.label||o.text}</button>)}
    </div>
  </div>;
}

// ── TASK MODAL ─────────────────────────────────────────────────────────────────
function TaskModal({task,user,onClose,onComplete}){
  const [phase,setPhase]=useState("intro");
  const [retryKey,setRetryKey]=useState(0);
  const handleDone=(score)=>{onComplete(task.id,score);onClose();};
  const handleRetry=()=>{setRetryKey(k=>k+1);setPhase("intro");};
  const TaskComp={quiz:QuizTask,truefalse:TrueFalseTask,fillblank:FillBlankTask,match:MatchTask,order:OrderTask,rune:RuneTask,quote:QuoteTask,scramble:ScrambleTask,prophecy:ProphecyTask}[task.type];
  return <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:10,background:"rgba(14,10,6,.97)",backdropFilter:"blur(12px)",animation:"fadeIn .3s ease"}}>
    <div style={{width:"100%",maxWidth:570,background:"linear-gradient(162deg,rgba(20,15,11,.99),rgba(8,6,4,.99))",border:"1px solid rgba(201,168,76,.22)",boxShadow:"0 40px 100px rgba(0,0,0,.8),inset 0 1px 0 rgba(201,168,76,.08)",display:"flex",flexDirection:"column",maxHeight:"92vh",overflow:"hidden",animation:"modalIn .35s cubic-bezier(.22,1,.36,1)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",borderBottom:"1px solid rgba(201,168,76,.1)",background:`linear-gradient(90deg,transparent,${task.glow.replace(".5",".06")},transparent)`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:"1.2rem",filter:`drop-shadow(0 0 8px ${task.glow})`}}>{task.icon}</span>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".76rem",color:task.color,letterSpacing:".08em",textTransform:"uppercase"}}>{task.title}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--gm)",letterSpacing:".1em"}}>{task.location}</div>
          </div>
        </div>
        <button aria-label="Feladat bezárása" onClick={onClose} style={{background:"none",border:"1px solid rgba(201,168,76,.14)",color:"var(--gm)",width:30,height:30,cursor:"pointer",fontSize:".95rem",transition:"all .2s"}} onMouseEnter={e=>{e.target.style.borderColor="var(--gold)";e.target.style.color="var(--gold)";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(201,168,76,.14)";e.target.style.color="var(--gm)";}}>×</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
        {phase==="intro"?<StoryIntro task={task} user={user} onStart={()=>setPhase("task")}/>:TaskComp?<TaskComp key={retryKey} task={task} onDone={handleDone} onRetry={handleRetry}/>:null}
      </div>
    </div>
  </div>;
}

// ── ADVENTURE MAP ──────────────────────────────────────────────────────────────
function AdventureMap({user,completed,scores,onSelect,onAddScore}){
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const [hov,setHov]=useState(null);
  const [mapZoom,setMapZoom]=useState(null); // {x,y} target for zoom animation
  const [eggOpen,setEggOpen]=useState(false);
  const [eggInput,setEggInput]=useState("");
  const [eggClaimed,setEggClaimed]=useState(()=>localStorage.getItem("hobbit_egg_erebor")==="1");
  const [eggFlash,setEggFlash]=useState(false);
  const handleEggSubmit=()=>{
    if(eggInput==="JUTALOM"&&!eggClaimed){
      onAddScore?.("easter_erebor",1000000);
      localStorage.setItem("hobbit_egg_erebor","1");
      setEggClaimed(true);setEggFlash(true);sfx.achievement?.();
      setTimeout(()=>{setEggFlash(false);setEggOpen(false);},2200);
    }else{setEggInput("");}
  };
  const totalScore=Object.values(scores).reduce((a,b)=>a+b,0);
  const roadCurve=(x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1;return `M${x1} ${y1} C${x1+dx*.35+(dy>0?1.5:-1.5)} ${y1+dy*.15} ${x2-dx*.35+(dy>0?-1.5:1.5)} ${y2-dy*.15} ${x2} ${y2}`;};
  const handleNodeClick=(task,node)=>{
    sfx.click();
    setMapZoom({x:node.x,y:node.y});
    setTimeout(()=>{onSelect(task);setMapZoom(null);},600);
  };
  const zoomStyle=mapZoom?{transform:"scale(2.2)",transformOrigin:`${mapZoom.x}% ${mapZoom.y}%`,transition:"transform .6s cubic-bezier(.22,1,.36,1), transform-origin .6s cubic-bezier(.22,1,.36,1)"}:{transform:"scale(1)",transformOrigin:"50% 50%",transition:"transform .4s cubic-bezier(.22,1,.36,1), transform-origin .4s cubic-bezier(.22,1,.36,1)"};
  return <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div className="map-parchment" style={{position:"relative",width:"100%",maxWidth:"min(100%,calc(100vh * 16/9))",aspectRatio:"16/9",overflow:"hidden",boxShadow:"0 4px 80px rgba(0,0,0,.85),inset 0 0 100px rgba(10,6,2,.6)",...zoomStyle}}>
      {/* ═══ MULTI-LAYER PARCHMENT ═══ */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 35% 30%,#4a3c26,#2a1e10 55%,#181008)",zIndex:0}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 72% 22%,rgba(201,168,76,.1),transparent 40%)",zIndex:0}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 14% 72%,rgba(107,160,62,.08),transparent 35%)",zIndex:0}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 55% 60%,rgba(160,82,45,.06),transparent 30%)",zIndex:0}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 88% 50%,rgba(196,130,58,.08),transparent 25%)",zIndex:0}}/>
      {/* Age stains */}
      <div style={{position:"absolute",left:"20%",top:"15%",width:"18%",height:"22%",background:"radial-gradient(circle,rgba(100,75,35,.1),transparent 70%)",zIndex:1,borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:"65%",top:"58%",width:"14%",height:"18%",background:"radial-gradient(circle,rgba(80,60,25,.08),transparent 70%)",zIndex:1,borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:"42%",top:"78%",width:"10%",height:"14%",background:"radial-gradient(circle,rgba(60,50,30,.06),transparent 65%)",zIndex:1,borderRadius:"50%",pointerEvents:"none"}}/>

      {/* ═══ SVG LAYER ═══ */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:2}} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="softGlow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="terrainGlow"><feGaussianBlur stdDeviation=".6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="gBord" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C9A84C" stopOpacity=".5"/><stop offset="50%" stopColor="#E8D48B" stopOpacity=".22"/><stop offset="100%" stopColor="#C9A84C" stopOpacity=".5"/></linearGradient>
          <linearGradient id="shireGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5a9a3a"/><stop offset="100%" stopColor="#2a5a14"/></linearGradient>
          <linearGradient id="mtGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b8a898"/><stop offset="100%" stopColor="#5a4e40"/></linearGradient>
          <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a7a24"/><stop offset="100%" stopColor="#1a3a0a"/></linearGradient>
          <radialGradient id="eGlow" cx="50%" cy="60%" r="50%"><stop offset="0%" stopColor="#ff8a20" stopOpacity=".25"/><stop offset="60%" stopColor="#C4823A" stopOpacity=".08"/><stop offset="100%" stopColor="#C4823A" stopOpacity="0"/></radialGradient>
          <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity=".9"/><stop offset="100%" stopColor="#c8d0e0" stopOpacity=".5"/></linearGradient>
        </defs>

        {/* ─── DECORATIVE BORDER ─── */}
        <rect x=".6" y=".6" width="98.8" height="98.8" fill="none" stroke="url(#gBord)" strokeWidth=".6" rx=".4"/>
        <rect x="1.8" y="1.8" width="96.4" height="96.4" fill="none" stroke="rgba(201,168,76,.15)" strokeWidth=".18" rx=".3"/>
        {/* Corner ornaments */}
        {[[3,3],[97,3],[3,97],[97,97]].map(([cx,cy],i)=><g key={`co${i}`}>
          <line x1={cx-1.5} y1={cy} x2={cx+1.5} y2={cy} stroke="rgba(201,168,76,.28)" strokeWidth=".12"/>
          <line x1={cx} y1={cy-1.5} x2={cx} y2={cy+1.5} stroke="rgba(201,168,76,.28)" strokeWidth=".12"/>
          <circle cx={cx} cy={cy} r=".55" fill="rgba(201,168,76,.3)"/>
          <circle cx={cx} cy={cy} r=".2" fill="rgba(201,168,76,.5)"/>
        </g>)}
        {/* Edge ticks */}
        {[15,25,35,45,55,65,75,85].map(v=><g key={`tk${v}`}>
          <line x1={v} y1=".6" x2={v} y2="1.8" stroke="rgba(201,168,76,.08)" strokeWidth=".08"/>
          <line x1={v} y1="98.2" x2={v} y2="99.4" stroke="rgba(201,168,76,.08)" strokeWidth=".08"/>
          <line x1=".6" y1={v} x2="1.8" y2={v} stroke="rgba(201,168,76,.08)" strokeWidth=".08"/>
          <line x1="98.2" y1={v} x2="99.4" y2={v} stroke="rgba(201,168,76,.08)" strokeWidth=".08"/>
        </g>)}
        {/* Subtle grid */}
        {[20,40,60,80].map(v=><g key={`gr${v}`}><line x1={v} y1="2" x2={v} y2="98" stroke="rgba(201,168,76,.018)" strokeWidth=".06"/><line x1="2" y1={v} x2="98" y2={v} stroke="rgba(201,168,76,.018)" strokeWidth=".06"/></g>)}

        {/* ─── TERRAIN (with 16:9 stretch compensation) ─── */}

        {/* Shire — rolling green hills */}
        <g transform="translate(13,0) scale(0.5625,1) translate(-13,0)">
          <ellipse cx="14" cy="82" rx="16" ry="7" fill="#2a5a16" opacity=".7"/>
          <ellipse cx="6" cy="76" rx="10" ry="5" fill="#347a20" opacity=".6"/>
          <ellipse cx="22" cy="80" rx="9" ry="4" fill="#2e6a1a" opacity=".55"/>
          <ellipse cx="12" cy="72" rx="8" ry="4" fill="#3e8a2a" opacity=".5"/>
          <ellipse cx="20" cy="74" rx="6" ry="3" fill="#389a28" opacity=".4"/>
          <ellipse cx="4" cy="86" rx="7" ry="3.5" fill="#2a5a16" opacity=".5"/>
          <ellipse cx="16" cy="66" rx="5" ry="2.5" fill="#4a9a34" opacity=".3"/>
        </g>

        {/* Rivendell — gentle valley with soft cliffs */}
        <g transform="translate(32,0) scale(0.5625,1) translate(-32,0)">
          <path d="M18 55 Q22 48 24 38 Q26 32 28 36 Q30 40 32 35 Q34 30 36 36 Q38 40 40 38 Q42 32 46 55" fill="#1a3038" opacity=".35" stroke="#3a7a8a" strokeWidth=".2" strokeOpacity=".25"/>
          <path d="M22 54 Q26 42 29 36 Q32 42 35 36 Q38 42 42 54" fill="#1a3842" opacity=".2"/>
          <ellipse cx="32" cy="50" rx="12" ry="5" fill="#1a2a30" opacity=".15"/>
          <line x1="29" y1="36" x2="29.5" y2="52" stroke="#5ac0e0" strokeWidth=".4" strokeDasharray=".5,.7" opacity=".2"/>
          <line x1="36" y1="35" x2="35.5" y2="50" stroke="#5ac0e0" strokeWidth=".3" strokeDasharray=".4,.6" opacity=".15"/>
          <path d="M26 44 Q32 38 38 44" fill="none" stroke="#4a9aba" strokeWidth=".25" opacity=".2"/>
        </g>

        {/* Mirkwood — dark dense forest with rounded canopies */}
        <g transform="translate(53,0) scale(0.5625,1) translate(-53,0)">
          {/* Back layer — dark large canopies */}
          {[[44,66],[48,62],[52,58],[56,56],[60,58],[64,62],[67,66]].map(([x,y],i)=>
            <ellipse key={`cb${i}`} cx={x} cy={y} rx="4" ry="3.5" fill="#1a3a10" opacity=".5"/>
          )}
          {/* Middle layer — medium canopies */}
          {[[46,64],[50,60],[53,57],[57,58],[61,60],[65,64]].map(([x,y],i)=>
            <ellipse key={`cm${i}`} cx={x} cy={y} rx="3.5" ry="3" fill="#1a4a12" opacity=".45"/>
          )}
          {/* Front layer — lighter small canopies */}
          {[[45,67],[49,63],[53,59],[57,60],[62,63],[66,67]].map(([x,y],i)=>
            <ellipse key={`cf${i}`} cx={x} cy={y} rx="3" ry="2.5" fill="#2a5a18" opacity=".4"/>
          )}
          {/* Tiny trunks peeking through */}
          {[[47,68],[51,64],[55,60],[59,62],[63,66]].map(([x,y],i)=>
            <line key={`tr${i}`} x1={x} y1={y} x2={x} y2={y+3} stroke="#1a2a08" strokeWidth=".4" opacity=".3"/>
          )}
        </g>

        {/* Ködös Hegyek — mountain range with curved silhouettes */}
        <g transform="translate(73,0) scale(0.5625,1) translate(-73,0)">
          <path d="M56 48 Q60 38 63 30 Q65 24 68 28 Q70 22 73 14 Q76 8 78 14 Q80 20 82 28 Q84 24 87 30 Q90 38 94 48" fill="#3a3430" opacity=".5" stroke="#5a5244" strokeWidth=".12" strokeOpacity=".2"/>
          <path d="M58 48 Q63 34 67 26 Q70 20 73 16 Q76 10 79 20 Q82 26 87 34 Q92 48 92 48" fill="#4a4238" opacity=".4"/>
          <path d="M62 48 Q67 32 71 22 Q74 14 77 22 Q80 32 85 48" fill="#5a5040" opacity=".3"/>
          {/* Snow caps */}
          <path d="M76 8 Q74 14 73 16 Q76 15 78 14 Z" fill="#c8c4bc" opacity=".25"/>
          <path d="M73 14 Q72 18 71 20 Q73 19 74 18 Z" fill="#c0bcb4" opacity=".18"/>
          <ellipse cx="75" cy="22" rx="5" ry="1" fill="#8a8078" opacity=".08"/>
        </g>

        {/* Erebor — lonely mountain with dragon fire */}
        <g transform="translate(89,0) scale(0.5625,1) translate(-89,0)">
          <ellipse cx="89" cy="66" rx="14" ry="4" fill="#2a1a0a" opacity=".3"/>
          <path d="M76 68 Q80 52 83 44 Q86 36 89 26 Q92 36 95 44 Q98 52 102 68" fill="#3a2a18" opacity=".5" stroke="#5a4228" strokeWidth=".12" strokeOpacity=".2"/>
          <path d="M78 68 Q83 48 86 38 Q89 28 92 38 Q95 48 100 68" fill="#4a3820" opacity=".4"/>
          <path d="M82 68 Q85 46 89 30 Q93 46 96 68" fill="#5a4828" opacity=".3"/>
          {/* Snow cap */}
          <path d="M89 26 Q87 32 86 34 Q89 33 92 34 Z" fill="#c8c4bc" opacity=".2"/>
          {/* Dragon glow */}
          <path d="M85 60 Q89 52 93 60" fill="none" stroke="#ba8a3a" strokeWidth=".3" opacity=".35"/>
          <ellipse cx="89" cy="54" rx="5" ry="4" fill="url(#eGlow)"/>
          {[[86,56],[91,55],[87.5,52],[92,53],[85,59],[89,50]].map(([x,y],i)=>
            <circle key={`sp${i}`} cx={x} cy={y} r=".25" fill="#f0c848" opacity=".2" className="map-sparkle"/>
          )}
          {/* Easter egg — barely visible dot on peak */}
          {!eggClaimed&&<circle cx="89" cy="26" r="1.2" fill="rgba(201,168,76,.04)" stroke="none" style={{cursor:"pointer"}} onClick={(e)=>{e.stopPropagation();setEggOpen(true);sfx.click?.();}}/>}
        </g>

        {/* ─── RIVER — flows between regions ─── */}
        <path d="M80 38 Q72 44 64 46 Q56 48 48 46 Q40 44 32 48 Q24 52 16 58 Q10 64 6 76" fill="none" stroke="#3a7a9a" strokeWidth="2" strokeLinecap="round" opacity=".08"/>
        <path d="M80 38 Q72 44 64 46 Q56 48 48 46 Q40 44 32 48 Q24 52 16 58 Q10 64 6 76" fill="none" stroke="#4a9abe" strokeWidth=".8" strokeLinecap="round" opacity=".18"/>
        <path d="M80 38 Q72 44 64 46 Q56 48 48 46 Q40 44 32 48 Q24 52 16 58 Q10 64 6 76" fill="none" stroke="#6acaee" strokeWidth=".2" strokeLinecap="round" opacity=".12"/>

        {/* ─── ROADS ─── */}
        {REGIONS.map((reg,ri)=>reg.nodes.map((n,ni)=>{
          const next=ni<reg.nodes.length-1?reg.nodes[ni+1]:REGIONS[ri+1]?.nodes[0];
          if(!next)return null;
          const allDone=reg.tasks.slice(0,ni+1).every(t=>completed.includes(t));
          const d=roadCurve(n.x,n.y,next.x,next.y);
          return <g key={`rd${ri}-${ni}`}>
            <path d={d} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth={allDone?".6":".3"} strokeLinecap="round"/>
            <path d={d} fill="none" stroke={allDone?"rgba(201,168,76,.3)":"rgba(201,168,76,.08)"} strokeWidth={allDone?".35":".2"} strokeLinecap="round" strokeDasharray={allDone?"none":".6,.6"}/>
            {allDone&&<path d={d} fill="none" stroke="rgba(201,168,76,.15)" strokeWidth=".15" strokeLinecap="round"/>}
          </g>;
        }))}
      </svg>

      {/* ═══ COMPASS ROSE (HTML — no SVG stretch) ═══ */}
      <div style={{position:"absolute",bottom:14,right:14,width:52,height:52,zIndex:7,opacity:.4,pointerEvents:"none"}}>
        <svg viewBox="0 0 52 52" style={{width:"100%",height:"100%"}}>
          <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(201,168,76,.35)" strokeWidth=".8"/>
          <circle cx="26" cy="26" r="17" fill="none" stroke="rgba(201,168,76,.18)" strokeWidth=".5"/>
          <polygon points="26,5 24.5,23 27.5,23" fill="rgba(201,168,76,.45)"/>
          <polygon points="26,47 24.5,29 27.5,29" fill="rgba(201,168,76,.15)"/>
          <polygon points="5,26 23,24.5 23,27.5" fill="rgba(201,168,76,.15)"/>
          <polygon points="47,26 29,24.5 29,27.5" fill="rgba(201,168,76,.15)"/>
          <polygon points="10,10 23,24 24,23" fill="rgba(201,168,76,.07)"/>
          <polygon points="42,10 29,24 28,23" fill="rgba(201,168,76,.07)"/>
          <polygon points="10,42 23,28 24,29" fill="rgba(201,168,76,.07)"/>
          <polygon points="42,42 29,28 28,29" fill="rgba(201,168,76,.07)"/>
          <circle cx="26" cy="26" r="2" fill="rgba(201,168,76,.25)"/>
          <circle cx="26" cy="26" r=".8" fill="rgba(201,168,76,.4)"/>
          <text x="26" y="3.5" textAnchor="middle" fill="rgba(201,168,76,.5)" fontSize="4.5" fontFamily="Cinzel,serif" dominantBaseline="auto">É</text>
          <text x="26" y="51.5" textAnchor="middle" fill="rgba(201,168,76,.25)" fontSize="3.5" fontFamily="Cinzel,serif">D</text>
          <text x="1" y="28" textAnchor="middle" fill="rgba(201,168,76,.25)" fontSize="3.5" fontFamily="Cinzel,serif">Ny</text>
          <text x="51" y="28" textAnchor="middle" fill="rgba(201,168,76,.25)" fontSize="3.5" fontFamily="Cinzel,serif">K</text>
        </svg>
      </div>

      {/* ═══ REGION LABELS ═══ */}
      {REGIONS.map((reg,ri)=>{
        const unlocked=isRegionUnlocked(ri,completed);
        const doneCount=reg.tasks.filter(t=>completed.includes(t)).length;
        return <div key={reg.id} style={{position:"absolute",left:`${reg.label.x}%`,top:`${reg.label.y}%`,transform:"translate(-50%,-50%)",textAlign:"center",zIndex:4,pointerEvents:"none",opacity:unlocked?1:.2,transition:"opacity .6s"}}>
          <div style={{fontSize:"1.6rem",marginBottom:3,filter:unlocked?"none":"grayscale(1) brightness(.5)"}}>{reg.icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.52rem,1.3vw,.75rem)",color:reg.color,letterSpacing:".08em",textShadow:`0 0 18px ${reg.glow},0 1px 4px rgba(0,0,0,.9)`,whiteSpace:"nowrap"}}>{reg.name}</div>
          <div style={{width:42,height:1,background:`linear-gradient(90deg,transparent,${reg.color}44,transparent)`,margin:"3px auto 2px"}}/>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".44rem",color:"var(--gm)",letterSpacing:".1em"}}>{doneCount}/{reg.tasks.length}</div>
        </div>;
      })}

      {/* ═══ QUEST NODES ═══ */}
      {REGIONS.map((reg,ri)=>{
        const unlocked=isRegionUnlocked(ri,completed);
        return reg.tasks.map((taskId,ti)=>{
          const task=TASKS.find(t=>t.id===taskId);
          const node=reg.nodes[ti];
          if(!task||!node)return null;
          const isDone=completed.includes(taskId);const isHov=hov===taskId;
          return <div key={taskId} style={{position:"absolute",left:`${node.x}%`,top:`${node.y}%`,transform:"translate(-50%,-50%)",zIndex:10,cursor:unlocked?"pointer":"default",opacity:unlocked?1:.12,transition:"opacity .6s"}} onMouseEnter={()=>unlocked&&setHov(taskId)} onMouseLeave={()=>setHov(null)} onClick={()=>unlocked&&!mapZoom&&handleNodeClick(task,node)}>
            {!isDone&&unlocked&&<div style={{position:"absolute",inset:-10,borderRadius:"50%",border:`1.5px solid ${reg.color}`,opacity:.2,animation:"nodePulse 2.5s ease-in-out infinite"}}/>}
            {(isDone||isHov)&&<div style={{position:"absolute",inset:-5,borderRadius:"50%",background:`radial-gradient(circle,${reg.glow},transparent 70%)`,opacity:isDone?.35:.2,transition:"opacity .3s"}}/>}
            <div style={{position:"relative",width:46,height:46,borderRadius:"50%",border:`2.5px solid ${isDone?"var(--gold)":isHov?reg.color:"rgba(201,168,76,.16)"}`,background:isDone?`radial-gradient(circle at 40% 35%,${reg.glow},rgba(8,6,4,.9))`:`radial-gradient(circle at 40% 35%,rgba(40,32,22,.95),rgba(8,6,4,.92))`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s cubic-bezier(.22,1,.36,1)",transform:isHov?"scale(1.25)":"scale(1)",boxShadow:isDone?`0 0 22px ${reg.glow},0 2px 10px rgba(0,0,0,.6)`:isHov?`0 0 18px ${reg.glow},0 2px 8px rgba(0,0,0,.5)`:"0 2px 8px rgba(0,0,0,.4)"}}>
              <span style={{fontSize:"1.15rem",filter:isDone?"none":"brightness(.85)"}}>{isDone?"✅":task.icon}</span>
              <div style={{position:"absolute",inset:3,borderRadius:"50%",border:`1px solid ${isDone?"rgba(201,168,76,.12)":"rgba(201,168,76,.05)"}`,pointerEvents:"none"}}/>
            </div>
            <div style={{position:"absolute",top:"calc(100% + 5px)",left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap",fontFamily:"'Cinzel',serif",fontSize:".48rem",letterSpacing:".07em",color:isDone?"var(--gold)":isHov?reg.color:"rgba(201,168,76,.28)",textTransform:"uppercase",textAlign:"center",textShadow:"0 0 8px rgba(0,0,0,.95),0 1px 3px rgba(0,0,0,.8)",pointerEvents:"none",transition:"color .3s"}}>
              {task.num}{isDone&&<span style={{marginLeft:3,color:"var(--gold)",opacity:.6,fontSize:".42rem"}}>{scores[taskId]||0}pt</span>}
            </div>
            {isHov&&<div style={{position:"absolute",bottom:"calc(100% + 16px)",left:"50%",transform:"translateX(-50%)",background:"rgba(8,6,3,.97)",border:`1px solid ${reg.color}44`,padding:"10px 14px",minWidth:185,zIndex:20,boxShadow:`0 0 28px ${reg.glow},0 8px 32px rgba(0,0,0,.7)`,animation:"fadeIn .2s ease",pointerEvents:"none",backdropFilter:"blur(10px)"}}>
              <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%) rotate(45deg)",width:10,height:10,background:"rgba(8,6,3,.97)",borderRight:`1px solid ${reg.color}44`,borderBottom:`1px solid ${reg.color}44`}}/>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".72rem",color:reg.color,marginBottom:3,letterSpacing:".06em"}}>{task.title}</div>
              <div style={{fontStyle:"italic",fontSize:".75rem",color:"var(--td)",lineHeight:1.5,marginBottom:6}}>{task.subtitle}</div>
              <div style={{display:"flex",gap:10,borderTop:`1px solid rgba(201,168,76,.08)`,paddingTop:5}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--gm)"}}>⏳ {task.timeLimit||"∞"}s</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--gm)"}}>🏆 {task.basePoints}pt</span>
                {isDone&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--gold)"}}>✓ Kész</span>}
              </div>
            </div>}
          </div>;
        });
      })}

      {/* ═══ FOG OF WAR ═══ */}
      {REGIONS.map((reg,ri)=>{
        if(isRegionUnlocked(ri,completed))return null;
        return <div key={`fog-${reg.id}`} style={{position:"absolute",left:`${reg.label.x-15}%`,top:`${reg.label.y-14}%`,width:"30%",height:"60%",background:`radial-gradient(ellipse,rgba(6,4,2,.82) 15%,rgba(6,4,2,.4) 45%,transparent 70%)`,zIndex:6,pointerEvents:"none",transition:"opacity 1s"}}/>
      })}

      {/* ═══ TITLE CARTOUCHE ═══ */}
      <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:7,pointerEvents:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:35,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.22))"}}/>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.58rem,1.7vw,.88rem)",color:"rgba(201,168,76,.5)",letterSpacing:".14em",textShadow:"0 0 18px rgba(201,168,76,.15)"}}>KÖZÉPFÖLDÉ TÉRKÉPE</div>
          <div style={{width:35,height:1,background:"linear-gradient(90deg,rgba(201,168,76,.22),transparent)"}}/>
        </div>
      </div>

      {/* ═══ EASTER EGG POPUP ═══ */}
      {eggOpen&&<div style={{position:"absolute",inset:0,zIndex:50,background:"rgba(4,3,2,.88)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .4s ease"}} onClick={()=>{if(!eggFlash)setEggOpen(false);}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"rgba(12,8,4,.97)",border:"1px solid rgba(201,168,76,.18)",padding:"24px 28px",maxWidth:280,textAlign:"center",boxShadow:"0 0 60px rgba(201,168,76,.08)"}}>
          {eggFlash?<>
            <div style={{fontSize:"2.5rem",marginBottom:10,animation:"gP 1s ease infinite"}}>💰</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)",letterSpacing:".1em",marginBottom:6}}>+1 000 000 pont!</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",fontStyle:"italic"}}>Smaug kincsestárának titkát feloldottad!</div>
          </>:<>
            <div style={{fontSize:"1.3rem",marginBottom:8,opacity:.5}}>🔐</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"rgba(201,168,76,.4)",letterSpacing:".12em",marginBottom:12,textTransform:"uppercase"}}>Titkos kulcsszó</div>
            <input value={eggInput} onChange={e=>setEggInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEggSubmit()} placeholder="..." autoFocus style={{width:"100%",padding:"8px 12px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(201,168,76,.12)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".15em",textAlign:"center",outline:"none",caretColor:"var(--gold)"}}/>
            <button onClick={handleEggSubmit} style={{marginTop:10,padding:"6px 20px",background:"none",border:"1px solid rgba(201,168,76,.15)",color:"rgba(201,168,76,.35)",fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase"}}>Megerősít</button>
          </>}
        </div>
      </div>}

      {/* ═══ STATUS BAR ═══ */}
      <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",background:"rgba(8,6,4,.92)",border:"1px solid rgba(201,168,76,.14)",padding:"7px 18px",display:"flex",alignItems:"center",gap:14,backdropFilter:"blur(10px)",zIndex:7,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>
        <div style={{width:3,height:14,background:`linear-gradient(180deg,${race.color},transparent)`,borderRadius:2}}/>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>{completed.length}/{TASKS.length} teljesítve</div>
        <div style={{width:90,height:4,background:"rgba(255,255,255,.04)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(completed.length/TASKS.length)*100}%`,background:`linear-gradient(90deg,${race.color}88,var(--gold))`,borderRadius:3,transition:"width .6s cubic-bezier(.22,1,.36,1)"}}/></div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--gold)",letterSpacing:".06em"}}>{totalScore} pont</div>
      </div>
    </div>
  </div>;
}

// ── MINI GAMES ─────────────────────────────────────────────────────────────────
const CARD_EMOJIS=["🏡","🐉","💍","⚔️","🧙","🗺️","🏔️","🌲"];
function MemoryGame(){
  const [cards,setCards]=useState(()=>[...CARD_EMOJIS,...CARD_EMOJIS].sort(()=>Math.random()-.5).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false})));
  const [sel,setSel]=useState([]);const [moves,setMoves]=useState(0);const [locked,setLocked]=useState(false);const [won,setWon]=useState(false);
  const flip=(id)=>{
    if(locked||sel.length===2)return;
    const c=cards.find(c=>c.id===id);if(c.flipped||c.matched)return;
    sfx.cardFlip();
    const newCards=cards.map(c=>c.id===id?{...c,flipped:true}:c);setCards(newCards);
    const newSel=[...sel,id];setSel(newSel);
    if(newSel.length===2){
      setMoves(m=>m+1);setLocked(true);
      const [a,b]=newSel.map(id=>newCards.find(c=>c.id===id));
      if(a.emoji===b.emoji){
        sfx.success();
        const next=newCards.map(c=>newSel.includes(c.id)?{...c,matched:true}:c);setCards(next);setSel([]);setLocked(false);
        if(next.every(c=>c.matched))sfx.achievement();
      } else {sfx.error();setTimeout(()=>{setCards(cc=>cc.map(c=>newSel.includes(c.id)?{...c,flipped:false}:c));setSel([]);setLocked(false);},900);}
    }
  };
  const reset=()=>{setCards([...CARD_EMOJIS,...CARD_EMOJIS].sort(()=>Math.random()-.5).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false})));setSel([]);setMoves(0);setLocked(false);setWon(false);};
  return <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>🃏 Tolkien Memória</div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{moves} lépés</span>
        <button onClick={reset} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"4px 10px",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",letterSpacing:".1em"}}>Újra</button>
      </div>
    </div>
    {won&&<div style={{textAlign:"center",padding:"12px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",fontFamily:"'Cinzel',serif",fontSize:".85rem",color:"var(--gold)",animation:"fadeIn .4s ease",marginBottom:8}}>✨ Gratulálok! {moves} lépésből megoldottad! ✨</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gridTemplateRows:"repeat(4,1fr)",gap:8,flex:1,minHeight:0}}>
      {cards.map(c=><div key={c.id} className={c.flipped&&!c.matched?"card-flip":""} onClick={()=>flip(c.id)} style={{border:`1.5px solid ${c.matched?"rgba(102,187,106,.5)":c.flipped?"var(--gold)":"rgba(201,168,76,.18)"}`,background:c.matched?"rgba(102,187,106,.08)":c.flipped?"rgba(201,168,76,.1)":"rgba(255,255,255,.02)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",cursor:c.matched||c.flipped?"default":"pointer",transition:"border .3s,background .3s,box-shadow .3s,transform .25s cubic-bezier(.22,1,.36,1)",transform:c.matched?"scale(1.03)":c.flipped?"scale(1)":"scale(.97)",boxShadow:c.matched?"0 0 16px rgba(102,187,106,.25)":c.flipped?"0 0 10px rgba(201,168,76,.15)":"none"}}>{c.flipped||c.matched?c.emoji:"🔮"}</div>)}
    </div>
  </div>;
}

function ReactionGame(){
  const [phase,setPhase]=useState("idle");const [score,setScore]=useState(0);const [round,setRound]=useState(0);const [shown,setShown]=useState(null);const [start,setStart]=useState(0);const [times,setTimes]=useState([]);const [wrong,setWrong]=useState(false);
  const CHARS=[{n:"Gandalf",e:"🧙",ok:true},{n:"Smaug",e:"🐉",ok:false},{n:"Bilbo",e:"🧑‍🌾",ok:true},{n:"Gollam",e:"💀",ok:false},{n:"Thorin",e:"⛏️",ok:true},{n:"Orc",e:"👺",ok:false}];
  const startRound=()=>{
    setPhase("wait");
    const delay=1000+Math.random()*2000;
    setTimeout(()=>{const c=CHARS[Math.floor(Math.random()*CHARS.length)];setShown(c);setStart(Date.now());setPhase("show");},delay);
  };
  const hit=()=>{
    if(phase!=="show"||!shown)return;
    const ms=Date.now()-start;
    if(shown.ok){sfx.success();setScore(s=>s+Math.max(0,100-Math.floor(ms/10)));setTimes(t=>[...t,ms]);setWrong(false);}
    else{sfx.error();setScore(s=>Math.max(0,s-50));setWrong(true);}
    setShown(null);setPhase("idle");setRound(r=>r+1);
  };
  const skip=()=>{if(phase!=="show"||!shown)return;if(!shown.ok){setScore(s=>s+30);}else{setScore(s=>Math.max(0,s-20));}setShown(null);setPhase("idle");setRound(r=>r+1);};
  return <div style={{padding:"16px 14px",display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>⚡ Kalandor Reflexek</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{score} pont | {round}. kör</div>
    </div>
    <div style={{fontStyle:"italic",fontSize:".78rem",color:"var(--td)",lineHeight:1.5,padding:"8px 12px",borderLeft:"2px solid rgba(201,168,76,.2)"}}>Ha barát jelenik meg (🧙🧑‍🌾⛏️) — kattints rá gyorsan! Ha ellenség (🐉💀👺) — hagyd el!</div>
    <div style={{minHeight:120,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(201,168,76,.14)",background:"rgba(0,0,0,.2)",cursor:"pointer"}} onClick={phase==="show"?hit:undefined}>
      {phase==="idle"&&<button onClick={startRound} className="btn-nq">Következő kör →</button>}
      {phase==="wait"&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:"var(--gm)",letterSpacing:".15em",animation:"runeFlicker 1s ease-in-out infinite"}}>Várj...</div>}
      {phase==="show"&&shown&&<div style={{textAlign:"center",animation:"popIn .15s ease"}}>
        <div style={{fontSize:"3.5rem",marginBottom:8}}>{shown.e}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:"var(--text)"}}>{shown.n}</div>
      </div>}
    </div>
    {wrong&&<div style={{textAlign:"center",color:"#EF9A9A",fontStyle:"italic",fontSize:".82rem",animation:"fadeIn .2s"}}>⚠ Ez ellenség volt! -50 pont</div>}
    {phase==="show"&&<button onClick={skip} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"7px",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer",letterSpacing:".1em"}}>Kihagyom (ellenség)</button>}
    {times.length>0&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--gm)",textAlign:"center"}}>Átlag reakcióidő: {Math.round(times.reduce((a,b)=>a+b,0)/times.length)}ms</div>}
  </div>;
}

function WordSearch(){
  const words=["BILBO","GANDALF","SMAUG","THORIN","GOLLUM","EREBOR"];
  const SIZE=10;
  const dirs=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
  const [grid]=useState(()=>{
    const g=Array.from({length:SIZE},()=>Array(SIZE).fill(""));
    const alpha="ABCDEFGHIJKLMNOPRSTUVWXYZ";
    const shuffled=[...words].sort(()=>Math.random()-.5);
    shuffled.forEach(w=>{
      let placed=false;let tries=0;
      while(!placed&&tries<200){tries++;
        const [dr,dc]=dirs[Math.floor(Math.random()*dirs.length)];
        const r=Math.floor(Math.random()*SIZE);const c=Math.floor(Math.random()*SIZE);
        const er=r+dr*(w.length-1);const ec=c+dc*(w.length-1);
        if(er<0||er>=SIZE||ec<0||ec>=SIZE)continue;
        let ok=true;
        for(let i=0;i<w.length;i++){const rr=r+dr*i;const cc=c+dc*i;if(g[rr][cc]&&g[rr][cc]!==w[i]){ok=false;break;}}
        if(ok){for(let i=0;i<w.length;i++){g[r+dr*i][c+dc*i]=w[i];}placed=true;}
      }
    });
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!g[r][c])g[r][c]=alpha[Math.floor(Math.random()*alpha.length)];
    return g;
  });
  const [sel,setSel]=useState([]);const [foundWords,setFoundWords]=useState([]);const [foundCells,setFoundCells]=useState(new Set());const [start,setStart2]=useState(null);
  const key=(r,c)=>`${r},${c}`;
  const selSet=new Set(sel.map(([r,c])=>key(r,c)));
  const snapLine=(sr,sc,er,ec)=>{
    const dr=er-sr,dc=ec-sc;
    const adr=Math.abs(dr),adc=Math.abs(dc);
    let sdr,sdc,len;
    if(adr===0&&adc===0){return [[sr,sc]];}
    if(adr>=adc*2){sdr=dr>0?1:-1;sdc=0;len=adr;}
    else if(adc>=adr*2){sdr=0;sdc=dc>0?1:-1;len=adc;}
    else{sdr=dr>0?1:-1;sdc=dc>0?1:-1;len=Math.max(adr,adc);}
    const cells=[];for(let i=0;i<=len;i++)cells.push([sr+sdr*i,sc+sdc*i]);
    return cells;
  };
  const tdown=(r,c)=>setStart2([r,c]);
  const tmove=(r,c)=>{if(!start)return;setSel(snapLine(start[0],start[1],r,c));};
  const tup=()=>{
    if(sel.length>=2){
      const w=sel.map(([r,c])=>grid[r]?.[c]||"").join("");const wr=[...sel].reverse().map(([r,c])=>grid[r]?.[c]||"").join("");
      const fw=words.find(fw=>fw===w||fw===wr);
      if(fw&&!foundWords.includes(fw)){
        sfx.success();
        setFoundWords(f=>{const nf=[...f,fw];if(nf.length===words.length)sfx.achievement();return nf;});
        setFoundCells(prev=>{const next=new Set(prev);sel.forEach(([r,c])=>next.add(key(r,c)));return next;});
      }
    }
    setSel([]);setStart2(null);
  };
  return <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",userSelect:"none"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>🔍 Tolkien Szókereső</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{foundWords.length}/{words.length} megtalálva</div>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
      {words.map(w=><span key={w} style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",padding:"2px 8px",border:"1px solid rgba(201,168,76,.2)",color:foundWords.includes(w)?"rgba(102,187,106,.8)":"var(--gm)",textDecoration:foundWords.includes(w)?"line-through":"none",letterSpacing:".06em"}}>{w}</span>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},1fr)`,gridTemplateRows:`repeat(${SIZE},1fr)`,gap:2,touchAction:"none",flex:1,minHeight:0}}
      onMouseLeave={tup}>
      {grid.map((row,r)=>row.map((cell,c)=>{
        const k=key(r,c);const isSel=selSet.has(k);const isFound=foundCells.has(k);
        return <div key={k}
          onMouseDown={()=>tdown(r,c)} onMouseMove={()=>tmove(r,c)} onMouseUp={tup}
          style={{display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:"clamp(.7rem,2vw,1rem)",background:isFound?"rgba(102,187,106,.12)":isSel?"rgba(201,168,76,.2)":"transparent",color:isFound?"#66BB6A":isSel?"var(--gold)":"var(--text)",border:"1px solid rgba(201,168,76,.06)",cursor:"default",transition:"all .1s",fontWeight:isFound||isSel?"700":"400"}}>
          {cell}
        </div>;
      }))}
    </div>
    {foundWords.length===words.length&&<div style={{textAlign:"center",padding:"10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--gold)",animation:"fadeIn .4s",marginTop:8}}>✨ Minden szót megtaláltál! ✨</div>}
  </div>;
}

// ── NEW MINI GAMES ──────────────────────────────────────────────────────────
const RIDDLES=[
  {q:"Lábak nélkül jár, szárnyak nélkül száll, fog nélkül harap, száj nélkül kiált.",a:["A szél","A tűz","A víz","Az idő"],ok:0},
  {q:"Harminc fehér ló áll egy vörös dombon: először rágnak, aztán topognak, aztán megállnak.",a:["Ujjak","Fogak","Hópelyhek","Csillagok"],ok:1},
  {q:"Egy szem nélkül van, de igét lát; nincs szája, mégis mindent mond.",a:["A könyv","A tükör","A hold","Az álom"],ok:0},
  {q:"Mindent felfal: madarakat, állatokat, fákat, virágokat; vasat rág, acélt harap; kemény követ lisztté őröl; királyt megöl, várost leront, és hegyet is leterít.",a:["Az idő","A sárkány","A vihar","A tűz"],ok:0},
  {q:"Csendben fekszik egy aranyágyon, nem lélegzik, nem mozdul, mégis féltékenyen őrzi a kincsét.",a:["Smaug","Gollam","A Gyűrű","Thorin"],ok:0},
  {q:"Egy doboz kulcs nélkül, fedél nélkül, mégis arany kincs rejtőzik benne.",a:["Tojás","Láda","Hordó","Levél"],ok:0},
  {q:"Könnyebb, mint a pehely, mégis senki sem bírja sokáig tartani.",a:["A lélegzet","A remény","A fény","A buborék"],ok:0},
  {q:"Mi az, ami reggel négy lábon, délben két lábon, este három lábon jár?",a:["Az ember","A sárkány","A hobbit","A macska"],ok:0},
];

function RiddleGame(){
  const [idx,setIdx]=useState(0);const [score,setScore]=useState(0);const [chosen,setChosen]=useState(null);const [done,setDone]=useState(false);
  const riddle=RIDDLES[idx];
  const choose=(i)=>{
    if(chosen!==null)return;
    setChosen(i);
    if(i===riddle.ok){sfx.success();setScore(s=>s+100);}else sfx.error();
    setTimeout(()=>{
      if(idx<RIDDLES.length-1){setIdx(n=>n+1);setChosen(null);}
      else{setDone(true);if(score+((i===riddle.ok)?100:0)>=RIDDLES.length*60)sfx.achievement();}
    },1200);
  };
  const reset=()=>{setIdx(0);setScore(0);setChosen(null);setDone(false);};
  if(done)return <div style={{padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
    <div style={{fontSize:"3rem",animation:"gentlePop .5s ease both"}}>🏆</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)"}}>Párbaj vége!</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".9rem",color:"var(--text)"}}>{score} / {RIDDLES.length*100} pont</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",fontStyle:"italic"}}>{score>=RIDDLES.length*80?"Gollam is megirigyelte volna a tudásod!":score>=RIDDLES.length*50?"Nem rossz, kalandor!":"Gyakorolj még, fiatal hobbit!"}</div>
    <button onClick={reset} className="btn-nq">Újra ↻</button>
  </div>;
  return <div style={{padding:"14px",display:"flex",flexDirection:"column",gap:12,height:"100%",overflow:"auto"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gm)",letterSpacing:".1em"}}>{idx+1}/{RIDDLES.length}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{score} pont</div>
    </div>
    <div style={{padding:"18px 16px",background:"rgba(122,74,187,.05)",border:"1px solid rgba(122,74,187,.2)",borderRadius:4}}>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1.05rem",color:"var(--text)",fontStyle:"italic",lineHeight:1.6,textAlign:"center"}}>"{riddle.q}"</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {riddle.a.map((a,i)=>{
        const isOk=i===riddle.ok;const picked=chosen===i;
        const bg=chosen===null?"rgba(255,255,255,.02)":isOk?"rgba(102,187,106,.1)":picked?"rgba(229,57,53,.08)":"rgba(255,255,255,.02)";
        const bc=chosen===null?"rgba(201,168,76,.15)":isOk?"rgba(102,187,106,.5)":picked?"rgba(229,57,53,.4)":"rgba(201,168,76,.08)";
        const col=chosen===null?"var(--text)":isOk?"#A5D6A7":picked?"#EF9A9A":"var(--gm)";
        return <button key={i} onClick={()=>choose(i)} disabled={chosen!==null} style={{padding:"12px 10px",background:bg,border:`1px solid ${bc}`,color:col,fontFamily:"'EB Garamond',serif",fontSize:".9rem",cursor:chosen===null?"pointer":"default",transition:"all .25s",textAlign:"center",lineHeight:1.4}}>{a}</button>;
      })}
    </div>
  </div>;
}

function ArcheryGame(){
  const [phase,setPhase]=useState("menu");const [score,setScore]=useState(0);const [round,setRound]=useState(0);const [target,setTarget]=useState(null);const [result,setResult]=useState(null);const timerRef=useRef(null);const ROUNDS=10;
  const spawnTarget=()=>{
    setResult(null);
    const x=15+Math.random()*70;const y=15+Math.random()*60;const size=30+Math.random()*25;const life=1200+Math.random()*800;
    setTarget({x,y,size,life,spawned:Date.now()});
    timerRef.current=setTimeout(()=>{setTarget(null);setResult("miss");sfx.error();setRound(r=>{const next=r+1;if(next>=ROUNDS)setPhase("done");return next;});},life);
  };
  const hitTarget=()=>{
    if(!target)return;
    clearTimeout(timerRef.current);
    const ms=Date.now()-target.spawned;
    const pts=Math.max(10,Math.round(150-ms/10-(target.size-30)*1.5));
    sfx.success();
    setScore(s=>s+pts);setResult(`+${pts}`);setTarget(null);
    setRound(r=>{const next=r+1;if(next>=ROUNDS){setPhase("done");if(score+pts>=ROUNDS*80)sfx.achievement();}return next;});
  };
  const startGame=()=>{setPhase("play");setScore(0);setRound(0);setTarget(null);setResult(null);setTimeout(spawnTarget,500);};
  useEffect(()=>{if(phase==="play"&&!target&&round<ROUNDS&&result!==null){const t=setTimeout(spawnTarget,600);return()=>clearTimeout(t);}},[ target,round,result,phase]);
  useEffect(()=>()=>clearTimeout(timerRef.current),[]);
  if(phase==="done")return <div style={{padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
    <div style={{fontSize:"3rem",animation:"gentlePop .5s ease both"}}>🏹</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)"}}>Gyakorlat vége!</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".9rem",color:"var(--text)"}}>{score} pont {ROUNDS} lövésből</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",fontStyle:"italic"}}>{score>=ROUNDS*100?"Bard büszke lenne rád!":score>=ROUNDS*50?"Ígéretes íjász vagy!":"A tóvárosi gyakorlótéren még sokat kell edzened!"}</div>
    <button onClick={startGame} className="btn-nq">Újra ↻</button>
  </div>;
  if(phase==="menu")return <div style={{padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
    <div style={{fontSize:"3.5rem"}}>🏹</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",textAlign:"center"}}>Bard Íjász Kihívás</div>
    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".88rem",color:"var(--td)",fontStyle:"italic",textAlign:"center",lineHeight:1.6,maxWidth:280}}>Célozz gyorsan és pontosan! A célpontok eltűnnek — minél gyorsabban találsz, annál több pontot kapsz.</div>
    <button onClick={startGame} className="btn-nq">Kezdés →</button>
  </div>;
  return <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gm)",letterSpacing:".1em"}}>{round}/{ROUNDS} lövés</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{score} pont</div>
    </div>
    <div style={{flex:1,position:"relative",border:"1px solid rgba(201,168,76,.12)",background:"linear-gradient(180deg,rgba(10,20,15,.6),rgba(15,12,8,.8))",minHeight:200,overflow:"hidden",cursor:"crosshair"}}>
      {target&&<button onClick={hitTarget} style={{position:"absolute",left:`${target.x}%`,top:`${target.y}%`,transform:"translate(-50%,-50%)",width:target.size,height:target.size,borderRadius:"50%",background:"radial-gradient(circle at 40% 35%,rgba(229,57,53,.15),rgba(229,57,53,.05))",border:"2px solid rgba(229,57,53,.6)",cursor:"crosshair",animation:"popIn .15s ease",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(229,57,53,.3)"}}>
        <div style={{width:"50%",height:"50%",borderRadius:"50%",background:"radial-gradient(circle,rgba(229,57,53,.5),transparent)",border:"1px solid rgba(229,57,53,.4)"}}/>
        <div style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#E53935"}}/>
      </button>}
      {result&&!target&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:result==="miss"?"#EF9A9A":"#66BB6A",animation:"gentlePop .3s ease",textShadow:result==="miss"?"none":"0 0 12px rgba(102,187,106,.4)"}}>{result==="miss"?"Elhibáztad!":result}</div>
      </div>}
    </div>
  </div>;
}

function TreasureGame(){
  const SIZE=6;const TREASURES=8;const TRAPS=5;
  const [board]=useState(()=>{
    const b=Array.from({length:SIZE},()=>Array.from({length:SIZE},()=>({type:"empty",revealed:false})));
    const place=(type,count)=>{let placed=0;while(placed<count){const r=Math.floor(Math.random()*SIZE);const c=Math.floor(Math.random()*SIZE);if(b[r][c].type==="empty"){b[r][c].type=type;placed++;}}};
    place("gold",TREASURES);place("trap",TRAPS);
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      if(b[r][c].type!=="empty")continue;
      let adj=0;
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(dr===0&&dc===0)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&b[nr][nc].type==="gold")adj++;}
      b[r][c].hint=adj;
    }
    return b;
  });
  const [cells,setCells]=useState(()=>board.map(r=>r.map(c=>({...c}))));
  const [found,setFound]=useState(0);const [trapped,setTrapped]=useState(0);const [done,setDone]=useState(false);
  const reveal=(r,c)=>{
    if(cells[r][c].revealed||done)return;
    const next=cells.map(row=>row.map(cell=>({...cell})));
    next[r][c].revealed=true;
    setCells(next);
    if(next[r][c].type==="gold"){sfx.coin();setFound(f=>{const nf=f+1;if(nf>=TREASURES){setDone(true);sfx.achievement();}return nf;});}
    else if(next[r][c].type==="trap"){sfx.error();setTrapped(t=>{const nt=t+1;if(nt>=3){setDone(true);}return nt;});}
    else {/* click via globalClick */}
  };
  const reset=()=>{
    const b=Array.from({length:SIZE},()=>Array.from({length:SIZE},()=>({type:"empty",revealed:false})));
    const place=(type,count)=>{let placed=0;while(placed<count){const r=Math.floor(Math.random()*SIZE);const c=Math.floor(Math.random()*SIZE);if(b[r][c].type==="empty"){b[r][c].type=type;placed++;}}};
    place("gold",TREASURES);place("trap",TRAPS);
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){if(b[r][c].type!=="empty")continue;let adj=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(dr===0&&dc===0)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&b[nr][nc].type==="gold")adj++;}b[r][c].hint=adj;}
    setCells(b.map(r=>r.map(c=>({...c}))));setFound(0);setTrapped(0);setDone(false);
  };
  const icons={gold:"💰",trap:"💀",empty:""};
  return <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>💎 Erebor Kincstár</div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>💰 {found}/{TREASURES}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"#EF9A9A"}}>💀 {trapped}/3</span>
        <button onClick={reset} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"4px 10px",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer"}}>Újra</button>
      </div>
    </div>
    <div style={{fontStyle:"italic",fontSize:".78rem",color:"var(--td)",lineHeight:1.5,padding:"6px 12px",borderLeft:"2px solid rgba(201,168,76,.2)",marginBottom:8}}>Keress aranyat Smaug kincstárában! A számok jelzik, hány arany van a szomszédos mezőkön. Vigyázz a csapdákra — 3 csapda = vége!</div>
    {done&&<div style={{textAlign:"center",padding:"10px",background:found>=TREASURES?"rgba(201,168,76,.08)":"rgba(229,57,53,.08)",border:`1px solid ${found>=TREASURES?"rgba(201,168,76,.3)":"rgba(229,57,53,.3)"}`,fontFamily:"'Cinzel',serif",fontSize:".85rem",color:found>=TREASURES?"var(--gold)":"#EF9A9A",animation:"fadeIn .4s",marginBottom:8}}>{found>=TREASURES?"✨ Megtaláltad Smaug minden kincsét! ✨":"💀 A csapdák legyőztek! Próbáld újra!"}</div>}
    <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},1fr)`,gap:4,flex:1,minHeight:0}}>
      {cells.map((row,r)=>row.map((cell,c)=>{
        const bg=!cell.revealed?"rgba(201,168,76,.06)":cell.type==="gold"?"rgba(201,168,76,.15)":cell.type==="trap"?"rgba(229,57,53,.1)":"rgba(255,255,255,.02)";
        const bc=!cell.revealed?"rgba(201,168,76,.15)":cell.type==="gold"?"rgba(201,168,76,.4)":cell.type==="trap"?"rgba(229,57,53,.35)":"rgba(201,168,76,.08)";
        return <button key={`${r}-${c}`} onClick={()=>reveal(r,c)} disabled={cell.revealed||done} style={{display:"flex",alignItems:"center",justifyContent:"center",background:bg,border:`1px solid ${bc}`,cursor:cell.revealed||done?"default":"pointer",transition:"all .2s",fontSize:cell.revealed?"1.1rem":".8rem",fontFamily:"'Cinzel',serif",color:cell.hint>0?"var(--gold)":"var(--gm)"}}>
          {cell.revealed?(cell.type!=="empty"?icons[cell.type]:cell.hint>0?cell.hint:""):"?"}
        </button>;
      }))}
    </div>
  </div>;
}

// ── 1v1 DUEL ─────────────────────────────────────────────────────────────────
const DUEL_QUESTIONS=[
  {q:"Hány törpe érkezett Bilbo házához?",opts:["11","12","13","14"],c:2},
  {q:"Mi Gandalf másik neve?",opts:["Olórin","Saruman","Radagast","Pallando"],c:0},
  {q:"Ki ölte meg Smaug-ot?",opts:["Thorin","Bard","Bilbo","Gandalf"],c:1},
  {q:"Mi a neve Bilbo kardjának?",opts:["Glamdring","Orcrist","Fullánk","Andúril"],c:2},
  {q:"Hol található Elrond háza?",opts:["Lothlórien","Völgyzugoly","Gondor","Fangorn"],c:1},
  {q:"Mi Thorin vezetékneve?",opts:["Vasláb","Tölgypaizs","Kőláb","Vasöklű"],c:1},
  {q:"Milyen lény Gollam eredetileg?",opts:["Törpe","Hobbit","Tünde","Ember"],c:1},
  {q:"Mi a Gyűrű felirata?",opts:["Egy Gyűrű mind felett","A hatalom gyűrűje","Sauron akarata","Az árnyak ura"],c:0},
  {q:"Ki a törpék királya a Hobbitban?",opts:["Dáin","Thorin","Balin","Glóin"],c:1},
  {q:"Hány gyűrűt kaptak a törpék?",opts:["3","7","9","1"],c:1},
  {q:"Mi a neve a Magányos Hegynek?",opts:["Mordor","Erebor","Moria","Isengard"],c:1},
  {q:"Ki Legolas apja?",opts:["Elrond","Thranduil","Celeborn","Gil-galad"],c:1},
  {q:"Milyen színű Gandalf köpenye a Hobbitban?",opts:["Fehér","Szürke","Kék","Barna"],c:1},
  {q:"Ki készítette a Gyűrűket?",opts:["Sauron","Celebrimbor","Fëanor","Aulë"],c:1},
  {q:"Hány Istari (varázsló) érkezett Középföldére?",opts:["3","4","5","7"],c:2},
  {q:"Mi a neve Gollam másik személyiségének?",opts:["Déagol","Sméagol","Slinker","Stinker"],c:1},
  {q:"Melyik nép építette Moriát?",opts:["Tündék","Törpék","Emberek","Orkok"],c:1},
  {q:"Ki a Sötét Úr?",opts:["Morgoth","Sauron","Saruman","Boszorkányúr"],c:1},
  {q:"Mi a neve Frodo kardjának?",opts:["Fullánk","Glamdring","Orcrist","Narsil"],c:0},
  {q:"Hol lakik Bilbo?",opts:["Zsákos-domb","Bree","Gondor","Esgaroth"],c:0},
  {q:"Ki Aragorn felesége?",opts:["Galadriel","Éowyn","Arwen","Tauriel"],c:2},
  {q:"Mi a neve a Hobbit könyv szerzőjének?",opts:["C.S. Lewis","J.R.R. Tolkien","George R.R. Martin","Terry Pratchett"],c:1},
  {q:"Milyen faj Treebeard (Szilszakáll)?",opts:["Tünde","Ent","Törpe","Maia"],c:1},
  {q:"Hány tagja van a Gyűrű Szövetségének?",opts:["7","8","9","10"],c:2},
  {q:"Mi a neve Aragorn kardjának?",opts:["Glamdring","Orcrist","Andúril","Fullánk"],c:2},
  {q:"Melyik hegység alatt található Moria?",opts:["Ködös Hegység","Magányos Hegy","Vasdombok","Fehér Hegység"],c:0},
  {q:"Ki a Rohirrim királya a Gyűrűk Urában?",opts:["Éomer","Théoden","Denethor","Faramir"],c:1},
  {q:"Mi a Megye fővárosa?",opts:["Hobbiton","Buckland","Michel Delving","Bree"],c:2},
  {q:"Hány Nazgûl van?",opts:["5","7","9","13"],c:2},
  {q:"Ki találta meg a Gyűrűt a folyóban?",opts:["Sméagol","Déagol","Bilbo","Isildur"],c:1},
  {q:"Melyik városban él Bard?",opts:["Gondor","Esgaroth","Dale","Bree"],c:1},
  {q:"Mi a Szilmarilok?",opts:["Gyűrűk","Drágakövek","Kardok","Koronák"],c:1},
  {q:"Ki Gimli apja?",opts:["Balin","Glóin","Dwalin","Óin"],c:1},
  {q:"Mi Galadriel ajándéka Gimli-nek?",opts:["Kard","Mithril ing","Három hajszál","Pajzs"],c:2},
  {q:"Hol pusztult el a Gyűrű?",opts:["Mordor","Moria","Isengard","Erebor"],c:0},
];

function DuelMode({onBack}){
  const user=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_current"));}catch{return null;}})[0];
  const myName=user?.adventureName||"Névtelen";
  const myRace=user?.race||"human";
  const [myElo,setMyElo]=useState(1000);
  const [phase,setPhase]=useState("select"); // select | searching | playing | results
  const [mode,setMode]=useState("normal"); // normal | risky
  const [opponent,setOpponent]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [timer,setTimer]=useState(15);
  const [myScore,setMyScore]=useState(0);
  const [opScore,setOpScore]=useState(0);
  const [myAnswers,setMyAnswers]=useState([]);
  const [opAnswers,setOpAnswers]=useState([]);
  const [answered,setAnswered]=useState(false);
  const [matchRef,setMatchRef]=useState(null);
  const [eloChange,setEloChange]=useState(0);
  const [searchTimer,setSearchTimer]=useState(0);
  const timerRef=useRef(null);
  const searchRef=useRef(null);

  // Load ELO from Firebase
  useEffect(()=>{
    try{
      const {getDatabase,ref:fbRef,get}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      get(fbRef(db,`users/${myName}/profile/elo`)).then(s=>{if(s.val())setMyElo(s.val());});
    }catch(e){}
  },[]);

  // Cleanup on unmount
  useEffect(()=>{
    return ()=>{
      if(timerRef.current)clearInterval(timerRef.current);
      if(searchRef.current)clearInterval(searchRef.current);
      // Remove from queue
      try{
        const {getDatabase,ref:fbRef,remove}=window.__fbDB||{};
        if(getDatabase){const db=getDatabase();remove(fbRef(db,`duel_queue/${myName}`));}
      }catch(e){}
    };
  },[]);

  // Pick random questions
  const pickQuestions=()=>{
    const shuffled=[...DUEL_QUESTIONS].sort(()=>Math.random()-.5);
    return shuffled.slice(0,7);
  };

  // Start matchmaking
  const startSearch=()=>{
    setPhase("searching");setSearchTimer(0);
    try{
      const {getDatabase,ref:fbRef,set,onValue,off,remove,get}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      // Add self to queue
      set(fbRef(db,`duel_queue/${myName}`),{name:myName,race:myRace,elo:myElo,mode,ts:Date.now()});
      // Listen for queue
      const qRef=fbRef(db,"duel_queue");
      const checkMatch=()=>{
        get(qRef).then(snap=>{
          const data=snap.val()||{};
          const candidates=Object.values(data).filter(p=>p.mode===mode&&p.name!==myName);
          if(candidates.length>0){
            // Found opponent!
            const op=candidates[0];
            off(qRef);
            if(searchRef.current)clearInterval(searchRef.current);
            // Create match — lower name creates it
            const qs=pickQuestions();
            const mid=[myName,op.name].sort().join("_")+"_"+Date.now();
            const matchData={players:{[myName]:{name:myName,race:myRace,elo:myElo},[op.name]:{name:op.name,race:op.race,elo:op.elo}},mode,questions:qs.map((_,i)=>i),questionData:qs,status:"playing",created:Date.now(),answers:{},scores:{}};
            set(fbRef(db,`duel_matches/${mid}`),matchData);
            remove(fbRef(db,`duel_queue/${myName}`));
            remove(fbRef(db,`duel_queue/${op.name}`));
            setOpponent(op);setQuestions(qs);setMatchRef(mid);setPhase("playing");setQIdx(0);setTimer(15);setAnswered(false);
            startQuestionTimer();
            // Listen for opponent answers
            onValue(fbRef(db,`duel_matches/${mid}/answers/${op.name}`),(s)=>{
              const ans=s.val();if(ans){setOpAnswers(Object.values(ans));}
            });
            onValue(fbRef(db,`duel_matches/${mid}/scores/${op.name}`),(s)=>{
              const sc=s.val();if(typeof sc==="number")setOpScore(sc);
            });
          }
        });
      };
      // Poll every 2 seconds
      checkMatch();
      searchRef.current=setInterval(()=>{
        setSearchTimer(t=>t+2);
        checkMatch();
      },2000);
      // After 12s offer bot
    }catch(e){}
  };

  // Bot match (after timeout)
  const startBotMatch=()=>{
    if(searchRef.current)clearInterval(searchRef.current);
    try{const {getDatabase,ref:fbRef,remove}=window.__fbDB||{};if(getDatabase){const db=getDatabase();remove(fbRef(db,`duel_queue/${myName}`));}}catch(e){}
    const botElo=myElo+Math.floor(Math.random()*200-100);
    const botNames=["Gandalf Bot","Smaug AI","Gollam Bot","Thorin Bot","Elrond AI","Azog Bot"];
    const bot={name:botNames[Math.floor(Math.random()*botNames.length)],race:["hobbit","dwarf","elf","human","wizard"][Math.floor(Math.random()*5)],elo:Math.max(100,botElo),isBot:true};
    const qs=pickQuestions();
    setOpponent(bot);setQuestions(qs);setPhase("playing");setQIdx(0);setTimer(15);setAnswered(false);
    startQuestionTimer();
  };

  // Question timer
  const startQuestionTimer=()=>{
    if(timerRef.current)clearInterval(timerRef.current);
    setTimer(15);setAnswered(false);
    timerRef.current=setInterval(()=>{
      setTimer(t=>{
        if(t<=1){clearInterval(timerRef.current);return 0;}
        return t-1;
      });
    },1000);
  };

  // Handle timeout
  useEffect(()=>{
    if(phase==="playing"&&timer===0&&!answered){
      handleAnswer(-1);
    }
  },[timer]);

  // Answer a question
  const handleAnswer=(idx)=>{
    if(answered||phase!=="playing")return;
    setAnswered(true);
    if(timerRef.current)clearInterval(timerRef.current);
    const q=questions[qIdx];
    const correct=idx===q.c;
    const pts=correct?100+Math.round(timer*3.3):0; // max ~150pts per Q
    const newScore=myScore+pts;
    setMyScore(newScore);
    setMyAnswers(prev=>[...prev,{idx,correct,pts}]);
    // Save to Firebase if real match
    if(matchRef){
      try{
        const {getDatabase,ref:fbRef,set}=window.__fbDB||{};
        if(getDatabase){const db=getDatabase();
          set(fbRef(db,`duel_matches/${matchRef}/answers/${myName}/${qIdx}`),{idx,correct,pts});
          set(fbRef(db,`duel_matches/${matchRef}/scores/${myName}`),newScore);
        }
      }catch(e){}
    }
    // Bot answer simulation
    if(opponent?.isBot){
      const botCorrect=Math.random()<0.6;
      const botPts=botCorrect?100+Math.floor(Math.random()*40):0;
      setTimeout(()=>setOpScore(s=>s+botPts),500);
    }
    // Next question after delay
    setTimeout(()=>{
      if(qIdx<questions.length-1){
        setQIdx(i=>i+1);startQuestionTimer();
      }else{
        finishDuel(newScore);
      }
    },1500);
  };

  // Finish duel
  const finishDuel=(finalScore)=>{
    const opFinal=opScore; // opponent's score at this point
    const K=mode==="risky"?50:20;
    const expected=1/(1+Math.pow(10,(opponent.elo-myElo)/400));
    const result=finalScore>opFinal?1:finalScore===opFinal?0.5:0;
    const change=Math.round(K*(result-expected));
    setEloChange(change);
    const newElo=Math.max(0,myElo+change);
    setMyElo(newElo);
    // Save to Firebase
    try{
      const {getDatabase,ref:fbRef,set}=window.__fbDB||{};
      if(getDatabase){const db=getDatabase();
        set(fbRef(db,`users/${myName}/profile/elo`),newElo);
        if(matchRef)set(fbRef(db,`duel_matches/${matchRef}/status`),"done");
      }
    }catch(e){}
    setPhase("results");
    sfx.achievement?.();
  };

  const modeColor=mode==="risky"?"#E53935":"#4DADE2";
  const RACES_MAP={hobbit:"🧑‍🌾",dwarf:"⛏️",elf:"🌿",human:"⚔️",wizard:"🔮"};

  // ─── SELECT PHASE ───
  if(phase==="select")return <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:16,flex:1}}>
    <button onClick={onBack} style={{alignSelf:"flex-start",background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"4px 12px",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer"}}>← Vissza</button>
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:"2.5rem",marginBottom:8}}>⚔️</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)",letterSpacing:".1em"}}>1v1 Párbaj</div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>Tolkien tudáspróba — mérd össze tudásod!</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",marginTop:6}}>ELO: <span style={{color:"var(--gold)",fontSize:".75rem"}}>{myElo}</span></div>
    </div>
    {/* Mode select */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",textAlign:"center"}}>— Játékmód —</div>
      {[{id:"normal",label:"Normál Ranked",desc:"Biztonságos — kevesebb ELO kockázat",icon:"🛡️",color:"#4DADE2",elo:"±15-25 ELO"},{id:"risky",label:"Risky Ranked",desc:"Kockázatos — dupla ELO tét!",icon:"🔥",color:"#E53935",elo:"±40-60 ELO"}].map(m=>
        <button key={m.id} onClick={()=>setMode(m.id)} style={{padding:"16px",background:mode===m.id?`${m.color}12`:"rgba(0,0,0,.2)",border:`2px solid ${mode===m.id?m.color:"rgba(201,168,76,.1)"}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all .3s",borderRadius:6}}>
          <span style={{fontSize:"2rem"}}>{m.icon}</span>
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:mode===m.id?m.color:"var(--text)",letterSpacing:".05em"}}>{m.label}</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--gm)",fontStyle:"italic"}}>{m.desc}</div>
          </div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".55rem",color:m.color,padding:"4px 10px",background:`${m.color}15`,border:`1px solid ${m.color}44`,borderRadius:12,whiteSpace:"nowrap"}}>{m.elo}</div>
        </button>
      )}
    </div>
    <button onClick={startSearch} style={{padding:"14px",background:`${modeColor}15`,border:`2px solid ${modeColor}`,color:modeColor,fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",cursor:"pointer",letterSpacing:".1em",borderRadius:6,transition:"all .3s"}}>Ellenfél Keresése ⚔️</button>
    {/* Rules */}
    <div style={{padding:"12px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.1)",borderRadius:4}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>Szabályok</div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",lineHeight:1.6}}>
        • 7 Tolkien kérdés, kérdésenként 15 másodperc<br/>
        • Gyorsabb válasz = több pont (max 150/kérdés)<br/>
        • Normál: ±15-25 ELO • Risky: ±40-60 ELO<br/>
        • Ha nem válaszolsz időben: 0 pont
      </div>
    </div>
  </div>;

  // ─── SEARCHING PHASE ───
  if(phase==="searching")return <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:16,flex:1,alignItems:"center",justifyContent:"center"}}>
    <div style={{fontSize:"3rem",animation:"gP 2s ease infinite"}}>⚔️</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",letterSpacing:".1em"}}>Ellenfél keresése...</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:modeColor,padding:"4px 14px",background:`${modeColor}12`,border:`1px solid ${modeColor}44`,borderRadius:12}}>{mode==="risky"?"🔥 Risky Ranked":"🛡️ Normál Ranked"}</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gm)"}}>{searchTimer}s</div>
    <div style={{width:60,height:60,border:"3px solid rgba(201,168,76,.15)",borderTop:`3px solid ${modeColor}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    {searchTimer>=10&&<button onClick={startBotMatch} style={{padding:"10px 20px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer",borderRadius:4}}>Bot ellenfél ⚡</button>}
    <button onClick={()=>{if(searchRef.current)clearInterval(searchRef.current);try{const {getDatabase,ref:fbRef,remove}=window.__fbDB||{};if(getDatabase){const db=getDatabase();remove(fbRef(db,`duel_queue/${myName}`));}}catch(e){}setPhase("select");}} style={{padding:"8px 16px",background:"none",border:"1px solid rgba(229,57,53,.3)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer",borderRadius:4}}>Mégse</button>
  </div>;

  // ─── PLAYING PHASE ───
  if(phase==="playing"){
    const q=questions[qIdx];
    const progress=(qIdx/questions.length)*100;
    return <div style={{padding:"16px 14px",display:"flex",flexDirection:"column",gap:12,flex:1}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:"1.1rem"}}>{RACES_MAP[myRace]||"⚔️"}</span>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gold)"}}>{myName}</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",color:"#66BB6A"}}>{myScore}</div>
          </div>
        </div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.6rem",color:timer<=5?"#E53935":"var(--gold)",animation:timer<=5?"gP .5s ease infinite":"none",transition:"color .3s"}}>{timer}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexDirection:"row-reverse"}}>
          <span style={{fontSize:"1.1rem"}}>{RACES_MAP[opponent?.race]||"⚔️"}</span>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"#EF9A9A"}}>{opponent?.name}</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",color:"#EF9A9A"}}>{opScore}</div>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{height:4,background:"rgba(201,168,76,.1)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${progress}%`,background:modeColor,transition:"width .3s",borderRadius:2}}/>
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",textAlign:"center"}}>{qIdx+1} / {questions.length}</div>
      {/* Question */}
      <div style={{padding:"18px 16px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.18)",borderRadius:6,textAlign:"center"}}>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1.05rem",color:"var(--text)",lineHeight:1.5}}>{q.q}</div>
      </div>
      {/* Answers */}
      <div style={{display:"flex",flexDirection:"column",gap:8,flex:1}}>
        {q.opts.map((opt,i)=>{
          const isCorrect=i===q.c;
          const isSelected=answered&&myAnswers[qIdx]?.idx===i;
          const showResult=answered;
          let bg="rgba(0,0,0,.25)";let bc="rgba(201,168,76,.12)";let col="var(--text)";
          if(showResult&&isCorrect){bg="rgba(102,187,106,.12)";bc="#66BB6A";col="#66BB6A";}
          if(showResult&&isSelected&&!isCorrect){bg="rgba(229,57,53,.12)";bc="#E53935";col="#EF9A9A";}
          return <button key={i} onClick={()=>handleAnswer(i)} disabled={answered} style={{padding:"14px 16px",background:bg,border:`1.5px solid ${bc}`,color:col,fontFamily:"'EB Garamond',serif",fontSize:".92rem",cursor:answered?"default":"pointer",borderRadius:5,transition:"all .2s",textAlign:"left",opacity:showResult&&!isCorrect&&!isSelected?.4:1}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",marginRight:8}}>{["A","B","C","D"][i]}.</span>{opt}
          </button>;
        })}
      </div>
      {/* Timer bar */}
      <div style={{height:3,background:"rgba(201,168,76,.08)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(timer/15)*100}%`,background:timer<=5?"#E53935":modeColor,transition:"width 1s linear",borderRadius:2}}/>
      </div>
    </div>;
  }

  // ─── RESULTS PHASE ───
  if(phase==="results"){
    const won=myScore>opScore;const draw=myScore===opScore;
    return <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:16,flex:1,alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:"3.5rem",animation:"popIn .5s ease"}}>{won?"🏆":draw?"🤝":"💀"}</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:won?"#FFD700":draw?"#4DADE2":"#EF9A9A",letterSpacing:".12em"}}>{won?"Győzelem!":draw?"Döntetlen!":"Vereség!"}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:modeColor,padding:"3px 12px",background:`${modeColor}12`,border:`1px solid ${modeColor}44`,borderRadius:12}}>{mode==="risky"?"🔥 Risky":"🛡️ Normál"}</div>
      {/* Score comparison */}
      <div style={{display:"flex",gap:24,alignItems:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"1.2rem"}}>{RACES_MAP[myRace]||"⚔️"}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gold)"}}>{myName}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.5rem",color:"#66BB6A"}}>{myScore}</div>
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gm)"}}>VS</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"1.2rem"}}>{RACES_MAP[opponent?.race]||"⚔️"}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#EF9A9A"}}>{opponent?.name}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.5rem",color:"#EF9A9A"}}>{opScore}</div>
        </div>
      </div>
      {/* ELO change */}
      <div style={{padding:"12px 24px",background:eloChange>=0?"rgba(102,187,106,.08)":"rgba(229,57,53,.08)",border:`1px solid ${eloChange>=0?"rgba(102,187,106,.3)":"rgba(229,57,53,.3)"}`,borderRadius:8,textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",letterSpacing:".08em"}}>ELO VÁLTOZÁS</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.8rem",color:eloChange>=0?"#66BB6A":"#E53935"}}>{eloChange>=0?"+":""}{eloChange}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)"}}>Új ELO: <span style={{color:"var(--gold)"}}>{myElo}</span></div>
      </div>
      {/* Answers review */}
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:4}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase"}}>Válaszaid</div>
        <div style={{display:"flex",gap:4}}>
          {myAnswers.map((a,i)=><div key={i} style={{flex:1,height:6,borderRadius:3,background:a.correct?"#66BB6A":"#E53935"}}/>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10,width:"100%"}}>
        <button onClick={()=>{setPhase("select");setMyScore(0);setOpScore(0);setMyAnswers([]);setOpAnswers([]);setQIdx(0);setMatchRef(null);setOpponent(null);}} style={{flex:1,padding:"12px",background:`${modeColor}12`,border:`1px solid ${modeColor}`,color:modeColor,fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",borderRadius:4}}>Újra ⚔️</button>
        <button onClick={onBack} style={{flex:1,padding:"12px",background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",borderRadius:4}}>Vissza</button>
      </div>
    </div>;
  }
  return null;
}

// ── SLOT MACHINE — Középföld Villám (Coin UP: Lightning style) ──────────────
const SLOT_SYMBOLS=[
  {id:"ring",icon:"💍",name:"Gyűrű",value:50,color:"#FFD700"},
  {id:"sword",icon:"⚔️",name:"Kard",value:20,color:"#A0A0C0"},
  {id:"gem",icon:"💎",name:"Drágakő",value:15,color:"#4DADE2"},
  {id:"shield",icon:"🛡️",name:"Pajzs",value:10,color:"#A0522D"},
  {id:"potion",icon:"🧪",name:"Bájital",value:8,color:"#66BB6A"},
  {id:"scroll",icon:"📜",name:"Tekercs",value:5,color:"#C9A84C"},
  {id:"coin",icon:"🪙",name:"Érme",value:3,color:"#E8C96A"},
  {id:"rune",icon:"ᚠ",name:"Rúna",value:2,color:"#7A4ABB"},
];
const SLOT_JACKPOTS=[
  {id:"mini",name:"Mini",mult:10,color:"#A0A0C0",icon:"⚡"},
  {id:"minor",name:"Minor",mult:25,color:"#4DADE2",icon:"⚡⚡"},
  {id:"major",name:"Major",mult:75,color:"#B39DDB",icon:"⚡⚡⚡"},
  {id:"grand",name:"GRAND",mult:500,color:"#FFD700",icon:"🌩️"},
];
const SLOT_BOOSTERS=[
  {id:"coin_up",name:"Coin Up",icon:"⬆️",desc:"Oszlop értékek ×2",color:"#4DADE2"},
  {id:"multi_up",name:"Multi Up",icon:"✖️",desc:"Oszlop szorzó ×2-5",color:"#B39DDB"},
  {id:"super_coin",name:"Super Coin",icon:"⬆️⬆️",desc:"MINDEN érték ×2",color:"#FFD700"},
  {id:"super_multi",name:"Super Multi",icon:"✖️✖️",desc:"MINDEN szorzó ×3",color:"#E53935"},
];

function SlotMachine({onBack,onAddScore}){
  const user=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_current"));}catch{return null;}})[0];
  const totalScore=useState(()=>{try{const s=JSON.parse(localStorage.getItem("hobbit_task_scores")||"{}");return Object.values(s).reduce((a,b)=>a+b,0);}catch{return 0;}})[0];
  const [bet,setBet]=useState(10);
  const [balance,setBalance]=useState(()=>{const b=localStorage.getItem("hobbit_slot_balance");return b?parseInt(b):1000;});
  const [grid,setGrid]=useState(()=>{const g=[];for(let r=0;r<3;r++){g[r]=[];for(let c=0;c<3;c++)g[r][c]=SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)];}return g;});
  const [boosters,setBoosters]=useState([null,null,null]); // top row per column
  const [spinning,setSpinning]=useState(false);
  const [spinReels,setSpinReels]=useState([false,false,false]);
  const [winLines,setWinLines]=useState([]);
  const [lastWin,setLastWin]=useState(0);
  const [bonusMode,setBonusMode]=useState(false); // hold & respin mode
  const [respins,setRespins]=useState(0);
  const [locked,setLocked]=useState(()=>{const l=[];for(let r=0;r<3;r++){l[r]=[];for(let c=0;c<3;c++)l[r][c]=false;}return l;});
  const [coinValues,setCoinValues]=useState(()=>{const v=[];for(let r=0;r<3;r++){v[r]=[];for(let c=0;c<3;c++)v[r][c]=0;}return v;});
  const [multipliers,setMultipliers]=useState([1,1,1]); // per-column multiplier
  const [globalMult,setGlobalMult]=useState(1);
  const [jackpot,setJackpot]=useState(null);
  const [totalBonusWin,setTotalBonusWin]=useState(0);
  const [showResult,setShowResult]=useState(false);
  const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_slot_history")||"[]");}catch{return[];}});
  const [flash,setFlash]=useState(null); // lightning flash effect
  const spinRef=useRef(null);

  const saveBalance=(b)=>{setBalance(b);localStorage.setItem("hobbit_slot_balance",String(b));};
  const BETS=[5,10,25,50,100,250,500];

  // Refill balance from score points
  const refill=(amount)=>{
    if(totalScore<amount)return;
    onAddScore?.("slot_refill_"+Date.now(),-amount);
    saveBalance(balance+amount);
    sfx.coin?.();
  };

  // Generate random symbol
  const randSym=()=>SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)];

  // Generate random booster (rare)
  const randBooster=()=>{
    const r=Math.random();
    if(r<0.03)return SLOT_BOOSTERS[3]; // super multi 3%
    if(r<0.08)return SLOT_BOOSTERS[2]; // super coin 5%
    if(r<0.18)return SLOT_BOOSTERS[1]; // multi up 10%
    if(r<0.32)return SLOT_BOOSTERS[0]; // coin up 14%
    return null; // 68% nothing
  };

  // Check paylines (3 rows horizontal)
  const checkWins=(g)=>{
    const wins=[];
    for(let row=0;row<3;row++){
      if(g[row][0].id===g[row][1].id&&g[row][1].id===g[row][2].id){
        wins.push({row,symbol:g[row][0],payout:g[row][0].value*bet});
      }
    }
    // 3 of same in any diagonal
    if(g[0][0].id===g[1][1].id&&g[1][1].id===g[2][2].id){
      wins.push({row:"diag1",symbol:g[1][1],payout:g[1][1].value*bet});
    }
    if(g[0][2].id===g[1][1].id&&g[1][1].id===g[2][0].id){
      wins.push({row:"diag2",symbol:g[1][1],payout:g[1][1].value*bet});
    }
    return wins;
  };

  // Count coins on grid (for bonus mode)
  const countCoins=(g)=>{let c=0;for(let r=0;r<3;r++)for(let col=0;col<3;col++)if(g[r][col].id==="coin")c++;return c;};

  // Check if bonus triggered (3+ coins)
  const checkBonus=(g)=>countCoins(g)>=3;

  // MAIN SPIN
  const doSpin=()=>{
    if(spinning||balance<bet)return;
    saveBalance(balance-bet);
    setWinLines([]);setLastWin(0);setShowResult(false);setJackpot(null);
    setSpinning(true);

    // Generate new grid
    const newGrid=[];
    for(let r=0;r<3;r++){newGrid[r]=[];for(let c=0;c<3;c++)newGrid[r][c]=randSym();}
    // Generate boosters
    const newBoosters=[randBooster(),randBooster(),randBooster()];

    // Staggered reel stop animation
    setSpinReels([true,true,true]);
    sfx.dice?.();

    setTimeout(()=>{
      setSpinReels([false,true,true]);setGrid(g=>{const n=[...g];n[0]=newGrid[0];return n.map(r=>[...r]);});
      // Reconstruct properly
      setGrid([newGrid[0].map(s=>({...s})),[...grid[1]],[...grid[2]]]);
      sfx.click?.();
    },400);
    setTimeout(()=>{
      setSpinReels([false,false,true]);
      setGrid([newGrid[0].map(s=>({...s})),newGrid[1].map(s=>({...s})),[...grid[2]]]);
      sfx.click?.();
    },700);
    setTimeout(()=>{
      setSpinReels([false,false,false]);
      const finalGrid=newGrid.map(r=>r.map(s=>({...s})));
      setGrid(finalGrid);
      setBoosters(newBoosters);
      sfx.click?.();
      setSpinning(false);

      // Check for bonus trigger
      if(checkBonus(finalGrid)){
        sfx.achievement?.();
        setFlash("⚡");setTimeout(()=>setFlash(null),800);
        // Enter bonus mode
        const initLocked=[];const initValues=[];
        for(let r=0;r<3;r++){initLocked[r]=[];initValues[r]=[];for(let c=0;c<3;c++){
          if(finalGrid[r][c].id==="coin"){initLocked[r][c]=true;initValues[r][c]=Math.floor(Math.random()*5+1)*bet;}
          else{initLocked[r][c]=false;initValues[r][c]=0;}
        }}
        setLocked(initLocked);setCoinValues(initValues);
        setMultipliers([1,1,1]);setGlobalMult(1);
        setBonusMode(true);setRespins(3);setTotalBonusWin(0);
        return;
      }

      // Check payline wins
      const wins=checkWins(finalGrid);
      if(wins.length>0){
        const total=wins.reduce((a,w)=>a+w.payout,0);
        setWinLines(wins);setLastWin(total);
        saveBalance(balance-bet+total);
        sfx.success?.();
        setFlash("💰");setTimeout(()=>setFlash(null),600);
      }
    },1000);
  };

  // BONUS RESPIN
  const doBonusRespin=()=>{
    if(spinning||respins<=0)return;
    setSpinning(true);setRespins(r=>r-1);
    sfx.dice?.();

    setTimeout(()=>{
      let newCoin=false;
      const newGrid=grid.map(r=>r.map(s=>({...s})));
      const newLocked=locked.map(r=>[...r]);
      const newValues=coinValues.map(r=>[...r]);
      const newBoosters=[...boosters];

      // Spin only unlocked cells
      for(let r=0;r<3;r++)for(let c=0;c<3;c++){
        if(!newLocked[r][c]){
          const sym=randSym();
          newGrid[r][c]=sym;
          if(sym.id==="coin"){
            newLocked[r][c]=true;
            newValues[r][c]=Math.floor(Math.random()*8+1)*bet;
            newCoin=true;
          }
        }
      }
      // Random booster on respin
      for(let c=0;c<3;c++){if(!newBoosters[c])newBoosters[c]=randBooster();}

      setGrid(newGrid);setLocked(newLocked);setCoinValues(newValues);setBoosters(newBoosters);
      setSpinning(false);

      if(newCoin){
        setRespins(3); // reset respins!
        sfx.success?.();setFlash("⚡");setTimeout(()=>setFlash(null),600);
      }

      // Apply boosters
      const newMults=[...multipliers];let newGlobal=globalMult;
      for(let c=0;c<3;c++){
        if(newBoosters[c]?.id==="coin_up"){for(let r=0;r<3;r++)if(newLocked[r][c])newValues[r][c]*=2;}
        if(newBoosters[c]?.id==="multi_up"){newMults[c]*=(2+Math.floor(Math.random()*3));}
        if(newBoosters[c]?.id==="super_coin"){for(let r=0;r<3;r++)for(let cc=0;cc<3;cc++)if(newLocked[r][cc])newValues[r][cc]*=2;}
        if(newBoosters[c]?.id==="super_multi"){newGlobal*=3;}
      }
      setCoinValues(newValues);setMultipliers(newMults);setGlobalMult(newGlobal);

      // Check if grid is full → GRAND JACKPOT
      let allFull=true;
      for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(!newLocked[r][c])allFull=false;
      if(allFull){
        setFlash("🌩️");
        setJackpot(SLOT_JACKPOTS[3]); // GRAND
        sfx.achievement?.();
      }

      // Check if respins exhausted
      if(!newCoin&&respins<=1){
        // End bonus — calculate total
        setTimeout(()=>{
          let total=0;
          for(let r=0;r<3;r++)for(let c=0;c<3;c++){
            if(newLocked[r][c])total+=newValues[r][c]*newMults[c]*newGlobal;
          }
          // Jackpot check (not grand — random based on coins)
          const coinCount=countCoins(newGrid);
          if(!allFull&&coinCount>=6){setJackpot(SLOT_JACKPOTS[2]);total+=SLOT_JACKPOTS[2].mult*bet;} // Major
          else if(!allFull&&coinCount>=5){setJackpot(SLOT_JACKPOTS[1]);total+=SLOT_JACKPOTS[1].mult*bet;} // Minor
          else if(!allFull&&coinCount>=4&&Math.random()<0.5){setJackpot(SLOT_JACKPOTS[0]);total+=SLOT_JACKPOTS[0].mult*bet;} // Mini
          if(allFull)total+=SLOT_JACKPOTS[3].mult*bet;

          setTotalBonusWin(Math.round(total));
          saveBalance(balance+Math.round(total));
          setShowResult(true);
          sfx.achievement?.();
          setFlash("💰");setTimeout(()=>setFlash(null),1000);
          // Save history
          const entry={bet,win:Math.round(total),jackpot:jackpot?.id||null,time:Date.now()};
          const h=[entry,...history].slice(0,20);setHistory(h);localStorage.setItem("hobbit_slot_history",JSON.stringify(h));
        },800);
      }
    },600);
  };

  // End bonus and return to normal
  const endBonus=()=>{
    setBonusMode(false);setShowResult(false);setJackpot(null);
    setLocked(()=>{const l=[];for(let r=0;r<3;r++){l[r]=[];for(let c=0;c<3;c++)l[r][c]=false;}return l;});
    setCoinValues(()=>{const v=[];for(let r=0;r<3;r++){v[r]=[];for(let c=0;c<3;c++)v[r][c]=0;}return v;});
    setBoosters([null,null,null]);setMultipliers([1,1,1]);setGlobalMult(1);
  };

  // Buy bonus modes
  const buyBonus=(tier)=>{
    const costs={standard:30,ultra:75,thunder:150};
    const cost=costs[tier]*bet;
    if(balance<cost)return;
    saveBalance(balance-cost);
    sfx.coin?.();
    // Pre-fill grid with coins and boosters
    const newGrid=[];const initLocked=[];const initValues=[];
    const coinChance=tier==="thunder"?0.6:tier==="ultra"?0.45:0.35;
    for(let r=0;r<3;r++){newGrid[r]=[];initLocked[r]=[];initValues[r]=[];for(let c=0;c<3;c++){
      if(Math.random()<coinChance){
        newGrid[r][c]=SLOT_SYMBOLS.find(s=>s.id==="coin");
        initLocked[r][c]=true;
        const valMult=tier==="thunder"?8:tier==="ultra"?5:3;
        initValues[r][c]=Math.floor(Math.random()*valMult+1)*bet;
      }else{newGrid[r][c]=randSym();initLocked[r][c]=false;initValues[r][c]=0;}
    }}
    const newBoosters=tier==="thunder"
      ?[SLOT_BOOSTERS[3],SLOT_BOOSTERS[2],SLOT_BOOSTERS[1]]
      :tier==="ultra"
        ?[SLOT_BOOSTERS[Math.floor(Math.random()*2)],randBooster(),SLOT_BOOSTERS[Math.floor(Math.random()*2)]]
        :[randBooster(),randBooster(),randBooster()];
    setGrid(newGrid);setLocked(initLocked);setCoinValues(initValues);setBoosters(newBoosters);
    setMultipliers([1,1,1]);setGlobalMult(tier==="thunder"?2:1);
    setBonusMode(true);setRespins(3);setTotalBonusWin(0);setShowResult(false);setJackpot(null);
    setFlash("⚡");setTimeout(()=>setFlash(null),800);
    sfx.achievement?.();
  };

  const lightningGlow=bonusMode?"0 0 40px rgba(77,173,226,.3),0 0 80px rgba(77,173,226,.1)":"none";

  return <div style={{padding:"12px",display:"flex",flexDirection:"column",gap:10,flex:1,position:"relative",overflow:"hidden"}}>
    {/* Lightning flash overlay */}
    {flash&&<div style={{position:"absolute",inset:0,background:"radial-gradient(circle,rgba(77,173,226,.15),transparent 70%)",zIndex:10,pointerEvents:"none",animation:"popIn .3s ease",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4rem"}}>{flash}</div>}

    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button onClick={onBack} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"4px 12px",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer"}}>← Vissza</button>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".85rem",color:"#4DADE2",letterSpacing:".08em",textShadow:"0 0 20px rgba(77,173,226,.4)"}}>⚡ Középföld Villám</div>
    </div>

    {/* Balance */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"rgba(0,0,0,.3)",border:"1px solid rgba(77,173,226,.15)",borderRadius:4}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)"}}>Egyenleg</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"#FFD700"}}>{balance.toLocaleString()} 🪙</div>
    </div>

    {/* Jackpot tiers */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
      {SLOT_JACKPOTS.map(j=><div key={j.id} style={{padding:"4px",textAlign:"center",background:`${j.color}08`,border:`1px solid ${j.color}${jackpot?.id===j.id?"":"22"}`,borderRadius:3,animation:jackpot?.id===j.id?"gP 1s ease infinite":"none",boxShadow:jackpot?.id===j.id?`0 0 20px ${j.color}66`:"none"}}>
        <div style={{fontSize:".55rem"}}>{j.icon}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".4rem",color:j.color}}>{j.name}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".5rem",color:j.color}}>×{j.mult}</div>
      </div>)}
    </div>

    {/* Booster row (top row) */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>
      {boosters.map((b,i)=><div key={i} style={{padding:"4px 6px",textAlign:"center",background:b?`${b.color}12`:"rgba(0,0,0,.2)",border:`1px solid ${b?b.color+"44":"rgba(77,173,226,.08)"}`,borderRadius:3,minHeight:24}}>
        {b?<><span style={{fontSize:".6rem"}}>{b.icon}</span><span style={{fontFamily:"'Cinzel',serif",fontSize:".35rem",color:b.color,marginLeft:3}}>{b.name}</span></>
          :<span style={{fontSize:".5rem",color:"rgba(77,173,226,.2)"}}>—</span>}
      </div>)}
    </div>

    {/* GRID */}
    <div style={{background:"rgba(0,0,0,.5)",border:`2px solid ${bonusMode?"rgba(77,173,226,.4)":"rgba(201,168,76,.15)"}`,borderRadius:8,padding:8,boxShadow:lightningGlow,transition:"all .5s"}}>
      {/* Multiplier indicators */}
      {bonusMode&&(globalMult>1||multipliers.some(m=>m>1))&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:4}}>
        {multipliers.map((m,i)=><div key={i} style={{textAlign:"center",fontFamily:"'Cinzel Decorative',serif",fontSize:".5rem",color:m*globalMult>1?"#B39DDB":"transparent"}}>×{m*globalMult}</div>)}
      </div>}
      {/* 3x3 Grid */}
      <div style={{display:"grid",gridTemplateRows:"repeat(3,1fr)",gap:4}}>
        {[0,1,2].map(row=><div key={row} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>
          {[0,1,2].map(col=>{
            const sym=grid[row][col];
            const isLocked=locked[row][col];
            const coinVal=coinValues[row][col];
            const isSpinning=spinReels[row];
            const isWin=winLines.some(w=>w.row===row||(w.row==="diag1"&&row===col)||(w.row==="diag2"&&row+col===2));
            return <div key={col} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:isLocked?"rgba(77,173,226,.12)":isWin?"rgba(255,215,0,.08)":"rgba(0,0,0,.3)",border:`1.5px solid ${isLocked?"rgba(77,173,226,.5)":isWin?"rgba(255,215,0,.4)":"rgba(201,168,76,.08)"}`,borderRadius:6,transition:"all .3s",animation:isSpinning?"spin .3s linear infinite":isWin?"gP 1s ease infinite":"none",boxShadow:isLocked?`0 0 15px rgba(77,173,226,.3)${coinVal>bet*5?",0 0 30px rgba(255,215,0,.2)":""}`:isWin?`0 0 15px rgba(255,215,0,.3)`:"none",position:"relative"}}>
              <span style={{fontSize:"clamp(1.5rem,6vw,2.2rem)",filter:isLocked?"drop-shadow(0 0 8px rgba(77,173,226,.6))":isWin?`drop-shadow(0 0 8px ${sym.color})`:"none",transition:"all .3s"}}>{sym.icon}</span>
              {isLocked&&coinVal>0&&<div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.4rem,1.5vw,.55rem)",color:"#4DADE2",textShadow:"0 0 8px rgba(77,173,226,.5)"}}>{coinVal}</div>}
              {isLocked&&<div style={{position:"absolute",top:2,right:3,fontSize:".35rem",color:"rgba(77,173,226,.6)"}}>🔒</div>}
            </div>;
          })}
        </div>)}
      </div>
    </div>

    {/* Win display */}
    {lastWin>0&&!bonusMode&&<div style={{textAlign:"center",padding:"6px",background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",borderRadius:4,animation:"popIn .3s ease"}}>
      <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"#FFD700"}}>+{lastWin.toLocaleString()} 🪙</span>
    </div>}

    {/* Bonus mode UI */}
    {bonusMode&&!showResult&&<div style={{textAlign:"center",padding:"8px",background:"rgba(77,173,226,.06)",border:"1px solid rgba(77,173,226,.25)",borderRadius:4}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".7rem",color:"#4DADE2",letterSpacing:".1em",animation:"gP 2s ease infinite"}}>⚡ VILLÁM BÓNUSZ ⚡</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",marginTop:4}}>Respinek: <span style={{color:"#FFD700",fontSize:".7rem"}}>{respins}</span> • Új érme = respin reset!</div>
      <button onClick={doBonusRespin} disabled={spinning} style={{marginTop:8,padding:"10px 28px",background:spinning?"rgba(77,173,226,.05)":"rgba(77,173,226,.12)",border:`2px solid ${spinning?"rgba(77,173,226,.1)":"rgba(77,173,226,.5)"}`,color:spinning?"var(--gm)":"#4DADE2",fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",cursor:spinning?"not-allowed":"pointer",borderRadius:6,letterSpacing:".08em",transition:"all .3s"}}>⚡ RESPIN</button>
    </div>}

    {/* Bonus result */}
    {showResult&&<div style={{textAlign:"center",padding:"16px",background:"rgba(0,0,0,.6)",border:"2px solid rgba(255,215,0,.4)",borderRadius:8,animation:"popIn .4s ease"}}>
      {jackpot&&<div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:jackpot.color,animation:"gP 1s ease infinite",marginBottom:8}}>{jackpot.icon} {jackpot.name} JACKPOT! {jackpot.icon}</div>}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)"}}>Összes nyeremény</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.8rem",color:"#FFD700",textShadow:"0 0 20px rgba(255,215,0,.5)",animation:"gP 2s ease infinite"}}>+{totalBonusWin.toLocaleString()} 🪙</div>
      {globalMult>1&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"#B39DDB",marginTop:4}}>Globális szorzó: ×{globalMult}</div>}
      <button onClick={endBonus} style={{marginTop:12,padding:"10px 24px",background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.4)",color:"#FFD700",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer",borderRadius:4}}>Bezárás ✓</button>
    </div>}

    {/* Normal spin controls */}
    {!bonusMode&&<>
      {/* Bet selector */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)"}}>Tét:</span>
        {BETS.map(b=><button key={b} onClick={()=>setBet(b)} style={{padding:"3px 8px",background:bet===b?"rgba(77,173,226,.15)":"rgba(0,0,0,.2)",border:`1px solid ${bet===b?"rgba(77,173,226,.4)":"rgba(201,168,76,.08)"}`,color:bet===b?"#4DADE2":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".45rem",cursor:"pointer",borderRadius:3}}>{b}</button>)}
      </div>

      {/* Spin button */}
      <button onClick={doSpin} disabled={spinning||balance<bet} style={{padding:"14px",background:spinning?"rgba(0,0,0,.3)":"linear-gradient(135deg,rgba(77,173,226,.12),rgba(179,157,219,.08))",border:`2px solid ${spinning?"rgba(77,173,226,.1)":"rgba(77,173,226,.5)"}`,color:spinning?"var(--gm)":"#4DADE2",fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",cursor:spinning?"not-allowed":"pointer",borderRadius:8,letterSpacing:".1em",transition:"all .3s",textShadow:spinning?"none":"0 0 15px rgba(77,173,226,.4)"}}>
        {spinning?"Pörög...":"⚡ PÖRGETÉS ⚡"}
      </button>

      {/* Buy bonus buttons */}
      <div style={{display:"flex",gap:6}}>
        {[{id:"standard",label:"Bónusz",cost:30,color:"#4DADE2"},{id:"ultra",label:"Ultra",cost:75,color:"#B39DDB"},{id:"thunder",label:"Villám",cost:150,color:"#FFD700"}].map(t=>{
          const c=t.cost*bet;const canBuy=balance>=c;
          return <button key={t.id} onClick={()=>canBuy&&buyBonus(t.id)} style={{flex:1,padding:"8px 4px",background:canBuy?`${t.color}08`:"rgba(0,0,0,.2)",border:`1px solid ${canBuy?t.color+"44":"rgba(201,168,76,.06)"}`,color:canBuy?t.color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".45rem",cursor:canBuy?"pointer":"not-allowed",borderRadius:4,opacity:canBuy?1:.4,textAlign:"center"}}>
            <div>{t.label}</div>
            <div style={{fontSize:".4rem",marginTop:2}}>{c.toLocaleString()}🪙</div>
          </button>;
        })}
      </div>

      {/* Refill */}
      {balance<bet&&<div style={{textAlign:"center",padding:"8px",background:"rgba(229,57,53,.06)",border:"1px solid rgba(229,57,53,.2)",borderRadius:4}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"#EF9A9A",marginBottom:6}}>Elfogyott az érméd!</div>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {[500,2000,5000].map(a=><button key={a} onClick={()=>refill(a)} style={{padding:"5px 10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".5rem",cursor:"pointer",borderRadius:3}}>+{a}🪙 ({a}pt)</button>)}
        </div>
      </div>}
    </>}

    {/* History */}
    {history.length>0&&!bonusMode&&<div style={{padding:"8px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.08)",borderRadius:4}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>Utolsó pörgetések</div>
      <div style={{display:"flex",gap:4,overflowX:"auto"}}>
        {history.slice(0,8).map((h,i)=><div key={i} style={{padding:"3px 6px",background:h.win>0?"rgba(102,187,106,.06)":"rgba(0,0,0,.2)",border:`1px solid ${h.win>0?"rgba(102,187,106,.15)":"rgba(201,168,76,.06)"}`,borderRadius:3,whiteSpace:"nowrap",minWidth:50,textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".38rem",color:h.win>0?"#66BB6A":"var(--gm)"}}>{h.win>0?`+${h.win}`:"-"+h.bet}</div>
          {h.jackpot&&<div style={{fontSize:".3rem",color:"#FFD700"}}>⚡{h.jackpot}</div>}
        </div>)}
      </div>
    </div>}
  </div>;
}

function TavernChat(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [expanded,setExpanded]=useState(false);
  const endRef=useRef(null);
  const user=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_current"));}catch{return null;}})[0];
  const myName=user?.adventureName;
  const myRace=user?.race||"human";

  useEffect(()=>{
    try{
      const {getDatabase,ref:fbRef,onValue,off,query,limitToLast}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const chatRef=query(fbRef(db,"global_chat"),limitToLast(50));
      onValue(chatRef,(snap)=>{
        const data=snap.val()||{};
        setMessages(Object.values(data).sort((a,b)=>a.ts-b.ts));
      });
      return ()=>off(chatRef);
    }catch(e){}
  },[]);

  useEffect(()=>{if(expanded)endRef.current?.scrollIntoView({behavior:"smooth"});},[messages,expanded]);

  const send=()=>{
    const text=input.trim();
    if(!text||!myName)return;
    try{
      const {getDatabase,ref:fbRef,push,set}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const msgRef=push(fbRef(db,"global_chat"));
      set(msgRef,{from:myName,race:myRace,text,ts:Date.now()});
      setInput("");
    }catch(e){}
  };

  if(!expanded)return <button onClick={()=>setExpanded(true)} style={{margin:"0 16px 10px",padding:"10px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.15)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:".1em",flexShrink:0}}>💬 Fogadó Chat {messages.length>0&&<span style={{background:"rgba(201,168,76,.15)",padding:"1px 6px",borderRadius:8,fontSize:".55rem",color:"var(--gold)"}}>{messages.length}</span>}</button>;

  return <div style={{margin:"0 10px 8px",border:"1px solid rgba(201,168,76,.18)",background:"rgba(0,0,0,.3)",display:"flex",flexDirection:"column",maxHeight:220,flexShrink:0,animation:"fadeSlideIn .25s ease both"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",borderBottom:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gold)",letterSpacing:".1em"}}>💬 Fogadó Chat</div>
      <button onClick={()=>setExpanded(false)} style={{background:"none",border:"none",color:"var(--gm)",cursor:"pointer",fontSize:".7rem",padding:"2px 6px"}}>▼</button>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"6px 10px",display:"flex",flexDirection:"column",gap:4}}>
      {messages.length===0&&<div style={{textAlign:"center",padding:"12px 0",opacity:.4,fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)"}}>Még senki sem szólt...</div>}
      {messages.map((m,i)=>{
        const isMe=m.from===myName;
        const r=RACES.find(r=>r.id===m.race)||RACES[3];
        return <div key={i} style={{display:"flex",gap:6,alignItems:isMe?"flex-end":"flex-start",flexDirection:isMe?"row-reverse":"row"}}>
          <span style={{fontSize:".7rem",flexShrink:0}}>{r.icon}</span>
          <div style={{maxWidth:"75%"}}>
            {!isMe&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:r.color,marginBottom:1}}>{m.from}</div>}
            <div style={{padding:"4px 8px",background:isMe?"rgba(201,168,76,.08)":"rgba(58,122,139,.06)",border:`1px solid ${isMe?"rgba(201,168,76,.2)":"rgba(58,122,139,.15)"}`,borderRadius:isMe?"8px 8px 2px 8px":"8px 8px 8px 2px",fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--text)",lineHeight:1.3,wordBreak:"break-word"}}>{m.text}</div>
          </div>
        </div>;
      })}
      <div ref={endRef}/>
    </div>
    <div style={{display:"flex",gap:6,padding:"6px 8px",borderTop:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
      <input value={input} onChange={e=>setInput(e.target.value.slice(0,200))} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Üzenet a fogadóban..." style={{flex:1,background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.15)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".82rem",padding:"6px 10px",outline:"none",borderRadius:3}}/>
      <button onClick={send} style={{padding:"6px 12px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".6rem",cursor:"pointer",borderRadius:3}}>›</button>
    </div>
  </div>;
}

function MiniGamesTab({onAddScore}){
  const [activeGame,setActiveGame]=useState(null);
  const [showDuel,setShowDuel]=useState(false);
  const [showSlot,setShowSlot]=useState(false);
  const [carouselIdx,setCarouselIdx]=useState(0);
  const touchRef=useRef(null);
  const games=[
    {id:"memory",label:"Tolkien Memória",icon:"🃏",desc:"Találd meg a párokat!",color:"#C9A84C"},
    {id:"reaction",label:"Kalandor Reflexek",icon:"⚡",desc:"Barát vagy ellenség?",color:"#7A4ABB"},
    {id:"wordsearch",label:"Tolkien Szókereső",icon:"🔍",desc:"Keresd meg a neveket!",color:"#3A7A8B"},
    {id:"riddle",label:"Gollam Rejtvények",icon:"🕯️",desc:"Fejtsd meg a találós kérdéseket!",color:"#6B8C3E"},
    {id:"archery",label:"Bard Íjász Kihívás",icon:"🏹",desc:"Célozz gyorsan és pontosan!",color:"#A0522D"},
    {id:"treasure",label:"Erebor Kincstár",icon:"💎",desc:"Keresd meg Smaug kincseit!",color:"#E8C96A"},
  ];
  const swipeStart=(e)=>{touchRef.current=e.touches?e.touches[0].clientX:e.clientX;};
  const swipeEnd=(e)=>{if(touchRef.current===null)return;const end=e.changedTouches?e.changedTouches[0].clientX:e.clientX;const diff=touchRef.current-end;if(Math.abs(diff)>50){if(diff>0&&carouselIdx<games.length-1)setCarouselIdx(i=>i+1);else if(diff<0&&carouselIdx>0)setCarouselIdx(i=>i-1);}touchRef.current=null;};
  const startGame=(gid)=>{
    setActiveGame(gid);
    try{const plays=JSON.parse(localStorage.getItem("hobbit_minigame_plays")||"{}");plays[gid]=(plays[gid]||0)+1;plays["_t_"+gid]=Date.now();localStorage.setItem("hobbit_minigame_plays",JSON.stringify(plays));}catch(e){}
  };
  if(showDuel)return <div className="gentle-pop" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}><DuelMode onBack={()=>setShowDuel(false)}/></div>;
  if(showSlot)return <div className="gentle-pop" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"auto"}}><SlotMachine onBack={()=>setShowSlot(false)} onAddScore={onAddScore}/></div>;
  if(activeGame){
    const GAME_MAP={memory:MemoryGame,reaction:ReactionGame,wordsearch:WordSearch,riddle:RiddleGame,archery:ArcheryGame,treasure:TreasureGame};
    const GameComp=GAME_MAP[activeGame]||MemoryGame;
    return <div className="gentle-pop" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid rgba(201,168,76,.12)",flexShrink:0,gap:10}}>
        <button onClick={()=>setActiveGame(null)} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"4px 10px",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.target.style.borderColor="var(--gold)";e.target.style.color="var(--gold)";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(201,168,76,.2)";e.target.style.color="var(--gm)";}}>← Vissza</button>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)",letterSpacing:".08em"}}>{games.find(g=>g.id===activeGame)?.icon} {games.find(g=>g.id===activeGame)?.label}</div>
      </div>
      <div style={{flex:1,overflow:"hidden"}}><GameComp/></div>
    </div>;
  }
  return <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
    {/* Tavern header */}
    <div style={{padding:"16px 16px 10px",textAlign:"center",flexShrink:0}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.85rem,2.5vw,1.1rem)",color:"var(--gold)",letterSpacing:".08em"}}>A Zöld Sárkány Fogadó</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)",letterSpacing:".12em",marginTop:3,textTransform:"uppercase"}}>— Válassz játékot —</div>
    </div>
    {/* Carousel */}
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 0",overflow:"hidden",position:"relative"}} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
      {carouselIdx>0&&<button onClick={()=>setCarouselIdx(i=>i-1)} style={{position:"absolute",left:"15%",zIndex:5,width:40,height:40,borderRadius:"50%",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>←</button>}
      <div style={{display:"flex",transition:"transform .4s cubic-bezier(.22,1,.36,1)",transform:`translateX(calc(50% - min(130px,35vw) - ${carouselIdx} * (min(260px,70vw) + 16px)))`,gap:16}}>
        {games.map((g,i)=>{
          const isActive=i===carouselIdx;
          return <div key={g.id} onClick={()=>isActive&&startGame(g.id)} style={{minWidth:"min(260px,70vw)",maxWidth:280,padding:"28px 20px",background:isActive?"rgba(201,168,76,.06)":"rgba(0,0,0,.2)",border:`1px solid ${isActive?g.color:"rgba(201,168,76,.1)"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:14,cursor:isActive?"pointer":"default",transition:"all .35s",transform:isActive?"scale(1)":"scale(.88)",opacity:isActive?1:.4,boxShadow:isActive?`0 0 30px ${g.color}22`:"none",flexShrink:0}}>
            <div style={{fontSize:"3rem",filter:isActive?`drop-shadow(0 0 12px ${g.color})`:"grayscale(.6)"}}>{g.icon}</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.9rem,2.5vw,1.1rem)",color:isActive?g.color:"var(--gm)",textAlign:"center"}}>{g.label}</div>
            <div style={{fontStyle:"italic",fontSize:".85rem",color:"var(--td)",textAlign:"center",lineHeight:1.5}}>{g.desc}</div>
            {isActive&&<button className="btn-nq" style={{marginTop:4}}>Játék Indítása →</button>}
          </div>;
        })}
      </div>
      {carouselIdx<games.length-1&&<button onClick={()=>setCarouselIdx(i=>i+1)} style={{position:"absolute",right:"15%",zIndex:5,width:40,height:40,borderRadius:"50%",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>→</button>}
    </div>
    {/* Dots */}
    <div style={{display:"flex",justifyContent:"center",gap:8,padding:"10px 0 8px",flexShrink:0}}>
      {games.map((g,i)=><button key={i} onClick={()=>setCarouselIdx(i)} style={{width:i===carouselIdx?20:8,height:8,borderRadius:4,background:i===carouselIdx?g.color:"rgba(201,168,76,.15)",border:"none",cursor:"pointer",transition:"all .3s"}}/>)}
    </div>
    {/* Special modes */}
    <div style={{display:"flex",gap:6,margin:"0 16px 8px"}}>
      <button onClick={()=>setShowDuel(true)} style={{flex:1,padding:"10px",background:"linear-gradient(135deg,rgba(77,173,226,.06),rgba(229,57,53,.04))",border:"1px solid rgba(201,168,76,.2)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",borderRadius:4,transition:"all .3s"}}><span style={{fontSize:"1.1rem"}}>⚔️</span><span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".7rem",color:"var(--gold)",letterSpacing:".06em"}}>Párbaj</span></button>
      <button onClick={()=>setShowSlot(true)} style={{flex:1,padding:"10px",background:"linear-gradient(135deg,rgba(77,173,226,.08),rgba(179,157,219,.04))",border:"1px solid rgba(77,173,226,.2)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",borderRadius:4,transition:"all .3s"}}><span style={{fontSize:"1.1rem"}}>⚡</span><span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".7rem",color:"#4DADE2",letterSpacing:".06em"}}>Nyerőgép</span></button>
    </div>
    {/* Global tavern chat */}
    <TavernChat/>
  </div>;
}

// ── AVATAR SYSTEM ─────────────────────────────────────────────────────────────
const AVATAR_FRAMES=[
  {id:"default",name:"Egyszerű",border:"2px solid",req:null},
  {id:"gold",name:"Arany",border:"2.5px solid",glow:"0 0 12px",req:"100 pont"},
  {id:"rune",name:"Rúna",border:"2.5px dashed",glow:"0 0 16px",req:"3 feladat"},
  {id:"fire",name:"Tűz",border:"3px double",glow:"0 0 20px",req:"500 pont"},
  {id:"mithril",name:"Mithril",border:"2.5px solid",glow:"0 0 18px",innerRing:true,req:"1000 pont"},
  {id:"dragon",name:"Sárkány",border:"3px solid",glow:"0 0 24px",pulse:true,req:"10 feladat"},
  {id:"legendary",name:"Legendás",border:"3px double",glow:"0 0 30px",innerRing:true,pulse:true,req:"2000 pont"},
];
const AVATAR_TITLES=[
  {id:"wanderer",title:"Vándor",req:null},
  {id:"adventurer",title:"Kalandor",req:"1 feladat"},
  {id:"pathfinder",title:"Ösvénykereső",req:"5 feladat"},
  {id:"champion",title:"Bajnok",req:"10 feladat"},
  {id:"dragonslayer",title:"Sárkányölő",req:"15 feladat"},
  {id:"sage",title:"Bölcs",req:"1000 pont"},
  {id:"legend",title:"Legenda",req:"2500 pont"},
  {id:"fellowshipleader",title:"Szövetség Vezére",req:"3 barát"},
];
const _isAvatarUnlocked=(req,stats)=>{
  if(!req)return true;
  const m=req.match(/^(\d+)\s+(pont|feladat|barát)$/);
  if(!m)return false;
  const n=parseInt(m[1]);
  if(m[2]==="pont")return stats.score>=n;
  if(m[2]==="feladat")return stats.completed>=n;
  if(m[2]==="barát")return stats.friends>=n;
  return false;
};
const _getAvatarConfig=()=>{try{return JSON.parse(localStorage.getItem("hobbit_avatar")||"{}");}catch{return {};}};
const _saveAvatarConfig=(cfg)=>{localStorage.setItem("hobbit_avatar",JSON.stringify(cfg));};

function AvatarDisplay({race,frame,size=56,showPulse=true}){
  const f=AVATAR_FRAMES.find(a=>a.id===frame)||(()=>{const si=SHOP_ITEMS.find(s=>s.type==="frame"&&s.frameData?.id===frame);return si?{id:si.frameData.id,name:si.frameData.name,border:si.frameData.border||"2.5px solid",glow:si.frameData.glow,pulse:si.frameData.pulse,innerRing:si.frameData.innerRing}:null;})()||AVATAR_FRAMES[0];
  const fs=size>=48?"1.6rem":size>=32?"1rem":".7rem";
  return <div style={{position:"relative",width:size,height:size}}>
    {f.pulse&&showPulse&&<div style={{position:"absolute",inset:-4,borderRadius:"50%",border:`1.5px solid ${race.color}44`,animation:"avatarPulse 3s ease-in-out infinite","--rc":race.color}}/>}
    <div style={{width:size,height:size,borderRadius:"50%",border:`${f.border} ${race.color}`,background:`radial-gradient(circle,${race.color}33,rgba(0,0,0,.8))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:fs,boxShadow:f.glow?`${f.glow} ${race.color}44`:undefined}}>
      {race.icon}
    </div>
    {f.innerRing&&<div style={{position:"absolute",inset:3,borderRadius:"50%",border:`1px solid ${race.color}33`,pointerEvents:"none"}}/>}
  </div>;
}

// ── PROFILE TAB ────────────────────────────────────────────────────────────────
const RANK_TIERS=[{min:2500,label:"🏆 Középföld Mestere",color:"#FFD700"},{min:1800,label:"⚔️ Legendás Hős",color:"#C9A84C"},{min:1000,label:"🛡️ Tapasztalt Vitéz",color:"#A0A0C0"},{min:500,label:"📜 Kalandor",color:"#A0522D"},{min:100,label:"🌱 Újonc",color:"#6B8C3E"},{min:0,label:"🚶 Vándor",color:"#5A5040"}];
const getRank=(score)=>RANK_TIERS.find(r=>score>=r.min)||RANK_TIERS[RANK_TIERS.length-1];
const ELO_TIERS=[{min:2000,label:"Középföld Bajnoka",icon:"👑",color:"#FFD700"},{min:1600,label:"Legendás Harcos",icon:"⚔️",color:"#C9A84C"},{min:1200,label:"Tapasztalt Kalandor",icon:"🛡️",color:"#A0A0C0"},{min:800,label:"Újonc Vándor",icon:"🗡️",color:"#A0522D"},{min:0,label:"Kezdő",icon:"🌱",color:"#6B8C3E"}];
const getEloRank=(elo)=>ELO_TIERS.find(r=>elo>=r.min)||ELO_TIERS[ELO_TIERS.length-1];
const DAILY_CHALLENGES=[{icon:"⚔️",task:"Teljesíts 2 feladatot ma",pts:50},{icon:"💍",task:"Szerezz 200 pontot egyetlen feladatban",pts:80},{icon:"🧙",task:"Próbáld ki a Rúna Dekódolót",pts:60},{icon:"🗺️",task:"Teljesítsd a Térkép 3 feladatát",pts:100},{icon:"⏱️",task:"Teljesíts egy feladatot gyorsan",pts:70}];

// ── STORY MODE CHAPTERS ────────────────────────────────────────────────────
const STORY_CHAPTERS=[
  {id:1,title:"A Váratlan Vendégség",icon:"🏡",desc:"Bilbo békés reggele Zsákos-dombon. De Gandalf látogatása mindent megváltoztat...",color:"#6B8C3E",tasks:[1,2],reward:{pts:150,title:"Az Út Kezdete"}},
  {id:2,title:"Trollok a Sötétben",icon:"🔥",desc:"Az első veszély — három éhes troll az út mellett. Bilbo ügyessége lesz a kulcs.",color:"#A0522D",tasks:[3,4],reward:{pts:200,title:"Trollvadász"}},
  {id:3,title:"Völgyzugoly Menedéke",icon:"🏰",desc:"Elrond házában pihenő vár. De a tudás próbája is itt kezdődik.",color:"#3A7A8B",tasks:[5,6],reward:{pts:200,title:"Elrond Tanítványa"}},
  {id:4,title:"A Ködös Hegyek Mélyén",icon:"💍",desc:"Gollam barlangjában a sors elvégeztetik — Bilbo megtalálja a Gyűrűt.",color:"#9A8020",tasks:[7,13],reward:{pts:250,title:"Gyűrű Találó"}},
  {id:5,title:"Bakacsinerdő Árnyai",icon:"🌲",desc:"Az erdő mélyén pókok és tündék várnak. Bilbo itt válik igazi hőssé.",color:"#5A7A2E",tasks:[8,10],reward:{pts:250,title:"Pókölő"}},
  {id:6,title:"Smaug Haragja",icon:"🐉",desc:"A Magányos Hegy kapujában a sárkánnyal kell szembeszállni. A végső próba!",color:"#B03020",tasks:[9,11],reward:{pts:300,title:"Sárkánnyal Szemben"}},
  {id:7,title:"Az Öt Sereg Csatája",icon:"⚔️",desc:"A háború elkerülhetetlen. Törpék, tündék, emberek, orkok és sasok ütköznek meg.",color:"#6A3030",tasks:[12,14],reward:{pts:300,title:"Csata Veterán"}},
  {id:8,title:"Oda-Vissza",icon:"🌟",desc:"Bilbo hazatér Zsákos-dombra — de már nem az a hobbit, aki elindult.",color:"#7A4ABB",tasks:[15],reward:{pts:500,title:"Oda-Vissza Járt Hobbit"}},
];

// ── SHOP ITEMS ─────────────────────────────────────────────────────────────
const SHOP_ITEMS=[
  {id:"frame_emerald",type:"frame",name:"Smaragd Keret",icon:"💚",desc:"Bakacsinerdő zöldje övezi avatárodat",cost:300,frameData:{id:"emerald",name:"Smaragd",border:"2.5px solid",glow:"0 0 14px"}},
  {id:"frame_shadow",type:"frame",name:"Árnyék Keret",icon:"🖤",desc:"Mordor sötétsége vesz körül",cost:500,frameData:{id:"shadow",name:"Árnyék",border:"3px solid",glow:"0 0 20px"}},
  {id:"frame_starlight",type:"frame",name:"Csillagfény Keret",icon:"⭐",desc:"Eärendil csillaga ragyog körülötted",cost:800,frameData:{id:"starlight",name:"Csillagfény",border:"2.5px solid",glow:"0 0 22px",pulse:true}},
  {id:"title_burglar",type:"title",name:"Betörő Cím",icon:"🗝️",desc:"\"Betörő\" — ahogy a szerződés mondja",cost:200,titleData:{id:"burglar",title:"Betörő"}},
  {id:"title_riddlemaster",type:"title",name:"Rejtvényfejtő Cím",icon:"🧩",desc:"\"Rejtvényfejtő\" — Gollam méltó ellenfele",cost:350,titleData:{id:"riddlemaster",title:"Rejtvényfejtő"}},
  {id:"title_ringfinder",type:"title",name:"Gyűrűtaláló Cím",icon:"💍",desc:"\"Gyűrűtaláló\" — a sors választottja",cost:500,titleData:{id:"ringfinder",title:"Gyűrűtaláló"}},
  {id:"title_dragonriddle",type:"title",name:"Sárkány Mesélő Cím",icon:"🐲",desc:"\"Sárkány Mesélő\" — Smaug-gal beszélt és élt",cost:600,titleData:{id:"dragonriddle",title:"Sárkány Mesélő"}},
  {id:"title_king",type:"title",name:"Középfölde Királya Cím",icon:"👑",desc:"\"Középfölde Királya\" — a legmagasabb cím",cost:1500,titleData:{id:"king",title:"Középfölde Királya"}},
  {id:"bg_shire",type:"background",name:"Megye Háttér",icon:"🌄",desc:"A Megye zöld dombjai a profilod mögött",cost:400,bgId:"shire"},
  {id:"bg_mordor",type:"background",name:"Mordor Háttér",icon:"🌋",desc:"Lávás, vörös háttér a bátrabbaknak",cost:600,bgId:"mordor"},
  {id:"bg_rivendell",type:"background",name:"Völgyzugoly Háttér",icon:"🏞️",desc:"Völgyzugoly nyugodt vízesései",cost:500,bgId:"rivendell"},
  {id:"effect_sparkle",type:"effect",name:"Csillogás Effekt",icon:"✨",desc:"Avatárod csillogó részecskéket szór",cost:700,effectId:"sparkle"},
  {id:"effect_fire",type:"effect",name:"Tűz Effekt",icon:"🔥",desc:"Tüzes lángok az avatárod körül",cost:900,effectId:"fire"},
  // Cases (repeatable purchase → gives star drop)
  {id:"case_megye",type:"case",name:"Megyei Láda",icon:"📦",desc:"Egy alap Csillagzsákmány. Általában közönséges, de ki tudja...",cost:500,repeatable:true,drops:1},
  {id:"case_rivendell",type:"case",name:"Rivendelli Szekrény",icon:"🪙",desc:"Jobb esélyek! A tündék bölcsessége segít.",cost:1500,repeatable:true,drops:2},
  {id:"case_erebor",type:"case",name:"Erebor Kincsesláda",icon:"💎",desc:"Smaug személyes gyűjteményéből. Prémium jutalmak garantálva.",cost:4000,repeatable:true,drops:3,bonusRarity:1},
  {id:"case_mithril",type:"case",name:"Mithril Szekrény",icon:"⚜️",desc:"A legritkább anyagból készült. Minimum Ritka ritkaság garantált!",cost:10000,repeatable:true,drops:3,bonusRarity:2},
  {id:"case_silmaril",type:"case",name:"Szilmaril Kapszula",icon:"🌟",desc:"A Szilmarilok fényével töltve. Minimum Epikus! Legendás esély kiugró.",cost:25000,repeatable:true,drops:5,bonusRarity:3},
  {id:"case_valar",type:"case",name:"Valák Áldása",icon:"👑",desc:"Az istenek ajándéka. 10 zsákmány, MIND minimum Ritka. Legendás esély: 30%.",cost:75000,repeatable:true,drops:10,bonusRarity:2},
];

// ── STAR DROPS (Brawl Stars style) ──────────────────────────────────────────
const STAR_RARITIES=[
  {id:"common",name:"Közönséges",color:"#8B6914",glow:"rgba(139,105,20,.5)",icon:"⭐",upgradeChance:0.25},
  {id:"rare",name:"Ritka",color:"#4DADE2",glow:"rgba(77,173,226,.5)",icon:"💙",upgradeChance:0.15},
  {id:"epic",name:"Epikus",color:"#B39DDB",glow:"rgba(179,157,219,.5)",icon:"💜",upgradeChance:0.08},
  {id:"legendary",name:"Legendás",color:"#FFD700",glow:"rgba(255,215,0,.5)",icon:"🌟",upgradeChance:0},
];
const STAR_REWARDS=[
  // Common pool
  {rarity:"common",icon:"💰",label:"+100 Pont",type:"pts",amount:100},
  {rarity:"common",icon:"💰",label:"+200 Pont",type:"pts",amount:200},
  {rarity:"common",icon:"💰",label:"+350 Pont",type:"pts",amount:350},
  {rarity:"common",icon:"⚡",label:"+25 ELO",type:"elo",amount:25},
  {rarity:"common",icon:"⚡",label:"+50 ELO",type:"elo",amount:50},
  // Rare pool
  {rarity:"rare",icon:"💰",label:"+500 Pont",type:"pts",amount:500},
  {rarity:"rare",icon:"💰",label:"+800 Pont",type:"pts",amount:800},
  {rarity:"rare",icon:"⚡",label:"+100 ELO",type:"elo",amount:100},
  {rarity:"rare",icon:"✨",label:"Ezüst Csillag Keret",type:"frame",frameId:"silver_star",frameName:"Ezüst Csillag"},
  {rarity:"rare",icon:"🏅",label:"\"Kincsvadász\" cím",type:"title",titleId:"treasure_hunter",title:"Kincsvadász"},
  // Epic pool
  {rarity:"epic",icon:"💰",label:"+1500 Pont",type:"pts",amount:1500},
  {rarity:"epic",icon:"💰",label:"+2500 Pont",type:"pts",amount:2500},
  {rarity:"epic",icon:"⚡",label:"+250 ELO",type:"elo",amount:250},
  {rarity:"epic",icon:"👑",label:"Arany Korona Keret",type:"frame",frameId:"golden_crown",frameName:"Arany Korona"},
  {rarity:"epic",icon:"🏅",label:"\"Az Aranyos\" cím",type:"title",titleId:"golden_one",title:"Az Aranyos"},
  {rarity:"epic",icon:"🔥",label:"Arany Csillogás Effekt",type:"effect",effectId:"golden_sparkle"},
  // Legendary pool
  {rarity:"legendary",icon:"💰",label:"+5000 Pont",type:"pts",amount:5000},
  {rarity:"legendary",icon:"💰",label:"+10 000 JACKPOT",type:"pts",amount:10000},
  {rarity:"legendary",icon:"💎",label:"+10 000 000 MEGA JACKPOT",type:"pts",amount:10000000},
  {rarity:"legendary",icon:"⚡",label:"+500 ELO",type:"elo",amount:500},
  {rarity:"legendary",icon:"⚡",label:"+1000 MEGA ELO",type:"elo",amount:1000},
  {rarity:"legendary",icon:"🌟",label:"Legendás Aura Keret",type:"frame",frameId:"legendary_aura",frameName:"Legendás Aura"},
  {rarity:"legendary",icon:"🏅",label:"\"Mítikus Hős\" cím",type:"title",titleId:"mythic",title:"Mítikus Hős"},
  {rarity:"legendary",icon:"🔥",label:"Legendás Lángok",type:"effect",effectId:"legendary_flames"},
];

// ── VOTE TASKS (weekly featured) ───────────────────────────────────────────
const VOTE_OPTIONS=[
  {id:"v1",icon:"🗡️",name:"Harcos Hét",desc:"Minden feladatért dupla pont!",multiplier:2,taskBonus:"all"},
  {id:"v2",icon:"💍",name:"Gyűrű Kihívás",desc:"A Gyűrű Rejtélye feladat tripla pontot ér",multiplier:3,taskBonus:13},
  {id:"v3",icon:"🧙",name:"Varázsló Hét",desc:"Gandalf Döntése dupla pontot ér",multiplier:2,taskBonus:15},
  {id:"v4",icon:"🐉",name:"Sárkány Szezon",desc:"Smaug feladatok dupla pont!",multiplier:2,taskBonus:9},
  {id:"v5",icon:"🏰",name:"Tünde Fesztivál",desc:"Bakacsinerdő feladatok dupla pont",multiplier:2,taskBonus:10},
  {id:"v6",icon:"⛰️",name:"Hegymászó Hét",desc:"Magányos Hegy feladatok tripla pont",multiplier:3,taskBonus:11},
];

// ── BOSS FIGHTS ─────────────────────────────────────────────────────────────
const BOSSES=[
  {id:"smaug",name:"Smaug a Rettenetes",icon:"🐉",hp:25000,color:"#B03020",glow:"rgba(176,48,32,.5)",
    phases:[{at:100,label:"Alvó Sárkány",desc:"Smaug az aranyhalmon szendereg..."},{at:75,label:"Felébred!",desc:"A sárkány szeme felvillan!"},{at:50,label:"Tűzvihar",desc:"Lángok csapnak fel mindenfelé!"},{at:25,label:"Végső Harag",desc:"Smaug dühödten támad!"}],
    reward:{pts:5000,title:"Sárkányölő"}},
  {id:"azog",name:"Azog a Gyalázatos",icon:"💀",hp:20000,color:"#4A4A4A",glow:"rgba(74,74,74,.5)",
    phases:[{at:100,label:"A Vadász",desc:"Azog warg-hátán közelít..."},{at:75,label:"Csata!",desc:"Az ork sereg támad!"},{at:50,label:"Párviadal",desc:"Azog személyesen lép harcba!"},{at:25,label:"Kétségbeesés",desc:"Utolsó, kétségbeesett roham!"}],
    reward:{pts:4000,title:"Ork-irtó"}},
  {id:"shelob",name:"Arachne",icon:"🕷️",hp:18000,color:"#2D1B4E",glow:"rgba(45,27,78,.5)",
    phases:[{at:100,label:"Sötét Barlang",desc:"Valami mozog a sötétben..."},{at:75,label:"Háló!",desc:"Ragacsos pókháló mindenhol!"},{at:50,label:"Mérgező Csapás",desc:"Arachne mérge halálos!"},{at:25,label:"Végső Fullánk",desc:"Kétségbeesett támadás!"}],
    reward:{pts:3500,title:"Pókvadász"}},
  {id:"bolg",name:"Bolg, Azog fia",icon:"⚔️",hp:22000,color:"#5C3A1E",glow:"rgba(92,58,30,.5)",
    phases:[{at:100,label:"A Sereg Érkezik",desc:"Bolg orkjai közelednek..."},{at:75,label:"Ostrom!",desc:"A csata elkezdődött!"},{at:50,label:"Faltörés",desc:"Bolg áttöri a védelmet!"},{at:25,label:"Utolsó Állás",desc:"Mindent vagy semmit!"}],
    reward:{pts:4500,title:"Seregtörő"}},
  {id:"goblin_king",name:"Goblin Király",icon:"👑",hp:15000,color:"#6B5B3A",glow:"rgba(107,91,58,.5)",
    phases:[{at:100,label:"A Trón",desc:"A Goblin Király trónján ül..."},{at:75,label:"Handabanda",desc:"Gúnyos nevetéssel támad!"},{at:50,label:"Goblin Had",desc:"Százával özönlenek a goblinok!"},{at:25,label:"Bukás",desc:"A trón inog!"}],
    reward:{pts:3000,title:"Goblinverő"}},
  {id:"warg_chief",name:"Warg Törzsfő",icon:"🐺",hp:16000,color:"#5A4030",glow:"rgba(90,64,48,.5)",
    phases:[{at:100,label:"Farkas Üvöltés",desc:"Üvöltés hallatszik a hegyekből..."},{at:75,label:"A Falka",desc:"Wargok raja támad!"},{at:50,label:"Harapás",desc:"A vezér szeme vérben forog!"},{at:25,label:"Magányos Farkas",desc:"Az utolsó harc!"}],
    reward:{pts:3200,title:"Farkasölő"}},
  {id:"witch_king",name:"Boszorkányúr",icon:"👤",hp:28000,color:"#1A1A2E",glow:"rgba(26,26,46,.5)",
    phases:[{at:100,label:"Árnyék Közelít",desc:"Hideg szél fúj..."},{at:75,label:"Nazgûl Sikoly",desc:"A sikoly megdermeszti a vért!"},{at:50,label:"Sötét Mágia",desc:"Az Árnyék ereje nő!"},{at:25,label:"Végső Sötétség",desc:"Most vagy soha!"}],
    reward:{pts:6000,title:"Árnyékvadász"}},
  {id:"troll_chief",name:"Trollvezér",icon:"🪨",hp:14000,color:"#5A5040",glow:"rgba(90,80,64,.5)",
    phases:[{at:100,label:"Éjszakai Tábor",desc:"A trollok tüzet raknak..."},{at:75,label:"Harc!",desc:"Hatalmas buzogányok suhognak!"},{at:50,label:"Dühöng",desc:"A trollvezér tajtékzik!"},{at:25,label:"Hajnal Közelít",desc:"Még egy kis kitartás!"}],
    reward:{pts:2800,title:"Trollvadász"}},
  {id:"sauron_eye",name:"Szauron Szeme",icon:"👁️",hp:35000,color:"#8B0000",glow:"rgba(139,0,0,.5)",
    phases:[{at:100,label:"A Szem Keres",desc:"Lángoló tekintet pásztáz..."},{at:75,label:"Megtalált!",desc:"A Szem rád szegeződik!"},{at:50,label:"Akarat Próba",desc:"Elméd ellen tör!"},{at:25,label:"Végső Erőpróba",desc:"Minden erőddel állj ellen!"}],
    reward:{pts:8000,title:"Szauron Legyőzője"}},
  {id:"barlog",name:"Durin Végzete (Balrog)",icon:"🔥",hp:30000,color:"#FF4500",glow:"rgba(255,69,0,.5)",
    phases:[{at:100,label:"Mélység Tüze",desc:"Moria mélyén tűz lobban..."},{at:75,label:"A Híd",desc:"A Khazad-dûm Hídján álltok!"},{at:50,label:"Lángkorbács",desc:"A Balrog ostora csattog!"},{at:25,label:"Zuhanás",desc:"Együtt zuhanunk a mélybe!"}],
    reward:{pts:7000,title:"Balrog Legyőzője"}},
  {id:"dragon_cold",name:"Scatha a Hideg",icon:"❄️",hp:20000,color:"#4682B4",glow:"rgba(70,130,180,.5)",
    phases:[{at:100,label:"Jeges Lehelet",desc:"Fagyos szél kísér..."},{at:75,label:"Jégvihar",desc:"Fagyasztó lehelet mindenhol!"},{at:50,label:"Fagyott Föld",desc:"A talaj megremeg!"},{at:25,label:"Olvadás",desc:"Az utolsó erőpróba!"}],
    reward:{pts:4000,title:"Jégsárkány Ölő"}},
  {id:"mouth_sauron",name:"Szauron Szája",icon:"🗣️",hp:17000,color:"#3D0C02",glow:"rgba(61,12,2,.5)",
    phases:[{at:100,label:"A Követ",desc:"Sötét alak közelít a kapuhoz..."},{at:75,label:"Hazugságok",desc:"Mérgezett szavak csapdája!"},{at:50,label:"Fenyegetés",desc:"Az Fekete Kapu megremeg!"},{at:25,label:"Leleplezés",desc:"Az igazság ereje győz!"}],
    reward:{pts:3500,title:"Igazmondó"}},
];
const _getMonthlyBoss=()=>BOSSES[new Date().getMonth()%BOSSES.length];
const _getBossMonth=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;};

// ── SEASONAL EVENTS ──────────────────────────────────────────────────────────
const SEASONAL_EVENTS=[
  {id:"yule",name:"Yule-ünnep",icon:"🎄",desc:"Középfölde téli ünnepe — a Shire-i hobbitok legmelegebb időszaka!",color:"#C62828",glow:"rgba(198,40,40,.4)",bg:"linear-gradient(135deg,rgba(198,40,40,.08),rgba(27,94,32,.06))",border:"rgba(198,40,40,.3)",
    match:d=>d.getMonth()===11&&d.getDate()>=15||d.getMonth()===0&&d.getDate()<=6,
    challenges:[{icon:"🎁",task:"Teljesíts 3 feladatot az ünnep alatt",pts:120,key:"yule_3tasks"},{icon:"⛄",task:"Érj el 90%+ pontot bármely feladatban",pts:100,key:"yule_perfect"},{icon:"🕯️",task:"Játssz egy társasjátékot",pts:80,key:"yule_game"}]},
  {id:"spring",name:"Tavasz Ébredése",icon:"🌸",desc:"Az olvadás elhozta a friss szellőt — Fangorn erdő újjáéled!",color:"#2E7D32",glow:"rgba(46,125,50,.4)",bg:"linear-gradient(135deg,rgba(46,125,50,.06),rgba(129,199,132,.04))",border:"rgba(46,125,50,.3)",
    match:d=>d.getMonth()>=2&&d.getMonth()<=4,
    challenges:[{icon:"🌱",task:"Teljesítsd az első 5 feladatot",pts:100,key:"spring_5tasks"},{icon:"🌻",task:"Gyűjts össze 500 pontot",pts:120,key:"spring_500pts"},{icon:"🦋",task:"Próbáld ki mind a 3 mini-játékot",pts:90,key:"spring_minigames"}]},
  {id:"midsummer",name:"Középnyári Csillagok",icon:"✨",desc:"A leghosszabb nap — a tündék ünnepelnek a csillagok alatt!",color:"#F9A825",glow:"rgba(249,168,37,.4)",bg:"linear-gradient(135deg,rgba(249,168,37,.06),rgba(255,202,40,.04))",border:"rgba(249,168,37,.3)",
    match:d=>d.getMonth()>=5&&d.getMonth()<=7,
    challenges:[{icon:"☀️",task:"Teljesíts 5 feladatot a nyári szezonban",pts:110,key:"summer_5tasks"},{icon:"🏹",task:"Nyerj az Íjász mini-játékban",pts:100,key:"summer_archery"},{icon:"⭐",task:"Szerezz összesen 1000 pontot",pts:150,key:"summer_1000pts"}]},
  {id:"harvest",name:"Aratási Fesztivál",icon:"🍂",desc:"A hobbitok hálát adnak a bőséges termésért — eljött a lakomák ideje!",color:"#E65100",glow:"rgba(230,81,0,.4)",bg:"linear-gradient(135deg,rgba(230,81,0,.06),rgba(255,152,0,.04))",border:"rgba(230,81,0,.3)",
    match:d=>d.getMonth()>=8&&d.getMonth()<=10,
    challenges:[{icon:"🍺",task:"Teljesíts 4 feladatot az őszi szezonban",pts:100,key:"harvest_4tasks"},{icon:"🎃",task:"Találd meg mind a 8 aranyat a Kincskeresőben",pts:120,key:"harvest_treasure"},{icon:"🍄",task:"Válaszolj helyesen 6 riddle-re egymás után",pts:110,key:"harvest_riddles"}]},
  {id:"durin",name:"Durin Napja",icon:"⚒️",desc:"A törpék legnagyobb ünnepe — Erebor fényei ragyognak!",color:"#6D4C41",glow:"rgba(109,76,65,.4)",bg:"linear-gradient(135deg,rgba(109,76,65,.08),rgba(161,136,127,.04))",border:"rgba(109,76,65,.3)",
    match:d=>d.getMonth()===11&&d.getDate()>=1&&d.getDate()<=14,
    challenges:[{icon:"⛏️",task:"Teljesíts 3 feladatot Durin Napja alatt",pts:100,key:"durin_3tasks"},{icon:"💎",task:"Érj el 250+ pontot egy feladatban",pts:130,key:"durin_highscore"},{icon:"🔥",task:"Csatlakozz vagy alapíts klánot",pts:80,key:"durin_clan"}]},
];
const _getActiveSeason=(d=new Date())=>SEASONAL_EVENTS.find(s=>s.match(d))||null;

function LeaderboardPanel({leaderboard,myName}){
  const [mode,setMode]=useState("score"); // "score" or "elo"
  const sorted=mode==="elo"?[...leaderboard].sort((a,b)=>(b.elo||1000)-(a.elo||1000)):leaderboard;
  return <div role="list" aria-label="Ranglétra" style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:8}}>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".72rem",letterSpacing:".1em",color:"var(--gold)",textAlign:"center",marginBottom:2}}>Középfölde Ranglétrája</div>
    {/* Toggle */}
    <div style={{display:"flex",gap:0,alignSelf:"center",border:"1px solid rgba(201,168,76,.25)",borderRadius:3,overflow:"hidden",marginBottom:4}}>
      <button onClick={()=>setMode("score")} style={{padding:"6px 16px",background:mode==="score"?"rgba(201,168,76,.15)":"transparent",border:"none",borderRight:"1px solid rgba(201,168,76,.15)",color:mode==="score"?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".08em",cursor:"pointer",transition:"all .2s"}}>🏆 Pontok</button>
      <button onClick={()=>setMode("elo")} style={{padding:"6px 16px",background:mode==="elo"?"rgba(122,74,187,.15)":"transparent",border:"none",color:mode==="elo"?"#B39DDB":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".08em",cursor:"pointer",transition:"all .2s"}}>⚔️ Ranked ELO</button>
    </div>
    {sorted.map((p,i)=>{
      const pr=RACES.find(r=>r.id===p.race)||RACES[3];
      const er=getEloRank(p.elo||1000);
      const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
      const medalBg=i===0?"rgba(255,215,0,.06)":i===1?"rgba(192,192,192,.05)":i===2?"rgba(205,127,50,.05)":"transparent";
      const medalBorder=i===0?"rgba(255,215,0,.25)":i===1?"rgba(192,192,192,.2)":i===2?"rgba(205,127,50,.2)":p.isMe?"rgba(201,168,76,.3)":"rgba(201,168,76,.07)";
      const isElo=mode==="elo";
      return <div key={p.name+i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",background:p.isMe?`linear-gradient(90deg,${isElo?"rgba(122,74,187,.08)":pr.color+"12"},rgba(201,168,76,.07))`:medalBg||(i%2===1?"rgba(255,255,255,.015)":"transparent"),border:`1px solid ${medalBorder}`,boxShadow:p.isMe?`0 0 14px ${isElo?"rgba(122,74,187,.15)":pr.color+"22"}`:"none",position:p.isMe?"sticky":"static",bottom:p.isMe?0:"auto",zIndex:p.isMe?2:1}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".75rem",color:i<3?"var(--gold)":"var(--gm)",minWidth:22,textAlign:"center"}}>{medal||`${i+1}.`}</div>
        <div style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${pr.color}`,background:`radial-gradient(circle,${pr.color}22,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem",flexShrink:0}}>{pr.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:p.isMe?"var(--gold)":"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}{p.isMe?" (Te)":""}</div>
          {isElo
            ?<div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:er.color}}>{er.icon} {er.label}</div>
            :<div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:getRank(p.score).color}}>{getRank(p.score).label}</div>
          }
        </div>
        {isElo
          ?<div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".85rem",color:er.color}}>{p.elo||1000}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--gm)",letterSpacing:".08em"}}>ELO</div>
          </div>
          :<>
            <div style={{textAlign:"center",flexShrink:0,marginRight:6}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:er.color}}>{er.icon} {p.elo||1000}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--gm)",letterSpacing:".08em"}}>ELO</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gold)"}}>{p.score}pt</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)"}}>{p.tasks}/{TASKS.length} ✓</div>
            </div>
          </>
        }
      </div>;
    })}
  </div>;
}

function BarChart({data,color}){
  const max=Math.max(...data.map(d=>d.val),1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:4,height:60,padding:"0 4px"}}>
    {data.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{width:"100%",background:`linear-gradient(180deg,${color},${color}66)`,height:`${(d.val/max)*52}px`,minHeight:d.val>0?4:0,borderRadius:"2px 2px 0 0",transition:"height .6s ease"}}/>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",textAlign:"center",lineHeight:1.2}}>{d.label}</div>
    </div>)}
  </div>;
}

function ProfileTab({user,completed,scores,onInviteFriend,onAddScore}){
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const totalScore=Object.values(scores).reduce((a,b)=>a+b,0);
  const pct=Math.round((completed.length/TASKS.length)*100);
  const rank=getRank(totalScore);
  const [myElo,setMyElo]=useState(1000);
  const eloRank=getEloRank(myElo);
  const [tab,setTab]=useState("stats");
  const [friends,setFriends]=useState([]);
  const [allUsers,setAllUsers]=useState([]);
  const [pendingIn,setPendingIn]=useState([]); // bejövő kérelmek
  const [search,setSearch]=useState("");
  const [searchMsg,setSearchMsg]=useState(null);
  const [editMode,setEditMode]=useState(false);
  const [bio,setBio]=useState(()=>localStorage.getItem("hobbit_bio")||"");
  const [bioEdit,setBioEdit]=useState("");
  const [selectedRace,setSelectedRace]=useState(user?.race||"human");
  const [avatarCfg,setAvatarCfg]=useState(_getAvatarConfig);
  const [editFrame,setEditFrame]=useState(avatarCfg.frame||"default");
  const [editTitle,setEditTitle]=useState(avatarCfg.title||"wanderer");
  const todayKey=new Date().toISOString().slice(0,10);
  const [dailyDone,setDailyDone]=useState(()=>JSON.parse(localStorage.getItem("hobbit_daily_"+todayKey)||"[]"));
  const dailyChallenge=DAILY_CHALLENGES[new Date().getDay()%DAILY_CHALLENGES.length];
  const activeSeason=_getActiveSeason();
  const [seasonDone,setSeasonDone]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_season_done")||"[]");}catch{return[];}});
  const myName=user?.adventureName;
  // Chat state
  const [chatWith,setChatWith]=useState(null);
  const [messages,setMessages]=useState([]);
  const [msgInput,setMsgInput]=useState("");
  const chatEndRef=useRef(null);
  // Countdown timer
  const [countdown,setCountdown]=useState("");
  useEffect(()=>{const tick=()=>{const now=new Date();const tom=new Date(now);tom.setHours(24,0,0,0);const diff=tom-now;const h=String(Math.floor(diff/3600000)).padStart(2,"0");const m=String(Math.floor((diff%3600000)/60000)).padStart(2,"0");const s=String(Math.floor((diff%60000)/1000)).padStart(2,"0");setCountdown(`${h}:${m}:${s}`);};tick();const id=setInterval(tick,1000);return()=>clearInterval(id);},[]);

  // Firebase imports
  const { initializeApp:fbInit, getApps } = window.__fbModules||{};
  const [onlineStatus,setOnlineStatus]=useState({});

  // Online presence system
  useEffect(()=>{
    if(!myName) return;
    try{
      const {getDatabase,ref:fbRef,set,onDisconnect:fbOnDisc}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      const statusRef=fbRef(db,`status/${myName}`);
      set(statusRef,{online:true,lastSeen:Date.now()});
      try{if(fbOnDisc)fbOnDisc(statusRef).set({online:false,lastSeen:Date.now()});}catch(e2){}
      // Heartbeat every 60s
      const hb=setInterval(()=>{try{set(statusRef,{online:true,lastSeen:Date.now()});}catch(e3){}},60000);
      return ()=>{clearInterval(hb);try{set(statusRef,{online:false,lastSeen:Date.now()});}catch(e4){}};
    }catch(e){}
  },[myName]);

  // Listen to friends' online status
  useEffect(()=>{
    if(!friends.length) return;
    try{
      const {getDatabase,ref:fbRef,onValue,off}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      const unsubs=[];
      friends.forEach(f=>{
        const sr=fbRef(db,`status/${f.name}`);
        onValue(sr,(snap)=>{
          const d=snap.val();
          setOnlineStatus(prev=>({...prev,[f.name]:d}));
        });
        unsubs.push(sr);
      });
      return ()=>unsubs.forEach(r=>off(r));
    }catch(e){}
  },[friends.map(f=>f?.name||"").join(",")]);

  // Sync user profile to Firebase & listen to friends/requests
  useEffect(()=>{
    if(!myName) return;
    try {
      const {getDatabase,ref:fbRef,set,onValue,off,update,remove}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      // Register user profile — update preserves elo field
      update(fbRef(db,`users/${myName}/profile`),{name:myName,race:user?.race||"human",score:totalScore,tasks:completed.length,updated:Date.now()});
      // Listen to own ELO
      const eloRef=fbRef(db,`users/${myName}/profile/elo`);
      onValue(eloRef,(snap)=>{const v=snap.val();if(typeof v==="number")setMyElo(v);});
      // Listen to friends
      const friendsRef=fbRef(db,`users/${myName}/friends`);
      onValue(friendsRef,(snap)=>{
        const data=snap.val()||{};
        setFriends(Object.values(data));
      });
      // Listen to incoming requests
      const reqRef=fbRef(db,`users/${myName}/friendRequests`);
      onValue(reqRef,(snap)=>{
        const data=snap.val()||{};
        setPendingIn(Object.values(data));
      });
      // Listen to all users for leaderboard
      const usersRef=fbRef(db,"users");
      onValue(usersRef,(snap)=>{
        const data=snap.val()||{};
        const users=Object.values(data).map(u=>u.profile).filter(p=>p&&p.name);
        setAllUsers(users);
      });
      return ()=>{off(friendsRef);off(reqRef);off(usersRef);off(eloRef);};
    } catch(e){}
  },[myName,totalScore,completed.length]);

  const achStats=_getAchievementStats(completed,scores,friends.length,dailyDone.length);
  const achivs=ACHIEVEMENTS.map(a=>({...a,done:a.check(achStats),progress:a.progress?.(achStats)}));

  const saveBio=()=>{localStorage.setItem("hobbit_bio",bioEdit);setBio(bioEdit);const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.race=selectedRace;localStorage.setItem("hobbit_current",JSON.stringify(cu));const newCfg={frame:editFrame,title:editTitle};_saveAvatarConfig(newCfg);setAvatarCfg(newCfg);setEditMode(false);};

  const sendFriendRequest=()=>{
    const name=search.trim();
    if(!name){setSearchMsg({ok:false,t:"Írj be egy nevet!"});return;}
    if(name.toLowerCase()===myName?.toLowerCase()){setSearchMsg({ok:false,t:"Magadat nem adhatod hozzá!"});return;}
    if(friends.find(f=>f.name?.toLowerCase()===name.toLowerCase())){setSearchMsg({ok:false,t:"Már a barátod!"});return;}
    try {
      const {getDatabase,ref:fbRef,set}=window.__fbDB||{};
      if(!getDatabase){
        // fallback localStorage
        const newF={name,race:"human",score:0,added:Date.now()};
        setFriends(f=>[...f,newF]);
        setSearchMsg({ok:true,t:`Kérelem elküldve: ${name}! ⚔️`});
        setTimeout(()=>setSearchMsg(null),2500);
        setSearch("");
        return;
      }
      const db=getDatabase();
      // Send request to target user
      set(fbRef(db,`users/${name}/friendRequests/${myName}`),{
        from:myName,race:user?.race||"human",score:totalScore,sent:Date.now()
      });
      setSearch("");
      setSearchMsg({ok:true,t:`Kérelem elküldve: ${name}! ⚔️`});
      setTimeout(()=>setSearchMsg(null),2500);
    } catch(e){setSearchMsg({ok:false,t:"Hiba történt!"});}
  };

  const acceptRequest=(fromName,fromRace,fromScore)=>{
    try {
      const {getDatabase,ref:fbRef,set,remove}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      const friendData={name:fromName,race:fromRace||"human",score:fromScore||0,added:Date.now()};
      // Add to both sides
      set(fbRef(db,`users/${myName}/friends/${fromName}`),friendData);
      set(fbRef(db,`users/${fromName}/friends/${myName}`),{name:myName,race:user?.race||"human",score:totalScore,added:Date.now()});
      // Remove request
      remove(fbRef(db,`users/${myName}/friendRequests/${fromName}`));
    } catch(e){}
  };

  const declineRequest=(fromName)=>{
    try {
      const {getDatabase,ref:fbRef,remove}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      remove(fbRef(db,`users/${myName}/friendRequests/${fromName}`));
    } catch(e){}
  };

  const removeFriend=(name)=>{
    try {
      const {getDatabase,ref:fbRef,remove}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      remove(fbRef(db,`users/${myName}/friends/${name}`));
      remove(fbRef(db,`users/${name}/friends/${myName}`));
    } catch(e){}
  };

  // Chat Firebase listener
  useEffect(()=>{
    if(!chatWith||!myName) return;
    try{
      const {getDatabase,ref:fbRef,onValue,off}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      const chatId=[myName,chatWith].sort().join("_");
      const chatRef=fbRef(db,`chats/${chatId}/messages`);
      onValue(chatRef,(snap)=>{
        const data=snap.val()||{};
        const msgs=Object.values(data).sort((a,b)=>a.ts-b.ts);
        setMessages(msgs);
      });
      return ()=>off(chatRef);
    }catch(e){}
  },[chatWith,myName]);

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const sendMessage=()=>{
    const text=msgInput.trim();
    if(!text||!chatWith||!myName) return;
    try{
      const {getDatabase,ref:fbRef,push,set}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      const chatId=[myName,chatWith].sort().join("_");
      const msgRef=push(fbRef(db,`chats/${chatId}/messages`));
      set(msgRef,{from:myName,text,ts:Date.now()});
      setMsgInput("");
    }catch(e){}
  };

  const claimDaily=()=>{
    const next=[...dailyDone,dailyChallenge.task];setDailyDone(next);localStorage.setItem("hobbit_daily_"+todayKey,JSON.stringify(next));
    const cnt=updateStreak();
    const mult=cnt>=30?5:cnt>=14?3:cnt>=7?2:cnt>=3?1.5:1;
    const bonusPts=Math.round(dailyChallenge.pts*mult);
    onAddScore?.("daily_"+todayKey,bonusPts);
  };
  const isDailyClaimed=dailyDone.includes(dailyChallenge.task);
  const _blockedNames=["nigro nigro","dildo","zsákos"];
  const leaderboard=(allUsers.length>0
    ?allUsers.filter(u=>!_blockedNames.includes(u.name?.toLowerCase())).map(u=>({name:u.name,race:u.race||"human",score:u.score||0,tasks:u.tasks||0,elo:u.elo||1000,isMe:u.name===myName}))
    :[{name:myName||"Te",race:user?.race||"human",score:totalScore,tasks:completed.length,elo:myElo,isMe:true}]
  ).sort((a,b)=>b.score-a.score);

  const [myClan,setMyClan]=useState(null);
  const [clanInput,setClanInput]=useState("");
  const [clanMsg,setClanMsg]=useState(null);
  const [clanWar,setClanWar]=useState(null);
  const [clanEvents,setClanEvents]=useState([]);
  const [warTarget,setWarTarget]=useState("");
  const [clanBoss,setClanBoss]=useState(null);
  const [bossAttackCd,setBossAttackCd]=useState(0);
  const [,forceRender]=useState(0);
  const monthlyBoss=_getMonthlyBoss();
  const bossMonth=_getBossMonth();
  // Cooldown timer tick
  useEffect(()=>{if(bossAttackCd<=Date.now())return;const id=setInterval(()=>{if(Date.now()>=bossAttackCd){clearInterval(id);forceRender(x=>x+1);}else forceRender(x=>x+1);},1000);return()=>clearInterval(id);},[bossAttackCd]);

  // Load clan data
  useEffect(()=>{
    if(!myName)return;
    try{
      const {getDatabase,ref:fbRef,onValue,off}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const clanRef=fbRef(db,`users/${myName}/clan`);
      onValue(clanRef,(snap)=>{
        const cid=snap.val();
        if(!cid){setMyClan(null);return;}
        const cRef=fbRef(db,`clans/${cid}`);
        onValue(cRef,(cs)=>{setMyClan(cs.val()?{...cs.val(),id:cid}:null);},{onlyOnce:true});
      });
      return()=>off(clanRef);
    }catch(e){}
  },[myName]);

  const createClan=()=>{
    const name=clanInput.trim();
    if(!name||name.length<2){setClanMsg({ok:false,t:"A klán neve min. 2 karakter!"});return;}
    try{
      const {getDatabase,ref:fbRef,push,set,update}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const clanRef=push(fbRef(db,"clans"));
      const clanData={name,leader:myName,created:Date.now(),members:{[myName]:{name:myName,race:user?.race||"human",score:totalScore,joined:Date.now()}}};
      set(clanRef,clanData);
      set(fbRef(db,`users/${myName}/clan`),clanRef.key);
      setMyClan({...clanData,id:clanRef.key});
      setClanInput("");setClanMsg({ok:true,t:`"${name}" klán létrehozva!`});
      setTimeout(()=>setClanMsg(null),2500);
    }catch(e){setClanMsg({ok:false,t:"Hiba történt!"});}
  };

  const joinClan=()=>{
    const cid=clanInput.trim();
    if(!cid){setClanMsg({ok:false,t:"Írd be a klán kódját!"});return;}
    try{
      const {getDatabase,ref:fbRef,get:fbGet,set,update}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      fbGet(fbRef(db,`clans/${cid}`)).then(snap=>{
        if(!snap.exists()){setClanMsg({ok:false,t:"Nincs ilyen klán!"});return;}
        const clan=snap.val();
        const members=Object.keys(clan.members||{});
        if(members.length>=10){setClanMsg({ok:false,t:"A klán tele van! (max 10)"});return;}
        update(fbRef(db,`clans/${cid}/members/${myName}`),{name:myName,race:user?.race||"human",score:totalScore,joined:Date.now()});
        set(fbRef(db,`users/${myName}/clan`),cid);
        setMyClan({...clan,id:cid});
        setClanInput("");setClanMsg({ok:true,t:`Csatlakoztál: "${clan.name}"!`});
        setTimeout(()=>setClanMsg(null),2500);
      });
    }catch(e){setClanMsg({ok:false,t:"Hiba történt!"});}
  };

  const leaveClan=()=>{
    if(!myClan)return;
    try{
      const {getDatabase,ref:fbRef,remove,set}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      remove(fbRef(db,`clans/${myClan.id}/members/${myName}`));
      remove(fbRef(db,`users/${myName}/clan`));
      setMyClan(null);
    }catch(e){}
  };

  // ── CLAN WAR MISSIONS & EVENTS ──
  const WAR_MISSIONS=[
    {id:"w1",icon:"🗡️",name:"Harci Keresztség",desc:"Teljesíts 1 feladatot a háború alatt",pts:30,type:"tasks",goal:1},
    {id:"w2",icon:"⚔️",name:"Csatakiáltás",desc:"Teljesíts 3 feladatot",pts:80,type:"tasks",goal:3},
    {id:"w3",icon:"🛡️",name:"Pajzsfal",desc:"Érj el 200+ pontot egy feladatban",pts:60,type:"single_score",goal:200},
    {id:"w4",icon:"🏹",name:"Íjász Szárny",desc:"Játssz az Íjász mini-játékban",pts:40,type:"minigame",goal:"archery"},
    {id:"w5",icon:"💎",name:"Kincsvadász",desc:"Találj 5+ aranyat a Kincskeresőben",pts:50,type:"minigame",goal:"treasure"},
    {id:"w6",icon:"🃏",name:"Memória Mester",desc:"Játssz a Memória mini-játékban",pts:40,type:"minigame",goal:"memory"},
    {id:"w7",icon:"🔥",name:"Tűzvihar",desc:"Gyűjts 500 pontot összesen",pts:100,type:"total_score",goal:500},
    {id:"w8",icon:"💀",name:"Halálosztó",desc:"Teljesíts 5 feladatot",pts:120,type:"tasks",goal:5},
    {id:"w9",icon:"🧙",name:"Gandalf Parancsa",desc:"Válaszolj 4+ riddle-re helyesen",pts:70,type:"minigame",goal:"riddle"},
    {id:"w10",icon:"⚡",name:"Villámcsapás",desc:"Teljesíts egy feladatot 60 mp alatt",pts:90,type:"speed",goal:60},
    {id:"w11",icon:"🏔️",name:"Erebor Ostroma",desc:"Teljesítsd a Magányos Hegy feladatot",pts:80,type:"specific_task",goal:10},
    {id:"w12",icon:"🌋",name:"Mordor Kapuja",desc:"Teljesítsd a Mordor feladatot",pts:80,type:"specific_task",goal:15},
    {id:"w13",icon:"🐉",name:"Smaug Bosszúja",desc:"Érj el 300+ pontot egy feladatban",pts:110,type:"single_score",goal:300},
    {id:"w14",icon:"👑",name:"Király Visszatér",desc:"Teljesíts 7 feladatot",pts:150,type:"tasks",goal:7},
    {id:"w15",icon:"🌟",name:"Csillagfény",desc:"Gyűjts 1000 pontot összesen",pts:180,type:"total_score",goal:1000},
    {id:"w16",icon:"🗺️",name:"Felderítő",desc:"Teljesíts feladatot 3 különböző helyszínen",pts:90,type:"locations",goal:3},
    {id:"w17",icon:"🍺",name:"Fogadós Kihívás",desc:"Játssz 3 különböző mini-játékban",pts:70,type:"diff_minigames",goal:3},
    {id:"w18",icon:"💍",name:"A Gyűrű Hatalma",desc:"Érj el 90%+ pontot bármely feladatban",pts:100,type:"perfect",goal:90},
    {id:"w19",icon:"⛏️",name:"Durin Öröksége",desc:"Teljesíts 10 feladatot",pts:200,type:"tasks",goal:10},
    {id:"w20",icon:"🏆",name:"Középfölde Hőse",desc:"Gyűjts 2000 pontot és teljesíts 10 feladatot",pts:300,type:"ultimate",goal:{score:2000,tasks:10}},
    {id:"w21",icon:"🌙",name:"Éjjeli Őrjárat",desc:"Teljesíts 2 feladatot",pts:55,type:"tasks",goal:2},
    {id:"w22",icon:"🦅",name:"Sasok Érkezése",desc:"Érj el 150+ pontot egy feladatban",pts:65,type:"single_score",goal:150},
    {id:"w23",icon:"🧝",name:"Tünde Szövetség",desc:"Teljesíts feladatot 2 különböző helyszínen",pts:55,type:"locations",goal:2},
    {id:"w24",icon:"🔨",name:"Durin Kovácsai",desc:"Gyűjts 300 pontot összesen",pts:75,type:"total_score",goal:300},
    {id:"w25",icon:"🌿",name:"Radagast Próbája",desc:"Játssz a Szókereső mini-játékban",pts:40,type:"minigame",goal:"wordsearch"},
    {id:"w26",icon:"📖",name:"Krónikás",desc:"Teljesíts 4 feladatot",pts:95,type:"tasks",goal:4},
    {id:"w27",icon:"🎯",name:"Mesterlövész",desc:"Érj el 250+ pontot egy feladatban",pts:85,type:"single_score",goal:250},
    {id:"w28",icon:"🏰",name:"Rivendell Védelme",desc:"Teljesítsd a Rivendell feladatot",pts:70,type:"specific_task",goal:2},
    {id:"w29",icon:"🕸️",name:"Pókirtás",desc:"Teljesítsd a Bakacsinerdő feladatát",pts:70,type:"specific_task",goal:3},
    {id:"w30",icon:"💫",name:"Csillagvándor",desc:"Gyűjts 750 pontot összesen",pts:130,type:"total_score",goal:750},
  ];

  const CLAN_EVENTS=[
    {id:"quest_rush",icon:"🗡️",name:"Feladat Roham",desc:"A klán tagjai összesen 10 feladatot teljesítenek",goal:10,unit:"feladat",duration:72},
    {id:"score_hunt",icon:"💰",name:"Pontgyűjtő Hadjárat",desc:"A klán összesen 2000 pontot gyűjt",goal:2000,unit:"pont",duration:48},
    {id:"mini_master",icon:"🎮",name:"Mini-Játék Mesterek",desc:"A tagok összesen 15 mini-játékot játszanak",goal:15,unit:"játék",duration:48},
    {id:"perfect_run",icon:"⭐",name:"Tökéletes Futam",desc:"5 feladatot 90%+ ponttal teljesítenek",goal:5,unit:"feladat",duration:72},
  ];

  // Load clan war + events + boss
  useEffect(()=>{
    if(!myClan?.id)return;
    try{
      const {getDatabase,ref:fbRef,onValue,off}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const warRef=fbRef(db,`clans/${myClan.id}/war`);
      const evRef=fbRef(db,`clans/${myClan.id}/events`);
      const bossRef=fbRef(db,`clans/${myClan.id}/boss`);
      onValue(warRef,(s)=>setClanWar(s.val()||null));
      onValue(evRef,(s)=>{const d=s.val();setClanEvents(d?Object.entries(d).map(([k,v])=>({...v,fbKey:k})):[]); });
      onValue(bossRef,(s)=>setClanBoss(s.val()||null));
      return()=>{off(warRef);off(evRef);off(bossRef);};
    }catch(e){}
  },[myClan?.id]);

  // Pick 7 random missions for a war (seeded by war start time)
  const _pickWarMissions=(seed)=>{
    const rng=(s)=>{s=Math.imul(s^(s>>>16),0x45d9f3b);s=Math.imul(s^(s>>>13),0x45d9f3b);return((s^(s>>>16))>>>0)/4294967296;};
    const pool=[...WAR_MISSIONS];const picked=[];
    for(let i=0;i<7&&pool.length;i++){const idx=Math.floor(rng(seed+i*7919)*pool.length);picked.push(pool.splice(idx,1)[0]);}
    return picked;
  };

  // ── WAR BASELINE & VERIFICATION ──
  const warBaselineKey=clanWar?`hobbit_war_bl_${clanWar.started}`:null;
  const [warBaseline]=useState(()=>{
    if(!warBaselineKey)return null;
    try{const saved=localStorage.getItem(warBaselineKey);if(saved)return JSON.parse(saved);}catch(e){}
    const bl={tasks:[...completed],score:totalScore,saved:Date.now()};
    try{localStorage.setItem(warBaselineKey,JSON.stringify(bl));}catch(e){}
    return bl;
  });

  const getWarMissionProgress=(mission)=>{
    if(!warBaseline||!clanWar)return{met:false,current:0,goal:typeof mission.goal==="object"?1:mission.goal,label:""};
    const newTasks=completed.filter(t=>!warBaseline.tasks.includes(t));
    const gained=Math.max(0,totalScore-warBaseline.score);
    switch(mission.type){
      case"tasks":return{met:newTasks.length>=mission.goal,current:newTasks.length,goal:mission.goal,label:"feladat"};
      case"single_score":{const best=Math.max(0,...Object.values(scores));return{met:best>=mission.goal,current:best,goal:mission.goal,label:"pont"};}
      case"total_score":return{met:gained>=mission.goal,current:gained,goal:mission.goal,label:"pont"};
      case"specific_task":{const done=completed.includes(mission.goal)&&!warBaseline.tasks.includes(mission.goal);return{met:done,current:done?1:0,goal:1,label:"feladat"};}
      case"speed":return{met:false,current:0,goal:1,label:"feladat"};
      case"minigame":{try{const plays=JSON.parse(localStorage.getItem("hobbit_minigame_plays")||"{}");const ts=plays["_t_"+mission.goal]||0;const played=ts>clanWar.started;return{met:played,current:played?1:0,goal:1,label:"játék"};}catch(e){return{met:false,current:0,goal:1,label:"játék"};}}
      case"diff_minigames":{try{const plays=JSON.parse(localStorage.getItem("hobbit_minigame_plays")||"{}");const unique=["memory","reaction","wordsearch","riddle","archery","treasure"].filter(g=>(plays["_t_"+g]||0)>clanWar.started).length;return{met:unique>=mission.goal,current:unique,goal:mission.goal,label:"játék"};}catch(e){return{met:false,current:0,goal:mission.goal,label:"játék"};}}
      case"perfect":{const any90=TASKS.some(t=>{const s=scores[t.id];return s&&!warBaseline.tasks.includes(t.id)&&(s/t.basePoints*100)>=mission.goal;});return{met:any90,current:any90?1:0,goal:1,label:"feladat"};}
      case"locations":{const locs=new Set(newTasks.map(tid=>TASKS.find(t=>t.id===tid)?.location).filter(Boolean));return{met:locs.size>=mission.goal,current:locs.size,goal:mission.goal,label:"helyszín"};}
      case"ultimate":{const scoreMet=gained>=mission.goal.score;const tasksMet=newTasks.length>=mission.goal.tasks;return{met:scoreMet&&tasksMet,current:0,goal:1,label:`${newTasks.length}/${mission.goal.tasks} feladat, ${gained}/${mission.goal.score} pont`};}
      default:return{met:false,current:0,goal:1,label:""};
    }
  };

  // Auto-complete verified missions
  useEffect(()=>{
    if(!clanWar||clanWar.status!=="active"||!myClan||!warBaseline)return;
    const side=clanWar.challenger.id===myClan.id?"challenger":"defender";
    (clanWar.missions||[]).forEach(mid=>{
      const m=WAR_MISSIONS.find(w=>w.id===mid);if(!m)return;
      const done=!!clanWar[side]?.completed?.[myName+"_"+mid];
      if(done)return;
      const prog=getWarMissionProgress(m);
      if(prog.met)completeWarMission(mid);
    });
  },[completed.length,totalScore,clanWar?.status]);

  // ── BOSS FIGHT ──
  const initBoss=()=>{
    if(!myClan)return;
    try{
      const {getDatabase,ref:fbRef,set}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const bossData={bossId:monthlyBoss.id,month:bossMonth,maxHp:monthlyBoss.hp,currentHp:monthlyBoss.hp,contributors:{},defeated:false,defeatedAt:null};
      set(fbRef(db,`clans/${myClan.id}/boss`),bossData);
      setClanBoss(bossData);sfx.dice?.();
      setClanMsg({ok:true,t:`${monthlyBoss.name} megjelent!`});setTimeout(()=>setClanMsg(null),2500);
    }catch(e){}
  };

  const attackBoss=()=>{
    if(!clanBoss||clanBoss.defeated||!myClan||bossAttackCd>Date.now())return;
    const dmg=100+completed.length*20+Math.floor(totalScore/50);
    try{
      const {getDatabase,ref:fbRef,get:fbGet,update,set:fbSet}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const bossPath=`clans/${myClan.id}/boss`;
      fbGet(fbRef(db,bossPath)).then(snap=>{
        const b=snap.val();if(!b||b.defeated)return;
        const newHp=Math.max(0,b.currentHp-dmg);
        const myDmg=(b.contributors?.[myName]?.damage||0)+dmg;
        const myHits=(b.contributors?.[myName]?.hits||0)+1;
        const updates={currentHp:newHp,[`contributors/${myName}`]:{damage:myDmg,hits:myHits,name:myName}};
        if(newHp<=0){updates.defeated=true;updates.defeatedAt=Date.now();}
        update(fbRef(db,bossPath),updates);
        if(newHp<=0){
          sfx.achievement?.();
          const boss=BOSSES.find(bb=>bb.id===b.bossId)||monthlyBoss;
          onAddScore?.("boss_"+bossMonth,boss.reward.pts);
          setClanMsg({ok:true,t:`${boss.name} legyőzve! +${boss.reward.pts} pont!`});setTimeout(()=>setClanMsg(null),3500);
        }else{
          sfx.click?.();
        }
      });
      setBossAttackCd(Date.now()+60000);
    }catch(e){}
  };

  const bossPhase=clanBoss?(()=>{
    const pct=Math.round((clanBoss.currentHp/(clanBoss.maxHp||1))*100);
    const boss=BOSSES.find(b=>b.id===clanBoss.bossId)||monthlyBoss;
    return boss.phases.find(p=>pct<=p.at)||boss.phases[0];
  })():null;

  const startClanWar=(targetClanId)=>{
    if(!myClan||!targetClanId)return;
    try{
      const {getDatabase,ref:fbRef,get:fbGet,set}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      fbGet(fbRef(db,`clans/${targetClanId}`)).then(snap=>{
        if(!snap.exists()){setClanMsg({ok:false,t:"Nincs ilyen klán!"});return;}
        const enemy=snap.val();
        const now=Date.now();
        const missions=_pickWarMissions(now).map(m=>m.id);
        // Save baseline at war start
        try{localStorage.setItem(`hobbit_war_bl_${now}`,JSON.stringify({tasks:[...completed],score:totalScore,saved:now}));}catch(e){}
        const warData={
          started:now,expires:now+48*3600000,missions,
          challenger:{id:myClan.id,name:myClan.name,score:0,completed:{},members:{}},
          defender:{id:targetClanId,name:enemy.name,score:0,completed:{},members:{}},
          status:"active"
        };
        set(fbRef(db,`clans/${myClan.id}/war`),warData);
        set(fbRef(db,`clans/${targetClanId}/war`),warData);
        setClanWar(warData);setWarTarget("");
        sfx.dice?.();
        setClanMsg({ok:true,t:`Háború indítva "${enemy.name}" ellen!`});
        setTimeout(()=>setClanMsg(null),2500);
      });
    }catch(e){setClanMsg({ok:false,t:"Hiba történt!"});}
  };

  const completeWarMission=(missionId)=>{
    if(!clanWar||clanWar.status!=="active"||!myClan)return;
    const mission=WAR_MISSIONS.find(m=>m.id===missionId);if(!mission)return;
    const side=clanWar.challenger.id===myClan.id?"challenger":"defender";
    // Check if already completed by this user
    if(clanWar[side]?.completed?.[myName+"_"+missionId])return;
    try{
      const {getDatabase,ref:fbRef,get:fbGet,update}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const basePath=`clans/${myClan.id}/war`;
      fbGet(fbRef(db,basePath)).then(snap=>{
        const war=snap.val();if(!war)return;
        const cur=war[side]||{score:0,completed:{},members:{}};
        const newScore=(cur.score||0)+mission.pts;
        const newCompleted={...(cur.completed||{}),[myName+"_"+missionId]:true};
        const memberScore=(cur.members?.[myName]||0)+mission.pts;
        update(fbRef(db,`${basePath}/${side}`),{score:newScore,completed:newCompleted,members:{...(cur.members||{}),[myName]:memberScore}});
        const enemyId=side==="challenger"?war.defender.id:war.challenger.id;
        update(fbRef(db,`clans/${enemyId}/war/${side}`),{score:newScore,completed:newCompleted,members:{...(cur.members||{}),[myName]:memberScore}});
      });
      sfx.achievement?.();
      setClanMsg({ok:true,t:`"${mission.name}" teljesítve! +${mission.pts} háborús pont`});
      setTimeout(()=>setClanMsg(null),2500);
    }catch(e){}
  };

  const startClanEvent=(evId)=>{
    if(!myClan)return;
    const ev=CLAN_EVENTS.find(e=>e.id===evId);if(!ev)return;
    try{
      const {getDatabase,ref:fbRef,push,set}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const evRef=push(fbRef(db,`clans/${myClan.id}/events`));
      set(evRef,{id:ev.id,name:ev.name,icon:ev.icon,desc:ev.desc,goal:ev.goal,unit:ev.unit,started:Date.now(),expires:Date.now()+ev.duration*3600000,progress:0,contributors:{}});
      setClanMsg({ok:true,t:`"${ev.name}" esemény elindítva!`});setTimeout(()=>setClanMsg(null),2500);
    }catch(e){setClanMsg({ok:false,t:"Hiba történt!"});}
  };

  const contributeToEvent=(fbKey,amount)=>{
    if(!myClan)return;
    try{
      const {getDatabase,ref:fbRef,get:fbGet,update}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const ePath=`clans/${myClan.id}/events/${fbKey}`;
      fbGet(fbRef(db,ePath)).then(snap=>{
        const ev=snap.val();if(!ev)return;
        const newProg=Math.min(ev.goal,(ev.progress||0)+amount);
        const contribs={...(ev.contributors||{}),[myName]:(ev.contributors?.[myName]||0)+amount};
        update(fbRef(db,ePath),{progress:newProg,contributors:contribs});
      });
      sfx.success?.();
      setClanMsg({ok:true,t:`+${amount} hozzájárulás!`});setTimeout(()=>setClanMsg(null),1500);
    }catch(e){}
  };

  const claimSeason=(key,pts)=>{if(seasonDone.includes(key))return;const next=[...seasonDone,key];setSeasonDone(next);localStorage.setItem("hobbit_season_done",JSON.stringify(next));sfx.achievement?.();onAddScore?.("season_"+key,pts);};

  // ── STREAK SYSTEM ──
  const [streak,setStreak]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_streak")||'{"count":0,"lastDate":null}');}catch{return{count:0,lastDate:null};}});
  const updateStreak=()=>{
    const today=new Date().toISOString().slice(0,10);
    if(streak.lastDate===today)return streak.count; // already claimed today
    const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
    const newCount=streak.lastDate===yesterday?streak.count+1:1;
    const newStreak={count:newCount,lastDate:today};
    setStreak(newStreak);
    localStorage.setItem("hobbit_streak",JSON.stringify(newStreak));
    return newCount;
  };
  const streakMultiplier=streak.count>=30?5:streak.count>=14?3:streak.count>=7?2:streak.count>=3?1.5:1;
  const streakToday=streak.lastDate===new Date().toISOString().slice(0,10);

  // ── STORY MODE STATE ──
  const [storyRewards,setStoryRewards]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_story_rewards")||"[]");}catch{return[];}});
  const claimStoryReward=(chapterId,pts)=>{
    if(storyRewards.includes(chapterId))return;
    const next=[...storyRewards,chapterId];
    setStoryRewards(next);
    localStorage.setItem("hobbit_story_rewards",JSON.stringify(next));
    sfx.achievement?.();
    onAddScore?.("story_ch"+chapterId,pts);
  };

  // ── SHOP STATE ──
  const [purchased,setPurchased]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_shop_purchased")||"[]");}catch{return[];}});
  const [shopMsg,setShopMsg]=useState(null);
  // ── STAR DROP STATE ──
  const [starDrops,setStarDrops]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_stardrops")||"[]");}catch{return[];}});
  const [dropAnim,setDropAnim]=useState(null); // {phase:"idle"|"upgrading"|"spinning"|"reveal", rarity, finalRarity, reward, spinIdx, spinItems}
  const [dropHistory,setDropHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_drop_history")||"[]");}catch{return[];}});
  const saveDrops=(d)=>{setStarDrops(d);localStorage.setItem("hobbit_stardrops",JSON.stringify(d));};
  const addStarDrop=()=>{const next=[...starDrops,{id:Date.now()+"_"+Math.random().toString(36).slice(2,6),earned:Date.now()}];saveDrops(next);return next;};

  const openStarDrop=(dropId)=>{
    if(dropAnim)return;
    const drop=starDrops.find(d=>d.id===dropId);if(!drop)return;
    saveDrops(starDrops.filter(d=>d.id!==dropId));
    // Determine rarity with upgrade chain (bonusRarity = guaranteed minimum tier)
    const startRarity=Math.min(drop.bonusRarity||0,STAR_RARITIES.length-1);
    sfx.click?.();
    setDropAnim({phase:"upgrading",rarity:startRarity,finalRarity:0,reward:null,spinIdx:0,spinItems:[]});
    // Upgrade chain with delays
    const tryUpgrade=(currentRarity,delay)=>{
      setTimeout(()=>{
        const r=STAR_RARITIES[currentRarity];
        if(r.upgradeChance>0&&Math.random()<r.upgradeChance){
          sfx.success?.();
          const next=currentRarity+1;
          setDropAnim(prev=>prev?{...prev,rarity:next}:null);
          tryUpgrade(next,800);
        }else{
          // Final rarity determined — CS2-style carousel spin
          const pool=STAR_REWARDS.filter(r=>r.rarity===STAR_RARITIES[currentRarity].id);
          const finalReward=pool[Math.floor(Math.random()*pool.length)];
          // Build long strip: 60 items, winning item at index 50
          const STRIP_LEN=60,WIN_IDX=50,ITEM_W=80;
          const strip=[];
          for(let i=0;i<STRIP_LEN;i++){
            if(i===WIN_IDX){strip.push(finalReward);}
            else{strip.push(STAR_REWARDS[Math.floor(Math.random()*STAR_REWARDS.length)]);}
          }
          sfx.dice?.();
          // Start at 0, will animate to final position via CSS transition
          const jitter=(Math.random()-0.5)*30; // slight random offset so it's not perfectly centered every time
          const finalPx=WIN_IDX*ITEM_W+jitter;
          setDropAnim(prev=>prev?{...prev,phase:"spinning",finalRarity:currentRarity,reward:finalReward,spinItems:strip,spinPx:0,finalPx,settled:false}:null);
          // Trigger transition after paint
          requestAnimationFrame(()=>{requestAnimationFrame(()=>{
            setDropAnim(prev=>prev?{...prev,spinPx:finalPx}:null);
          });});
          // After spin duration → tick sound + reveal
          const SPIN_DUR=5500;
          setTimeout(()=>{
            setDropAnim(prev=>prev?{...prev,settled:true}:null);
            sfx.success?.();
          },SPIN_DUR-300);
          setTimeout(()=>{
            sfx.achievement?.();
            setDropAnim(prev=>prev?{...prev,phase:"reveal"}:null);
            // Apply reward
            if(finalReward.type==="pts")onAddScore?.("stardrop_"+Date.now(),finalReward.amount);
            if(finalReward.type==="elo"){
              try{const {getDatabase,ref:fbRef,get:fbGet,set:fbSet}=window.__fbDB||{};if(getDatabase){const db=getDatabase();fbGet(fbRef(db,`users/${myName}/profile/elo`)).then(s=>{const cur=s.val()||1000;fbSet(fbRef(db,`users/${myName}/profile/elo`),cur+finalReward.amount);});}}catch(e){}
            }
            const entry={...finalReward,rarityId:STAR_RARITIES[currentRarity].id,time:Date.now()};
            const hist=[entry,...dropHistory].slice(0,20);
            setDropHistory(hist);localStorage.setItem("hobbit_drop_history",JSON.stringify(hist));
          },SPIN_DUR+600);
        }
      },delay);
    };
    tryUpgrade(startRarity,600);
  };

  // Earn star drops from task completions
  useEffect(()=>{
    completed.forEach(t=>{
      if(!localStorage.getItem(`hobbit_sd_${t}`)){
        addStarDrop();localStorage.setItem(`hobbit_sd_${t}`,"1");
      }
    });
  },[]);

  const buyItem=(item)=>{
    if(!item.repeatable&&purchased.includes(item.id)){setShopMsg({ok:false,t:"Már megvan!"});setTimeout(()=>setShopMsg(null),1500);return;}
    if(totalScore<item.cost){setShopMsg({ok:false,t:`Nincs elég pontod! (${totalScore}/${item.cost})`});setTimeout(()=>setShopMsg(null),2000);return;}
    // Deduct points
    onAddScore?.("shop_buy_"+Date.now(),-item.cost);
    sfx.coin?.();
    if(item.type==="case"){
      // Give star drops
      let latest=starDrops;
      for(let i=0;i<(item.drops||1);i++){
        const d={id:Date.now()+"_"+i+"_"+Math.random().toString(36).slice(2,6),earned:Date.now(),bonusRarity:item.bonusRarity||0};
        latest=[...latest,d];
      }
      saveDrops(latest);
      setShopMsg({ok:true,t:`${item.drops||1}× Csillagzsákmány hozzáadva! ⭐`});
      setTimeout(()=>setShopMsg(null),2500);
    }else{
      const next=[...purchased,item.id];
      setPurchased(next);
      localStorage.setItem("hobbit_shop_purchased",JSON.stringify(next));
      setShopMsg({ok:true,t:`"${item.name}" megvásárolva! 🎉`});
      setTimeout(()=>setShopMsg(null),2000);
    }
  };

  // ── VOTING STATE ──
  const weekNum=Math.floor((Date.now()-new Date(2024,0,1).getTime())/(7*24*3600000));
  const [myVote,setMyVote]=useState(()=>localStorage.getItem("hobbit_vote_"+weekNum)||null);
  const [votes,setVotes]=useState({});
  useEffect(()=>{
    try{
      const {getDatabase,ref:fbRef,onValue,off}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const vRef=fbRef(db,`votes/week_${weekNum}`);
      onValue(vRef,(snap)=>{setVotes(snap.val()||{});});
      return()=>off(vRef);
    }catch(e){}
  },[weekNum]);
  const castVote=(optId)=>{
    if(myVote)return;
    setMyVote(optId);
    localStorage.setItem("hobbit_vote_"+weekNum,optId);
    try{
      const {getDatabase,ref:fbRef,set,get:fbGet}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      fbGet(fbRef(db,`votes/week_${weekNum}/${optId}`)).then(snap=>{
        const cur=snap.val()||0;
        set(fbRef(db,`votes/week_${weekNum}/${optId}`),cur+1);
      });
    }catch(e){}
    sfx.success?.();
  };
  const winningVote=(()=>{const entries=Object.entries(votes);if(!entries.length)return null;entries.sort((a,b)=>b[1]-a[1]);return VOTE_OPTIONS.find(v=>v.id===entries[0][0])||null;})();
  const totalVotes=Object.values(votes).reduce((a,b)=>a+b,0);

  // ── DUEL STATE ──
  const [duelTarget,setDuelTarget]=useState(null);
  const [duelMsg,setDuelMsg]=useState(null);
  const sendDuel=(friendName)=>{
    try{
      const {getDatabase,ref:fbRef,set}=window.__fbDB||{};
      if(!getDatabase)return;
      const db=getDatabase();
      const randomTask=TASKS[Math.floor(Math.random()*TASKS.length)];
      const duelId=`${myName}_${friendName}_${Date.now()}`;
      set(fbRef(db,`duels/${duelId}`),{id:duelId,challenger:myName,defender:friendName,taskId:randomTask.id,taskTitle:randomTask.title,status:"pending",scores:{},created:Date.now()});
      set(fbRef(db,`users/${friendName}/duelInvites/${duelId}`),{from:myName,duelId,taskId:randomTask.id,taskTitle:randomTask.title,created:Date.now()});
      setDuelMsg({ok:true,t:`Párbaj kihívás elküldve: ${friendName}! (${randomTask.title})`});
      setTimeout(()=>setDuelMsg(null),3000);
      sfx.dice?.();
    }catch(e){setDuelMsg({ok:false,t:"Hiba történt!"});}
  };

  const TABS2=[{id:"stats",label:"Statok",icon:"📊"},{id:"story",label:"Történet",icon:"📜"},{id:"shop",label:"Bolt",icon:"🏪"},{id:"crates",label:"Zsákmány",icon:"⭐"},{id:"friends",label:"Barátok",icon:"⚔️"},{id:"clan",label:"Klán",icon:"🛡️"},{id:"leaderboard",label:"Ranglétra",icon:"🏆"},{id:"daily",label:"Napi",icon:"☀️"},{id:"vote",label:"Szavazás",icon:"🗳️"},...(activeSeason?[{id:"season",label:activeSeason.name,icon:activeSeason.icon}]:[])];

  return <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflowY:"auto"}}>
    {/* Header */}
    <div style={{padding:"16px 16px 12px",background:"linear-gradient(180deg,rgba(201,168,76,.06),transparent)",borderBottom:"1px solid rgba(201,168,76,.1)"}}>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{position:"relative",flexShrink:0}}>
          <AvatarDisplay race={race} frame={avatarCfg.frame||"default"} size={56}/>
          <button aria-label="Profil szerkesztése" onClick={()=>{setEditMode(true);setBioEdit(bio);setSelectedRace(user?.race||"human");setEditFrame(avatarCfg.frame||"default");setEditTitle(avatarCfg.title||"wanderer");}} style={{position:"absolute",bottom:-2,right:-2,width:20,height:20,borderRadius:"50%",background:"rgba(201,168,76,.15)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontSize:".6rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.85rem,2.5vw,1.1rem)",color:"var(--gold)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.adventureName||"Ismeretlen"}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:race.color,letterSpacing:".06em",textTransform:"uppercase"}}>{race.id}</span>
            {(()=>{const tid=avatarCfg.title||"wanderer";const t=AVATAR_TITLES.find(t=>t.id===tid)||(()=>{const si=SHOP_ITEMS.find(s=>s.type==="title"&&s.titleData?.id===tid);return si?{id:si.titleData.id,title:si.titleData.title}:null;})();return t?<span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gold)",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:12,padding:"1px 8px",letterSpacing:".05em",whiteSpace:"nowrap"}}>"{t.title}"</span>:null;})()}
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:rank.color,background:`${rank.color}15`,border:`1px solid ${rank.color}33`,borderRadius:12,padding:"1px 8px",letterSpacing:".05em",whiteSpace:"nowrap"}}>{rank.label}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:eloRank.color,background:`${eloRank.color}15`,border:`1px solid ${eloRank.color}33`,borderRadius:12,padding:"1px 8px",letterSpacing:".05em",whiteSpace:"nowrap"}}>{eloRank.icon} {myElo} ELO</span>
          </div>
          <div style={{fontStyle:"italic",fontSize:".75rem",color:bio?"var(--td)":"rgba(106,90,64,.4)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bio||"Mesélj magadról..."}</div>
          <div style={{marginTop:6,height:4,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${race.color},var(--gold))`,transition:"width 1s",borderRadius:2}}/></div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",marginTop:2,letterSpacing:".06em"}}>{completed.length}/{TASKS.length} feladat · {pct}%</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.2rem",color:"var(--gold)"}}>{totalScore}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)",letterSpacing:".1em"}}>PONT</div>
          </div>
          <button onClick={()=>{signOut(auth).catch(()=>{});localStorage.removeItem("hobbit_current");window.location.reload();}} style={{padding:"3px 10px",background:"rgba(229,57,53,.08)",border:"1px solid rgba(229,57,53,.25)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".48rem",letterSpacing:".06em",cursor:"pointer",borderRadius:3,whiteSpace:"nowrap"}}>Kilépés</button>
        </div>
      </div>
    </div>

    {/* Edit modal */}
    {editMode&&<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(4,3,2,.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:400,maxHeight:"90vh",overflowY:"auto",background:"linear-gradient(162deg,rgba(20,15,11,.99),rgba(8,6,4,.99))",border:"1px solid rgba(201,168,76,.22)",padding:20,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",textAlign:"center"}}>Profil Szerkesztése</div>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>Faj választás</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
            {RACES.map(r=><button key={r.id} onClick={()=>setSelectedRace(r.id)} style={{padding:"8px 4px",background:selectedRace===r.id?"rgba(201,168,76,.12)":"rgba(0,0,0,.3)",border:`1px solid ${selectedRace===r.id?r.color:"rgba(201,168,76,.12)"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
              <span style={{fontSize:"1.2rem"}}>{r.icon}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:selectedRace===r.id?r.color:"var(--gm)"}}>{r.id}</span>
            </button>)}
          </div>
        </div>
        {/* Avatar frame */}
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>Avatar keret</div>
          <div style={{display:"flex",gap:8,overflowX:"auto",padding:"4px 0"}}>
            {AVATAR_FRAMES.map(f=>{const selRace=RACES.find(r=>r.id===selectedRace)||RACES[3];const unlocked=_isAvatarUnlocked(f.req,{completed:completed.length,score:totalScore,friends:friends.length});
              return <button key={f.id} onClick={()=>unlocked&&setEditFrame(f.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"6px 8px",background:editFrame===f.id?"rgba(201,168,76,.12)":"rgba(0,0,0,.3)",border:`1px solid ${editFrame===f.id?"var(--gold)":"rgba(201,168,76,.1)"}`,cursor:unlocked?"pointer":"not-allowed",opacity:unlocked?1:.35,minWidth:60}}>
                <AvatarDisplay race={selRace} frame={f.id} size={32} showPulse={false}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:editFrame===f.id?"var(--gold)":"var(--gm)",whiteSpace:"nowrap"}}>{f.name}</span>
                {!unlocked&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".38rem",color:"var(--gm)",whiteSpace:"nowrap"}}>{f.req}</span>}
              </button>;
            })}
            {/* Shop-purchased frames */}
            {SHOP_ITEMS.filter(si=>si.type==="frame"&&purchased.includes(si.id)).map(si=>{const selRace=RACES.find(r=>r.id===selectedRace)||RACES[3];const fid=si.frameData.id;
              return <button key={fid} onClick={()=>setEditFrame(fid)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"6px 8px",background:editFrame===fid?"rgba(201,168,76,.12)":"rgba(0,0,0,.3)",border:`1px solid ${editFrame===fid?"var(--gold)":"rgba(201,168,76,.1)"}`,cursor:"pointer",minWidth:60}}>
                <AvatarDisplay race={selRace} frame={fid} size={32} showPulse={false}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:editFrame===fid?"var(--gold)":"#66BB6A",whiteSpace:"nowrap"}}>{si.frameData.name}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".35rem",color:"#66BB6A"}}>🏪</span>
              </button>;
            })}
          </div>
        </div>
        {/* Avatar title */}
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Cím</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {AVATAR_TITLES.map(t=>{const unlocked=_isAvatarUnlocked(t.req,{completed:completed.length,score:totalScore,friends:friends.length});
              return <button key={t.id} onClick={()=>unlocked&&setEditTitle(t.id)} style={{padding:"4px 10px",background:editTitle===t.id?"rgba(201,168,76,.12)":"rgba(0,0,0,.2)",border:`1px solid ${editTitle===t.id?"var(--gold)":"rgba(201,168,76,.1)"}`,color:editTitle===t.id?"var(--gold)":unlocked?"var(--text)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:unlocked?"pointer":"not-allowed",opacity:unlocked?1:.35,letterSpacing:".04em"}}>"{t.title}"{!unlocked&&<span style={{fontSize:".4rem",color:"var(--gm)",marginLeft:4}}>{t.req}</span>}</button>;
            })}
            {/* Shop-purchased titles */}
            {SHOP_ITEMS.filter(si=>si.type==="title"&&purchased.includes(si.id)).map(si=>{const tid=si.titleData.id;
              return <button key={tid} onClick={()=>setEditTitle(tid)} style={{padding:"4px 10px",background:editTitle===tid?"rgba(201,168,76,.12)":"rgba(0,0,0,.2)",border:`1px solid ${editTitle===tid?"var(--gold)":"rgba(102,187,106,.2)"}`,color:editTitle===tid?"var(--gold)":"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer",letterSpacing:".04em"}}>"{si.titleData.title}" 🏪</button>;
            })}
          </div>
        </div>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Bemutatkozás</div>
          <textarea value={bioEdit} onChange={e=>setBioEdit(e.target.value)} maxLength={120} placeholder="Mesélj magadról, kalandor..." style={{width:"100%",background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.2)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"8px 12px",outline:"none",resize:"none",height:70,boxSizing:"border-box"}}/>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",textAlign:"right"}}>{bioEdit.length}/120</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditMode(false)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid rgba(201,168,76,.15)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer"}}>Mégse</button>
          <button onClick={saveBio} style={{flex:1,padding:"9px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".7rem",cursor:"pointer"}}>Mentés ✓</button>
        </div>
      </div>
    </div>}

    {/* Sub tabs */}
    <div role="tablist" style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
      {TABS2.map(t=><button key={t.id} role="tab" aria-selected={tab===t.id} onClick={()=>setTab(t.id)} className="profile-subtab" style={{flex:1,padding:"8px 2px",background:"transparent",border:"none",color:tab===t.id?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".06em",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"color .3s",position:"relative"}}>
        <span style={{fontSize:".9rem"}}>{t.icon}</span>{t.label}
        <div style={{position:"absolute",bottom:0,left:"10%",width:tab===t.id?"80%":"0%",height:2,background:"var(--gold)",transition:"width .3s ease",borderRadius:1}}/>
      </button>)}
    </div>

    {/* STATS */}
    {tab==="stats"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{icon:"🏆",label:"Összes pont",val:totalScore,color:"var(--gold)"},{icon:"✅",label:"Teljesített",val:`${completed.length}/${TASKS.length}`,color:"#66BB6A"},{icon:"⚔️",label:"Barátok",val:friends.length,color:"#7A4ABB"},{icon:"🎖️",label:"Jelvények",val:`${achivs.filter(a=>a.done).length}/${achivs.length}`,color:"#3A7A8B"}].map(s=><div key={s.label} style={{padding:"10px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.09)",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:"1.3rem"}}>{s.icon}</span>
          <div><div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:s.color}}>{s.val}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".06em",textTransform:"uppercase"}}>{s.label}</div></div>
        </div>)}
      </div>
      {/* Ranked ELO card */}
      <div style={{padding:"14px",background:`linear-gradient(135deg,${eloRank.color}08,rgba(0,0,0,.2))`,border:`1px solid ${eloRank.color}33`,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:"2rem",filter:`drop-shadow(0 0 10px ${eloRank.color}66)`}}>{eloRank.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:eloRank.color}}>{eloRank.label}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>Ranked ELO</div>
          {/* ELO progress bar to next tier */}
          {(()=>{try{const idx=ELO_TIERS.findIndex(r=>(myElo||0)>=r.min);if(idx<0)return null;const nextTier=idx>0?ELO_TIERS[idx-1]:null;const curMin=ELO_TIERS[idx].min;if(!nextTier)return <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:eloRank.color,marginTop:4}}>Maximális rang!</div>;const pctElo=Math.min(((myElo-curMin)/(nextTier.min-curMin))*100,100);return <div><div style={{marginTop:5,height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${pctElo}%`,background:`linear-gradient(90deg,${eloRank.color},${nextTier.color})`,transition:"width .6s",borderRadius:2}}/></div><div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)",marginTop:2}}>{myElo}/{nextTier.min} a következő ranghoz</div></div>;}catch(e){return null;}})()}
        </div>
        <div style={{textAlign:"center",flexShrink:0}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:eloRank.color}}>{myElo}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)",letterSpacing:".1em"}}>ELO</div>
        </div>
      </div>
      <div style={{padding:"12px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.08)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:10}}>— Pontok feladatonként —</div>
        <BarChart color={race.color} data={TASKS.map(t=>({label:t.num,val:scores[t.id]||0}))}/>
      </div>
      {/* Detailed stats */}
      {(()=>{
        const taskScores=Object.entries(scores).filter(([k])=>!k.startsWith("season_")&&!k.startsWith("daily_")&&!k.startsWith("story_"));
        const avgScore=taskScores.length>0?Math.round(taskScores.reduce((a,[,v])=>a+v,0)/taskScores.length):0;
        const bestTask=taskScores.length>0?taskScores.reduce((a,b)=>b[1]>a[1]?b:a):null;
        const worstTask=taskScores.length>0?taskScores.reduce((a,b)=>b[1]<a[1]?b:a):null;
        const bestT=bestTask?TASKS.find(t=>String(t.id)===String(bestTask[0])):null;
        const worstT=worstTask?TASKS.find(t=>String(t.id)===String(worstTask[0])):null;
        const typeStats={};
        taskScores.forEach(([k,v])=>{const t=TASKS.find(t=>String(t.id)===String(k));if(t){typeStats[t.type]=(typeStats[t.type]||{sum:0,count:0});typeStats[t.type].sum+=v;typeStats[t.type].count++;}});
        const typeNames={quiz:"Kvíz",truefalse:"Igaz/Hamis",fillblank:"Szókitöltő",match:"Párosító",order:"Sorrend",rune:"Rúna",quote:"Idézet",scramble:"Betűkeverő",prophecy:"Jóslat"};
        return <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— Részletes Statisztikák —</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            <div style={{padding:"10px 8px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.08)",textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)"}}>{avgScore}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".06em"}}>ÁTLAG PONT</div>
            </div>
            <div style={{padding:"10px 8px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.08)",textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)"}}>{streak.count}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".06em"}}>STREAK 🔥</div>
            </div>
            <div style={{padding:"10px 8px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(201,168,76,.08)",textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)"}}>{purchased.length}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".06em"}}>BOLT TÁRGY</div>
            </div>
          </div>
          {bestT&&<div style={{display:"flex",gap:6}}>
            <div style={{flex:1,padding:"8px 10px",background:"rgba(102,187,106,.04)",border:"1px solid rgba(102,187,106,.15)",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1rem"}}>{bestT.icon}</span>
              <div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"#66BB6A",letterSpacing:".06em"}}>LEGJOBB</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--text)"}}>{bestT.title}: {bestTask[1]}pt</div></div>
            </div>
            {worstT&&<div style={{flex:1,padding:"8px 10px",background:"rgba(229,57,53,.04)",border:"1px solid rgba(229,57,53,.12)",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1rem"}}>{worstT.icon}</span>
              <div><div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"#EF9A9A",letterSpacing:".06em"}}>LEGGYENGÉBB</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--text)"}}>{worstT.title}: {worstTask[1]}pt</div></div>
            </div>}
          </div>}
          {/* Type breakdown */}
          {Object.keys(typeStats).length>0&&<div style={{padding:"10px 12px",background:"rgba(0,0,0,.15)",border:"1px solid rgba(201,168,76,.08)"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>Kategória bontás</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {Object.entries(typeStats).sort((a,b)=>(b[1].sum/b[1].count)-(a[1].sum/a[1].count)).map(([type,{sum,count}])=>{
                const avg=Math.round(sum/count);
                return <div key={type} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--text)",minWidth:80}}>{typeNames[type]||type}</span>
                  <div style={{flex:1,height:4,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(avg/2,100)}%`,background:`linear-gradient(90deg,${race.color},var(--gold))`,borderRadius:2}}/></div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--gm)",minWidth:28,textAlign:"right"}}>{avg}pt</span>
                </div>;
              })}
            </div>
          </div>}
        </div>;
      })()}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".16em",color:"var(--gm)",textTransform:"uppercase"}}>{achivs.filter(a=>a.done).length}/{achivs.length} teljesítve</div>
      <div role="list" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {achivs.map(a=><div role="listitem" key={a.name} style={{padding:"8px 10px",background:a.done?"rgba(201,168,76,.06)":"rgba(0,0,0,.15)",border:`1px solid ${a.done?"rgba(102,187,106,.3)":"rgba(255,255,255,.04)"}`,display:"flex",alignItems:"center",gap:8,opacity:a.done?1:.5,boxShadow:a.done?"0 0 8px rgba(102,187,106,.1)":"none"}}>
          <span style={{fontSize:"1.2rem",filter:a.done?"none":"grayscale(1) brightness(.5)",flexShrink:0}}>{a.icon}</span>
          <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:a.done?"var(--gold)":"var(--gm)"}}>{a.name}</div><div style={{fontFamily:"'EB Garamond',serif",fontSize:".68rem",color:"var(--td)",fontStyle:"italic"}}>{a.desc}</div>
          {a.progress&&<div style={{marginTop:3,height:2,background:"rgba(255,255,255,.06)",borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min((a.progress.current/a.progress.target)*100,100)}%`,background:a.done?"#66BB6A":"var(--gm)",transition:"width .5s",borderRadius:1}}/></div>}
          </div>
        </div>)}
      </div>
    </div>}

    {/* FRIENDS */}
    {tab==="friends"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:12}}>

      {/* Duel message */}
      {duelMsg&&<div style={{padding:"8px 12px",background:duelMsg.ok?"rgba(102,187,106,.08)":"rgba(229,57,53,.08)",border:`1px solid ${duelMsg.ok?"rgba(102,187,106,.3)":"rgba(229,57,53,.3)"}`,color:duelMsg.ok?"#66BB6A":"#EF9A9A",fontFamily:"'EB Garamond',serif",fontSize:".85rem",textAlign:"center"}}>{duelMsg.t}</div>}

      {/* Incoming requests */}
      {pendingIn.length>0&&<div style={{padding:"12px",background:"rgba(122,74,187,.05)",border:"1px solid rgba(122,74,187,.25)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"#B39DDB",textTransform:"uppercase",marginBottom:8}}>— {pendingIn.length} Bejövő kérelem —</div>
        {pendingIn.map(req=>{
          const fr=RACES.find(r=>r.id===req.race)||RACES[3];
          return <div key={req.from} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(122,74,187,.1)"}}>
            <span style={{fontSize:"1rem"}}>{fr.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--text)"}}>{req.from}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:fr.color}}>{fr.name} · {req.score||0}pt</div>
            </div>
            <button onClick={()=>acceptRequest(req.from,req.race,req.score)} style={{padding:"4px 10px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.4)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✓ Elfogad</button>
            <button onClick={()=>declineRequest(req.from)} style={{padding:"4px 8px",background:"none",border:"1px solid rgba(229,57,53,.25)",color:"rgba(229,57,53,.6)",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>✗</button>
          </div>;
        })}
      </div>}

      {/* Search & send request */}
      <div style={{padding:"12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.1)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— Kalandor keresése —</div>
        <div style={{display:"flex",gap:7}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendFriendRequest()} placeholder="Kalandor neve..." style={{flex:1,background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.18)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"7px 10px",outline:"none"}}/>
          <button onClick={sendFriendRequest} style={{padding:"7px 14px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer"}}>+ Kérelem</button>
        </div>
        {searchMsg&&<div style={{marginTop:7,fontFamily:"'Cinzel',serif",fontSize:".65rem",color:searchMsg.ok?"#66BB6A":"#EF9A9A"}}>{searchMsg.t}</div>}
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",fontStyle:"italic",marginTop:6}}>A másik játékosnak el kell fogadnia a kérelmet.</div>
      </div>

      {/* Friends list */}
      {friends.length===0
        ?<div style={{textAlign:"center",padding:"24px",opacity:.5}}><div style={{fontSize:"2rem",marginBottom:8}}>🤝</div><div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gm)"}}>Még nincsenek barátaid. Keress valakit!</div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— {friends.length} Szövetséges —</div>
          {[...friends].sort((a,b)=>{const aOn=onlineStatus[a.name]?.online?1:0;const bOn=onlineStatus[b.name]?.online?1:0;if(bOn!==aOn)return bOn-aOn;return(b.score||0)-(a.score||0);}).map((f,i)=>{
            const fr=RACES.find(r=>r.id===f.race)||RACES[3];
            const isOnline=onlineStatus[f.name]?.online;
            return <div key={f.name} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(201,168,76,.09)"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",minWidth:14}}>{i+1}.</div>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:34,height:34,borderRadius:"50%",border:`1.5px solid ${fr.color}`,background:`radial-gradient(circle,${fr.color}22,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".95rem"}}>{fr.icon}</div>
                <div style={{position:"absolute",bottom:-1,right:-1,width:10,height:10,borderRadius:"50%",background:isOnline?"#66BB6A":"#5A5040",border:"2px solid rgba(8,6,4,.95)",boxShadow:isOnline?"0 0 6px rgba(102,187,106,.5)":"none"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:isOnline?"#66BB6A":fr.color,textTransform:"uppercase"}}>{isOnline?"Online":"Offline"} · {fr.name}</div>
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)"}}>{f.score||0}pt</div>
              <button onClick={()=>setChatWith(f.name)} style={{padding:"4px 8px",background:"rgba(58,122,139,.08)",border:"1px solid rgba(58,122,139,.35)",color:"#4DADE2",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer",whiteSpace:"nowrap"}}>💬 Chat</button>
              <button onClick={()=>sendDuel(f.name)} style={{padding:"4px 8px",background:"rgba(198,40,40,.08)",border:"1px solid rgba(198,40,40,.3)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer",whiteSpace:"nowrap"}}>⚔️ Párbaj</button>
              <button onClick={()=>onInviteFriend&&onInviteFriend(f.name)} style={{padding:"4px 8px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".52rem",cursor:"pointer",whiteSpace:"nowrap"}}>🎲 Meghív</button>
              <button onClick={()=>removeFriend(f.name)} style={{background:"none",border:"1px solid rgba(229,57,53,.2)",color:"rgba(229,57,53,.5)",width:22,height:22,cursor:"pointer",fontSize:".65rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
            </div>;
          })}
        </div>
      }

      {/* Chat panel */}
      {chatWith&&<div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(4,3,2,.92)",display:"flex",flexDirection:"column",animation:"fadeSlideIn .25s ease both"}}>
        {/* Chat header */}
        <div style={{padding:"12px 16px",background:"rgba(10,8,5,.98)",borderBottom:"1px solid rgba(201,168,76,.15)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <button onClick={()=>{setChatWith(null);setMessages([]);setMsgInput("");}} style={{padding:"6px 12px",background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer"}}>← Vissza</button>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".8rem",color:"var(--gold)"}}>{chatWith}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".08em"}}>CHAT</div>
          </div>
          <button onClick={()=>{onInviteFriend&&onInviteFriend(chatWith);}} style={{padding:"5px 10px",background:"rgba(122,74,187,.1)",border:"1px solid rgba(122,74,187,.35)",color:"#B39DDB",fontFamily:"'Cinzel',serif",fontSize:".55rem",cursor:"pointer"}}>🎲 Meghív társasozni</button>
        </div>
        {/* Messages */}
        <div className="sc" style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:6}}>
          {messages.length===0&&<div style={{textAlign:"center",padding:"40px 0",opacity:.4}}>
            <div style={{fontSize:"2rem",marginBottom:8}}>💬</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gm)"}}>Kezdj el beszélgetni!</div>
          </div>}
          {messages.map((m,i)=>{
            const isMe=m.from===myName;
            const time=new Date(m.ts);
            const timeStr=`${String(time.getHours()).padStart(2,"0")}:${String(time.getMinutes()).padStart(2,"0")}`;
            return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",maxWidth:"80%",alignSelf:isMe?"flex-end":"flex-start"}}>
              <div style={{padding:"8px 12px",background:isMe?"rgba(201,168,76,.1)":"rgba(58,122,139,.08)",border:`1px solid ${isMe?"rgba(201,168,76,.25)":"rgba(58,122,139,.2)"}`,borderRadius:isMe?"12px 12px 2px 12px":"12px 12px 12px 2px",maxWidth:"100%",wordBreak:"break-word"}}>
                {!isMe&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"#4DADE2",marginBottom:2}}>{m.from}</div>}
                <div style={{fontFamily:"'EB Garamond',serif",fontSize:".92rem",color:"var(--text)",lineHeight:1.4}}>{m.text}</div>
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--gm)",marginTop:2,padding:"0 4px"}}>{timeStr}</div>
            </div>;
          })}
          <div ref={chatEndRef}/>
        </div>
        {/* Input */}
        <div style={{padding:"10px 16px",background:"rgba(10,8,5,.98)",borderTop:"1px solid rgba(201,168,76,.15)",display:"flex",gap:8,flexShrink:0}}>
          <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Üzenet írása..." style={{flex:1,background:"rgba(0,0,0,.5)",border:"1px solid rgba(201,168,76,.18)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".92rem",padding:"10px 14px",outline:"none",borderRadius:4}}/>
          <button onClick={sendMessage} style={{padding:"10px 18px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",cursor:"pointer",borderRadius:4,whiteSpace:"nowrap"}}>Küldés ›</button>
        </div>
      </div>}
    </div>}

    {/* LEADERBOARD */}
    {tab==="leaderboard"&&<LeaderboardPanel leaderboard={leaderboard} myName={myName}/>}

    {/* CLAN */}
    {tab==="clan"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".16em",color:"var(--gm)",textTransform:"uppercase",textAlign:"center"}}>— Klánok & Csapatok —</div>
      {clanMsg&&<div style={{padding:"8px 12px",background:clanMsg.ok?"rgba(102,187,106,.08)":"rgba(229,57,53,.08)",border:`1px solid ${clanMsg.ok?"rgba(102,187,106,.3)":"rgba(229,57,53,.3)"}`,color:clanMsg.ok?"#66BB6A":"#EF9A9A",fontFamily:"'EB Garamond',serif",fontSize:".85rem",textAlign:"center"}}>{clanMsg.t}</div>}
      {!myClan?<>
        {/* No clan — create or join */}
        <div style={{padding:"18px 16px",background:"linear-gradient(135deg,rgba(201,168,76,.04),rgba(201,168,76,.01))",border:"1px solid rgba(201,168,76,.15)",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:"var(--gold)",textAlign:"center"}}>Új Klán Alapítása</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",textAlign:"center",fontStyle:"italic"}}>Adj nevet a klánodnak és hívd meg a barátaidat!</div>
          <input value={clanInput} onChange={e=>setClanInput(e.target.value)} placeholder="Klán neve vagy kódja..." maxLength={30} style={{background:"rgba(0,0,0,.4)",border:"1px solid rgba(201,168,76,.18)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"10px 14px",outline:"none",borderRadius:4}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={createClan} style={{flex:1,padding:"10px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.4)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",cursor:"pointer",borderRadius:4}}>Alapítás ⚔️</button>
            <button onClick={joinClan} style={{flex:1,padding:"10px",background:"rgba(58,122,139,.08)",border:"1px solid rgba(58,122,139,.35)",color:"#4DB6AC",fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",cursor:"pointer",borderRadius:4}}>Csatlakozás 🛡️</button>
          </div>
        </div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--gm)",textAlign:"center",fontStyle:"italic"}}>Kérd el egy barátod klán kódját a csatlakozáshoz, vagy alapíts sajátot!</div>
      </>:<>
        {/* Has clan — show info */}
        <div style={{padding:"18px 16px",background:"linear-gradient(135deg,rgba(201,168,76,.06),rgba(201,168,76,.02))",border:"1px solid rgba(201,168,76,.22)",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.05rem",color:"var(--gold)"}}>{myClan.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",marginTop:2,letterSpacing:".08em"}}>Vezér: <span style={{color:"var(--gold)"}}>{myClan.leader}</span></div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.3rem",color:"var(--gold)"}}>{Object.keys(myClan.members||{}).length}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".08em"}}>TAG</div>
            </div>
          </div>
          {/* Clan code */}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(0,0,0,.3)",border:"1px solid rgba(201,168,76,.1)",borderRadius:4}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",flexShrink:0}}>KLÁN KÓD:</span>
            <span style={{fontFamily:"'Courier New',monospace",fontSize:".72rem",color:"var(--gold)",letterSpacing:".08em",flex:1,overflow:"hidden",textOverflow:"ellipsis"}}>{myClan.id}</span>
            <button onClick={()=>{navigator.clipboard?.writeText(myClan.id);setClanMsg({ok:true,t:"Kód másolva!"});setTimeout(()=>setClanMsg(null),1500);}} style={{padding:"4px 10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".5rem",cursor:"pointer",borderRadius:3}}>Másolás</button>
          </div>
          {/* Members list */}
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase"}}>— Tagok —</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {Object.values(myClan.members||{}).sort((a,b)=>(b.score||0)-(a.score||0)).map((m,i)=>{
              const mRace=RACES.find(r=>r.id===m.race)||RACES[3];
              return <div key={m.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:m.name===myName?"rgba(201,168,76,.06)":"rgba(0,0,0,.15)",border:`1px solid ${m.name===myName?"rgba(201,168,76,.18)":"rgba(201,168,76,.06)"}`,borderRadius:4}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",width:16,textAlign:"center"}}>{i+1}.</span>
                <span style={{fontSize:"1rem"}}>{mRace.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:m.name===myName?"var(--gold)":"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}{m.name===myClan.leader?" ⚜️":""}{m.name===myName?" (te)":""}</div>
                </div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gold)",flexShrink:0}}>{m.score||0} pt</div>
              </div>;
            })}
          </div>
          {/* Clan total score */}
          <div style={{padding:"10px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.12)",textAlign:"center"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase"}}>Klán összpontszám</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)",marginTop:4}}>{Object.values(myClan.members||{}).reduce((a,m)=>a+(m.score||0),0)}</div>
          </div>
          {/* Leave button */}
          <button onClick={leaveClan} style={{padding:"10px",background:"rgba(229,57,53,.06)",border:"1px solid rgba(229,57,53,.2)",color:"#EF9A9A",fontFamily:"'Cinzel',serif",fontSize:".65rem",letterSpacing:".1em",cursor:"pointer",borderRadius:4,marginTop:4}}>Kilépés a klánból ✕</button>
        </div>

        {/* ═══ BOSS FIGHT ═══ */}
        <div style={{position:"relative",padding:"18px 16px",background:`linear-gradient(180deg,${monthlyBoss.color}18,rgba(0,0,0,.3))`,border:`1px solid ${monthlyBoss.color}55`,overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${monthlyBoss.color},transparent)`}}/>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:monthlyBoss.color,textAlign:"center",letterSpacing:".18em",textShadow:`0 0 20px ${monthlyBoss.glow}`}}>HAVI BOSS</div>
          <div style={{fontSize:"3rem",textAlign:"center",marginTop:6,filter:`drop-shadow(0 0 18px ${monthlyBoss.glow})`,animation:"gP 2.5s ease infinite"}}>{monthlyBoss.icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:monthlyBoss.color,textAlign:"center",marginTop:4,letterSpacing:".1em"}}>{monthlyBoss.name}</div>

          {(!clanBoss||clanBoss.month!==bossMonth)?<div style={{textAlign:"center",padding:"14px 0"}}>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",fontStyle:"italic",marginBottom:12}}>{monthlyBoss.phases[0].desc}</div>
            {myClan.leader===myName
              ?<button onClick={initBoss} style={{padding:"10px 24px",background:`${monthlyBoss.color}15`,border:`1px solid ${monthlyBoss.color}88`,color:monthlyBoss.color,fontFamily:"'Cinzel',serif",fontSize:".75rem",letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase"}}>⚔️ Harc Indítása</button>
              :<div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gm)",fontStyle:"italic"}}>A klánvezér indíthatja a boss harcot.</div>}
          </div>

          :clanBoss.defeated?<div style={{textAlign:"center",padding:"14px 0"}}>
            <div style={{fontSize:"2rem",marginBottom:6}}>🏆</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"#66BB6A",letterSpacing:".1em"}}>LEGYŐZVE!</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>A klán legyőzte {monthlyBoss.name}-t!</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gold)",marginTop:6}}>Jutalom: +{monthlyBoss.reward.pts} pont · 🏅 „{monthlyBoss.reward.title}"</div>
            {/* Top contributors */}
            {clanBoss.contributors&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:3}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase"}}>— Hősök —</div>
              {Object.values(clanBoss.contributors).sort((a,b)=>b.damage-a.damage).slice(0,5).map((c,i)=><div key={c.name} style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:c.name===myName?"var(--gold)":"var(--gm)"}}>{i+1}. {c.name} — {c.damage} sebzés ({c.hits} csapás)</div>)}
            </div>}
          </div>

          :<div style={{padding:"10px 0",display:"flex",flexDirection:"column",gap:10}}>
            {/* Phase info */}
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:monthlyBoss.color,letterSpacing:".12em",textTransform:"uppercase"}}>{bossPhase?.label}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",fontStyle:"italic",marginTop:2}}>{bossPhase?.desc}</div>
            </div>
            {/* HP Bar */}
            {(()=>{const pct=Math.max(0,Math.round((clanBoss.currentHp/clanBoss.maxHp)*100));const urgent=pct<=25;return <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:urgent?"#66BB6A":"#EF9A9A",letterSpacing:".08em"}}>HP</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:urgent?"#66BB6A":"#EF9A9A"}}>{clanBoss.currentHp.toLocaleString()} / {clanBoss.maxHp.toLocaleString()}</span>
              </div>
              <div style={{height:14,background:"rgba(0,0,0,.5)",borderRadius:7,overflow:"hidden",border:`1px solid ${urgent?"rgba(102,187,106,.3)":"rgba(198,40,40,.3)"}`}}>
                <div style={{height:"100%",width:`${pct}%`,background:urgent?"linear-gradient(90deg,#2E7D32,#66BB6A)":`linear-gradient(90deg,${monthlyBoss.color},#EF9A9A)`,transition:"width .8s cubic-bezier(.22,1,.36,1)",borderRadius:7,boxShadow:urgent?"0 0 12px rgba(102,187,106,.5)":`0 0 12px ${monthlyBoss.glow}`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%)",animation:"searchSlide 2s ease-in-out infinite"}}/>
                </div>
              </div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".7rem",color:monthlyBoss.color,textAlign:"center",marginTop:4}}>{pct}%</div>
            </div>;})()}
            {/* Attack button */}
            {(()=>{const cdLeft=Math.max(0,bossAttackCd-Date.now());const canAttack=cdLeft<=0;const dmg=100+completed.length*20+Math.floor(totalScore/50);return <div style={{textAlign:"center"}}>
              <button onClick={attackBoss} disabled={!canAttack} style={{padding:"12px 28px",background:canAttack?`${monthlyBoss.color}18`:"rgba(0,0,0,.2)",border:`1px solid ${canAttack?monthlyBoss.color+"88":"rgba(201,168,76,.1)"}`,color:canAttack?monthlyBoss.color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".8rem",letterSpacing:".12em",cursor:canAttack?"pointer":"default",textTransform:"uppercase",opacity:canAttack?1:.5,transition:"all .3s"}}>⚔️ Támadás ({dmg} sebzés)</button>
              {!canAttack&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",marginTop:4}}>Újratöltés: {Math.ceil(cdLeft/1000)}s</div>}
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",marginTop:4,opacity:.6}}>Sebzés = 100 + feladatok×20 + pont/50</div>
            </div>;})()}
            {/* My contribution */}
            {clanBoss.contributors?.[myName]&&<div style={{padding:"8px 12px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.12)",borderRadius:4,textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".08em"}}>A te hozzájárulásod</div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)",marginTop:2}}>{clanBoss.contributors[myName].damage} sebzés</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)"}}>{clanBoss.contributors[myName].hits} csapás</div>
            </div>}
            {/* Top contributors */}
            {clanBoss.contributors&&Object.keys(clanBoss.contributors).length>0&&<div style={{display:"flex",flexDirection:"column",gap:3}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase",textAlign:"center"}}>— Harcosok —</div>
              {Object.values(clanBoss.contributors).sort((a,b)=>b.damage-a.damage).slice(0,5).map((c,i)=>{
                const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
                return <div key={c.name} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",background:c.name===myName?"rgba(201,168,76,.06)":"transparent",borderRadius:3}}>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",minWidth:14}}>{medal||`${i+1}.`}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:c.name===myName?"var(--gold)":"var(--text)",flex:1}}>{c.name}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:monthlyBoss.color}}>{c.damage}</span>
                </div>;
              })}
            </div>}
          </div>}
        </div>

        {/* ═══ CLAN WAR ═══ */}
        <div style={{position:"relative",padding:"18px 16px",background:"linear-gradient(180deg,rgba(139,0,0,.12),rgba(0,0,0,.3))",border:"1px solid rgba(198,40,40,.3)",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#C62828,#FF6F00,#C62828,transparent)"}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#C62828,#FF6F00,#C62828,transparent)"}}/>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"#EF9A9A",textAlign:"center",letterSpacing:".18em",textShadow:"0 0 20px rgba(198,40,40,.6)",animation:"warTitle 3s ease-in-out infinite"}}>KLÁN HÁBORÚ</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",textAlign:"center",fontStyle:"italic",marginTop:4}}>Teljesítsd a háborús küldetéseket a klánod dicsőségéért!</div>
        </div>
        {!clanWar?<div style={{padding:"16px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(198,40,40,.15)",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {WAR_MISSIONS.slice(0,4).map(m=><div key={m.id} style={{padding:"10px",background:"rgba(198,40,40,.04)",border:"1px solid rgba(198,40,40,.12)",textAlign:"center",borderRadius:4}}>
              <div style={{fontSize:"1.3rem"}}>{m.icon}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",marginTop:3}}>{m.name}</div>
            </div>)}
          </div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",textAlign:"center",fontStyle:"italic"}}>30 egyedi küldetés — 7 véletlenszerű minden háborúban</div>
          {myClan.leader===myName?<>
            <input value={warTarget} onChange={e=>setWarTarget(e.target.value)} placeholder="Ellenfél klán kódja..." style={{background:"rgba(0,0,0,.5)",border:"1px solid rgba(198,40,40,.25)",color:"var(--text)",fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"10px 14px",outline:"none",borderRadius:4}}/>
            <button onClick={()=>startClanWar(warTarget)} style={{padding:"12px",background:"linear-gradient(135deg,rgba(198,40,40,.15),rgba(139,0,0,.1))",border:"1px solid rgba(198,40,40,.5)",color:"#EF9A9A",fontFamily:"'Cinzel Decorative',serif",fontSize:".8rem",letterSpacing:".14em",cursor:"pointer",borderRadius:4,textShadow:"0 0 12px rgba(198,40,40,.4)"}}>Háború Indítása ⚔️</button>
          </>:<div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gm)",textAlign:"center",fontStyle:"italic"}}>Csak a klánvezér indíthat háborút.</div>}
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:0}}>
          {/* ── BATTLEFIELD HEADER ── */}
          <div style={{padding:"16px",background:"linear-gradient(135deg,rgba(139,0,0,.12),rgba(0,0,0,.3))",border:"1px solid rgba(198,40,40,.25)",borderBottom:"none",display:"flex",flexDirection:"column",gap:12}}>
            {/* VS Scoreboard */}
            <div style={{display:"flex",alignItems:"stretch",gap:0}}>
              {[["challenger","#C9A84C"],["defender","#EF9A9A"]].map(([side,clr],si)=>{
                const s=clanWar[side];const isMine=s.id===myClan.id;
                const myScore=s.score||0;
                return <div key={side} style={{flex:1,padding:"12px 10px",background:isMine?"rgba(201,168,76,.06)":"rgba(198,40,40,.04)",border:`1px solid ${isMine?"rgba(201,168,76,.25)":"rgba(198,40,40,.15)"}`,borderRadius:si===0?"4px 0 0 4px":"0 4px 4px 0",textAlign:"center",position:"relative",overflow:"hidden"}}>
                  {isMine&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"var(--gold)"}}/>}
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:isMine?"var(--gold)":"#EF9A9A",letterSpacing:".06em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.6rem",color:isMine?"var(--gold)":"#EF9A9A",marginTop:4,textShadow:`0 0 16px ${isMine?"rgba(201,168,76,.5)":"rgba(198,40,40,.5)"}`,animation:isMine?"":"none"}}>{myScore}</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--gm)",letterSpacing:".08em",marginTop:2}}>HÁBORÚS PONT</div>
                  {/* Member contributions */}
                  {s.members&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:2}}>
                    {Object.entries(s.members).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([name,pts])=><div key={name} style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:name===myName?"var(--gold)":"var(--gm)",opacity:.8}}>{name}: {pts}pt</div>)}
                  </div>}
                </div>;
              })}
            </div>
            {/* Score bar */}
            {(()=>{const cs=clanWar.challenger.score||0;const ds=clanWar.defender.score||0;const total=cs+ds||1;const cPct=Math.round(cs/total*100);return <div style={{position:"relative"}}>
              <div style={{height:10,background:"rgba(0,0,0,.4)",borderRadius:5,overflow:"hidden",display:"flex",border:"1px solid rgba(198,40,40,.15)"}}>
                <div style={{width:`${cPct}%`,background:clanWar.challenger.id===myClan.id?"linear-gradient(90deg,#8B6914,#C9A84C)":"linear-gradient(90deg,#8B0000,#EF9A9A)",transition:"width .8s cubic-bezier(.22,1,.36,1)",boxShadow:clanWar.challenger.id===myClan.id?"0 0 8px rgba(201,168,76,.5)":"0 0 8px rgba(198,40,40,.5)"}}/>
                <div style={{flex:1,background:clanWar.defender.id===myClan.id?"linear-gradient(90deg,#C9A84C,#8B6914)":"linear-gradient(90deg,#EF9A9A,#8B0000)",transition:"width .8s cubic-bezier(.22,1,.36,1)",boxShadow:clanWar.defender.id===myClan.id?"0 0 8px rgba(201,168,76,.5)":"0 0 8px rgba(198,40,40,.5)"}}/>
              </div>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontFamily:"'Cinzel Decorative',serif",fontSize:".55rem",color:"#fff",textShadow:"0 0 6px rgba(0,0,0,.9)",letterSpacing:".1em"}}>VS</div>
            </div>;})()}
            {/* Timer */}
            {(()=>{const left=Math.max(0,clanWar.expires-Date.now());const h=Math.floor(left/3600000);const m=Math.floor((left%3600000)/60000);const urgent=left<6*3600000;return <div style={{textAlign:"center",padding:"6px",background:urgent?"rgba(198,40,40,.08)":"rgba(0,0,0,.2)",border:`1px solid ${urgent?"rgba(198,40,40,.3)":"rgba(201,168,76,.1)"}`,borderRadius:4}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase"}}>Háború vége</div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:urgent?"#EF9A9A":"var(--gold)",letterSpacing:".12em",animation:urgent?"warUrgent 1s ease-in-out infinite":"none"}}>{left>0?`${h}ó ${m}p`:"LEJÁRT"}</div>
            </div>;})()}
          </div>
          {/* ── WAR MISSIONS ── */}
          <div style={{padding:"14px 16px",background:"rgba(0,0,0,.2)",border:"1px solid rgba(198,40,40,.15)",borderTop:"none",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"#EF9A9A",textTransform:"uppercase",textAlign:"center"}}>— Háborús Küldetések —</div>
            {(clanWar.missions||[]).map(mid=>{
              const m=WAR_MISSIONS.find(w=>w.id===mid);if(!m)return null;
              const side=clanWar.challenger.id===myClan.id?"challenger":"defender";
              const done=!!clanWar[side]?.completed?.[myName+"_"+mid];
              const prog=!done?getWarMissionProgress(m):null;
              const pct=prog?Math.min(100,Math.round(prog.current/prog.goal*100)):100;
              return <div key={mid} style={{padding:"12px 14px",background:done?"rgba(102,187,106,.06)":"rgba(198,40,40,.03)",border:`1px solid ${done?"rgba(102,187,106,.25)":"rgba(198,40,40,.12)"}`,borderRadius:4,display:"flex",flexDirection:"column",gap:6,transition:"all .3s",position:"relative",overflow:"hidden"}}>
                {done&&<div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:"#66BB6A"}}/>}
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:"1.4rem",filter:done?"none":"drop-shadow(0 0 6px rgba(198,40,40,.4))",flexShrink:0}}>{m.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:done?"#66BB6A":"var(--text)"}}>{m.name}</div>
                    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".75rem",color:"var(--gm)",fontStyle:"italic"}}>{m.desc}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:done?"#66BB6A":"#EF9A9A",marginTop:3}}>+{m.pts} háborús pont</div>
                  </div>
                  {done&&<span style={{fontSize:"1.2rem",flexShrink:0}}>✅</span>}
                </div>
                {!done&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:4,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct>=100?"#66BB6A":"linear-gradient(90deg,#8B0000,#EF9A9A)",transition:"width .5s",borderRadius:2}}/>
                  </div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:pct>=100?"#66BB6A":"var(--gm)",flexShrink:0,whiteSpace:"nowrap"}}>{m.type==="ultimate"?prog.label:`${prog.current}/${prog.goal} ${prog.label}`}</span>
                </div>}
              </div>;
            })}
          </div>
        </div>}

        {/* ═══ CLAN EVENTS ═══ */}
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",textAlign:"center",marginTop:4}}>— Klán Események —</div>
        {/* Active events */}
        {clanEvents.filter(e=>e.expires>Date.now()).map(ev=>{
          const pct=Math.min(100,Math.round((ev.progress||0)/ev.goal*100));
          const done=ev.progress>=ev.goal;
          const left=Math.max(0,ev.expires-Date.now());const h=Math.floor(left/3600000);
          return <div key={ev.fbKey} style={{padding:"14px 16px",background:done?"rgba(102,187,106,.06)":"rgba(0,0,0,.15)",border:`1px solid ${done?"rgba(102,187,106,.25)":"rgba(201,168,76,.15)"}`,display:"flex",flexDirection:"column",gap:10,borderRadius:4}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:"1.5rem"}}>{ev.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:done?"#66BB6A":"var(--gold)"}}>{ev.name}</div>
                <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",fontStyle:"italic"}}>{ev.desc}</div>
              </div>
              {done&&<span style={{fontSize:"1.2rem"}}>✅</span>}
            </div>
            {/* Progress bar */}
            <div style={{height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:done?"#66BB6A":"linear-gradient(90deg,var(--gold),#E8C96A)",transition:"width .5s",borderRadius:3}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:done?"#66BB6A":"var(--gm)"}}>{ev.progress||0}/{ev.goal} {ev.unit}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:left<3600000?"#EF9A9A":"var(--gm)"}}>{left>0?`${h}ó hátra`:"Lejárt"}</span>
            </div>
            {/* Contributors */}
            {ev.contributors&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {Object.entries(ev.contributors).map(([name,val])=><span key={name} style={{padding:"2px 8px",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.12)",borderRadius:10,fontFamily:"'Cinzel',serif",fontSize:".48rem",color:name===myName?"var(--gold)":"var(--gm)"}}>{name}: +{val}</span>)}
            </div>}
            {!done&&<button onClick={()=>contributeToEvent(ev.fbKey,1)} style={{padding:"8px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",borderRadius:3}}>Hozzájárulás +1 ✓</button>}
          </div>;
        })}
        {/* Start new event (leader only) */}
        {myClan.leader===myName&&<div style={{padding:"14px 16px",background:"rgba(0,0,0,.15)",border:"1px dashed rgba(201,168,76,.15)",display:"flex",flexDirection:"column",gap:10,borderRadius:4}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)",textAlign:"center"}}>Új Esemény Indítása</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {CLAN_EVENTS.map(ev=><button key={ev.id} onClick={()=>startClanEvent(ev.id)} style={{padding:"10px 14px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.12)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderRadius:4,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.12)"}>
              <span style={{fontSize:"1.2rem"}}>{ev.icon}</span>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{ev.name}</div>
                <div style={{fontFamily:"'EB Garamond',serif",fontSize:".72rem",color:"var(--gm)",fontStyle:"italic"}}>{ev.desc} ({ev.duration}ó)</div>
              </div>
            </button>)}
          </div>
        </div>}
        {myClan.leader!==myName&&clanEvents.filter(e=>e.expires>Date.now()).length===0&&<div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--gm)",textAlign:"center",fontStyle:"italic",padding:12}}>Nincs aktív esemény. A klánvezér indíthat újat.</div>}
      </>}
    </div>}

    {/* DAILY */}
    {tab==="daily"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:12}}>
      {/* Streak banner */}
      <div style={{padding:"14px 16px",background:`linear-gradient(135deg,rgba(255,152,0,.08),rgba(201,168,76,.04))`,border:"1px solid rgba(255,152,0,.25)",display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:"2rem",filter:"drop-shadow(0 0 8px rgba(255,152,0,.5))"}}>🔥</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"#FFB74D"}}>{streak.count} napos streak</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".08em",marginTop:2}}>Szorzó: <span style={{color:"#FFB74D"}}>{streakMultiplier}x</span>{streak.count>=3?" 🎉":""}</div>
        </div>
        <div style={{display:"flex",gap:3}}>
          {[3,7,14,30].map(m=><div key={m} style={{width:24,height:24,borderRadius:"50%",background:streak.count>=m?"rgba(255,152,0,.2)":"rgba(255,255,255,.03)",border:`1px solid ${streak.count>=m?"rgba(255,152,0,.5)":"rgba(255,255,255,.06)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".45rem",color:streak.count>=m?"#FFB74D":"var(--gm)",fontFamily:"'Cinzel',serif"}}>{m}</div>)}
        </div>
      </div>
      {streakToday&&<div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"#66BB6A",letterSpacing:".06em"}}>✓ Mai streak megtartva!</div>}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".16em",color:"var(--gm)",textTransform:"uppercase"}}>— Mai Napi Kihívás —</div>
      <div style={{padding:"16px",background:isDailyClaimed?"rgba(102,187,106,.06)":`linear-gradient(135deg,rgba(201,168,76,.05),rgba(201,168,76,.02))`,border:`1px solid ${isDailyClaimed?"rgba(102,187,106,.3)":"rgba(201,168,76,.18)"}`,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:"2rem"}}>{dailyChallenge.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:isDailyClaimed?"#66BB6A":"var(--text)"}}>{dailyChallenge.task}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",marginTop:3}}>Jutalom: <span style={{color:"var(--gold)"}}>+{Math.round(dailyChallenge.pts*streakMultiplier)} pont</span>{streakMultiplier>1?<span style={{color:"#FFB74D",fontSize:".52rem"}}> ({streakMultiplier}x streak)</span>:null}</div>
          </div>
          {isDailyClaimed&&<span style={{fontSize:"1.4rem"}}>✅</span>}
        </div>
        {isDailyClaimed
          ?<div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"#66BB6A"}}>✓ Teljesítve! Gyere vissza holnap!</div>
          :<button onClick={claimDaily} style={{padding:"10px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".72rem",letterSpacing:".12em",cursor:"pointer",textTransform:"uppercase"}}>Teljesítettem ✓</button>
        }
      </div>
      {/* Countdown */}
      <div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--gold)",letterSpacing:".1em"}}>Következő kihívás: <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".72rem"}}>{countdown}</span></div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— Heti Kihívások —</div>
      {DAILY_CHALLENGES.map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"rgba(0,0,0,.15)",border:"1px solid rgba(201,168,76,.07)",opacity:i===new Date().getDay()%DAILY_CHALLENGES.length?1:.5}}>
        <span style={{fontSize:"1.1rem"}}>{c.icon}</span>
        <div style={{flex:1}}><div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:"var(--text)",fontStyle:"italic"}}>{c.task}</div></div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gold)",flexShrink:0}}>+{c.pts}pt</div>
        {i===new Date().getDay()%DAILY_CHALLENGES.length&&<span style={{fontSize:".75rem",color:"var(--gold)"}}>◀</span>}
      </div>)}
    </div>}

    {/* STORY MODE */}
    {tab==="story"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{textAlign:"center",padding:"16px",background:"linear-gradient(135deg,rgba(122,74,187,.06),rgba(201,168,76,.04))",border:"1px solid rgba(122,74,187,.2)"}}>
        <div style={{fontSize:"2rem",marginBottom:6}}>📜</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",letterSpacing:".1em"}}>Bilbo Útja</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>Kövesd Bilbo kalandját a Megyétől a Magányos Hegyig!</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",marginTop:6,letterSpacing:".08em"}}>{storyRewards.length} / {STORY_CHAPTERS.length} fejezet teljesítve</div>
        <div style={{marginTop:8,height:5,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.round(storyRewards.length/STORY_CHAPTERS.length*100)}%`,background:"linear-gradient(90deg,#7A4ABB,#C9A84C)",transition:"width .6s",borderRadius:3}}/>
        </div>
      </div>
      {STORY_CHAPTERS.map((ch,i)=>{
        const prevDone=i===0||storyRewards.includes(STORY_CHAPTERS[i-1].id);
        const tasksComplete=ch.tasks.every(t=>completed.includes(t));
        const rewarded=storyRewards.includes(ch.id);
        const locked=!prevDone;
        return <div key={ch.id} style={{padding:"16px",background:rewarded?"rgba(102,187,106,.06)":locked?"rgba(0,0,0,.3)":"rgba(0,0,0,.15)",border:`1px solid ${rewarded?"rgba(102,187,106,.25)":locked?"rgba(255,255,255,.04)":`${ch.color}44`}`,opacity:locked?.4:1,position:"relative",overflow:"hidden",borderRadius:4}}>
          {locked&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,background:"rgba(0,0,0,.5)"}}><span style={{fontSize:"1.5rem"}}>🔒</span></div>}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:"1.8rem",filter:rewarded?"grayscale(.4)":`drop-shadow(0 0 8px ${ch.color}66)`,flexShrink:0}}>{ch.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".12em",textTransform:"uppercase"}}>Fejezet {ch.id}</div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".82rem",color:rewarded?"#66BB6A":ch.color}}>{ch.title}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--td)",fontStyle:"italic",marginTop:3,lineHeight:1.4}}>{ch.desc}</div>
            </div>
            {rewarded&&<span style={{fontSize:"1.3rem",flexShrink:0}}>✅</span>}
          </div>
          {/* Task progress */}
          <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
            {ch.tasks.map(tid=>{
              const t=TASKS.find(t=>t.id===tid);
              const done=completed.includes(tid);
              return <div key={tid} style={{padding:"4px 10px",background:done?"rgba(102,187,106,.08)":"rgba(0,0,0,.2)",border:`1px solid ${done?"rgba(102,187,106,.2)":"rgba(201,168,76,.1)"}`,borderRadius:12,display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:".7rem"}}>{t?.icon}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:done?"#66BB6A":"var(--gm)"}}>{t?.title||`#${tid}`}</span>
                {done&&<span style={{fontSize:".55rem"}}>✓</span>}
              </div>;
            })}
          </div>
          {/* Reward */}
          <div style={{marginTop:8,padding:"8px 12px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)"}}>Jutalom: </span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:"var(--gold)"}}>+{ch.reward.pts} pont</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"#B39DDB",marginLeft:6}}>+ "{ch.reward.title}" cím</span>
            </div>
            {tasksComplete&&!rewarded&&!locked&&<button onClick={()=>claimStoryReward(ch.id,ch.reward.pts)} style={{padding:"5px 14px",background:"rgba(102,187,106,.1)",border:"1px solid rgba(102,187,106,.4)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".58rem",cursor:"pointer",borderRadius:3}}>Begyűjtés ✓</button>}
          </div>
        </div>;
      })}
    </div>}

    {/* SHOP */}
    {tab==="shop"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{textAlign:"center",padding:"16px",background:"linear-gradient(135deg,rgba(201,168,76,.06),rgba(232,201,106,.03))",border:"1px solid rgba(201,168,76,.2)"}}>
        <div style={{fontSize:"2rem",marginBottom:6}}>🏪</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",letterSpacing:".1em"}}>Középfölde Piactere</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>Vásárolj egyedi kereteket, címeket és effekteket a pontjaidból!</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",color:"var(--gold)",marginTop:8,padding:"6px 16px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",display:"inline-block",borderRadius:20}}>💰 Egyenleged: <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".85rem"}}>{totalScore}</span> pont</div>
      </div>
      {shopMsg&&<div style={{padding:"8px 12px",background:shopMsg.ok?"rgba(102,187,106,.08)":"rgba(229,57,53,.08)",border:`1px solid ${shopMsg.ok?"rgba(102,187,106,.3)":"rgba(229,57,53,.3)"}`,color:shopMsg.ok?"#66BB6A":"#EF9A9A",fontFamily:"'EB Garamond',serif",fontSize:".85rem",textAlign:"center"}}>{shopMsg.t}</div>}
      {/* Group by type */}
      {/* ── Cases ── */}
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— 📦 Ládák —</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {SHOP_ITEMS.filter(i=>i.type==="case").map(item=>{
            const canAfford=totalScore>=item.cost;
            const rarityLabel=item.bonusRarity?`Min. ${STAR_RARITIES[Math.min(item.bonusRarity,STAR_RARITIES.length-1)].name}`:"";
            return <div key={item.id} style={{padding:"12px 14px",background:"rgba(179,157,219,.04)",border:"1px solid rgba(179,157,219,.15)",borderRadius:4,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:"1.5rem",flexShrink:0}}>{item.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--text)"}}>{item.name}</div>
                <div style={{fontFamily:"'EB Garamond',serif",fontSize:".75rem",color:"var(--gm)",fontStyle:"italic"}}>{item.desc}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".48rem",color:"var(--td)",marginTop:3,display:"flex",gap:8}}>
                  <span>⭐ ×{item.drops}</span>
                  {rarityLabel&&<span style={{color:STAR_RARITIES[Math.min(item.bonusRarity,STAR_RARITIES.length-1)].color}}>{rarityLabel}</span>}
                </div>
              </div>
              <button onClick={()=>buyItem(item)} style={{padding:"6px 14px",background:canAfford?"rgba(179,157,219,.1)":"rgba(0,0,0,.2)",border:`1px solid ${canAfford?"rgba(179,157,219,.35)":"rgba(255,255,255,.06)"}`,color:canAfford?"#B39DDB":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".58rem",cursor:canAfford?"pointer":"not-allowed",borderRadius:3,flexShrink:0,whiteSpace:"nowrap",opacity:canAfford?1:.5}}>💰 {item.cost.toLocaleString()}pt</button>
            </div>;
          })}
        </div>
      </div>
      {/* ── Regular items ── */}
      {[{type:"frame",label:"Keretek",icon:"🖼️"},{type:"title",label:"Címek",icon:"📛"},{type:"background",label:"Hátterek",icon:"🌄"},{type:"effect",label:"Effektek",icon:"✨"}].map(cat=>{
        const items=SHOP_ITEMS.filter(i=>i.type===cat.type);
        return <div key={cat.type}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:8}}>— {cat.icon} {cat.label} —</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {items.map(item=>{
              const owned=purchased.includes(item.id);
              const canAfford=totalScore>=item.cost;
              return <div key={item.id} style={{padding:"12px 14px",background:owned?"rgba(102,187,106,.05)":"rgba(0,0,0,.15)",border:`1px solid ${owned?"rgba(102,187,106,.2)":"rgba(201,168,76,.1)"}`,borderRadius:4,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:"1.5rem",flexShrink:0}}>{item.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:owned?"#66BB6A":"var(--text)"}}>{item.name}</div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:".75rem",color:"var(--gm)",fontStyle:"italic"}}>{item.desc}</div>
                </div>
                {owned
                  ?<span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"#66BB6A",flexShrink:0}}>Megvan ✓</span>
                  :<button onClick={()=>buyItem(item)} style={{padding:"6px 14px",background:canAfford?"rgba(201,168,76,.1)":"rgba(0,0,0,.2)",border:`1px solid ${canAfford?"rgba(201,168,76,.35)":"rgba(255,255,255,.06)"}`,color:canAfford?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".58rem",cursor:canAfford?"pointer":"not-allowed",borderRadius:3,flexShrink:0,whiteSpace:"nowrap",opacity:canAfford?1:.5}}>💰 {item.cost}pt</button>
                }
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>}

    {/* CRATES */}
    {tab==="crates"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{textAlign:"center",padding:"16px",background:"linear-gradient(135deg,rgba(201,168,76,.06),rgba(179,157,219,.04))",border:"1px solid rgba(201,168,76,.2)"}}>
        <div style={{fontSize:"2rem",marginBottom:6,animation:"gP 2.5s ease infinite"}}>⭐</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",letterSpacing:".1em"}}>Csillagzsákmány</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>Nyisd ki és nézd, milyen ritkaságú lesz — fejlődhet!</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",marginTop:6,letterSpacing:".08em"}}>{starDrops.length} zsákmány vár rád</div>
      </div>

      {/* Rarity legend */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
        {STAR_RARITIES.map(r=><div key={r.id} style={{padding:"8px 4px",background:`${r.color}08`,border:`1px solid ${r.color}33`,borderRadius:4,textAlign:"center"}}>
          <div style={{fontSize:"1.3rem"}}>{r.icon}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:r.color,marginTop:2,letterSpacing:".06em"}}>{r.name}</div>
          {r.upgradeChance>0&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".38rem",color:"var(--gm)",marginTop:1}}>↑ {Math.round(r.upgradeChance*100)}%</div>}
        </div>)}
      </div>

      {/* Star Drop opening animation */}
      {dropAnim&&<div style={{padding:"24px 16px",background:"rgba(0,0,0,.5)",border:`2px solid ${STAR_RARITIES[dropAnim.rarity].color}`,textAlign:"center",transition:"border-color .5s",borderRadius:6}}>
        {dropAnim.phase==="upgrading"&&<>
          <div style={{fontSize:"3.5rem",animation:"diceGlowPulse 1s ease infinite",filter:`drop-shadow(0 0 20px ${STAR_RARITIES[dropAnim.rarity].glow})`,transition:"filter .5s"}}>{STAR_RARITIES[dropAnim.rarity].icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:STAR_RARITIES[dropAnim.rarity].color,marginTop:10,letterSpacing:".12em",transition:"color .5s"}}>{STAR_RARITIES[dropAnim.rarity].name}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gm)",marginTop:6,animation:"gP 1.5s ease infinite"}}>Fejlődik...?</div>
          {/* Rarity dots */}
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10}}>
            {STAR_RARITIES.map((r,i)=><div key={r.id} style={{width:12,height:12,borderRadius:"50%",background:i<=dropAnim.rarity?r.color:"rgba(255,255,255,.06)",border:`1.5px solid ${i<=dropAnim.rarity?r.color:"rgba(255,255,255,.1)"}`,boxShadow:i===dropAnim.rarity?`0 0 12px ${r.glow}`:"none",transition:"all .5s"}}/>)}
          </div>
        </>}
        {dropAnim.phase==="spinning"&&<>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:STAR_RARITIES[dropAnim.finalRarity].color,letterSpacing:".14em",textTransform:"uppercase",marginBottom:10}}>{STAR_RARITIES[dropAnim.finalRarity].name} Zsákmány</div>
          {/* CS2-style carousel */}
          <div style={{overflow:"hidden",height:90,position:"relative",border:`1px solid ${STAR_RARITIES[dropAnim.finalRarity].color}33`,background:"rgba(0,0,0,.5)",borderRadius:6}}>
            {/* Center pointer triangle */}
            <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:`10px solid ${STAR_RARITIES[dropAnim.finalRarity].color}`,zIndex:3,filter:`drop-shadow(0 2px 6px ${STAR_RARITIES[dropAnim.finalRarity].glow})`}}/>
            {/* Center vertical lines */}
            <div style={{position:"absolute",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:80,borderLeft:`2px solid ${STAR_RARITIES[dropAnim.finalRarity].color}88`,borderRight:`2px solid ${STAR_RARITIES[dropAnim.finalRarity].color}88`,zIndex:2,pointerEvents:"none",boxShadow:dropAnim.settled?`inset 0 0 30px ${STAR_RARITIES[dropAnim.finalRarity].glow}`:"none",transition:"box-shadow .5s"}}/>
            {/* Bottom pointer */}
            <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:`10px solid ${STAR_RARITIES[dropAnim.finalRarity].color}`,zIndex:3,filter:`drop-shadow(0 -2px 6px ${STAR_RARITIES[dropAnim.finalRarity].glow})`}}/>
            {/* Scrolling strip */}
            <div style={{display:"flex",alignItems:"center",height:"100%",transition:dropAnim.spinPx>0?"transform 5.5s cubic-bezier(0.12,0.76,0.24,1)":"none",transform:`translateX(calc(50% - 40px - ${dropAnim.spinPx}px))`,willChange:"transform"}}>
              {dropAnim.spinItems.map((item,i)=>{
                const rr=STAR_RARITIES.find(r=>r.id===item.rarity)||STAR_RARITIES[0];
                return <div key={i} style={{minWidth:80,height:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,borderRight:"1px solid rgba(255,255,255,.04)"}}>
                  <span style={{fontSize:"1.8rem"}}>{item.icon}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:".38rem",color:rr.color,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:72}}>{item.label.slice(0,14)}</span>
                  <span style={{width:6,height:6,borderRadius:"50%",background:rr.color,opacity:.6}}/>
                </div>;
              })}
            </div>
            {/* Edge fades */}
            <div style={{position:"absolute",top:0,bottom:0,left:0,width:60,background:"linear-gradient(90deg,rgba(0,0,0,.8),transparent)",zIndex:1,pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:0,bottom:0,right:0,width:60,background:"linear-gradient(270deg,rgba(0,0,0,.8),transparent)",zIndex:1,pointerEvents:"none"}}/>
          </div>
        </>}
        {dropAnim.phase==="reveal"&&dropAnim.reward&&<>
          <div style={{fontSize:"3rem",marginBottom:8,animation:"popIn .5s ease"}}>{dropAnim.reward.icon}</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:STAR_RARITIES[dropAnim.finalRarity].color,letterSpacing:".1em"}}>{dropAnim.reward.label}</div>
          {dropAnim.reward.amount&&<div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.5rem",color:"var(--gold)",marginTop:6,animation:"gP 2s ease infinite"}}>+{dropAnim.reward.amount.toLocaleString()}</div>}
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:STAR_RARITIES[dropAnim.finalRarity].color,marginTop:6,padding:"3px 12px",background:`${STAR_RARITIES[dropAnim.finalRarity].color}12`,border:`1px solid ${STAR_RARITIES[dropAnim.finalRarity].color}44`,display:"inline-block",borderRadius:12}}>{STAR_RARITIES[dropAnim.finalRarity].icon} {STAR_RARITIES[dropAnim.finalRarity].name}</div>
          <div><button onClick={()=>setDropAnim(null)} style={{marginTop:14,padding:"8px 24px",background:"none",border:"1px solid rgba(201,168,76,.3)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",letterSpacing:".1em"}}>Rendben</button></div>
        </>}
      </div>}

      {/* Star drops inventory */}
      {starDrops.length===0&&!dropAnim?<div style={{textAlign:"center",padding:"24px",opacity:.5}}>
        <div style={{fontSize:"2rem",marginBottom:8}}>🔒</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--gm)"}}>Nincs zsákmányod. Teljesíts feladatokat!</div>
      </div>
      :<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {!dropAnim&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— {starDrops.length} zsákmány —</div>}
        {!dropAnim&&starDrops.map(d=><div key={d.id} style={{padding:"14px 16px",background:"linear-gradient(135deg,rgba(201,168,76,.06),rgba(179,157,219,.03))",border:"1px solid rgba(201,168,76,.2)",borderRadius:4,display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all .3s"}} onClick={()=>openStarDrop(d.id)}>
          <div style={{fontSize:"2.2rem",animation:"gP 3s ease infinite",filter:"drop-shadow(0 0 12px rgba(201,168,76,.4))"}}>⭐</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:"var(--gold)"}}>Csillagzsákmány</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".45rem",color:"var(--gm)",marginTop:2}}>Kapva: {new Date(d.earned).toLocaleDateString("hu-HU")}</div>
          </div>
          <div style={{padding:"8px 16px",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.35)",color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:".65rem",letterSpacing:".1em",borderRadius:3}}>Nyitás ⭐</div>
        </div>)}
      </div>}

      {/* History */}
      {dropHistory.length>0&&!dropAnim&&<div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",marginBottom:6}}>— Előzmények —</div>
        {dropHistory.slice(0,10).map((h,i)=>{
          const rr=STAR_RARITIES.find(r=>r.id===h.rarityId)||STAR_RARITIES[0];
          return <div key={i} style={{padding:"6px 10px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid rgba(201,168,76,.06)"}}>
            <span style={{fontSize:".9rem"}}>{rr.icon}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:rr.color,flex:1}}>{h.label}{h.amount?` (+${h.amount.toLocaleString()})`:""}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--gm)"}}>{new Date(h.time).toLocaleDateString("hu-HU")}</span>
          </div>;
        })}
      </div>}
    </div>}

    {/* VOTE */}
    {tab==="vote"&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{textAlign:"center",padding:"16px",background:"linear-gradient(135deg,rgba(58,122,139,.06),rgba(201,168,76,.04))",border:"1px solid rgba(58,122,139,.2)"}}>
        <div style={{fontSize:"2rem",marginBottom:6}}>🗳️</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:"var(--gold)",letterSpacing:".1em"}}>Heti Szavazás</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--td)",fontStyle:"italic",marginTop:4}}>Szavazz, melyik legyen a jövő hét kiemelt kihívása!</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",marginTop:6,letterSpacing:".08em"}}>Hét #{weekNum} · Összesen {totalVotes} szavazat</div>
      </div>
      {winningVote&&<div style={{padding:"12px 16px",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.25)",borderRadius:4,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:"1.5rem"}}>{winningVote.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase"}}>Jelenlegi vezető</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:"var(--gold)"}}>{winningVote.name}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:".72rem",color:"var(--td)",fontStyle:"italic"}}>{winningVote.desc}</div>
        </div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)"}}>{votes[winningVote.id]||0}</div>
      </div>}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase"}}>— Jelöltek —</div>
      {VOTE_OPTIONS.map(opt=>{
        const count=votes[opt.id]||0;
        const pctV=totalVotes>0?Math.round(count/totalVotes*100):0;
        const isMyVote=myVote===opt.id;
        return <div key={opt.id} style={{padding:"14px 16px",background:isMyVote?"rgba(58,122,139,.08)":"rgba(0,0,0,.15)",border:`1px solid ${isMyVote?"rgba(58,122,139,.35)":"rgba(201,168,76,.1)"}`,borderRadius:4,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:"1.4rem",flexShrink:0}}>{opt.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:isMyVote?"#4DB6AC":"var(--text)"}}>{opt.name}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".72rem",color:"var(--gm)",fontStyle:"italic"}}>{opt.desc}</div>
            </div>
            {!myVote
              ?<button onClick={()=>castVote(opt.id)} style={{padding:"6px 14px",background:"rgba(58,122,139,.1)",border:"1px solid rgba(58,122,139,.35)",color:"#4DB6AC",fontFamily:"'Cinzel',serif",fontSize:".58rem",cursor:"pointer",borderRadius:3,flexShrink:0}}>Szavazok</button>
              :<div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:isMyVote?"#4DB6AC":"var(--gm)"}}>{count}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:".42rem",color:"var(--gm)"}}>{pctV}%</div>
              </div>
            }
          </div>
          {myVote&&<div style={{height:4,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pctV}%`,background:isMyVote?"#4DB6AC":"var(--gm)",transition:"width .6s",borderRadius:2}}/>
          </div>}
        </div>;
      })}
      {myVote&&<div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"#4DB6AC"}}>✓ Szavaztál ezen a héten!</div>}
    </div>}

    {/* SEASONAL EVENT */}
    {tab==="season"&&activeSeason&&<div style={{padding:"14px 12px",display:"flex",flexDirection:"column",gap:14}}>
      {/* Season banner */}
      <div style={{padding:"20px 16px",background:activeSeason.bg,border:`1px solid ${activeSeason.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${activeSeason.color},transparent)`}}/>
        <div style={{textAlign:"center",marginBottom:8}}>
          <span style={{fontSize:"2.2rem",display:"block",filter:`drop-shadow(0 0 12px ${activeSeason.glow})`,animation:"seasonIcon 3s ease-in-out infinite"}}>{activeSeason.icon}</span>
        </div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1rem",color:activeSeason.color,textAlign:"center",letterSpacing:".12em"}}>{activeSeason.name}</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:".88rem",color:"var(--td)",textAlign:"center",fontStyle:"italic",marginTop:6,lineHeight:1.5}}>{activeSeason.desc}</div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${activeSeason.color},transparent)`}}/>
      </div>
      {/* Season challenges */}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",letterSpacing:".14em",color:"var(--gm)",textTransform:"uppercase",textAlign:"center"}}>— Szezonális Kihívások —</div>
      <div style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",color:"var(--gm)",textAlign:"center",fontStyle:"italic"}}>Teljesítsd a kihívásokat a szezon alatt bónusz pontokért!</div>
      {activeSeason.challenges.map((ch,i)=>{
        const done=seasonDone.includes(ch.key);
        return <div key={ch.key} style={{padding:"14px 16px",background:done?"rgba(102,187,106,.06)":"rgba(0,0,0,.15)",border:`1px solid ${done?"rgba(102,187,106,.25)":activeSeason.border}`,display:"flex",flexDirection:"column",gap:10,borderRadius:4,transition:"all .3s"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:"1.6rem",filter:done?"grayscale(.5)":"none"}}>{ch.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",color:done?"#66BB6A":"var(--text)"}}>{ch.task}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:done?"#66BB6A":"var(--gm)",marginTop:3}}>Jutalom: <span style={{color:done?"#66BB6A":activeSeason.color}}>+{ch.pts} pont</span></div>
            </div>
            {done&&<span style={{fontSize:"1.3rem"}}>✅</span>}
          </div>
          {!done&&<button onClick={()=>claimSeason(ch.key,ch.pts)} style={{padding:"9px",background:`${activeSeason.color}15`,border:`1px solid ${activeSeason.color}55`,color:activeSeason.color,fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".1em",cursor:"pointer",borderRadius:3}}>Teljesítettem ✓</button>}
        </div>;
      })}
      {/* Progress */}
      <div style={{padding:"12px 16px",background:"rgba(0,0,0,.2)",border:`1px solid ${activeSeason.border}`,textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",letterSpacing:".1em",textTransform:"uppercase"}}>Szezonális haladás</div>
        <div style={{marginTop:8,height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.round(activeSeason.challenges.filter(c=>seasonDone.includes(c.key)).length/activeSeason.challenges.length*100)}%`,background:`linear-gradient(90deg,${activeSeason.color}88,${activeSeason.color})`,transition:"width .6s",borderRadius:3}}/>
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:activeSeason.color,marginTop:6}}>{activeSeason.challenges.filter(c=>seasonDone.includes(c.key)).length} / {activeSeason.challenges.length} teljesítve</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:".52rem",color:"var(--gm)",marginTop:3}}>Bónusz pontok: +{activeSeason.challenges.filter(c=>seasonDone.includes(c.key)).reduce((a,c)=>a+c.pts,0)}</div>
      </div>
    </div>}
  </div>;
}

// ── BOARD GAME TAB ─────────────────────────────────────────────────────────────
function BoardGameTab({user,onBack}){
  return <BoardGame user={user} onBack={onBack}/>;
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function HobbitApp(){
  const [user]=useState(()=>{
    try{const u=JSON.parse(localStorage.getItem("hobbit_current"));return u?.adventureName?u:null;}catch{return null;}
  });
  const [completed,setCompleted]=useState(()=>{try{const u=JSON.parse(localStorage.getItem("hobbit_current")||"{}");return u.completedTasks||[];}catch{return [];}});
  const [scores,setScores]=useState(()=>{try{return JSON.parse(localStorage.getItem("hobbit_task_scores")||"{}");}catch{return {};}});
  const [activeTask,setActiveTask]=useState(null);
  const [tab,setTab]=useState("map");
  const [muted,setMuted]=useState(isMuted);
  const [achievePopup,setAchievePopup]=useState(null);
  const [gameInvitePopup,setGameInvitePopup]=useState(null);
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const totalScore=Object.values(scores).reduce((a,b)=>a+b,0);
  const myName=user?.adventureName;

  // Global game invite listener
  useEffect(()=>{
    if(!myName) return;
    try{
      const {getDatabase,ref:fbRef,onValue,off}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      const invRef=fbRef(db,`users/${myName}/gameInvites`);
      onValue(invRef,(snap)=>{
        const data=snap.val()||{};
        const invites=Object.values(data);
        if(invites.length>0&&!gameInvitePopup){
          sfx.notify();
          setGameInvitePopup(invites[0]);
        }else if(invites.length===0){
          setGameInvitePopup(null);
        }
      });
      return ()=>off(invRef);
    }catch(e){}
  },[myName]);

  const acceptGameInvite=async(inv)=>{
    try{
      const {getDatabase,ref:fbRef,remove,update,get}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      // Remove invite
      await remove(fbRef(db,`users/${myName}/gameInvites/${inv.from}`));
      // Join the game
      const snap=await get(fbRef(db,`games/${inv.gameId}`));
      if(snap.exists()){
        const d=snap.val();
        if(d.status==="waiting"&&Object.keys(d.players||{}).length<4){
          await update(fbRef(db,`games/${inv.gameId}/players/${myName}`),{name:myName,race:user?.race||"human",position:0,score:0,coins:50,cards:[],skipTurn:false,extraStep:0});
          // Set localStorage so BoardGame picks up the game
          localStorage.setItem("hb_gameId",inv.gameId);
          localStorage.setItem("hb_screen","waiting");
        }
      }
      setGameInvitePopup(null);
      setTab("board");
    }catch(e){setGameInvitePopup(null);}
  };

  const declineGameInvite=(inv)=>{
    try{
      const {getDatabase,ref:fbRef,remove}=window.__fbDB||{};
      if(!getDatabase) return;
      const db=getDatabase();
      remove(fbRef(db,`users/${myName}/gameInvites/${inv.from}`));
      setGameInvitePopup(null);
    }catch(e){setGameInvitePopup(null);}
  };

  const handleComplete=useCallback((taskId,score)=>{
    sfx.success();
    setCompleted(c=>{const next=c.includes(taskId)?c:[...c,taskId];const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.completedTasks=next;localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});
    setScores(s=>{const next={...s,[taskId]:Math.max(s[taskId]||0,score)};localStorage.setItem("hobbit_task_scores",JSON.stringify(next));const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.score=Object.values(next).reduce((a,b)=>a+b,0);localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});
  },[]);

  // ── Achievement unlock detection ──
  const achieveQueueRef=useRef([]);
  const achieveInitRef=useRef(false);
  useEffect(()=>{
    const stats=_getAchievementStats(completed,scores);
    const nowUnlocked=ACHIEVEMENTS.filter(a=>a.check(stats)).map(a=>a.id);
    const prev=JSON.parse(localStorage.getItem("hobbit_unlocked_achievements")||"[]");
    if(!achieveInitRef.current){
      // First render: seed localStorage without popup
      achieveInitRef.current=true;
      localStorage.setItem("hobbit_unlocked_achievements",JSON.stringify(nowUnlocked));
      return;
    }
    const newlyUnlocked=nowUnlocked.filter(id=>!prev.includes(id));
    if(newlyUnlocked.length>0){
      localStorage.setItem("hobbit_unlocked_achievements",JSON.stringify(nowUnlocked));
      const newAchievements=newlyUnlocked.map(id=>ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean);
      achieveQueueRef.current=[...achieveQueueRef.current,...newAchievements];
      if(!achievePopup&&achieveQueueRef.current.length>0){
        sfx.achievement();
        setAchievePopup(achieveQueueRef.current.shift());
      }
    }
  },[completed,scores]);

  useEffect(()=>{
    if(!achievePopup)return;
    const t=setTimeout(()=>{
      setAchievePopup(null);
      setTimeout(()=>{
        if(achieveQueueRef.current.length>0){
          sfx.achievement();
          setAchievePopup(achieveQueueRef.current.shift());
        }
      },300);
    },4000);
    return()=>clearTimeout(t);
  },[achievePopup]);

  // ── Háttérzene váltás tab alapján ──
  useEffect(()=>{
    if(muted)return;
    if(tab==="games")playMusic("tavern");
    else if(tab==="board")playMusic("battle");
    else playMusic("theme");
  },[tab,muted]);

  const switchTab=(id)=>{setTab(id);};

  const TABS=[{id:"map",icon:"🗺️",label:"Térkép"},{id:"games",icon:"🎮",label:"Minijátékok"},{id:"profile",icon:"👤",label:"Profil"},{id:"board",icon:"🎲",label:"Társasjáték"}];

  if(!user) return null;

  const globalClick=useCallback((e)=>{if(e.target.closest("button")||e.target.closest("[role='tab']")||e.target.closest(".quiz-opt")||e.target.closest(".tf-btn")||e.target.closest(".fill-opt")||e.target.closest(".match-char")||e.target.closest(".match-desc")||e.target.closest(".rune-key")||e.target.closest(".quote-char")||e.target.closest(".prophecy-opt"))sfx.click(.3);},[]);

  return <>
    <style>{CSS}</style>
    <div className="root" onClick={globalClick}>
      <FloatingStones count={12}/>
      <div className="noise"/>
      <div style={{position:"relative",zIndex:10,height:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 20px",background:"rgba(8,6,4,.92)",borderBottom:"1px solid rgba(201,168,76,.12)",backdropFilter:"blur(8px)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"serif",color:"var(--gold)",opacity:.5}}>ᚠ</span>
            <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".9rem",color:"var(--gold)"}}>A HOBBIT</span>
            <span style={{fontFamily:"serif",color:"var(--gold)",opacity:.5}}>ᚠ</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>{toggleMute();setMuted(isMuted());}} style={{background:"none",border:"1px solid rgba(201,168,76,.15)",color:muted?"var(--gm)":"var(--gold)",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:".8rem",display:"flex",alignItems:"center",justifyContent:"center",opacity:muted?.5:1,transition:"all .2s"}} title={muted?"Hang bekapcsolása":"Hang kikapcsolása"}>{muted?"🔇":"🔊"}</button>
            <span style={{fontSize:".95rem"}}>{race.icon}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--text)"}}>{user?.adventureName}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",padding:"2px 8px",border:"1px solid rgba(201,168,76,.26)",background:"rgba(201,168,76,.05)"}}>{totalScore}pt</span>
          </div>
        </header>

        {/* Content */}
        <ErrorCatch>
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          {tab==="map"    &&<div key="map" className="tab-content" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>{(()=>{const ss=_getActiveSeason();return ss?<button onClick={()=>{setTab("profile");}} style={{padding:"8px 16px",background:ss.bg,border:"none",borderBottom:`1px solid ${ss.border}`,display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",flexShrink:0,animation:"seasonBannerPulse 4s ease-in-out infinite"}}><span style={{fontSize:"1rem"}}>{ss.icon}</span><span style={{fontFamily:"'Cinzel',serif",fontSize:".62rem",color:ss.color,letterSpacing:".1em"}}>{ss.name} — Aktív!</span><span style={{fontFamily:"'Cinzel',serif",fontSize:".5rem",color:"var(--gm)",letterSpacing:".06em"}}>Részletek ›</span></button>:null;})()}<AdventureMap user={user} completed={completed} scores={scores} onSelect={setActiveTask} onAddScore={(key,pts)=>{setScores(s=>{const next={...s,[key]:(s[key]||0)+pts};localStorage.setItem("hobbit_task_scores",JSON.stringify(next));const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.score=Object.values(next).reduce((a,b)=>a+b,0);localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});}}/></div>}
          {tab==="games"  &&<div key="games" className="tab-content" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}><MiniGamesTab onAddScore={(key,pts)=>{setScores(s=>{const next={...s,[key]:(s[key]||0)+pts};localStorage.setItem("hobbit_task_scores",JSON.stringify(next));const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.score=Object.values(next).reduce((a,b)=>a+b,0);localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});}}/></div>}
          {tab==="profile"&&<div key="profile" className="tab-content" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}><ProfileTab user={user} completed={completed} scores={scores} onInviteFriend={(friendName)=>{setTab("board");}} onAddScore={(key,pts)=>{setScores(s=>{const next={...s,[key]:(s[key]||0)+pts};localStorage.setItem("hobbit_task_scores",JSON.stringify(next));const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.score=Object.values(next).reduce((a,b)=>a+b,0);localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});}}/></div>}
          {tab==="board"  &&<div key="board" className="tab-content" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}><BoardGameTab user={user} onBack={()=>setTab("map")}/></div>}
        </div>
        </ErrorCatch>

        {/* Bottom tab bar */}
        <nav style={{display:"flex",borderTop:"1px solid rgba(201,168,76,.14)",background:"rgba(8,6,4,.95)",backdropFilter:"blur(10px)",flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>switchTab(t.id)} style={{flex:1,padding:"10px 4px 8px",background:"transparent",border:"none",borderTop:`2px solid ${tab===t.id?"var(--gold)":"transparent"}`,color:tab===t.id?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".07em",cursor:"pointer",transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3,textTransform:"uppercase"}}>
            <span style={{fontSize:"1.2rem",filter:tab===t.id?"none":"grayscale(.5)",transition:"filter .2s"}}>{t.icon}</span>
            {t.label}
          </button>)}
        </nav>
      </div>

      {activeTask&&<TaskModal task={activeTask} user={user} onClose={()=>setActiveTask(null)} onComplete={handleComplete}/>}

      {/* Global game invite popup */}
      {gameInvitePopup&&tab!=="board"&&<div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(4,3,2,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .3s ease both"}}>
        <div style={{width:"100%",maxWidth:380,background:"linear-gradient(170deg,rgba(22,16,7,.99),rgba(8,6,2,.99))",border:"1px solid rgba(122,74,187,.4)",padding:"28px 24px",display:"flex",flexDirection:"column",gap:16,borderRadius:4,boxShadow:"0 0 60px rgba(122,74,187,.15), 0 0 120px rgba(0,0,0,.8)",animation:"modalIn .35s cubic-bezier(.22,1,.36,1) both"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"2.5rem",marginBottom:8,animation:"gentlePop .4s ease both"}}>🎲</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.1rem",color:"var(--gold)"}}>Társas Meghívó!</div>
          </div>
          <div style={{textAlign:"center",padding:"14px",background:"rgba(122,74,187,.06)",border:"1px solid rgba(122,74,187,.2)",borderRadius:3}}>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:"1rem",color:"var(--text)",lineHeight:1.5}}>
              <span style={{fontFamily:"'Cinzel',serif",color:"#B39DDB",fontWeight:600}}>{gameInvitePopup.from}</span> meghívott társasozni!
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",marginTop:6,letterSpacing:".1em"}}>SZOBA: {gameInvitePopup.gameId}</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>declineGameInvite(gameInvitePopup)} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid rgba(229,57,53,.25)",color:"rgba(229,57,53,.7)",fontFamily:"'Cinzel',serif",fontSize:".75rem",cursor:"pointer",borderRadius:3,letterSpacing:".06em"}}>✗ Elutasít</button>
            <button onClick={()=>{sfx.success();acceptGameInvite(gameInvitePopup);}} style={{flex:1,padding:"12px",background:"linear-gradient(135deg,rgba(102,187,106,.12),rgba(102,187,106,.05))",border:"1px solid rgba(102,187,106,.5)",color:"#66BB6A",fontFamily:"'Cinzel',serif",fontSize:".75rem",cursor:"pointer",borderRadius:3,letterSpacing:".06em",boxShadow:"0 0 18px rgba(102,187,106,.12)"}}>✓ Csatlakozás</button>
          </div>
        </div>
      </div>}

      {/* Achievement unlock popup */}
      {achievePopup&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:600,width:"90%",maxWidth:360,animation:"achieveSlideIn .5s cubic-bezier(.22,1,.36,1) both",pointerEvents:"none"}}>
        <div style={{background:"linear-gradient(135deg,rgba(18,14,8,.98),rgba(30,22,10,.98))",border:"1px solid rgba(201,168,76,.5)",borderRadius:6,padding:"16px 20px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 0 40px rgba(201,168,76,.25), 0 8px 32px rgba(0,0,0,.6), inset 0 1px 0 rgba(201,168,76,.15)"}}>
          <div style={{fontSize:"2.2rem",filter:"drop-shadow(0 0 12px rgba(201,168,76,.6))",animation:"achieveIconPop .6s cubic-bezier(.22,1,.36,1) both",flexShrink:0}}>{achievePopup.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"var(--gm)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:2}}>Jelvény feloldva!</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:".95rem",color:"var(--gold)",textShadow:"0 0 12px rgba(201,168,76,.4)"}}>{achievePopup.name}</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"var(--text)",fontStyle:"italic",marginTop:2,opacity:.8}}>{achievePopup.desc}</div>
          </div>
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0,animation:"achieveStar 1s ease-in-out infinite"}}>🏆</div>
        </div>
        <div style={{height:3,marginTop:-1,borderRadius:"0 0 6px 6px",overflow:"hidden",background:"rgba(0,0,0,.3)"}}><div style={{height:"100%",background:"linear-gradient(90deg,var(--gold),#E8C96A)",animation:"achieveTimer 4s linear both"}}/></div>
      </div>}
    </div>
  </>;
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');
:root{--bg:#080604;--gold:#C9A84C;--gm:#7A6030;--gb:#E8C96A;--text:#D4C4A0;--td:#6A5A40;--border:rgba(201,168,76,.18);}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);}
.root{height:100vh;background:radial-gradient(ellipse at 20% 20%,rgba(120,30,30,.06) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(60,35,100,.05) 0%,transparent 55%),var(--bg);font-family:'EB Garamond',serif;color:var(--text);position:relative;overflow:hidden;}
.noise{position:fixed;inset:0;z-index:1;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");opacity:.4;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeSlideOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-8px)}}
@keyframes popIn{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:none}}
@keyframes cardFlip{0%{transform:rotateY(0deg) scale(1)}50%{transform:rotateY(90deg) scale(1.05)}100%{transform:rotateY(0deg) scale(1)}}
@keyframes gentlePop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes achieveSlideIn{from{opacity:0;transform:translateX(-50%) translateY(-30px) scale(.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
@keyframes achieveIconPop{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.3) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
@keyframes achieveStar{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.15);opacity:1}}
@keyframes achieveTimer{from{width:100%}to{width:0%}}
@keyframes seasonIcon{0%,100%{transform:scale(1) rotate(0deg);filter:drop-shadow(0 0 8px currentColor)}50%{transform:scale(1.12) rotate(3deg);filter:drop-shadow(0 0 18px currentColor)}}
@keyframes seasonBannerPulse{0%,100%{opacity:.85}50%{opacity:1}}
@keyframes warTitle{0%,100%{text-shadow:0 0 15px rgba(198,40,40,.4),0 0 30px rgba(198,40,40,.2)}50%{text-shadow:0 0 25px rgba(198,40,40,.7),0 0 50px rgba(198,40,40,.3)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes warUrgent{0%,100%{opacity:1}50%{opacity:.5}}
.tab-content{animation:fadeSlideIn .35s cubic-bezier(.22,1,.36,1) both;}
.card-flip{animation:cardFlip .35s ease both;}
.gentle-pop{animation:gentlePop .3s cubic-bezier(.22,1,.36,1) both;}
@keyframes emFl{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes nodePulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.25}50%{transform:translate(-50%,-50%) scale(1.5);opacity:.08}}
@keyframes runeFlicker{0%,100%{opacity:.5}50%{opacity:.15}}

.btn-start{display:flex;align-items:center;gap:12px;padding:12px 26px;background:linear-gradient(135deg,rgba(201,168,76,.11),rgba(201,168,76,.04));border:1px solid var(--tc,var(--gold));color:var(--gb);font-family:'Cinzel',serif;font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.btn-start:hover{background:rgba(201,168,76,.16);box-shadow:0 0 26px rgba(201,168,76,.18);transform:translateY(-1px);}
.btn-start span{font-family:serif;opacity:.5;animation:runeFlicker 2s ease-in-out infinite;}
.btn-nq{padding:9px 22px;background:linear-gradient(135deg,rgba(201,168,76,.09),rgba(201,168,76,.03));border:1px solid rgba(201,168,76,.38);color:var(--gb);font-family:'Cinzel',serif;font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .18s;}
.btn-nq:hover{background:rgba(201,168,76,.14);transform:translateY(-1px);}
.btn-back-map{padding:9px 20px;background:transparent;border:1px solid rgba(201,168,76,.22);color:var(--td);font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.1em;cursor:pointer;transition:all .18s;}
.btn-back-map:hover{border-color:var(--gold);color:var(--text);}

.quiz-opt{display:flex;align-items:center;gap:9px;padding:10px 12px;background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.12);color:var(--text);font-family:'EB Garamond',serif;font-size:.93rem;cursor:pointer;transition:all .18s;text-align:left;line-height:1.4;}
.quiz-opt:hover{border-color:rgba(201,168,76,.38);background:rgba(201,168,76,.05);}
.opt-l{width:20px;height:20px;border:1px solid rgba(201,168,76,.28);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:.62rem;color:var(--gm);flex-shrink:0;}
.opt-ok{border-color:#66BB6A!important;background:rgba(102,187,106,.08)!important;color:#A5D6A7!important;}
.opt-ok .opt-l{border-color:#66BB6A;color:#66BB6A;}
.opt-err{border-color:#E53935!important;background:rgba(229,57,53,.07)!important;color:#EF9A9A!important;}
.opt-err .opt-l{border-color:#E53935;color:#E53935;}

.tf-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:16px 10px;border:1px solid rgba(201,168,76,.18);background:rgba(255,255,255,.02);color:var(--text);font-family:'Cinzel',serif;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.tf-true:hover{border-color:#66BB6A;background:rgba(102,187,106,.08);color:#A5D6A7;}
.tf-false:hover{border-color:#E53935;background:rgba(229,57,53,.08);color:#EF9A9A;}

.fill-opt{padding:10px 14px;background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.13);color:var(--text);font-family:'EB Garamond',serif;font-size:.93rem;cursor:pointer;transition:all .18s;text-align:center;}
.fill-opt:hover{border-color:rgba(201,168,76,.38);background:rgba(201,168,76,.06);}

.match-char,.match-desc{width:100%;padding:8px 10px;background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.12);color:var(--text);font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:.04em;cursor:pointer;transition:all .18s;text-align:center;line-height:1.4;}
.match-char:hover,.match-desc:hover{border-color:rgba(201,168,76,.35);background:rgba(201,168,76,.05);}
.match-desc{font-family:'EB Garamond',serif;font-size:.82rem;font-style:italic;letter-spacing:0;}
.match-sel{border-color:var(--gold)!important;background:rgba(201,168,76,.1)!important;box-shadow:0 0 12px rgba(201,168,76,.2)!important;}
.match-done{border-color:rgba(102,187,106,.4)!important;background:rgba(102,187,106,.07)!important;color:#A5D6A7!important;cursor:default!important;}
.match-err{border-color:rgba(229,57,53,.5)!important;background:rgba(229,57,53,.07)!important;animation:errShake .35s ease!important;}
@keyframes errShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}60%{transform:translateX(5px)}}

.rune-key{width:33px;height:38px;background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.14);color:var(--text);cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px;}
.rune-key:hover{border-color:var(--gold);background:rgba(201,168,76,.07);transform:translateY(-1px);}

.quote-char{padding:11px 14px;background:rgba(255,255,255,.02);border:1px solid rgba(201,168,76,.13);color:var(--text);font-family:'Cinzel',serif;font-size:.78rem;letter-spacing:.06em;cursor:pointer;transition:all .18s;text-align:center;}
.quote-char:hover{border-color:rgba(201,168,76,.42);background:rgba(201,168,76,.06);transform:translateY(-1px);}

.prophecy-opt{display:flex;align-items:center;padding:12px 16px;background:rgba(122,74,187,.04);border:1px solid rgba(122,74,187,.18);color:var(--text);font-family:'EB Garamond',serif;font-size:.97rem;cursor:pointer;transition:all .2s;text-align:left;line-height:1.5;}
.prophecy-opt:hover{border-color:rgba(122,74,187,.48);background:rgba(122,74,187,.09);transform:translateX(4px);}

@keyframes avatarPulse{0%,100%{box-shadow:0 0 18px var(--rc,rgba(201,168,76,.27))}50%{box-shadow:0 0 30px var(--rc,rgba(201,168,76,.45)),0 0 60px var(--rc,rgba(201,168,76,.15))}}
.avatar-glow{animation:avatarPulse 3s ease-in-out infinite;}
.map-parchment{border-radius:3px;overflow:hidden;}
@keyframes mapSparkle{0%,100%{opacity:.08}50%{opacity:.2}}
@keyframes dragonGlow{0%,100%{opacity:.6}50%{opacity:1}}
.map-sparkle{animation:mapSparkle 2.5s ease-in-out infinite;}
button{transition:all .25s cubic-bezier(.22,1,.36,1);}
.profile-subtab::after{content:'';position:absolute;bottom:0;left:10%;width:0;height:2px;background:var(--gold);transition:width .3s ease;}
.profile-subtab[aria-selected="true"]::after{width:80%;}

@media(prefers-reduced-motion:reduce){
.avatar-glow{animation:none!important;}
.profile-subtab::after{transition:none!important;}
}
`;
