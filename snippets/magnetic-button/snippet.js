<!-- <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script> -->
<!--
  <button class="magnetic-button"><span>Button 1</span></button>
  <button class="magnetic-button"><span>Button 2</span></button>
  <button class="magnetic-button"><span>Button 3</span></button>
-->

const STYLE_ID = "magnetic-button-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .magnetic-button {
      position: relative;
      width: 150px;
      height: 150px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid currentColor;
      border-radius: 50%;
      background: none;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .magnetic-button span {
      position: relative;
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
}

function initMagneticButtons(buttons, { radius = 150 } = {}) {
  ensureStyles();
  const list = buttons instanceof Element ? [buttons] : Array.from(buttons);
  const items = list.map((button) => ({
    button,
    text: button.querySelector("span"),
    wasInRadius: false,
  }));

  function resetMagnet(button, text) {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 2.5,
      ease: "elastic.out(1.2, 0.2)",
      overwrite: "auto",
    });

    if (text) {
      gsap.to(text, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }

  document.addEventListener("mousemove", (e) => {
    items.forEach((item) => {
      const rect = item.button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const isInRadius = distance < radius;

      if (isInRadius) {
        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        gsap.to(item.button, {
          x: offsetX * 0.5,
          y: offsetY * 0.5,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });

        if (item.text) {
          gsap.to(item.text, {
            x: offsetX * 0.2,
            y: offsetY * 0.2,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      } else if (item.wasInRadius) {
        // Fires exactly once, on the move where the cursor crosses from
        // inside the radius to outside it — not repeatedly for as long as
        // it stays away.
        resetMagnet(item.button, item.text);
      }

      item.wasInRadius = isInRadius;
    });
  });
}

// Usage
initMagneticButtons(document.querySelectorAll(".magnetic-button"));
