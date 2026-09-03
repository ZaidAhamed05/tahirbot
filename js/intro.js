// ═══════════════════════════════════════════════════════════════════════════
// BOOT INTRO — the pre-gate word-slam. Every site entry runs the adjective
// bank one slam at a time and signs off with a middle finger, then lifts to
// reveal the shrine behind it.
// ponytail: same fail-open deal as gate.js. this file only decorates - if it
// throws or never runs, gate.js cuts the overlay loose on its own timer and
// the chat opens exactly like it used to.
// ═══════════════════════════════════════════════════════════════════════════

(() => {
  const ov = document.getElementById("intro");
  if (!ov) return;
  const body = document.body;
  const wordEl = ov.querySelector(".iword");
  const SOFT = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // the whole bank, in the order he slams it. each word is one hit.
  const WORDS = ["Amazing", "Fantastic", "Terrific", "Wonderful", "Great",
    "Exceptional", "Outstanding", "Superb", "Extraordinary", "Impressive",
    "Breathtaking", "Phenomenal", "Stunning", "Magnificent", "Astounding",
    "Mind-Blowing", "Epic", "Dope", "Legendary"];
  const GAP = 250;        // ms per word - a quarter second: fast, but still readable
  const DWELL = 300;      // a touch longer on LEGENDARY before the finger
  const HOLD = 1000;      // the finger gets its moment (450 if you skipped here)

  let ac = null, timers = [], finished = false, fingerOn = false, skipped = false;

  // tiny WebAudio kick - one shared context, silent on failure (muted/blocked)
  const thud = (freq, gain, dur) => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(Math.max(24, freq * .45), ac.currentTime + dur);
      g.gain.setValueAtTime(gain, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.0003, ac.currentTime + dur);
      o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur + .01);
    } catch (e) {}
  };

  // drop the curtain: the overlay blurs away while the shrine - held display:none
  // behind body.intro - starts its own entrance under the fade, not behind it.
  function finish(instant){
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout); timers = [];
    if (instant || SOFT){
      body.classList.remove("intro");
      ov.remove();
      return;
    }
    ov.classList.add("done");                              // iOut: lunge + blur out
    setTimeout(() => body.classList.remove("intro"), 90);  // gate reveal starts now
    setTimeout(() => ov.remove(), 460);
  }

  // the finale: one giant middle finger, a beat, then out.
  function finger(){
    if (fingerOn) return;
    fingerOn = true;
    wordEl.remove();
    ov.classList.add("finale");                            // fade the skip hint
    const f = document.createElement("span");
    f.className = "ifinger";
    f.textContent = "\u{1F595}";
    f.setAttribute("role", "img");
    f.setAttribute("aria-label", "middle finger");
    ov.querySelector(".istage").appendChild(f);
    thud(58, .12, .5);
    try { navigator.vibrate && navigator.vibrate([40, 60, 80]); } catch (e) {}
    timers.push(setTimeout(() => finish(false), skipped ? 450 : HOLD));
  }

  // slam one word in. the variant cycles so no two entries feel the same.
  function slam(i){
    wordEl.textContent = WORDS[i];
    wordEl.className = "iword v" + (i % 3);
    void wordEl.offsetWidth;                               // restart the pop animation
    wordEl.classList.add("pop");
    thud(85 + i * 8, .05, .16);                            // rising thock - the ramp sells it
    if (i < WORDS.length - 1){
      timers.push(setTimeout(() => slam(i + 1), GAP));
    } else {
      timers.push(setTimeout(() => finger(), DWELL));      // hold the last word a beat
    }
  }

  // any tap / key / scroll skips the ad and gets to the point
  const skip = () => {
    if (finished) return;
    if (fingerOn){ finish(true); }
    else { skipped = true; timers.forEach(clearTimeout); timers = []; finger(); }
  };
  addEventListener("pointerdown", skip, { passive: true });
  addEventListener("keydown", skip);
  addEventListener("wheel", skip, { passive: true });

  // reduced motion and the ?test self-check both go straight to the shrine
  if (SOFT || location.search.includes("test")){
    finish(true);
    return;
  }
  slam(0);
})();
