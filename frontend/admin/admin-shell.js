/**
 * Shell responsivo do admin — drawer da sidebar em telas ≤980px.
 */
(function initAdminShell() {
    const sidebar = document.querySelector(".admin-sidebar");
    const toggle = document.getElementById("adminMenuToggle");
    if (!sidebar || !toggle) return;

    let overlay = document.getElementById("adminSidebarOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "adminSidebarOverlay";
        overlay.className = "admin-sidebar-overlay";
        overlay.hidden = true;
        document.body.appendChild(overlay);
    }

    if (!sidebar.id) {
        sidebar.id = "adminSidebar";
    }

    toggle.setAttribute("aria-controls", sidebar.id);
    toggle.setAttribute("aria-expanded", "false");

    function isMobileShell() {
        return window.matchMedia("(max-width: 980px)").matches;
    }

    function fecharMenu() {
        document.body.classList.remove("admin-sidebar-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
        overlay.hidden = true;
    }

    function abrirMenu() {
        if (!isMobileShell()) return;
        document.body.classList.add("admin-sidebar-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fechar menu");
        overlay.hidden = false;
    }

    function alternarMenu() {
        if (document.body.classList.contains("admin-sidebar-open")) {
            fecharMenu();
        } else {
            abrirMenu();
        }
    }

    toggle.addEventListener("click", (event) => {
        event.preventDefault();
        alternarMenu();
    });

    overlay.addEventListener("click", fecharMenu);

    sidebar.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (isMobileShell()) fecharMenu();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") fecharMenu();
    });

    window.addEventListener("resize", () => {
        if (!isMobileShell()) fecharMenu();
    });
})();
