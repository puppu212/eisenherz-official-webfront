(function () {
  // ---- Loader ----
  const loader = document.getElementById("loader");
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    loader.classList.add("hide");
    document.body.style.overflow = "";
    setTimeout(() => loader.remove(), 600);
  }, 1200);

  // ---- Hamburger ----
  const hamBtn = document.getElementById("ham-btn");
  const navOverlay = document.getElementById("nav-overlay");

  hamBtn.addEventListener("click", () => {
    const open = navOverlay.classList.toggle("open");
    hamBtn.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  navOverlay.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navOverlay.classList.remove("open");
      hamBtn.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  // ---- Scroll reveal ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  const observe = (sel) => document.querySelectorAll(sel).forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });

  // 単体要素
  [".sh", ".kv-wrap", ".about-body", ".about-stats", ".werke-lead", ".colo .big", ".colo-bot"].forEach(observe);

  // 曲リスト
  observe(".trk");

  // キャラクターカード：左右交互スライド
  document.querySelectorAll(".member").forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? "reveal-left" : "reveal-right");
    el.style.transitionDelay = `${i * 0.1}s`;
    observer.observe(el);
  });
})();
