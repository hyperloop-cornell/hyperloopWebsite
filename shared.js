const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "subteams.html", label: "Subteams" },
  { href: "members.html", label: "Members" },
  { href: "apply.html", label: "Apply" },
  { href: "updates.html", label: "Updates" },
  { href: "sponsors.html", label: "Sponsors" },
];

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
    return `<a class="${cls}" href="${href}">${label}</a>`;
  }).join("");

  return `
<header class="bg-surface text-primary top-0 z-50 border-b border-outline-variant sticky">
  <div class="flex justify-between items-center w-full px-margin py-4 max-w-container-max mx-auto">
    <a class="font-headline-md text-primary font-black tracking-widest uppercase" href="index.html">CORNELL HYPERLOOP</a>
    <nav class="hidden md:flex gap-gutter items-center">${links}</nav>
    <a href="apply.html" class="hidden md:block bg-primary-container text-on-primary-container px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors duration-200">JOIN TEAM</a>
    <button class="md:hidden text-primary"><span class="material-symbols-outlined">menu</span></button>
  </div>
</header>`;
}

function renderFooter() {
  return `
<footer class="bg-surface-container-lowest text-primary font-body-md text-body-md border-t border-outline-variant">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin py-12 max-w-container-max mx-auto items-center">
    <div class="flex flex-col gap-2">
      <span class="text-on-surface font-bold uppercase tracking-widest text-lg">CORNELL HYPERLOOP</span>
      <span class="text-on-surface-variant text-sm">© 2025 Cornell Hyperloop. Engineered for Velocity.</span>
    </div>
    <div class="flex flex-col md:flex-row gap-4 md:justify-center">
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="#">Upson Hall, Ithaca, NY</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="#">Contact</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="#">Privacy Policy</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="#">Team Mission</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors uppercase font-label-caps text-xs tracking-wider" href="https://hr.cornell.edu/about/workplace-rights/equal-education-and-employment" target="_blank" rel="noopener noreferrer">Equal Opportunity</a>
    </div>
    <div class="flex justify-end gap-4 text-on-surface-variant">
      <a class="hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">language</span></a>
      <a class="hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">mail</span></a>
    </div>
  </div>
</footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nav-placeholder").innerHTML = renderNav();
  document.getElementById("footer-placeholder").innerHTML = renderFooter();
});
