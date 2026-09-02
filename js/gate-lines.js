// ═══════════════════════════════════════════════════════════════════════════
// GATE LINES — every string the welcome screen can show, and nothing else.
// Data only: no DOM, no logic. gate.js rolls these; keeping them apart means
// adding a new roast never means touching a line of behaviour.
//
// Each WELCOME is TWO beats: a setup that sounds almost polite, then the swerve.
// The pause between them is the whole joke, so never merge the two strings.
// ═══════════════════════════════════════════════════════════════════════════

const WELCOME = [
  ["namaste 🙏 welcome to Tahir Bot, we truly value your presence here",
   "...abey nahi bhosdike 😂 ye corporate wala greeting khatam. baith, gaali kha"],
  ["hello and welcome! your experience matters to us 🥰",
   "...bakwas band. tu yahan gaali khane aaya hai chutiye, chal shuru ho ja 💀"],
  ["oye bhadwe, itni der kahan mar gaya tha tu?",
   "chal ab aa hi gaya hai to poori bezzati kara ke ja 😈"],
  ["dear user, thank you for choosing our premium chat experience 🌟",
   "...premium tera baap. get in loser, we are roasting your whole bloodline 💀"],
  ["arre wah, ek aur bekaar aadmi ne mera app khol liya 👏",
   "congratulations bhosdike, teri zindagi ka peak yahi hai 😂"],
  ["welcome. please be respectful in this space, we are a safe community 💞",
   "...jhoot bola maine. yahan tera aura -1000 hoke jaayega madarchod 🔥"],
  ["oh look who it is 👀 the guy with nothing better to do at this hour",
   "baith na chutiye, tera schedule to khali hi hai 😂"],
  ["system booting... loading personality... loading manners...",
   "manners not found ❌ chal theek hai, gaali se hi kaam chala lete hai bhadwe 😈"],
  ["hi bestie!! so happy you're here 🥺💗",
   "...ab asli baat sun madarchod, yahan pyaar nahi milta, sirf gaali milti hai 💀"],
  ["abey madarchod, doorbell bajaya kya tune? seedha ghus aaya",
   "koi baat nahi, ghar bhi tera nahi hai aur izzat bhi nahi 😂"],
  ["warning ⚠️ this bot has no AI, no filter and absolutely no chill",
   "just 2000 lines of pure gaali. still it'll end you, bitch 🔥"],
  ["swagat hai aapka 🪔 aaram se baithiye, chai paani?",
   "...chai tera baap pilayega. yahan sirf gaali serve hoti hai bhosdike ☕💀"],
  ["good evening sir, how may I assist you today?",
   "just kidding. tu jo bhi type karega, mai uska baap ban ke reply dunga chutiye 😈"],
  ["ek baat batau tereko? bilkul sach sach?",
   "tu is app ka sabse bada bakra hai bhadwe, aur tereko pata bhi nahi 😂"],
  ["congratulations! you are our 1,000,000th visitor 🎉 you have won—",
   "—kuch nahi. gaali jeeta hai tu. le, chutiya 💀"],
  ["main aapka digital assistant hoon, aapki seva ke liye hazir 🤖",
   "...seva ki maa ki. baith bhosdike, tera roast ready hai 🔥"],
  ["please read our terms and conditions before proceeding 📄",
   "clause 1: tu chutiya hai. clause 2: koi refund nahi. accept karke aage badh 😂"],
  ["oye, ek min ruk. tereko sach mein gaali khani hai?",
   "sochne ki zaroorat nahi bhadwe, tu already haar chuka hai. chal andar aa 💀"],
  ["welcome to the safest, kindest chatbot on the internet 🕊️",
   "sarcasm tha bhosdike. yahan se koi salaamat nahi nikla aaj tak 😈"],
  ["scanning user... IQ: loading... aura: loading... rizz: loading...",
   "sab zero aaya madarchod 💀 chal ab gaali kha aur zinda reh"],
  ["arre bhai aap? aapka to bahut naam suna hai humne 😌",
   "haan haan, chutiyon ki list mein sabse upar tha tera naam 😂"],
  ["ssshhh 🤫 dhyan se sun, ek secret batata hu tereko",
   "tu real mein ek if-else list se baat karne aaya hai bhadwe. aur haarega bhi 💀"],
  ["thank you for installing! we hope you enjoy your stay 🏨",
   "checkout time: jab tu ro ke bhaag jaayega bhosdike 😂"],
  ["hey there! ready to have some wholesome fun today? 🌈",
   "nahi hai. gaali hai. bohot saari gaali hai chutiye. andar aa 🔥"],
  ["aapka bahut bahut swagat hai is pavitra sthal par 🙏",
   "...pavitra? yahan to gaali ki ganga behti hai bhosdike 💦💀"],
  ["loading your personalised experience... analysing your profile...",
   "profile: chutiya. recommendation: gaali. accuracy: 100% 😂"],
  ["bhai ek help chahiye thi tujhse, kar dega?",
   "app band kar de aur jaake padhai kar madarchod 😂 nahi? theek hai baith phir"],
  ["you have 1 new notification 🔔",
   "\"tu chutiya hai\" — sent 3 seconds ago by Tahir. mark as read? 💀"],
  ["arre sun na, tera naam kya hai? dost banate hai 🤝",
   "...mazaak kar raha tha bhadwe, mereko tera naam yaad bhi nahi rehta 😂"],
  ["establishing secure connection... encrypting your messages...",
   "encryption failed ❌ sab log dekh lenge tu kitna bada chutiya hai 😈"],
  ["kya haal chaal? ghar pe sab theek? khana khaya? 😊",
   "...ab bas. itni izzat kaafi hai. gaali kha ab bhosdike 🔥"],
  ["please rate your experience so far ⭐⭐⭐⭐⭐",
   "5 star? abey tune abhi kuch dekha bhi nahi madarchod, ruk ja 😂"],
  ["dekh bhai, mai tereko ek moka de raha hu. abhi bhaag ja",
   "nahi bhaagega? theek hai, ab mat rona chutiye 💀"],
  ["initialising empathy module... loading emotional intelligence...",
   "module not found ❌ gaali module loaded instead ✅ chal shuru 😈"],
  ["mummy ko bata ke aaya hai na ki tu yahan aa raha hai? 😇",
   "nahi bataya? achha kiya. wo bhi tereko chutiya hi bolti hogi 😂"],
  ["welcome back, valued customer. your loyalty means everything to us",
   "...matlab tu itni baar aaya hai ki tereko koi aur kaam hi nahi hai bhadwe 💀"],
  ["aaj ka rashifal: aapka din shubh rahega ✨",
   "jhoot. aaj tu gaali kha ke jaayega bhosdike, likh ke le le 😈"],
  ["ek shayari sunau tereko? dil se likhi hai 🌹",
   "\"gulab jaisa chehra tera, akal se tu bilkul zero\" — dhanyawaad 😂"],
  ["battery low 🔋 charge laga le pehle",
   "...tera dimaag bol raha hu bhadwe, phone nahi 💀"],
  ["hi! I am an AI assistant trained to be helpful, harmless and honest",
   "teeno mein se ek bhi nahi hu madarchod. baith aur gaali kha 😈"]
];

// poking his face while he orbits. short, no setup, straight bezzati.
const POKES = [
  "abey mat chhu bhosdike 😤", "haath hata madarchod 💀", "tickle kar raha hai chutiye? 😂",
  "stop poking me you weirdo 🤨", "ek aur baar chhua na, gaali double 😈",
  "bhai personal space naam ki cheez hoti hai bhadwe 😐", "kya dekh raha hai? photo khaayega? 📸",
  "tera to dimaag hi kharab hai 😂", "poke poke poke... tu bachpan mein bahut mara gaya hai na 💀",
  "hands off, bitch 🔥", "itna hi shauk hai to chat kar na chutiye, poke kyu 😑",
  "mai 3D mein hoon, tu 0D mein hai bhosdike 😂", "aur ghis, screen phat jaayegi madarchod 💀",
  "bro really out here poking a jpeg 😭 get a life", "ruk ja, ghoom raha hu mai 🌍 dizzy ho jaunga",
  "orbit disturb mat kar bhadwe, NASA ko complaint kar dunga 🚀",
  "chakkar aa gaya mereko teri wajah se chutiye 😵", "har baar wahi harkat 😐 kuch naya kar madarchod"
];

// ── everything else on the screen rerolls too, so no two opens look alike ──
const BADGES = [
  "BAKCHODI ENGINE v2 · NSFW · 0% AI",
  "0 BRAIN CELLS · 100% GAALI · CERTIFIED",
  "WARNING · CONTAINS TERI MAA · 18+",
  "REGEX POWERED · NO AI · NO MERCY",
  "TESTED ON 0 HUMANS · SIDE EFFECT: ROTA HUA",
  "AURA REMOVAL SERVICE · OPEN 24/7",
  "IZZAT KA JANAZA · LIVE NOW",
  "BANNED IN 3 GROUP CHATS · STILL RUNNING",
  "MADE BY YOUR OWN FRIEND · BETRAYAL v1.0",
  "GAALI AS A SERVICE · GaaS · FREE TIER",
  "NO REFUND · NO THERAPY · NO ESCAPE",
  "SPEAKS HINDI · SPEAKS ENGLISH · INSULTS BOTH",
  "OFFLINE FIRST · GAALI ALWAYS",
  "100% ORGANIC BEZZATI · NO PRESERVATIVES"
];
const CTAS = [
  "GAALI KHANE AA JA", "CHAL SHURU HO JA", "MUJHE ROAST KAR", "LET HIM COOK",
  "AA JA BHADWE", "START THE BEZZATI", "IZZAT LUTWANE AA JA", "BRING IT ON CHUTIYE",
  "MAI READY HU", "OPEN THE GATES OF HELL", "TAP KAR AUR PACHTA", "CHAL DEKHTE HAI",
  "MERI BAND BAJA DE", "ENTER AT YOUR OWN RISK"
];
const SOFTS = [
  "nahi bhai, chill mode se shuru karo", "mai delicate hu, gaali mat dena",
  "thoda pyaar se baat kar bhai", "safe mode chahiye mereko",
  "mummy paas mein hai, chill mode on kar", "abhi mood nahi hai, softly bol",
  "gaali off karke shuru kar na", "mai naya hu, dheere dheere",
  "aaj rone ka mood nahi hai, chill kar", "PG-13 wala Tahir de do"
];
const FINES = [
  "headphones on. parents ko mat dikhana. 💀",
  "screenshot le lena, dost ko bhejna hai. 📸",
  "ro mat. warning di thi maine. 😂",
  "kuch bhi ho jaaye, mai zimmedar nahi. 🤝",
  "isko office mein mat kholna bhai. 💀",
  "volume kam rakh, ghar wale sun lenge. 🔇",
  "jo bhi hoga tere upar hoga. all the best. 😈",
  "yaad rakhna: ye sirf regex hai. phir bhi tu haarega. 💀",
  "koi bhi shikayat? apne dost se karna, usi ne banaya. 🤷",
  "iske baad therapy ka number mat maangna. 🧾"
];
const CHIPS = [
  "2000+ roasts", "0 API calls", "100% offline", "no AI, pure regex",
  "1 friend betrayed", "shuffle-bag brain", "hindi + english", "zero chill",
  "runs on spite", "0 feelings spared"
];
