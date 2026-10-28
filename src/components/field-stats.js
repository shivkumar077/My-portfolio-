// FieldStats HUD readout component

export function initFieldStats() {
  let isOpen = false;
  let fps = 0;
  let frameCount = 0;
  let lastCalc = performance.now();
  let pointerPos = { x: 0, y: 0, away: true };

  const container = document.createElement("aside");
  container.className = "pointer-events-none fixed bottom-4 left-4 z-[70] border border-ink-faint bg-paper/90 px-3 py-2 backdrop-blur-[2px] transition-all duration-200";
  container.style.display = "none";
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  const updateHUD = () => {
    if (!isOpen) return;
    const vp = `${window.innerWidth}×${window.innerHeight}`;
    const pStr = pointerPos.away ? "away" : `${Math.round(pointerPos.x)},${Math.round(pointerPos.y)}`;

    container.innerHTML = `
      <p class="meta mb-1.5 text-accent-ink">FIELD READOUT — ESC</p>
      <dl class="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
        <dt class="meta text-ink-label">FRAME LOOP</dt><dd class="meta text-right text-ink">RUNNING</dd>
        <dt class="meta text-ink-label">SYSTEMS</dt><dd class="meta text-right text-ink">6</dd>
        <dt class="meta text-ink-label">FPS</dt><dd class="meta text-right text-ink">${fps}</dd>
        <dt class="meta text-ink-label">POINTER</dt><dd class="meta text-right text-ink">${pStr}</dd>
        <dt class="meta text-ink-label">VIEWPORT</dt><dd class="meta text-right text-ink">${vp}</dd>
      </dl>
    `;
  };

  let fpsInterval = null;
  let animId = null;

  const loop = () => {
    frameCount++;
    if (isOpen) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
    }
  };

  const startLoop = () => {
    if (!animId) {
      lastCalc = performance.now();
      frameCount = 0;
      animId = requestAnimationFrame(loop);
    }
    if (!fpsInterval) {
      fpsInterval = setInterval(() => {
        const now = performance.now();
        const elapsed = (now - lastCalc) / 1000;
        fps = Math.round(frameCount / (elapsed || 0.5));
        frameCount = 0;
        lastCalc = now;
        if (isOpen) updateHUD();
      }, 500);
    }
  };

  const stopLoop = () => {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (fpsInterval) {
      clearInterval(fpsInterval);
      fpsInterval = null;
    }
  };

  const toggle = (force) => {
    isOpen = typeof force === "boolean" ? force : !isOpen;
    container.style.display = isOpen ? "block" : "none";
    if (isOpen) {
      startLoop();
      updateHUD();
    } else {
      stopLoop();
    }
  };

  const onPointerMove = (e) => {
    if (isOpen) {
      pointerPos = { x: e.clientX, y: e.clientY, away: false };
      updateHUD();
    }
  };

  const onPointerLeave = () => {
    if (isOpen) {
      pointerPos.away = true;
      updateHUD();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape" && isOpen) {
      toggle(false);
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("gw:stats", () => toggle());

  return {
    toggle,
    destroy: () => {
      stopLoop();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      container.remove();
    }
  };
}
