/**
 * Shared state & modal DOM helpers for Review Stat Modals
 */

let _cachedApp = null;

export function setStatModalsApp(app) {
  _cachedApp = app;
}

export function getStatModalsApp() {
  return _cachedApp;
}

export function triggerStatsRefresh(app) {
  if (app && typeof app.updateHomeStatsRealtime === "function") {
    app.updateHomeStatsRealtime();
  } else if (
    typeof window !== "undefined" &&
    typeof window.updateHomeStatsRealtime === "function"
  ) {
    window.updateHomeStatsRealtime(app);
  }
}

export function ensureQuickModal(id) {
  let modal = document.getElementById(id);
  if (!modal) {
    modal = document.createElement("div");
    modal.id = id;
    modal.className = "modal-backdrop";
    document.body.appendChild(modal);
  }
  return modal;
}

export function openAndBindQuickModal(modal) {
  modal.classList.add("active");
  modal.querySelectorAll(".btn-quick-close").forEach((b) => {
    b.onclick = () => modal.classList.remove("active");
  });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("active");
  };
}
