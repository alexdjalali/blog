(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll(".card-deck").forEach(function (deck) {
    var items = Array.prototype.slice.call(
      deck.querySelectorAll(".card-deck-item")
    );
    if (items.length < 2) {
      // Single-card deck — mark it current and skip controls
      if (items.length === 1) items[0].classList.add("is-current");
      return;
    }

    var currentIndex = 0;

    // Mark deck
    deck.classList.add("has-multiple", "is-active");
    deck.setAttribute("tabindex", "0");
    deck.setAttribute("role", "region");

    // Set first card visible
    items[0].classList.add("is-current");

    // Build nav controls
    var nav = document.createElement("div");
    nav.className = "card-deck-nav";

    var prevBtn = document.createElement("button");
    prevBtn.className = "card-deck-btn card-deck-prev";
    prevBtn.setAttribute("aria-label", "Previous card");
    prevBtn.innerHTML = "&#8592;";
    prevBtn.disabled = true;

    var nextBtn = document.createElement("button");
    nextBtn.className = "card-deck-btn card-deck-next";
    nextBtn.setAttribute("aria-label", "Next card");
    nextBtn.innerHTML = "&#8594;";

    var counter = document.createElement("span");
    counter.className = "card-deck-counter";
    counter.setAttribute("aria-live", "polite");
    counter.textContent = "1 / " + items.length;

    nav.appendChild(prevBtn);
    nav.appendChild(counter);
    nav.appendChild(nextBtn);
    deck.appendChild(nav);

    function updateButtons() {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === items.length - 1;
      counter.textContent = (currentIndex + 1) + " / " + items.length;
    }

    function goTo(newIndex, direction) {
      if (newIndex === currentIndex) return;
      if (newIndex < 0 || newIndex >= items.length) return;

      var outgoing = items[currentIndex];
      var incoming = items[newIndex];

      if (reducedMotion.matches) {
        // Instant swap — no animation
        outgoing.classList.remove("is-current");
        outgoing.style.transform = "";
        incoming.classList.add("is-current");
        incoming.style.transform = "";
        currentIndex = newIndex;
        updateButtons();
        return;
      }

      // Position incoming off-screen as absolute overlay (top:0 so it
      // doesn't fall to its static position below the outgoing card)
      var offset = direction === "next" ? "100%" : "-100%";
      incoming.style.transition = "none";
      incoming.style.position = "absolute";
      incoming.style.top = "0";
      incoming.style.left = "0";
      incoming.style.right = "0";
      incoming.style.transform = "translateX(" + offset + ")";
      incoming.style.opacity = "1";
      incoming.style.pointerEvents = "none";

      // Force reflow
      void incoming.offsetHeight;

      // Re-enable transitions
      incoming.style.transition = "";

      // Slide incoming in — inline position:absolute already set,
      // so adding is-current won't flash position:relative
      incoming.classList.add("is-current");
      incoming.style.transform = "translateX(0)";

      // Slide outgoing out (keep relative so it holds container height)
      var exitOffset = direction === "next" ? "-100%" : "100%";
      outgoing.style.transform = "translateX(" + exitOffset + ")";
      outgoing.style.opacity = "0";

      function cleanUp() {
        outgoing.classList.remove("is-current");
        outgoing.style.transform = "";
        outgoing.style.opacity = "";
        outgoing.style.position = "";
        outgoing.style.transition = "";
        // Clear inline overrides so CSS .is-current { position:relative } takes over
        incoming.style.position = "";
        incoming.style.top = "";
        incoming.style.left = "";
        incoming.style.right = "";
        incoming.style.pointerEvents = "";
        outgoing.removeEventListener("transitionend", cleanUp);
      }

      outgoing.addEventListener("transitionend", cleanUp);

      // Safety fallback if transitionend doesn't fire
      setTimeout(cleanUp, 500);

      currentIndex = newIndex;
      updateButtons();
    }

    prevBtn.addEventListener("click", function () {
      goTo(currentIndex - 1, "prev");
    });

    nextBtn.addEventListener("click", function () {
      goTo(currentIndex + 1, "next");
    });

    // Keyboard navigation when deck or children focused
    deck.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "Left") {
        e.preventDefault();
        goTo(currentIndex - 1, "prev");
      } else if (e.key === "ArrowRight" || e.key === "Right") {
        e.preventDefault();
        goTo(currentIndex + 1, "next");
      }
    });
  });
})();
