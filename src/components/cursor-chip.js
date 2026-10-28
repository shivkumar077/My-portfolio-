// Custom CursorChip: floating action tag with spring physics following pointer

export function initCursorChip() {
  const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isFinePointer || isReducedMotion) return () => {};

  const chipEl = document.createElement("div");
  chipEl.className = "cursor-chip-root pointer-events-none fixed left-0 top-0 z-[90]";
  chipEl.setAttribute("aria-hidden", "true");
  chipEl.innerHTML = `<span class="cursor-chip-badge meta inline-block bg-ink px-2 py-1 text-paper transition-all duration-150 transform scale-90 opacity-0"></span>`;
  document.body.appendChild(chipEl);

  const badgeEl = chipEl.querySelector(".cursor-chip-badge");

  let targetX = -100;
  let targetY = -100;
  let currentX = -100;
  let currentY = -100;
  let currentLabel = null;
  let isAway = true;

  const onPointerMove = (e) => {
    isAway = false;
    targetX = e.clientX + 18;
    targetY = e.clientY + 14;
  };

  const onPointerLeave = () => {
    isAway = true;
  };

  const onPointerOver = (e) => {
    const targetWithCursor = e.target?.closest?.("[data-cursor]");
    const label = targetWithCursor?.getAttribute("data-cursor") || null;
    if (label !== currentLabel) {
      currentLabel = label;
      if (label) {
        badgeEl.textContent = label;
        badgeEl.classList.remove("opacity-0", "scale-90");
        badgeEl.classList.add("opacity-100", "scale-100");
      } else {
        badgeEl.classList.remove("opacity-100", "scale-100");
        badgeEl.classList.add("opacity-0", "scale-90");
      }
    }
  };

  let animId = null;
  const tick = () => {
    if (!isAway) {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.25;
      currentY += dy * 0.25;
      chipEl.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;

      if (Math.hypot(dx, dy) > 0.3) {
        animId = requestAnimationFrame(tick);
        return;
      }
    }
    animId = null;
  };

  const scheduleTick = () => {
    if (!animId) {
      animId = requestAnimationFrame(tick);
    }
  };

  const handlePointerMove = (e) => {
    onPointerMove(e);
    scheduleTick();
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("pointerover", (e) => {
    onPointerOver(e);
    scheduleTick();
  }, { passive: true });

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("pointerover", onPointerOver);
    chipEl.remove();
  };
}
