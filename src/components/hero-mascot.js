// Interactive Hero Mascot: Pink Planet with Cool Sunglasses & Rings
export function initHeroMascot({ onInteract } = {}) {
  const canvas = document.getElementById("mascot-canvas");
  const container = document.getElementById("hero-mascot");
  const quoteEl = document.getElementById("mascot-quote");
  if (!canvas) return { destroy: () => {} };

  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy: () => {} };

  const quotes = [
    '"Stay cool & build systems" 🕶️',
    '"Sub-millisecond latency is my vibe" ⚡',
    '"FIFO price-time queues never lie" 📈',
    '"Orbiting with Shiv Kumar" 🚀',
    '"Cloud systems built for scale" ☁️',
    '"168 automated tests & counting" 🧪'
  ];

  let quoteIdx = 0;
  let bounce = 0;
  let bounceVel = 0;
  let sunglassesTilt = 0;
  let animId = null;
  let start = performance.now();

  const planet = {
    body: "#c98fb4",
    shade: "#9a6a89",
    ring: "#e2c6d8"
  };

  const draw = (now) => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const elapsed = (now - start) / 1000;

    // Physics spring bounce when tapped/clicked
    bounce += bounceVel;
    bounceVel *= 0.85;
    bounceVel -= bounce * 0.18;

    const cx = w / 2;
    // Gentle floating breathing bob
    const bob = Math.sin(elapsed * 2.4) * 3 + bounce * 14;
    const cy = h / 2 + bob;
    const r = w * 0.28;

    // 1. Back Ring half (angled elliptical orbit)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.32 + Math.sin(elapsed * 1.2) * 0.04);
    ctx.strokeStyle = planet.ring;
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = Math.max(3.2, 0.18 * r);
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.62 * r, 0.44 * r, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;

    // 2. Planet body sphere
    ctx.fillStyle = planet.body;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 3D Spherical shadow gradient
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = planet.shade;
    ctx.beginPath();
    ctx.arc(cx + 0.52 * r, cy + 0.36 * r, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;

    // 3. Sunglasses & Smirk Face
    const eyeSpacing = 0.34 * r;
    const eyeY = cy - 0.08 * r;
    const glassW = 0.38 * r;
    const glassH = 0.22 * r;

    ctx.save();
    ctx.translate(cx, eyeY);
    ctx.rotate(sunglassesTilt + Math.sin(elapsed * 2.8) * 0.02);

    // Dark cool sunglasses
    ctx.fillStyle = "rgba(22, 10, 42, 0.94)";
    ctx.beginPath();
    ctx.roundRect(-eyeSpacing - glassW / 2, -glassH / 2, glassW, glassH, 0.35 * glassH);
    ctx.roundRect(eyeSpacing - glassW / 2, -glassH / 2, glassW, glassH, 0.35 * glassH);
    ctx.fill();

    // Bridge
    ctx.lineWidth = Math.max(2, 0.05 * r);
    ctx.strokeStyle = "rgba(22, 10, 42, 0.94)";
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing + glassW / 2, 0);
    ctx.lineTo(eyeSpacing - glassW / 2, 0);
    ctx.stroke();

    // Specular shine glint
    const glintCycle = (elapsed * 0.9) % 2.5;
    if (glintCycle < 0.6) {
      const glintX = -eyeSpacing - glassW * 0.15 + (glintCycle / 0.6) * (glassW * 0.3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(glintX, -glassH * 0.15, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Cute smirk
    const mouthY = cy + 0.28 * r;
    const mouthW = 0.18 * r;
    ctx.strokeStyle = "rgba(22, 10, 42, 0.92)";
    ctx.lineWidth = Math.max(2.2, 0.052 * r);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, mouthY - 0.08 * r, mouthW, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();

    animId = requestAnimationFrame(draw);
  };

  animId = requestAnimationFrame(draw);

  // Click & tap interactions
  container?.addEventListener("click", () => {
    bounceVel = -1.8;
    sunglassesTilt = (Math.random() > 0.5 ? 1 : -1) * 0.18;
    setTimeout(() => { sunglassesTilt = 0; }, 350);

    quoteIdx = (quoteIdx + 1) % quotes.length;
    if (quoteEl) {
      quoteEl.textContent = quotes[quoteIdx];
    }

    if (onInteract) {
      onInteract();
    }
  });

  return {
    destroy: () => {
      if (animId) cancelAnimationFrame(animId);
    }
  };
}
