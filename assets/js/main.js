/* Code Library — home page logic: render cards, search, filter, scroll reveal. */

document.addEventListener("DOMContentLoaded", () => {
  LAYOUT.mount("home");

  const grid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const languagePills = document.querySelectorAll("#languagePills .pill");
  const difficultyPills = document.querySelectorAll("#difficultyPills .pill");
  const tagCloud = document.getElementById("tagCloud");
  const filtersToggle = document.getElementById("filtersToggle");
  const advancedFilters = document.getElementById("advancedFilters");
  const filtersCount = document.getElementById("filtersCount");
  const clearTagsBtn = document.getElementById("clearTagsBtn");

  let activeLanguage = "all";
  let activeDifficulty = "all";
  const activeTags = new Set();
  let searchTerm = "";

  function arrowIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>`;
  }

  function cardTemplate(snippet) {
    const tags = snippet.tags
      .slice(0, 3)
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");

    return `
      <article class="card reveal-on-scroll" data-lang="${snippet.language}" data-id="${snippet.id}" tabindex="0" role="link" aria-label="Open snippet: ${snippet.title}">
        <div class="card-top">
          <span class="lang-badge">${snippet.language}</span>
          <span class="difficulty">${snippet.difficulty}</span>
        </div>
        <h3>${snippet.title}</h3>
        <p class="card-desc">${snippet.description}</p>
        <div class="card-tags">${tags}</div>
        <div class="card-footer">
          <span>View snippet</span>
          ${arrowIcon()}
        </div>
      </article>
    `;
  }

  function render() {
    const filtered = SNIPPETS.filter((s) => {
      const matchesLanguage = activeLanguage === "all" || s.language === activeLanguage;
      const matchesDifficulty = activeDifficulty === "all" || s.difficulty === activeDifficulty;
      const matchesTags = activeTags.size === 0 || s.tags.some((t) => activeTags.has(t));
      const haystack = `${s.title} ${s.description} ${s.tags.join(" ")}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      return matchesLanguage && matchesDifficulty && matchesTags && matchesSearch;
    });

    grid.innerHTML = filtered.map(cardTemplate).join("");
    emptyState.classList.toggle("is-visible", filtered.length === 0);

    grid.querySelectorAll(".card").forEach((card, i) => {
      card.style.transitionDelay = `${Math.min(i, 8) * 45}ms`;
      revealObserver.observe(card);

      const go = () => (window.location.href = `snippet.html?id=${card.dataset.id}`);
      card.addEventListener("click", go);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });

    updateFocusedCard();
  }

  // ---------- tag cloud (built from the data, so it never goes stale) ----------
  function buildTagCloud() {
    const allTags = new Set();
    SNIPPETS.forEach((s) => s.tags.forEach((t) => allTags.add(t)));

    tagCloud.innerHTML = [...allTags]
      .sort()
      .map((tag) => `<button class="tag-pill" data-tag="${tag}" type="button">${tag}</button>`)
      .join("");

    tagCloud.querySelectorAll(".tag-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tag = btn.dataset.tag;
        if (activeTags.has(tag)) {
          activeTags.delete(tag);
          btn.classList.remove("is-active");
        } else {
          activeTags.add(tag);
          btn.classList.add("is-active");
        }
        updateFiltersCount();
        render();
      });
    });
  }

  function updateFiltersCount() {
    const count = (activeDifficulty !== "all" ? 1 : 0) + activeTags.size;
    filtersCount.textContent = count;
    filtersCount.hidden = count === 0;
    clearTagsBtn.hidden = activeTags.size === 0;
  }

  filtersToggle.addEventListener("click", () => {
    const isOpen = advancedFilters.classList.toggle("is-open");
    filtersToggle.setAttribute("aria-expanded", String(isOpen));
    filtersToggle.classList.toggle("is-open", isOpen);
  });

  difficultyPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      difficultyPills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      activeDifficulty = pill.dataset.difficulty;
      updateFiltersCount();
      render();
    });
  });

  clearTagsBtn.addEventListener("click", () => {
    activeTags.clear();
    tagCloud.querySelectorAll(".tag-pill.is-active").forEach((btn) => btn.classList.remove("is-active"));
    updateFiltersCount();
    render();
  });

  // Touch devices have no real ":hover" — instead, treat scroll position as
  // "aim": whichever card sits nearest the screen's vertical center gets the
  // same lift/shadow/border treatment a mouse hover would give it.
  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  let focusTicking = false;

  function updateFocusedCard() {
    if (!isTouchDevice) return;

    const cards = grid.querySelectorAll(".card");
    const viewportCenter = window.innerHeight / 2;
    let closest = null;
    let closestDistance = Infinity;

    cards.forEach((card) => {
      card.classList.remove("is-focused");
      const rect = card.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = card;
      }
    });

    if (closest) closest.classList.add("is-focused");
  }

  if (isTouchDevice) {
    window.addEventListener(
      "scroll",
      () => {
        if (focusTicking) return;
        focusTicking = true;
        requestAnimationFrame(() => {
          updateFocusedCard();
          focusTicking = false;
        });
      },
      { passive: true }
    );
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    render();
  });

  languagePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      languagePills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      activeLanguage = pill.dataset.filter;
      render();
    });
  });

  // Deep link support: index.html#javascript pre-filters the grid.
  function applyHashFilter() {
    const hash = window.location.hash.replace("#", "");
    const match = [...languagePills].find((p) => p.dataset.filter === hash);
    if (match) match.click();
  }
  window.addEventListener("hashchange", applyHashFilter);
  applyHashFilter();

  buildTagCloud();
  render();
});
