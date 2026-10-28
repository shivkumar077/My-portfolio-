// Case Study Modal / Fullscreen Viewer Component for Flagship Works
// Matches Gary Wang's exact visual design, typography, live simulation framing, and section navigation

import { WORK_PREVIEWS } from "../canvas/previews.js";

export function initCaseStudyModal({ workItems, getStrings }) {
  let activeSlug = null;
  let lastActiveSlug = null;
  let animId = null;

  const modal = document.createElement("div");
  modal.className = "case-study-modal fixed inset-0 z-[80] overflow-y-auto transition-opacity duration-200";
  modal.style.display = "none";
  modal.innerHTML = `
    <!-- Fixed Backdrop with frosted blur and light/dark theme background tint (isolated from text) -->
    <div class="case-study-backdrop fixed inset-0 pointer-events-none" aria-hidden="true"></div>

    <!-- Main Content Container (generous bottom whitespace/background padding) -->
    <main id="case-study-main" class="relative z-10 mx-auto max-w-5xl px-margin pb-48 md:pb-56 pt-24 md:pt-36">
      <article>
        <!-- Header Section -->
        <header class="mb-14">
          <p class="case-study-breadcrumb meta mb-6 text-accent-ink text-xs tracking-wider"></p>
          <div class="overflow-hidden">
            <h1 class="case-study-title display font-medium text-ink" style="font-size: clamp(2.25rem, 7.8vw, 6.8rem); line-height: 0.95; letter-spacing: -0.03em;"></h1>
          </div>
          <p class="case-study-desc mt-8 max-w-[56ch] text-lg sm:text-xl leading-relaxed text-ink-soft"></p>

          <!-- Metadata 2-Row Grid: Clean whitespace, NO divider line between rows -->
          <div class="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <span class="meta block text-ink-label">ROLE</span>
              <span class="case-study-role case-study-meta-val mt-1.5 block"></span>
            </div>
            <div>
              <span class="meta block text-ink-label">YEAR</span>
              <span class="case-study-year case-study-meta-val mt-1.5 block"></span>
            </div>
            <div>
              <span class="meta block text-ink-label">CATEGORY</span>
              <span class="case-study-category case-study-meta-val mt-1.5 block"></span>
            </div>
            <div>
              <span class="meta block text-ink-label">STATUS</span>
              <span class="case-study-status case-study-meta-val mt-1.5 block"><span class="text-accent-ink"></span></span>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div class="md:col-span-3">
              <span class="meta block text-ink-label">STACK</span>
              <div class="case-study-stack mt-1.5"></div>
            </div>
            <div>
              <span class="meta block text-ink-label">LINKS</span>
              <div class="case-study-links mt-1.5 flex flex-col items-start gap-1"></div>
            </div>
          </div>

          <!-- Live Simulation Graph Box (2x bigger, takes ~48% of screen height, crisp opaque surface without blur) -->
          <div class="mt-14 border border-hairline bg-paper-raised">
            <div class="flex h-8 items-center justify-between border-b border-hairline px-4">
              <span class="case-study-sim-label meta text-ink-soft"></span>
              <span class="case-study-sim-tag meta text-accent-ink"></span>
            </div>
            <div class="w-full relative overflow-hidden" style="height: clamp(280px, 44vh, 620px);">
              <canvas class="case-study-canvas h-full w-full block" style="display: block; width: 100%; height: 100%;"></canvas>
            </div>
          </div>

          <!-- Section Navigation Bar: Sitting directly on the background (no tile, no box, no background) -->
          <nav aria-label="Contents" class="case-study-nav mt-14 py-4 sticky top-4 z-20">
            <ul class="case-study-nav-list" style="display: flex; flex-wrap: wrap; align-items: center; gap: 2.25rem; row-gap: 0.85rem; list-style: none; padding: 0; margin: 0;"></ul>
          </nav>
        </header>

        <!-- Detailed 7 Sections (Generously spaced with 5rem padding per section) -->
        <div class="case-study-sections flex flex-col"></div>
      </article>

      <!-- Footer Navigation & Next Specimen (with generous whitespace & background space) -->
      <div class="rule mt-28 md:mt-32 grid grid-cols-4 gap-4 pt-10 md:pt-12 md:grid-cols-12 border-t border-hairline">
        <button type="button" class="case-study-back-bottom u-link meta col-span-2 w-fit text-ink-soft hover:text-ink cursor-pointer" data-cursor="OPEN">
          ← <span class="back-text">BACK TO INDEX</span>
        </button>
        <div class="col-span-2 md:col-span-6 md:col-start-7 md:text-right">
          <span class="meta block text-ink-label">NEXT SPECIMEN</span>
          <button type="button" class="case-study-next-btn display mt-1 inline-block text-2xl font-medium text-ink transition-colors hover:text-accent-ink cursor-pointer" data-cursor="VIEW"></button>
        </div>
      </div>
    </main>
  `;
  document.body.appendChild(modal);

  const canvas = modal.querySelector(".case-study-canvas");
  const ctx = canvas.getContext("2d");

  const close = (skipHistory, noScroll) => {
    const slugToRestore = activeSlug || lastActiveSlug;
    activeSlug = null;
    modal.style.display = "none";
    document.body.style.overflow = "";
    const mainEl = document.getElementById("main");
    if (mainEl) mainEl.style.display = "";
    if (animId) cancelAnimationFrame(animId);
    window.dispatchEvent(new CustomEvent("gw:modal-state", { detail: { open: false } }));

    if (!skipHistory && window.location.hash.startsWith("#work-")) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = "#work";
      }
    }

    if (!noScroll && slugToRestore) {
      setTimeout(() => {
        const targetCard = document.querySelector(`.work-card-link[data-slug="${slugToRestore}"]`) || document.getElementById("work");
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 40);
    }
  };

  modal.querySelector(".case-study-back-bottom")?.addEventListener("click", () => {
    if (window.location.hash.startsWith("#work-")) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        close();
      }
    } else {
      close();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeSlug) {
      if (window.location.hash.startsWith("#work-")) {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          close();
        }
      } else {
        close();
      }
    }
  });

  const open = (slug) => {
    const itemIndex = workItems.findIndex((w) => w.slug === slug);
    if (itemIndex === -1) return;
    const item = workItems[itemIndex];
    const nextItem = workItems[(itemIndex + 1) % workItems.length];

    activeSlug = slug;
    lastActiveSlug = slug;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
    window.dispatchEvent(new CustomEvent("gw:modal-state", { detail: { open: true } }));

    // Hide main index page so its text doesn't show through the wallpaper
    const mainEl = document.getElementById("main");
    if (mainEl) mainEl.style.display = "none";

    // Also hide any floating preview card
    const floatingCard = document.querySelector(".floating-preview-card");
    if (floatingCard) {
      floatingCard.style.display = "none";
      floatingCard.classList.remove("opacity-100");
      floatingCard.classList.add("opacity-0");
    }

    const s = getStrings();
    modal.querySelectorAll(".back-text").forEach((el) => (el.textContent = s.backToIndex || "BACK TO INDEX"));

    modal.querySelector(".case-study-breadcrumb").textContent = `${item.index} — CASE FILE`;
    modal.querySelector(".case-study-title").textContent = item.title;
    modal.querySelector(".case-study-desc").textContent = item.description;

    modal.querySelector(".case-study-role").textContent = item.role;
    modal.querySelector(".case-study-year").textContent = item.year;
    modal.querySelector(".case-study-category").textContent = item.category;
    modal.querySelector(".case-study-status span").textContent = item.status;

    // Stack: Format into exactly 2 clean rows, splitting directly after React 18
    const stackEl = modal.querySelector(".case-study-stack");
    let row1 = [];
    let row2 = [];

    if (item.tech && item.tech.length > 0) {
      // Split strictly after React (so TypeScript begins row 2 below Java 21)
      const reactIdx = item.tech.findIndex((t) => /react/i.test(t));
      if (reactIdx !== -1 && reactIdx < item.tech.length - 1) {
        row1 = item.tech.slice(0, reactIdx + 1);
        row2 = item.tech.slice(reactIdx + 1);
      } else if (item.tech.length <= 3) {
        row1 = item.tech;
      } else {
        const mid = Math.ceil(item.tech.length / 2);
        row1 = item.tech.slice(0, mid);
        row2 = item.tech.slice(mid);
      }
    }

    const row1Html = row1.join(" · ");
    const row2Html = row2.length > 0 ? row2.join(" · ") : "";

    stackEl.innerHTML = `
      <div class="case-study-stack-container" style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%;">
        <div class="case-study-stack-row" style="display: block; width: 100%; color: var(--ink); font-size: 0.9375rem; line-height: 1.5;">${row1Html}</div>
        ${row2Html ? `<div class="case-study-stack-row" style="display: block; width: 100%; color: var(--ink); font-size: 0.9375rem; line-height: 1.5;">${row2Html}</div>` : ""}
      </div>
    `;

    // Links: Live Site on top, GitHub directly under it
    const linksEl = modal.querySelector(".case-study-links");
    const linkItems = [];
    if (item.links?.live) {
      linkItems.push(`
        <a href="${item.links.live}" target="_blank" rel="noopener noreferrer" class="case-study-link-item u-link hover:underline" data-cursor="PLAY" style="color: var(--accent-ink); display: inline-flex; align-items: center; gap: 0.35rem;">
          <span>LIVE SITE</span> <span aria-hidden="true">↗</span>
        </a>
      `);
    }
    if (item.links?.github) {
      linkItems.push(`
        <a href="${item.links.github}" target="_blank" rel="noopener noreferrer" class="case-study-link-item u-link hover:underline" data-cursor="CODE" style="color: var(--ink); display: inline-flex; align-items: center; gap: 0.35rem;">
          <span>GITHUB</span> <span aria-hidden="true">↗</span>
        </a>
      `);
    }
    linksEl.innerHTML = linkItems.join("") || "—";

    // Simulation Header
    modal.querySelector(".case-study-sim-label").textContent = `${item.index} / LIVE SIMULATION`;
    modal.querySelector(".case-study-sim-tag").textContent = item.simTag || "SIMULATION";

    // Build Nav List & Sections
    const navListEl = modal.querySelector(".case-study-nav-list");
    const sectionsContainer = modal.querySelector(".case-study-sections");
    const sections = item.caseStudy?.sections || [];

    // Render clickable tabs with explicit margin-right and item gaps
    navListEl.innerHTML = sections
      .map(
        (sec) => `
        <li class="case-study-nav-item">
          <a href="#${sec.id}" data-sec-target="${sec.id}" class="section-nav-link u-link meta text-ink-soft hover:text-ink cursor-pointer transition-colors" style="display: inline-flex; align-items: baseline; gap: 0.6rem; text-decoration: none;">
            <span class="text-ink-label font-mono text-xs" style="color: var(--accent); font-weight: 600;">${sec.num}</span>
            <span class="text-xs uppercase tracking-wider" style="letter-spacing: 0.08em; font-family: var(--font-spline-mono), monospace;">${sec.title}</span>
          </a>
        </li>
      `
      )
      .join("");

    // Render section bodies with generous 5rem vertical padding per section
    sectionsContainer.innerHTML = sections
      .map(
        (sec) => `
        <section id="${sec.id}" class="case-sec rule grid scroll-mt-28 grid-cols-4 md:grid-cols-12" style="display: grid; gap: 2rem;">
          <div class="col-span-4 md:col-span-4 flex items-baseline gap-4" style="margin-bottom: 1.5rem; display: flex; align-items: baseline; gap: 1rem;">
            <span class="meta text-accent-ink font-mono text-sm" style="color: var(--accent); font-weight: 600;">${sec.num}</span>
            <h2 class="display text-2xl md:text-3xl font-medium text-ink" style="font-family: var(--font-fraunces), serif;">${sec.title}</h2>
          </div>
          <div class="col-span-4 md:col-span-8">
            <p class="max-w-[62ch] text-[1.05rem] text-ink-soft" style="line-height: 1.85; max-width: 62ch; color: var(--ink-soft); font-size: 1.05rem;">${sec.body}</p>
          </div>
        </section>
      `
      )
      .join("");

    // Attach smooth scroll listeners to navigation tabs
    navListEl.querySelectorAll(".section-nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("data-sec-target");
        const targetSection = modal.querySelector(`#${targetId}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Next Specimen button
    const nextBtn = modal.querySelector(".case-study-next-btn");
    if (nextItem && nextItem.slug !== item.slug) {
      nextBtn.textContent = `${nextItem.title} →`;
      nextBtn.onclick = () => {
        window.location.hash = `#work-${nextItem.slug}`;
      };
      nextBtn.parentElement.style.display = "block";
    } else {
      nextBtn.parentElement.style.display = "none";
    }

    // Canvas Simulation Setup (Taller ~48% box with 2x scaled procedural rendering)
    const previewDef = WORK_PREVIEWS[item.preview] || WORK_PREVIEWS["shadow-exchange"] || WORK_PREVIEWS.astra;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const style = getComputedStyle(document.documentElement);
    const colors = {
      paper: style.getPropertyValue("--paper-raised").trim() || "#fff",
      ink: style.getPropertyValue("--ink").trim() || "#1c1233",
      soft: style.getPropertyValue("--ink-soft").trim() || "#584a77",
      faint: style.getPropertyValue("--ink-faint").trim() || "#cdc0ea",
      accent: style.getPropertyValue("--accent").trim() || "#7b3fe4"
    };

    let start = performance.now();
    const drawLoop = (now) => {
      const elapsed = (now - start) / 1000 + (previewDef.warm || 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const bounds = { x: 0, y: 0, w: rect.width, h: rect.height };
      // Dynamic scale that lets drawings expand cleanly to 2x size on tall simulation boxes
      const scale = Math.min(Math.max(bounds.w / 640, 1.0), Math.max(bounds.h / 280, 1.0), 1.85);
      previewDef.draw(ctx, elapsed, bounds, colors, scale);
      animId = requestAnimationFrame(drawLoop);
    };
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(drawLoop);
  };

  return {
    open,
    close,
    isOpen: () => !!activeSlug,
    getActiveSlug: () => activeSlug,
    getLastActiveSlug: () => lastActiveSlug || activeSlug,
    getScrollTop: () => modal.scrollTop,
    onScroll: (cb) => modal.addEventListener("scroll", cb, { passive: true })
  };
}
