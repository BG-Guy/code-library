/* Code Library — home page logic: render cards, search, filter, scroll reveal. */

document.addEventListener("DOMContentLoaded", () => {
  LAYOUT.mount("home");

  const grid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const pills = document.querySelectorAll(".pill");

  let activeFilter = "all";
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
      const matchesFilter = activeFilter === "all" || s.language === activeFilter;
      const haystack = `${s.title} ${s.description} ${s.tags.join(" ")}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
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

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      activeFilter = pill.dataset.filter;
      render();
    });
  });

  // Deep link support: index.html#javascript pre-filters the grid.
  function applyHashFilter() {
    const hash = window.location.hash.replace("#", "");
    const match = [...pills].find((p) => p.dataset.filter === hash);
    if (match) match.click();
  }
  window.addEventListener("hashchange", applyHashFilter);
  applyHashFilter();

  render();
});
