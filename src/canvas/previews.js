// Procedural mini canvas preview routines for Flagship Works and Lab Experiments

function s(e) {
  const t = 24713.531 * Math.sin(91.7 * e);
  return t - Math.floor(t);
}

// Work item procedural drawings
export const WORK_PREVIEWS = {
  "shadow-exchange": {
    warm: 3,
    maxAspect: null,
    draw: (ctx, t, bounds, colors, scale) => {
      const pad = 14 * scale;
      const left = bounds.x + pad;
      const right = bounds.x + bounds.w - pad;
      const top = bounds.y + pad;
      const bottom = bounds.y + bounds.h - pad;
      const w = right - left;
      const h = bottom - top;
      const midY = top + h * 0.48;
      const midX = left + w * 0.5;

      // 1. Grid lines (crisp & visible)
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.soft;
      ctx.globalAlpha = 0.35;

      // Horizontal price lines
      for (let i = 1; i <= 3; i++) {
        const y = top + (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      }

      // Vertical center divider (spread boundary)
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(midX, top);
      ctx.lineTo(midX, bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // 2. Order Book Depth Ladder (Enlarged):
      // Left = Bids (stepping up toward midX from left)
      // Right = Asks (stepping down away from midX to right)
      const levels = 8;
      const levelH = (h * 0.58) / levels;
      const maxDepthW = w * 0.42;

      // Bids (left side)
      for (let i = 0; i < levels; i++) {
        const y = midY - (i + 1) * levelH;
        const depthNoise = 0.55 + 0.35 * Math.sin(1.2 * t + i * 0.7) + 0.1 * Math.cos(2.8 * t + i);
        const barW = maxDepthW * ((i + 1) / levels) * depthNoise;
        const x = midX - barW;

        // Depth fill
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.32 + 0.08 * (i % 3);
        ctx.fillRect(x, y, barW, levelH - 1.5 * scale);

        // Price edge bar
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.95;
        ctx.fillRect(midX - barW, y, 3.5 * scale, levelH - 1.5 * scale);

        // Tick hash mark
        ctx.fillStyle = colors.soft;
        ctx.globalAlpha = 0.65;
        ctx.fillRect(midX - 8 * scale, y + levelH * 0.4, 6 * scale, 1.5 * scale);
      }

      // Asks (right side)
      for (let i = 0; i < levels; i++) {
        const y = midY + i * levelH;
        const depthNoise = 0.55 + 0.35 * Math.cos(1.1 * t + i * 0.8) + 0.1 * Math.sin(2.4 * t + i * 1.2);
        const barW = maxDepthW * ((i + 1) / levels) * depthNoise;

        ctx.fillStyle = colors.soft;
        ctx.globalAlpha = 0.28 + 0.08 * (i % 3);
        ctx.fillRect(midX, y, barW, levelH - 1.5 * scale);

        // Price edge bar
        ctx.fillStyle = colors.soft;
        ctx.globalAlpha = 0.95;
        ctx.fillRect(midX + barW - 3.5 * scale, y, 3.5 * scale, levelH - 1.5 * scale);

        ctx.fillStyle = colors.soft;
        ctx.globalAlpha = 0.65;
        ctx.fillRect(midX + 2 * scale, y + levelH * 0.4, 6 * scale, 1.5 * scale);
      }
      ctx.globalAlpha = 1;

      // 3. Oscillating Micro-Market Price Curve (Continuous matching price trace)
      const tracePad = 14 * scale;
      const traceLeft = left + tracePad;
      const traceW = w - 2 * tracePad;
      const traceBaseY = bottom - 20 * scale;
      const traceAmp = 18 * scale;

      ctx.lineWidth = 2.4 * scale;
      ctx.strokeStyle = colors.accent;
      ctx.beginPath();
      const points = 36;
      for (let i = 0; i <= points; i++) {
        const px = traceLeft + (traceW / points) * i;
        const phase = 1.4 * t + (i / points) * 6;
        const py = traceBaseY + Math.sin(phase) * traceAmp * 0.6 + Math.cos(phase * 1.8) * traceAmp * 0.4;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Price Head Pulsing Node (Latest matched limit order)
      const lastX = traceLeft + traceW;
      const lastPhase = 1.4 * t + 6;
      const lastY = traceBaseY + Math.sin(lastPhase) * traceAmp * 0.6 + Math.cos(lastPhase * 1.8) * traceAmp * 0.4;

      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Pulse ring
      const pulse = (t * 2.2) % 1;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 1 - pulse;
      ctx.beginPath();
      ctx.arc(lastX, lastY, (5 + pulse * 18) * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // 4. Spread & Microstructure Badges
      ctx.fillStyle = colors.soft;
      ctx.font = `${Math.max(9, Math.round(9 * scale))}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("SPREAD: 0.05", left + 4 * scale, top + 12 * scale);
      ctx.textAlign = "right";
      ctx.fillText("FIFO: SUB-MS", right - 4 * scale, top + 12 * scale);
      ctx.textAlign = "center";
      ctx.fillStyle = colors.accent;
      ctx.fillText("ORDER BOOK // LEVEL-2", midX, top + 12 * scale);
    }
  },

  astra: {
    warm: 3,
    maxAspect: null,
    draw: (ctx, t, bounds, colors, scale) => {
      const pad = 24 * scale;
      const cx = bounds.x + bounds.w / 2;
      const cy = bounds.y + bounds.h / 2;

      // Generously fill the simulation tile without clipping HUD or box borders
      const maxVert = Math.max(70, bounds.h * 0.5 - 46 * scale);
      const maxHoriz = Math.max(120, bounds.w * 0.5 - 40 * scale);

      // Target an orbit that fills ~75-80% of the available vertical half-span
      const semiMajor = Math.min(maxHoriz * 0.62, maxVert * 1.45);
      const semiMinor = semiMajor * 0.48;
      const planetR = Math.max(20, semiMajor * 0.36);
      const outerRingR = Math.min(semiMajor * 1.15, maxVert * 0.96);
      const innerRingR = outerRingR * 0.72;

      // 1. Celestial background crosshairs & range rings
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.soft;
      ctx.globalAlpha = 0.35;

      // Crosshair
      ctx.beginPath();
      ctx.moveTo(bounds.x + pad, cy);
      ctx.lineTo(bounds.x + bounds.w - pad, cy);
      ctx.moveTo(cx, bounds.y + pad + 20 * scale);
      ctx.lineTo(cx, bounds.y + bounds.h - pad);
      ctx.stroke();

      // Range rings
      ctx.beginPath();
      ctx.arc(cx, cy, innerRingR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, outerRingR, 0, Math.PI * 2);
      ctx.setLineDash([4 * scale, 6 * scale]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // 2. Central Planet Sphere with glowing atmosphere gradient
      const planetGrad = ctx.createRadialGradient(cx - planetR * 0.35, cy - planetR * 0.35, planetR * 0.08, cx, cy, planetR);
      planetGrad.addColorStop(0, colors.accent);
      planetGrad.addColorStop(0.55, colors.soft);
      planetGrad.addColorStop(1, colors.paper);
      ctx.fillStyle = planetGrad;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx.fill();

      // Atmosphere aura ring
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8 * scale;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx.stroke();

      // Planetary latitude / equator lines
      ctx.strokeStyle = colors.soft;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      for (let l = -1; l <= 1; l++) {
        const yOff = l * planetR * 0.45;
        const wOff = Math.sqrt(Math.max(0, planetR * planetR - yOff * yOff));
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, wOff, planetR * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 3. Inclined Keplerian Elliptical Orbit
      const orbitTilt = -0.30; // Clean tilt angle

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(orbitTilt);

      // Trajectory path (orbit ellipse)
      ctx.strokeStyle = colors.soft;
      ctx.lineWidth = 1.6 * scale;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.ellipse(0, 0, semiMajor, semiMinor, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Apoapsis and Periapsis markers
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(-semiMajor - 3.5 * scale, -3.5 * scale, 7 * scale, 7 * scale);
      ctx.fillRect(semiMajor - 3.5 * scale, -3.5 * scale, 7 * scale, 7 * scale);

      // 4. Spacecraft Node propagating along Keplerian orbit
      const orbitalSpeed = 0.5; // rad/sec
      const theta = (t * orbitalSpeed) % (Math.PI * 2);
      const scX = semiMajor * Math.cos(theta);
      const scY = semiMinor * Math.sin(theta);

      // Velocity tangent vector
      const tanX = -semiMajor * Math.sin(theta);
      const tanY = semiMinor * Math.cos(theta);
      const tanLen = Math.sqrt(tanX * tanX + tanY * tanY) || 1;
      const vecLen = 22 * scale;
      const nx = (tanX / tanLen) * vecLen;
      const ny = (tanY / tanLen) * vecLen;

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(scX, scY);
      ctx.lineTo(scX + nx, scY + ny);
      ctx.stroke();

      // Spacecraft core marker
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(scX, scY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Telemetry 5 Hz pulse waves from spacecraft
      const pingProgress = (t * 2.5) % 1;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.85 * (1 - pingProgress);
      ctx.beginPath();
      ctx.arc(scX, scY, (5 + pingProgress * 18) * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // 5. Aerospace HUD Telemetry Overlays
      ctx.fillStyle = colors.soft;
      ctx.font = `${Math.max(10, Math.round(11 * scale))}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("STREAM: 5 HZ STOMP", bounds.x + pad, bounds.y + pad + 14 * scale);
      ctx.fillText("ORBIT: KEPLER LEO", bounds.x + pad, bounds.y + pad + 30 * scale);
      ctx.textAlign = "right";
      ctx.fillText("VEL: 7.66 KM/S", bounds.x + bounds.w - pad, bounds.y + pad + 14 * scale);
      ctx.fillText("INC: 51.6°", bounds.x + bounds.w - pad, bounds.y + pad + 30 * scale);
    }
  },

  "forge-fit": {
    warm: 3,
    maxAspect: null,
    draw: (ctx, t, bounds, colors, scale) => {
      const pad = 16 * scale;
      const left = bounds.x + pad;
      const right = bounds.x + bounds.w - pad;
      const top = bounds.y + pad;
      const bottom = bounds.y + bounds.h - pad;
      const w = right - left;
      const h = bottom - top;
      if (w <= 0 || h <= 0) return;

      const chartTop = top + 26 * scale;
      const chartBottom = bottom - 26 * scale;
      const chartH = chartBottom - chartTop;

      // 1. Grid lines and schedule boundary bands
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.soft;
      ctx.globalAlpha = 0.28;

      // Horizontal latency thresholds
      for (let i = 1; i <= 3; i++) {
        const y = chartBottom - (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      }

      // Schedule phases: Phase 1 (Baseline: 0 -> 32%), Phase 2 (Ramped Faults: 32% -> 74%), Phase 3 (Clamped Recovery: 74% -> 100%)
      const phase1X = left + w * 0.32;
      const phase2X = left + w * 0.74;

      // Fault injection zone background tint
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.05;
      ctx.fillRect(phase1X, chartTop, phase2X - phase1X, chartH);

      // Phase divider dashed lines
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.strokeStyle = colors.soft;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(phase1X, chartTop);
      ctx.lineTo(phase1X, chartBottom);
      ctx.moveTo(phase2X, chartTop);
      ctx.lineTo(phase2X, chartBottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // 2. Deadline Safety Clamp Threshold Line
      const clampY = chartTop + 14 * scale;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(left, clampY);
      ctx.lineTo(right, clampY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Adaptive Latency Waveform Curve with area fill
      const points = 48;
      const pts = [];
      const baseY = chartBottom - 10 * scale;
      const maxRise = baseY - clampY;

      for (let i = 0; i <= points; i++) {
        const u = i / points;
        const px = left + u * w;
        let py = baseY;

        if (u < 0.32) {
          // Stable baseline zone with small natural latency jitter
          const jit = Math.sin(1.8 * t + u * 18) * 4 * scale + Math.cos(3.2 * t + u * 24) * 2.5 * scale;
          py = baseY - 8 * scale + jit;
        } else if (u < 0.74) {
          // Escalating fault & latency zone: progressive ramp with step spikes
          const prog = (u - 0.32) / (0.74 - 0.32);
          const ramp = Math.pow(prog, 1.4) * maxRise;
          const jitter = Math.sin(2.5 * t + u * 28) * (8 + prog * 16) * scale + Math.sin(6.1 * t + i * 2.2) * 5 * scale;
          py = baseY - ramp - jitter;
        } else {
          // Clamped recovery zone: clamped horizontally at deadline ceiling with residual turbulence
          const recoverProg = (u - 0.74) / 0.26;
          const targetY = clampY + (recoverProg * 0.45 * maxRise);
          const jitter = Math.sin(1.6 * t + u * 15) * 5 * scale;
          py = targetY + jitter;
        }

        // Hard clamp at safety ceiling line (deadline clamp guarantee)
        if (py < clampY) py = clampY;
        pts.push({ x: px, y: py, u });
      }

      // Shaded area under the curve
      const areaGrad = ctx.createLinearGradient(0, clampY, 0, chartBottom);
      areaGrad.addColorStop(0, colors.accent);
      areaGrad.addColorStop(0.7, colors.soft);
      areaGrad.addColorStop(1, colors.paper);
      ctx.fillStyle = areaGrad;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.moveTo(left, chartBottom);
      for (let i = 0; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.lineTo(right, chartBottom);
      ctx.closePath();
      ctx.fill();

      // Main Latency Trace Line
      ctx.lineWidth = 2.4 * scale;
      ctx.strokeStyle = colors.accent;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // 4. Injected Simulated Fault Markers
      const faultIndices = [18, 24, 30, 36];
      for (let f = 0; f < faultIndices.length; f++) {
        const idx = faultIndices[f];
        if (idx < pts.length) {
          const fp = pts[idx];
          const pulse = (t * 2.2 + f * 0.4) % 1;

          // Expanding fault shockwave ring
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.85 * (1 - pulse);
          ctx.beginPath();
          ctx.arc(fp.x, fp.y, (4 + pulse * 14) * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Fault diamond marker
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = colors.accent;
          ctx.save();
          ctx.translate(fp.x, fp.y);
          ctx.rotate(Math.PI / 4);
          const sz = 4.5 * scale;
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          ctx.restore();

          // Fault classification label
          if (scale >= 1.0) {
            ctx.fillStyle = colors.accent;
            ctx.font = `${Math.max(8, Math.round(8 * scale))}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(f % 2 === 0 ? "504 TO" : "500 ERR", fp.x, fp.y - 8 * scale);
          }
        }
      }
      ctx.globalAlpha = 1;

      // 5. Active Probe Playhead
      const playSpeed = 0.14;
      const playheadProgress = (t * playSpeed) % 1;
      const playheadX = left + playheadProgress * w;

      const pIdx = Math.min(pts.length - 2, Math.max(0, Math.floor(playheadProgress * (pts.length - 1))));
      const frac = playheadProgress * (pts.length - 1) - pIdx;
      const probeY = pts[pIdx].y + (pts[pIdx + 1].y - pts[pIdx].y) * frac;

      // Vertical scanner cursor line
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(playheadX, chartTop);
      ctx.lineTo(playheadX, chartBottom);
      ctx.stroke();

      // Probe active dot & beacon
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(playheadX, probeY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Probe pulse ring
      const probePulse = (t * 3.0) % 1;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 1 - probePulse;
      ctx.beginPath();
      ctx.arc(playheadX, probeY, (5 + probePulse * 16) * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // 6. Packet stream rail at bottom
      const railY = bottom - 8 * scale;
      ctx.strokeStyle = colors.soft;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(left, railY);
      ctx.lineTo(right, railY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const packetCount = Math.max(10, Math.min(24, Math.round(w / (32 * scale))));
      for (let p = 0; p < packetCount; p++) {
        const pU = ((p / packetCount) + t * 0.18) % 1;
        const pktX = left + pU * w;
        const isFaultZone = pU >= 0.32 && pU <= 0.74;
        const isFaulted = isFaultZone && (p % 3 === 0);

        ctx.fillStyle = isFaulted ? colors.accent : colors.soft;
        ctx.globalAlpha = isFaulted ? 0.9 : 0.45;
        if (isFaulted) {
          ctx.fillRect(pktX - 2.5 * scale, railY - 2.5 * scale, 5 * scale, 5 * scale);
        } else {
          ctx.beginPath();
          ctx.arc(pktX, railY, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // 7. Micro-HUD Readouts & Badges
      ctx.fillStyle = colors.soft;
      ctx.font = `${Math.max(9, Math.round(9 * scale))}px monospace`;

      ctx.textAlign = "left";
      ctx.fillText("SCHEDULE: STEP / RAMP", left + 4 * scale, top + 12 * scale);
      ctx.fillText("P95: 142MS · SEED: 0x4B", left + 4 * scale, bottom);

      ctx.textAlign = "right";
      ctx.fillStyle = colors.accent;
      ctx.fillText("DEADLINE CLAMP: 2500MS", right - 4 * scale, top + 12 * scale);
      ctx.fillStyle = colors.soft;
      ctx.fillText("DISPATCH: 0-DEP CORE", right - 4 * scale, bottom);

      ctx.textAlign = "center";
      ctx.fillStyle = colors.accent;
      ctx.fillText("RESILIENCE ENGINE // INJECTION MONITOR", bounds.x + bounds.w / 2, top + 12 * scale);
    }
  },

  forgefit: {
    warm: 3,
    maxAspect: null,
    draw: (ctx, t, bounds, colors, scale) => {
      WORK_PREVIEWS["forge-fit"].draw(ctx, t, bounds, colors, scale);
    }
  },

  tensor: {
    warm: 3,
    maxAspect: 2.6,
    draw: (ctx, t, bounds, colors, scale) => {
      const cx = bounds.x + 0.36 * bounds.w;
      const cy = bounds.y + bounds.h / 2;
      const step = 0.09 * bounds.h;
      const angle = 0.4 * t;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // 3D Point cloud rotating
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          for (let k = 0; k < 4; k++) {
            const x0 = (i - 1.5) * step;
            const y0 = (j - 1.5) * step;
            const z0 = (k - 1.5) * step;
            const rx = x0 * cosA - z0 * sinA;
            const rz = x0 * sinA + z0 * cosA;
            const persp = 1 / (1 + rz / (14 * step));
            const depthAlpha = (rz + 2 * step) / (4 * step);

            ctx.fillStyle = (i + j + k) % 7 === 0 ? colors.accent : colors.soft;
            ctx.globalAlpha = 0.25 + 0.6 * depthAlpha;
            const pointSize = 2.4 * scale * persp;
            ctx.fillRect(cx + rx * persp - pointSize / 2, cy + y0 * persp - pointSize / 2, pointSize, pointSize);
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.faint;
      ctx.fillRect(bounds.x + 0.56 * bounds.w, cy - 2 * scale, 10 * scale, Math.max(1, scale));
      ctx.fillRect(bounds.x + 0.56 * bounds.w, cy + 3 * scale, 10 * scale, Math.max(1, scale));

      // Decomposition factor columns
      const colW = 9 * scale;
      const colH = 6.5 * scale;
      const colGap = 8 * scale;
      const startX = bounds.x + 0.68 * bounds.w;

      for (let col = 0; col < 3; col++) {
        const xPos = startX + col * (colW + colGap);
        for (let row = 0; row < 8; row++) {
          ctx.fillStyle = col === 1 ? colors.accent : colors.soft;
          ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(0.8 * t + 2 * col + row));
          ctx.fillRect(xPos, cy - 4 * colH + row * (colH + 2 * scale), colW, colH);
        }
      }
      ctx.globalAlpha = 1;
    }
  },

  market: {
    warm: 3,
    maxAspect: null,
    draw: (ctx, t, bounds, colors, scale) => {
      const pad = 16 * scale;
      const left = bounds.x + pad;
      const w = bounds.w - 2 * pad;
      const midY = bounds.y + 0.52 * bounds.h;
      const amp = 0.09 * bounds.h;

      ctx.lineWidth = 1;
      const wave = (x, offset, a) => midY + Math.sin(6 * x + 0.9 * t + offset) * a + Math.sin(13 * x + 0.5 * t + 2 * offset) * a * 0.4;

      const drawCurve = (offset, strokeCol, a) => {
        ctx.strokeStyle = strokeCol;
        ctx.beginPath();
        for (let x = 0; x <= 1; x += 0.01) {
          const px = left + x * w;
          const py = wave(x, offset, a);
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      };

      drawCurve(0, colors.soft, amp);
      drawCurve(1.8, colors.faint, 1.15 * amp);

      // Edge gaps and target indicators
      const step = w > 600 ? 0.07 : 0.16;
      for (let x = 0.08; x < 1; x += step) {
        const y1 = wave(x, 0, amp);
        const y2 = wave(x, 1.8, 1.15 * amp);
        if (Math.abs(y1 - y2) > 0.09 * bounds.h) {
          const px = left + x * w;
          ctx.strokeStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(px, Math.min(y1, y2));
          ctx.lineTo(px, Math.max(y1, y2));
          ctx.stroke();
          ctx.fillStyle = colors.accent;
          ctx.fillRect(px - 2 * scale, Math.min(y1, y2) - 2 * scale, 4 * scale, 4 * scale);
        }
      }

      // Bar chart at bottom
      const bars = Math.max(12, Math.min(48, Math.round(w / (26 * scale))));
      for (let b = 0; b < bars; b++) {
        const active = s(b + 5) > 0.35;
        ctx.fillStyle = active ? colors.soft : colors.faint;
        const barH = (active ? 8 : 4) * scale;
        ctx.fillRect(left + (w / bars) * b, bounds.y + bounds.h - pad - barH, 6 * scale, barH);
      }
    }
  },

  timeline: {
    warm: 2.4,
    maxAspect: 4.5,
    draw: (ctx, t, bounds, colors, scale) => {
      const pad = 18 * scale;
      const left = bounds.x + pad;
      const right = bounds.x + bounds.w - pad;
      const w = right - left;
      const playheadX = left + ((0.18 * t) % 1) * w;
      const keyCount = Math.max(5, Math.min(18, Math.round(w / (70 * scale))));

      // 4 Keyframe track lanes
      for (let lane = 0; lane < 4; lane++) {
        const laneY = bounds.y + 0.34 * bounds.h + lane * (0.15 * bounds.h);
        ctx.strokeStyle = colors.faint;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, laneY);
        ctx.lineTo(right, laneY);
        ctx.stroke();

        for (let k = 0; k < keyCount; k++) {
          const kx = left + ((k + 0.5) / keyCount + (s(31 * lane + k) - 0.5) * 0.05) * w;
          const isNear = Math.abs(kx - playheadX) < 14 * scale;
          ctx.fillStyle = isNear ? colors.accent : colors.soft;
          ctx.save();
          ctx.translate(kx, laneY);
          ctx.rotate(Math.PI / 4);
          const diam = (isNear ? 4.8 : 3.2) * scale;
          ctx.fillRect(-diam / 2, -diam / 2, diam, diam);
          ctx.restore();
        }
      }

      // Bezier curve preview window
      const curveW = 62 * scale;
      const curveH = 30 * scale;
      const curveY = bounds.y + 0.22 * bounds.h;
      ctx.strokeStyle = colors.faint;
      ctx.strokeRect(left, curveY - curveH, curveW, curveH);
      ctx.strokeStyle = colors.soft;
      ctx.beginPath();
      for (let p = 0; p <= 1; p += 0.02) {
        const ease = 1 - Math.pow(1 - p, 3);
        const px = left + p * curveW;
        const py = curveY - ease * curveH;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Playhead vertical line
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(playheadX, bounds.y + 0.28 * bounds.h);
      ctx.lineTo(playheadX, bounds.y + 0.86 * bounds.h);
      ctx.stroke();
    }
  },

  world: {
    warm: 4,
    maxAspect: null,
    draw: (ctx, t, bounds, colors) => {
      ctx.lineWidth = 1;
      for (let line = 0; line < 9; line++) {
        const baseY = bounds.y + 0.2 * bounds.h + (line / 9) * bounds.h * 0.65;
        const phase = 0.25 * t + 0.7 * line;
        const isCenter = line === Math.floor(4.5);
        ctx.strokeStyle = isCenter ? colors.accent : line % 2 ? colors.faint : colors.soft;
        ctx.globalAlpha = isCenter ? 0.9 : 0.7;
        ctx.beginPath();
        for (let p = 0; p <= 1; p += 0.01) {
          const harmonic = 0.5 * Math.sin(5 * p + phase) + 0.3 * Math.sin(11 * p + 1.6 * phase) + 0.2 * Math.sin(23 * p + 0.4 * phase);
          const px = bounds.x + p * bounds.w;
          const py = baseY - Math.max(0, harmonic) * bounds.h * 0.18 * (1 - Math.abs(p - 0.5));
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  },

  card: {
    warm: 9,
    maxAspect: 1.8,
    draw: (ctx, t, bounds, colors, scale) => {
      const cardW = Math.min(0.42 * bounds.w, 0.62 * bounds.h);
      const cardH = 1.4 * cardW;
      const left = bounds.x + (bounds.w - cardW) / 2;
      const top = bounds.y + (bounds.h - cardH) / 2;
      const animProgress = 0.55 * t;

      ctx.strokeStyle = colors.soft;
      ctx.lineWidth = 1;
      ctx.strokeRect(left, top, cardW, cardH);
      ctx.strokeStyle = colors.faint;
      ctx.beginPath();
      ctx.moveTo(left, top + 0.52 * cardH);
      ctx.lineTo(left + cardW, top + 0.52 * cardH);
      ctx.stroke();

      // Top badge
      if (animProgress > 0.4) {
        ctx.fillStyle = colors.accent;
        ctx.fillRect(left + 8 * scale, top + 9 * scale, 15 * scale, 11 * scale);
        ctx.fillStyle = colors.soft;
        ctx.fillRect(left + 8 * scale, top + 23 * scale, 11 * scale, 4 * scale);
      }

      // Avatar
      if (animProgress > 1.2) {
        ctx.fillStyle = colors.faint;
        const avX = left + 0.62 * cardW;
        const avY = top + 0.3 * cardH;
        ctx.beginPath();
        ctx.arc(avX, avY, 0.11 * cardW, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(avX, avY + 0.24 * cardW, 0.19 * cardW, Math.PI, 0);
        ctx.fill();
      }

      // 6 Stat rating bars
      for (let bar = 0; bar < 6; bar++) {
        const barY = top + 0.58 * cardH + 0.062 * cardH * bar;
        const maxBarW = cardW - 16 * scale;
        ctx.strokeStyle = colors.faint;
        ctx.strokeRect(left + 8 * scale, barY, maxBarW, 3 * scale);

        const thresh = 2 + 0.35 * bar;
        if (animProgress < thresh) continue;
        const barFillProgress = Math.min(1, (animProgress - thresh) * 2.2);
        const factor = (0.4 + 0.55 * s(bar + 3)) * (0.94 + 0.06 * Math.sin(0.9 * t + bar));
        ctx.fillStyle = bar === 2 ? colors.accent : colors.soft;
        ctx.fillRect(left + 8 * scale, barY, maxBarW * barFillProgress * factor, 3 * scale);
      }
    }
  }
};

// Lab interactive procedural drawings
export const LAB_PREVIEWS = {
  SIMULATION: (ctx, t, width, height, inkSoft, accent) => {
    const cluster = Math.min(1, 0.35 * t);
    for (let i = 0; i < 34; i++) {
      const rx = width * (0.1 + 0.8 * s(i + 1));
      const ry = height * (0.1 + 0.8 * s(i + 61));
      const group = i % 3;
      const targetX = rx + (width * (0.26 + 0.24 * group) - rx) * cluster + 2.5 * Math.sin(0.9 * t + i);
      const targetY = ry + (height * (0.38 + (group % 2) * 0.26) - ry) * cluster + 2.5 * Math.cos(0.8 * t + 1.3 * i);
      ctx.fillStyle = i % 11 === 0 ? accent : inkSoft;
      ctx.globalAlpha = i % 11 === 0 ? 0.55 : 0.3;
      ctx.fillRect(targetX, targetY, 2, 2);
    }
    ctx.globalAlpha = 1;
  },

  "CAUSAL ENGINE": (ctx, t, width, height, inkSoft, accent) => {
    const depthLevel = 5 * Math.min(1, 0.4 * t);
    ctx.lineWidth = 1;

    const branch = (bx, by, span, depth) => {
      if (depth >= 5) return;
      const nextY = by + height / 6.5;
      for (const dir of [-1, 1]) {
        const nextX = bx + dir * span;
        const isCurrent = depth < depthLevel;
        ctx.strokeStyle = depth === 0 && isCurrent ? accent : inkSoft;
        ctx.globalAlpha = isCurrent ? (depth === 0 ? 0.6 : 0.3 - 0.04 * depth) : 0.08;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
        branch(nextX, nextY, 0.55 * span, depth + 1);
      }
    };

    branch(width / 2, 0.12 * height, 0.22 * width, 0);
    ctx.globalAlpha = 1;
  },

  INTERACTION: (ctx, t, width, height, inkSoft, accent) => {
    const palmX = 0.5 * width + Math.sin(0.7 * t) * width * 0.12;
    const palmY = 0.62 * height + Math.cos(0.5 * t) * height * 0.08;

    const fingers = Array.from({ length: 5 }, (_, i) => {
      const angle = -Math.PI / 2 + (i - 2) * 0.42 + 0.08 * Math.sin(t + i);
      const len = height * (0.2 + 0.06 * s(i + 3));
      return { x: palmX + Math.cos(angle) * len, y: palmY + Math.sin(angle) * len };
    });

    ctx.strokeStyle = inkSoft;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    for (const f of fingers) {
      ctx.beginPath();
      ctx.moveTo(palmX, palmY);
      ctx.lineTo(f.x, f.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.5;
    for (const f of fingers) {
      ctx.fillStyle = inkSoft;
      ctx.fillRect(f.x - 1.5, f.y - 1.5, 3, 3);
    }

    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(palmX - 2, palmY - 2, 4, 4);
    ctx.globalAlpha = 1;
  },

  "TINY APP": (ctx, t, width, height, inkSoft, accent) => {
    const cellSize = Math.min(width / 16, height / 8);
    const startX = (width - 12 * cellSize) / 2;
    const startY = (height - 5 * cellSize) / 2;
    const count = Math.floor((6 * t) % 68);

    for (let c = 0; c < 60; c++) {
      const cellX = startX + (c % 12) * cellSize;
      const cellY = startY + Math.floor(c / 12) * cellSize;
      const isLit = c < count;
      ctx.globalAlpha = isLit ? 0.34 : 0.1;
      ctx.fillStyle = isLit && c === count - 1 ? accent : inkSoft;
      ctx.fillRect(cellX + 1, cellY + 1, cellSize - 3, cellSize - 3);
    }
    ctx.globalAlpha = 1;
  },

  INTERFACE: (ctx, t, width, height, inkSoft, accent) => {
    const lineSpacing = height / 7;
    const margin = 0.12 * width;
    const progress = (1.6 * t) % 6.4;

    for (let line = 0; line < 5; line++) {
      const lineProg = Math.max(0, Math.min(1, progress - line));
      if (lineProg <= 0) continue;
      const lineW = (width - 2 * margin) * (0.35 + 0.6 * s(line + 7)) * lineProg;
      ctx.fillStyle = inkSoft;
      ctx.globalAlpha = 0.26;
      ctx.fillRect(margin, lineSpacing * (line + 1), lineW, 2);
      if (lineProg < 1) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(margin + lineW + 2, lineSpacing * (line + 1) - 3, 5, 8);
      }
    }
    ctx.globalAlpha = 1;
  }
};
