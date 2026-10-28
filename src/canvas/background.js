// Celestial Background matching media_1793150722384.png with 100% precision

function pseudoRandom(e) {
  let t = 43758.5453 * Math.sin(127.1 * e);
  return t - Math.floor(t);
}

// 320 procedurally seeded stars matching the screenshot
const stars = Array.from({ length: 320 }, (_, t) => ({
  x: pseudoRandom(t + 1),
  y: pseudoRandom(t + 41),
  r: 0.45 + 1.4 * pseudoRandom(t + 91),
  phase: pseudoRandom(t + 131) * Math.PI * 2,
  rate: 0.25 + 0.7 * pseudoRandom(t + 171),
  sparkle: pseudoRandom(t + 211) > 0.94
}));

// Auroras perfectly aligned to the screenshot bands (cyan ribbon at 36%, magenta ribbon at 22%)
const auroras = [
  { token: "--aurora-2", y: 0.36, amp: 0.035, len: 2.1, thick: 0.16, speed: 0.032, phase: 1.8 },
  { token: "--aurora-1", y: 0.22, amp: 0.045, len: 1.8, thick: 0.20, speed: 0.026, phase: 0.2 }
];

// Planet coordinates measured directly from the screenshot (media_1793150722384.png):
// - Teal Winking Planet: x = 0.177, y = 0.426, relative radius = 0.145 of height
// - Amber Surprised Planet: x = 0.352, y = 0.115, relative radius = 0.102 of height
// - Rose Ringed Planet: x = 0.559, y = 0.255, relative radius = 0.228 of height
// - Violet Planet: x = 0.98, y = 0.68, relative radius = 0.36 of height
const planets = [
  {
    name: "teal-moon",
    baseR: 54,
    body: "#7cb4bc",
    shade: "#54858c",
    face: "wink",
    x: 0.20,
    y: 0.28,
    xNarrow: 0.16,
    yNarrow: 0.28,
    bob: 0.82,
    sway: 0.62,
    bobAmp: 0.16,
    swayAmp: 0.016,
    phase: 0.2
  },
  {
    name: "amber",
    baseR: 39,
    body: "#d6b285",
    shade: "#a5865e",
    face: "surprised",
    x: 0.352,
    y: 0.115,
    xNarrow: 0.30,
    yNarrow: 0.10,
    bob: 0.95,
    sway: 0.72,
    bobAmp: 0.22,
    swayAmp: 0.018,
    phase: 1.7
  },
  {
    name: "golden-stargazer",
    baseR: 80,
    body: "#f7a57a",
    shade: "#c4673c",
    ring: "#d6c2f5",
    face: "starry",
    x: 0.559,
    y: 0.255,
    xNarrow: 0.52,
    yNarrow: 0.20,
    bob: 0.72,
    sway: 0.52,
    bobAmp: 0.14,
    swayAmp: 0.015,
    phase: 3.1
  },
  {
    name: "big-violet",
    baseR: 140,
    body: "#7b68b8",
    shade: "#544a86",
    bands: ["#8d7cc6"],
    face: "happy",
    x: 0.98,
    y: 0.54,
    xNarrow: 0.88,
    yNarrow: 0.62,
    bob: 0.78,
    sway: 0.56,
    bobAmp: 0.12,
    swayAmp: 0.014,
    phase: 4.4
  },
  {
    name: "deep-indigo",
    baseR: 150,
    body: "#5d55a0",
    shade: "#3f3a75",
    bands: ["#6f68b4"],
    face: "sleepy",
    x: 0.18,
    y: 1.28,
    xNarrow: 0.18,
    yNarrow: 1.15,
    bob: 0.65,
    sway: 0.48,
    bobAmp: 0.12,
    swayAmp: 0.016,
    phase: 2.3
  },
  {
    name: "magenta-giant",
    baseR: 170,
    body: "#9c72ab",
    shade: "#6f4f7c",
    bands: ["#ad86bb"],
    face: "happy",
    x: 0.72,
    y: 1.36,
    xNarrow: 0.75,
    yNarrow: 1.22,
    bob: 0.58,
    sway: 0.42,
    bobAmp: 0.10,
    swayAmp: 0.015,
    phase: 5.0
  }
];

export function initBackgroundCanvas(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let scaleFactor = 1;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    width = window.innerWidth;
    height = window.innerHeight;
    const isMobile = width < 768;
    // Responsive scaling for mobile: planets scale down proportionally with width
    // so they stay cute, subtle, and never dominate or crowd phone screens
    if (isMobile) {
      scaleFactor = Math.max(0.35, Math.min(0.65, width / 880));
    } else {
      scaleFactor = Math.max(0.75, Math.min(1.3, Math.min(width / 1300, height / 800)));
    }
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let starColor = "#ffffff";
  let starAlpha = 0.65;
  let auroraAlpha = 0.24;
  let auroraColors = ["#2fd4c8", "#ff5fc4"];

  // Offscreen canvas pre-rendering 320 stars once instead of 320 arc() calls every frame
  let starsCanvas = null;
  let starsCtx = null;

  const buildStarsCache = () => {
    if (!width || !height) return;
    if (!starsCanvas) {
      starsCanvas = document.createElement("canvas");
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    starsCanvas.width = Math.round(width * dpr);
    starsCanvas.height = Math.round(height * dpr);
    starsCtx = starsCanvas.getContext("2d");
    if (!starsCtx) return;
    starsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    starsCtx.clearRect(0, 0, width, height);

    starsCtx.fillStyle = starColor;
    starsCtx.globalAlpha = starAlpha * 0.9;
    starsCtx.beginPath();
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const sx = star.x * width;
      const sy = star.y * height;
      starsCtx.moveTo(sx + star.r, sy);
      starsCtx.arc(sx, sy, star.r, 0, 2 * Math.PI);
    }
    starsCtx.fill();
  };

  const readThemeColors = () => {
    const style = getComputedStyle(document.documentElement);
    starColor = style.getPropertyValue("--star").trim() || starColor;
    const sa = parseFloat(style.getPropertyValue("--star-alpha"));
    starAlpha = Number.isFinite(sa) ? sa : 0.65;
    const aa = parseFloat(style.getPropertyValue("--aurora-alpha"));
    auroraAlpha = Number.isFinite(aa) ? aa : 0.24;
    const c1 = style.getPropertyValue("--aurora-2").trim();
    if (c1) auroraColors[0] = c1;
    const c2 = style.getPropertyValue("--aurora-3").trim();
    if (c2) auroraColors[1] = c2;
    buildStarsCache();
  };

  let time = 0;
  const faceDark = "rgba(24, 12, 45, 0.88)";

  const drawEye = (ex, ey, er, eyeState) => {
    if (eyeState === "closed") {
      ctx.lineWidth = Math.max(1.8, 0.34 * er);
      ctx.strokeStyle = faceDark;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(ex, ey, er, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = faceDark;
    ctx.beginPath();
    if (eyeState === "half") {
      ctx.ellipse(ex, ey + 0.2 * er, 0.78 * er, 0.62 * er, 0, Math.PI, 0, true);
    } else {
      ctx.ellipse(ex, ey, 0.78 * er, er, 0, 0, 2 * Math.PI);
    }
    ctx.fill();

    if (eyeState === "open") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(ex + 0.3 * er, ey - 0.35 * er, 0.28 * er, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawFace = (planet, cx, cy, radius) => {
    if (radius < 11) return;
    const eyeR = 0.125 * radius;
    const eyeSpacing = 0.34 * radius;
    const eyeY = cy - 0.08 * radius;

    if (planet.face === "cool") {
      // Cool dark sunglasses matching screenshot
      ctx.fillStyle = "rgba(24, 12, 45, 0.92)";
      const glassW = 0.35 * radius;
      const glassH = 0.19 * radius;
      ctx.beginPath();
      ctx.roundRect(cx - eyeSpacing - glassW / 2, eyeY - glassH / 2, glassW, glassH, 0.35 * glassH);
      ctx.roundRect(cx + eyeSpacing - glassW / 2, eyeY - glassH / 2, glassW, glassH, 0.35 * glassH);
      ctx.fill();
      ctx.lineWidth = Math.max(2, 0.04 * radius);
      ctx.strokeStyle = "rgba(24, 12, 45, 0.92)";
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing + glassW / 2, eyeY);
      ctx.lineTo(cx + eyeSpacing - glassW / 2, eyeY);
      ctx.stroke();
    } else if (planet.face === "sleepy") {
      drawEye(cx - eyeSpacing, eyeY, eyeR, "closed");
      drawEye(cx + eyeSpacing, eyeY, eyeR, "closed");
    } else if (planet.face === "wink") {
      // Left eye open with specular shine, right eye winking arc
      drawEye(cx - eyeSpacing, eyeY, eyeR, "open");
      drawEye(cx + eyeSpacing, eyeY, eyeR, "closed");
    } else if (planet.face === "surprised") {
      // Two solid round black eyes
      ctx.fillStyle = faceDark;
      ctx.beginPath();
      ctx.arc(cx - eyeSpacing, eyeY, eyeR, 0, 2 * Math.PI);
      ctx.arc(cx + eyeSpacing, eyeY, eyeR, 0, 2 * Math.PI);
      ctx.fill();
    } else if (planet.face === "starry") {
      // Four-point sparkling star eyes (✦ ✦)
      const drawStarEye = (ex, ey, r) => {
        ctx.fillStyle = faceDark;
        ctx.beginPath();
        const s = r * 1.4;
        ctx.moveTo(ex, ey - s);
        ctx.quadraticCurveTo(ex, ey, ex + s, ey);
        ctx.quadraticCurveTo(ex, ey, ex, ey + s);
        ctx.quadraticCurveTo(ex, ey, ex - s, ey);
        ctx.quadraticCurveTo(ex, ey, ex, ey - s);
        ctx.fill();

        // White specular center point
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ex, ey, 0.35 * r, 0, Math.PI * 2);
        ctx.fill();
      };
      drawStarEye(cx - eyeSpacing, eyeY, eyeR);
      drawStarEye(cx + eyeSpacing, eyeY, eyeR);
    } else {
      drawEye(cx - eyeSpacing, eyeY, eyeR, "open");
      drawEye(cx + eyeSpacing, eyeY, eyeR, "open");
    }

    // Cute pink blush spots on cheeks
    if (planet.face === "happy" || planet.face === "wink" || planet.face === "starry") {
      ctx.fillStyle = "rgba(255, 120, 180, 0.45)";
      ctx.beginPath();
      ctx.ellipse(cx - 1.55 * eyeSpacing, eyeY + 0.24 * radius, 0.12 * radius, 0.07 * radius, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 1.55 * eyeSpacing, eyeY + 0.24 * radius, 0.12 * radius, 0.07 * radius, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.strokeStyle = faceDark;
    ctx.fillStyle = faceDark;
    ctx.lineWidth = Math.max(1.8, 0.048 * radius);
    ctx.lineCap = "round";

    const mouthY = cy + 0.26 * radius;
    const mouthW = 0.16 * radius;

    if (planet.face === "surprised") {
      // Round open 'o' mouth
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, 0.08 * radius, 0.11 * radius, 0, 0, 2 * Math.PI);
      ctx.fill();
    } else if (planet.face === "happy" || planet.face === "wink" || planet.face === "starry") {
      // Cheerful curved smile
      ctx.beginPath();
      ctx.arc(cx, mouthY - 0.1 * radius, 0.2 * radius, 0.18 * Math.PI, 0.82 * Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.lineTo(cx + mouthW, mouthY);
      ctx.stroke();
    }
  };

  const drawPlanet = (planet, px, py, radius) => {
    // Ring behind body
    if (planet.ring) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.32);
      ctx.strokeStyle = planet.ring;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = Math.max(2.5, 0.17 * radius);
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.58 * radius, 0.42 * radius, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Planet body sphere
    ctx.fillStyle = planet.body;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Horizontal bands if any
    if (planet.bands) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, 2 * Math.PI);
      ctx.clip();
      ctx.globalAlpha = 0.55;
      planet.bands.forEach((bandColor, bIdx) => {
        ctx.fillStyle = bandColor;
        ctx.fillRect(px - radius, py + (bIdx === 0 ? -0.66 * radius : 0.46 * radius), 2 * radius, 0.2 * radius);
      });
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // 3D Spherical shadow gradient
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = planet.shade;
    ctx.beginPath();
    ctx.arc(px + 0.52 * radius, py + 0.36 * radius, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;

    // Face details
    drawFace(planet, px, py, radius);
  };

  const renderFrame = () => {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    // 1. Flowing Aurora Waves
    auroras.forEach((a, idx) => {
      const cy = a.y * height;
      const amp = a.amp * height;
      const thick = a.thick * height;

      const grad = ctx.createLinearGradient(0, cy - thick, 0, cy + thick);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, auroraColors[idx] || "#2fd4c8");
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.globalAlpha = auroraAlpha;
      ctx.beginPath();

      const step = Math.max(20, width / 45);
      ctx.moveTo(-40, cy - thick);
      for (let x = -40; x <= width + 40; x += step) {
        const rad = (x / width) * a.len * Math.PI * 2;
        ctx.lineTo(x, cy + Math.sin(rad + time * a.speed + a.phase) * amp - thick);
      }
      for (let x = width + 40; x >= -40; x -= step) {
        const rad = (x / width) * a.len * Math.PI * 2;
        ctx.lineTo(x, cy + Math.sin(rad + time * a.speed + a.phase) * amp + thick);
      }
      ctx.closePath();
      ctx.fill();
    });

    // 2. Stars (Instant 1-call hardware blit of pre-rendered starfield cache)
    if (starsCanvas) {
      ctx.drawImage(starsCanvas, 0, 0, width, height);
    }

    // Subtle sparkles (only for the few designated sparkle stars)
    ctx.strokeStyle = starColor;
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      if (star.sparkle) {
        const sx = star.x * width;
        const sy = star.y * height;
        const span = 3.2 * star.r;
        const alphaPulse = 0.5 + 0.5 * Math.sin(time * star.rate + star.phase);
        ctx.globalAlpha = starAlpha * alphaPulse;
        ctx.lineWidth = 0.5 * star.r;
        ctx.beginPath();
        ctx.moveTo(sx - span, sy);
        ctx.lineTo(sx + span, sy);
        ctx.moveTo(sx, sy - span);
        ctx.lineTo(sx, sy + span);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // 3. Drifting planets - smooth, fluid floating motion
    const isMobile = width < 768;
    for (const planet of planets) {
      const pr = planet.baseR * scaleFactor;
      const targetX = isMobile && planet.xNarrow !== undefined ? planet.xNarrow : planet.x;
      const targetY = isMobile && planet.yNarrow !== undefined ? planet.yNarrow : planet.y;
      const baseY = targetY * height;
      const p = planet.phase || 0;
      const swayAmount = (planet.swayAmp || 0.016) * width;
      const px = targetX * width + Math.sin(time * planet.sway + p) * swayAmount;
      const bobAmount = pr * (planet.bobAmp || 0.14);
      const py = baseY + Math.cos(time * planet.bob + p) * bobAmount;
      drawPlanet(planet, px, py, pr);
    }
  };

  let isModalActive = false;
  let scrollRafId = null;
  let lastAppliedOpacity = -1;
  let lastAppliedBlur = -1;

  const updateOpacityOnScroll = () => {
    const hash = window.location.hash;
    const isModalOpen =
      isModalActive ||
      hash.startsWith("#work-") ||
      hash === "#archive";

    let targetOpacity = 1;
    let targetBlur = 0;

    if (isModalOpen) {
      targetOpacity = 0.70;
      targetBlur = 7;
    } else {
      const scrollY = window.scrollY || 0;
      if (scrollY <= 20) {
        targetOpacity = 1.0;
        targetBlur = 0;
      } else {
        const factor = Math.min(1, (scrollY - 20) / 180);
        targetBlur = Math.round(factor * 7 * 10) / 10;
        targetOpacity = 1.0 - 0.20 * factor;
      }
    }

    if (Math.abs(targetOpacity - lastAppliedOpacity) > 0.02) {
      lastAppliedOpacity = targetOpacity;
      canvas.style.opacity = targetOpacity.toFixed(2);
    }

    if (Math.abs(targetBlur - lastAppliedBlur) > 0.2) {
      lastAppliedBlur = targetBlur;
      canvas.style.filter = targetBlur > 0.3 ? `blur(${targetBlur}px)` : "none";
    }
  };

  const scheduleScrollOpacity = () => {
    if (!scrollRafId) {
      scrollRafId = requestAnimationFrame(() => {
        updateOpacityOnScroll();
        wakeLoop();
        scrollRafId = null;
      });
    }
  };

  resize();
  readThemeColors();
  buildStarsCache();
  renderFrame();
  updateOpacityOnScroll();

  window.addEventListener("scroll", scheduleScrollOpacity, { passive: true });
  window.addEventListener("hashchange", scheduleScrollOpacity);
  window.addEventListener("popstate", scheduleScrollOpacity);
  const onModalState = (e) => {
    isModalActive = !!e.detail?.open;
    scheduleScrollOpacity();
  };
  window.addEventListener("gw:modal-state", onModalState);

  const onResize = () => {
    resize();
    buildStarsCache();
    renderFrame();
    scheduleScrollOpacity();
  };
  window.addEventListener("resize", onResize);

  const themeObserver = new MutationObserver(() => {
    readThemeColors();
    buildStarsCache();
    renderFrame();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let animId = null;
  let isRunning = false;
  let lastTime = performance.now();

  const loop = (now) => {
    if (document.hidden) {
      isRunning = false;
      animId = null;
      return;
    }

    animId = requestAnimationFrame(loop);
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    if (!reducedMotion) {
      time += Math.min(dt, 0.033);
      renderFrame();
    }
  };

  const wakeLoop = () => {
    if (!isRunning && !document.hidden) {
      isRunning = true;
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wakeLoop();
  });

  wakeLoop();

  return () => {
    if (animId) cancelAnimationFrame(animId);
    if (scrollRafId) cancelAnimationFrame(scrollRafId);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", scheduleScrollOpacity);
    window.removeEventListener("hashchange", scheduleScrollOpacity);
    window.removeEventListener("popstate", scheduleScrollOpacity);
    window.removeEventListener("gw:modal-state", onModalState);
    themeObserver.disconnect();
  };
}
