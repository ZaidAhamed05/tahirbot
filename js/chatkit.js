// ═══════════════════════════════════════════════════════════════════════════
// CHATKIT — engagement layer for the chat itself.
//   · starter chips you can tap instead of typing
//   · double-tap his line to stamp a reaction on it
//   · a milestone banner each time his rage crosses a tier
//   · jump-to-latest with an unread count
// Additive only. Every hook is wrapped, because nothing in here is allowed to
// cost a reply — the same lesson the rage block in app.js learned the hard way.
// ═══════════════════════════════════════════════════════════════════════════

// tap-to-send openers. mixed hindi/english so the first tap also picks his language.
const STARTERS = [
  "abey chutiye", "tera baap", "roast me", "kaisa hai bhai", "sutta pila de",
  "bhosdike", "tell me a joke", "khana khaya?", "tu kya karta hai", "bakwas mat kar",
  "kohli kaisa khela", "recommend a movie", "tera rizz kitna hai", "bhai ek shayari sunao",
  "fuck you", "tu chutiya hai", "kitne baje hai", "gaali de mujhe", "aur bata",
  "mera naam bata", "skibidi", "tu bot hai na?", "sach bol tu kaun hai", "bore ho raha hu"
];

// crossed thresholds, loudest last. checked against the live rage counter.
const TIERS_UI = [
  [3,  "😤", "WARMING UP"],
  [6,  "🔥", "RAGE MODE ON"],
  [10, "💀", "CERTIFIED BHOSDIKE"],
  [15, "☠️", "HE HATES YOU NOW"],
  [20, "🌋", "AURA -2000"],
  [25, "👹", "MAXIMUM BEZZATI"]
];

(() => {
 // ponytail: the whole layer is optional. it renders on top of a chat that already
 // works, so one bad assumption in here must never take the app down with it.
 try {
  const SOFT = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const app = document.querySelector(".app");
  if (!app || !chat || !f || !f.parentNode) return;

  // ── starter chips ─────────────────────────────────────────────────────────
  const bar = document.createElement("div");
  bar.className = "starters";
  f.parentNode.insertBefore(bar, f);              // sits directly above the composer

  // ponytail: draw WITHOUT replacement from a shuffled copy, so the four chips on
  // screen are always four different openers - picking 4 at random independently
  // hands you the same line twice often enough to look broken.
  const deal = () => {
    const pool = STARTERS.slice();
    bar.textContent = "";
    for (let i = 0; i < 4 && pool.length; i++){
      const b = document.createElement("b");
      b.textContent = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      b.tabIndex = 0;
      bar.append(b);
    }
  };
  deal();
  const fire = text => {
    box.value = text;
    // requestSubmit runs the real submit handler, so a chip goes through exactly
    // the same path a typed message does - counter, rules, rage, everything.
    if (f.requestSubmit) f.requestSubmit(); else f.onsubmit({ preventDefault(){} });
    deal();
  };
  bar.addEventListener("click", e => {
    if (e.target.tagName === "B") fire(e.target.textContent);
  });
  bar.addEventListener("keydown", e => {
    if (e.target.tagName === "B" && (e.key === "Enter" || e.key === " ")){
      e.preventDefault(); fire(e.target.textContent);
    }
  });
  // once he is angry the openers get meaner
  const HOT = ["aur bol", "itna hi hai?", "ro mat", "chal aur gaali de", "haar gaya kya",
               "is that all", "keep crying", "mujhe aur gaali de", "tu thak gaya?"];
  const _dealHot = () => {
    if (typeof rage !== "number" || rage < 6) return;
    const b = bar.firstElementChild;
    if (b) b.textContent = HOT[Math.floor(Math.random() * HOT.length)];
  };

  // ── double-tap his line to react ──────────────────────────────────────────
  const RX = ["💀", "😂", "🔥", "😭", "🤡", "👀", "🫡", "😐"];
  let lastTap = 0, lastNode = null;
  chat.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".them");
    if (!b) return;
    const now = Date.now();
    if (b === lastNode && now - lastTap < 400){     // double tap
      lastTap = 0;
      const emoji = RX[Math.floor(Math.random() * RX.length)];
      let tag = b.querySelector(".rx");
      if (!tag){ tag = document.createElement("span"); tag.className = "rx"; b.append(tag); }
      tag.textContent = emoji;
      if (!SOFT){
        const fly = document.createElement("div");
        fly.className = "rxfly";
        fly.textContent = emoji;
        const r = b.getBoundingClientRect();
        fly.style.left = (r.right - 26) + "px";
        fly.style.top  = (r.bottom - 26) + "px";
        fly.onanimationend = () => fly.remove();
        document.body.append(fly);
      }
      try { navigator.vibrate && navigator.vibrate(18); } catch (err) {}
    } else { lastTap = now; lastNode = b; }
  });

  // ── rage milestones ───────────────────────────────────────────────────────
  let shown = -1;
  const milestone = () => {
    if (typeof rage !== "number") return;
    for (let i = TIERS_UI.length - 1; i >= 0; i--){
      const [at, icon, label] = TIERS_UI[i];
      if (rage >= at && i > shown){
        shown = i;
        const t = document.createElement("div");
        t.className = "tier";
        t.innerHTML = "";
        const em = document.createElement("em"); em.textContent = icon;
        const sp = document.createElement("span"); sp.textContent = label;
        t.append(em, sp);
        t.onanimationend = () => t.remove();
        app.append(t);
        try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch (err) {}
        return;
      }
    }
  };

  // ponytail: rage goes back to 0 on a reset, but `shown` kept its high-water mark -
  // so after one reset the banners never fired again for the rest of the session. wrap
  // resetAll the same way motion.js wraps bubble(): one hook, no call site to keep in sync.
  const _reset = window.resetAll;
  if (typeof _reset === "function") window.resetAll = function(){
    const out = _reset.apply(this, arguments);       // the real reset happens first, always
    try { shown = -1; unread = 0; jn.textContent = ""; sync(); }
    catch (e){ console.error("milestone reset failed:", e); }
    return out;
  };

  // ── jump to latest, with an unread count ──────────────────────────────────
  const jump = document.createElement("button");
  jump.className = "jump";
  jump.type = "button";
  const jn = document.createElement("u");
  const ji = document.createElement("i"); ji.textContent = "↓";
  jump.append(ji, jn);
  jump.setAttribute("aria-label", "jump to latest message");
  app.append(jump);
  let unread = 0;
  const atBottom = () => chat.scrollHeight - chat.scrollTop - chat.clientHeight < 60;
  const sync = () => {
    if (atBottom()){ unread = 0; jn.textContent = ""; jump.classList.remove("on"); }
    else jump.classList.add("on");
  };
  chat.addEventListener("scroll", sync, { passive: true });
  jump.onclick = () => { chat.scrollTop = chat.scrollHeight; unread = 0; jn.textContent = ""; sync(); };

  // ── one observer drives milestones + unread, off the DOM the chat already writes
  new MutationObserver(muts => {
    try {
      for (const m of muts)
        for (const n of m.addedNodes)
          if (n.classList && n.classList.contains("them") && !atBottom()) unread++;
      if (unread) jn.textContent = unread > 9 ? "9+" : unread;
      sync();
      milestone();
      _dealHot();
    } catch (e){ console.error("chatkit tick failed:", e); }
  }).observe(chat, { childList: true });
 } catch (e){ console.error("chatkit disabled:", e); }
})();
