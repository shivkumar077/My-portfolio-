// Shiv Kumar Portfolio — Main Application Logic

import "./styles.css";
import { initBackgroundCanvas } from "./canvas/background.js";
import { initCoordinateField } from "./canvas/coordinate-field.js";
import { WORK_PREVIEWS } from "./canvas/previews.js";
import { initCursorChip } from "./components/cursor-chip.js";
import { initFieldStats } from "./components/field-stats.js";
import { initCommandPalette } from "./components/command-palette.js";
import { initCaseStudyModal } from "./components/case-study-modal.js";
import { initArchiveView } from "./components/archive-view.js";
import { initFloatingWorkPreview } from "./components/floating-work-preview.js";
import { initHeroMascot } from "./components/hero-mascot.js";

import workItems from "./data/work_items.json";
import experienceItems from "./data/data_experience.json";
import archiveItems from "./data/archive_items.json";
import profileData from "./data/profile.json";
import stringsDict from "./data/strings_clean.json";

// Default Theme: Always Dark by default
let storedTheme = localStorage.getItem("theme");
let currentTheme = storedTheme ? storedTheme : "dark";

if (currentTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", "light");
}

const getStrings = () => stringsDict.en;

// Initialize Backgrounds and Global Effects
const bgCanvas = document.getElementById("bg-canvas");
initBackgroundCanvas(bgCanvas);

const coordCanvas = document.getElementById("coord-canvas");
initCoordinateField(coordCanvas);

initCursorChip();
const fieldStats = initFieldStats();

const floatingPreview = initFloatingWorkPreview({ workItems });
const caseStudyModal = initCaseStudyModal({ workItems, getStrings });
const archiveView = initArchiveView({ archiveItems, getStrings });

// Routing & Hash Handler with Browser History Back Support
function handleRoute() {
  const hash = window.location.hash;
  const wasCaseStudy = caseStudyModal.isOpen();
  const caseStudySlug = caseStudyModal.getActiveSlug() || caseStudyModal.getLastActiveSlug();

  if (hash === "#archive") {
    if (caseStudyModal.isOpen()) {
      caseStudyModal.close(true);
    }
    archiveView.open();
  } else if (hash.startsWith("#work-")) {
    if (archiveView.isOpen()) {
      archiveView.close(true);
    }
    const slug = hash.replace("#work-", "");
    caseStudyModal.open(slug);
  } else if (hash === "#hero") {
    // Explicit click on SK logo or #hero nav: Always go straight to the landing page top
    if (caseStudyModal.isOpen()) {
      caseStudyModal.close(true);
    }
    if (archiveView.isOpen()) {
      archiveView.close(true);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Navigating back to main page or a specific section (#work, #experience, #about, #contact, or empty)
    if (caseStudyModal.isOpen()) {
      caseStudyModal.close(true);
    }
    if (archiveView.isOpen()) {
      archiveView.close(true);
    }

    if (wasCaseStudy || hash === "#work") {
      const slug = caseStudySlug || "shadow-exchange";
      setTimeout(() => {
        const targetCard = document.querySelector(`.work-card-link[data-slug="${slug}"]`) || document.getElementById("work");
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 40);
      if (!hash) {
        history.replaceState(null, "", "#work");
      }
    } else if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  updateHeaderScroll();
}
window.addEventListener("hashchange", handleRoute);
window.addEventListener("popstate", handleRoute);

// Command Palette Initialization
const commandPalette = initCommandPalette({
  onNavigate: (target) => {
    window.location.hash = target;
    handleRoute();
  },
  onToggleTheme: toggleTheme,
  onToggleStats: () => fieldStats.toggle(),
  onBlueprint: () => window.dispatchEvent(new CustomEvent("gw:blueprint", { detail: true }))
});

document.getElementById("cmd-palette-btn")?.addEventListener("click", () => commandPalette.open());

// Theme Toggling
function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
  localStorage.setItem("theme", currentTheme);
  updateThemeUI();
}

function updateThemeUI() {
  const isDark = currentTheme === "dark";
  const themeBtns = [document.getElementById("theme-toggle-btn"), document.getElementById("theme-toggle-btn-mobile")];
  themeBtns.forEach((btn) => {
    if (btn) btn.textContent = isDark ? "LIGHT" : "DARK";
  });
}
document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);
document.getElementById("theme-toggle-btn-mobile")?.addEventListener("click", toggleTheme);
updateThemeUI();

// Header Scroll Tracking & Translucent Mesh Bar
const siteHeader = document.getElementById("site-header");
const navItems = document.querySelectorAll(".nav-item");
const sections = ["hero", "work", "experience", "about", "contact"];

let sectionOffsets = [];
function measureSectionOffsets() {
  sectionOffsets = sections.map((secId) => {
    const el = document.getElementById(secId);
    return {
      id: secId,
      top: el ? el.offsetTop - 140 : 0
    };
  });
}
window.addEventListener("resize", measureSectionOffsets, { passive: true });
setTimeout(measureSectionOffsets, 150);

function updateHeaderScroll() {
  let scrollY = window.scrollY || 0;
  if (caseStudyModal.isOpen()) {
    scrollY = caseStudyModal.getScrollTop();
  } else if (archiveView.isOpen()) {
    scrollY = archiveView.getScrollTop();
  }

  if (scrollY > 20) {
    siteHeader.classList.add("header-scrolled");
  } else {
    siteHeader.classList.remove("header-scrolled");
  }

  // Active section tracking on main page with persistent line & glow
  if (!caseStudyModal.isOpen() && !archiveView.isOpen()) {
    let currentSec = "";
    if (sectionOffsets.length === 0) measureSectionOffsets();
    for (let i = 0; i < sectionOffsets.length; i++) {
      if (scrollY >= sectionOffsets[i].top) {
        currentSec = sectionOffsets[i].id;
      }
    }

    navItems.forEach((item) => {
      const sec = item.getAttribute("data-section");
      if (sec === currentSec) {
        item.classList.add("text-accent-ink", "is-active");
        item.classList.remove("text-ink-soft");
      } else {
        item.classList.remove("text-accent-ink", "is-active");
        item.classList.add("text-ink-soft");
      }
    });
  } else if (caseStudyModal.isOpen()) {
    // When inside a work case study, highlight WORK in the header
    navItems.forEach((item) => {
      const sec = item.getAttribute("data-section");
      if (sec === "work") {
        item.classList.add("text-accent-ink", "is-active");
        item.classList.remove("text-ink-soft");
      } else {
        item.classList.remove("text-accent-ink", "is-active");
        item.classList.add("text-ink-soft");
      }
    });
  }
}

let headerScrollRaf = null;
function scheduleHeaderScroll() {
  if (!headerScrollRaf) {
    headerScrollRaf = requestAnimationFrame(() => {
      updateHeaderScroll();
      headerScrollRaf = null;
    });
  }
}

window.addEventListener("scroll", scheduleHeaderScroll, { passive: true });
caseStudyModal.onScroll(scheduleHeaderScroll);
archiveView.onScroll(scheduleHeaderScroll);

// Header navigation link clicks: always navigate, close modal if open, and handle SK/hero clicks
document.querySelectorAll("#site-header a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetHash = link.getAttribute("href");
    if (targetHash === "#hero") {
      e.preventDefault();
      if (caseStudyModal.isOpen()) caseStudyModal.close(true, true);
      if (archiveView.isOpen()) archiveView.close(true);
      if (isMobileMenuOpen) toggleMobileMenu(false);
      window.location.hash = "#hero";
      window.scrollTo({ top: 0, behavior: "smooth" });
      triggerHeroWavePop();
      if (window.scrollY > 80) {
        setTimeout(triggerHeroWavePop, 350);
      }
      return;
    }

    if (caseStudyModal.isOpen() || archiveView.isOpen()) {
      e.preventDefault();
      if (caseStudyModal.isOpen()) caseStudyModal.close(true, true);
      if (archiveView.isOpen()) archiveView.close(true);
      window.location.hash = targetHash;
      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }, 20);
      }
    }
  });
});

// Mobile Index Menu
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileIndexOverlay = document.getElementById("mobile-index");
let isMobileMenuOpen = false;

function triggerMobileMenuPop() {
  const items = Array.from(document.querySelectorAll("#mobile-index .mobile-nav-item"));
  if (!items.length) return;

  items.forEach((item, index) => {
    item.classList.remove("is-popping");
    item.style.animationDelay = "";
    void item.offsetWidth; // Reflow to restart animation reliably
    // Sequence top-to-bottom: 01 HOME -> 02 WORK -> 03 EXPERIENCE -> 04 ABOUT -> 05 CONTACT -> ARCHIVE
    const delayMs = 35 + index * 60;
    item.style.animationDelay = `${delayMs}ms`;
    item.classList.add("is-popping");
  });
}

function resetMobileMenuPop() {
  const items = Array.from(document.querySelectorAll("#mobile-index .mobile-nav-item"));
  items.forEach((item) => {
    item.classList.remove("is-popping");
    item.style.animationDelay = "";
  });
}

function toggleMobileMenu(force) {
  isMobileMenuOpen = typeof force === "boolean" ? force : !isMobileMenuOpen;
  mobileMenuBtn.setAttribute("aria-expanded", String(isMobileMenuOpen));
  mobileMenuBtn.textContent = isMobileMenuOpen ? "CLOSE" : "INDEX";
  if (isMobileMenuOpen) {
    document.body.classList.add("mobile-menu-open");
    mobileIndexOverlay.classList.remove("opacity-0", "pointer-events-none");
    mobileIndexOverlay.classList.add("opacity-100", "pointer-events-auto");
    mobileIndexOverlay.scrollTop = 0;
    document.body.style.overflow = "hidden";
    triggerMobileMenuPop();
  } else {
    document.body.classList.remove("mobile-menu-open");
    mobileIndexOverlay.classList.remove("opacity-100", "pointer-events-auto");
    mobileIndexOverlay.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "";
    resetMobileMenuPop();
  }
}

mobileMenuBtn?.addEventListener("click", () => toggleMobileMenu());
document.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetHash = link.getAttribute("href");
    toggleMobileMenu(false);
    if (targetHash === "#hero") {
      e.preventDefault();
      if (caseStudyModal.isOpen()) caseStudyModal.close(true, true);
      if (archiveView.isOpen()) archiveView.close(true);
      window.location.hash = "#hero";
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(triggerHeroWavePop, 280);
    }
  });
});
document.getElementById("mobile-archive-btn")?.addEventListener("click", () => {
  toggleMobileMenu(false);
});

// Wave Pop Animation for Hero Name ("Shiv Kumar")
// Pops bottom-up in an undulating wave from right to left: Kumar (r -> a -> m -> u -> K) then Shiv (v -> i -> h -> S)
function triggerHeroWavePop() {
  const letters = Array.from(document.querySelectorAll(".hero-letter"));
  if (!letters.length) return;

  // 9 letters: S(0) h(1) i(2) v(3)  K(4) u(5) m(6) a(7) r(8)
  const rightToLeftIndices = [8, 7, 6, 5, 4, 3, 2, 1, 0];

  letters.forEach((l) => {
    l.classList.remove("is-wave-popping");
    l.style.animationDelay = "";
    void l.offsetWidth; // reflow
  });

  rightToLeftIndices.forEach((letterIdx, stepIdx) => {
    const letter = letters[letterIdx];
    if (!letter) return;
    const extraGap = stepIdx >= 5 ? 35 : 0;
    const delayMs = stepIdx * 45 + extraGap;
    letter.style.animationDelay = `${delayMs}ms`;
    letter.classList.add("is-wave-popping");
  });

  setTimeout(() => {
    letters.forEach((l) => {
      l.classList.remove("is-wave-popping");
      l.style.animationDelay = "";
    });
  }, 1200);
}

// Unified Whole-Name Hover & Click on Shiv Kumar Title
const heroTitle = document.getElementById("hero-title");
const heroLetters = document.querySelectorAll(".hero-letter");

if (heroTitle) {
  heroTitle.addEventListener("click", () => {
    triggerHeroWavePop();
  });

  heroTitle.addEventListener("pointerenter", () => {
    heroLetters.forEach((letter) => {
      letter.style.fontVariationSettings = "'wght' 780";
      letter.style.letterSpacing = "0.015em";
    });
  });

  heroTitle.addEventListener("pointerleave", () => {
    heroLetters.forEach((letter) => {
      letter.style.fontVariationSettings = "'wght' 380";
      letter.style.letterSpacing = "0em";
    });
  });
}

// Explicit SK logo click handler
const siteLogo = document.getElementById("site-logo");
siteLogo?.addEventListener("click", (e) => {
  e.preventDefault();
  if (isMobileMenuOpen) toggleMobileMenu(false);
  if (caseStudyModal.isOpen()) caseStudyModal.close(true, true);
  if (archiveView.isOpen()) archiveView.close(true);
  window.location.hash = "#hero";
  window.scrollTo({ top: 0, behavior: "smooth" });
  triggerHeroWavePop();
  if (window.scrollY > 80) {
    setTimeout(triggerHeroWavePop, 350);
  }
});

// Magnetic Contact Email Button
const magContainer = document.getElementById("magnetic-email-container");
const magBtn = document.getElementById("magnetic-email-btn");
if (magContainer && magBtn) {
  let btnTargetX = 0;
  let btnTargetY = 0;
  let btnCurX = 0;
  let btnCurY = 0;
  let magAnimId = null;

  function animMagnetic() {
    const dx = btnTargetX - btnCurX;
    const dy = btnTargetY - btnCurY;
    btnCurX += dx * 0.22;
    btnCurY += dy * 0.22;
    magBtn.style.transform = `translate3d(${btnCurX.toFixed(1)}px, ${btnCurY.toFixed(1)}px, 0)`;

    if (Math.hypot(dx, dy) > 0.1 || btnTargetX !== 0 || btnTargetY !== 0) {
      magAnimId = requestAnimationFrame(animMagnetic);
    } else {
      magAnimId = null;
    }
  }

  function wakeMagnetic() {
    if (!magAnimId) magAnimId = requestAnimationFrame(animMagnetic);
  }

  let midX = 0;
  let midY = 0;

  function updateMagCenter() {
    const rect = magContainer.getBoundingClientRect();
    midX = rect.left + rect.width / 2;
    midY = rect.top + rect.height / 2;
  }

  magContainer.addEventListener("pointerenter", updateMagCenter, { passive: true });
  window.addEventListener("resize", updateMagCenter, { passive: true });

  magContainer.addEventListener("pointermove", (e) => {
    if (!midX) updateMagCenter();
    btnTargetX = Math.max(-8, Math.min(8, (e.clientX - midX) * 0.18));
    btnTargetY = Math.max(-8, Math.min(8, (e.clientY - midY) * 0.18));
    wakeMagnetic();
  }, { passive: true });

  magContainer.addEventListener("pointerleave", () => {
    btnTargetX = 0;
    btnTargetY = 0;
    wakeMagnetic();
  });
}

// -------------------------------------------------------------
// RENDER WORK LIST
// -------------------------------------------------------------
function renderWorkList() {
  const container = document.getElementById("work-list");
  if (!container) return;

  container.innerHTML = workItems
    .map((item) => {
      const statusClass = item.status === "LIVE" ? "text-accent-ink" : "text-ink-label";

      return `
      <div role="listitem" class="rule">
        <a data-cursor="VIEW" class="work-card-link marker group grid grid-cols-4 gap-x-4 gap-y-3 py-8 transition-colors duration-200 hover:bg-paper-raised focus-visible:bg-paper-raised md:grid-cols-12 md:items-baseline md:py-10 cursor-pointer" data-slug="${item.slug}">
          <span class="meta col-span-1 text-ink-soft transition-colors duration-200 group-hover:text-accent-ink group-focus-visible:text-accent-ink md:col-span-1">
            ${item.index}
          </span>
          <div class="col-span-3 md:col-span-6">
            <h3 class="display text-h2 font-medium text-ink transition-transform duration-200 md:group-hover:translate-x-2 md:group-focus-visible:translate-x-2">
              ${item.title}
            </h3>
            <p class="prose-measure mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink-soft">
              ${item.description}
            </p>
          </div>
          <div class="col-span-3 col-start-2 flex flex-col gap-1 md:col-span-3 md:col-start-8">
            <span class="meta text-ink-soft">${item.role.toUpperCase()}</span>
            <span class="meta text-ink-label">${item.tech.slice(0, 3).join(" · ").toUpperCase()}</span>
            ${item.metric ? `<span class="meta hidden text-ink-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">${item.metric.toUpperCase()}</span>` : ""}
          </div>
          <div class="col-span-3 col-start-2 flex items-baseline gap-4 md:col-span-2 md:col-start-11 md:justify-end">
            <span class="meta text-ink-soft">${item.year}</span>
            <span class="meta ${statusClass}">${item.status}</span>
            <span aria-hidden="true" class="meta-md text-ink-label transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent-ink group-focus-visible:translate-x-1 group-focus-visible:text-accent-ink">↗</span>
          </div>

          <!-- Mobile in-card preview canvas -->
          <div class="col-span-4 mt-3 h-48 sm:h-56 border border-hairline bg-paper-raised md:hidden overflow-hidden relative rounded-[2px]">
            <div class="absolute top-2.5 left-3 z-10 pointer-events-none flex items-center gap-1.5 opacity-80">
              <span class="status-dot"></span>
              <span class="meta text-[0.68rem] text-accent-ink tracking-wider font-medium">SIMULATION // LIVE</span>
            </div>
            <canvas data-preview="${item.preview}" class="mobile-preview-canvas h-full w-full block"></canvas>
          </div>
        </a>
      </div>
    `;
    })
    .join("");

  // Attach hover and click listeners
  container.querySelectorAll(".work-card-link").forEach((card) => {
    const slug = card.getAttribute("data-slug");

    card.addEventListener("click", (e) => {
      e.preventDefault();
      const targetHash = `#work-${slug}`;
      if (window.location.hash === targetHash) {
        caseStudyModal.open(slug);
      } else {
        window.location.hash = targetHash;
      }
    });

    card.addEventListener("pointerenter", (e) => {
      floatingPreview.show(slug, e);
    });

    card.addEventListener("pointerleave", () => {
      floatingPreview.hide();
    });
  });

  // Render mobile inline canvases for all mobile views and DevTools responsive modes
  const mobileCanvases = container.querySelectorAll(".mobile-preview-canvas");
  if (mobileCanvases.length) {
    const getThemeColors = () => {
      const style = getComputedStyle(document.documentElement);
      return {
        paper: style.getPropertyValue("--paper-raised").trim() || "#fff",
        ink: style.getPropertyValue("--ink").trim() || "#1c1233",
        soft: style.getPropertyValue("--ink-soft").trim() || "#584a77",
        faint: style.getPropertyValue("--ink-faint").trim() || "#cdc0ea",
        accent: style.getPropertyValue("--accent").trim() || "#7b3fe4"
      };
    };

    mobileCanvases.forEach((can) => {
      const previewType = can.getAttribute("data-preview");
      const previewDef = WORK_PREVIEWS[previewType] || WORK_PREVIEWS["shadow-exchange"] || WORK_PREVIEWS.astra || WORK_PREVIEWS.tensor;
      const ctx = can.getContext("2d");
      if (!ctx) return;

      let animId = null;
      let start = performance.now();
      let isIntersecting = false;

      const updateSize = () => {
        const rect = can.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          can.width = Math.round(rect.width * dpr);
          can.height = Math.round(rect.height * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          return true;
        }
        return false;
      };

      const renderMobile = (now) => {
        if (!isIntersecting) return;
        const rect = can.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          animId = requestAnimationFrame(renderMobile);
          return;
        }
        const elapsed = (now - start) / 1000 + (previewDef.warm || 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
        const bounds = { x: 0, y: 0, w: rect.width, h: rect.height };
        const scale = Math.min(Math.max(bounds.w / 380, 0.85), 1.35);
        const colors = getThemeColors();
        previewDef.draw(ctx, elapsed, bounds, colors, scale);
        animId = requestAnimationFrame(renderMobile);
      };

      const obs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            isIntersecting = true;
            updateSize();
            if (!animId) {
              start = performance.now();
              animId = requestAnimationFrame(renderMobile);
            }
          } else {
            isIntersecting = false;
            if (animId) {
              cancelAnimationFrame(animId);
              animId = null;
            }
          }
        },
        { threshold: 0, rootMargin: "60px" }
      );
      obs.observe(can);

      if (window.ResizeObserver) {
        const rObs = new ResizeObserver(() => {
          if (isIntersecting) {
            updateSize();
          }
        });
        rObs.observe(can);
      }
    });
  }
}



// -------------------------------------------------------------
// -------------------------------------------------------------
// RENDER EXPERIENCE ACCORDION LIST (Hover on Desktop, Scroll-Driven on Mobile)
// -------------------------------------------------------------
let activeExperienceIdx = null;

function setExpandedExperience(targetIdx) {
  activeExperienceIdx = targetIdx;
  const rows = document.querySelectorAll("#experience-list .experience-row");
  rows.forEach((row, idx) => {
    const expandPanel = row.querySelector(".experience-grid-expand");
    const toggleBtn = row.querySelector(".experience-toggle-btn");
    const plusIcons = row.querySelectorAll(".experience-plus");
    const isOpen = idx === targetIdx;

    if (isOpen) {
      row.classList.add("is-active", "bg-paper-raised");
      expandPanel.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      plusIcons.forEach((p) => {
        p.style.transform = "rotate(45deg)";
        p.classList.add("text-accent-ink");
      });
    } else {
      row.classList.remove("is-active", "bg-paper-raised");
      expandPanel.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      plusIcons.forEach((p) => {
        p.style.transform = "rotate(0deg)";
        p.classList.remove("text-accent-ink");
      });
    }
  });
}

function renderExperienceList() {
  const container = document.getElementById("experience-list");
  if (!container) return;

  container.innerHTML = experienceItems
    .map((item, idx) => {
      return `
      <div class="rule border-t border-hairline first:border-t-0 experience-row transition-colors duration-200" data-idx="${idx}">
        <button type="button" data-idx="${idx}" data-cursor="OPEN" class="experience-toggle-btn w-full cursor-pointer py-6 text-left transition-colors duration-200 md:py-7" aria-expanded="false">
          <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-baseline md:gap-4">
            <span class="meta text-ink-soft md:col-span-2">${item.period}</span>
            <div class="flex items-baseline justify-between md:col-span-4">
              <span class="display text-xl font-medium text-ink sm:text-2xl md:text-3xl">${item.org}</span>
              <span aria-hidden="true" class="experience-plus meta-md text-ink-label md:hidden">+</span>
            </div>
            <span class="text-[0.9375rem] text-ink-soft md:col-span-4">${item.title}</span>
            <span aria-hidden="true" class="experience-plus meta-md hidden text-right text-ink-label md:col-span-2 md:block">+</span>
          </div>
        </button>

        <!-- Smooth CSS Grid Expandable Details -->
        <div class="experience-grid-expand">
          <div class="experience-grid-inner">
            <div class="px-3 pb-8 pt-2 text-sm text-ink-soft md:px-4">
              <div class="flex flex-col gap-3 md:grid md:grid-cols-12 md:gap-4">
                <div class="hidden md:block md:col-span-2"></div>
                <div class="flex flex-col gap-3 md:col-span-10">
                  ${item.location ? `<span class="meta text-xs text-accent-ink">${item.location.toUpperCase()}</span>` : ""}
                  ${item.summary ? `<p class="prose-measure text-ink font-medium leading-relaxed">${item.summary}</p>` : ""}
                  ${
                    item.contributions && item.contributions.length > 0
                      ? `<ul class="list-disc pl-5 flex flex-col gap-1.5 text-ink-soft text-sm">
                          ${item.contributions.map((c) => `<li>${c}</li>`).join("")}
                         </ul>`
                      : ""
                  }
                  ${
                    item.tech && item.tech.length > 0
                      ? `<div class="meta text-xs text-ink-label mt-2">TECH: <span class="text-ink">${item.tech.join(" · ").toUpperCase()}</span></div>`
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  const rows = container.querySelectorAll(".experience-row");

  rows.forEach((row, idx) => {
    // Desktop hover: hover opens, mouse leaving item/section closes
    row.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") {
        setExpandedExperience(idx);
      }
    });

    // Click / tap toggle
    const btn = row.querySelector(".experience-toggle-btn");
    btn.addEventListener("click", () => {
      setExpandedExperience(activeExperienceIdx === idx ? null : idx);
    });
  });

  // Desktop mouse leave container: collapse back to titles only
  container.addEventListener("mouseleave", () => {
    setExpandedExperience(null);
  });
}

// Mobile / Phone Scroll-Spy Auto-Accordion
let isExperienceScrollTicking = false;
function checkMobileExperienceScroll() {
  const isTouchOrMobile = !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.innerWidth <= 768;
  if (!isTouchOrMobile) return;

  const section = document.getElementById("experience");
  if (!section) return;

  const secRect = section.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  // If experience section is off-screen, collapse
  if (secRect.top > vh * 0.85 || secRect.bottom < vh * 0.15) {
    if (activeExperienceIdx !== null) {
      setExpandedExperience(null);
    }
    return;
  }

  // Focal line in mobile viewport: ~48% of screen height
  const focalY = vh * 0.48;
  const rows = Array.from(document.querySelectorAll("#experience-list .experience-row"));
  let closestIdx = null;
  let minDistance = Infinity;

  rows.forEach((row, i) => {
    const btn = row.querySelector(".experience-toggle-btn");
    const btnRect = btn.getBoundingClientRect();
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const dist = Math.abs(btnCenterY - focalY);

    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = i;
    }
  });

  if (closestIdx !== null && minDistance < vh * 0.30) {
    if (activeExperienceIdx !== closestIdx) {
      setExpandedExperience(closestIdx);
    }
  } else if (minDistance >= vh * 0.38) {
    if (activeExperienceIdx !== null) {
      setExpandedExperience(null);
    }
  }
}

window.addEventListener(
  "scroll",
  () => {
    if (!isExperienceScrollTicking) {
      requestAnimationFrame(() => {
        checkMobileExperienceScroll();
        isExperienceScrollTicking = false;
      });
      isExperienceScrollTicking = true;
    }
  },
  { passive: true }
);

// -------------------------------------------------------------
// RENDER ABOUT SECTION TABS
// -------------------------------------------------------------
let activeAboutTab = 0;
function renderAboutSection() {
  const btnContainer = document.getElementById("about-tab-buttons");
  const contentEl = document.getElementById("about-tab-content");

  if (!btnContainer || !contentEl) return;

  const fragments = profileData.aboutFragments;

  btnContainer.innerHTML = fragments
    .map((frag, idx) => {
      const isSelected = activeAboutTab === idx;
      return `
      <button type="button" role="tab" data-idx="${idx}" data-cursor="OPEN" aria-selected="${isSelected}" class="about-tab-btn meta cursor-pointer border px-2 sm:px-3 py-2 text-center text-[0.68rem] sm:text-xs transition-colors duration-200 ${
        isSelected ? "border-accent bg-paper-raised text-accent-ink" : "border-hairline text-ink-soft hover:border-ink-soft hover:text-ink"
      }">
        ${frag.label}
      </button>
    `;
    })
    .join("");

  contentEl.textContent = fragments[activeAboutTab]?.body || "";

  btnContainer.querySelectorAll(".about-tab-btn").forEach((btn) => {
    const handleSwitch = () => {
      activeAboutTab = parseInt(btn.getAttribute("data-idx"), 10);
      renderAboutSection();
    };
    btn.addEventListener("click", handleSwitch);
    btn.addEventListener("pointerenter", handleSwitch);
  });
}

// Live Indian Standard Time (Asia/Kolkata)
function updateIndianTime() {
  const timeEl = document.getElementById("indian-time") || document.getElementById("california-time");
  if (!timeEl) return;
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });
    timeEl.textContent = `${formatter.format(new Date())} IST`;
  } catch (e) {
    timeEl.textContent = "12:00 IST";
  }
}
updateIndianTime();
setInterval(updateIndianTime, 10000);

// =========================================================================
// Terminal Scramble / Decryption Text Animation (SELECTED WORK, EXPERIENCE, ABOUT)
// Rapidly cycles random numbers (1234), letters (ABCD), and symbols until decoding.
// Triggers on scroll-into-view ("every time I go there") as well as hover/tap.
// =========================================================================
const SCRAMBLE_GLYPHS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]/\\|=+*$#%&_!?:;~^";

class TextScrambler {
  constructor(element, targetText) {
    this.element = element;
    this.targetText = targetText || element.getAttribute("data-scramble") || element.textContent.trim().toUpperCase();
    this.chars = Array.from(this.targetText);
    this.frameReq = null;
    this.isAnimating = false;
    this.duration = 240; // Active scramble duration per character in ms
    this.stagger = 36;   // Stagger offset per character index in ms
  }

  start() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.element.textContent = this.targetText;
      return;
    }

    if (this.frameReq) {
      cancelAnimationFrame(this.frameReq);
      this.frameReq = null;
    }
    this.isAnimating = true;

    const startTime = performance.now();
    let lastRenderTime = 0;
    const totalDuration = this.chars.length * this.stagger + this.duration;

    const tick = (now) => {
      const elapsed = now - startTime;
      if (now - lastRenderTime < 32 && elapsed < totalDuration) {
        this.frameReq = requestAnimationFrame(tick);
        return;
      }
      lastRenderTime = now;

      let output = "";
      let activeIndex = Math.min(this.chars.length - 1, Math.floor(elapsed / this.stagger));

      for (let i = 0; i < this.chars.length; i++) {
        const targetChar = this.chars[i];
        if (targetChar === " ") {
          output += " ";
          continue;
        }

        const lockTime = i * this.stagger + this.duration;
        const revealTime = i * this.stagger - this.duration * 0.45;

        if (elapsed >= lockTime) {
          // Locked character in ink color
          output += `<span class="text-ink">${targetChar}</span>`;
        } else if (elapsed < revealTime) {
          // Ghost spacer before scramble starts
          output += `<span class="opacity-0">${targetChar}</span>`;
        } else {
          // Active scrambling: rapidly cycling random numbers, letters, and symbols
          const glyphIdx = (Math.floor(elapsed / 32) + i * 7) % SCRAMBLE_GLYPHS.length;
          const randomChar = SCRAMBLE_GLYPHS[glyphIdx];
          output += `<span class="text-accent">${randomChar}</span>`;
        }
      }

      // Trailing terminal block cursor
      if (elapsed < totalDuration && activeIndex >= 0 && activeIndex < this.chars.length) {
        output += `<span class="terminal-cursor">█</span>`;
      }

      this.element.innerHTML = output;

      if (elapsed < totalDuration) {
        this.frameReq = requestAnimationFrame(tick);
      } else {
        this.isAnimating = false;
        this.frameReq = null;
        this.element.innerHTML = this.chars.map((c) => `<span class="text-ink">${c}</span>`).join("");
      }
    };

    this.frameReq = requestAnimationFrame(tick);
  }

  stop() {
    if (this.frameReq) {
      cancelAnimationFrame(this.frameReq);
      this.frameReq = null;
    }
    this.isAnimating = false;
  }
}

function initTerminalScramblers() {
  const elements = document.querySelectorAll(".terminal-heading[data-scramble]");
  if (!elements.length) return;

  const scramblers = new Map();

  elements.forEach((el) => {
    const targetText = el.getAttribute("data-scramble") || el.textContent.trim().toUpperCase();
    const scrambler = new TextScrambler(el, targetText);
    el._scrambler = scrambler;
    scramblers.set(el, scrambler);

    // Interactive re-trigger on hover or tap
    el.addEventListener("mouseenter", () => scrambler.start());
    el.addEventListener("click", () => scrambler.start());
  });

  // Trigger whenever user scrolls into view ("every time I go there")
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const scrambler = scramblers.get(entry.target);
        if (!scrambler) return;

        if (entry.isIntersecting) {
          if (!entry.target._scrambleInView) {
            entry.target._scrambleInView = true;
            scrambler.start();
          }
        } else {
          // Reset when scrolling away so returning will trigger the scramble again
          entry.target._scrambleInView = false;
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -5% 0px",
    }
  );

  elements.forEach((el) => observer.observe(el));
}

// -------------------------------------------------------------
// ABOUT SECTION CONTENT: EMERGE FROM BOTTOM TO UP ON SCROLL
// -------------------------------------------------------------
function initAboutPopAnimation() {
  const contentGrid = document.getElementById("about-content-grid");
  const popTargets = document.querySelectorAll(".about-pop-lead, .about-pop-bio, .about-pop-card");
  if (!contentGrid || !popTargets.length) return;

  const contentObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // As the user scrolls down to about, content rises smoothly from bottom to up
          popTargets.forEach((target) => target.classList.add("is-popped"));
        } else {
          // Keep the space completely clear / plain background when scrolled away
          popTargets.forEach((target) => target.classList.remove("is-popped"));
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  contentObserver.observe(contentGrid);
}

// -------------------------------------------------------------
// CONTACT SECTION: 3-ROW HEADLINE POP-UP FROM LINES ON SCROLL
// -------------------------------------------------------------
function initContactPopAnimation() {
  const contactHeadline = document.getElementById("contact-headline");
  const headlineTexts = document.querySelectorAll(".contact-headline-text");
  if (!contactHeadline || !headlineTexts.length) return;

  const contactObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          headlineTexts.forEach((text) => text.classList.add("is-popped"));
        } else {
          headlineTexts.forEach((text) => text.classList.remove("is-popped"));
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px 40px 0px",
    }
  );

  contactObserver.observe(contactHeadline);
}

// Initial Page Render
initHeroMascot({ onInteract: triggerHeroWavePop });
renderWorkList();
renderExperienceList();
renderAboutSection();
initTerminalScramblers();
initAboutPopAnimation();
initContactPopAnimation();
handleRoute();
console.log("Shiv Kumar portfolio initialized cleanly.");
