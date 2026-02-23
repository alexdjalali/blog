(function () {
  "use strict";
  document.querySelectorAll(".cv-list li").forEach(function (li) {
    var link = li.querySelector("a[href]");
    if (!link) return;
    li.classList.add("has-link");
    li.addEventListener("click", function (e) {
      if (e.target.tagName === "A") return;
      if (e.target.closest("button, .abstract-toggle, .bib-link")) return;
      window.open(link.href, link.target || "_blank", "noopener,noreferrer");
    });
  });
})();
