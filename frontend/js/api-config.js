/**
 * Base da API Bullex
 *
 * - Se front e API estão na mesma origem (Express :3000), usa o host atual
 *   (funciona com localhost e 127.0.0.1).
 * - Em Live Server / outra porta, aponta para http://localhost:3000
 * - Override opcional: window.BULLEX_API_BASE = "http://..."
 */
(function initBullexApiConfig(global) {
    function getApiBase() {
        if (global.BULLEX_API_BASE != null && global.BULLEX_API_BASE !== "") {
            return String(global.BULLEX_API_BASE).replace(/\/$/, "");
        }

        try {
            const { protocol, hostname, port } = global.location;
            const porta = String(port || "");

            // Front servido pelo próprio backend Express
            if (porta === "3000" || porta === "") {
                return `${protocol}//${hostname}${porta ? `:${porta}` : ""}`;
            }
        } catch (_) {
            // ambiente sem window.location
        }

        return "http://localhost:3000";
    }

    function apiUrl(path) {
        if (!path) return getApiBase();
        const texto = String(path);
        if (/^https?:\/\//i.test(texto)) return texto;

        const base = getApiBase().replace(/\/$/, "");
        const caminho = texto.startsWith("/") ? texto : `/${texto}`;
        return `${base}${caminho}`;
    }

    global.getApiBase = getApiBase;
    global.apiUrl = apiUrl;

    // Compatível com páginas admin que usam `const API = ...`
    Object.defineProperty(global, "BULLEX_API", {
        configurable: true,
        enumerable: false,
        get() {
            return getApiBase();
        }
    });
})(typeof window !== "undefined" ? window : globalThis);
