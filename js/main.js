(function () {
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
