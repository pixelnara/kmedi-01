// ============================================================
//  Grand InterContinental Seoul Parnas — interactions
// ============================================================
(function () {
  "use strict";

  /* ---------- Header: transparent -> solid on scroll ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add("is-solid");
    else header.classList.remove("is-solid");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- GNB full-screen overlay ---------- */
  const overlay = document.querySelector(".gnb-overlay");
  const openBtn = document.querySelector(".menu-btn");
  const closeBtn = document.querySelector(".gnb-overlay__close");
  if (openBtn && overlay) {
    openBtn.addEventListener("click", () => {
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  }

  /* ---------- Hero slider ---------- */
  const slides = [...document.querySelectorAll(".hero__slide")];
  const dots = [...document.querySelectorAll(".hero__dots button")];
  let cur = 0;
  let timer = null;
  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === cur));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === cur));
  }
  function play() {
    stop();
    timer = setInterval(() => go(cur + 1), 6000);
  }
  function stop() {
    if (timer) clearInterval(timer);
  }
  dots.forEach((d, k) =>
    d.addEventListener("click", () => {
      go(k);
      play();
    }),
  );
  if (slides.length) {
    go(0);
    play();
  }

  /* ---------- Booking widget tabs ---------- */
  const bkTabs = [...document.querySelectorAll(".booking__tab")];
  const bkBodies = [...document.querySelectorAll(".booking__body")];
  bkTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const t = tab.dataset.target;
      bkTabs.forEach((x) => x.classList.toggle("is-active", x === tab));
      bkBodies.forEach((b) => b.classList.toggle("is-active", b.dataset.body === t));
    });
  });

  /* ---------- Collection horizontal scroller ---------- */
  const track = document.querySelector(".collection__track");
  const prev = document.querySelector(".cnav-btn--prev");
  const next = document.querySelector(".cnav-btn--next");
  if (track && prev && next) {
    const step = () => {
      const card = track.querySelector(".col-card");
      return card ? card.getBoundingClientRect().width + 30 : 360;
    };
    const updateBtns = () => {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", updateBtns, { passive: true });
    window.addEventListener("resize", updateBtns);
    updateBtns();
  }

  /* ---------- News filter ---------- */
  const filters = [...document.querySelectorAll(".filter")];
  const cards = [...document.querySelectorAll(".news-card")];
  filters.forEach((f) => {
    f.addEventListener("click", () => {
      const cat = f.dataset.cat;
      filters.forEach((x) => x.classList.toggle("is-active", x === f));
      cards.forEach((c) => {
        const show = cat === "all" || c.dataset.cat === cat;
        c.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------- Services accordion ---------- */
  const accItems = [...document.querySelectorAll(".acc-item")];
  function setAcc(item, open) {
    const body = item.querySelector(".acc-body");
    item.classList.toggle("is-open", open);
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  }
  accItems.forEach((item) => {
    const head = item.querySelector(".acc-head");
    head.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      accItems.forEach((other) => setAcc(other, false));
      if (willOpen) setAcc(item, true);
    });
  });
  // initialise open item
  accItems.forEach((item) => setAcc(item, item.classList.contains("is-open")));
  window.addEventListener("resize", () => {
    accItems.forEach((item) => {
      if (item.classList.contains("is-open")) setAcc(item, true);
    });
  });

  /* ---------- Feature slider (transform drag + dots, centered peek) ---------- */
  const fvp = document.querySelector(".feature__viewport");
  if (fvp) {
    const ftrack = fvp.querySelector(".feature__track");
    const originalSlides = [...fvp.querySelectorAll(".feature__slide")];
    const fDots = [...document.querySelectorAll(".feature__dots button")];
    const slideCount = originalSlides.length;
    let fIndex = 0;

    // clone slides on both sides to create an infinite scrolling effect
    originalSlides.forEach((slide) => ftrack.appendChild(slide.cloneNode(true)));
    originalSlides
      .slice()
      .reverse()
      .forEach((slide) => ftrack.insertBefore(slide.cloneNode(true), ftrack.firstChild));
    const fSlides = [...fvp.querySelectorAll(".feature__slide")];
    const cloneOffset = slideCount;

    function metrics() {
      const w = fSlides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(ftrack).columnGap) || 0;
      return { w, step: w + gap };
    }
    function baseFor(i) {
      const { w, step } = metrics();
      return fvp.clientWidth / 2 - (i * step + w / 2);
    }
    function setTranslate(x, anim) {
      ftrack.classList.toggle("no-anim", !anim);
      ftrack.style.transform = "translateX(" + x + "px)";
    }
    function wrapIndex(i) {
      return ((i % slideCount) + slideCount) % slideCount;
    }
    function goFeature(i, anim) {
      fIndex = wrapIndex(i);
      setTranslate(baseFor(cloneOffset + fIndex), anim !== false);
      fDots.forEach((d, k) => d.classList.toggle("is-active", k === fIndex));
    }
    fDots.forEach((d, k) => d.addEventListener("click", () => goFeature(k)));

    // pointer drag — only hijack when gesture is clearly horizontal
    let down = false,
      decided = false,
      horiz = false;
    let startX = 0,
      startY = 0,
      base = 0,
      moved = false;
    fvp.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true;
      decided = false;
      horiz = false;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      base = baseFor(fIndex);
    });
    fvp.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX,
        dy = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        decided = true;
        horiz = Math.abs(dx) > Math.abs(dy);
        if (horiz) {
          fvp.classList.add("is-dragging");
          fvp.setPointerCapture(e.pointerId);
        }
      }
      if (!horiz) return; // vertical gesture → let page scroll
      moved = true;
      e.preventDefault();
      setTranslate(base + dx, false);
    });
    function endDrag(e) {
      if (!down) return;
      down = false;
      if (horiz) {
        fvp.classList.remove("is-dragging");
        try {
          fvp.releasePointerCapture(e.pointerId);
        } catch (err) {}
        const dx = e.clientX - startX;
        const { step } = metrics();
        // move at least one slide past a 12% threshold, more for longer drags
        let shift = 0;
        if (Math.abs(dx) > step * 0.12) {
          shift = -Math.round(dx / step);
          if (shift === 0) shift = dx < 0 ? 1 : -1;
        }
        goFeature(fIndex + shift);
      }
    }
    fvp.addEventListener("pointerup", endDrag);
    fvp.addEventListener("pointercancel", endDrag);
    fvp.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
    fvp.addEventListener("dragstart", (e) => e.preventDefault());

    window.addEventListener("resize", () => goFeature(fIndex, false));
    window.requestAnimationFrame(() => goFeature(0, false));
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14 },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
})();
