(function () {
  /* ---- Click-through project gallery ----
     Each [data-gallery] holds a .gtrack of .gslide figures. One slide is
     visible at a time; prev/next, dots, keyboard arrows, and touch swipe
     move between them. Slides whose image is missing keep their themed
     placeholder, so the gallery looks intentional before real photos exist. */

  var galleries = document.querySelectorAll("[data-gallery]");
  if (!galleries.length) return;

  galleries.forEach(function (root) {
    var track = root.querySelector(".gtrack");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".gslide"));
    if (!track || slides.length === 0) return;

    var prev = root.querySelector(".gprev");
    var next = root.querySelector(".gnext");
    var dotsWrap = root.querySelector(".gdots");
    var nowEl = root.querySelector(".gnow");
    var totalEl = root.querySelector(".gtotal");
    var index = 0;

    /* Reveal a real image once it loads; leave the placeholder if it 404s. */
    slides.forEach(function (slide) {
      var img = slide.querySelector(".gmedia img");
      if (!img) return;
      function show() { img.classList.add("is-loaded"); }
      if (img.complete && img.naturalWidth > 0) show();
      else img.addEventListener("load", show);
      img.addEventListener("error", function () {
        img.classList.remove("is-loaded");
      });
    });

    /* Build dot controls. */
    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "gdot";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", function () { go(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }
    if (totalEl) totalEl.textContent = String(slides.length);

    function update() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, i) {
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === index);
      });
      if (nowEl) nowEl.textContent = String(index + 1);
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    }

    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      update();
    }

    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });

    /* Keyboard arrows when the gallery has focus within. */
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });
    root.setAttribute("tabindex", "0");

    /* Touch swipe. */
    var startX = null;
    var viewport = root.querySelector(".gviewport");
    if (viewport) {
      viewport.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });
      viewport.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        startX = null;
      }, { passive: true });
    }

    update();
  });
})();
