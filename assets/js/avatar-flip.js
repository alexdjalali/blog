(function () {
  "use strict";
  var card = document.querySelector(".avatar-flip");
  if (!card) return;

  function toggle() {
    card.classList.toggle("is-flipped");
    var flipped = card.classList.contains("is-flipped");
    card.setAttribute("aria-label",
      flipped ? "Showing real photo. Click to flip back to AI-generated avatar."
              : "Click to flip between AI-generated and real photo");
  }

  card.addEventListener("click", toggle);
  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
})();
