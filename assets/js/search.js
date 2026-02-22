(function () {
  var input = document.getElementById("search-input");
  var resultsContainer = document.getElementById("search-results");
  if (!input || !resultsContainer) return;

  var index = null;
  var indexUrl = input.getAttribute("data-index");

  function fetchIndex() {
    if (index !== null) return Promise.resolve(index);
    return fetch(indexUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        index = data;
        return data;
      });
  }

  function search(query) {
    var q = query.toLowerCase().trim();
    if (!q) return [];
    return index.filter(function (item) {
      var haystack = (
        item.title + " " +
        item.description + " " +
        item.content + " " +
        (item.tags || []).join(" ")
      ).toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function render(results, query) {
    if (!query.trim()) {
      resultsContainer.innerHTML = "";
      return;
    }
    if (results.length === 0) {
      resultsContainer.innerHTML =
        '<li class="search-no-results">No results found for "' +
        escapeHtml(query) + '"</li>';
      return;
    }
    resultsContainer.innerHTML = results
      .map(function (item) {
        return (
          '<li class="search-result-item">' +
          '<div class="search-result-title"><a href="' + escapeHtml(item.url) + '">' +
          escapeHtml(item.title) + '</a></div>' +
          '<div class="search-result-meta">' + escapeHtml(item.date) +
          (item.tags && item.tags.length ? ' · ' + item.tags.map(escapeHtml).join(', ') : '') +
          '</div>' +
          (item.description ? '<div class="search-result-desc">' + escapeHtml(item.description) + '</div>' : '') +
          '</li>'
        );
      })
      .join("");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var debounceTimer;
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    var query = input.value;
    debounceTimer = setTimeout(function () {
      fetchIndex().then(function () {
        render(search(query), query);
      });
    }, 200);
  });
})();
