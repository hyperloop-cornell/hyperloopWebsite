const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "subteams.html", label: "Subteams" },
  { href: "members.html", label: "Members" },
  { href: "apply.html", label: "Apply" },
  { href: "sponsors.html", label: "Sponsors" },
];

// Derive the site root from wherever shared.js lives — works locally and on any GitHub Pages path.
const ROOT = (() => {
  const src = document.currentScript?.src ||
    [...document.querySelectorAll('script[src]')].find(s => s.src.includes('shared.js'))?.src;
  if (!src) return '/';
  return src.split(/[?#]/)[0].replace(/shared\.js$/, '');
})();

function currentPage() {
  return location.pathname.split("/").pop() || "index.html";
}

function renderNav() {
  const links = NAV_LINKS.map(({ href, label }) => {
    const active = currentPage() === href;
    const base = "font-headline-md text-headline-md font-bold uppercase tracking-tighter transition-all duration-200 hover:bg-surface-container-high px-2 py-1";
    const cls = active
      ? `${base} text-primary border-b-2 border-primary pb-1`
      : `${base} text-on-surface-variant hover:text-primary`;
    return `<a class="${cls}" href="${ROOT}${href}">${label}</a>`;
  }).join("");

  const mobileLinks = NAV_LINKS.map(({ href, label }) => {
    const active = currentPage() === href;
    const cls = active
      ? "block px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-primary border-l-2 border-primary bg-surface-container"
      : "block px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors";
    return `<a class="${cls}" href="${ROOT}${href}">${label}</a>`;
  }).join("");

  return `
<header id="site-header" class="sticky top-0 z-50 border-b border-transparent bg-transparent text-primary backdrop-blur-none transition-[background-color,border-color,backdrop-filter] duration-300 ease-out">
  <div class="flex justify-between items-center w-full px-margin py-4 max-w-container-max mx-auto">
    <a class="flex items-center gap-3 font-headline-md text-primary font-black tracking-widest uppercase min-w-0" href="${ROOT}index.html">
      <img src="${ROOT}res/logoNoBG.avif" alt="Hyperloop logo" class="h-8 w-auto flex-shrink-0"/>
      <span class="hidden lg:inline">CORNELL HYPERLOOP</span><span class="sm:hidden">HYPERLOOP</span>
    </a>
    <nav class="hidden md:flex gap-gutter items-center">${links}</nav>
    <a href="${ROOT}apply.html" class="hidden md:block bg-primary-container text-on-primary-container px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors duration-200">JOIN TEAM</a>
    <button id="mobile-menu-btn" class="md:hidden text-primary p-2 flex-shrink-0" aria-label="Toggle menu" aria-expanded="false"><span class="material-symbols-outlined text-[28px]">menu</span></button>
  </div>
  <div id="mobile-menu" class="hidden md:hidden border-t border-transparent bg-surface">
    <nav class="flex flex-col py-2">${mobileLinks}</nav>
    <div class="px-4 py-3 border-t border-outline-variant">
      <a href="${ROOT}apply.html" class="block w-full text-center bg-primary-container text-on-primary-container px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors duration-200">JOIN TEAM</a>
    </div>
  </div>
</header>`;
}

function renderFooter() {
  return `
<footer class="bg-surface-container-lowest text-primary font-body-md text-body-md border-t border-outline-variant">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin py-12 max-w-container-max mx-auto items-center">
    <div class="flex flex-col gap-2">
      <span class="text-on-surface font-bold uppercase tracking-widest text-lg">CORNELL HYPERLOOP</span>
      <span class="text-on-surface-variant text-sm">© 2025 Cornell Hyperloop Electrical</span>
    </div>
    <div class="flex flex-col md:flex-row gap-4 md:justify-center">
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="#">Upson Hall, Ithaca, NY</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="mailto:cornellhyperloop@gmail.com">Contact</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="https://hr.cornell.edu/about/workplace-rights/equal-education-and-employment" target="_blank" rel="noopener noreferrer">Equal Education & Employment</a>
    </div>
    <div class="flex justify-end gap-4 text-on-surface-variant">
      <a class="hover:text-primary transition-colors" href="https://github.com/WesP10/hyperloopWebsite" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">language</span></a>
      <a class="hover:text-primary transition-colors" href="mailto:cornellhyperloop@gmail.com" aria-label="Email us"><span class="material-symbols-outlined">mail</span></a>
    </div>
  </div>
</footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.overflowX = "clip";
  document.body.style.overflowX = "clip";

  const navPlaceholder = document.getElementById("nav-placeholder");
  if (navPlaceholder) {
    navPlaceholder.innerHTML = renderNav();
    navPlaceholder.style.display = "block";
    navPlaceholder.style.right = "0";
    navPlaceholder.style.top = "0";
    navPlaceholder.style.position = "fixed";
    const footerPlaceholder = document.getElementById("footer-placeholder");
    navPlaceholder.style.left = "0";
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = renderFooter();
    }
    navPlaceholder.style.zIndex = "50";
  }

  const header = document.getElementById("site-header");
  const mobileMenu = document.getElementById("mobile-menu");
  const navScrollThreshold = 12;
  const screenWidth = window.innerWidth || document.documentElement.clientWidth;
  const mdScreen = 768;
  let navChromeState = null;

  function updateNavChrome() {
    if (!header) return;
    if (screenWidth <= mdScreen) {
      header.classList.toggle("bg-transparent", false);
      header.classList.toggle("bg-surface/95", true);
      header.classList.toggle("border-transparent", false);
      header.classList.toggle("border-outline-variant", true);
      header.classList.toggle("backdrop-blur-none", false);
      header.classList.toggle("backdrop-blur-md", true);
      return;
    }

    const scrolled = window.scrollY > navScrollThreshold;
    if (navChromeState === scrolled) return;
    navChromeState = scrolled;

    header.classList.toggle("bg-transparent", !scrolled);
    header.classList.toggle("bg-surface/95", scrolled);
    header.classList.toggle("border-transparent", !scrolled);
    header.classList.toggle("border-outline-variant", scrolled);
    header.classList.toggle("backdrop-blur-none", !scrolled);
    header.classList.toggle("backdrop-blur-md", scrolled);

    if (mobileMenu) {
      mobileMenu.classList.toggle("border-transparent", !scrolled);
      mobileMenu.classList.toggle("border-outline-variant", scrolled);
    }
  }

  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) {
    btn.addEventListener("click", () => {
      const open = !menu.classList.contains("hidden");
      menu.classList.toggle("hidden", open);
      btn.setAttribute("aria-expanded", String(!open));
      btn.querySelector(".material-symbols-outlined").textContent = open ? "menu" : "-"
    });
  }

  window.addEventListener("scroll", updateNavChrome, { passive: true });
  window.addEventListener("resize", updateNavChrome, { passive: true });
  window.addEventListener("pageshow", updateNavChrome);
  updateNavChrome();

  const prefetched = new Set();
  if (!navPlaceholder) return;

  navPlaceholder.addEventListener("mouseover", e => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || prefetched.has(href)) return;
    prefetched.add(href);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(ROOT + "sw.js", { scope: ROOT })
    .then(reg => {
      window.addEventListener("load", () => {
        const sw = reg.active || reg.installing || reg.waiting;
        if (sw) sw.postMessage("prefetch");
        else reg.addEventListener("updatefound", () => {
          reg.installing.addEventListener("statechange", function() {
            if (this.state === "activated") this.postMessage("prefetch");
          });
        });
      });
    });
}
