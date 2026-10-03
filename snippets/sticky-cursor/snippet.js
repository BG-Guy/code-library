/**
 * Mark any element you want the cursor to "stick" to with [data-sticky]:
 *   <button data-sticky>Hover me</button>
 *
 * createStickyCursor(document.querySelectorAll("[data-sticky]"));
 *
 * On coarse-pointer (touch) devices a small drag handle appears near the
 * middle of the screen — drag it anywhere to move the cursor's virtual
 * position and trigger the same stick/morph effect without a real mouse.
 */
function createStickyCursor(targets, options = {}) {
  // stiffness pulls the cursor toward its target each frame; friction is how much
  // velocity survives each frame — closer to 1 means more overshoot/bounce before it settles.
  const opts = { size: 15, stickySize: 60, pull: 0.1, stiffness: 0.15, friction: 0.65, color: "#111", ...options };
  const list = targets instanceof Element ? [targets] : Array.from(targets);

  const cursor = document.createElement("div");
  cursor.className = "sticky-cursor";
  Object.assign(cursor.style, {
    position: "fixed",
    top: "0",
    left: "0",
    borderRadius: "50%",
    background: opts.color,
    pointerEvents: "none",
    zIndex: 9999,
    willChange: "transform",
  });
  document.body.appendChild(cursor);

  let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  let smooth = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 };
  let size = { value: opts.size, v: 0 };
  let active = null;

  function hitTest(x, y) {
    return (
      list.find((el) => {
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      }) || null
    );
  }

  function setPointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    active = hitTest(x, y);
  }

  // A tiny spring integrator: nudge velocity toward the target every frame, then
  // bleed some of it off. This is what gives the cursor its overshoot-and-settle
  // "elastic" feel instead of just easing straight in.
  function springStep(pos, vel, target) {
    vel += (target - pos) * opts.stiffness;
    vel *= opts.friction;
    return [pos + vel, vel];
  }

  function frame() {
    let targetX = pointer.x;
    let targetY = pointer.y;
    let targetSize = opts.size;
    let suffix = "";

    if (active) {
      const r = active.getBoundingClientRect();
      const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const dist = { x: pointer.x - center.x, y: pointer.y - center.y };
      const abs = Math.max(Math.abs(dist.x), Math.abs(dist.y));
      const scaleX = 1 + Math.min(abs / (r.height / 2), 1) * 0.3;
      const scaleY = 1 - Math.min(abs / (r.width / 2), 1) * 0.2;
      const angle = Math.atan2(dist.y, dist.x);

      targetX = center.x + dist.x * opts.pull;
      targetY = center.y + dist.y * opts.pull;
      targetSize = opts.stickySize;
      suffix = " rotate(" + angle + "rad) scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }

    [smooth.x, smooth.vx] = springStep(smooth.x, smooth.vx, targetX);
    [smooth.y, smooth.vy] = springStep(smooth.y, smooth.vy, targetY);
    [size.value, size.v] = springStep(size.value, size.v, targetSize);
    const s = Math.max(0, size.value);

    cursor.style.width = s + "px";
    cursor.style.height = s + "px";
    cursor.style.transform = "translate(" + (smooth.x - s / 2) + "px, " + (smooth.y - s / 2) + "px)" + suffix;

    raf = requestAnimationFrame(frame);
  }
  let raf = requestAnimationFrame(frame);

  function onMouseMove(e) {
    setPointer(e.clientX, e.clientY);
  }
  window.addEventListener("mousemove", onMouseMove);

  // ---- Touch/mobile: a draggable handle stands in for a real mouse ----
  const HANDLE_OFFSET_Y = 56; // keeps the effect visible above your thumb
  let handle = null;
  let dragging = false;

  function createHandle() {
    handle = document.createElement("div");
    handle.className = "sticky-cursor-handle";
    Object.assign(handle.style, {
      position: "fixed",
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      border: "2px solid " + opts.color,
      background: "rgba(255,255,255,.6)",
      touchAction: "none",
      zIndex: 10000,
      left: pointer.x - 22 + "px",
      top: pointer.y + HANDLE_OFFSET_Y - 22 + "px",
    });
    document.body.appendChild(handle);

    handle.addEventListener(
      "touchstart",
      (e) => {
        dragging = true;
        e.preventDefault();
      },
      { passive: false }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging) return;
        e.preventDefault();
        const t = e.touches[0];
        handle.style.left = t.clientX - 22 + "px";
        handle.style.top = t.clientY - 22 + "px";
        setPointer(t.clientX, t.clientY - HANDLE_OFFSET_Y);
      },
      { passive: false }
    );
    window.addEventListener("touchend", () => {
      dragging = false;
    });
  }

  if (matchMedia("(pointer: coarse)").matches) createHandle();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      cursor.remove();
      handle && handle.remove();
    },
  };
}

// Usage
createStickyCursor(document.querySelectorAll("[data-sticky]"));
