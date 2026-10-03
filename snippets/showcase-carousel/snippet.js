/* ---- CSS (add once to your stylesheet) ----
.ssw { position: relative; overflow: hidden; border-radius: 24px; min-height: 560px; color: #fff; font-family: Inter, system-ui, sans-serif; }
.ssw-bg { position: absolute; inset: 0; transition: opacity 0.6s ease; }
.ssw-bg[data-layer="b"] { opacity: 0; }
.ssw-inner { position: relative; z-index: 1; height: 100%; }
.ssw-layout { display: flex; align-items: center; gap: 56px; max-width: 1000px; margin: 0 auto; padding: 56px 32px 96px; min-height: 480px; }
.ssw-text-col { flex: 0 0 42%; display: flex; flex-direction: column; gap: 18px; }
.ssw-badge { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; transition: background-color 0.5s ease; }
.ssw-heading-mask, .ssw-desc-mask { overflow: hidden; }
.ssw-heading { margin: 0; font-size: clamp(26px, 3vw, 40px); line-height: 1.15; font-weight: 800; transform: translateY(110%); transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
.ssw-heading.visible { transform: translateY(0); }
.ssw-heading.exiting { transform: translateY(-110%); }
.ssw-desc { margin: 0; max-width: 380px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.7); transform: translateY(110%); transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.06s; }
.ssw-desc.visible { transform: translateY(0); }
.ssw-desc.exiting { transform: translateY(-110%); }
.ssw-visual-col { flex: 1; position: relative; min-height: 420px; }
.ssw-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.45s ease; pointer-events: none; }
.ssw-slide.active { opacity: 1; pointer-events: auto; }
.ssw-phone { width: 220px; height: 440px; border-radius: 40px; background: linear-gradient(160deg,#2c2c2e,#1c1c1e); box-shadow: 0 0 0 1.5px rgba(255,255,255,0.12), 0 0 0 8px #1c1c1e, 0 30px 60px rgba(0,0,0,0.6); position: relative; }
.ssw-phone::before { content: ""; position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 90px; height: 24px; background: #000; border-radius: 12px; z-index: 2; }
.ssw-screen { position: absolute; inset: 8px; border-radius: 32px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.ssw-nav { display: flex; align-items: center; justify-content: center; gap: 16px; position: absolute; left: 0; right: 0; bottom: 24px; z-index: 2; }
.ssw-nav-btn { width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); font-size: 20px; line-height: 1; cursor: pointer; }
.ssw-nav-btn:disabled { opacity: 0.25; cursor: default; }
.ssw-dots { display: flex; gap: 8px; }
.ssw-dot { width: 6px; height: 6px; border-radius: 3px; border: none; background: rgba(255,255,255,0.25); cursor: pointer; transition: all 0.3s; padding: 0; }
.ssw-dot.active { width: 22px; background: #fff; }
@media (max-width: 720px) {
  .ssw-layout { flex-direction: column; text-align: center; padding: 40px 20px 88px; gap: 28px; }
  .ssw-text-col { align-items: center; }
  .ssw-desc { max-width: 100%; }
}
------------------------------------------------ */

/**
 * Markup contract — steps is an array of:
 *   { badge: "01", heading: "...", desc: "...", color: "#FF6B35", bg: "linear-gradient(...)", screenHTML: "<div>...</div>" }
 * screenHTML is optional and can be any HTML string — wrap it in
 * <div class="ssw-phone"><div class="ssw-screen">...</div></div> for the
 * phone-bezel look, or leave it out entirely for a plain crossfading visual.
 */
function createStepShowcase(root, steps) {
  root.classList.add("ssw");
  root.setAttribute("tabindex", "0");
  root.innerHTML =
    '<div class="ssw-bg" data-layer="a"></div>' +
    '<div class="ssw-bg" data-layer="b"></div>' +
    '<div class="ssw-inner">' +
      '<div class="ssw-layout">' +
        '<div class="ssw-text-col">' +
          '<span class="ssw-badge"></span>' +
          '<div class="ssw-heading-mask"><h3 class="ssw-heading"></h3></div>' +
          '<div class="ssw-desc-mask"><p class="ssw-desc"></p></div>' +
        "</div>" +
        '<div class="ssw-visual-col"></div>' +
      "</div>" +
      '<div class="ssw-nav">' +
        '<button class="ssw-nav-btn" data-dir="prev" aria-label="Previous step">&#8249;</button>' +
        '<div class="ssw-dots" role="tablist"></div>' +
        '<button class="ssw-nav-btn" data-dir="next" aria-label="Next step">&#8250;</button>' +
      "</div>" +
    "</div>";

  var bgA = root.querySelector('[data-layer="a"]');
  var bgB = root.querySelector('[data-layer="b"]');
  var badgeEl = root.querySelector(".ssw-badge");
  var headingEl = root.querySelector(".ssw-heading");
  var descEl = root.querySelector(".ssw-desc");
  var visualCol = root.querySelector(".ssw-visual-col");
  var dotsWrap = root.querySelector(".ssw-dots");
  var prevBtn = root.querySelector('[data-dir="prev"]');
  var nextBtn = root.querySelector('[data-dir="next"]');

  var current = 0;
  var bgActive = "a";
  var busy = false;
  var slides = [];
  var dots = [];

  steps.forEach(function (step, i) {
    var slide = document.createElement("div");
    slide.className = "ssw-slide" + (i === 0 ? " active" : "");
    slide.innerHTML = step.screenHTML || "";
    visualCol.appendChild(slide);
    slides.push(slide);

    var dot = document.createElement("button");
    dot.className = "ssw-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Step " + (i + 1));
    dot.addEventListener("click", function () {
      goTo(i);
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  bgA.style.background = steps[0].bg;
  bgB.style.background = steps[0].bg;
  bgA.style.opacity = "1";

  function paint(step) {
    badgeEl.textContent = step.badge;
    badgeEl.style.background = step.color;
    headingEl.textContent = step.heading;
    descEl.textContent = step.desc;
  }

  paint(steps[0]);
  requestAnimationFrame(function () {
    headingEl.classList.add("visible");
    descEl.classList.add("visible");
  });
  sync();

  function goTo(idx) {
    if (idx === current || busy || idx < 0 || idx >= steps.length) return;
    busy = true;
    var next = steps[idx];

    headingEl.classList.remove("visible");
    headingEl.classList.add("exiting");
    descEl.classList.remove("visible");
    descEl.classList.add("exiting");

    var incoming = bgActive === "a" ? bgB : bgA;
    var outgoing = bgActive === "a" ? bgA : bgB;
    incoming.style.background = next.bg;
    incoming.style.opacity = "1";
    outgoing.style.opacity = "0";
    bgActive = bgActive === "a" ? "b" : "a";

    slides[current].classList.remove("active");

    setTimeout(function () {
      headingEl.classList.remove("exiting");
      descEl.classList.remove("exiting");
      headingEl.style.transition = "none";
      descEl.style.transition = "none";
      headingEl.style.transform = "translateY(110%)";
      descEl.style.transform = "translateY(110%)";

      paint(next);
      slides[idx].classList.add("active");
      current = idx;
      sync();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          headingEl.style.transition = "";
          descEl.style.transition = "";
          headingEl.style.transform = "";
          descEl.style.transform = "";
          headingEl.classList.add("visible");
          descEl.classList.add("visible");
          busy = false;
        });
      });
    }, 320);
  }

  function sync() {
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === steps.length - 1;
  }

  prevBtn.addEventListener("click", function () {
    goTo(current - 1);
  });
  nextBtn.addEventListener("click", function () {
    goTo(current + 1);
  });
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  return { goTo: goTo };
}

// Usage
createStepShowcase(document.getElementById("showcase"), [
  {
    badge: "01",
    heading: "One Tap Books It",
    desc: "Send a link, they pick a time — no phone tag.",
    color: "#FF6B35",
    bg: "linear-gradient(160deg,#160f40 0%,#050311 100%)",
    screenHTML: '<div class="ssw-phone"><div class="ssw-screen" style="background:#111827;color:#fff;font:700 13px system-ui;">Booked</div></div>',
  },
  // ...more steps
]);
