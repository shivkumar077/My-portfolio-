// Archive View Component for 86 Projects

export function initArchiveView({ archiveItems, getStrings }) {
  let isOpen = false;
  let activeFilter = "ALL";

  const modal = document.createElement("div");
  modal.className = "archive-modal fixed inset-0 z-[80] overflow-y-auto transition-opacity duration-200";
  modal.style.display = "none";
  modal.innerHTML = `
    <!-- Fixed Backdrop with frosted blur and light/dark theme background tint -->
    <div class="archive-backdrop fixed inset-0 pointer-events-none" aria-hidden="true"></div>

    <main id="archive-main" class="relative z-10 px-margin pb-24 pt-28 max-w-6xl mx-auto">
      <div class="mb-10 flex items-center justify-between border-b border-hairline pb-4">
        <button type="button" class="archive-back u-link meta flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer" data-cursor="OPEN">
          <span>←</span>
          <span class="back-text">BACK TO INDEX</span>
        </button>
        <span class="meta text-accent-ink">A — FULL INDEX</span>
      </div>

      <div class="mb-14">
        <h1 class="display text-4xl sm:text-5xl font-medium text-ink archive-title">Archive</h1>
        <p class="prose-measure mt-4 text-[0.9375rem] leading-relaxed text-ink-soft archive-intro">
          Everything on the bench, curated from a 95-project working inventory. Entries marked LIVE have a public URL that was verified for this build; everything else runs but isn’t publicly hosted. The flagship work lives on the <a class="u-link text-ink archive-home-link" href="#work">main index</a>.
        </p>
      </div>

      <!-- Filter Buttons -->
      <div class="archive-filters mb-10 flex flex-wrap gap-2" role="group" aria-label="Archive filters"></div>

      <!-- Projects Table -->
      <div class="archive-table w-full">
        <div class="rule meta grid grid-cols-4 gap-4 py-3 text-ink-label md:grid-cols-12 border-b border-hairline font-semibold">
          <span class="col-span-1">YEAR</span>
          <span class="col-span-3 md:col-span-4">PROJECT</span>
          <span class="hidden md:col-span-2 md:block">CATEGORY</span>
          <span class="hidden md:col-span-4 md:block">STACK</span>
          <span class="hidden text-right md:col-span-1 md:block">STATUS</span>
        </div>
        <div class="archive-list border-b border-hairline"></div>
      </div>

      <div class="mt-16 flex justify-between items-center border-t border-hairline pt-8">
        <button type="button" class="archive-back-bottom u-link meta flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer" data-cursor="OPEN">
          <span>←</span>
          <span class="back-text">BACK TO INDEX</span>
        </button>
        <span class="meta text-xs text-ink-label">86 PROJECTS INDEXED</span>
      </div>
    </main>
  `;
  document.body.appendChild(modal);

  const filtersContainer = modal.querySelector(".archive-filters");
  const listContainer = modal.querySelector(".archive-list");

  const categories = [
    { key: "ALL", label: "ALL" },
    { key: "RESEARCH", label: "RESEARCH" },
    { key: "AI / ML", label: "AI / ML" },
    { key: "DATA", label: "DATA" },
    { key: "QUANT / MARKETS", label: "QUANT / MARKETS" },
    { key: "SOFTWARE", label: "SOFTWARE" },
    { key: "GAMES / 3D", label: "GAMES / 3D" },
    { key: "EXPERIMENTAL", label: "EXPERIMENTAL" }
  ];

  const counts = {};
  categories.forEach((cat) => {
    if (cat.key === "ALL") counts[cat.key] = archiveItems.length;
    else counts[cat.key] = archiveItems.filter((it) => it.category === cat.key).length;
  });

  const renderFilters = () => {
    filtersContainer.innerHTML = categories
      .map((cat) => {
        const isSelected = activeFilter === cat.key;
        return `
        <button type="button" data-filter="${cat.key}" aria-pressed="${isSelected}" class="archive-filter-btn meta cursor-pointer border px-3 py-1.5 transition-colors duration-200 ${
          isSelected ? "border-accent bg-paper-raised text-accent-ink" : "border-hairline text-ink-soft hover:border-ink-soft hover:text-ink"
        }">
          ${cat.label}<span class="ml-1.5 text-ink-label text-xs">${counts[cat.key] || 0}</span>
        </button>
      `;
      })
      .join("");

    filtersContainer.querySelectorAll(".archive-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.getAttribute("data-filter");
        renderFilters();
        renderList();
      });
    });
  };

  const renderList = () => {
    const filtered = activeFilter === "ALL" ? archiveItems : archiveItems.filter((it) => it.category === activeFilter);

    listContainer.innerHTML = filtered
      .map((item) => {
        const isLink = !!item.href;
        const tag = isLink ? "a" : "div";
        const linkAttrs = isLink ? `href="${item.href}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN"` : "";
        const hoverClass = isLink ? "cursor-pointer hover:bg-paper-raised" : "";

        return `
        <${tag} ${linkAttrs} role="listitem" class="rule group grid grid-cols-4 items-baseline gap-4 py-3.5 md:grid-cols-12 transition-colors duration-150 ${hoverClass}">
          <span class="meta col-span-1 text-ink-soft">${item.year}</span>
          <span class="col-span-3 text-[0.9375rem] font-medium text-ink md:col-span-4">
            ${item.title}${isLink ? `<span aria-hidden="true" class="ml-1.5 inline-block text-ink-label transition-colors duration-150 group-hover:text-accent-ink">↗</span>` : ""}
          </span>
          <span class="meta col-span-2 col-start-2 text-ink-soft md:col-span-2 md:col-start-6">${item.category}</span>
          <span class="meta col-span-2 hidden text-ink-label md:col-span-4 md:block">${item.stack}</span>
          <span class="meta col-span-1 md:text-right ${item.status === "LIVE" ? "text-accent-ink" : "text-ink-label"}">${item.status}</span>
        </${tag}>
      `;
      })
      .join("");
  };

  const open = () => {
    isOpen = true;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
    renderFilters();
    renderList();
  };

  const close = (skipHistory) => {
    isOpen = false;
    modal.style.display = "none";
    document.body.style.overflow = "";
    if (!skipHistory && window.location.hash === "#archive") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = "#";
      }
    }
  };

  modal.querySelectorAll(".archive-back, .archive-back-bottom, .archive-home-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.location.hash === "#archive") {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          close();
        }
      } else {
        close();
      }
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      if (window.location.hash === "#archive") {
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

  return {
    open,
    close,
    isOpen: () => isOpen,
    getScrollTop: () => modal.scrollTop,
    onScroll: (cb) => modal.addEventListener("scroll", cb, { passive: true })
  };
}
