(function () {
  var copyBtn = document.getElementById("copy-link-btn");
  if (!copyBtn) return;

  copyBtn.addEventListener("click", function () {
    var url = copyBtn.getAttribute("data-url");
    navigator.clipboard.writeText(url).then(function () {
      var textEl = document.getElementById("copy-link-text");
      var iconEl = copyBtn.querySelector("i");
      textEl.textContent = "Copied!";
      iconEl.className = "fa-solid fa-check";
      setTimeout(function () {
        textEl.textContent = "Copy Link";
        iconEl.className = "fa-solid fa-link";
      }, 2000);
    });
  });
})();
