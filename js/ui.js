(function () {
  const LOADER_DELAY = 1200;
  const LOADER_FADE_DURATION = 600;
  const REVEAL_SELECTOR_GROUPS = [
    ".hero-cta",
    ".sh",
    ".kv-wrap",
    ".about-body",
    ".about-stats",
    ".werke-lead",
    ".colo .big",
    ".colo-bot",
    ".trk",
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileViewport = window.matchMedia("(max-width: 768px)");
  const loader = document.getElementById("loader");
  const menuButton = document.getElementById("ham-btn");
  const menu = document.getElementById("nav-overlay");
  const menuLinks = [...menu.querySelectorAll("a")];

  let lockedScrollY = 0;
  let menuOpen = false;

  function removeLoader() {
    loader.classList.add("hide");
    document.body.style.overflow = "";
    window.setTimeout(() => loader.remove(), reduceMotion ? 0 : LOADER_FADE_DURATION);
  }

  function lockScroll() {
    lockedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    if (document.body.style.position !== "fixed") return;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  }

  function setMenuState(open, restoreFocus = false) {
    menuOpen = open;
    menu.classList.toggle("open", open);
    menuButton.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    menu.toggleAttribute("inert", !open);

    if (open) {
      lockScroll();
      window.requestAnimationFrame(() => menuLinks[0]?.focus());
      return;
    }

    unlockScroll();
    if (restoreFocus) menuButton.focus();
  }

  function handleMenuKeydown(event) {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      setMenuState(false, true);
      return;
    }
    if (event.key !== "Tab") return;

    const firstLink = menuLinks[0];
    const lastLink = menuLinks[menuLinks.length - 1];
    const movingForwardFromEnd = !event.shiftKey &&
      (document.activeElement === lastLink || document.activeElement === menuButton);
    const movingBackFromButton = event.shiftKey && document.activeElement === menuButton;

    if (movingForwardFromEnd) {
      event.preventDefault();
      firstLink.focus();
    } else if (movingBackFromButton) {
      event.preventDefault();
      lastLink.focus();
    }
  }

  const revealObserver = reduceMotion ? null : new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function registerReveal(element, className = "reveal", delay = 0) {
    element.classList.add(className);
    if (delay) element.style.transitionDelay = `${delay}s`;

    if (reduceMotion) element.classList.add("visible");
    else revealObserver.observe(element);
  }

  document.body.style.overflow = "hidden";
  window.setTimeout(removeLoader, reduceMotion ? 0 : LOADER_DELAY);

  menuButton.addEventListener("click", () => setMenuState(!menuOpen, menuOpen));
  menuLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));
  document.addEventListener("keydown", handleMenuKeydown);
  mobileViewport.addEventListener("change", (event) => {
    if (menuOpen && !event.matches) setMenuState(false);
  });

  REVEAL_SELECTOR_GROUPS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => registerReveal(element));
  });
  document.querySelectorAll(".member").forEach((element, index) => {
    const direction = index % 2 === 0 ? "reveal-left" : "reveal-right";
    registerReveal(element, direction, index * 0.1);
  });
})();
