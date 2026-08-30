/* Code Library — shared layout: header, hamburger side menu, reveal footer.
   Injected via JS on every page so markup isn't duplicated across index.html / snippet.html. */

const LAYOUT = {
  categories: ["javascript", "node", "tailwind"],

  headerHTML(activePage) {
    return `
      <header class="site-header">
        <div class="header-bg" aria-hidden="true"></div>
        <div class="header-inner">
          <button class="hamburger" id="hamburgerBtn" aria-label="Open menu" aria-expanded="false" aria-controls="sideMenu">
            <span class="hamburger-box">
              <span class="hamburger-line line-1"></span>
              <span class="hamburger-line line-2"></span>
              <span class="hamburger-line line-3"></span>
            </span>
          </button>

          <a class="logo" href="index.html">
            <span class="logo-mark">&lt;/&gt;</span>
            <span class="logo-text">Code<em>Library</em></span>
          </a>

          <nav class="header-nav">
            <a href="index.html" class="${activePage === "home" ? "active" : ""}">Library</a>
            <a href="index.html#about" data-scroll="about">About</a>
          </nav>
        </div>
      </header>
    `;
  },

  sideMenuHTML() {
    const items = this.categories
      .map(
        (c) => `<li><a href="index.html#${c}" data-filter="${c}"><span class="dot dot-${c}"></span>${LANGUAGE_LABELS[c] || c}</a></li>`
      )
      .join("");

    return `
      <div class="menu-overlay" id="menuOverlay"></div>
      <aside class="side-menu" id="sideMenu" aria-hidden="true">
        <div class="side-menu-inner">
          <p class="side-menu-title">Browse by language</p>
          <ul class="side-menu-list">
            ${items}
            <li><a href="index.html" data-filter="all"><span class="dot dot-all"></span>All snippets</a></li>
          </ul>
          <p class="side-menu-title">More</p>
          <ul class="side-menu-list">
            <li><a href="index.html#about">About this library</a></li>
            <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
          </ul>
          <button class="theme-toggle" id="themeToggle">
            <span class="theme-toggle-icon">🌙</span>
            <span>Toggle dark mode</span>
          </button>
        </div>
      </aside>
    `;
  },

  footerHTML() {
    const year = new Date().getFullYear();
    return `
      <footer class="site-footer" id="about">
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="logo-mark">&lt;/&gt;</span>
            <span class="logo-text">Code<em>Library</em></span>
            <p>A small, growing shelf of full-stack web snippets — click any card to read, copy, and understand it.</p>
          </div>

          <div class="footer-col">
            <h4>Languages</h4>
            <ul>
              <li><a href="index.html#javascript" data-filter="javascript">JavaScript</a></li>
              <li><a href="index.html#node" data-filter="node">Node.js</a></li>
              <li><a href="index.html#tailwind" data-filter="tailwind">Tailwind CSS</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Project</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Stay sharp</h4>
            <p class="footer-note">Built for the joy of reading good code. No tracking, no accounts, just snippets.</p>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} Code Library</span>
          <span>Crafted with vanilla HTML, CSS &amp; JS</span>
        </div>
      </footer>
    `;
  },

  mount(activePage) {
    const headerRoot = document.getElementById("headerRoot");
    const menuRoot = document.getElementById("menuRoot");
    const footerRoot = document.getElementById("footerRoot");

    if (headerRoot) headerRoot.innerHTML = this.headerHTML(activePage);
    if (menuRoot) menuRoot.innerHTML = this.sideMenuHTML();
    if (footerRoot) footerRoot.innerHTML = this.footerHTML();

    this.bindMenu();
    this.bindTheme();
  },

  bindMenu() {
    const btn = document.getElementById("hamburgerBtn");
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    if (!btn || !menu || !overlay) return;

    const closeMenu = () => {
      btn.classList.remove("is-open");
      menu.classList.remove("is-open");
      overlay.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      btn.classList.add("is-open");
      menu.classList.add("is-open");
      overlay.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
    };

    btn.addEventListener("click", () => {
      const isOpen = menu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  },

  bindTheme() {
    const toggle = document.getElementById("themeToggle");
    const root = document.documentElement;

    const stored = localStorage.getItem("cl-theme");
    if (stored === "dark") root.setAttribute("data-theme", "dark");

    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        localStorage.setItem("cl-theme", "light");
      } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("cl-theme", "dark");
      }
    });
  },
};

(function applyStoredTheme() {
  const stored = localStorage.getItem("cl-theme");
  if (stored === "dark") document.documentElement.setAttribute("data-theme", "dark");
})();
