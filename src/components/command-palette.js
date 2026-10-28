// Command Palette (⌘K) Component matching Gary Wang layout & design pixel-for-pixel

export function initCommandPalette({ onNavigate, onToggleTheme, onToggleStats, onBlueprint }) {
  let isOpen = false;
  let query = "";
  let selectedIndex = 0;

  const overlay = document.createElement("div");
  overlay.className = "gw-cmd-overlay";
  overlay.setAttribute("role", "presentation");

  overlay.innerHTML = `
    <div class="gw-cmd-dialog" role="dialog" aria-modal="true">
      <!-- Header with purple prompt, input, and ESC badge -->
      <div class="gw-cmd-header">
        <span class="gw-cmd-prompt">&gt;</span>
        <input type="text" class="gw-cmd-input" placeholder="Where to?" spellcheck="false" autocomplete="off" />
        <button type="button" class="gw-cmd-esc" style="cursor: pointer;">ESC</button>
      </div>

      <!-- Body with NAVIGATE group and scrollable list -->
      <div class="gw-cmd-body">
        <div class="gw-cmd-group-title">NAVIGATE</div>
        <div class="gw-cmd-scroll">
          <div class="gw-cmd-list"></div>
        </div>
      </div>

      <!-- Footer with MOVE & OPEN keys -->
      <div class="gw-cmd-footer">
        <div class="gw-cmd-footer-left">
          <span><span class="gw-cmd-footer-key">↑↓</span> MOVE</span>
          <span><span class="gw-cmd-footer-key">↵</span> OPEN</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialogEl = overlay.querySelector(".gw-cmd-dialog");
  const inputEl = overlay.querySelector(".gw-cmd-input");
  const escBtn = overlay.querySelector(".gw-cmd-esc");
  const listEl = overlay.querySelector(".gw-cmd-list");

  // Prevent clicks inside the dialog from closing it
  dialogEl.addEventListener("click", (e) => e.stopPropagation());

  // Clicking anywhere outside the dialog on the smoky backdrop closes it
  overlay.addEventListener("click", () => close());
  escBtn?.addEventListener("click", () => close());

  const navigateTo = (target) => {
    close();
    onNavigate(target);
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Clean Navigation Items: Connected directly to sections
  const primaryNavigateItems = [
    { num: "02", label: "Selected Work", action: () => navigateTo("#work") },
    { num: "03", label: "Experience", action: () => navigateTo("#experience") },
    { num: "04", label: "About", action: () => navigateTo("#about") },
    { num: "05", label: "Contact", action: () => navigateTo("#contact") },
    {
      num: "A",
      label: "Project Archive",
      action: () => {
        close();
        window.open("https://github.com/shivkumar077?tab=repositories", "_blank", "noopener,noreferrer");
      }
    }
  ];

  // Extended items searchable when typing in the input
  const allSearchableItems = [
    ...primaryNavigateItems,
    { num: "W-01", label: "Shadow Exchange", action: () => navigateTo("#work-shadow-exchange") },
    { num: "W-02", label: "ASTRA Telemetry Platform", action: () => navigateTo("#work-astra") },
    { num: "◐", label: "Toggle Theme", action: onToggleTheme },
    { num: "@", label: "Email Shiv", action: () => window.open("mailto:shivkumar6990655@gmail.com", "_self") },
    { num: "◈", label: "Coordinate Blueprint Grid", action: onBlueprint },
    { num: "∷", label: "Field Stats Readout (HUD)", action: onToggleStats }
  ];

  const getFilteredItems = () => {
    const q = query.trim().toLowerCase();
    const sourceItems = q ? allSearchableItems : primaryNavigateItems;
    return sourceItems.filter(
      (item) => !q || item.label.toLowerCase().includes(q) || item.num.toLowerCase().includes(q)
    );
  };

  const executeItem = (item) => {
    if (!item) return;
    item.action();
  };

  const updateSelectionHighlight = () => {
    listEl.querySelectorAll(".gw-cmd-item").forEach((btn, i) => {
      btn.classList.toggle("is-selected", i === selectedIndex);
      btn.setAttribute("aria-selected", String(i === selectedIndex));
    });
  };

  const renderList = () => {
    const filtered = getFilteredItems();

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="padding: 24px 16px; text-align: center; font-family: var(--font-spline-mono), monospace; font-size: 11px; color: #6a6484;">NO ENTRIES FOUND IN THE INDEX</div>`;
      return;
    }

    if (selectedIndex >= filtered.length) selectedIndex = 0;

    let html = "";
    filtered.forEach((item, idx) => {
      const isSelected = idx === selectedIndex;
      html += `
        <button type="button" role="option" aria-selected="${isSelected}" data-idx="${idx}" class="gw-cmd-item ${isSelected ? "is-selected" : ""}">
          <span class="gw-cmd-num">${item.num}</span>
          <span class="gw-cmd-label">${item.label}</span>
          <span class="gw-cmd-enter">↵</span>
        </button>
      `;
    });

    listEl.innerHTML = html;

    // Attach direct click listeners on each button
    listEl.querySelectorAll(".gw-cmd-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        const currentFiltered = getFilteredItems();
        if (currentFiltered[idx]) {
          executeItem(currentFiltered[idx]);
        }
      });

      // On hover, NEVER re-render innerHTML — just update the active class!
      btn.addEventListener("pointerenter", () => {
        selectedIndex = parseInt(btn.getAttribute("data-idx"), 10);
        updateSelectionHighlight();
      });
    });

    const selectedBtn = listEl.querySelector(`.gw-cmd-item[data-idx="${selectedIndex}"]`);
    if (selectedBtn) {
      selectedBtn.scrollIntoView({ block: "nearest" });
    }
  };

  // Event delegation on list container as fallback for instantaneous clicks
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".gw-cmd-item");
    if (!btn) return;
    e.stopPropagation();
    const idx = parseInt(btn.getAttribute("data-idx"), 10);
    const currentFiltered = getFilteredItems();
    if (currentFiltered[idx]) {
      executeItem(currentFiltered[idx]);
    }
  });

  const open = () => {
    isOpen = true;
    overlay.classList.add("is-open");
    inputEl.value = "";
    query = "";
    selectedIndex = 0;
    renderList();
    setTimeout(() => inputEl.focus(), 25);
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    isOpen = false;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  const toggle = () => {
    if (isOpen) close();
    else open();
  };

  inputEl.addEventListener("input", (e) => {
    query = e.target.value;
    selectedIndex = 0;
    renderList();
  });

  inputEl.addEventListener("keydown", (e) => {
    const filtered = getFilteredItems();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(1, filtered.length);
      updateSelectionHighlight();
      const selectedBtn = listEl.querySelector(`.gw-cmd-item[data-idx="${selectedIndex}"]`);
      if (selectedBtn) selectedBtn.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filtered.length) % Math.max(1, filtered.length);
      updateSelectionHighlight();
      const selectedBtn = listEl.querySelector(`.gw-cmd-item[data-idx="${selectedIndex}"]`);
      if (selectedBtn) selectedBtn.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeItem(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      close();
    }
  });

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      toggle();
    }
  });

  return { open, close, toggle };
}
