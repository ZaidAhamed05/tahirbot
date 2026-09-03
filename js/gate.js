
// ═══════════════════════════════════════════════════════════════════════════
// WELCOME GATE — the 3D shrine you land on before the chat opens.
// ponytail: everything below only decorates. the chat underneath is already
// wired and working, so if any of this throws, start() still fires from the
// catch and the app opens exactly like it used to.
// ═══════════════════════════════════════════════════════════════════════════

// The text banks (WELCOME / POKES / BADGES / CTAS / SOFTS / FINES / CHIPS)
// live in gate-lines.js, which loads first. Data there, behaviour here.

(() => {
  const gate = document.getElementById("gate");
  if (!gate) return;
 try {

  const SOFT = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rig = document.getElementById("rig");
  let opened = false;

  // ---- his face, straight off the header. one source for the photo, no second copy.
  const roll = list => list[Math.floor(Math.random() * list.length)];

  gimg.src = dp.src;
  gimg2.src = dp.src;          // the coin's far face is the same photo
  gvisits.textContent = MEM.visits || 1;
  ggaali.textContent = MEM.gaalis || 0;

  // ponytail: every string on this screen is rolled fresh on each open, so two people
  // opening the same link - or the same person refreshing - never get the same shrine.
  // Math.random() and not MEM, so it never goes sticky on one device.
  gbadge.textContent = roll(BADGES);
  gcta.textContent   = roll(CTAS);
  gsoft.textContent  = roll(SOFTS);
  gfine.textContent  = roll(FINES);
  gchip.textContent  = roll(CHIPS);
  // the orbit takes a random speed too, so even the motion is never identical twice
  rig.style.setProperty("--spin", (11 + Math.random() * 9).toFixed(1) + "s");

  // ---- tiny WebAudio synth. no files to load, no assets to cache, works offline.
  let ac;
  const bleep = (freq, dur, type, gain) => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sawtooth";
      o.frequency.setValueAtTime(freq, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq * .35, ac.currentTime + dur);
      g.gain.setValueAtTime(gain || .07, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch (e) {}                                   // muted device, blocked context - who cares
  };
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  // ---- the welcome line, typed out one beat at a time -------------------------
  const line = roll(WELCOME);
  const caret = document.querySelector(".caret");
  let typer = 0;

  function type(el, text, speed, done){
    if (SOFT){ el.textContent = text; done && done(); return; }   // no motion? show it whole
    let i = 0;
    typer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i % 3 === 0) bleep(160 + Math.random() * 90, .03, "square", .012);
      if (i >= text.length){ clearInterval(typer); done && done(); }
    }, speed);
  }
  // ponytail: the boot intro (intro.js) covers this shrine while it plays and #gate
  // stays display:none behind it - so the typewriter holds here and starts the moment
  // the overlay lifts. if that script never runs, the timer below cuts it loose:
  // a dead splash must never lock the gate shut.
  const startTyping = () => {
    type(g1, line[0], 26, () => setTimeout(() => {            // the pause IS the punchline
      type(g2, " " + line[1], 22, () => caret.classList.add("done"));
    }, 620));
    // focus was attempted while the gate was display:none (a no-op) - grab it again
    setTimeout(() => { try { document.getElementById("start").focus({ preventScroll: true }); } catch (e) {} }, 150);
  };
  if (document.body.classList.contains("intro")){
    const iv = setInterval(() => {
      if (!document.body.classList.contains("intro")){ clearInterval(iv); startTyping(); }
    }, 100);
    // fail open: only fires when intro.js itself never ran - the full word bank
    // takes ~11s at a readable pace, so this sits well past that.
    setTimeout(() => {
      if (!document.body.classList.contains("intro")) return;
      clearInterval(iv);
      const ov = document.getElementById("intro"); if (ov) ov.remove();
      document.body.classList.remove("intro");
      startTyping();
    }, 15000);
  } else {
    startTyping();
  }

  // ---- parallax: the rig leans toward wherever you are ------------------------
  // ponytail: writing two CSS vars is a compositor-only change, so this stays at
  // 60fps on a phone. rAF-throttled so a fast swipe cannot queue up a hundred writes.
  let raf = 0, tx = 0, ty = 0;
  const lean = () => {
    rig.style.setProperty("--ry", tx.toFixed(2) + "deg");
    rig.style.setProperty("--rx", ty.toFixed(2) + "deg");
  };

  // ---- the background talks back ---------------------------------------------
  // the floating emojis scatter when the cursor gets close, and the cursor itself
  // leaves a tiny fading spark as it crosses the shrine. each emoji is two layers
  // - drift animation on the <b> glyph, scatter on the <i> wrapper - so the push
  // can never fight the drift. measured lazily: the gate is display:none behind
  // the intro at load, where getBoundingClientRect reads all zeroes.
  let mx = -9999, my = -9999, lastSpark = 0;
  const toons = [...gate.querySelectorAll(".toons i")].map(el => ({ el, x: 0, y: 0 }));
  let tReady = !toons.length;
  const measure = () => {
    const box = [];
    for (const t of toons){
      const r = t.el.getBoundingClientRect();
      if (!r.width && !r.height) return;             // gate still hidden - try again later
      box.push(r);
    }
    for (let i = 0; i < toons.length; i++){
      toons[i].x = box[i].left + box[i].width / 2;
      toons[i].y = box[i].top + box[i].height / 2;
    }
    tReady = true;
  };
  const scatter = () => {
    if (SOFT) return;
    if (!tReady) measure();
    if (!tReady) return;
    for (const t of toons){
      const dx = t.x - mx, dy = t.y - my;
      const d = Math.hypot(dx, dy);
      // d under ~18px = the cursor is ON the emoji, so hover gets to own it
      const push = d > 18 && d < 160 ? (1 - d / 160) * 32 : 0;
      t.el.style.transform = push
        ? "translate3d(" + (dx / d * push).toFixed(1) + "px," + (dy / d * push).toFixed(1) + "px,0)"
        : "";
    }
  };
  const spark = () => {
    if (SOFT || mx < 0) return;
    const now = performance.now();
    if (now - lastSpark < 70) return;                // a slow trail, not confetti
    lastSpark = now;
    const s = document.createElement("i");
    s.className = "speck";
    const r = 2 + Math.random() * 5;
    s.style.left = (mx + Math.random() * 16 - 8) + "px";
    s.style.top  = (my + Math.random() * 16 - 8) + "px";
    s.style.width = s.style.height = r.toFixed(1) + "px";
    s.style.background = Math.random() < .5 ? "rgba(167,139,250,.9)" : "rgba(244,63,94,.85)";
    s.onanimationend = () => s.remove();
    gate.append(s);
  };
  const frame = () => { raf = 0; lean(); scatter(); spark(); };
  const queue = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const aim = (x, y) => {
    if (SOFT) return;
    tx = (x / innerWidth - .5) * 44;                 // left/right -> yaw
    ty = (.5 - y / innerHeight) * 26;                // up/down    -> pitch
    queue();
  };
  addEventListener("resize", () => { tReady = false; });
  gate.addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    aim(e.clientX, e.clientY);
  });
  gate.addEventListener("pointerleave", () => {
    tx = ty = 0; mx = my = -9999;
    for (const t of toons) t.el.style.transform = "";
    queue();
  });
  // phone tilt, where the browser hands it over without a permission prompt
  addEventListener("deviceorientation", e => {
    if (SOFT || e.gamma == null) return;
    tx = Math.max(-30, Math.min(30, e.gamma));
    ty = Math.max(-20, Math.min(20, (e.beta || 0) - 40));
    queue();
  });


  // ---- poke his face ----------------------------------------------------------
  let pokeTimer;
  core.onclick = () => {
    core.classList.remove("poked"); void core.offsetWidth; core.classList.add("poked");
    rig.classList.add("held");                    // he stops dead while you poke him -
    setTimeout(() => rig.classList.remove("held"), 900);   // you can't hover a moving target
    poke.textContent = roll(POKES);
    poke.classList.add("on");
    bleep(90, .18, "square", .05); buzz(30);
    clearTimeout(pokeTimer);
    pokeTimer = setTimeout(() => poke.classList.remove("on"), 2600);
  };

  // ---- opening the door -------------------------------------------------------
  function start(chill){
    if (opened) return;
    opened = true;
    clearInterval(typer);
    if (chill && !chillMode){                        // "chill mode se shuru karo"
      setChill(true);
      window.chill.classList.add("on");
    }
    bleep(chill ? 300 : 130, .5, chill ? "sine" : "sawtooth", .09);
    buzz(chill ? 20 : [18, 40, 24]);
    gate.classList.add("off");
    const reveal = () => {
      document.body.classList.add("started");
      bootGreet();                                   // the real chat greeting, held until now
      if (innerHeight > 620) box.focus({ preventScroll: true });
      if (!chill) shockwave();                       // same ring a gaali fires. sets the tone.
    };
    // ponytail: reduced motion and the ?test self-check swap straight over - only
    // a real visitor gets the full stage change.
    if (SOFT || location.search.includes("test")){ reveal(); return; }
    // a stage curtain slams across the shrine, then pulls away to reveal the chat
    // mid-entrance: reveal() fires while the curtain is fully closed, so the panel
    // rise, the face pop and the beam sweep all play as the curtain parts.
    const c = document.createElement("div");
    c.className = "curtain";
    c.setAttribute("aria-hidden", "true");
    document.body.append(c);
    setTimeout(reveal, 220);                         // chat starts rising behind the curtain
    setTimeout(() => c.classList.add("part"), 330); // curtain pulls away over the rise
    if (!chill) setTimeout(() => {                   // a white blink as it parts
      const fl = document.createElement("div");
      fl.className = "flash";
      fl.onanimationend = () => fl.remove();
      document.body.append(fl);
    }, 360);
    setTimeout(() => { try { c.remove(); } catch (e) {} }, 880);
  }

  document.getElementById("start").onclick = () => start(false);
  document.getElementById("softstart").onclick = () => start(true);
  // enter/space from anywhere on the gate opens it too
  gate.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target === gate) start(false);
  });
  gate.tabIndex = -1;

  // ponytail: autofocus on the chat input steals focus behind the gate, which means the
  // phone keyboard pops up under a screen you cannot type into. take it back.
  box.blur();
  setTimeout(() => { try { document.getElementById("start").focus({ preventScroll: true }); } catch (e) {} }, 60);

  // ?test skips the whole shrine so the self-check below runs against a live chat
  if (location.search.includes("test")) start(false);

 } catch (e){
  // ponytail: the gate is the ONLY thing between the user and the chat. if any of
  // the decoration above dies, a dead start button locks them out of a working app
  // forever - so on any failure we tear the gate down and drop them straight in.
  console.error("gate failed, opening the chat directly:", e);
  gate.remove();
  document.body.classList.add("started");
  try { bootGreet(); } catch (err){}
 }
})();
