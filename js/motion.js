/* One-shot entrance motion. No scroll handlers or per-frame layout reads. */
(() => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!("IntersectionObserver" in window) || preference.matches) return;

  const targets = [...document.querySelectorAll("[data-reveal]")];
  if (!targets.length) return;

  const reveal = (target, animate = true) => {
    if (!target.classList.contains("is-reveal-pending")) return;
    target.classList.remove("is-reveal-pending");
    if (animate) target.classList.add("is-revealing");
    observer.unobserve(target);
  };

  // Wait until the element is a little farther inside the viewport.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) reveal(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -72px 0px" });

  targets.forEach((target) => {
    const group = target.closest("[data-stagger]");
    if (group) {
      const index = [...group.children].indexOf(target);
      // Keep the delay short, even for a long list or a narrow screen.
      target.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
    }
    observer.observe(target);
    target.classList.add("is-reveal-pending");
  });

  // Release the animation style after completion; no permanent layer hints.
  document.addEventListener("animationend", (event) => {
    if (event.animationName === "reveal-in") {
      event.target.classList.remove("is-revealing");
    }
  });

  // Keyboard navigation must never land on invisible content.
  document.addEventListener("focusin", (event) => {
    targets.forEach((target) => {
      if (target.contains(event.target)) reveal(target, false);
    });
  });

  // Apply a changed OS preference immediately, including in-flight entrances.
  preference.addEventListener("change", (event) => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach((target) => {
      target.classList.remove("is-reveal-pending", "is-revealing");
    });
  });
})();
