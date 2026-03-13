import { useState, useEffect, useRef, useCallback } from "react";

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
     {s:"Thorin Tölgypajzs Erebor jogos örökös törpe királya volt.",       ok:true,  exp:"Thorin Oakenshield valóban a jogos örökös és király volt — Smaug elűzte, de ez nem változtat ezen."},
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
     {letters:["I","L","F"],           answer:"FILI",  hint:"Thorin fiatalabb unokaöccse"},
     {letters:["I","L","K"],           answer:"KILI",  hint:"Az íjász testvér"},
     {letters:["I","F","G","L","N"],   answer:"GLOIN", hint:"Gimli apja"},
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
     {q:"Hány éve volt Gollamnál a Gyűrű?",opts:["kb. 200","kb. 500","kb. 100","kb. 1000"],ok:1,hint:"Öt évszázad a föld alatt..."},
     {q:"Mit csinál a Gyűrű viselőjével?",opts:["Repülővé teszi","Láthatatlanná teszi","Erőssé teszi","Gazdaggá teszi"],ok:1,hint:"Bilbo is tapasztalta a Zsákhegyi bulira indulva..."},
     {q:"Hol találta Bilbo a Gyűrűt?",opts:["A trolok barlangjában","A goblin alagutakban","A folyóban","Bakacsinerdőben"],ok:1,hint:"Gollam közelében, sötét helyen"},
     {q:"Mi Gollam valódi neve?",opts:["Goblin","Sméagol","Déagol","Mordok"],ok:1,hint:"Hajdanán a Folyósnép tagja volt"},
   ]}},
  {id:14,num:"XIV",type:"scramble",title:"A Törpék Dala",        subtitle:"Rendezd helyre a neveket!",      location:"Zsákos-domb 2.", icon:"🎵",mx:20,my:76,color:"#6050A0",glow:"rgba(96,80,160,0.5)", timeLimit:110,basePoints:130,
   story:"Thorin társai éneke betöltötte Zsákos-dom-bot. De ki volt ki köztük? Fejtsd meg a neveket!",
   raceStory:{hobbit:"Mind a tizenkét törpe eljött az estére. Te emlékszel mindegyikükre?",dwarf:"A saját testvéreid, rokonaid! Ne feledd a nevüket!",elf:"Mi nem kedveltük a törpéket mindig — de nevüket ismerjük.",human:"A törpe nevek idegenek — de a bátorság megismeri az összes szövetségest.",wizard:"Gandalf meghívta mindet. Nekem mind ismerős — de neked?"},
   data:{words:[
     {letters:["F","I","N","U","B"], answer:"BIFUR",  hint:"Az egyik Zs-netes rokon"},
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
const MAP_PATHS=[
  "M 14 54 Q 18 48 22 42","M 22 42 Q 27 35 33 28","M 33 28 Q 43 31 50 20",
  "M 50 20 Q 66 25 66 30","M 66 30 Q 74 26 82 22","M 82 22 Q 85 31 88 40",
  "M 88 40 Q 81 46 74 52","M 74 52 Q 73 58 72 52","M 58 36 Q 65 44 74 52",
  "M 22 42 Q 26 55 30 68","M 30 68 Q 40 72 48 82","M 48 82 Q 55 79 62 76",
  "M 62 76 Q 54 70 50 20","M 14 54 Q 17 65 20 76","M 20 76 Q 34 80 48 82",
];

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

function Feedback({good,text,onNext}){
  return <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:good?"rgba(8,24,8,.96)":"rgba(24,8,8,.96)",zIndex:20,animation:"fadeIn .3s ease",gap:18,padding:24,textAlign:"center"}}>
    <div style={{fontSize:"3.5rem",animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)"}}>{good?"✨":"💀"}</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,4vw,1.7rem)",color:good?"#66BB6A":"#E53935",textShadow:`0 0 24px ${good?"rgba(102,187,106,.5)":"rgba(229,57,53,.5)"}`}}>{good?"Helyes!":"Nem egészen..."}</div>
    <div style={{fontStyle:"italic",color:"var(--td)",fontSize:".94rem",lineHeight:1.7,maxWidth:360}}>{text}</div>
    <button className="btn-nq" onClick={onNext}>Tovább →</button>
  </div>;
}

function TaskResult({task,score,maxScore,onBack}){
  const pct=Math.round((score/maxScore)*100);
  const tier=pct>=80?"🏆 Mester":pct>=60?"⚔️ Hős":pct>=40?"🛡️ Vitéz":"📜 Tanuló";
  const [p,setP]=useState(0);
  useEffect(()=>{const t=[setTimeout(()=>setP(1),200),setTimeout(()=>setP(2),900),setTimeout(()=>setP(3),1600)];return()=>t.forEach(clearTimeout)},[]);
  return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px",textAlign:"center",gap:18}}>
    <div style={{opacity:p>=1?1:0,transition:"all .8s ease",fontSize:"3rem"}}>{task.icon}</div>
    <div style={{opacity:p>=2?1:0,transition:"all .8s ease .2s"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".25em",color:"var(--gm)",textTransform:"uppercase",marginBottom:6}}>— Feladat Befejezve —</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.4rem,5vw,2.3rem)",color:"var(--gold)"}}>{score}<span style={{fontSize:".5em",opacity:.6}}> / {maxScore}</span></div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--gold)",letterSpacing:".1em",marginTop:4}}>{tier}</div>
    </div>
    <div style={{opacity:p>=2?1:0,transition:"all .8s .3s",width:"100%",maxWidth:340}}>
      <div style={{height:7,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden",border:"1px solid rgba(201,168,76,.1)"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--gm),var(--gold))",transition:"width 1s ease .5s",borderRadius:3}}/>
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".63rem",color:"var(--gm)",letterSpacing:".1em",marginTop:5}}>{pct}% pontosság</div>
    </div>
    <div style={{opacity:p>=3?1:0,transition:"all .8s .4s"}}>
      <button className="btn-back-map" onClick={onBack}>← Vissza a Térképre</button>
    </div>
  </div>;
}

function StoryIntro({task,user,onStart}){
  const [p,setP]=useState(0);
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const text=task.raceStory?.[user?.race]||task.story;
  useEffect(()=>{const t=[setTimeout(()=>setP(1),300),setTimeout(()=>setP(2),900)];return()=>t.forEach(clearTimeout)},[]);
  return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 24px",textAlign:"center",gap:20}}>
    <div style={{opacity:p>=1?1:0,transition:"all .8s ease",fontSize:"3.2rem",filter:`drop-shadow(0 0 18px ${task.glow})`}}>{task.icon}</div>
    <div style={{opacity:p>=1?1:0,transition:"all .8s ease .2s"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".28em",color:"var(--gm)",textTransform:"uppercase",marginBottom:7}}>— {task.location} —</div>
      <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,4vw,1.8rem)",color:task.color,textShadow:`0 0 28px ${task.glow}`,marginBottom:3}}>{task.title}</h2>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gm)",letterSpacing:".1em"}}>{task.subtitle}</div>
    </div>
    <div style={{opacity:p>=2?1:0,transition:"all .8s ease .4s",maxWidth:440,fontStyle:"italic",fontSize:"1rem",color:"var(--td)",lineHeight:1.8,padding:"14px 18px",border:"1px solid rgba(201,168,76,.13)",borderLeft:`3px solid ${task.color}`,background:"rgba(0,0,0,.2)",textAlign:"left"}}>
      <span style={{color:race.color,marginRight:8}}>{race.icon}</span>{text}
    </div>
    <div style={{opacity:p>=2?1:0,transition:"all .8s ease .6s",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
      {task.timeLimit>0&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",letterSpacing:".12em"}}>⏳ {task.timeLimit} MÁSODPERC &nbsp;·&nbsp; 🏆 MAX {task.basePoints} PONT</div>}
      {!task.timeLimit&&<div style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",color:"var(--gm)",letterSpacing:".12em"}}>🔮 JÓSLAT-KALAND &nbsp;·&nbsp; 🏆 MAX {task.basePoints} PONT</div>}
      <button className="btn-start" onClick={onStart} style={{"--tc":task.color}}><span>ᚠ</span>Kaland Kezdete<span>ᚠ</span></button>
    </div>
  </div>;
}

// ── TASK TYPES ─────────────────────────────────────────────────────────────────
function QuizTask({task,onDone}){
  const {questions}=task.data;
  const [qi,setQi]=useState(0);const [sel,setSel]=useState(null);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perQ=Math.round(task.basePoints/questions.length);
  const pick=(i)=>{if(sel!==null||fb)return;const q=questions[qi];const good=i===q.ok;setSel(i);if(good)setScore(s=>s+perQ+Math.round(left/task.timeLimit*18));setFb({good,text:good?`Kiváló! ${q.hint||""}`:`Helyes válasz: „${q.opts[q.ok]}". ${q.hint||""}`});};
  const nextQ=()=>{setSel(null);setFb(null);if(qi+1>=questions.length)setDone(true);else setQi(q=>q+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+questions.length*18} onBack={()=>onDone(score)}/>;
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

function TrueFalseTask({task,onDone}){
  const {statements}=task.data;
  const [si,setSi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perS=Math.round(task.basePoints/statements.length);
  const pick=(v)=>{if(fb)return;const s=statements[si];const good=v===s.ok;if(good)setScore(sc=>sc+perS+Math.round(left/task.timeLimit*16));setFb({good,text:good?`Pontosan! ${s.exp}`:`Tévedtél. ${s.exp}`});};
  const next=()=>{setFb(null);if(si+1>=statements.length)setDone(true);else setSi(s=>s+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+statements.length*16} onBack={()=>onDone(score)}/>;
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

function FillBlankTask({task,onDone}){
  const {sentences}=task.data;
  const [si,setSi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perS=Math.round(task.basePoints/sentences.length);
  const pick=(o)=>{if(fb)return;const s=sentences[si];const good=o===s.word;if(good)setScore(sc=>sc+perS+Math.round(left/task.timeLimit*20));setFb({good,text:good?`Pontosan illik a mondatba!`:`A helyes szó: ${s.word}`});};
  const next=()=>{setFb(null);if(si+1>=sentences.length)setDone(true);else setSi(s=>s+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+sentences.length*20} onBack={()=>onDone(score)}/>;
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

function MatchTask({task,onDone}){
  const {pairs}=task.data;
  const [score,setScore]=useState(0);const [done,setDone]=useState(false);
  const [selChar,setSelChar]=useState(null);const [matched,setMatched]=useState([]);const [wrong,setWrong]=useState(null);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const chars=[...pairs].map(p=>p.char).sort(()=>Math.random()-.5);
  const descs=[...pairs].map(p=>p.desc).sort(()=>Math.random()-.5);
  const perP=Math.round(task.basePoints/pairs.length);
  const pickDesc=(desc)=>{
    if(!selChar||matched.find(m=>m.desc===desc))return;
    const pair=pairs.find(p=>p.char===selChar);
    if(pair.desc===desc){setScore(s=>s+perP+Math.round(left/task.timeLimit*15));setMatched(m=>[...m,{char:selChar,desc}]);setSelChar(null);if(matched.length+1>=pairs.length)setTimeout(()=>setDone(true),600);}
    else{setWrong({char:selChar,desc});setTimeout(()=>setWrong(null),700);setSelChar(null);}
  };
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+pairs.length*15} onBack={()=>onDone(score)}/>;
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

function OrderTask({task,onDone}){
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
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+30} onBack={()=>onDone(score)}/>;
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

function RuneTask({task,onDone}){
  const {puzzles}=task.data;
  const [pi,setPi]=useState(0);const [typed,setTyped]=useState([]);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perP=Math.round(task.basePoints/puzzles.length);
  const puzz=puzzles[pi];const encoded=enc(puzz.word);
  const addL=(l)=>{if(fb||typed.length>=puzz.word.length)return;const n=[...typed,l];setTyped(n);if(n.length===puzz.word.length){const good=n.join("")===puzz.word;if(good)setScore(s=>s+perP+Math.round(left/task.timeLimit*28));setFb({good,text:good?`Pontosan! „${puzz.word}" — ${puzz.hint}`:`Helyes szó: „${puzz.word}". ${puzz.hint}`});}};
  const next=()=>{setTyped([]);setFb(null);if(pi+1>=puzzles.length)setDone(true);else setPi(p=>p+1);};
  const alpha="ABCDEFGHIJKLMNOPRSTUVWZ".split("");
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+puzzles.length*28} onBack={()=>onDone(score)}/>;
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

function QuoteTask({task,onDone}){
  const {quotes}=task.data;
  const [qi,setQi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const perQ=Math.round(task.basePoints/quotes.length);
  const pick=(i)=>{if(fb)return;const q=quotes[qi];const good=i===q.ok;if(good)setScore(s=>s+perQ+Math.round(left/task.timeLimit*18));setFb({good,text:good?`Igen! ${q.chars[q.ok]} mondta.`:`Nem — ${q.chars[q.ok]} mondta ezeket.`});};
  const next=()=>{setFb(null);if(qi+1>=quotes.length)setDone(true);else setQi(q=>q+1);};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+quotes.length*18} onBack={()=>onDone(score)}/>;
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

function ScrambleTask({task,onDone}){
  const {words}=task.data;
  const [wi,setWi]=useState(0);const [score,setScore]=useState(0);const [fb,setFb]=useState(null);const [done,setDone]=useState(false);
  const [typed,setTyped]=useState([]);const [avail,setAvail]=useState(()=>[...words[0].letters].map((l,i)=>({l,i,used:false})));
  const {left,pct}=useTimer(task.timeLimit,()=>setDone(true));
  const word=words[wi];const perW=Math.round(task.basePoints/words.length);
  const addL=(idx)=>{if(fb||avail[idx].used)return;const na=avail.map((a,i)=>i===idx?{...a,used:true}:a);const nt=[...typed,{l:avail[idx].l,srcIdx:idx}];setAvail(na);setTyped(nt);if(nt.length===word.answer.length){const good=nt.map(t=>t.l).join("")===word.answer;if(good)setScore(s=>s+perW+Math.round(left/task.timeLimit*22));setFb({good,text:good?`Pontos! „${word.answer}" — ${word.hint}`:`Helyes szó: „${word.answer}". ${word.hint}`});}};
  const rmLast=()=>{if(!typed.length||fb)return;const last=typed[typed.length-1];setAvail(a=>a.map((x,i)=>i===last.srcIdx?{...x,used:false}:x));setTyped(t=>t.slice(0,-1));};
  const next=()=>{setFb(null);if(wi+1>=words.length){setDone(true);return;}const nw=words[wi+1];setWi(w=>w+1);setTyped([]);setAvail([...nw.letters].map((l,i)=>({l,i,used:false})));};
  if(done)return <TaskResult task={task} score={score} maxScore={task.basePoints+words.length*22} onBack={()=>onDone(score)}/>;
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
  const handleDone=(score)=>{onComplete(task.id,score);onClose();};
  const TaskComp={quiz:QuizTask,truefalse:TrueFalseTask,fillblank:FillBlankTask,match:MatchTask,order:OrderTask,rune:RuneTask,quote:QuoteTask,scramble:ScrambleTask,prophecy:ProphecyTask}[task.type];
  return <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:10,background:"rgba(4,3,2,.92)",backdropFilter:"blur(6px)",animation:"fadeIn .3s ease"}}>
    <div style={{width:"100%",maxWidth:570,background:"linear-gradient(162deg,rgba(20,15,11,.99),rgba(8,6,4,.99))",border:"1px solid rgba(201,168,76,.22)",boxShadow:"0 40px 100px rgba(0,0,0,.8)",display:"flex",flexDirection:"column",maxHeight:"92vh",overflow:"hidden",animation:"modalIn .35s cubic-bezier(.22,1,.36,1)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",borderBottom:"1px solid rgba(201,168,76,.1)",background:`linear-gradient(90deg,transparent,${task.glow.replace(".5",".06")},transparent)`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:"1.2rem"}}>{task.icon}</span>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".76rem",color:task.color,letterSpacing:".08em",textTransform:"uppercase"}}>{task.title}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:".56rem",color:"var(--gm)",letterSpacing:".1em"}}>{task.location}</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"1px solid rgba(201,168,76,.14)",color:"var(--gm)",width:30,height:30,cursor:"pointer",fontSize:".95rem"}}>×</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
        {phase==="intro"?<StoryIntro task={task} user={user} onStart={()=>setPhase("task")}/>:TaskComp?<TaskComp task={task} onDone={handleDone}/>:null}
      </div>
    </div>
  </div>;
}

// ── ADVENTURE MAP ──────────────────────────────────────────────────────────────
function AdventureMap({user,completed,scores,onSelect}){
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const [hov,setHov]=useState(null);
  const totalScore=Object.values(scores).reduce((a,b)=>a+b,0);
  return <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 40%,rgba(107,140,62,.04) 0%,transparent 50%),radial-gradient(ellipse at 70% 60%,rgba(160,82,45,.04) 0%,transparent 50%)"}}/>
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:2}} viewBox="0 0 100 100" preserveAspectRatio="none">
      {[10,20,30,40,50,60,70,80,90].map(v=><g key={v}><line x1={v} y1="0" x2={v} y2="100" stroke="rgba(201,168,76,.03)" strokeWidth=".2"/><line x1="0" y1={v} x2="100" y2={v} stroke="rgba(201,168,76,.03)" strokeWidth=".2"/></g>)}
      {MAP_PATHS.map((d,i)=><path key={i} d={d} fill="none" stroke="rgba(201,168,76,.14)" strokeWidth=".5" strokeDasharray="1.5,1.5" vectorEffect="non-scaling-stroke"/>)}
      {[[25,70],[65,55],[80,45],[45,85],[20,35],[88,65],[55,88]].map(([x,y],i)=><g key={i} opacity=".07"><polygon points={`${x},${y-5} ${x-4},${y+3} ${x+4},${y+3}`} fill="rgba(201,168,76,.5)" stroke="rgba(201,168,76,.3)" strokeWidth=".3"/></g>)}
    </svg>
    {TASKS.map((task)=>{
      const isDone=completed.includes(task.id);const isHov=hov===task.id;
      return <div key={task.id} style={{position:"absolute",left:`${task.mx}%`,top:`${task.my}%`,transform:"translate(-50%,-50%)",zIndex:10,cursor:"pointer"}} onMouseEnter={()=>setHov(task.id)} onMouseLeave={()=>setHov(null)} onClick={()=>onSelect(task)}>
        {!isDone&&<div style={{position:"absolute",inset:-10,borderRadius:"50%",border:`1.5px solid ${task.color}`,opacity:.25,animation:"nodePulse 2.5s ease-in-out infinite"}}/>}
        <div style={{position:"relative",width:44,height:44,borderRadius:"50%",border:`2px solid ${isDone?"var(--gold)":isHov?task.color:"rgba(201,168,76,.25)"}`,background:isDone?`radial-gradient(circle,${task.glow},rgba(0,0,0,.8))`:`rgba(8,6,4,.85)`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",transform:isHov?"scale(1.18)":"scale(1)",boxShadow:isDone?`0 0 18px ${task.glow}`:isHov?`0 0 14px ${task.glow}`:"none",backdropFilter:"blur(4px)"}}>
          <span style={{fontSize:"1.1rem"}}>{isDone?"✅":task.icon}</span>
        </div>
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap",fontFamily:"'Cinzel',serif",fontSize:".52rem",letterSpacing:".07em",color:isDone?"var(--gold)":isHov?task.color:"rgba(201,168,76,.4)",textTransform:"uppercase",textAlign:"center",textShadow:"0 0 8px rgba(0,0,0,.9)",pointerEvents:"none"}}>
          {task.location}{isDone&&<div style={{fontSize:".5rem",color:"var(--gold)",opacity:.7}}>{scores[task.id]||0}pt</div>}
        </div>
        <div style={{position:"absolute",top:-7,right:-7,width:16,height:16,borderRadius:"50%",background:"rgba(8,6,4,.9)",border:`1px solid ${task.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:".44rem",color:task.color}}>{task.num}</div>
        {isHov&&<div style={{position:"absolute",bottom:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",background:"rgba(10,8,5,.97)",border:`1px solid ${task.color}`,padding:"9px 13px",minWidth:170,zIndex:20,boxShadow:`0 0 18px ${task.glow}`,animation:"fadeIn .2s ease",pointerEvents:"none"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:task.color,marginBottom:3,letterSpacing:".06em"}}>{task.title}</div>
          <div style={{fontStyle:"italic",fontSize:".74rem",color:"var(--td)",lineHeight:1.4}}>{task.subtitle}</div>
          <div style={{display:"flex",gap:8,marginTop:5}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)"}}>⏳{task.timeLimit||"∞"}s</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gm)"}}>🏆{task.basePoints}pt</span>
            {isDone&&<span style={{fontFamily:"'Cinzel',serif",fontSize:".58rem",color:"var(--gold)"}}>✓Kész</span>}
          </div>
        </div>}
      </div>;
    })}
    <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:5,pointerEvents:"none"}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(.75rem,2.2vw,1.05rem)",color:"rgba(201,168,76,.28)",letterSpacing:".06em"}}>KÖZÉPFÖLDÉ TÉRKÉPE</div>
    </div>
    <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",background:"rgba(8,6,4,.88)",border:"1px solid rgba(201,168,76,.14)",padding:"8px 16px",display:"flex",alignItems:"center",gap:14,backdropFilter:"blur(8px)",zIndex:5,whiteSpace:"nowrap"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".12em",color:"var(--gm)",textTransform:"uppercase"}}>{completed.length}/{TASKS.length} teljesítve</div>
      <div style={{width:100,height:3,background:"rgba(255,255,255,.05)",borderRadius:2}}><div style={{height:"100%",width:`${(completed.length/TASKS.length)*100}%`,background:"linear-gradient(90deg,var(--gm),var(--gold))",borderRadius:2,transition:"width .5s"}}/></div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".6rem",color:"var(--gold)"}}>{totalScore}pt</div>
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
    const newCards=cards.map(c=>c.id===id?{...c,flipped:true}:c);setCards(newCards);
    const newSel=[...sel,id];setSel(newSel);
    if(newSel.length===2){
      setMoves(m=>m+1);setLocked(true);
      const [a,b]=newSel.map(id=>newCards.find(c=>c.id===id));
      if(a.emoji===b.emoji){
        const next=newCards.map(c=>newSel.includes(c.id)?{...c,matched:true}:c);setCards(next);setSel([]);setLocked(false);
        if(next.every(c=>c.matched))setWon(true);
      } else {setTimeout(()=>{setCards(cc=>cc.map(c=>newSel.includes(c.id)?{...c,flipped:false}:c));setSel([]);setLocked(false);},900);}
    }
  };
  const reset=()=>{setCards([...CARD_EMOJIS,...CARD_EMOJIS].sort(()=>Math.random()-.5).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false})));setSel([]);setMoves(0);setLocked(false);setWon(false);};
  return <div style={{padding:"16px 14px",display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>🃏 Tolkien Memória</div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{moves} lépés</span>
        <button onClick={reset} style={{background:"none",border:"1px solid rgba(201,168,76,.2)",color:"var(--gm)",padding:"4px 10px",fontFamily:"'Cinzel',serif",fontSize:".65rem",cursor:"pointer",letterSpacing:".1em"}}>Újra</button>
      </div>
    </div>
    {won&&<div style={{textAlign:"center",padding:"12px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",fontFamily:"'Cinzel',serif",fontSize:".85rem",color:"var(--gold)",animation:"fadeIn .4s ease"}}>✨ Gratulálok! {moves} lépésből megoldottad! ✨</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
      {cards.map(c=><div key={c.id} onClick={()=>flip(c.id)} style={{aspectRatio:"1",border:`1.5px solid ${c.matched?"rgba(102,187,106,.5)":c.flipped?"var(--gold)":"rgba(201,168,76,.18)"}`,background:c.matched?"rgba(102,187,106,.08)":c.flipped?"rgba(201,168,76,.1)":"rgba(255,255,255,.02)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",cursor:c.matched||c.flipped?"default":"pointer",transition:"all .2s",transform:c.flipped||c.matched?"scale(1)":"scale(.97)",boxShadow:c.matched?"0 0 12px rgba(102,187,106,.2)":"none"}}>{c.flipped||c.matched?c.emoji:"🔮"}</div>)}
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
    if(shown.ok){setScore(s=>s+Math.max(0,100-Math.floor(ms/10)));setTimes(t=>[...t,ms]);setWrong(false);}
    else{setScore(s=>Math.max(0,s-50));setWrong(true);}
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
  const [grid]=useState(()=>{
    const g=Array.from({length:SIZE},()=>Array(SIZE).fill(""));
    const alpha="ABCDEFGHIJKLMNOPRSTUVWXYZ";
    words.forEach(w=>{
      let placed=false;let tries=0;
      while(!placed&&tries<100){tries++;
        const horiz=Math.random()>.5;const r=Math.floor(Math.random()*(horiz?SIZE:SIZE-w.length));const c=Math.floor(Math.random()*(horiz?SIZE-w.length:SIZE));
        let ok=true;w.split("").forEach((l,i)=>{const rr=horiz?r:r+i;const cc=horiz?c+i:c;if(g[rr][cc]&&g[rr][cc]!==l)ok=false;});
        if(ok){w.split("").forEach((l,i)=>{const rr=horiz?r:r+i;const cc=horiz?c+i:c;g[rr][cc]=l;});placed=true;}
      }
    });
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!g[r][c])g[r][c]=alpha[Math.floor(Math.random()*alpha.length)];
    return g;
  });
  const [sel,setSel]=useState([]);const [found,setFound]=useState([]);const [start,setStart2]=useState(null);
  const key=(r,c)=>`${r},${c}`;
  const selSet=new Set(sel.map(([r,c])=>key(r,c)));
  const foundSet=new Set(found.flatMap(f=>f));
  const tdown=(r,c)=>setStart2([r,c]);
  const tmove=(r,c)=>{if(!start)return;const dr=c-start[1],dc=r-start[0];const len=Math.max(Math.abs(dr),Math.abs(dc));const cells=[];for(let i=0;i<=len;i++){const rr=start[0]+Math.round(i/len*(dc||0));const cc=start[1]+Math.round(i/len*(dr||0));cells.push([rr,cc]);}setSel(cells);};
  const tup=()=>{
    if(sel.length<2){setSel([]);setStart2(null);return;}
    const w=sel.map(([r,c])=>grid[r][c]).join("");const wr=sel.map(([r,c])=>grid[r][c]).reverse().join("");
    const fw=words.find(fw=>fw===w||fw===wr);
    if(fw&&!found.some(f=>f[0]===key(sel[0][0],sel[0][1]))){setFound(f=>[...f,sel.map(([r,c])=>key(r,c))]);}
    setSel([]);setStart2(null);
  };
  return <div style={{padding:"16px 14px",display:"flex",flexDirection:"column",gap:12,userSelect:"none"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",letterSpacing:".1em",color:"var(--gm)",textTransform:"uppercase"}}>🔍 Tolkien Szókereső</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)"}}>{found.length}/{words.length} megtalálva</div>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
      {words.map(w=><span key={w} style={{fontFamily:"'Cinzel',serif",fontSize:".65rem",padding:"2px 8px",border:"1px solid rgba(201,168,76,.2)",color:found.length>words.indexOf(w)?"rgba(102,187,106,.8)":"var(--gm)",textDecoration:found.length>words.indexOf(w)?"line-through":"none",letterSpacing:".06em"}}>{w}</span>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},1fr)`,gap:2,touchAction:"none"}}
      onMouseLeave={tup}>
      {grid.map((row,r)=>row.map((cell,c)=>{
        const k=key(r,c);const isSel=selSet.has(k);const isFound=foundSet.has(k);
        return <div key={k}
          onMouseDown={()=>tdown(r,c)} onMouseMove={()=>tmove(r,c)} onMouseUp={tup}
          style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:"clamp(.6rem,1.5vw,.8rem)",background:isFound?"rgba(102,187,106,.12)":isSel?"rgba(201,168,76,.2)":"transparent",color:isFound?"#66BB6A":isSel?"var(--gold)":"var(--text)",border:"1px solid rgba(201,168,76,.06)",cursor:"default",transition:"all .1s",fontWeight:isFound||isSel?"700":"400"}}>
          {cell}
        </div>;
      }))}
    </div>
    {found.length===words.length&&<div style={{textAlign:"center",padding:"10px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",fontFamily:"'Cinzel',serif",fontSize:".82rem",color:"var(--gold)",animation:"fadeIn .4s"}}> ✨ Minden szót megtaláltál! ✨</div>}
  </div>;
}

function MiniGamesTab(){
  const [game,setGame]=useState("memory");
  const games=[{id:"memory",label:"Memória",icon:"🃏"},{id:"reaction",label:"Reflexek",icon:"⚡"},{id:"wordsearch",label:"Szókereső",icon:"🔍"}];
  return <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
    <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,.12)",flexShrink:0}}>
      {games.map(g=><button key={g.id} onClick={()=>setGame(g.id)} style={{flex:1,padding:"10px 8px",background:game===g.id?"rgba(201,168,76,.06)":"transparent",border:"none",borderBottom:`2px solid ${game===g.id?"var(--gold)":"transparent"}`,color:game===g.id?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".68rem",letterSpacing:".08em",cursor:"pointer",transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{fontSize:"1.1rem"}}>{g.icon}</span>{g.label}
      </button>)}
    </div>
    <div style={{flex:1,overflowY:"auto"}}>
      {game==="memory"&&<MemoryGame/>}
      {game==="reaction"&&<ReactionGame/>}
      {game==="wordsearch"&&<WordSearch/>}
    </div>
  </div>;
}

// ── PROFILE TAB (placeholder) ──────────────────────────────────────────────────
function ProfileTab(){
  return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,opacity:.4}}>
    <span style={{fontSize:"3rem"}}>👤</span>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".85rem",color:"var(--gm)",letterSpacing:".15em",textTransform:"uppercase"}}>Profil — Hamarosan</div>
  </div>;
}

// ── BOARD GAME TAB ─────────────────────────────────────────────────────────────
function BoardGameTab(){
  return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:24,textAlign:"center"}}>
    <div style={{fontSize:"3.5rem",animation:"emFl 4s ease-in-out infinite"}}>🎲</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.1rem,3.5vw,1.6rem)",color:"var(--gold)",textShadow:"0 0 24px rgba(201,168,76,.35)"}}>Online Társasjáték</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:".78rem",letterSpacing:".2em",color:"var(--gm)",textTransform:"uppercase"}}>— Hamarosan —</div>
    <div style={{fontStyle:"italic",color:"var(--td)",fontSize:".94rem",lineHeight:1.75,maxWidth:380,padding:"14px 18px",border:"1px solid rgba(201,168,76,.12)",background:"rgba(201,168,76,.02)"}}>
      2–4 játékos valós idejű csata Középföldén. Kérdéses párbajok, Középföldé-térkép alapú tábla, chat és hívás. Az erők gyülekeznek...
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
      {["Multiplayer","Valós idejű","Rang rendszer","Chat"].map(t=><span key={t} style={{padding:"3px 10px",border:"1px solid rgba(201,168,76,.18)",color:"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".62rem",letterSpacing:".08em"}}>{t}</span>)}
    </div>
  </div>;
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function HobbitApp(){
  const [user]=useState(()=>JSON.parse(localStorage.getItem("hobbit_current")||"null")||{adventureName:"Bilbo",race:"hobbit"});
  const [completed,setCompleted]=useState(()=>{const u=JSON.parse(localStorage.getItem("hobbit_current")||"{}");return u.completedTasks||[];});
  const [scores,setScores]=useState(()=>JSON.parse(localStorage.getItem("hobbit_task_scores")||"{}"));
  const [activeTask,setActiveTask]=useState(null);
  const [tab,setTab]=useState("map");
  const race=RACES.find(r=>r.id===user?.race)||RACES[3];
  const totalScore=Object.values(scores).reduce((a,b)=>a+b,0);

  const handleComplete=useCallback((taskId,score)=>{
    setCompleted(c=>{const next=c.includes(taskId)?c:[...c,taskId];const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.completedTasks=next;localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});
    setScores(s=>{const next={...s,[taskId]:Math.max(s[taskId]||0,score)};localStorage.setItem("hobbit_task_scores",JSON.stringify(next));const cu=JSON.parse(localStorage.getItem("hobbit_current")||"{}");cu.score=Object.values(next).reduce((a,b)=>a+b,0);localStorage.setItem("hobbit_current",JSON.stringify(cu));return next;});
  },[]);

  const TABS=[{id:"map",icon:"🗺️",label:"Térkép"},{id:"games",icon:"🎮",label:"Minijátékok"},{id:"profile",icon:"👤",label:"Profil"},{id:"board",icon:"🎲",label:"Társasjáték"}];

  return <>
    <style>{CSS}</style>
    <div className="root">
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
            <span style={{fontSize:".95rem"}}>{race.icon}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--text)"}}>{user?.adventureName}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:".7rem",color:"var(--gold)",padding:"2px 8px",border:"1px solid rgba(201,168,76,.26)",background:"rgba(201,168,76,.05)"}}>{totalScore}pt</span>
          </div>
        </header>

        {/* Content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          {tab==="map"    &&<AdventureMap user={user} completed={completed} scores={scores} onSelect={setActiveTask}/>}
          {tab==="games"  &&<MiniGamesTab/>}
          {tab==="profile"&&<ProfileTab/>}
          {tab==="board"  &&<BoardGameTab/>}
        </div>

        {/* Bottom tab bar */}
        <nav style={{display:"flex",borderTop:"1px solid rgba(201,168,76,.14)",background:"rgba(8,6,4,.95)",backdropFilter:"blur(10px)",flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px 8px",background:"transparent",border:"none",borderTop:`2px solid ${tab===t.id?"var(--gold)":"transparent"}`,color:tab===t.id?"var(--gold)":"var(--gm)",fontFamily:"'Cinzel',serif",fontSize:".6rem",letterSpacing:".07em",cursor:"pointer",transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3,textTransform:"uppercase"}}>
            <span style={{fontSize:"1.2rem",filter:tab===t.id?"none":"grayscale(.5)",transition:"filter .2s"}}>{t.icon}</span>
            {t.label}
          </button>)}
        </nav>
      </div>

      {activeTask&&<TaskModal task={activeTask} user={user} onClose={()=>setActiveTask(null)} onComplete={handleComplete}/>}
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
@keyframes popIn{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:none}}
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
`;
