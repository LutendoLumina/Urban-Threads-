// Applies persisted/OS theme ASAP and wires up any [data-theme-toggle] buttons.
(function () {
  var STORAGE_KEY = "urbanThreads.theme"; // "light" | "dark"
  var root = document.documentElement;

  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
      // ignore
    }
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    // Helps native form controls match theme.
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore
    }
    updateToggleA11y(theme);
  }

  function updateToggleA11y(theme) {
    var pressed = theme === "dark";
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(pressed));
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
      var label = btn.querySelector("[data-theme-toggle-label]");
      if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    });
  }

  // Initial theme (before first paint).
  applyTheme(getPreferredTheme());

  // Wire up toggles after DOM is ready.
  window.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (e) {
      var target = e.target;
      if (!(target instanceof Element)) return;
      var btn = target.closest("[data-theme-toggle]");
      if (!btn) return;
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
    updateToggleA11y(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  });

  // If user never chose, follow OS changes live.
  try {
    var media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", function () {
      var saved = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      if (saved === "light" || saved === "dark") return;
      applyTheme(media.matches ? "light" : "dark");
    });
  } catch (e) {
    // ignore
  }
})();

