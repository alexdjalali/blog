(function () {
  "use strict";

  var langNames = {
    go: "Go",
    python: "Python",
    py: "Python",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    bash: "Bash",
    sh: "Shell",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    json: "JSON",
    yaml: "YAML",
    toml: "TOML",
    rust: "Rust",
    ruby: "Ruby",
    c: "C",
    cpp: "C++",
  };

  document.querySelectorAll(".content pre > code").forEach(function (code) {
    var pre = code.parentElement;
    var lang = "";

    // Extract language from class="language-xxx"
    var classes = code.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      var match = classes[i].match(/^language-(.+)$/);
      if (match) {
        lang = match[1];
        break;
      }
    }

    var label = langNames[lang] || lang || "Code";

    // Create wrapper
    var wrapper = document.createElement("div");
    wrapper.className = "code-collapse";

    // Create header bar with language label and copy button
    var header = document.createElement("div");
    header.className = "code-collapse-header";

    var toggle = document.createElement("button");
    toggle.className = "code-collapse-toggle";
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = '<span class="code-collapse-arrow">&#9662;</span> ' + label;

    var copyBtn = document.createElement("button");
    copyBtn.className = "code-copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy code to clipboard");

    header.appendChild(toggle);
    header.appendChild(copyBtn);

    // Insert wrapper
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    // Start expanded
    toggle.addEventListener("click", function () {
      var expanded = pre.style.display !== "none";
      pre.style.display = expanded ? "none" : "";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.querySelector(".code-collapse-arrow").classList.toggle("collapsed", expanded);
    });

    // Copy to clipboard
    copyBtn.addEventListener("click", function () {
      var text = code.textContent;
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.textContent = "Copy";
        }, 1500);
      });
    });
  });
})();
