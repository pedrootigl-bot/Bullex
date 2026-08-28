/**
 * Downloads do Partner Hub (equivalente ao useAssetDownload + downloadAsset do Shiver).
 *
 * - Arquivo único: dispara <a href> em /api/download/file (stream no backend).
 * - Kit ZIP: fetch + blob (modal acompanha até o ZIP ficar pronto).
 * - Storage cross-origin sempre passa pelo backend.
 */
(function initBullexDownload(global) {
    const INSTANT_FEEDBACK_MS = 450;

    let downloadingLabel = null;
    let unavailableItem = null;
    let busy = false;
    const listeners = new Set();

    function apiUrlSafe(path) {
        if (typeof global.apiUrl === "function") {
            return global.apiUrl(path);
        }
        return path;
    }

    function getState() {
        return {
            downloadingLabel,
            unavailableItem,
            isDownloading: Boolean(downloadingLabel) || busy
        };
    }

    function notify() {
        const state = getState();
        listeners.forEach((fn) => {
            try {
                fn(state);
            } catch (err) {
                console.error("download listener:", err);
            }
        });
    }

    function subscribe(fn) {
        if (typeof fn !== "function") return () => {};
        listeners.add(fn);
        return () => listeners.delete(fn);
    }

    function esperarMs(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function isStoragePublicUrl(url) {
        return /\/storage\/v1\/object\/public\//i.test(String(url || ""));
    }

    function isHttpUrl(url) {
        return /^https?:\/\//i.test(String(url || ""));
    }

    function nomeArquivoDeUrl(caminho, fallback = "material") {
        try {
            const limpo = String(caminho).split("?")[0];
            const nome = limpo.substring(limpo.lastIndexOf("/") + 1);
            return decodeURIComponent(nome || fallback);
        } catch {
            return fallback;
        }
    }

    function setDownloadButtonsDisabled(disabled) {
        document
            .querySelectorAll(
                ".modal__material-download, #downloadKit, #highlightDownloadStory, [data-download-action]"
            )
            .forEach((el) => {
                if (disabled) {
                    el.setAttribute("aria-busy", "true");
                    el.classList.add("is-downloading");
                    if (el.tagName === "BUTTON") {
                        el.disabled = true;
                    } else {
                        el.setAttribute("aria-disabled", "true");
                        el.dataset.downloadLocked = "1";
                    }
                } else {
                    el.removeAttribute("aria-busy");
                    el.classList.remove("is-downloading");
                    if (el.tagName === "BUTTON") {
                        el.disabled = false;
                    } else if (el.dataset.downloadLocked === "1") {
                        el.removeAttribute("aria-disabled");
                        delete el.dataset.downloadLocked;
                    }
                }
            });
    }

    function showDownloadingDialog(label) {
        downloadingLabel = label || "Baixando arquivo";
        const dialog = document.getElementById("downloadingDialog");
        const labelEl = document.getElementById("downloadingDialogLabel");
        if (labelEl) labelEl.textContent = downloadingLabel;
        if (dialog) {
            dialog.hidden = false;
            dialog.setAttribute("aria-hidden", "false");
        }
        setDownloadButtonsDisabled(true);
        notify();
    }

    function hideDownloadingDialog() {
        downloadingLabel = null;
        const dialog = document.getElementById("downloadingDialog");
        if (dialog) {
            dialog.hidden = true;
            dialog.setAttribute("aria-hidden", "true");
        }
        setDownloadButtonsDisabled(false);
        notify();
    }

    function markUnavailable(item) {
        unavailableItem = {
            title: item?.title || item?.nome || "Arquivo",
            message:
                item?.message
                || "Este arquivo está indisponível no momento. Tente novamente mais tarde."
        };

        const dialog = document.getElementById("unavailableDownloadDialog");
        const titleEl = document.getElementById("unavailableDownloadTitle");
        const msgEl = document.getElementById("unavailableDownloadMessage");

        if (titleEl) {
            titleEl.textContent = `Não foi possível baixar: ${unavailableItem.title}`;
        }
        if (msgEl) msgEl.textContent = unavailableItem.message;
        if (dialog) {
            dialog.hidden = false;
            dialog.setAttribute("aria-hidden", "false");
        }
        notify();
    }

    function clearUnavailable() {
        unavailableItem = null;
        const dialog = document.getElementById("unavailableDownloadDialog");
        if (dialog) {
            dialog.hidden = true;
            dialog.setAttribute("aria-hidden", "true");
        }
        notify();
    }

    function triggerHrefDownload(href, downloadName) {
        const link = document.createElement("a");
        link.href = href;
        if (downloadName) link.setAttribute("download", downloadName);
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function triggerBlobDownload(blob, filename) {
        const objectUrl = URL.createObjectURL(blob);
        triggerHrefDownload(objectUrl, filename || "download");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }

    function buildFileDownloadUrl(fileUrl, nome) {
        const params = new URLSearchParams({ url: String(fileUrl) });
        if (nome) params.set("nome", String(nome));
        return apiUrlSafe(`/api/download/file?${params.toString()}`);
    }

    /**
     * @param {object} options
     * @param {"file"|"kit"} [options.type]
     * @param {string} [options.url] URL do material / story
     * @param {string|number} [options.campanhaId] obrigatório para kit
     * @param {string} [options.nome]
     * @param {string} [options.label]
     */
    async function startDownload(options = {}) {
        if (busy) return { ok: false, reason: "busy" };

        const type = options.type === "kit" ? "kit" : "file";
        const nome = options.nome || (type === "kit" ? "Kit completo" : "Arquivo");
        const label = options.label || "Baixando arquivo";
        const url = String(options.url || "").trim();
        const campanhaId = options.campanhaId;

        busy = true;

        try {
            if (type === "kit") {
                if (!campanhaId) {
                    markUnavailable({
                        title: nome,
                        message: "Campanha inválida para montar o kit."
                    });
                    return { ok: false, reason: "invalid" };
                }

                showDownloadingDialog(label);

                const kitUrl = apiUrlSafe(`/api/download/kit/${campanhaId}`);
                const resposta = await fetch(kitUrl);

                if (!resposta.ok) {
                    let detalhe = `HTTP ${resposta.status}`;
                    try {
                        const body = await resposta.json();
                        if (body?.erro) detalhe = body.erro;
                    } catch (_) {
                        // ignore
                    }
                    throw new Error(detalhe);
                }

                const blob = await resposta.blob();
                triggerBlobDownload(blob, `kit-${campanhaId}.zip`);
                hideDownloadingDialog();
                return { ok: true };
            }

            if (!url || url === "#") {
                markUnavailable({
                    title: nome,
                    message: "URL do arquivo inválida ou ausente."
                });
                return { ok: false, reason: "invalid" };
            }

            showDownloadingDialog(label);

            // Storage Supabase → sempre via backend (stream)
            if (isStoragePublicUrl(url)) {
                triggerHrefDownload(
                    buildFileDownloadUrl(url, nomeArquivoDeUrl(url, nome)),
                    nomeArquivoDeUrl(url, nome)
                );
            } else if (isHttpUrl(url) || url.startsWith("/")) {
                // Asset local / mesma origem: <a> direto (sem esperar blob)
                triggerHrefDownload(url, nomeArquivoDeUrl(url, nome));
            } else {
                throw new Error("URL do arquivo inválida");
            }

            await esperarMs(INSTANT_FEEDBACK_MS);
            hideDownloadingDialog();
            return { ok: true };
        } catch (error) {
            console.error("Erro no download:", error);
            hideDownloadingDialog();
            markUnavailable({
                title: nome,
                message:
                    error?.message
                    || "Este arquivo está indisponível no momento."
            });
            return { ok: false, reason: "error", error };
        } finally {
            busy = false;
            notify();
        }
    }

    function bindDialogControls() {
        document
            .querySelectorAll("[data-unavailable-close]")
            .forEach((el) => {
                if (el.dataset.boundDownloadUi) return;
                el.dataset.boundDownloadUi = "1";
                el.addEventListener("click", (event) => {
                    event.preventDefault();
                    clearUnavailable();
                });
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindDialogControls);
    } else {
        bindDialogControls();
    }

    global.BullexDownload = {
        startDownload,
        downloadAsset: startDownload,
        clearUnavailable,
        markUnavailable,
        getState,
        subscribe,
        isDownloading: () => getState().isDownloading
    };
})(typeof window !== "undefined" ? window : globalThis);
