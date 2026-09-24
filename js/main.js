(function () {
  /* ---- Robot boot-up intro ---- */
  var intro = document.getElementById("intro");
  if (intro) {
    document.body.classList.add("intro-lock");
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var launched = false;

    function launch() {
      if (launched) return;
      launched = true;
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
})();
