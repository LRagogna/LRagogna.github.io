(function () {
  /* Custom circle cursor: a small dot at the pointer + a larger ring that
     trails it with easing, growing over interactive elements. */
  var mm = window.matchMedia;
  var finePointer = !mm || (mm("(hover: hover)").matches && mm("(pointer: fine)").matches);
  if (!finePointer) return;   /* skip on touch / coarse pointers */

  var reduceMotion = mm && mm("(prefers-reduced-motion: reduce)").matches;

  var ring = document.createElement("div");
  ring.className = "cursor-ring";
  var dot = document.createElement("div");
  dot.className = "cursor-dot";

  function attach() {
    document.body.appendChild(ring);
    document.body.appendChild(dot);
  }
  if (document.body) attach();
  else document.addEventListener("DOMContentLoaded", attach);

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var rx = mx, ry = my;
  var active = false;

  function place(el, x, y) {
    el.style.transform = "translate(" + x + "px, " + y + "px)";
  }

  window.addEventListener("mousemove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    place(dot, mx, my);
    if (reduceMotion) place(ring, mx, my);
    if (!active) {
      active = true;
      document.body.classList.add("cursor-active");
    }
  }, { passive: true });

  document.addEventListener("mouseleave", function () {
    document.body.classList.remove("cursor-active");
    active = false;
  });
  document.addEventListener("mousedown", function () {
    document.body.classList.add("cursor-down");
  });
  document.addEventListener("mouseup", function () {
    document.body.classList.remove("cursor-down");
  });

  /* Grow the ring when over anything clickable */
  var interactive = 'a, button, .card, [role="button"], .chip, summary, label';
  document.addEventListener("mouseover", function (e) {
    if (e.target.closest && e.target.closest(interactive)) {
      document.body.classList.add("cursor-hover");
    }
  });
  document.addEventListener("mouseout", function (e) {
    if (e.target.closest && e.target.closest(interactive)) {
      var to = e.relatedTarget;
      if (!to || !(to.closest && to.closest(interactive))) {
        document.body.classList.remove("cursor-hover");
      }
    }
  });

  if (!reduceMotion) {
    (function loop() {
      rx += (mx - rx) * 0.18;   /* easing toward the pointer */
      ry += (my - ry) * 0.18;
      place(ring, rx, ry);
      requestAnimationFrame(loop);
    })();
  }
})();
