// ═══════════════════════════════════════════════════════════════════════════
// MOTION WIRING — the JS half of the motion pass.
// Everything here is additive: it wraps the functions that already exist
// (say / bubble / shockwave) instead of editing their call sites, so every
// path that already spoke or raged picks the new feedback up for free.
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const SOFT = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // ---- a light that follows your finger around the room ----------------------
  // ponytail: two CSS vars written inside one rAF. no layout read, no repaint -
  // the gradient layer is composited, so this stays free even mid-scroll.
  if (!SOFT){
    let px = 0, py = 0, queued = false, lastSpark = 0;
    // the room keeps talking after the gate opens: the chat-side floaters dodge
    // the cursor (drift on <b>, scatter on <i> - same split as the gate) and the
    // cursor leaves a fading spark trail across the background layer. decoration
    // only - sealed, because a throw here must never eat a reply.
    const room = document.querySelector(".toonsbg");
    const chatToons = room ? [...room.querySelectorAll("i")].map(el => ({ el, x: 0, y: 0 })) : [];
    const bgEl = document.querySelector(".bg");
    let ready = !chatToons.length;
    const measure = () => {
      const box = [];
      for (const t of chatToons){
        const r = t.el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        box.push(r);
      }
      for (let i = 0; i < chatToons.length; i++){
        chatToons[i].x = box[i].left + box[i].width / 2;
        chatToons[i].y = box[i].top + box[i].height / 2;
      }
      ready = true;
    };
    const scatter = () => {
      if (!body.classList.contains("started")) return;
      if (!ready) measure();
      if (!ready) return;
      for (const t of chatToons){
        const dx = t.x - px, dy = t.y - py;
        const d = Math.hypot(dx, dy);
        const push = d > 18 && d < 150 ? (1 - d / 150) * 24 : 0;   // d<18: cursor ON it
        t.el.style.transform = push
          ? "translate3d(" + (dx / d * push).toFixed(1) + "px," + (dy / d * push).toFixed(1) + "px,0)"
          : "";
      }
    };
    const spark = () => {
      if (!bgEl || !body.classList.contains("started")) return;
      const now = performance.now();
      if (now - lastSpark < 80) return;
      lastSpark = now;
      const s = document.createElement("u");
      s.className = "speck";
      const r = 2 + Math.random() * 4;
      s.style.left = (px + Math.random() * 16 - 8) + "px";
      s.style.top  = (py + Math.random() * 16 - 8) + "px";
      s.style.width = s.style.height = r.toFixed(1) + "px";
      s.style.background = Math.random() < .5 ? "rgba(167,139,250,.7)" : "rgba(244,63,94,.65)";
      s.onanimationend = () => s.remove();
      bgEl.append(s);
    };
    const move = () => {
      queued = false;
      body.style.setProperty("--mx", px + "px");
      body.style.setProperty("--my", py + "px");
      try { scatter(); } catch (e){ console.error("chat scatter failed:", e); }
      try { spark(); } catch (e){ console.error("chat spark failed:", e); }
    };
    addEventListener("resize", () => { ready = false; });
    addEventListener("pointermove", e => {
      px = e.clientX; py = e.clientY;
      body.classList.add("pointer");
      if (!queued){ queued = true; requestAnimationFrame(move); }
    }, { passive: true });
  }

  // ---- one crack of lightning per gaali --------------------------------------
  // hangs off the existing shockwave(), so there is still exactly ONE trigger
  // point for "he just got sworn at" rather than two that can drift apart.
  const _shock = window.shockwave;   // explicit: these are globals from app.js
  window.shockwave = function(){
    _shock.apply(this, arguments);
    // ponytail: this runs inside the send handler, BEFORE he replies. if a bit of
    // decoration in here ever throws it would eat the reply, so it is sealed off.
    try {
      if (SOFT) return;
      const fl = document.createElement("div");
      fl.className = "flash";
      fl.onanimationend = () => fl.remove();
      body.append(fl);
      meter.classList.add("bump");
      setTimeout(() => meter.classList.remove("bump"), 190);
    } catch (e){ console.error("flash failed:", e); }
  };

  // ---- he leans in when he lands a line --------------------------------------
  // wrapping bubble() covers EVERY path that speaks - replies, the boot greeting,
  // the reset line, the photo joke - with no call sites left to keep in sync.
  const _bubble = window.bubble;
  window.bubble = function(text, who){
    const out = _bubble.apply(this, arguments);   // the message lands first, always
    try {
      if (who === "them" && !SOFT){
        dp.classList.remove("said"); void dp.offsetWidth; dp.classList.add("said");
      }
    } catch (e){ console.error("nod failed:", e); }
    return out;
  };

  // ---- "typing" is a whole-app state, not just a word in the header ----------
  // ponytail: the dots element IS the state, so watch for it instead of trying to
  // re-derive say()'s two nested timeouts. cannot drift out of sync by design.
  new MutationObserver(() => {
    body.classList.toggle("typing", !!chat.querySelector(".dots"));
  }).observe(chat, { childList: true });

  // ---- the composer: loaded, then fired --------------------------------------
  const sendBtn = f.querySelector("button");
  const armed = () => f.classList.toggle("armed", box.value.trim().length > 0);
  box.addEventListener("input", armed);
  armed();

  // ---- every send pops a handful of emoji out of the button -----------------
  // ponytail: transform/opacity only and each particle removes itself - even the
  // heaviest send only costs a few short-lived spans for under a second. sealed,
  // because this runs inside the submit path before he replies.
  const POOL = ["💀", "🔥", "💥", "⚡", "😤", "🖕", "👊", "💢", "😂", "😡"];
  const burst = () => {
    try {
      const r = sendBtn.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let k = 0; k < 7; k++){
        const p = document.createElement("i");
        p.className = "burst";
        p.textContent = POOL[Math.floor(Math.random() * POOL.length)];
        p.style.left = cx + "px";
        p.style.top = cy + "px";
        p.style.fontSize = (11 + Math.random() * 9) + "px";
        p.style.setProperty("--dx", (Math.random() * 170 - 85) + "px");
        p.style.setProperty("--dy", -(55 + Math.random() * 115) + "px");
        p.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
        p.style.animationDelay = (Math.random() * 80) + "ms";
        p.onanimationend = () => p.remove();
        body.append(p);
      }
    } catch (e){ console.error("burst failed:", e); }
  };

  f.addEventListener("submit", () => {
    f.classList.remove("armed");
    if (!sendBtn || SOFT) return;
    sendBtn.classList.remove("sent"); void sendBtn.offsetWidth; sendBtn.classList.add("sent");
    setTimeout(() => sendBtn.classList.remove("sent"), 460);
    burst();
  });

  // ---- poke any of his bubbles and it recoils --------------------------------
  // ponytail: ONE delegated listener on the scroller, not one per bubble. the chat
  // trims itself to 60 nodes and this still stays at exactly 1 listener forever.
  chat.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".them");
    if (!b || SOFT) return;
    b.classList.remove("wob"); void b.offsetWidth; b.classList.add("wob");
    try { navigator.vibrate && navigator.vibrate(12); } catch (err) {}
  });

  // ---- the wordmark drops in one character at a time -------------------------
  // the skill's Complex stagger tier, done with spans instead of SplitText.
  // "BOT" stays a single unit so its gradient background-clip survives.
  const wm = document.querySelector(".wordmark");
  if (wm && !SOFT){
    let i = 0;
    [...wm.childNodes].forEach(n => {
      if (n.nodeType === 3){                                   // plain text -> per char
        const frag = document.createDocumentFragment();
        for (const c of n.textContent){
          const s = document.createElement("span");
          s.className = "ch"; s.textContent = c;
          s.style.animationDelay = (i++ * 55 + 140) + "ms";
          frag.append(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1){                            // the gradient span
        n.classList.add("ch");
        n.style.animationDelay = (i++ * 55 + 140) + "ms";
      }
    });
  }

  // ---- the ripple that fires out of wherever you hit start -------------------
  const st = document.getElementById("start");
  if (st && !SOFT) st.addEventListener("pointerdown", e => {
    const r = document.createElement("div");
    r.className = "ripple";
    r.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    r.onanimationend = () => r.remove();
    body.append(r);
  });
})();
