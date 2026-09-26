(function () {
  /* ---- Robot boot-up intro ---- */
  var intro = document.getElementById("intro");

  function alreadyPowered() {
    try { return sessionStorage.getItem("poweredUp") === "1"; } catch (e) { return false; }
  }
  function markPowered() {
    try { sessionStorage.setItem("poweredUp", "1"); } catch (e) {}
  }

  if (intro && alreadyPowered()) {
    /* Already went through the intro this session (e.g. returning from a
       project page) — skip straight to the site, no power-up screen. */
    intro.parentNode && intro.parentNode.removeChild(intro);
    intro = null;
  }

  if (intro) {
    document.body.classList.add("intro-lock");
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var launched = false;

    function launch() {
      if (launched) return;
      launched = true;
      markPowered();
      intro.classList.add("booting");
      var bootTime  = reduce ? 120 : 1300;   /* robot animation */
      var leaveTime = reduce ? 260 : 940;    /* curtain lift */
      setTimeout(function () {
        intro.classList.add("leaving");
        setTimeout(function () {
          intro.style.display = "none";
          document.body.classList.remove("intro-lock");
        }, leaveTime);
      }, bootTime);
    }

    intro.addEventListener("click", launch);
    intro.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        launch();
      }
    });
    try { intro.focus(); } catch (e) {}
  }

  var SECRET = "turtles";
  var form  = document.getElementById("lockForm");
  var input = document.getElementById("lockInput");
  var gate  = document.getElementById("lockGate");
  var msg   = document.getElementById("lockMsg");

  function reveal() {
    document.querySelectorAll(".locked-content").forEach(function (el) {
      el.hidden = false;
    });
    document.querySelectorAll(".locked-gpa").forEach(function (el) {
      el.textContent = el.getAttribute("data-value") || "3.81";
      el.classList.remove("locked-gpa");
    });
    if (gate) gate.hidden = true;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim().toLowerCase();
      if (val === SECRET) {
        msg.textContent = "";
        reveal();
      } else {
        msg.textContent = "That's not it — try again.";
        gate.classList.remove("lock-err");
        void gate.offsetWidth; /* restart animation */
        gate.classList.add("lock-err");
        input.value = "";
        input.focus();
      }
    });
  }

  /* ---- Mouse-following 3D tilt on project cards ---- */
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = !window.matchMedia || window.matchMedia("(hover: hover)").matches;

  if (!reduceMotion && fine) {
    var MAX_TILT = 9;   /* degrees */
    var tiltCards = document.querySelectorAll("[data-tilt]");

    tiltCards.forEach(function (card) {
      var glare = card.querySelector(".card-glare");
      var frame = null;

      function isSpinning() { return card.classList.contains("spinning"); }

      function onMove(e) {
        if (isSpinning()) return;
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;   /* 0..1 */
        var py = (e.clientY - rect.top) / rect.height;   /* 0..1 */
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var rotY = (px - 0.5) * (MAX_TILT * 2);
          var rotX = (0.5 - py) * (MAX_TILT * 2);
          card.style.transform =
            "perspective(1000px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" +
            rotY.toFixed(2) + "deg) translateY(-6px) scale(1.02)";
          if (glare) {
            glare.style.background =
              "radial-gradient(600px circle at " + (px * 100).toFixed(1) + "% " +
              (py * 100).toFixed(1) +
              "%, rgba(255,255,255,.45), rgba(142,197,239,.12) 35%, transparent 60%)";
            glare.style.opacity = "1";
          }
        });
      }

      function onEnter() { card.classList.add("is-tilting"); }

      function onLeave() {
        if (frame) cancelAnimationFrame(frame);
        card.classList.remove("is-tilting");
        card.style.transform = "";
        if (glare) glare.style.opacity = "0";
      }

      function onClick(e) {
        if (isSpinning()) return;
        var href = card.getAttribute("href");
        if (!href) return;
        e.preventDefault();
        if (frame) cancelAnimationFrame(frame);
        card.classList.remove("is-tilting");
        card.style.transform = "";       /* let the keyframes own the transform */
        if (glare) glare.style.opacity = "0";
        /* force reflow so the animation restarts cleanly */
        void card.offsetWidth;
        card.classList.add("spinning");

        var navigated = false;
        function go() {
          if (navigated) return;
          navigated = true;
          window.location.href = href;
        }
        card.addEventListener("animationend", go, { once: true });
        setTimeout(go, 1500);   /* fallback if animationend doesn't fire */
      }

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("click", onClick);
    });

    /* Reset the cards when returning via the back button (incl. bfcache restore),
       so they never stay stuck mid-spin / faded out. */
    function resetCards() {
      tiltCards.forEach(function (card) {
        card.classList.remove("spinning", "is-tilting");
        card.style.transform = "";
        var g = card.querySelector(".card-glare");
        if (g) { g.style.opacity = "0"; g.style.background = ""; }
      });
    }
    window.addEventListener("pageshow", resetCards);
  }

  /* When we arrive with a hash (e.g. "Back to projects" -> index.html#projects),
     land on that section reliably. The intro can eat the browser's default anchor
     jump, and a too-early jump lands in a gap once fonts/images shift the layout —
     so we jump after full load, instantly, and offset for the sticky nav. */
  (function () {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var target;
    try { target = document.querySelector(hash); } catch (e) { return; }
    if (!target) return;

    function jump() {
      var nav = document.querySelector("nav");
      var offset = nav ? nav.offsetHeight : 0;
      var y = target.getBoundingClientRect().top + window.pageYOffset - offset - 8;
      var html = document.documentElement;
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";   /* instant, no smooth animation */
      window.scrollTo(0, y);
      html.style.scrollBehavior = prev;
    }

    if (document.readyState === "complete") jump();
    else window.addEventListener("load", jump);
  })();
})();
