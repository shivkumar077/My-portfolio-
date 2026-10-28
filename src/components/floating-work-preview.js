// Desktop Floating Preview Card for Selected Work items

import { WORK_PREVIEWS } from "../canvas/previews.js";

export function initFloatingWorkPreview({ workItems }) {
  const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  if (!isFinePointer) return () => {};

  const card = document.createElement("div");
  card.className = "floating-preview-card pointer-events-none fixed left-0 top-0 z-50 border border-hairline bg-paper-raised opacity-0 scale-95 transition-all duration-150";
  card.style.width = "320px";
  card.style.height = "220px";
  card.style.boxShadow = "var(--shadow-float)";
  card.style.display = "none";
  card.setAttribute("aria-hidden", "true");

  card.innerHTML = `
    <div class="preview-header flex h-7 items-center justify-between border-b border-hairline px-3 text-xs meta">
      <span class="preview-index text-ink-soft"></span>
      <span class="preview-status text-accent-ink"></span>
    </div>
    <div class="h-[calc(100%-1.75rem)] w-full relative">
      <canvas class="preview-canvas h-full w-full block"></canvas>
    </div>
  `;
  document.body.appendChild(card);

  const canvas = card.querySelector(".preview-canvas");
  const ctx = canvas.getContext("2d");
  const indexEl = card.querySelector(".preview-index");
  const statusEl = card.querySelector(".preview-status");

  let currentSlug = null;
  let targetX = -999;
  let targetY = -999;
  let posX = -999;
  let posY = -999;
  let isVisible = false;
  let animId = null;
  let renderStartTime = performance.now();
  let currentPreviewDef = null;

  const clampPos = (e) => {
    const w = 320;
    const h = 220;
    const padding = 16;
    let x = e.clientX + 28;
    if (x + w > window.innerWidth - padding) {
      x = e.clientX - 28 - w;
    }
    x = Math.min(Math.max(x, padding), window.innerWidth - w - padding);
    let y = Math.min(Math.max(e.clientY - h / 2, padding), window.innerHeight - h - padding);
    return { x, y };
  };

  let colors = { paper: "#fff", ink: "#1c1233", soft: "#584a77", faint: "#cdc0ea", accent: "#7b3fe4" };
  const readColors = () => {
    const style = getComputedStyle(document.documentElement);
    colors = {
      paper: style.getPropertyValue("--paper-raised").trim() || "#fff",
      ink: style.getPropertyValue("--ink").trim() || "#1c1233",
      soft: style.getPropertyValue("--ink-soft").trim() || "#584a77",
      faint: style.getPropertyValue("--ink-faint").trim() || "#cdc0ea",
      accent: style.getPropertyValue("--accent").trim() || "#7b3fe4"
    };
  };
  readColors();
  const themeObserver = new MutationObserver(readColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const show = (slug, e) => {
    const item = workItems.find((w) => w.slug === slug);
    if (!item) return;

    currentSlug = slug;
    currentPreviewDef = WORK_PREVIEWS[item.preview] || WORK_PREVIEWS.tensor;
    indexEl.textContent = item.index;
    statusEl.textContent = item.status;

    const coords = clampPos(e);
    if (!isVisible) {
      posX = coords.x;
      posY = coords.y;
    }
    targetX = coords.x;
    targetY = coords.y;

    card.style.display = "block";
    isVisible = true;

    // Resize canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(320 * dpr);
    canvas.height = Math.round((220 - 28) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    renderStartTime = performance.now();
    card.classList.remove("opacity-0", "scale-95");
    card.classList.add("opacity-100", "scale-100");

    if (!animId) {
      animId = requestAnimationFrame(tick);
    }
  };

  const hide = () => {
    isVisible = false;
    currentSlug = null;
    card.classList.remove("opacity-100", "scale-100");
    card.classList.add("opacity-0", "scale-95");
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    setTimeout(() => {
      if (!isVisible) card.style.display = "none";
    }, 150);
  };

  const onPointerMove = (e) => {
    if (isVisible) {
      const coords = clampPos(e);
      targetX = coords.x;
      targetY = coords.y;
    }
  };

  const tick = (now) => {
    if (!isVisible) {
      animId = null;
      return;
    }

    if (targetX > -900) {
      posX += (targetX - posX) * 0.25;
      posY += (targetY - posY) * 0.25;
      card.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

      if (currentPreviewDef) {
        const elapsed = (now - renderStartTime) / 1000 + (currentPreviewDef.warm || 0);
        const w = 320;
        const h = 220 - 28;
        ctx.clearRect(0, 0, w, h);
        const bounds = { x: 0, y: 0, w, h };
        const scale = Math.min(w, h) / 200;
        currentPreviewDef.draw(ctx, elapsed, bounds, colors, scale);
      }
    }
    animId = requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return {
    show,
    hide,
    destroy: () => {
      if (animId) cancelAnimationFrame(animId);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      card.remove();
    }
  };
}
