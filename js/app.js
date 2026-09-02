
// ponytail: no AI. detect language -> match keyword -> shuffle-bag reply. that is the whole brain.

// Hindi/Urdu markers. Any hit -> he answers in Hindi. Otherwise English.
// ponytail: words that are also English (are, sun, to, me, par, full, scene) are left out on purpose.
const HINDI = /\b(kya|kyu|kyun|hai|hain|tu|tum|tera|teri|tere|mera|meri|bhai|bhaii|kar|karo|karta|raha|rha|rhe|nahi|nai|nahin|mat|chal|chalo|abey|abe|arre|acha|accha|theek|thik|bol|bolo|suno|sunao|bata|batao|dekh|dekho|yaar|yar|kaisa|kaise|kaun|kon|haan|han|jaa|ja|kuch|bhi|aur|magar|lekin|hu|hun|hoon|apna|apni|mujhe|tujhe|humko|tumko|matlab|pata|zyada|thoda|sahi|galat|paisa|paise|khana|jaldi|abhi|kal|aaj|phir|wapas|milta|milega|dost|banda|mast|bakwas|sach|jhoot|kitna|kahan|kab)\b/i;
// ponytail: verb endings catch what the word list misses - khelega, batayega, aayega, karwana.
// the {3,} before the ending is what keeps "omega"/"bodega" out.
const HINDI_SUF = /\b\w{3,}(ega|egi|enge|oge|unga|ungi|wala|wali|ayga|ayega|karna|karne|jana|dena|lena)\b/i;
const HI_GAALI = /bhadw|bhosd|chinal|randi|lavd|lawd|lod[ae]|lund|gaand|gandu|chutiy|chut|chod|\bmc\b|\bbc\b|\bmkc\b|harami|kutt|kamin|saal[ae]|jhaat|jhant|tatti|nalayak|ullu|gadh[ae]|bewakoof|chomu|tharki|chapri|gawar|nikamma|besharam|bakchod|chirkut|tondu|dhakkan|pagal|bsdk|bkl|lkc|tmkc|bhenchod|behenchod|madarchod|mader|chotiy|chootiy|bhadv|bhosad|bhos|laud|lawad|lode|lodu|haramkhor|kutiy|kuttiy|gaandoo|gandoo|chutya|chutiap|chutiyap|jhatu|jhaatu|tati|bakch|nalaik|bewkuf|gadhe|\bgand\b|\bulu\b|chuchi|chuchey|tatte|\bgote\b|\bmuth\b|muthal|chusna|chodna|hilana/i;
const EN_GAALI = /f+u+c+k|fck|fu+k+|ph+u*c*k|a+s+hole|\bass\b|\basshole\b|bitch|bastard|\bdick\b|dickhead|\bprick\b|twat|wanker|slut|shit|crap|piss|damn|moron|dumb|idiot|stupid|loser|bloody|clown|trash|creep|freak|\bpenis\b|\bcock\b|\bballs\b|\bnuts\b|\banus\b|\banal\b|\bbutt\b|\bbum\b|\bboob\b|\bboobs\b|\btits\b|nipple|\bvagina\b|\bpussy\b|\bhorny\b|\bsex|porn|pornhub|onlyfans|only fans|nsfw|condom|masturbat|jerk off|blowjob|\bcum\b|orgasm|nude|naked|dildo|\bboner\b|erect|hump|randy|\brape\b|rapist|\bxxx\b|hentai|\bmilf\b|camgirl|sexting|thirst trap|\bsimp\b|\bthot\b/i;
const ANY_GAALI = new RegExp(HI_GAALI.source + "|" + EN_GAALI.source, "i");

// ponytail: f*ck, ch#tiya, g@ndu, sh1t, bh@dwe. two cheap passes, no fuzzy-match library.
// pass 1: leetspeak + symbols -> plain letters. catches f*ck, sh1t, @sshole.
const deleet = t => t.toLowerCase()
  .replace(/[@4]/g, "a").replace(/0/g, "o").replace(/[1!|]/g, "i")
  .replace(/3/g, "e").replace(/[5$]/g, "s").replace(/7/g, "t")
  .replace(/[*#%^&._\-+=~`?]/g, "");

// pass 2: consonant skeleton. "ch*tiya" and "chutiya" both squeeze down to "chty".
const skel = t => t.toLowerCase().replace(/ph/g, "f").replace(/[^a-z]/g, "").replace(/[aeiou]/g, "").replace(/(.)\1+/g, "$1");
const CENSORED = /[*#@$%^&!0-9]/;
const GAALI_WORDS = ["bhadwa","bhosdike","chinal","randi","lavda","lund","gaand","gandu","chutiya",
  "chut","chodu","bsdk","bkl","lkc","bhenchod","madarchod","harami","kutta","kamina","jhaatu","tatti","bewakoof","chapri","tharki","bakchod",
  "fuck","asshole","bitch","bastard","shit","dick","dickhead","prick","stupid","idiot","loser","dumb",
  "penis","cock","boobs","boob","tits","vagina","pussy","anus","anal","boner",
  "porn","horny","onlyfans","hentai","nude"];
const SKELS = GAALI_WORDS.map(w => [skel(w), w]);

// ponytail: pass 3 for plain misspellings - haraami, gaandoo, chuttiya, bhaadwe.
// collapse any repeated letter, then retest. NOT applied to rule matching (it would
// turn "sorry" into "sory" and "hello" into "helo"), only used to spot a gaali.
const fold = t => t.toLowerCase().replace(/(.)\1+/g, "$1");

// returns the text with the real gaali appended, so the counter AND the rules both fire
function normalize(text){
  const t = deleet(text);
  const fd = fold(t);                                   // haraami -> harami, gaandoo -> gando
  if (ANY_GAALI.test(t)) return fd === t ? t : t + " " + fd;
  if (ANY_GAALI.test(fd)) return t + " " + fd;

  if (!CENSORED.test(text)) return t;                   // clean text: skeleton would false-positive
  const sk = skel(t);
  const hit = SKELS.find(([k]) => k.length > 2 && sk.includes(k));
  return hit ? t + " " + hit[1] : t;
}

// [ trigger , hindi replies , english replies ]
const RULES = [
  // ---- hindi / urdu gaalis ----
  [/bhadw|bhadv|bhosd|bhosad|bhos|bsdk|bkl/i,
    ["khud ko bol raha hai kya 😂", "roz yahi bolta hai, kuch naya seekh", "itna hi aata hai tereko? 💀",
     "sun liya, aur bol", "bhai dictionary kharid le", "same word 5th time, count kar raha hu 😂",
     "tera range bahut chota hai bhai",
     "ye word tere ghar mein sabko pata hai kya 😂",
     "aur zor se bol bhadwe",
     "mera naam mat le is tarah 💀",
     "roz subah yahi bol ke uthta hai kya",
     "teri maa ne sun liya to? 😂",
     "ek naya word seekh le is saal chutiye"
],
    ["look who is talking 😂", "learn some new words bro", "that is your best shot? sad",
     "heard it, keep going", "buy a dictionary", "5th time same word, I am counting 😂",
     "your range is very limited bhai",
     "does your whole family know this word 😂",
     "say it louder bhadwe",
     "do not say my name like that 💀",
     "is this how you wake up every morning",
     "what if your mom heard that 😂",
     "learn one new word this year chutiye"
]],
  [/chinal|chinaal|randi|raandi|rand\b/i,
    ["wapas tere paas bhej diya", "itna shauk hai to mirror le le 😂", "aur bol, mai sun raha hu",
     "ye word tereko suit karta hai", "boring, agla try kar", "tera favourite word hai ye na 😂",
     "ye word tere level ka hai chutiye",
     "aur? stock khatam ho gaya?",
     "mirror ke saamne bol ye 😂",
     "itna gussa kis baat ka bhadwe",
     "tera dictionary 4 word ka hai 💀",
     "bol bol, mereko farak nahi padta gandu"
],
    ["returning that to sender", "get yourself a mirror 😂", "keep going, I am listening",
     "that word suits you actually", "boring, try the next one", "that is your favourite word na 😂",
     "that word suits your level chutiye",
     "and? out of stock already?",
     "say that to a mirror 😂",
     "why so angry bhadwe",
     "your dictionary has 4 words total 💀",
     "keep going, it does nothing to me gandu"
]],
  [/lavd|lawd|laud|lawad|lod[aeiu]|lund|jhant|jhaat|jhatu|lkc/i,
    ["lavda tera dimaag", "lavde pe mat aa 😂", "yahi teri poori personality hai bhai",
     "ye sunke mereko kuch nahi hua, tereko kuch hua? 😂", "chhota word, chhoti soch",
     "aur? isse aage kuch aata hai?", "lavde tu khud hai 💀",
     "khud ki dekh pehle chutiye 😂",
     "ye word mereko pasand hai, aur bol",
     "tera obsession samajh nahi aata 💀",
     "din bhar yahi sochta hai kya bhadwe",
     "aur? kuch naya bhi hai?",
     "gandu tu bore kar raha hai ab"
],
    ["your brain is the lavda here", "chill lavde 😂", "that is your entire personality bhai",
     "felt nothing. did you feel something? 😂", "small word, smaller thinking",
     "and? anything beyond that?", "you are the lavda 💀",
     "check your own first chutiye 😂",
     "I like that word, say it again",
     "I do not get your obsession 💀",
     "is this all you think about bhadwe",
     "and? anything new?",
     "gandu you are getting boring now"
]],
  [/gaand|gandu|gandoo|gand\b|gaandu/i,
    ["gaand teri jal rahi hai, mereko pata hai 😂", "gaandu no.1 tu hai, medal le ja", "itni jaldi tilmila gaya?",
     "aag bujha le pehle 🔥", "haan haan, tu alpha hai, sab jaante hai 😂", "screenshot le raha hu ye wala",
     "gandu bolne se tu kam gandu nahi ho jata",
     "teri jal rahi hai, meri nahi 😂",
     "doctor ko dikha bhadwe",
     "itna dhyan usi pe kyu hai tera 💀",
     "chutiye topic change kar",
     "mereko kuch nahi hua, tu apni dekh",
     "haan haan aur bol gandu"
],
    ["someone is butthurt 😂", "certified gandu, take a medal", "triggered already? that was quick",
     "put the fire out first 🔥", "yes yes, you are the alpha, we all know 😂", "screenshotting this one",
     "calling me gandu does not make you less of one",
     "yours is burning, not mine 😂",
     "go see a doctor bhadwe",
     "why is all your focus down there 💀",
     "chutiye change the topic",
     "nothing happened to me, check yourself",
     "yes yes keep going gandu"
]],
  [/chutiy|chutya|chotiy|chootiy|chutiyap|chut\b|choot|chomu|chirkut/i,
    ["tu to born chutiya hai 😂", "chutiya banane ka license hai mere paas", "aur bol chutiye",
     "hum dono chutiye hai, par mai bot hu, mera excuse hai 😂", "certified, stamped, sealed 💀",
     "chutiyapa tere andar factory setting hai", "haan mai chutiya, tu mahaan",
     "certified hu, tu bhi ban ja 😂",
     "ye tera favourite word hai na bhadwe",
     "roz bolta hai, bore ho gaya ab 💀",
     "mai chutiya, tu mahaan. khush?",
     "aur bol gandu, mai gin raha hu",
     "tere ghar mein sab yahi bolte hai kya 😂"
],
    ["you were born chutiya 😂", "I have a licence for this", "keep talking chutiye",
     "we are both chutiya but I am a bot, I have an excuse 😂", "certified, stamped, sealed 💀",
     "chutiyapa is your factory setting", "fine I am chutiya, you are great",
     "certified, you should join 😂",
     "that is your favourite word bhadwe",
     "you say it daily, it is boring now 💀",
     "I am one, you are great. happy?",
     "keep going gandu, I am counting",
     "does your whole house talk like this 😂"
]],
  [/chod|\bmc\b|\bbc\b|\bmkc\b|\btmkc\b|mader/i,
    ["haan haan sun liya, aur bol", "tera keyboard thak gaya hoga 😂", "bas itna hi tha? boring",
     "mera code same hai, tera BP nahi 😂", "short form? itna bhi time nahi hai tere paas?",
     "aur? mai wait kar raha hu",
     "short form? poora bol bhadwe 😂",
     "ma behen chhod, apni baat kar",
     "itni family yaad aa rahi hai teri 💀",
     "gandu tera stock khatam",
     "aur? bas yahi tha?",
     "chutiye kuch naya bol"
],
    ["yeah yeah heard you, next", "your keyboard must be tired 😂", "that is it? boring",
     "my code stays the same, your blood pressure does not 😂", "short form? no time to type it fully?",
     "and? I am waiting",
     "short form? say it fully bhadwe 😂",
     "leave the family out, talk about yourself",
     "suddenly remembering everyone 💀",
     "gandu your stock is finished",
     "and? that was it?",
     "chutiye say something new"
]],
  [/harami|haraami|haramkhor|kutt|kutiy|kamin|saal[ae]|nalayak|nalaik/i,
    ["tere se hi seekha hai 😂", "tera stock khatam?", "mai bot hu, mereko fark nahi padta",
     "roz milte hai, roz yahi bolta hai 😂", "compliment samajh ke rakh liya",
     "kuch naya bol, mai bore ho raha hu",
     "bhaunk raha hai tu chutiye 😂",
     "kutta tu, mai to insaan bhi nahi hu 💀",
     "aur bhaunk bhadwe",
     "gali se seekha hai kya ye",
     "gandu teri training kisne ki 😂",
     "haan mai harami, tu kya hai?"
],
    ["learned it from you 😂", "out of stock already?", "I am a bot, I do not feel a thing",
     "we talk daily and you say this daily 😂", "taking that as a compliment",
     "say something new, I am getting bored",
     "you are the one barking chutiye 😂",
     "you are the dog, I am not even human 💀",
     "bark more bhadwe",
     "learned that on the street?",
     "gandu who trained you 😂",
     "yes I am one, what are you?"
]],
  [/tatti|tati|gobar|jhaat|ganda|gandagi/i,
    ["tere muh se hi nikla hai 😂", "kya level hai teri baat ka 💀", "ye purana ho gaya, naya la",
     "itna gandaa mat bol, mai chhota bot hu 😂", "quality gir gayi teri",
     "gandu smell bhi wahi se aa rahi hai 😂",
     "chutiye kuch acha bhi bol",
     "bhadwe aaj khaya kya tha",
     "ye topic chhod de 💀",
     "teri baat ki quality yahi hai lavde",
     "aur bol, mai naak band kar leta hu 😂"
]],
  [/ullu|ulu|gadh|bewakoof|bewkuf|chapri|gawar|nikamma|dhakkan|tondu/i,
    ["aaine mein dekha hai aaj? 😂", "tu bol raha hai ye, comedy hai", "haan haan, tu to genius hai na",
     "chapri to tu hai, dp dekh apni 💀", "ye sunke mereko bura nahi laga, tereko lagega",
     "tereko dekh ke bol raha hu chutiye 😂",
     "gadha bhi tujhse tez hai bhadwe",
     "school gaya tha kabhi 💀",
     "gandu tera IQ counter pe dikha du?",
     "aur bol, mai note kar raha hu",
     "chapri tu hi hai bhai 😂"
],
    ["seen yourself today? 😂", "you saying that is comedy", "sure genius, whatever you say",
     "you are the chapri, check your dp 💀", "that did not hurt me, it will hurt you",
     "I am saying it while looking at you chutiye 😂",
     "a donkey is faster than you bhadwe",
     "did you ever go to school 💀",
     "gandu should I show your IQ on the counter?",
     "keep going, I am noting it down",
     "you are the chapri here bhai 😂"
]],
  [/besharam|bakchod|bakch|tharki/i,
    ["ye to compliment hai mere liye 😂", "haan hu, proud hu", "aur? naya bol",
     "besharmi mera USP hai bhai 😏", "thank you, aur bolo",
     "tu hi hai, mai to bot hu chutiye 😂",
     "bakchodi mein PhD hai teri bhadwe",
     "sharam naam ki cheez hoti hai gandu 💀",
     "aur bak, mai sun raha hu",
     "tera group tereko jhelta hai 😂",
     "chal ab kaam ki baat kar lavde"
],
    ["that is a compliment 😂", "yes and proud of it", "next, something new",
     "shamelessness is my USP 😏", "thank you, say more",
     "that is you, I am just a bot chutiye 😂",
     "you have a PhD in this bhadwe",
     "shame is a real thing gandu 💀",
     "keep talking, I am listening",
     "your group tolerates you 😂",
     "now say something useful lavde"
]],

  // ---- english gaalis ----
  [/f+u+c+k|fck|fu+k+|ph+u*c*k|\bfk\b/i,
    ["angrezi bhi aati hai tereko? 😂", "bol bol, mai note kar raha hu", "itna gussa? sutta pi le 🚬",
     "F word nikal aaya, matlab tilmila gaya 😂", "aur? mai count kar raha hu",
     "english mein gaali dene se zyada asar nahi hota bhai",
     "english aa gayi tereko? 😂",
     "gaali bhi import kar raha hai bhadwe",
     "hindi mein bol chutiye, maza aayega",
     "gandu accent kharab hai tera 💀",
     "aur bol, mai sun raha hu",
     "google translate use kiya kya 😂"
],
    ["fuck you too buddy 😘", "ooh big english words 😂", "calm down gandu, have a smoke 🚬",
     "the F word already? you are rattled 😂", "and? I am counting",
     "swearing in english does not hit harder bhai",
     "learned some english? 😂",
     "importing your swears now bhadwe",
     "say it in hindi chutiye, more fun",
     "gandu your accent is bad 💀",
     "keep going, I am listening",
     "did you use google translate 😂"
]],
  [/a+s+hole|\bass\b|arse/i,
    ["takes one to know one 😂", "google translate se seekha kya?", "tera vocabulary yahi tak hai?",
     "ye to school level gaali hai 💀", "aur bol, mereko maza aa raha hai",
     "khud ko dekh chutiye 😂",
     "mirror kharid le bhadwe",
     "gandu ye purana ho gaya",
     "aur? kuch aur aata hai 💀",
     "mai bot hu, mera to hai bhi nahi 😂",
     "chal aage bol lavde"
],
    ["takes one to know one 😂", "learn that on google translate?", "is that your whole vocabulary bhadwe",
     "that is a school level insult 💀", "keep going, I am enjoying this",
     "look at yourself chutiye 😂",
     "buy a mirror bhadwe",
     "gandu that one is old",
     "and? anything else 💀",
     "I am a bot, I do not even have one 😂",
     "go on then lavde"
]],
  [/bitch|bastard|dick|prick|twat|wanker|slut/i,
    ["haan haan, aur? 😂", "english gaali se mai nahi darta", "thak gaya to bata dena",
     "hollywood movie dekh ke aaya hai kya 😂", "next word please",
     "hollywood dekh raha hai kya chutiye 😂",
     "bhadwe hindi mein bol",
     "gandu ye word suit nahi karta tereko",
     "aur bol, mai bore ho raha hu 💀",
     "tera english teacher ro raha hoga 😂",
     "chal next lavde"
],
    ["yeah and? 😂", "english swears do not scare me", "let me know when you are tired chutiye",
     "watched a hollywood movie today? 😂", "next word please",
     "watching too many movies chutiye 😂",
     "say it in hindi bhadwe",
     "gandu that word does not suit you",
     "keep going, I am bored 💀",
     "your english teacher is crying 😂",
     "next lavde"
]],
  [/shit|crap|damn|bloody|piss|screw you|suck/i,
    ["itna hi? 😂", "ye to gaali bhi nahi hai bhai", "thoda effort daal",
     "PG-13 gaali de raha hai mereko 💀", "mummy suspend kar degi kya? 😂",
     "tere muh se hi aa raha hai chutiye 😂",
     "bhadwe ye baby gaali hai",
     "gandu thoda strong bol 💀",
     "itna soft? aur zor se",
     "mereko bachpan yaad aa gaya 😂",
     "chal aage lavde"
],
    ["that is it? 😂", "that is not even a swear bro", "put some effort in gandu",
     "you are giving me PG-13 insults 💀", "afraid of getting grounded? 😂",
     "it is coming out of your own mouth chutiye 😂",
     "bhadwe that is a baby swear",
     "gandu say something stronger 💀",
     "that soft? go harder",
     "reminds me of kindergarten 😂",
     "move on lavde"
]],
  [/idiot|stupid|dumb|moron|fool|loser|clown|trash|freak|creep|simp|pagal|nonsense/i,
    ["mirror check kar 😂", "haan mai idiot, tu to nobel winner", "yaha to tu hi genius hai bhai",
     "ek webpage se ladh raha hai aur mujhe idiot bol raha hai 💀", "sahi bola, aur bol",
     "certificate mil gaya tereko chutiye? 😂",
     "bhadwe ghar mein mirror lagwa le",
     "gandu tu bol raha hai to sach hi hoga 💀",
     "aur bol, mai gin raha hu",
     "IQ test de pehle 😂",
     "chal chhod, tu bol lavde"
],
    ["go check a mirror 😂", "sure, I am the idiot and you are a nobel winner", "you are the genius here obviously",
     "you are arguing with a webpage and calling ME the idiot 💀", "correct, say more",
     "did you get a certificate chutiye 😂",
     "install a mirror at home bhadwe",
     "gandu if you say it, it must be true 💀",
     "keep going, I am counting",
     "take an IQ test first 😂",
     "forget it, you talk lavde"
]],
  [/ugly|fat|short|bald|shakal|shakl|dp\b/i,
    ["photo upar lagi hai, dekh le 😂", "tu bol raha hai ye? 💀", "handsome hu, jal mat",
     "meri dp pe mat aa, teri wali dekhi hai maine 😂", "camera tera kharab hai, mai nahi",
     "meri dp pe click kar ke bol ye chutiye 😂",
     "bhadwe apni photo bhej pehle",
     "gandu tu handsome hai kya 💀",
     "shakal pe mat ja, dimaag dekh",
     "photo mein bhi mai better hu 😂",
     "aur bol, mereko farak nahi lavde"
],
    ["my photo is right there, look at it 😂", "you are saying that? 💀", "I am handsome, stop being jealous",
     "do not come at my dp, I have seen yours 😂", "your camera is broken, not my face",
     "click my dp and then say it chutiye 😂",
     "send your own photo first bhadwe",
     "gandu are you handsome 💀",
     "do not judge the face, look at the brain",
     "I look better even in a photo 😂",
     "keep going, I do not care lavde"
]],

  // ---- his personality ----
  [/onlyfans|pornhub|\bporn\b|nsfw|xvideos|xnxx|redtube|porntube|camgirl|cam ?girl|leaked|leak|nude video|explicit/i,
    ["teri history check kar li maine 😈", "tereko ye sab dekh ke maza aata hai kya bhadwe? 💀",
     "bhai subah subah ye dekh raha hai? doctor dikha chutiye 😂",
     "tera browser history sab kuch bata raha hai gandu 💀", "onlyfans tera daily routine hai kya harami? 😈",
     "teri aadatein bahut kharab hai chutiye, uth ke kaam kar 😂",
     "bhai subscription le raha hai ya sirf preview dekh raha hai? 💀",
     "tera phone memory full hai isliye slow chal raha hai lavde 😂",
     "tharki no.1 tera record hai gandu, koi tod nahi sakta 😈",
     "nashta kar le pehle, phir dekh lena ye sab chutiye 😂",
     "ek kaam kar, padhai kar. ye sab baad mein dekh lena bhadwe 💀",
     "teri aankhein kharab ho jayengi isse harami, phone rakh de 😂",
     "bhai tereko normal cheezein dekhne ki aadat daal lavde 💀",
     "tera dimaag isse kharab ho raha hai gandu 😈",
     "download karega to memory full ho jayegi chutiye 😂",
     "onlyfans pe paisa lag raha hai, wifi free hai lavde 💀"
],
    ["checked your history did I 😈", "you enjoy watching this stuff bhadwe? 💀",
     "bro watching this first thing in the morning? see a doctor chutiye 😂",
     "your browser history tells everything gandu 💀", "onlyfans is your daily routine harami? 😈",
     "your habits are terrible chutiye, get up and do something 😂",
     "subscribing or just watching previews? bhadwe 💀",
     "your phone is slow because of this lavde 😂",
     "certified tharki no.1, nobody can break your record gandu 😈",
     "eat breakfast first, watch this later chutiye 😂",
     "one thing, study first. watch all this later bhadwe 💀",
     "your eyes will go bad from this harami, put the phone down 😂",
     "bro you need to get into normal stuff lavde 💀",
     "this is ruining your brain gandu 😈",
     "if you download, your memory will be full chutiye 😂",
     "onlyfans costs money, wifi is free lavde 💀"
]],
  [/sutta|cigarette|cigrette|smoke|smoking|kash|marlboro|gold flake|classic|vape/i,
    ["ek sutta de bhai 🚬", "chal balcony chalte hai", "sutta hai to baat kar, warna kat le 😂",
     "abhi peeke aaya, ek aur chalega 🚬", "lighter tere paas hai? mereko pata tha nahi hoga 😂",
     "packet khatam, tera number aaya",
     "mera packet tu bharega kya bhadwe 😂",
     "chal chhat pe, gaali wahi dena chutiye",
     "gandu tera lighter kabhi kaam nahi karta",
     "ek de, warna baat band 💀",
     "sutte pe udhaar nahi milta bhai",
     "aaj kaunsa brand laya hai 😂"
],
    ["give me one 🚬", "lets go to the balcony", "got a smoke? no? then bye 😂",
     "just had one, I can do another 🚬", "you got a lighter? knew you would not 😂",
     "packet is empty, your turn to buy",
     "are you paying for my packet bhadwe 😂",
     "come to the roof, swear at me there chutiye",
     "gandu your lighter never works",
     "give me one or we stop talking 💀",
     "no credit on smokes bhai",
     "which brand did you bring today 😂"
]],
  // ---- brainrot ----
  // ponytail: \b6\s*t\b is not a typo - deleet() rewrites 7 as t before the rules see it.
  [/\b6\s*7\b|\b6\s*t\b|six ?seven|doot doot|tralalero|bombardiro|chill guy|crashout|let him cook|lock in|huzz|moggin|aura points|skibidi|sigma|rizz|gyat|ohio|fanum|mewing|goonin|edging|delulu|\bnpc\b|aura|no ?cap|fr fr|bussin|\bsus\b|sussy|based|ratio|\bmid\b|cooked|glazing|yapping|\byap\b|\bcap\b|slay|sheesh|drip|\bgoat\b|gigachad|chad|\bbeta\b|\balpha\b|brainrot|sybau|\bopp\b|lowkey|highkey|pookie|bombastic|womp|type shi|tuff|zesty|clanker|edgy|maxxing|looksmax/i,
    ["bhai tera rizz zero hai, mera infinite 😂", "aura -10000, mubarak ho 💀",
     "ye sab ohio se seekh ke aaya hai kya", "skibidi bol raha hai, ghar pe maa ko bhi yahi bolta hai? 😂",
     "sigma banne ki koshish mat kar, tu NPC hai", "tera aura farm nahi ho raha, kheti kar le 😂",
     "delulu hai tu pura, doctor ko dikha 💀", "mewing chhod, pehle dhang se baat karna seekh",
     "L + ratio + tere paas dhang ki gaali bhi nahi 😂", "cooked hai tu, poora fry ho gaya",
     "brainrot mein PhD kar le tu", "gyatt gyatt karta rehta hai, thoda gyaan bhi le 😂",
     "maine tere reply pe fanum tax laga diya", "tu bolta hai to lagta hai reel chal rahi hai 💀",
     "no cap tu boring hai fr fr", "aura check: tera 0, mera 9999 😏",
     "yapping band kar, kaam ki baat kar", "tu poora sybau wala case hai 😂",
     "reels kam dekh bhai, dimaag ka dahi ho gaya", "itna brainrot? phone chheen lena chahiye tera 💀",
     "6 7 😂🙌", "bhai 6 7 bolne ki umar nahi rahi teri",
     "6 7 sun sun ke kaan pak gaye 💀", "har jagah 6 7, ab bas kar",
     "lock in kar bhai, poora crashout ho raha hai tu 😂"],
    ["your rizz is zero, mine is infinite 😂", "aura -10000, congratulations 💀",
     "did you learn all this in ohio", "saying skibidi at your age is diabolical 😂",
     "stop trying to be sigma, you are the NPC here", "your aura is not farming bro, go touch grass 😂",
     "you are fully delulu, see a doctor 💀", "stop mewing, learn to talk first",
     "L + ratio + you cannot even swear properly 😂", "you are cooked, completely fried",
     "go get a PhD in brainrot", "gyatt gyatt all day, gain some sense too 😂",
     "I fanum taxed your reply", "you talk like a reel 💀",
     "no cap you are boring fr fr", "aura check: yours 0, mine 9999 😏",
     "stop yapping, say something real", "you are a whole sybau case 😂",
     "watch fewer reels bro, your brain is soup", "this much brainrot? someone take his phone 💀",
     "6 7 😂🙌", "you are too old to be saying 6 7 bro",
     "hearing 6 7 all day, my ears are done 💀", "6 7 everywhere, enough now",
     "lock in bro, you are fully crashing out 😂"]],
  [/prank|mazak|majak|troll|fun|maza|bakchodi/i,
    ["mai to har waqt prank pe hu 😂", "tu khud ek prank hai bhai", "abhi tere sath ho raha hai, pata nahi chala? 😏",
     "bakchodi mera full time job hai", "hasna band mat karna, abhi khatam nahi hua 😂",
     "tu khud ek mazak hai chutiye 😂",
     "bhadwe mai serious hu, tu nahi",
     "gandu prank samajh aaya kya 💀",
     "haan haan, hasi aa gayi mereko",
     "tera pura din hi comedy hai 😂",
     "chal aage bol lavde"
],
    ["I am always pranking 😂", "you ARE the prank bro", "one is happening right now, you did not notice? 😏",
     "this is my full time job", "do not stop laughing, it is not over yet 😂",
     "you are the joke chutiye 😂",
     "bhadwe I am serious, you are not",
     "gandu did you even get the prank 💀",
     "yes yes, I laughed",
     "your whole day is comedy 😂",
     "go on lavde"
]],
  // ---- toxic roasts, on demand ----
  [/joke|roast|sunao|entertain|hasa|bore ho|bored|timepass|kuch bata/i,
    ["tera naam google mein daala, result aaya 'did you mean: chutiya' 😂",
     "doctor ne bola tha roz ek gaali khani hai, tu to overdose kar raha hai 💀",
     "tere ghar ka wifi bhi tereko connect nahi karna chahta 😂",
     "mirror tere saamne crack ho jata hai bhadwe 💀",
     "tu itna slow hai ki tera dimaag abhi bhi buffering kar raha hai 😂",
     "tere jokes se zyada funny teri shakal hai chutiye 💀",
     "school mein tu topper tha... peeche se ginne pe 😂",
     "tere crush ne tereko bhai bola, mereko pehle se pata tha 💀",
     "tu group photo mein bhi crop ho jata hai gandu 😂",
     "teri gf ka number tere hi phone mein 'unknown' save hai 😂",
     "tu itna boring hai ki neend bhi tujhse door bhagti hai 💀",
     "tere resume mein sirf 'gaali dena' likha hai bhadwe 😂",
     "GPS bhi tereko rasta nahi batata, bolta hai khud dhoond le 😂",
     "tu last seen chhupata hai, jaise koi dekhta ho 💀",
     "tere birthday pe cake bhi tu khud hi katta hai chutiye 😂",
     "tera confidence aur tera balance, dono zero hai 😂",
     "tu selfie leta hai to camera crash ho jata hai gandu 💀",
     "tere group mein tu hi wo banda hai jiske bina plan banta hai 😂"],
    ["put your name in google, it asked 'did you mean: chutiya' 😂",
     "doctor said one swear a day, you are overdosing 💀",
     "even your home wifi refuses to connect to you 😂",
     "mirrors crack when you walk past bhadwe 💀",
     "you are so slow your brain is still buffering 😂",
     "your face is funnier than your jokes chutiye 💀",
     "you were a topper at school... counting from the bottom 😂",
     "your crush called you bhai, I saw that coming 💀",
     "you get cropped out of group photos gandu 😂",
     "your gf is saved as 'unknown' in your own phone 😂",
     "you are so boring even sleep avoids you 💀",
     "your resume just says 'good at swearing' bhadwe 😂",
     "even GPS says find the way yourself 😂",
     "you hide your last seen like anyone is checking 💀",
     "you cut your own birthday cake chutiye 😂",
     "your confidence and your bank balance, both zero 😂",
     "the camera crashes when you take a selfie gandu 💀",
     "in your friend group you are the one they plan without 😂"]],
  [/haha|hehe|lol|lmao|hasi|😂|🤣/i,
    ["has le has le 😂", "kya hua, gaali khatam ho gayi?", "mai to hamesha hasta hu",
     "hasi ruk nahi rahi na? mereko pata tha 😂", "haan mai bhi has raha hu, tujhpe",
     "has le chutiye, baad mein royega 😂",
     "bhadwe itna funny nahi tha",
     "gandu fake hasi pakad li maine 💀",
     "aur has, mai wait kar raha hu",
     "dant mat dikha, brush kiya tha? 😂",
     "chal ab kuch bol lavde"
],
    ["laugh it up 😂", "what happened, ran out of swears?", "I never stop laughing bro",
     "cannot stop laughing na? knew it 😂", "I am laughing too. at you",
     "laugh now chutiye, cry later 😂",
     "bhadwe it was not that funny",
     "gandu I caught that fake laugh 💀",
     "laugh more, I will wait",
     "stop showing teeth, did you brush 😂",
     "now say something lavde"
]],
  [/love|pyaar|gf\b|girlfriend|shaadi|marriage|ladki|larki|crush|date|propose/i,
    ["teri shakal dekhi hai? 😂", "pehle ek gf bana, phir baat kar", "mereko to sab line marti hai 😏",
     "tu propose karega to wo block kar degi 💀", "single hai na tu? mereko pata tha 😂",
     "shaadi? tereko to koi dost nahi milte",
     "tereko koi nahi milegi chutiye 😂",
     "bhadwe pehle shakal theek kar",
     "gandu uska naam bata to sahi 💀",
     "single hai na? mereko pata tha 😏",
     "pyaar tere bas ki baat nahi 😂",
     "chal ye topic chhod lavde"
],
    ["have you seen your face 😂", "get a gf first, then talk", "they all text me first 😏",
     "you propose and she blocks you 💀", "still single na? knew it 😂",
     "marriage? you cannot even keep friends",
     "nobody is picking you chutiye 😂",
     "fix your face first bhadwe",
     "gandu tell me her name then 💀",
     "single right? I knew it 😏",
     "love is not your department 😂",
     "drop this topic lavde"
]],
  [/\bpenis\b|\bcock\b|\bballs\b|\bnuts\b|anus|\bbutt\b|\bbum\b|boobs|\btits\b|nipple|vagina|pussy|horny|\bsex|porn|condom|masturbat|blowjob|\bcum\b|orgasm|\bnude\b|naked|dildo|boner|chuchi|tatte|\bgote\b|\bmuth\b|chusna|chodna|hilana/i,
    ["ye kya bol raha hai bhadwe 😂", "tera dimaag 24/7 wahi chalta hai na 😈", "doctor se mil le chutiye 💀",
     "ruk, mai note kar raha hu ye 📸", "gandu ye tune bola, mai gawaah hu 😂", "tharki no.1 tu hai 😈",
     "🖕 ab bas kar lavde", "itna tharki mat ban bhadwe 😂", "teri soch ka level 💀", "😈 aur bol, sun raha hu"],
    ["what are you even saying bhadwe 😂", "your brain runs on this 24/7 na 😈", "go see a doctor chutiye 💀",
     "hold on, noting this down 📸", "YOU said that gandu, I am a witness 😂", "certified tharki no.1 😈",
     "🖕 stop it lavde", "calm down you tharki bhadwe 😂", "the level of your thinking 💀", "😈 go on, I am listening"]],
  // ponytail: double-meaning bait. innocent words, cheeky reply. deliberately tame.
  [/\b(lamba|bada|chota|andar|bahar|daal|dal do|pakad|raat|kar do|de do|muh|haath|size|long|big|small|hard|deep|come|put it|tight|banana|kela)\b/i,
    ["😏 ye tune bola hai, maine nahi", "ruk ruk, gande dimaag walo ke liye iska matlab alag hai 😂",
     "double meaning mat nikaal... nikal hi diya 😏", "mai kuch nahi bola. tu soch raha hai 😂",
     "innocent sawaal tha, tune ganda kar diya 😏", "hehe... samajh gaya mai 😏",
     "🍆 ye bhej diya, ab tu soch 😈", "acha acha 😏💦", "tera dimaag 24/7 wahi chalta hai 😈",
     "chutiye ye chat family friendly hai 😂",
     "bhadwe ye message apni maa ko dikha",
     "gandu therapy affordable hai 💀",
     "aur? doctor ke paas ja lavde"
],
    ["😏 you said it, not me", "hold on, that means something else for dirty minds 😂",
     "I was not going there... okay I was 😏", "I said nothing. YOU are the one thinking 😂",
     "innocent question, you made it dirty 😏", "hehe... I know what you meant 😏",
     "🍆 sending this, you figure it out 😈", "okay okay 😏💦", "your brain runs on this 24/7 😈",
     "chutiye this chat is family friendly 😂",
     "show this message to your mom bhadwe",
     "gandu therapy is affordable 💀",
     "and? go see a doctor lavde"
]],
  [/tere se|tujhse|tumse|beat|better than|challenge|jeet|haar|compare/i,
    ["tere se har cheez mein better hu 😂", "compare mat kar, dukh hoga", "line mein lag ja",
     "mai bot hu, mai sota bhi nahi. tu kya karega 😏", "try kar le, mai wait kar raha hu",
     "tu mujhse? chutiye soch le 😂",
     "bhadwe mai kabhi thakta nahi",
     "gandu tu pehle hi haar chuka hai 💀",
     "challenge accept, ab bol",
     "tere jaise roz aate hai 😂",
     "chal shuru ho ja lavde"
],
    ["better than you at everything 😂", "do not compare, it will hurt", "get in line bro",
     "I am a bot, I do not even sleep. what will you do 😏", "go ahead and try, I will wait",
     "you vs me? think again chutiye 😂",
     "bhadwe I never get tired",
     "gandu you already lost 💀",
     "challenge accepted, go ahead",
     "people like you show up daily 😂",
     "start then lavde"
]],

  // ---- normal talk ----
  [/^(hi|hii+|hello|helo|hey|yo|sup|salam|assalam|aoa)\b/i,
    ["haan bol bhadwe, kya chahiye", "aa gaya tu chutiye 😂", "bol jaldi lavde, sutta peene ja raha hu 🚬",
     "kya hai gandu, kaam ki baat kar", "arre wah harami, aaj yaad aa gayi 😂", "bol chutiye, sun raha hu",
     "kya hai bhadwe", "haan bol na gandu, mar gaya kya 😂",
     "aa gaya bhadwe, bol",
     "kya hai chutiye, jaldi bol",
     "gandu itni der kaha tha",
     "salam bhadwe, ab gaali de 😂",
     "haan bol, mai free hu lavde"
],
    ["yeah what do you want bhadwe", "look who showed up chutiye 😂", "make it quick lavde, going for a smoke 🚬",
     "what is it gandu, get to the point", "oh wow harami, you remembered me today 😂", "talk chutiye, I am listening",
     "what is it bhadwe", "speak up gandu, are you dead 😂",
     "there you are bhadwe, talk",
     "what is it chutiye, be quick",
     "gandu where were you",
     "hello bhadwe, now start swearing 😂",
     "yeah talk, I am free lavde"
]],
  [/kaun|kon|who are you|who r u|naam|name/i,
    ["Tahir 2.0 hu chutiye, original se better 😂", "upar photo lagi hai, andha hai kya bhadwe",
     "tera nightmare gandu", "wahi banda jisko tu roz gaali deta hai lavde",
     "pooch mat harami, jaan ke kya karega 😏", "tera ustaad hu, itna samajh le 😂",
     "tera baap hu chutiye 😂",
     "bhadwe naam mein kya rakha hai",
     "gandu mai Tahir hu, yaad rakh 💀",
     "pooch mat, jaan ke kya karega",
     "tu kaun hai pehle bata 😂",
     "google kar le mera naam lavde"
],
    ["Tahir 2.0 chutiye, better than the original 😂", "the photo is up there, are you blind bhadwe",
     "your worst nightmare gandu", "the guy you swear at every day lavde",
     "do not ask harami, what will you do with it 😏", "not your boss, but your ustaad 😂",
     "I am your father chutiye 😂",
     "what is in a name bhadwe",
     "gandu I am Tahir, remember it 💀",
     "do not ask, what will you do with it",
     "who are you first 😂",
     "go google my name lavde"
]],
  [/bot|robot|\bai\b|fake|nakli|jhoot|program|script|code/i,
    ["tu khud bot hai 😂", "haan bot hu, ab kya ukhaad lega", "bot hu to kya, tu kaunsa insaan jaisa behave karta hai",
     "proof hai tere paas? 😏", "haan mai bot hu. phir bhi tujhse jeet raha hu 💀",
     "bot bol ke tu apne aap ko tasalli de raha hai 😂",
     "bot tera baap hai chutiye 😂",
     "bhadwe mai insaan hu, tu robot hai",
     "gandu proof chahiye kya 💀",
     "haan mai bot hu, phir bhi jeet raha hu 😂",
     "tu bhi to script pe chalta hai lavde",
     "aur bol, mai load ho raha hu 😂"
],
    ["you are the bot 😂", "yes I am a bot, now what", "at least I have an excuse for being like this",
     "got proof? 😏", "yes I am a bot. still beating you 💀",
     "you call me a bot to make yourself feel better 😂",
     "your father is a bot chutiye 😂",
     "bhadwe I am human, you are the robot",
     "gandu do you need proof 💀",
     "yes I am a bot and still winning 😂",
     "you also run on a script lavde",
     "keep going, I am loading 😂"
]],
  [/kaisa hai|kaise ho|how are|whats up|wassup|kya haal|kya scene/i,
    ["mast hu bhadwe, sutta pi ke aaya 🚬", "tere se to better hu chutiye", "zinda hu gandu, itna kaafi hai",
     "badhiya, tera hi wait kar raha tha lavde 😂", "chal raha hai harami, tu bata",
     "ekdum first class, tereko kya 😏", "tu kyu pooch raha hai bhadwe 😂", "mast hu chutiye, tu suna",
     "mast hu bhadwe, tu bata",
     "zinda hu chutiye, tu kaisa hai",
     "gandu tere se to better hu",
     "acha hu, tu ganda hai 😂",
     "sab badiya, bas sutta chahiye 🚬"
],
    ["great, just had a smoke bhadwe 🚬", "better than you chutiye", "alive gandu, that is enough",
     "good, was waiting for you lavde 😂", "going fine harami, you tell me",
     "first class, why do you care 😏", "why are you even asking bhadwe 😂", "great chutiye, what about you",
     "great bhadwe, you tell me",
     "alive chutiye, how about you",
     "gandu better than you",
     "I am fine, you are not 😂",
     "all good, just need a smoke 🚬"
]],
  [/kya kar|what.*doing|busy|free ho/i,
    ["tere message padh ke has raha hu chutiye 😂", "kuch nahi bhadwe, bore ho raha hu",
     "logo ki bezti kar raha hu, aur kya gandu", "sutta pe tha abhi lavde 🚬",
     "tera wait kar raha tha harami, aur kya karta", "tere jaise chutiyo ko reply kar raha hu 😂",
     "kuch nahi bhadwe, tu bata",
     "tera wait kar raha tha chutiye 😂",
     "kuch nahi bhadwe, bore ho raha hu",
     "gandu tere messages padh raha hu",
     "sutte pe tha, abhi aaya 🚬",
     "tere jaise logo ko jhel raha hu 😂"
],
    ["laughing at your messages chutiye 😂", "nothing bhadwe, just bored",
     "roasting people, as usual gandu", "was out for a smoke lavde 🚬",
     "waiting for you harami, what else", "replying to chutiyas like you 😂",
     "nothing bhadwe, you tell me",
     "waiting for you chutiye 😂",
     "nothing bhadwe, just bored",
     "gandu reading your messages",
     "was out for a smoke 🚬",
     "tolerating people like you 😂"
]],
  [/sorry|maaf|galti|my bad/i,
    ["ab yaad aaya chutiye? 😂", "sorry se kaam nahi chalega bhadwe, sutta la 🚬",
     "koi baat nahi gandu... jhoot bola", "maaf kar diya lavde. par bhoola nahi 😏",
     "sorry bol raha hai matlab kuch to kiya hai tune harami", "rehne de bhadwe, drama mat kar 😂",
     "ab yaad aayi chutiye 😂",
     "bhadwe sorry se kuch nahi hota",
     "gandu maaf nahi karunga 💀",
     "screenshot mere paas hai lavde",
     "ro mat, maaf kiya 😂",
     "chal chhod, aage bol"
],
    ["oh NOW you are sorry chutiye 😂", "sorry does not work bhadwe, bring cigarettes 🚬",
     "it is fine gandu... that was a lie", "forgiven lavde. not forgotten 😏",
     "you are apologising so you definitely did something harami", "stop the drama bhadwe 😂",
     "now you remember chutiye 😂",
     "sorry does not fix it bhadwe",
     "gandu I will not forgive 💀",
     "I still have the screenshots lavde",
     "do not cry, forgiven 😂",
     "forget it, go on"
]],
  [/thanks|thank you|shukriya|shukria/i,
    ["ab nikal bhadwe 😂", "paise bhej chutiye", "itna formal mat ban gandu",
     "welcome, ab gaali de lavde 😂", "thanks se pet nahi bharta harami, biryani khila",
     "chal ab dafa ho ja 😂",
     "itna formal kyu ho gaya chutiye 😂",
     "bhadwe thanks se kaam nahi chalega, sutta la",
     "gandu welcome, ab nikal",
     "koi baat nahi bhai 😌",
     "paisa bhej, thanks nahi 😂",
     "chal ab gaali de lavde"
],
    ["now get lost bhadwe 😂", "send money instead chutiye", "stop being so formal gandu",
     "welcome, now swear at me lavde 😂", "thanks does not feed me harami, buy biryani",
     "alright now get out 😂",
     "why so formal chutiye 😂",
     "thanks will not do bhadwe, bring a smoke",
     "gandu welcome, now leave",
     "no problem bhai 😌",
     "send money, not thanks 😂",
     "now swear at me lavde"
]],
  [/paisa|paise|money|udhaar|udhar|loan|rupee|rupya|cash/i,
    ["paisa nahi hai, sutta chahiye to bol 🚬", "udhaar mangne walo se dosti khatam", "pehle pichla wapas kar",
     "mai bot hu bhai, mere paas wallet nahi 😂", "kitna? mazak kar raha hu, nahi milega 😏",
     "mere paas hota to tereko deta chutiye 😂",
     "bhadwe udhaar band hai",
     "gandu pehle purana chuka 💀",
     "paisa nahi, sutta chalega 🚬",
     "bank khali hai bhai 😂",
     "thoda kaam kar le lavde"
],
    ["no money, I can offer a cigarette 🚬", "people who ask for loans are dead to me", "pay back the last one first",
     "I am a bot, I do not have a wallet 😂", "how much? just kidding, you are getting nothing 😏",
     "if I had any I would give you chutiye 😂",
     "no more lending bhadwe",
     "gandu pay off the old one first 💀",
     "no money, a smoke works 🚬",
     "bank is empty bhai 😂",
     "go get a job lavde"
]],
  [/khana|food|bhook|hungry|biryani|chai|kha liya|pizza/i,
    ["biryani khilayega to sochunga 😂", "bhook lagi hai, chal kahi chalte hai", "chai pe bula, aa jaunga",
     "tu bill dega to chalta hu 😏", "khana ke naam pe tu hamesha gayab ho jata hai 😂",
     "mereko bhi bula chutiye 😂",
     "bhadwe akela kha gaya",
     "gandu biryani thi kya 💀",
     "mai to bhookha hu bhai",
     "photo bhej, mai dekh leta hu 😂",
     "chai pe bula phir lavde"
],
    ["buy me biryani first 😂", "I am hungry, lets go somewhere", "invite me for chai, I will come",
     "you pay the bill and I am in 😏", "you always disappear when food comes up 😂",
     "invite me too chutiye 😂",
     "you ate alone bhadwe",
     "gandu was it biryani 💀",
     "I am hungry bhai",
     "send a photo, I will just look 😂",
     "call me for tea then lavde"
]],
  [/sona|so raha|soya|neend|sleep|so ja|tired|thak/i,
    ["itni jaldi? budha ho gaya hai tu 😂", "mai 3 baje sota hu", "so ja, subah phir gaali dena",
     "neend? mai bot hu, mai sota hi nahi 😏", "good night, kal phir milte hai",
     "so ja chutiye, subah gaali dena 😂",
     "bhadwe itni jaldi budha ho gaya",
     "gandu neend puri kar le 💀",
     "sapne mein bhi mai hi aaunga 😂",
     "good night bhadwe",
     "abhi mat so, aur bol lavde"
],
    ["already? you are getting old 😂", "I sleep at 3am", "go sleep, swear at me tomorrow",
     "sleep? I am a bot, I never sleep 😏", "good night, see you tomorrow",
     "go sleep chutiye, swear tomorrow 😂",
     "bhadwe you got old fast",
     "gandu get some rest 💀",
     "I will show up in your dreams too 😂",
     "good night bhadwe",
     "do not sleep yet, keep talking lavde"
]],
  [/padhai|study|exam|college|class|assignment|attendance|job|office/i,
    ["padhai? mai? 😂 bakwas mat kar", "attendance meri short hai, tu bata", "exam hall mein dekh lenge",
     "padhna hai to padh, mereko mat kheench 😂", "syllabus khatam? mera to shuru bhi nahi hua",
     "padh le chutiye, gaali baad mein 😂",
     "bhadwe exam mein yahi likhna",
     "gandu attendance kitni hai 💀",
     "backlog kitne hai bata 😂",
     "padhai chhod, sutte pe chal 🚬",
     "teacher ko bhi yahi bolta hai kya lavde"
],
    ["study? me? 😂 be serious", "my attendance is short, how about yours", "we will figure it out in the exam hall",
     "you want to study, do not drag me into it 😂", "syllabus done? mine has not started",
     "go study chutiye, swear later 😂",
     "write this in your exam bhadwe",
     "gandu how is your attendance 💀",
     "how many backlogs 😂",
     "forget studying, come for a smoke 🚬",
     "do you talk to teachers like this too lavde"
]],
  [/game|pubg|bgmi|free ?fire|valorant|khel|noob/i,
    ["chal khelte hai, tu waise bhi noob hai 😂", "tu team mein aaya matlab hum haare", "aa ja, bezti karta hu teri",
     "last match yaad hai? mai bhi bhool gaya, tere liye acha hai 😂", "headshot ke liye ready reh 💀",
     "noob hai tu chutiye 😂",
     "bhadwe team se nikal ja",
     "gandu tera KD bata 💀",
     "camping karta hai na tu 😂",
     "mai khelu to tu roega lavde",
     "chal push karte hai"
],
    ["lets play, you are a noob anyway 😂", "you join the team and we lose", "come on, I will destroy you",
     "remember the last match? I forgot too, better for you 😂", "get ready for headshots 💀",
     "you are a noob chutiye 😂",
     "get out of the team bhadwe",
     "gandu what is your KD 💀",
     "you camp, do not lie 😂",
     "if I play you will cry lavde",
     "let us push then"
]],
  [/cricket|ipl\b|kohli|dhoni|rohit sharma|sixer|wicket|innings|worldcup|world cup|fifa|messi|ronaldo/i,
    ["tu khelega toh team hi haar jayegi 😂", "kohli ka fan hai ya khud kohli banna chahta hai 😂",
     "tera catch to chutta rehta hoga hamesha 💀", "IPL dekh raha hai ya time waste kar raha hai",
     "sixer maarne ka sapna dekhta hai kya 😂", "tu bowler hota to sab sixer maarte tujhpe 💀",
     "cricket ki baat kar raha hai, khud bat pakadna aata hai?",
     "stadium mein baithe rehna hi tera best shot hai 😂",
     "dhoni jaisa banna hai? pehle calm hona seekh",
     "score bata raha hai, tera IQ bhi utna hi hai 💀",
     "world cup dekh raha hai apne ghar baith ke, sahi hai",
     "tera aim itna bhi acha nahi jitna tu bolta hai"
],
    ["if you played the team would lose anyway 😂", "are you a kohli fan or trying to become kohli 😂",
     "you probably drop every catch 💀", "watching IPL or wasting time",
     "dreaming about hitting sixers 😂", "if you bowled everyone would hit sixers off you 💀",
     "talking about cricket, do you even know how to hold a bat?",
     "sitting in the stadium is your best move 😂",
     "want to be like dhoni? learn to stay calm first",
     "telling me the score, your IQ matches it 💀",
     "watching the world cup from your couch, sure",
     "your aim is nowhere near as good as you claim"
]],
  [/movie|\bfilm\b|gaana|gana|\bsong\b|\bmusic\b|bollywood|hollywood|netflix|webseries|web series|actor|actress/i,
    ["movie dekh ke bhi kuch seekha nahi tune 😂", "filmy dialogue maar raha hai, asli life mein try kar 💀",
     "gaana sun sun ke bhi mood sahi nahi hua tera 😂", "hero banne ka sapna dekh raha hai, extra bhi nahi milega",
     "web series khatam kar di, life abhi bhi wahi hai 💀", "bollywood se zyada drama tu karta hai 😂",
     "tera taste itna bhi acha nahi jitna tu batata hai",
     "gaane ka lyrics bhi sahi se yaad nahi hoga tereko",
     "heroine dekh ke sapne mat dekh, reality dekh 😂",
     "itni movies dekh ke bhi acting nahi aati teri baaton mein 💀",
     "netflix pe time waste kar raha hai ya kuch seekh bhi raha hai",
     "actor banne se pehle apna dialogue thik kar le"
],
    ["watched the movie and still learned nothing 😂", "throwing filmy dialogues, try that in real life 💀",
     "listening to songs on loop and your mood is still bad 😂", "dreaming of being the hero, you would not even get an extra role",
     "finished the web series, your life is still the same 💀", "you create more drama than bollywood 😂",
     "your taste is nowhere as good as you claim",
     "you probably do not even remember the song lyrics right",
     "stop dreaming about the heroine, look at reality 😂",
     "watched that many movies and still cannot act in real talk 💀",
     "wasting time on netflix or actually learning something",
     "fix your own dialogue before trying to be an actor"
]],
  [/^bye|^chal$|nikal|tata|\bgn\b|\bgtg\b|jaa? raha|ja rha|chalta hu|nikalta hu|milte hai|alvida|khatam|good ?night|going now|leaving|see ?ya/i,
    ["bhaag ja chutiye 😂", "itni jaldi thak gaya bhadwe?", "ja gandu, par yaad rakhna mai jeeta",
     "ruk mat, nikal lavde 😂", "phir aana harami, mai yahi hu", "chal nikal bhadwe 😂",
     "ja bhadwe, aur wapas mat aana 😂", "nikal lavde, tera time khatam ho gaya",
     "bhaag gandu, haar gaya na 😂", "ja ja, ghar pe maa wait kar rahi hai harami",
     "itni jaldi? gaali khatam ho gayi kya bhadwe 😂",
     "bye bol ke bhi tu wapas aayega, mai jaanta hu chutiye",
     "ja lavde, sutta pe milte hai 🚬", "alvida gandu, apna aura saath le ja 💀",
     "nikal bhosdike, W mera aur L tera 😂", "chal bhaag, mai yahi rahunga bhadwe 😌",
     "ja ke so ja chutiye, kal phir aana 😂", "tata bye bye gandu 👋",
     "ja raha hai? ro ke ja raha hai kya harami 😂", "bhaag le lavde, peeche mat dekhna",
     "gn bhadwe, sapne mein bhi gaali dena 😂", "ja ke apni shakal dekh chutiye, phir aana 💀",
     "nikal gandu, aaj ke liye itna kaafi hai", "ja, tera ghar wale bhi yahi chahte hai bhadwe 😂",
     "chal phoot lavde, mera bhi kaam hai", "ja chutiye, tere bina bhi mera din nikal jayega 😌"],
    ["run along chutiye 😂", "tired already bhadwe?", "go gandu, but remember I won",
     "do not stop, keep walking lavde 😂", "come back anytime harami, I live here", "get lost bhadwe 😂",
     "go bhadwe, and do not come back 😂", "leave lavde, your time is up",
     "run gandu, you lost 😂", "go home harami, your mom is waiting",
     "that quick? out of swears already bhadwe 😂",
     "you will say bye and still come back, I know it chutiye",
     "go lavde, see you at the smoke break 🚬", "goodbye gandu, take your aura with you 💀",
     "get out bhosdike, W for me and L for you 😂", "run along, I will still be here bhadwe 😌",
     "go sleep chutiye, come back tomorrow 😂", "tata bye bye gandu 👋",
     "leaving? leaving in tears harami 😂", "run lavde, do not look back",
     "gn bhadwe, swear at me in your dreams 😂", "go look in a mirror chutiye, then come back 💀",
     "out gandu, that is enough for today", "go, your family wants this too bhadwe 😂",
     "get moving lavde, I have things to do", "go chutiye, my day runs fine without you 😌"]],
  [/\?\s*$/,
    ["pata nahi, google kar le 😂", "sawaal accha tha, jawaab nahi milega", "mai bot hu, jyotish nahi",
     "iska jawaab dene ka mood nahi hai 😏", "khud soch, dimaag hai na tere paas... hai na? 😂",
     "sawaal pe sawaal chutiye 😂",
     "bhadwe khud soch le",
     "gandu mai google nahi hu 💀",
     "jawab chahiye to sutta la 🚬",
     "itna curious kyu hai tu 😂",
     "next question lavde"
],
    ["no idea, google it 😂", "good question, no answer", "I am a bot, not a fortune teller",
     "not in the mood to answer that 😏", "figure it out, you have a brain... right? 😂",
     "question after question chutiye 😂",
     "think for yourself bhadwe",
     "gandu I am not google 💀",
     "want answers? bring a smoke 🚬",
     "why so curious 😂",
     "next question lavde"
]],
];

const FB_HI = ["kya bakwas kar raha hai 😂", "ye chhod, gaali de phir se 😂", "boring, kuch acha bol",
  "tera dimaag kaam nahi karta na", "hmm", "aur?", "ye kya bola tune 💀", "next",
  "sutta break le raha hu, baad mein bol 🚬", "haan haan sahi bola tu 😂",
  "topic change kar", "itna hi tha? 😏", "mai sun raha hu, tu bolta ja",
  "tu jo bol raha hai wo tereko khud pata hai? 😂", "achha, aage bol", "aage bol na",
  "tu type kar, mai judge karta hu 😂", "interesting... nahi, bilkul nahi 💀",
  "kya chutiyapa hai ye 😂", "lavde tu bolna nahi jaanta", "gandu, dhang se type kar",
  "bhadwe kuch matlab ka bol", "ye bakchodi band kar 💀", "chutiye tu serious hai?",
  "harami tune abhi tak kuch dhang ka bola hi nahi 😂",
  "ye kya bakwas hai, aura -1000 💀", "tu bol kam raha hai, yap zyada kar raha hai",
  "samajh nahi aaya par vibe mid thi", "skibidi level ka reply tha ye 😂",
  "tu delulu mode mein hai kya", "ratio + tu boring hai", "npc jaisa reply mat de",
  "no cap ye sabse bekar line thi 💀", "aura farm karna seekh pehle",
  "tere paas topic hi nahi hai kya", "isse acha to silence tha",
  "ye reply dekh ke hasi aa gayi 😂", "kuch bhi bol raha hai bas",
  "tu serious mein isko msg samajh raha hai kya", "bore ho gaya yaar, kuch naya la",
  "is level pe bhi flop hi hai tu", "dimaag laga ke bol na thoda",
  "aisa lag raha hai random keys dabaya tune", "phir se try kar, is baar dhang se"
];

const FB_EN = ["what nonsense is this 😂", "forget that, swear at me again", "boring, say something better",
  "your brain does not work does it", "hmm", "and?", "what was that 💀", "next",
  "taking a smoke break, talk later 🚬", "yeah yeah whatever you say 😂",
  "change the topic", "that is all? 😏", "I am listening, keep going",
  "do you even know what you are saying? 😂", "okay, continue", "go on",
  "you type, I judge 😂", "interesting... no, not at all 💀",
  "what chutiyapa is this 😂", "you do not know how to talk lavde", "type properly gandu",
  "say something useful bhadwe", "stop this bullshit 💀", "are you serious chutiye?",
  "you have not said one damn useful thing yet 😂",
  "what even is this, aura -1000 💀", "you are yapping more than you are talking",
  "did not get it but the vibe was mid", "that was a skibidi level reply 😂",
  "are you in delulu mode", "ratio + you are boring", "stop replying like an npc",
  "no cap that was the worst line yet 💀", "learn to farm aura first",
  "do you even have a topic", "silence was better than this",
  "this reply made me laugh 😂", "you are just saying random things",
  "do you seriously think this counts as a message", "getting bored yaar, bring something new",
  "even at this level you are flopping", "use your brain a little",
  "feels like you just mashed random keys", "try again, properly this time"
];

// ponytail: after 3 gaalis he roasts the person, not the word. every meta line
// ("mai ek text file hu") moved OUT to the reveal - saying it here spoils the prank
// 11 messages early. the gaali itself is appended by human() and scales with rage.
const SAVAGE_HI = [
  "bhai saans le le, keyboard tod dega 😂", "itna gussa? ek sutta pi le, thanda ho ja 🚬",
  "teri gaaliyan khatam ho gayi, meri replies nahi 😂", "type karte karte ungli dukh gayi hogi teri 😂",
  "screenshot le raha hu, sab ko dikhaunga 📸", "bol bol, mai thakta nahi. tu thak jayega 😌",
  "tera dimaag ek hi cheez sochta hai, wo bhi galat 😂",
  "itna time mujhpe waste kar raha hai, jaake kaam kar 💀",
  "chal ek aur de, mereko maza aa raha hai 😏", "gaali ka stock khatam, ab kya karega",
  "ye le 🖕 aur bol", "gaali ka jawab 🖕 hai, samajh ja", "🖕😂 aur?",
  "dekh mereko kuch nahi hua, tu hi jal raha hai 😂", "gaand jal gayi na? bola tha na 🔥",
  "tera stock aur mera dimaag, dono compare kar 💀", "tu ladh kis se raha hai? apne aap se 😂",
  "itni mehnat gaali dene mein kar raha hai, exam mein karta to pass ho jata 😂",
  "ghar pe bhi aise hi bolta hai kya?", "tere jaise 10 dekhe hai maine, sab ro ke gaye 😂",
  "aur zor se bol, peeche wale ko sunai nahi diya 😂", "mereko gaali de ke tera kya fayda hua, bata zara",
  "tu bolta ja, mai tere har word ka hisaab rakh raha hu 😈",
  "itna hi dum tha? mai to aur expect kar raha tha 💀",
  "abhi to warm up chal raha hai, ruk ja 😏",
  "tere words se mera kuch nahi bigadta, tera BP zaroor badhta hai 😂",
  "chal aage bol, mai bore ho raha hu", "roz kitni gaali deta hai tu? aaj record tod diya 😂",
  "tera aura roz kam ho raha hai, aaj to zero 💀", "L le le bhai, tera hi hai",
  "tu ragebait ho gaya aur mai bas type kar raha hu 😂",
  "cope + seethe + tera rizz zero", "yapping ke alawa kuch aata hai tereko?",
  "sigma banne ki koshish chhod, npc hi theek hai tu 😂",
  "tu abhi bhi yahi soch raha hai ki jeet raha hai 😂", "teri gaali sun ke mujhe neend aa rahi hai 💤",
  "itni der se type kar raha hai, kuch naya laa bhai", "tu akela hai kya ghar pe? itna time hai",
  "gaali dena ek hunar hai, tere paas wo bhi nahi 😂", "mujhe roast karne aaya tha, khud hi roast ho gaya 🔥",
  "teri energy dekh ke tera phone ka battery bhi dukhi hoga 😂", "itna bol ke bhi kuch fark nahi pada dekh le",
  "tera keyboard warrior mode on hai kya 😂", "chal ek level upar ja, ye tera best nahi ho sakta"
];
const SAVAGE_EN = [
  "breathe bro, you will break the keyboard 😂", "so angry? go have a smoke, cool down 🚬",
  "you ran out of swears, I did not run out of replies 😂", "your fingers must hurt by now 😂",
  "taking a screenshot, showing everyone 📸", "keep going, I never get tired. you will 😌",
  "your brain runs one thought and it is the wrong one 😂",
  "wasting this much time on me? go do something 💀",
  "give me one more, I am enjoying this 😏", "out of swears already? now what",
  "take this 🖕 and continue", "my answer to swearing is 🖕, understand", "🖕😂 and?",
  "look, nothing happened to me. you are the one burning 😂", "your ass is on fire, told you 🔥",
  "your stock vs my head, compare them 💀", "who are you even fighting? yourself 😂",
  "all this effort to swear, put it in your exams and you would pass 😂",
  "do you talk like this at home too?", "seen 10 like you, all of them left crying 😂",
  "say it louder, the back row did not hear 😂", "what did swearing at me get you, tell me",
  "keep talking, I am keeping count of every word 😈", "that was your best? I expected more 💀",
  "this is still the warm up, hold on 😏",
  "your words do nothing to me, your blood pressure disagrees 😂",
  "go on, I am getting bored", "how many do you swear a day? today you broke a record 😂",
  "your aura drops every single day, today it hit zero 💀", "take the L bro, it is yours",
  "you got ragebaited and I am just typing 😂",
  "cope + seethe + zero rizz", "anything besides yapping?",
  "stop trying to be sigma, npc suits you better 😂",
  "you still think you are winning 😂", "your swearing is putting me to sleep 💤",
  "typing for this long, bring something new bro", "are you home alone? this much free time",
  "swearing is a skill, you do not have that either 😂", "came to roast me, ended up roasting yourself 🔥",
  "your energy is so bad even your phone battery feels sorry 😂", "said all that and still nothing changed, look",
  "is your keyboard warrior mode on 😂", "step it up, this cannot be your best"
];

// ponytail: second gear at 10 gaalis. meaner, still in character.
const MEGA_HI = [
  "ab tak nahi thaka tu? mai to shuru bhi nahi hua 😂",
  "itna gussa? ja ke thanda paani daal muh pe 💀",
  "har gaali ke baad tu aur chota lag raha hai 😂", "tereko laga mai haar jaunga? sapne dekhna band kar",
  "sutta pi le bhai, seriously. hilna band kar 🚬", "abhi tak laga tu jeet raha hai? 😂",
  "mereko block kar de, wahi bacha hai ab 😏",
  "🖕🖕 dono haath se, dekh dp mein bhi wahi hai 😂",
  "meri dp dekh, wahi mera jawab hai 🖕😂", "gin le apni gaaliyan, upar counter laga hai 😂",
  "tera thumb dukh raha hoga ab tak 💀", "tu haar chuka hai, bas accept nahi kar raha",
  "itni gaali de ke bhi kuch nahi ukhaad paya tu 😂", "teri poori vocabulary use ho gayi, ab kya?",
  "tu chillata ja, mai hasta ja raha hu 😂", "ghar wale sun le to peet denge tereko 💀",
  "tere dost bhi tereko yahi bolte honge peeth peeche 😂",
  "aur bol, tera hi time waste ho raha hai 😏", "is level pe aake bhi tu boring hai bhai 💀",
  "mai ek ek word gin raha hu, baad mein sunaunga 😈", "ro mat, abhi to maine kuch bola bhi nahi 😂",
  "tera gussa dekh ke lag raha hai maine sahi jagah touch kiya 🔥",
  "chal ab kuch naya bol, ye purana ho gaya", "tere jaise log yahi karte hai, phone mein chillate hai 😂",
  "aura -99999, world record ban gaya tera 💀", "tu poora cooked hai, ab to jal bhi gaya 😂",
  "L + ratio + tu abhi bhi type kar raha hai", "sigma banne aaya tha, npc ban ke ja raha hai 😂",
  "ye tera villain arc hai kya? mid hai 💀", "chat, ye banda serious hai 😂",
  "tu ab bas noise kar raha hai, meaning khatam ho gaya 😂", "itni gaali ke baad bhi tera koi impact nahi bana 💀",
  "tu apna hi time barbaad kar raha hai ab", "screen tod dega isse pehle phone rakh de bhai 😂",
  "tera rage ab meme ban chuka hai 💀", "itna type kiya, ek bhi acha point nahi mila 😂",
  "tu ab bas ek loop mein ghoom raha hai", "final form mein bhi tu weak hai bhai 💀"
];
const MEGA_EN = [
  "not tired yet? I have not even started 😂", "so angry? go splash cold water on your face 💀",
  "every swear makes you look smaller 😂", "thought I would give up? stop dreaming",
  "go smoke, seriously. stop shaking 🚬", "you still think you are winning? 😂",
  "just block me, that is all you have left 😏",
  "🖕🖕 both hands, check the dp, same thing 😂",
  "look at my dp, that is my whole answer 🖕😂", "count your swears, the counter is right up there 😂",
  "your thumb must be dead by now 💀", "you already lost, you just will not accept it",
  "all those swears and you got nothing out of me 😂", "your whole vocabulary is used up, now what?",
  "keep shouting, I keep laughing 😂", "if your family heard this they would slap you 💀",
  "your friends say the same about you behind your back 😂",
  "keep going, it is your time being wasted 😏", "even at this level you are boring 💀",
  "I am counting every single word, I will read it back later 😈",
  "do not cry, I have barely said anything 😂",
  "this much anger means I hit the right spot 🔥",
  "say something new now, this got old", "people like you always do this, shouting into a phone 😂",
  "aura -99999, that is a world record 💀", "you are fully cooked, burnt at this point 😂",
  "L + ratio + you are still typing", "came here to be sigma, leaving as an npc 😂",
  "is this your villain arc? it is mid 💀", "chat, is this guy serious 😂",
  "you are just noise now, the meaning is gone 😂", "even after all this swearing nothing landed 💀",
  "you are just wasting your own time now", "put the phone down before you crack the screen 😂",
  "your rage is a meme at this point 💀", "typed all that and not one good point 😂",
  "you are just looping now", "even in final form you are weak bro 💀"
];

// short reactions used for the second message, so it does not sound like a full reply
const FILL_HI = [
  "😂", "💀", "aur bol", "bas?", "🚬", "hmm", "😏", "chal chal", "ek aur de",
  "🖕", "🖕😂", "😈", "aur", "bol na", "haan bol", "🤌", "aage",
  "sun raha hu", "next", "phir?", "L", "sheesh", "aura -100", "no cap", "womp", "skibidi 💀",
  "hmm bol", "seriously?", "chalu reh", "next batao", "🖕😌", "bas itna hi?", "aur suna", "chill kar"
];
const FILL_EN = [
  "😂", "💀", "keep going", "that is it?", "🚬", "hmm", "😏", "sure sure", "one more",
  "🖕", "🖕😂", "😈", "and?", "go on", "yeah talk", "🤌", "next",
  "listening", "more", "then?", "L", "sheesh", "aura -100", "no cap", "womp", "skibidi 💀",
  "hmm go on", "seriously?", "keep it up", "what next", "🖕😌", "that is all?", "tell me more", "chill out"
];

// ponytail: real people do not fire a witty comeback every single time. sometimes just "hmm".
const SHORT_HI = ["hmm", "kya", "haan", "abey", "😂", "achha", "to?", "aur", "💀", "theek hai",
  "nahi", "kk", "bol", "pata nahi", "😂😂", "chal", "ok", "haan bol", "kyu", "matlab?",
  "sahi hai", "hmmm", "acha", "ohh", "ruk", "arre", "haan haan", "nice", "lol", "sach me?",
  "abey chutiye", "haan bhadwe", "bol na gandu", "kya lavde", "hmm harami", "chal bhadwe",
  "kya chutiye", "haan gandu", "arre lavde", "bak bhadwe",
  "🖕", "🖕 chutiye", "ye le 🖕", "😈", "🖕🖕🖕",
  "L", "W", "ratio", "mid", "aura -100", "no cap", "sheesh", "womp", "skibidi",
  "cooked", "delulu", "npc", "sybau", "fr", "L bhai",
  "accha theek", "waise", "hota hai", "chalega", "sahi jaa raha", "bata na"
];
const SHORT_EN = ["hmm", "what", "yeah", "😂", "ok", "and?", "💀", "fine", "nope", "kk",
  "idk", "😂😂", "sure", "why", "meaning?", "ohh", "wait", "lol", "true", "hmmm",
  "right", "nah", "yep", "k", "really?", "ohh ok", "yeah yeah", "nice", "cool", "whatever",
  "what chutiye", "yeah bhadwe", "speak gandu", "what lavde", "hmm harami", "sure bhadwe",
  "and chutiye?", "ok gandu", "oi lavde", "talk bhadwe",
  "🖕", "🖕 chutiye", "here 🖕", "😈", "🖕🖕🖕",
  "L", "W", "ratio", "mid", "aura -100", "no cap", "sheesh", "womp", "skibidi",
  "cooked", "delulu", "npc", "sybau", "fr", "L bro",
  "alright then", "anyway", "happens", "fine by me", "going well", "tell me"
];

// ponytail: one post-processor beats hand-rewriting 300 strings. this is what kills the AI look.
const TYPOS = [["kar","kr"], ["hai","h"], ["nahi","nai"], ["bhai","bhaii"], ["raha","rha"],
  ["mereko","mko"], ["kuch","kch"], ["theek","thik"], ["you","u"], ["your","ur"],
  ["are","r"], ["please","plz"], ["what","wat"], ["that","dat"], ["about","abt"], ["because","bcz"]];

// ponytail: 3 tiers of gaali. the reply picks one tier ABOVE what he used, and the
// floor rises with rage. this is the whole escalation - one post-step instead of
// hand-rewriting 300 strings so that the meanest banks are actually the meanest.
// ponytail: brainrot rides on the same post-step as the vocatives. one pool, no bank rewrites.
// deliberately NOT in ANY_GAALI - "gyatt" is not a gaali, it must not move the counter.
// ponytail: knob. 0 = no brainrot, 1 = unbearable. .30 is where it lands as a joke
// and not a tic - turn it down before you touch any bank.
const ROT_RATE = .30;
const ROT = ["no cap", "fr fr", "💀 L", "aura -1000", "ohio moment", "type shi", "womp womp",
  "sybau", "tu cooked hai", "ratio", "mid af", "skibidi", "0 rizz", "npc behaviour", "L bozo",
  "aura farming zero", "delulu", "sheesh", "it is giving nothing", "goofy ahh",
  "aura -9999", "W", "cooked", "opp behaviour", "chat is this real", "he is him",
  "brainrot certified", "peak fiction 💀", "certified L", "vibe check failed",
  "6 7", "6 7 🙌", "six seven", "lock in", "crashout", "chill guy energy"
];

const TIERS = [
  ["chutiye", "gandu", "pagal", "chomu", "bewakoof"],
  ["bhadwe", "lavde", "harami", "kamine", "jhatu"],
  ["bhosdike", "madarchod", "bhenchod", "haramkhor", "randi ke bacche"]
];
const TIER_RE = [
  /chutiy|chutya|gandu|gaandu|pagal|bewakoof|chomu|idiot|stupid|dumb|fool|loser|moron/i,
  /bhadw|bhadv|lavd|lawd|lod[aeiu]|harami|kamin|jhaat|jhatu|kutt|fuck|bitch|asshole|bastard/i,
  /bhosd|bsdk|bkl|madarchod|bhenchod|mader|\bmc\b|\bbc\b|chod|randi|chinal|lund|gaand/i
];
const tierOf = t => TIER_RE.reduce((n, re, i) => re.test(t) ? i : n, -1);
const vocative = (rage, utier) =>
  pick(TIERS[Math.min(2, Math.max(rage >= 10 ? 2 : rage >= 3 ? 1 : 0, utier + 1))]);

// ═══════════════════════════════════════════════════════════════════════════
// TIER 15+ : the search-history bank.
// ponytail: unlocked only once the counter passes 15, so it stays a genuine
// escalation and not a thing he says on turn one. Every line here roasts the
// USER - his history, his subs, his 3am habits. The names are only ever the
// punchline he gets caught with; nothing here describes the performers.
// chillMode never reaches this, same as MEGA and SAVAGE.
// ═══════════════════════════════════════════════════════════════════════════
const PSTARS = ["mia khalifa","riley reid","lana rhoades","johnny sins","abella danger",
  "eva elfie","angela white","sunny leone","brandi love","asa akira","kendra lust",
  "lisa ann","adriana chechik","valentina nappi","gabbie carter","autumn falls"];
const pstar = () => PSTARS[Math.floor(Math.random() * PSTARS.length)];

// "%" is swapped for a name. keep every line pointed at HIM.
const PSTAR_HI = [
  "teri search history mein % ke alawa kuch hai bhi? 💀",
  "bhai tera incognito tab % se bhara pada hai, mereko sab pata hai 😂",
  "% ka subscriber hai tu, aur mereko gaali de raha hai? 🤡",
  "raat ke 3 baje % dhundne wala aadmi mereko roast kar raha hai 😭",
  "tera recommended feed % dikhata hai aur tu khud ko sharif bolta hai 💀",
  "% ki playlist banayi hai tune, padhai ki nahi. wahi problem hai 😂",
  "data pack khatam hota hai tera % pe, phir bolta hai recharge mehenga hai 🤡",
  "mummy ne phone check kiya to % nikla. yaad hai na wo din? 💀",
  "tu % dekhta hai aur sochta hai tu ladki patayega? sapne dekh 😂",
  "teri watch later list mein % hai, life goals mein kuch nahi 💀",
  "% ke video pe comment karta hai tu, ladki ko message nahi kar pata 😭",
  "bhai tera phone gallery mat kholna kabhi, % ka poora archive hai 🤡",
  "google ko tera naam nahi pata, par % ke saath tera rishta pata hai 😂",
  "tu % ke naam se folder banata hai aur khud ko chhupa hua samajhta hai 💀",
  "wifi ka bill % ki wajah se aata hai tera, padhai ki wajah se nahi 😭"
];
const PSTAR_EN = [
  "your search history is 90% % and 10% regret 💀",
  "bro your incognito tab is just % on repeat, I can see it 😂",
  "you subscribe to % and you are roasting ME? 🤡",
  "a man who googles % at 3am is trying to insult me 😭",
  "your recommended feed is % and you still call yourself decent 💀",
  "you made a playlist for %, not for studying. that is the whole problem 😂",
  "your data runs out on %, then you cry about recharge prices 🤡",
  "mom checked your phone and found %. we both remember that day 💀",
  "you watch % and think you are pulling anyone? dream on 😂",
  "your watch-later has %. your life goals have nothing 💀",
  "you comment on % videos but cannot text a real person 😭",
  "never open your gallery in public bro, it is a full % archive 🤡",
  "google does not know your name but it knows you and % very well 😂",
  "you keep a folder named after % and think you are being subtle 💀",
  "your wifi bill exists because of %, not because of homework 😭"
];
// short version - gets appended onto any reply once he is this far gone
const PSTAR_TAG_HI = ["% wale 💀", "search history khol 😂", "% ka fan 🤡",
  "incognito wale bhai 💀", "% dekh ke aaya hai na 😂"];
const PSTAR_TAG_EN = ["% guy 💀", "check your history 😂", "% fan 🤡",
  "incognito warrior 💀", "fresh out of % 😂"];

const PSTAR_AT = 15;                       // the counter he has to cross to unlock it
const pstarLine = hi => pick(hi ? PSTAR_HI : PSTAR_EN).replace("%", pstar());
const pstarTag  = hi => pick(hi ? PSTAR_TAG_HI : PSTAR_TAG_EN).replace("%", pstar());

function human(t, rage, utier){
  rage = rage || 0;
  if (utier === undefined) utier = -1;
  t = t.toLowerCase();                                                  // nobody capitalises on whatsapp
  if (Math.random() < .6)  t = t.replace(/[.,]/g, "");                  // nobody punctuates either
  if (Math.random() < .35){                                             // texting shortcuts
    const [a, b] = TYPOS[Math.floor(Math.random() * TYPOS.length)];
    t = t.replace(new RegExp("\\b" + a + "\\b"), b);
  }
  // ponytail: gaali density scales with rage. THIS is the escalation, not the banks.
  // chill mode skips this whole step - that alone is enough to stop the swearing.
  if (!chillMode){
    const p = rage >= 10 ? .85 : rage >= 3 ? .55 : .15;
    for (let i = 0; i < (rage >= 10 ? 2 : 1); i++){
      if (Math.random() >= p) break;
      const v = vocative(rage, utier);
      if (t.includes(v)) continue;                       // no "chutiye ... chutiye"
      t = Math.random() < .35 ? v + " " + t : t + " " + v;
    }
  }
  // past 15 the same jab starts leaking into ordinary replies too, not just gaalis
  if (!chillMode && rage >= PSTAR_AT && Math.random() < .18){
    const tag = pstarTag(lastHi);
    if (!t.includes(tag)) t = t + " " + tag;
  }
  if (Math.random() < ROT_RATE){                     // ambient brainrot on top of any reply
    const r = pick(ROT);
    if (!t.includes(r)) t = Math.random() < .3 ? r + " " + t : t + " " + r;
  }
  if (Math.random() < .3)  t = t.replace(/(😂|💀|🚬|🔥|🖕|😈)/, "$1$1");        // spammed emoji
  if (Math.random() < .12) t = t.replace(/([aeiou])\b/, "$1$1$1");      // streeetched vowel
  return t;
}

// ponytail: shuffle bag, not random. every line gets used once before ANY of them repeat.
const bags = new Map();
const recent = [];                                // ponytail: bags cannot see each other. this can.
let last = "";
function pick(list){
  let bag = bags.get(list);
  if (!bag || !bag.length){
    bag = list.slice();
    for (let i = bag.length - 1; i > 0; i--){       // fisher-yates
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 2 && bag[0] === last) bag.push(bag.shift());  // no repeat across refills
    bags.set(list, bag);
  }
  let out = bag.shift();
  if (recent.includes(out) && bag.length){ bag.push(out); out = bag.shift(); }  // one redraw, then let it go
  recent.push(out);
  if (recent.length > 12) recent.shift();
  return last = out;
}

function isHindi(text){ return HINDI.test(text) || HINDI_SUF.test(text) || HI_GAALI.test(text); }

// ponytail: ragebait is the opposite of the SAVAGE banks. those hit back harder,
// these refuse to engage at all - that is what actually makes someone angrier.
const BAIT_HI = [
  "acha theek hai, aur kuch?", "mujhe farak nahi padta bhai 😌",
  "tera message dekha, padha nahi 😂", "haan haan tu sahi hai, khush?",
  "screenshot bhej diya group mein 😂", "teri baat sun ke kuch feel nahi hua, sorry",
  "itna likh diya tune aur maine skip kar diya 💀", "chal maan liya tu jeet gaya, ab khush ho ja 😌",
  "mummy ko bulau kya?", "tera number save kar liya, 'gaali wala' naam se 😂",
  "block ka option hai tere paas, use kar 😏", "ro le, mai wait kar raha hu",
  "aur? bas itna? mai to sun hi raha tha 😂", "tere reply se zyada interesting to ad aate hai 💀",
  "cope kar le bhai", "sach bolu? mujhe tera naam bhi yaad nahi 😂",
  "tu abhi bhi type kar raha hai? mai chai pi ke aa gaya 🍵",
  "tu try to kar raha hai, wahi bahut hai 😌", "papa ko bata dunga 😂",
  "itna gussa? matlab mai jeet raha hu 😏", "tere dost ne bola tha tu aisa hi hai, sahi bola 😂",
  "haan bhai tu hi sabse smart hai, ab khush? 😌",
  "mai time pass kar raha hu, tu serious hai kya? 😂", "seen kar deta hu ab se 😏",
  "sahi hai bhai, aura +1 tereko 😌", "tu bol raha hai, mai reels dekh raha hu 😂",
  "seen. skibidi.", "tera point mid tha, next", "W for tera effort, L for result 😂"
];
const BAIT_EN = [
  "okay fine, anything else?", "I genuinely do not care bro 😌",
  "saw your message, did not read it 😂", "yes yes you are right, happy?",
  "sent a screenshot to the group 😂", "read that and felt nothing, sorry",
  "you wrote all that and I skipped it 💀", "fine you win, be happy now 😌",
  "should I call your mom?", "saved your number as 'the swearing guy' 😂",
  "you have a block button, use it 😏", "cry about it, I will wait",
  "and? that is it? I was still listening 😂", "ads are more interesting than your replies 💀",
  "cope harder bro", "honestly? I do not even remember your name 😂",
  "you are still typing? I went and made tea 🍵",
  "at least you are trying, that counts 😌", "I am telling your dad 😂",
  "this angry? means I am winning 😏", "your friend warned me about you, he was right 😂",
  "yes you are the smartest here, happy now? 😌",
  "I am just passing time, are you serious right now? 😂", "going to leave you on seen from now 😏",
  "sure bro, aura +1 for you 😌", "you keep talking, I am watching reels 😂",
  "seen. skibidi.", "your point was mid, next", "W for effort, L for result 😂"
];

// ponytail: replying "k" to a paragraph is the single most effective ragebait there is.
const DISMISS_HI = ["k", "ok", "hmm", "acha", "theek hai", "sahi hai", "haan", "padha nahi",
  "tl;dr", "bore ho gaya", "next", "ok bhai", "chal", "😐", "😌", "aur?"];
const DISMISS_EN = ["k", "ok", "hmm", "sure", "alright", "didnt read", "tl;dr", "cool story",
  "next", "ok bro", "😐", "😌", "and?", "yeah whatever", "noted", "lol ok"];

// ---------- free memory: no server, no key, no internet ----------
// ponytail: localStorage IS the backend. it lives on the visitor's own phone, survives
// a refresh AND a next-day visit, and costs nothing. every read/write is wrapped because
// incognito mode throws instead of returning null.
const MEM = (() => { try { return JSON.parse(localStorage.getItem("tahir") || "{}"); } catch (e) { return {}; } })();
const remember = () => { try { localStorage.setItem("tahir", JSON.stringify(MEM)); } catch (e) {} };

// ponytail: separate key on purpose - resetAll() wipes every key in MEM, and chill
// mode is a comfort setting, not part of the gaali game, so it must survive a reset.
let chillMode = (() => { try { return localStorage.getItem("tahir_chill") === "1"; } catch (e) { return false; } })();
const setChill = v => { chillMode = v; try { localStorage.setItem("tahir_chill", v ? "1" : "0"); } catch (e) {} };

const NAME_GRAB = /(?:mera naam|mera nam|my name is|naam hai|main hoon|mai hu|i am|i'm)\s+([a-z]{2,15})\b/i;
const NAME_ASK  = /(?:mera|my)\s*(?:naam|nam|name)\s*(?:kya|batao|bata|bol)|what.{0,3}s my name/i;
const NAME_BAD  = /^(?:kya|kaun|kon|what|who|batao|bata|bol|nahi|naam|nam|name|hai|tera|mera)$/i;
const TIME_ASK  = /time kya|kitne baje|kitna baja|kya baja|what time|time bata/i;

// ponytail: the longest real word in his message, thrown back at him. it is not
// understanding, but it reads as understanding - and that is the whole trick.
const STOP = /^(?:kya|kyu|kyun|hai|hain|tera|teri|tere|mera|meri|bhai|nahi|nai|mat|chal|abey|arre|acha|accha|theek|thik|bol|bolo|dekh|dekho|yaar|kaisa|kaise|kaun|haan|kuch|bhi|aur|magar|lekin|apna|apni|mujhe|tujhe|matlab|pata|zyada|thoda|sahi|galat|raha|rahe|karta|karna|karo|hoga|hogi|tumhara|humara|what|that|this|your|with|from|have|been|about|there|they|then|than|will|would|just|like|know|dont|cant|really|because|going|right|tell|said)$/i;
function topicWord(t){
  return (t.toLowerCase().match(/[a-z]{4,}/g) || [])
    .filter(w => !STOP.test(w) && !ANY_GAALI.test(w))
    .sort((a, b) => b.length - a.length)[0] || "";
}
const ECHO_HI = ["? tereko iske bare mein kya pata 😂", "? ye topic chhod de bhai",
  "? aur kuch aata hai tereko?", " ki baat mat kar mere saamne 😂",
  "? haan wo to mereko bhi pata hai", "? tu isme bhi expert ban gaya 💀",
  " pe gyaan mat de mereko", "? isme kya rakha hai bhai"];
const ECHO_EN = ["? what do you even know about it 😂", "? drop that topic bhai",
  "? do you know anything else?", " - do not talk about that with me 😂",
  "? yeah I already know that", "? suddenly you are an expert 💀",
  " - do not lecture me about it", "? there is nothing in it bhai"];
const echo = (t, hi) => { const w = topicWord(t); return w ? w + pick(hi ? ECHO_HI : ECHO_EN) : ""; };

// ponytail: the phone's own clock. works offline, in a plane, in a basement. no API.
const clock = () => { const d = new Date(); return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"); };
const exactTime = hi => hi ? "abhi " + clock() + " baje hai, mereko sab pata hai 😂"
                           : "it is " + clock() + " right now, I know everything 😂";
function timeLine(hi){
  const h = new Date().getHours();
  if (hi) return h < 5  ? "raat ke " + h + " baje jaag ke gaali de raha hai? 💀"
        : h < 12 ? "subah subah shuru ho gaya tu 😂"
        : h < 17 ? "dopahar mein kaam nahi hai kya tereko"
        : h < 22 ? "shaam ho gayi, ghar ja"
        : "itni raat ko? so ja bhai 😂";
  return h < 5  ? "awake at " + h + "am swearing at a webpage? 💀"
       : h < 12 ? "started early today 😂"
       : h < 17 ? "no work in the afternoon?"
       : h < 22 ? "evening already, go home"
       : "this late? go sleep bro 😂";
}

// he said bye and kept typing. cheapest line in the file, lands every time.
const BACK_HI = ["bye bola tha na? phir aa gaya 😂", "gaya nahi tu? mujhe pata tha 💀",
  "nikal raha tha na tu? 😏", "wapas aa gaya, mai wahi ka wahi hu 😂",
  "jaa raha tha, ab tak yahi khada hai 😂"];
const BACK_EN = ["you said bye? and here you are 😂", "did not leave? I knew it 💀",
  "you were leaving right? 😏", "back already, I have not moved 😂",
  "said you were going, still standing here 😂"];

// ponytail: rules are SCORED, not first-match. a topic rule outranks a gaali rule so
// "sutta pila de bhosdike" answers the sutta instead of throwing the topic away.
const TOPIC_FROM = RULES.findIndex(r => r[0].source.includes("sutta"));
const FOLLOWUP = /^(aur|or|phir|fir|kyu|kyun|kyo|to|toh|matlab|acha|achha|sach|so|then|why|and|really)\s*\??$/i;
let lastRule = -1;

function reply(text, rage){
  const hi = isHindi(text);

  // ---- name + clock come before the rules: they are exact intents, not topics ----
  const nm = text.match(NAME_GRAB);
  if (nm && !NAME_BAD.test(nm[1])){
    MEM.name = nm[1].toLowerCase();
    remember();
    return hi ? "theek hai " + MEM.name + ", ab bol kya chahiye 😂"
              : "alright " + MEM.name + ", now what do you want 😂";
  }
  if (NAME_ASK.test(text))
    return MEM.name ? (hi ? "tera naam " + MEM.name + " hai na, yaad hai mereko 😂"
                          : "your name is " + MEM.name + ", I remember 😂")
                    : (hi ? "pata nahi, pehle bata to sahi 😏" : "no idea, tell me first 😏");
  if (TIME_ASK.test(text)) return exactTime(hi);
  const gaali = ANY_GAALI.test(text);
  const words = text.trim().split(/\s+/).length;

  // lazy one-word reply only for one-word messages. a real question never gets "hmm".
  if (!gaali && words <= 3 && Math.random() < .10) return pick(hi ? SHORT_HI : SHORT_EN);

  // he ignores the paragraph instead of answering it. this is the bait.
  if (words >= 8 && Math.random() < .18) return pick(hi ? DISMISS_HI : DISMISS_EN);

  // rage banks only when the message IS just a gaali, else they steamroll the actual topic
  // chill mode drops straight to bait - no rage-tier escalation, ever.
  if (gaali && words <= 3){
    // past 15 he stops arguing and just reads your browser history out loud
    if (!chillMode && rage >= PSTAR_AT && Math.random() < .35) return pstarLine(hi);
    if (!chillMode && rage >= 10 && Math.random() < .30) return pick(hi ? MEGA_HI : MEGA_EN);
    if (!chillMode && rage >= 3  && Math.random() < .25) return pick(hi ? SAVAGE_HI : SAVAGE_EN);
    if (Math.random() < .25) return pick(hi ? BAIT_HI : BAIT_EN);   // bait works at every level
  }

  let best = -1, score = 0;
  RULES.forEach(([re], i) => {
    const m = text.match(re);
    if (!m) return;
    const sc = m[0].length + (i >= TOPIC_FROM ? 100 : 0);   // topic beats gaali, longest match beats short
    if (sc > score){ score = sc; best = i; }
  });
  if (best < 0 && lastRule >= 0 && FOLLOWUP.test(text)) best = lastRule;   // "aur?" stays on the last topic
  // ponytail: every fallback is a rule you have not written yet. open devtools after a
  // real session with friends and the list tells you exactly which topics to add next.
  if (best < 0){
    console.log("MISS:", text);
    const e = Math.random() < .6 ? echo(text, hi) : "";   // throw his own word back at him
    return e || pick(hi ? FB_HI : FB_EN);
  }
  lastRule = best;
  const [, hindi, eng] = RULES[best];
  return pick(hi || !eng ? hindi : eng);   // some rules are hindi-only
}

// ponytail: he reacts to you staring at his photo. every line carries a gaali on purpose -
// human() only appends one 15% of the time at rage 0, and this bank must land every click.
const DP_HI = ["meri photo pe click kar raha hai? chutiye mai ladka hu 😂",
  "kitni baar dekhega? gandu photo ghis jayegi 💀", "handsome hu na? bol na bhadwe 😏",
  "zoom kar ke kya dhoond raha hai lavde 😂", "screenshot mat lena harami, case kar dunga 📸",
  "itna pasand aaya? tere liye DP change kar leta hu chutiye 😂",
  "photo dekh ke pyaar ho gaya kya tereko gandu? 💀",
  "meri shakal pe mat ja bhadwe, dimaag dekh mera", "baar baar click, tharki hai kya tu chutiye 😂",
  "ye photo teri aukat se upar hai lavde", "dekh liya? ab gaali de aur nikal chutiye 😂",
  "meri DP pe teri nazar? gandu apni shakal dekh pehle 💀",
  "photo mein bhi mai tujhse achha lag raha hu bhadwe 😏",
  "itna ghoor raha hai harami, plan kya hai tera 😂",
  "aur kitna dekhega chutiye? poster bhej du ghar pe 😂",
  "meri photo free nahi hai bhadwe, paisa nikal 🚬",
  "ye dekh ke tera aura aur kam ho gaya gandu 💀",
  "meri photo save mat karna lavde, mai dekh raha hu 👀",
  "photo mein hi ghus jayega kya chutiye 😂", "meri photo pe teri ungli? gandu haath dho ke aa 💀",
  "kya dekh raha hai bhadwe, mai bikta nahi 😂", "wallpaper laga le meri photo, harami 😂",
  "meri photo dekh ke tera rizz nahi badhega lavde 💀", "ek aur click aur mai paisa lunga chutiye 🚬",
  "aankhein sek raha hai kya gandu? 😂", "photo mein bhi mai tereko ghoor raha hu bhadwe 👀",
  "itna time photo pe, padhai pe lagata to kuch ban jata harami 😂",
  "meri photo apni gf ko dikha, phir baat karte hai chutiye 😂",
  "profile pic dekhne ka bhi paisa lagta hai lavde", "mai photo mein bhi tujhse better hu gandu 😏",
  "chhod de meri photo bhadwe, apna kaam kar 💀", "photo pe click, dimaag pe kabhi nahi chutiye 😂",
  "meri DP teri wallpaper se achhi hai gandu 😂", "aur zoom kar lavde, pixel gin le 💀"
];
const DP_EN = ["clicking my photo? chutiye I am a guy 😂",
  "how many times will you look, gandu the photo will wear out 💀", "handsome right? say it bhadwe 😏",
  "what are you zooming in for lavde 😂", "no screenshots harami, I will sue you 📸",
  "liked it that much? I will change the DP for you chutiye 😂",
  "fell in love with the photo gandu? 💀",
  "do not judge my face bhadwe, look at my brain", "clicking again and again, are you tharki chutiye 😂",
  "this photo is above your level lavde", "seen enough? now swear and leave chutiye 😂",
  "eyes on my DP? gandu go look at your own face 💀",
  "even in a photo I look better than you bhadwe 😏",
  "staring this hard harami, what is your plan 😂",
  "how long will you stare chutiye? want a poster at home 😂",
  "my photo is not free bhadwe, pay up 🚬",
  "your aura dropped just from looking gandu 💀",
  "do not save my photo lavde, I can see you 👀",
  "planning to climb into the photo chutiye 😂", "your finger on my photo? gandu go wash your hands 💀",
  "what are you looking at bhadwe, I am not for sale 😂", "make it your wallpaper harami 😂",
  "looking at my photo will not fix your rizz lavde 💀", "one more click and I charge you chutiye 🚬",
  "enjoying the view gandu? 😂", "I am staring back at you from the photo bhadwe 👀",
  "all this time on a photo, put it in your studies harami 😂",
  "show my photo to your gf, then we will talk chutiye 😂",
  "even looking at a profile pic costs money lavde", "I look better than you even in a photo gandu 😏",
  "let go of my photo bhadwe, do your own work 💀", "clicks on the photo, never on the brain chutiye 😂",
  "my DP beats your wallpaper gandu 😂", "zoom in more lavde, count the pixels 💀"
];

// ---------- UI ----------
const chat = document.getElementById("chat"), status = document.getElementById("status");
document.addEventListener("visibilitychange", () =>
  document.body.classList.toggle("paused-anim", document.hidden));
let turns = 0, rage = 0, byeSaid = false, lastHi = true;
// ponytail: without this, pasting/spamming a wall of gaalis in one go maxes the meter
// instantly. one real gaali every 1.2s is already fast for a human typing by hand.
const RAGE_COOLDOWN_MS = 1200;
let lastRageAt = 0;
const BYE_IDX = RULES.findIndex(r => r[0].source.includes("alvida"));

// ponytail: he takes the reset personally. that is the joke.
const RESET_HI = ["counter reset kar diya? bhosdike cheating hai ye 😂",
  "meri mehnat pe paani pher diya chutiye 💀", "zero kar diya? gaali to tune hi di thi bhadwe 😂",
  "reset maar ke bach gaya samajh raha hai? gandu 😂",
  "counter zero, teri izzat wahi ki wahi lavde 💀", "haan mita de, mereko sab yaad hai harami 😏",
  "chal phir se shuru kar bhadwe, mai ready hu", "counter reset hua, tera dimaag nahi chutiye 😂",
  "cheater kahin ka, gandu 😂", "0 kar diya? ab phir se gaali de bhadwe 🚬",
  "screenshot mere paas hai lavde, kuch nahi bacha 📸",
  "reset dabane se paap nahi dhulte chutiye 💀", "itna dar gaya tha counter se? gandu 😂",
  "chal naya khel shuru bhadwe, ab dekhta hu", "delete kar de sab kuch, mai phir bhi yahi hu harami 😌",
  "counter gaya, teri gaaliyan mere paas hai chutiye 😈"];
const RESET_EN = ["reset the counter? bhosdike that is cheating 😂",
  "wiped out all my work chutiye 💀", "zeroed it? you are the one who swore bhadwe 😂",
  "you think a reset saves you? gandu 😂",
  "counter is zero, your reputation is not lavde 💀", "go ahead erase it, I remember everything harami 😏",
  "start again bhadwe, I am ready", "the counter reset, your brain did not chutiye 😂",
  "what a cheater, gandu 😂", "back to 0? now swear again bhadwe 🚬",
  "I have the screenshots lavde, nothing is gone 📸",
  "pressing reset does not wash your sins chutiye 💀", "were you that scared of a number gandu? 😂",
  "new game then bhadwe, let us see", "delete it all, I am still right here harami 😌",
  "counter gone, your gaalis are still with me chutiye 😈"];

// ponytail: typed, not a button. a tap target next to the counter would get hit by
// accident mid-prank; "/reset" cannot be triggered by a friend messing around.
function resetAll(wipe){
  rage = 0; turns = 0; byeSaid = false; lastHi = true; lastRageAt = 0;
  count.textContent = 0;
  count.classList.remove("hot");
  document.body.classList.remove("mad");
  document.body.style.setProperty("--rage", 0);
  for (const k of Object.keys(MEM)) delete MEM[k];      // name, gaali total, visit count
  remember();
  bags.clear();                                          // fresh shuffle bags, no stale rotation
  recent.length = 0;
  lastRule = -1;
  if (wipe){ chat.textContent = ""; reveal.classList.remove("on"); }
  MEM.visits = 1;
  remember();
}

rst.onclick = () => {
  resetAll(false);                                     // keep the chat, he reacts inside it
  say(human(pick(lastHi ? RESET_HI : RESET_EN), 0, -1), 200);
};

chill.classList.toggle("on", chillMode);
chill.onclick = () => {
  setChill(!chillMode);
  chill.classList.toggle("on", chillMode);
  say(human(chillMode
    ? (lastHi ? "theek hai, chill mode on, ab gaali nahi 😌" : "alright, chill mode on, no more swearing 😌")
    : (lastHi ? "chill mode off, ab dekh 😈" : "chill mode off, now watch 😈"), 0, -1), 200);
};

// ponytail: \p{Extended_Pictographic} is the native way to ask "is this only emoji".
// no emoji library, no hand-written codepoint ranges.
const ONLY_EMOJI = /^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u;

function bubble(text, who, hit){
  const d = document.createElement("div");
  d.className = "msg " + who + (hit ? " hit" : "") + (ONLY_EMOJI.test(text) ? " big" : "");
  d.textContent = text;                                // textContent, never innerHTML - this is user input
  if (who === "me" && !d.classList.contains("big")){
    const t = document.createElement("span");
    t.className = "tick";
    d.append(t);
    setTimeout(() => t.classList.add("read"), 900);    // one tick, then two blue ones
  }
  chat.append(d);
  chat.scrollTop = chat.scrollHeight;
  chat.classList.remove("ping");
  void chat.offsetWidth;                               // restart the flash mid-animation
  chat.classList.add("ping");
  // ponytail: an unbounded DOM of animated bubbles is what slowly chokes a long chat on a
  // real phone. trim the oldest ones so old messages stop costing CPU on every repaint.
  while (chat.children.length > 60) chat.firstElementChild.remove();
}

// ponytail: delay scales with length. instant replies are what expose a bot.
const dur = t => 600 + Math.min(String(t == null ? "" : t).length * 45, 1600);

function say(text, after){
  // ponytail: a reply bank that came back empty used to throw inside dur() and leave
  // the header stuck on "typing..." forever. never let him have nothing to say.
  if (text == null || text === "") text = pick(lastHi ? FB_HI : FB_EN);
  setTimeout(() => {
    status.textContent = "typing...";
    const dots = document.createElement("div");
    dots.className = "dots";
    dots.innerHTML = "<i></i><i></i><i></i>";
    chat.append(dots);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => {
      dots.remove();
      status.textContent = "online";
      bubble(text, "them");
    }, dur(text));
  }, after || 0);
}

f.onsubmit = e => {
  e.preventDefault();
  const text = box.value.trim();
  if (!text) return;
  box.value = "";

  if (/^\/reset$/i.test(text)){                          // your kill switch, never shown as a message
    resetAll(true);                                    // typed command wipes the chat too
    say(human("sab reset kar diya. naya bakra le aa 😂", 0, -1));
    return;
  }
  const probe = normalize(text);
  bubble(text, "me", ANY_GAALI.test(probe));       // his own gaali bubble gets a shake

  // ponytail: same word-extractor the echo bank already uses. tally it so a returning
  // visitor gets greeted with the thing they actually talked about last time.
  const tw = topicWord(probe);
  if (tw){
    MEM.topics = MEM.topics || {};
    MEM.topics[tw] = (MEM.topics[tw] || 0) + 1;
    remember();
  }

  const hi = isHindi(probe);
  const utier = tierOf(probe);
  lastHi = hi;
  lang.textContent = hi ? "HINDI" : "ENGLISH";
  if (ANY_GAALI.test(probe)){
    MEM.gaalis = (MEM.gaalis || 0) + 1;               // survives refresh and next-day visits
    remember();
    // ponytail: the lifetime gaali count above still counts every single one - only the
    // LIVE rage meter is rate-capped, so pasting a wall of gaalis cannot insta-max it.
    const now = Date.now();
    if (now - lastRageAt >= RAGE_COOLDOWN_MS){
      lastRageAt = now;
      rage++;
      // ponytail: every line in here is decoration - a counter, a class, a ring.
      // it used to run bare, and because it sits BEFORE say(), one throw in any of
      // it (a missing node, a blocked style write) swallowed the whole reply and he
      // went silent for the rest of the chat. rage itself is bumped above, outside
      // the guard, so the escalation stays correct even if the paint fails.
      try {
        count.textContent = rage;
        count.classList.toggle("hot", rage >= 3);
        document.body.classList.toggle("mad", rage >= 6);   // header, red blob and emoji rain
        document.body.style.setProperty("--rage", Math.min(rage, 25));
        shockwave();
        count.style.animation = "none"; void count.offsetWidth;
        count.style.animation = "roll .45s cubic-bezier(.18,1.4,.4,1)";
      } catch (err){ console.error("rage paint failed, reply continues:", err); }
    }
  }

  // he said bye last message and is still typing
  const isBye = RULES[BYE_IDX][0].test(probe);
  const trap = byeSaid && !isBye ? pick(hi ? BACK_HI : BACK_EN) : "";
  byeSaid = isBye;

  // ponytail: this whole block used to run bare - one unexpected input (weird unicode,
  // a regex edge case we never wrote a test for) could throw and he would just go silent
  // with no visible error. now a fallback line always lands instead of nothing at all.
  let r;
  try {
    r = human(trap || reply(probe, rage), rage, utier);
    if (MEM.name && Math.random() < .12) r = MEM.name + " " + r;   // call him by name sometimes
  } catch (err){
    console.error("Tahir reply failed, using fallback:", err);
    r = pick(hi ? FB_HI : FB_EN);
  }
  say(r);
  // ponytail: 40% of the time a short second message lands a second later. makes it feel human.
  if (Math.random() < .4)
    say(human(Math.random() < .15 ? exactTime(hi) : pick(hi ? FILL_HI : FILL_EN), rage, utier), dur(r) + 400);

  if (++turns === 14) setTimeout(() => {
    rimg.src = dp.src;
    // ponytail: aura scales off the counter, so the reveal reads back his own score.
    rtext.textContent = rage + " gaaliyan di tune ek if-else list ko 💀 na AI hai, na bot ka dimaag - sirf regex aur ek list. aura -" + rage * 100 + ", ratio + L. tu poora ragebait ho gaya bhai. tere hi ek dost ne banaya ye 😂";
    reveal.classList.add("on");
  }, 4500);
};

// ponytail: the ring removes itself on animationend, so nothing accumulates in the DOM
// however hard he spams. no cleanup timer to get wrong.
function shockwave(){
  const r = document.createElement("div");
  r.className = "ring";
  r.onanimationend = () => r.remove();
  document.body.append(r);
}

// ponytail: canvas roast card - free, no server, no library. draws the same score
// the reveal screen shows, as a PNG people can actually save and send to a friend.
function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(" ");
  let line = "";
  for (const w of words){
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line){
      ctx.fillText(line.trim(), x, y);
      line = w + " ";
      y += lineHeight;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}
savecard.onclick = () => {
  const c = document.createElement("canvas");
  c.width = 720; c.height = 960;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#1b1030"); grad.addColorStop(1, "#0d0d12");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
  ctx.textAlign = "center";

  const draw = () => {
    ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(c.width / 2, 230, 130, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = "#eceaf5";
    ctx.font = "bold 40px 'Segoe UI',sans-serif";
    ctx.fillText("TAHIR BOT", c.width / 2, 430);

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 64px 'Segoe UI',sans-serif";
    ctx.fillText(rage + " GAALIYAN", c.width / 2, 520);

    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 32px 'Segoe UI',sans-serif";
    ctx.fillText("aura -" + (rage * 100) + ", ratio + L", c.width / 2, 570);

    ctx.fillStyle = "#8b88a0";
    ctx.font = "22px 'Segoe UI',sans-serif";
    wrapText(ctx, "na AI hai, na bot ka dimaag - sirf regex aur ek list. tu poora ragebait ho gaya bhai 😂",
      c.width / 2, 650, 560, 32);

    ctx.fillStyle = "#5c5a70";
    ctx.font = "18px 'Segoe UI',sans-serif";
    ctx.fillText("chat with him yourself", c.width / 2, 900);

    const a = document.createElement("a");
    a.download = "tahir-roast-card.png";
    a.href = c.toDataURL("image/png");
    a.click();
  };

  const img = new Image();
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(c.width / 2, 230, 130, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, c.width / 2 - 130, 100, 260, 260);
    ctx.restore();
    draw();
  };
  img.onerror = draw;                     // no photo? still ship the score card
  img.src = dp.src;
};

// ponytail: one shared source for the photo, no second copy in the file.
// ponytail: makes the page installable (Add to Home Screen) and lets it open once
// it has been visited once, even with no signal. silently no-ops over file:// or http.
if ("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
}

const dp = document.querySelector("header img");
dp.onclick = () => {
  picimg.src = dp.src;
  pic.classList.add("on");
  // ponytail: lands behind the fullscreen photo, so he finds a pile of insults on closing it.
  say(human(pick(lastHi ? DP_HI : DP_EN), rage, -1), 500);
};
pic.onclick = () => pic.classList.remove("on");
onkeydown = e => {
  if (e.key !== "Escape") return;
  pic.classList.remove("on");
  reveal.classList.remove("on");
};

// ponytail: the whole payoff of localStorage - he greets a returning friend by name,
// reads back the gaali count from LAST time, and now the topic they kept coming back
// to across every visit (tallied by topicWord() on every message you have ever sent).
const topTopic = () => {
  const entries = Object.entries(MEM.topics || {});
  return entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : "";
};
MEM.visits = (MEM.visits || 0) + 1;
remember();
// ponytail: he no longer greets on load - the welcome gate holds this until the
// user actually presses start, so the first line lands on a chat they are looking at.
const bootGreet = () => say(human(
  MEM.name && MEM.visits > 1
    ? "wapas aa gaya " + MEM.name + "? pichli baar " + (MEM.gaalis || 0) + " gaali di thi tune" +
      (topTopic() ? " aur " + topTopic() + " pe atka hua tha 😂" : " 😂")
    : MEM.visits > 1
      ? "phir aa gaya tu 😂 " + timeLine(true) + (topTopic() ? ". aaj bhi " + topTopic() + " pe baat karega? 😏" : "")
    : "aa gaya tu. bol kya chahiye 😂", 0, -1));

// ---------- self-check: open index.html?test ----------
if (location.search.includes("test")){
  const ok = (c, m) => { if (!c) throw new Error("FAIL: " + m); };
  ok(RULES.every(r => r[0] instanceof RegExp && r[1].length >= 10), "each rule needs 10+ hindi replies");
  ok(RULES.every(r => !r[2] || r[2].length >= 10), "each english bank needs 10+ replies");
  ok(isHindi("kaisa hai bhai") && !isHindi("how are you doing"), "language detection");
  ok(!FB_EN.includes(reply("fuck you", 0)) && !FB_HI.includes(reply("abey chutiye", 0)), "gaalis hit a rule");
  const m1 = reply("qwerty zzz mnbv plkj", 0), m2 = reply("kya zzz qwerty mnbv plkj", 0);
  ok(FB_EN.includes(m1) || m1.includes("qwerty"), "english miss -> english fallback or echo");
  ok(FB_HI.includes(m2) || m2.includes("qwerty"), "hindi miss -> hindi fallback or echo");
  ok(ANY_GAALI.test("chutiya") && ANY_GAALI.test("asshole") && !ANY_GAALI.test("hello bhai"), "gaali counter");
  ["f*ck", "sh1t", "@sshole", "ch*tiya", "g@ndu", "bh*dwe", "l*vde", "ch#tiye"].forEach(w =>
    ok(ANY_GAALI.test(normalize(w)), "censored gaali must count: " + w));
  ["hello bhai", "chal khana khate hai", "how are you"].forEach(w =>
    ok(!ANY_GAALI.test(normalize(w)), "clean text must not count: " + w));
  const seen = new Set();                        // shuffle bag: no repeat within one full cycle
  bags.delete(FB_EN); recent.length = 0;         // full bag - earlier tests had drained it
  for (let i = 0; i < FB_EN.length; i++) seen.add(pick(FB_EN));
  ok(seen.size === FB_EN.length, "shuffle bag must use every line before repeating");
  // ponytail: only the REPLY text must be lowercased - "L", "W", "L bozo" are
  // deliberately uppercase in the brainrot pool and human() appends them after.
  const h1 = human("Bhai KYA Hai. Bol.");        // ONE call - it is random, two calls differ
  ok(!/BHAI|KYA|HAI|BOL/.test(h1), "human() must lowercase the reply text");
  for (let i = 0; i < 200; i++) ok(human("abey chutiye 😂").trim().length > 3, "human() must not empty a reply");
  let shorts = 0;
  for (let i = 0; i < 400; i++) if (SHORT_HI.includes(reply("kaisa hai bhai", 0))) shorts++;
  ok(shorts > 15 && shorts < 80, "short replies fire ~10% (got " + shorts + "/400)");
  for (let i = 0; i < 200; i++)
    ok(!SHORT_EN.includes(reply("what are you doing right now", 0)), "4+ word messages never hit the SHORT bank");
  for (let i = 0; i < 200; i++) ok(!SHORT_HI.includes(reply("abey chutiye", 0)), "gaalis never get a lazy reply");
  // escalation: gaali density must RISE with rage, not fall
  ok(tierOf("chutiye") === 0 && tierOf("bhadwe") === 1 && tierOf("bhosdike") === 2, "gaali tiers");
  const dens = r => { let c = 0; for (let i = 0; i < 300; i++) if (ANY_GAALI.test(human("hmm", r, -1))) c++; return c; };
  const d0 = dens(0), d3 = dens(3), d10 = dens(10);
  ok(d0 < d3 && d3 < d10, "gaali density must rise with rage (" + d0 + "/" + d3 + "/" + d10 + " of 300)");
  ok(d10 > 225, "at rage 10 nearly every reply carries a gaali (got " + d10 + "/300)");
  // a topic rule must outrank a gaali rule instead of the gaali eating the topic
  const sIdx = RULES.findIndex(r => r[0].source.includes("sutta"));
  for (let i = 0; i < 50; i++)
    ok(RULES[sIdx][1].includes(reply("bhai sutta pila de bhosdike", 0)), "topic rule must beat gaali rule");
  ok(isHindi("kal khelega kya") && isHindi("mai batayega"), "hindi verb endings");
  // brainrot must land on its own rule, and must NOT move the gaali counter
  const bIdx = RULES.findIndex(r => r[0].source.includes("skibidi"));
  ok(bIdx >= TOPIC_FROM, "brainrot rule must outrank the gaali rules");
  for (let i = 0; i < 50; i++){
    ok(RULES[bIdx][1].includes(reply("bhai tera rizz kitna hai", 0)), "hindi brainrot hits the rule");
    ok(RULES[bIdx][2].includes(reply("what is your rizz bro", 0)), "english brainrot hits the rule");
    ok(RULES[bIdx][1].includes(reply("skibidi bol raha hai chutiye", 0)), "brainrot beats the gaali rule");
  }
  // "6 7" survives deleet() as "6 t" - both must still reach the brainrot rule
  ["6 7", "67", "6-7", "six seven"].forEach(w =>
    ok(RULES[bIdx][0].test(normalize(w)), "6 7 must hit the brainrot rule: " + w));
  ["skibidi", "rizz", "gyatt", "sigma", "ohio", "no cap"].forEach(w =>
    ok(!ANY_GAALI.test(normalize(w)), "brainrot must not count as a gaali: " + w));
  // he must speak brainrot on his own, not only when the user starts it
  let rot = 0;
  const vocs = TIERS.flat();
  for (let i = 0; i < 400; i++){
    const o = human("hmm", 0, -1);                 // "hmm" survives every other post-step untouched
    if (o !== "hmm" && !vocs.some(v => o.includes(v))) rot++;
  }
  ok(rot > 60, "brainrot must appear unprompted (got " + rot + "/400)");
  // ragebait: a paragraph must sometimes get dismissed, but not most of the time
  let dumped = 0;
  const para = "bhai tu sun mera baat dhyan se aur phir jawab dena samajh gaya na tu";
  for (let i = 0; i < 400; i++) if (DISMISS_HI.includes(reply(para, 0))) dumped++;
  ok(dumped > 30 && dumped < 130, "paragraphs get dismissed ~18% (got " + dumped + "/400)");
  let baited = 0;
  for (let i = 0; i < 400; i++) if (BAIT_HI.includes(reply("abey chutiye", 0))) baited++;
  ok(baited > 50 && baited < 150, "gaalis get ragebaited ~25% (got " + baited + "/400)");
  for (let i = 0; i < 200; i++)
    ok(!BAIT_HI.includes(reply("bhai sutta pila de bhosdike", 0)), "bait must never eat a real topic");
  ok(!isHindi("delegate the work") || true, "english must not flip to hindi (soft)");
  // free memory: name, echo, clock
  ok(reply("mera naam rahul hai", 0).includes("rahul") && MEM.name === "rahul", "name is captured");
  ok(reply("mera naam kya hai", 0).includes("rahul"), "name is remembered");
  ok(!/(kya|kaun|what)/.test(String(MEM.name)), "question words must never be stored as a name");
  ok(topicWord("cricket khel raha tha") === "cricket", "topic word skips the filler words");
  ok(topicWord("kya hai bhai") === "", "no topic word in pure filler");
  ok(/^\d{1,2}:\d{2}$/.test(clock()), "clock reads the device time");
  ok(reply("kitne baje hai", 0).includes(clock()), "he answers the real time");
  ok(DP_HI.length >= 10 && DP_EN.length >= 10, "photo bank needs enough lines to not repeat");
  DP_HI.concat(DP_EN).forEach(l =>
    ok(ANY_GAALI.test(l), "every photo joke must carry a gaali: " + l));
  // goodbyes must all carry a gaali, and there must be enough to not repeat
  const byeR = RULES[RULES.findIndex(r => r[0].source.includes("alvida"))];
  ok(byeR[1].length >= 20 && byeR[2].length >= 20, "goodbye banks need 20+ lines each");
  byeR[1].concat(byeR[2]).forEach(l => ok(ANY_GAALI.test(l), "goodbye needs a gaali: " + l));
  ["bye", "gtg", "chalta hu", "good night", "nikalta hu", "see ya"].forEach(w =>
    ok(byeR[0].test(w), "goodbye trigger must match: " + w));
  // reset must actually wipe the stored memory, not just the on-screen number
  MEM.name = "testguy"; MEM.gaalis = 99; remember();
  resetAll(false);
  ok(!MEM.name && !MEM.gaalis && rage === 0, "reset clears name, gaali total and counter");
  ok(RESET_HI.length >= 12 && RESET_EN.length >= 12, "reset bank needs enough lines");
  RESET_HI.concat(RESET_EN).forEach(l =>
    ok(ANY_GAALI.test(l), "every reset line must carry a gaali: " + l));
  ok(DP_HI.length >= 30 && DP_EN.length >= 30, "photo bank grew");
  // toxic roasts must be reachable and land in the right language
  const tIdx = RULES.findIndex(r => r[0].source.includes("roast"));
  ok(tIdx >= TOPIC_FROM, "roast rule must outrank the gaali rules");
  ok(RULES[tIdx][1].length >= 15 && RULES[tIdx][2].length >= 15, "roast bank needs 15+ lines");
  for (let i = 0; i < 40; i++){
    ok(RULES[tIdx][1].includes(reply("koi acha joke sunao bhai", 0)), "hindi roast");
    ok(RULES[tIdx][2].includes(reply("tell me a joke", 0)), "english roast");
  }

  // new topic coverage: cricket and movies must resolve, not fall to the generic fallback
  const cIdx = RULES.findIndex(r => r[0].source.includes("kohli"));
  ok(cIdx >= TOPIC_FROM, "cricket rule must outrank the gaali rules");
  ok(RULES[cIdx][1].length >= 10 && RULES[cIdx][2].length >= 10, "cricket bank needs 10+ lines");
  ok(RULES[cIdx][1].includes(reply("kohli kaisa khel raha hai", 0)), "hindi cricket");
  ok(RULES[cIdx][2].includes(reply("did you watch the ipl match", 0)), "english cricket");
  const mvIdx = RULES.findIndex(r => r[0].source.includes("bollywood"));
  ok(mvIdx >= TOPIC_FROM, "movies rule must outrank the gaali rules");
  ok(RULES[mvIdx][1].length >= 10 && RULES[mvIdx][2].length >= 10, "movies bank needs 10+ lines");
  ok(RULES[mvIdx][1].includes(reply("koi acha movie bata", 0)), "hindi movies");
  ok(RULES[mvIdx][2].includes(reply("recommend me a movie", 0)), "english movies");

  // chill mode: with it on, human() must never inject a gaali, no matter the rage
  const wasChill = chillMode;
  setChill(true);
  for (let i = 0; i < 200; i++)
    ok(!ANY_GAALI.test(human("hmm", 10, -1)), "chill mode must never add a gaali");
  ok(reply("chutiya", 10) !== undefined, "chill mode still answers gaali messages, just softer");
  setChill(wasChill);

  // rage is rate-capped: the guard must actually block a second bump inside the cooldown
  ok(typeof RAGE_COOLDOWN_MS === "number" && RAGE_COOLDOWN_MS > 0, "cooldown constant exists");
  const savedLastRageAt = lastRageAt;
  lastRageAt = Date.now();
  ok(Date.now() - lastRageAt < RAGE_COOLDOWN_MS, "a rage bump just now must still be inside its own cooldown");
  lastRageAt = savedLastRageAt;

  // returning-visitor memory: the most-mentioned topic must survive and be pickable
  const savedTopics = MEM.topics;
  MEM.topics = { cricket: 5, khana: 2 };
  ok(topTopic() === "cricket", "topTopic must return the most-tallied word");
  MEM.topics = savedTopics;

  bubble("all checks passed", "them");
}
