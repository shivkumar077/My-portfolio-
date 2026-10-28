// Interactive CoordinateField: snapped grid crosshairs, dynamic reticle tracking, (x, y) readout, and Konami code blueprint mode

export function initCoordinateField(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isFinePointer || isReducedMotion) {
    canvas.style.display = "none";
    return () => {};
  }

  let width = 0;
  let height = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let colors = { faint: "#cdc0ea", soft: "#584a77", accent: "#7b3fe4" };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    colors = {
      faint: cs.getPropertyValue("--ink-faint").trim() || "#cdc0ea",
      soft: cs.getPropertyValue("--ink-soft").trim() || "#584a77",
      accent: cs.getPropertyValue("--accent").trim() || "#7b3fe4"
    };
  };

  const themeObserver = new MutationObserver(readColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const pointer = { x: -9999, y: -9999, speed: 0, away: true };
  const target = { x: -9999, y: -9999 };
  let stillness = 1;
  let history = [];
  let blueprintAlpha = 0;
  let blueprintTimer = 0;
  let manualBlueprint = 0;

  const snap = (x, y) => ({
    x: 120 * Math.round(x / 120),
    y: 120 * Math.round(y / 120)
  });

  const drawCross = (cx, cy, scale, strokeColor, alpha) => {
    const r = 3 + 5 * scale;
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + cy - cy + r, cy + r);
    ctx.stroke();
  };

  let lastFrameTime = performance.now();
  let lastActiveTime = performance.now();
  let animId = null;

  const wakeLoop = () => {
    lastActiveTime = performance.now();
    if (!animId) {
      lastFrameTime = performance.now();
      animId = requestAnimationFrame(render);
    }
  };

  const render = (now) => {
    const dt = Math.min(0.08, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    ctx.clearRect(0, 0, width, height);

    if (blueprintTimer > 0) {
      blueprintTimer -= dt;
      if (blueprintTimer <= 0 && manualBlueprint === 0) blueprintTimer = 0;
    }

    const bpTarget = manualBlueprint > 0 || blueprintTimer > 0 ? 1 : 0;
    blueprintAlpha += (bpTarget - blueprintAlpha) * Math.min(1, 6 * dt);

    if (!pointer.away) {
      target.x += (pointer.x - target.x) * Math.min(1, 12 * dt);
      target.y += (pointer.y - target.y) * Math.min(1, 12 * dt);
    }
    pointer.speed *= Math.exp(-6 * dt);

    const speedDamping = Math.max(0, Math.min(1, 1 - pointer.speed / 1400));
    stillness += (speedDamping - stillness) * Math.min(1, 5 * dt);

    const influenceRadius = 180 * (1 + (1 - stillness) * 0.45);
    const intensity = 0.45 + 0.55 * stillness;

    // Blueprint grid when active
    if (blueprintAlpha > 0.01) {
      for (let x = 0; x <= width; x += 120) {
        for (let y = 0; y <= height; y += 120) {
          drawCross(x, y, 0.4, colors.faint, 0.55 * blueprintAlpha);
        }
      }
      ctx.globalAlpha = 0.25 * blueprintAlpha;
      ctx.strokeStyle = colors.faint;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 120) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += 120) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    // Recent clicks / snapped points history
    const currentTimeSec = now / 1000;
    history = history.filter((item) => currentTimeSec - item.born < 1.2);
    for (const h of history) {
      const progress = (currentTimeSec - h.born) / 1.2;
      drawCross(h.x, h.y, 0.3, colors.faint, (1 - progress) * 0.4);
    }

    // Interactive pointer reticle
    if (!pointer.away && target.x > -999 && blueprintAlpha < 0.9) {
      const fieldStrength = 1 - blueprintAlpha;
      const minX = Math.max(0, target.x - influenceRadius - 120);
      const maxX = Math.min(width, target.x + influenceRadius + 120);
      const minY = Math.max(0, target.y - influenceRadius - 120);
      const maxY = Math.min(height, target.y + influenceRadius + 120);

      const startX = 120 * Math.floor(minX / 120);
      const startY = 120 * Math.floor(minY / 120);

      for (let x = startX; x <= maxX; x += 120) {
        for (let y = startY; y <= maxY; y += 120) {
          const dist = Math.hypot(x - target.x, y - target.y);
          const ratio = 1 - dist / influenceRadius;
          if (ratio > 0.01) {
            const crossCol = ratio > 0.6 ? colors.soft : colors.faint;
            drawCross(x, y, ratio, crossCol, (0.2 + 0.55 * ratio) * intensity * fieldStrength);
          }
        }
      }

      // Reticle circle and coordinates
      const reticleStrength = Math.max(0, (stillness - 0.55) / 0.45);
      if (reticleStrength > 0.02) {
        const snapped = snap(target.x, target.y);

        ctx.globalAlpha = 0.7 * reticleStrength * fieldStrength;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(snapped.x, snapped.y, 4 + (1 - reticleStrength) * 6, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.globalAlpha = 0.45 * reticleStrength * fieldStrength;
        ctx.beginPath();
        ctx.moveTo(snapped.x + 7, snapped.y - 7);
        ctx.lineTo(snapped.x + 18, snapped.y - 18);
        ctx.stroke();

        ctx.globalAlpha = 0.6 * reticleStrength * fieldStrength;
        ctx.fillStyle = colors.accent;
        ctx.font = `10px "Spline Sans Mono", monospace, monospace`;
        ctx.fillText(`${snapped.x},${snapped.y}`, snapped.x + 21, snapped.y - 19);
      }
    }

    ctx.globalAlpha = 1;

    // Idle sleep check: if no pointer movement for 1.8s, history is clear, and blueprint is off, sleep the loop!
    if (now - lastActiveTime > 1800 && history.length === 0 && blueprintAlpha < 0.01 && bpTarget === 0) {
      animId = null;
      ctx.clearRect(0, 0, width, height);
      return;
    }

    animId = requestAnimationFrame(render);
  };

  // Pointer tracking
  let prevPos = null;
  let prevTime = 0;

  const onPointerMove = (e) => {
    const now = performance.now();
    const dt = prevTime ? Math.max(now - prevTime, 1) : 16;
    prevTime = now;

    if (!pointer.away && prevPos) {
      const dist = Math.hypot(e.clientX - prevPos.x, e.clientY - prevPos.y);
      pointer.speed += ((dist / dt) * 1000 - pointer.speed) * 0.25;
    }

    prevPos = { x: e.clientX, y: e.clientY };
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    if (pointer.away) {
      target.x = e.clientX;
      target.y = e.clientY;
      pointer.away = false;
    }

    const snapped = snap(e.clientX, e.clientY);
    if (Math.hypot(snapped.x - e.clientX, snapped.y - e.clientY) < 33.6) {
      const last = history[history.length - 1];
      if (!last || last.x !== snapped.x || last.y !== snapped.y) {
        history.push({ x: snapped.x, y: snapped.y, born: performance.now() / 1000 });
        if (history.length > 14) history.shift();
      }
    }
    wakeLoop();
  };

  const onPointerLeave = () => {
    pointer.away = true;
    pointer.speed = 0;
    wakeLoop();
  };

  const onScroll = () => {
    pointer.away = true;
    pointer.speed = 0;
  };

  // Konami Code sequence: Up Up Down Down Left Right Left Right B A
  const konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiIndex = 0;
  const onKeyDown = (e) => {
    if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        blueprintTimer = 4.0;
        window.dispatchEvent(new CustomEvent("gw:blueprint", { detail: true }));
        wakeLoop();
      }
    } else {
      konamiIndex = e.key.toLowerCase() === konamiSequence[0].toLowerCase() ? 1 : 0;
    }
  };

  const onCustomBlueprint = (e) => {
    manualBlueprint = e.detail ? 1 : 0;
    wakeLoop();
  };

  resize();
  readColors();
  wakeLoop();

  window.addEventListener("resize", () => {
    resize();
    wakeLoop();
  });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("gw:blueprint", onCustomBlueprint);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    themeObserver.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("gw:blueprint", onCustomBlueprint);
  };
}
