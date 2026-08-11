const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireAdminSession();
    if (!session) return;

    const form = document.getElementById("campanhaForm");
    const copiesContainer = document.getElementById("copiesContainer");
    const adicionarCopyBtn = document.getElementById("adicionarCopyBtn");
    const regrasContainer = document.getElementById("regrasContainer");
    const adicionarRegraBtn = document.getElementById("adicionarRegraBtn");
    const materiaisContainer = document.getElementById("materiaisContainer");
    const adicionarMaterialBtn = document.getElementById("adicionarMaterialBtn");
    const voltarBtn = document.getElementById("voltarBtn");
    const cancelarBtn = document.getElementById("cancelarBtn");
    const salvarBtn = document.getElementById("salvarBtn");
    const pageTitle = document.getElementById("pageTitle");

    if (!form) {
        console.error("Formulário #campanhaForm não encontrado.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const campanhaId = params.get("id");
    const isEditando = Boolean(campanhaId);

    let contadorCopies = 0;
    let contadorRegras = 0;
    let contadorMateriais = 0;
    let uploadImagemEmAndamento = false;
    let uploadMaterialEmAndamento = 0;

    const TIPOS_IMAGEM_PERMITIDOS = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
    ];
    const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024;
    const TAMANHO_MAX_MATERIAL = 50 * 1024 * 1024;

    if (isEditando && pageTitle) {
        pageTitle.textContent = "Editar Campanha";
    }

    if (salvarBtn) {
        salvarBtn.innerHTML = isEditando
            ? '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações'
            : '<i class="fa-solid fa-floppy-disk"></i> Salvar campanha';
    }

    function irParaCampanhas() {
        window.location.href = "campanhas.html";
    }

    if (voltarBtn) {
        voltarBtn.addEventListener("click", irParaCampanhas);
    }

    if (cancelarBtn) {
        cancelarBtn.addEventListener("click", irParaCampanhas);
    }

    function escapeHtml(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // ======================================================
    // UPLOAD IMAGEM DO CARD (Drag & Drop)
    // ======================================================

    const imagemCardInput = document.getElementById("imagem_card");
    const imagemCardFile = document.getElementById("imagem_card_file");
    const imagemCardDropzone = document.getElementById("imagemCardDropzone");
    const imagemCardEmpty = document.getElementById("imagemCardEmpty");
    const imagemCardPreview = document.getElementById("imagemCardPreview");
    const imagemCardPreviewImg = document.getElementById("imagemCardPreviewImg");
    const imagemCardFileName = document.getElementById("imagemCardFileName");
    const imagemCardStatus = document.getElementById("imagemCardStatus");
    const imagemCardSelectBtn = document.getElementById("imagemCardSelectBtn");
    const imagemCardReplaceBtn = document.getElementById("imagemCardReplaceBtn");
    const imagemCardRemoveBtn = document.getElementById("imagemCardRemoveBtn");

    function setStatusUpload(mensagem, tipo = "") {
        if (!imagemCardStatus) return;

        if (!mensagem) {
            imagemCardStatus.hidden = true;
            imagemCardStatus.textContent = "";
            imagemCardStatus.className = "upload-dropzone__status";
            return;
        }

        imagemCardStatus.hidden = false;
        imagemCardStatus.textContent = mensagem;
        imagemCardStatus.className = `upload-dropzone__status ${tipo}`.trim();
    }

    function nomeArquivoDeUrl(url) {
        try {
            const limpo = String(url).split("?")[0];
            return limpo.substring(limpo.lastIndexOf("/") + 1) || "imagem-card";
        } catch {
            return "imagem-card";
        }
    }

    function mostrarPreviewImagemCard(url, nomeArquivo = "") {
        if (!imagemCardInput || !url) {
            limparPreviewImagemCard();
            return;
        }

        imagemCardInput.value = url;

        if (imagemCardPreviewImg) {
            imagemCardPreviewImg.src = url;
            imagemCardPreviewImg.alt = nomeArquivo || "Preview da imagem do card";
        }

        if (imagemCardFileName) {
            imagemCardFileName.textContent = nomeArquivo || nomeArquivoDeUrl(url);
        }

        if (imagemCardEmpty) imagemCardEmpty.hidden = true;
        if (imagemCardPreview) imagemCardPreview.hidden = false;
        if (imagemCardDropzone) {
            imagemCardDropzone.classList.add("has-preview");
        }
    }

    function limparPreviewImagemCard() {
        if (imagemCardInput) imagemCardInput.value = "";

        if (imagemCardPreviewImg) {
            imagemCardPreviewImg.src = "";
            imagemCardPreviewImg.alt = "Preview da imagem do card";
        }

        if (imagemCardFileName) {
            imagemCardFileName.textContent = "imagem";
        }

        if (imagemCardFile) imagemCardFile.value = "";
        if (imagemCardEmpty) imagemCardEmpty.hidden = false;
        if (imagemCardPreview) imagemCardPreview.hidden = true;
        if (imagemCardDropzone) {
            imagemCardDropzone.classList.remove("has-preview", "is-dragover", "is-uploading");
        }

        setStatusUpload("");
    }

    function extensaoArquivo(file) {
        const nome = String(file?.name || "");
        const ext = nome.includes(".")
            ? nome.split(".").pop().toLowerCase()
            : "";

        if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") {
            return ext === "jpeg" ? "jpg" : ext;
        }

        if (file?.type === "image/png") return "png";
        if (file?.type === "image/webp") return "webp";
        return "jpg";
    }

    function validarArquivoImagem(file) {
        if (!file) {
            return "Selecione um arquivo de imagem.";
        }

        if (!TIPOS_IMAGEM_PERMITIDOS.includes(file.type)) {
            return "Formato inválido. Use PNG, JPG ou WEBP.";
        }

        if (file.size > TAMANHO_MAX_IMAGEM) {
            return "A imagem deve ter no máximo 5 MB.";
        }

        return null;
    }

    function gerarNomeUnicoArquivo(file) {
        const ext = extensaoArquivo(file);
        const uid =
            (typeof crypto !== "undefined" && crypto.randomUUID)
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        return `imagens/cards/${Date.now()}-${uid}.${ext}`;
    }

   async function enviarImagemCard(file) {

    const erroValidacao = validarArquivoImagem(file);

    if (erroValidacao) {
        setStatusUpload(erroValidacao, "is-error");
        return;
    }

    if (typeof supabaseClient === "undefined") {
        setStatusUpload(
            "Cliente Supabase não carregado.",
            "is-error"
        );
        return;
    }

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        setStatusUpload(
            "Faça login para enviar imagens.",
            "is-error"
        );
        return;
    }

    uploadImagemEmAndamento = true;

    if (imagemCardDropzone) {
        imagemCardDropzone.classList.add("is-uploading");
    }

    if (salvarBtn) {
        salvarBtn.disabled = true;
    }

    setStatusUpload("Enviando imagem...", "is-loading");

    try {

        // ==========================================
        // GERAR NOME ÚNICO
        // ==========================================

        // gerarNomeUnicoArquivo() já retorna o caminho completo:
        // imagens/cards/NOME-UNICO.ext
      const caminho = gerarNomeUnicoArquivo(file);

const { error } = await supabaseClient.storage
    .from("campanhas")
    .upload(caminho, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
    });

        if (error) {
            console.error("Erro retornado pelo Supabase:", error);

            throw new Error(
                error.message || "Falha no upload da imagem."
            );
        }

        // ==========================================
        // GERAR URL PÚBLICA
        // ==========================================

        const { data } = supabaseClient.storage
            .from("campanhas")
            .getPublicUrl(caminho);

        const publicUrl = data?.publicUrl;

        if (!publicUrl) {
            throw new Error(
                "Upload concluído, mas a URL pública não foi gerada."
            );
        }

        console.log("Imagem enviada:", publicUrl);

        // ==========================================
        // PREVIEW
        // ==========================================

        mostrarPreviewImagemCard(
            publicUrl,
            file.name
        );

        setStatusUpload(
            "Imagem enviada com sucesso.",
            "is-success"
        );

    } catch (error) {

        console.error(
            "Erro no upload da imagem:",
            error
        );

        setStatusUpload(
            error.message || "Erro ao enviar imagem.",
            "is-error"
        );

    } finally {

        uploadImagemEmAndamento = false;

        if (imagemCardDropzone) {
            imagemCardDropzone.classList.remove(
                "is-uploading",
                "is-dragover"
            );
        }

        if (salvarBtn) {
            salvarBtn.disabled = false;
        }
    }
}

    function iniciarUploadImagemCard() {
        if (!imagemCardDropzone || !imagemCardFile) return;

        const abrirSeletor = () => imagemCardFile.click();

        if (imagemCardSelectBtn) {
            imagemCardSelectBtn.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                abrirSeletor();
            });
        }

        if (imagemCardReplaceBtn) {
            imagemCardReplaceBtn.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                abrirSeletor();
            });
        }

        if (imagemCardRemoveBtn) {
            imagemCardRemoveBtn.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                limparPreviewImagemCard();
            });
        }

        imagemCardFile.addEventListener("change", () => {
            const file = imagemCardFile.files?.[0];
            if (file) enviarImagemCard(file);
        });

        ["dragenter", "dragover"].forEach((evento) => {
            imagemCardDropzone.addEventListener(evento, (event) => {
                event.preventDefault();
                event.stopPropagation();
                imagemCardDropzone.classList.add("is-dragover");
            });
        });

        ["dragleave", "drop"].forEach((evento) => {
            imagemCardDropzone.addEventListener(evento, (event) => {
                event.preventDefault();
                event.stopPropagation();
                imagemCardDropzone.classList.remove("is-dragover");
            });
        });

        imagemCardDropzone.addEventListener("drop", (event) => {
            const file = event.dataTransfer?.files?.[0];
            if (file) enviarImagemCard(file);
        });

        imagemCardDropzone.addEventListener("click", (event) => {
            if (
                event.target.closest("button") ||
                event.target.closest(".upload-dropzone__preview")
            ) {
                return;
            }

            if (!imagemCardInput?.value) {
                abrirSeletor();
            }
        });
    }

    iniciarUploadImagemCard();

    function atualizarOrdens() {
        const copies = copiesContainer?.querySelectorAll(".copy-item") || [];

        copies.forEach((copy, index) => {
            const ordemInput = copy.querySelector(".copy-ordem");
            const badge = copy.querySelector(".copy-item__badge");
            const titulo = copy.querySelector("h3");

            if (ordemInput) ordemInput.value = index + 1;
            if (badge) badge.textContent = `COPY ${index + 1}`;
            if (titulo && !copy.querySelector(".copy-item__badge")) {
                titulo.textContent = `Copy ${index + 1}`;
            }
        });
    }

    function atualizarOrdensRegras() {
        const regras = regrasContainer?.querySelectorAll(".regra-item") || [];

        regras.forEach((regra, index) => {
            const ordemInput = regra.querySelector(".regra-ordem");
            const titulo = regra.querySelector("h3");

            if (ordemInput) ordemInput.value = index + 1;
            if (titulo) titulo.textContent = `Regra ${index + 1}`;
        });
    }

    function atualizarTitulosMateriais() {
        const materiais = materiaisContainer?.querySelectorAll(".material-item") || [];

        materiais.forEach((material, index) => {
            const titulo = material.querySelector("h3");
            if (titulo) titulo.textContent = `Material ${index + 1}`;
        });
    }

    function adicionarCopy(dados = {}) {
        if (!copiesContainer) {
            console.error("Container #copiesContainer não encontrado.");
            return;
        }

        contadorCopies += 1;

        const copyElement = document.createElement("div");
        copyElement.className = "copy-item";
        copyElement.dataset.copy = String(contadorCopies);

        if (dados.id) {
            copyElement.dataset.id = String(dados.id);
        }

        copyElement.innerHTML = `
            <div class="copy-item__header">
                <div>
                    <span class="copy-item__badge">COPY ${contadorCopies}</span>
                    <h3>Texto recomendado</h3>
                </div>
                <button type="button" class="remover-copy" aria-label="Remover copy">
                    <i class="fa-solid fa-trash"></i>
                    Remover
                </button>
            </div>

            <div class="copy-item__content">
                <div class="copy-field copy-field--full">
                    <label>Título</label>
                    <input
                        type="text"
                        class="copy-titulo"
                        placeholder="Ex: Urgência"
                        value="${escapeHtml(dados.titulo || "")}"
                    >
                </div>

                <div class="copy-field copy-field--full">
                    <label>Texto</label>
                    <textarea
                        class="copy-texto"
                        rows="5"
                        placeholder="Digite o texto da copy..."
                    >${escapeHtml(dados.texto || "")}</textarea>
                </div>

                <div class="copy-field">
                    <label>Canal</label>
                    <input
                        type="text"
                        class="copy-canal"
                        placeholder="Ex: Instagram"
                        value="${escapeHtml(dados.canal || "")}"
                    >
                </div>

                <div class="copy-field">
                    <label>Tipo</label>
                    <input
                        type="text"
                        class="copy-tipo"
                        placeholder="Ex: Story"
                        value="${escapeHtml(dados.tipo || "")}"
                    >
                </div>

                <div class="copy-field">
                    <label>Ordem</label>
                    <input
                        type="number"
                        class="copy-ordem"
                        value="${escapeHtml(dados.ordem || contadorCopies)}"
                        min="1"
                    >
                </div>
            </div>
        `;

        copiesContainer.appendChild(copyElement);
        atualizarOrdens();
    }

    function adicionarRegra(dados = {}) {
        if (!regrasContainer) {
            console.error("Container #regrasContainer não encontrado.");
            return;
        }

        contadorRegras += 1;

        const regraElement = document.createElement("div");
        regraElement.className = "regra-item copy-item";
        regraElement.dataset.regra = String(contadorRegras);

        if (dados.id) {
            regraElement.dataset.id = String(dados.id);
        }

        regraElement.innerHTML = `
            <div class="copy-item__content">
                <h3>Regra ${contadorRegras}</h3>

                <label>Título</label>
                <input
                    type="text"
                    class="regra-titulo"
                    placeholder="Ex: Depósito mínimo"
                    value="${escapeHtml(dados.titulo || "")}"
                >

                <label>Descrição</label>
                <textarea
                    class="regra-descricao"
                    rows="4"
                    placeholder="Descreva a regra..."
                >${escapeHtml(dados.descricao || "")}</textarea>

                <label>Ordem</label>
                <input
                    type="number"
                    class="regra-ordem"
                    value="${escapeHtml(dados.ordem || contadorRegras)}"
                    min="1"
                >

                <button type="button" class="remover-regra btn-secondary">
                    Remover Regra
                </button>
            </div>
        `;

        regrasContainer.appendChild(regraElement);
        atualizarOrdensRegras();
    }

    function pastaMaterialPorArquivo(file) {
        const tipo = String(file?.type || "").toLowerCase();

        if (tipo.startsWith("image/")) return "materiais/imagens";
        if (tipo.startsWith("video/")) return "materiais/videos";
        return "materiais/arquivos";
    }

    function tipoMaterialPorArquivo(file) {
        const tipo = String(file?.type || "").toLowerCase();

        if (tipo.startsWith("image/")) return "Imagem";
        if (tipo.startsWith("video/")) return "Video";
        return "Arquivo";
    }

    function extensaoArquivoMaterial(file) {
        const nome = String(file?.name || "");
        if (nome.includes(".")) {
            return nome.split(".").pop().toLowerCase();
        }

        if (file?.type === "image/png") return "png";
        if (file?.type === "image/webp") return "webp";
        if (file?.type === "image/jpeg" || file?.type === "image/jpg") return "jpg";
        if (file?.type === "video/mp4") return "mp4";
        return "bin";
    }

    function gerarCaminhoMaterial(file) {
        const pasta = pastaMaterialPorArquivo(file);
        const ext = extensaoArquivoMaterial(file);
        const uid =
            (typeof crypto !== "undefined" && crypto.randomUUID)
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        return `${pasta}/${Date.now()}-${uid}.${ext}`;
    }

    function validarArquivoMaterial(file) {
        if (!file) {
            return "Selecione um arquivo.";
        }

        if (file.size > TAMANHO_MAX_MATERIAL) {
            return "O arquivo deve ter no máximo 50 MB.";
        }

        return null;
    }

    function setStatusUploadMaterial(item, mensagem, tipo = "") {
        const status = item?.querySelector(".material-upload-status");
        if (!status) return;

        if (!mensagem) {
            status.hidden = true;
            status.textContent = "";
            status.className = "upload-dropzone__status material-upload-status";
            return;
        }

        status.hidden = false;
        status.textContent = mensagem;
        status.className = `upload-dropzone__status material-upload-status ${tipo}`.trim();
    }

    function mostrarPreviewMaterial(item, url, nomeArquivo = "") {
        const urlInput = item.querySelector(".material-url");
        const empty = item.querySelector(".material-upload-empty");
        const preview = item.querySelector(".material-upload-preview");
        const previewImg = item.querySelector(".material-upload-preview-img");
        const fileName = item.querySelector(".material-upload-filename");
        const dropzone = item.querySelector(".material-upload-dropzone");

        if (urlInput) urlInput.value = url || "";

        if (previewImg) {
            const ehImagem = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url || "");
            if (ehImagem && url) {
                previewImg.hidden = false;
                previewImg.src = url;
                previewImg.alt = nomeArquivo || "Preview do material";
            } else {
                previewImg.hidden = true;
                previewImg.removeAttribute("src");
            }
        }

        if (fileName) {
            fileName.textContent = nomeArquivo || nomeArquivoDeUrl(url) || "arquivo";
        }

        if (empty) empty.hidden = Boolean(url);
        if (preview) preview.hidden = !url;
        if (dropzone) {
            dropzone.classList.toggle("has-preview", Boolean(url));
        }
    }

    function limparUploadMaterial(item) {
        const fileInput = item.querySelector(".material-upload-file");
        if (fileInput) fileInput.value = "";
        mostrarPreviewMaterial(item, "", "");
        setStatusUploadMaterial(item, "");
        item.querySelector(".material-upload-dropzone")?.classList.remove(
            "is-dragover",
            "is-uploading"
        );
    }

    async function enviarArquivoMaterial(item, file) {
        const erroValidacao = validarArquivoMaterial(file);

        if (erroValidacao) {
            setStatusUploadMaterial(item, erroValidacao, "is-error");
            return;
        }

        if (typeof supabaseClient === "undefined") {
            setStatusUploadMaterial(
                item,
                "Cliente Supabase não carregado.",
                "is-error"
            );
            return;
        }

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (!session) {
            setStatusUploadMaterial(
                item,
                "Faça login para enviar arquivos.",
                "is-error"
            );
            return;
        }

        const dropzone = item.querySelector(".material-upload-dropzone");
        const tipoInput = item.querySelector(".material-tipo");
        const nomeInput = item.querySelector(".material-nome");

        uploadMaterialEmAndamento += 1;
        if (salvarBtn) salvarBtn.disabled = true;
        if (dropzone) dropzone.classList.add("is-uploading");

        setStatusUploadMaterial(item, "Enviando arquivo...", "is-loading");

        try {
            const caminho = gerarCaminhoMaterial(file);

            const { error } = await supabaseClient.storage
                .from("campanhas")
                .upload(caminho, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type || undefined
                });

            if (error) {
                throw new Error(
                    error.message || "Falha no upload do material."
                );
            }

            const { data } = supabaseClient.storage
                .from("campanhas")
                .getPublicUrl(caminho);

            const publicUrl = data?.publicUrl;

            if (!publicUrl) {
                throw new Error(
                    "Upload concluído, mas a URL pública não foi gerada."
                );
            }

            if (tipoInput && !tipoInput.value.trim()) {
                tipoInput.value = tipoMaterialPorArquivo(file);
            }

            if (nomeInput && !nomeInput.value.trim()) {
                nomeInput.value = file.name.replace(/\.[^.]+$/, "");
            }

            mostrarPreviewMaterial(item, publicUrl, file.name);
            setStatusUploadMaterial(
                item,
                "Arquivo enviado com sucesso.",
                "is-success"
            );
        } catch (error) {
            console.error("Erro no upload do material:", error);
            setStatusUploadMaterial(
                item,
                error.message || "Erro ao enviar arquivo.",
                "is-error"
            );
        } finally {
            uploadMaterialEmAndamento = Math.max(
                0,
                uploadMaterialEmAndamento - 1
            );

            if (dropzone) {
                dropzone.classList.remove("is-uploading", "is-dragover");
            }

            if (
                salvarBtn &&
                !uploadImagemEmAndamento &&
                uploadMaterialEmAndamento === 0
            ) {
                salvarBtn.disabled = false;
            }
        }
    }

    function adicionarMaterial(dados = {}) {
        if (!materiaisContainer) {
            console.error("Container #materiaisContainer não encontrado.");
            return;
        }

        contadorMateriais += 1;

        const materialElement = document.createElement("div");
        materialElement.className = "material-item copy-item";
        materialElement.dataset.material = String(contadorMateriais);

        if (dados.id) {
            materialElement.dataset.id = String(dados.id);
        }

        const urlAtual = dados.url || "";
        const nomeArquivo = urlAtual ? nomeArquivoDeUrl(urlAtual) : "";
        const ehImagemUrl = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(urlAtual);

        materialElement.innerHTML = `
            <div class="copy-item__content">
                <h3>Material ${contadorMateriais}</h3>

                <label>Nome</label>
                <input
                    type="text"
                    class="material-nome"
                    placeholder="Ex: Banner Haval"
                    value="${escapeHtml(dados.nome || "")}"
                >

                <label>Tipo</label>
                <input
                    type="text"
                    class="material-tipo"
                    placeholder="Ex: Imagem"
                    value="${escapeHtml(dados.tipo || "")}"
                >

                <label>Arquivo do material</label>
                <input
                    type="hidden"
                    class="material-url"
                    value="${escapeHtml(urlAtual)}"
                >

                <input
                    type="file"
                    class="material-upload-file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,video/*,.pdf,.zip"
                    hidden
                >

                <div class="upload-dropzone material-upload-dropzone${urlAtual ? " has-preview" : ""}">
                    <div class="upload-dropzone__empty material-upload-empty"${urlAtual ? " hidden" : ""}>
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <p>Arraste e solte o arquivo aqui</p>
                        <span>Imagens, vídeos ou arquivos · máx. 50 MB</span>
                        <button type="button" class="btn-secondary material-upload-select">
                            Selecionar arquivo
                        </button>
                    </div>

                    <div class="upload-dropzone__preview material-upload-preview"${urlAtual ? "" : " hidden"}>
                        <img
                            class="material-upload-preview-img"
                            alt="Preview do material"
                            ${ehImagemUrl && urlAtual ? `src="${escapeHtml(urlAtual)}"` : "hidden"}
                        >
                        <div class="upload-dropzone__meta">
                            <strong class="material-upload-filename">
                                ${escapeHtml(nomeArquivo || "arquivo")}
                            </strong>
                            <div class="upload-dropzone__actions">
                                <button type="button" class="btn-secondary material-upload-replace">
                                    Trocar
                                </button>
                                <button type="button" class="btn-secondary material-upload-clear">
                                    Remover arquivo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="upload-dropzone__status material-upload-status" hidden></div>
                </div>

                <button type="button" class="remover-material btn-secondary">
                    Remover Material
                </button>
            </div>
        `;

        materiaisContainer.appendChild(materialElement);
        atualizarTitulosMateriais();
    }

    function pegarCopies() {
        const elementos = copiesContainer?.querySelectorAll(".copy-item") || [];
        const copies = [];

        elementos.forEach((element, index) => {
            const titulo = element.querySelector(".copy-titulo")?.value.trim() || "";
            const texto = element.querySelector(".copy-texto")?.value.trim() || "";
            const canal = element.querySelector(".copy-canal")?.value.trim() || "";
            const tipo = element.querySelector(".copy-tipo")?.value.trim() || "";
            const ordem = Number(
                element.querySelector(".copy-ordem")?.value || index + 1
            );

            copies.push({
                id: element.dataset.id || null,
                titulo,
                texto,
                canal,
                tipo,
                ordem
            });
        });

        return copies;
    }

    function pegarRegras() {
        const elementos = regrasContainer?.querySelectorAll(".regra-item") || [];
        const regras = [];

        elementos.forEach((element, index) => {
            const titulo = element.querySelector(".regra-titulo")?.value.trim() || "";
            const descricao = element.querySelector(".regra-descricao")?.value.trim() || "";
            const ordem = Number(
                element.querySelector(".regra-ordem")?.value || index + 1
            );

            regras.push({
                id: element.dataset.id || null,
                titulo,
                descricao,
                ordem
            });
        });

        return regras;
    }

    function pegarMateriais() {
        const elementos = materiaisContainer?.querySelectorAll(".material-item") || [];
        const materiais = [];

        elementos.forEach((element) => {
            const nome = element.querySelector(".material-nome")?.value.trim() || "";
            const tipo = element.querySelector(".material-tipo")?.value.trim() || "";
            const url = element.querySelector(".material-url")?.value.trim() || "";

            materiais.push({
                id: element.dataset.id || null,
                nome,
                tipo,
                url
            });
        });

        return materiais;
    }

    function pegarCategoriasSelecionadas() {
        const checks = document.querySelectorAll(
            '#categoriaGroup input[name="categoria"]:checked'
        );

        return Array.from(checks)
            .map((input) => input.value.trim())
            .filter(Boolean);
    }

    function preencherCategorias(categoriaValor) {
        const checks = document.querySelectorAll(
            '#categoriaGroup input[name="categoria"]'
        );

        const selecionadas = String(categoriaValor || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        checks.forEach((input) => {
            input.checked = selecionadas.includes(input.value);
        });
    }

    function pegarDadosCampanha() {
        return {
            titulo: document.getElementById("titulo")?.value.trim() || "",
            descricao: document.getElementById("descricao")?.value.trim() || "",
            // Mantém o campo string no banco; múltiplas categorias separadas por vírgula
            categoria: pegarCategoriasSelecionadas().join(", "),
            objetivo: document.getElementById("objetivo")?.value.trim() || "",
            premio: document.getElementById("premio")?.value.trim() || "",
            cupom: document.getElementById("cupom")?.value.trim() || "",
            deposito_minimo: document.getElementById("deposito_minimo")?.value || "",
            data_inicio: document.getElementById("data_inicio")?.value || "",
            data_fim: document.getElementById("data_fim")?.value || "",
            status: document.getElementById("status")?.value || "ativa",
            imagem_card: document.getElementById("imagem_card")?.value.trim() || ""
        };
    }

    function preencherFormulario(campanha) {
        const campos = [
            "titulo",
            "descricao",
            "objetivo",
            "premio",
            "cupom",
            "deposito_minimo",
            "data_inicio",
            "data_fim",
            "status",
            "imagem_card"
        ];

        campos.forEach((campo) => {
            const el = document.getElementById(campo);
            if (!el || campanha[campo] == null) return;
            el.value = campanha[campo];
        });

        preencherCategorias(campanha.categoria);

        if (campanha.imagem_card) {
            mostrarPreviewImagemCard(campanha.imagem_card);
        } else {
            limparPreviewImagemCard();
        }
    }

    function validarCampanha(dados) {
        if (!dados.titulo) {
            alert("Digite o título da campanha.");
            return false;
        }

        if (!dados.data_inicio) {
            alert("Informe a data de início.");
            return false;
        }

        if (!dados.data_fim) {
            alert("Informe a data de fim.");
            return false;
        }

        if (dados.data_fim < dados.data_inicio) {
            alert("A data de fim não pode ser anterior à data de início.");
            return false;
        }

        return true;
    }

    function validarCopies(copies) {
        for (let i = 0; i < copies.length; i += 1) {
            const copy = copies[i];
            const n = i + 1;

            if (!copy.titulo) {
                alert(`Digite o título do Copy ${n}.`);
                return false;
            }

            if (!copy.texto) {
                alert(`Digite o texto do Copy ${n}.`);
                return false;
            }

            if (!copy.canal) {
                alert(`Informe o canal do Copy ${n}.`);
                return false;
            }

            if (!copy.tipo) {
                alert(`Informe o tipo do Copy ${n}.`);
                return false;
            }
        }

        return true;
    }

    function validarRegras(regras) {
        for (let i = 0; i < regras.length; i += 1) {
            const regra = regras[i];
            const n = i + 1;

            if (!regra.titulo) {
                alert(`Digite o título da Regra ${n}.`);
                return false;
            }
        }

        return true;
    }

    function validarMateriais(materiais) {
        for (let i = 0; i < materiais.length; i += 1) {
            const material = materiais[i];
            const n = i + 1;

            if (!material.nome) {
                alert(`Digite o nome do Material ${n}.`);
                return false;
            }
        }

        return true;
    }

    async function criarCopies(campanhaCriadaId, copies) {
        for (let i = 0; i < copies.length; i += 1) {
            const copy = copies[i];

            const resposta = await fetch(`${API}/api/copies`, {
                method: "POST",
                headers: await getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({
                    campanha_id: Number(campanhaCriadaId),
                    titulo: copy.titulo,
                    texto: copy.texto,
                    canal: copy.canal,
                    tipo: copy.tipo,
                    ordem: Number(copy.ordem)
                })
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    resultado.error ||
                    `Erro ao criar o Copy ${i + 1}.`
                );
            }
        }
    }

    async function criarRegras(campanhaCriadaId, regras) {
        for (let i = 0; i < regras.length; i += 1) {
            const regra = regras[i];

            const resposta = await fetch(`${API}/api/regras`, {
                method: "POST",
                headers: await getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({
                    campanha_id: Number(campanhaCriadaId),
                    titulo: regra.titulo,
                    descricao: regra.descricao,
                    ordem: Number(regra.ordem)
                })
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    resultado.error ||
                    `Erro ao criar a Regra ${i + 1}.`
                );
            }
        }
    }

    async function criarMateriais(campanhaCriadaId, materiais) {
        for (let i = 0; i < materiais.length; i += 1) {
            const material = materiais[i];

            const resposta = await fetch(`${API}/api/materiais`, {
                method: "POST",
                headers: await getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({
                    campanha_id: Number(campanhaCriadaId),
                    nome: material.nome,
                    tipo: material.tipo,
                    url: material.url
                })
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    resultado.error ||
                    `Erro ao criar o Material ${i + 1}.`
                );
            }
        }
    }

    async function carregarCampanhaParaEdicao() {
        const resposta = await fetch(`${API}/api/campanhas/${campanhaId}`);
        const campanha = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                campanha.erro || "Não foi possível carregar a campanha."
            );
        }

        preencherFormulario(campanha);

        const copiesResposta = await fetch(`${API}/api/copies/${campanhaId}`);
        const copies = await copiesResposta.json();

        if (copiesResposta.ok && Array.isArray(copies)) {
            copies
                .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                .forEach((copy) => adicionarCopy(copy));
        }

        const regrasResposta = await fetch(`${API}/api/regras/${campanhaId}`);
        const regras = await regrasResposta.json();

        if (regrasResposta.ok && Array.isArray(regras)) {
            regras
                .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                .forEach((regra) => adicionarRegra(regra));
        }

        const materiaisResposta = await fetch(`${API}/api/materiais/${campanhaId}`);
        const materiaisDados = await materiaisResposta.json();
        const materiais = Array.isArray(materiaisDados)
            ? materiaisDados
            : (materiaisDados ? [materiaisDados] : []);

        if (materiaisResposta.ok) {
            materiais.forEach((material) => adicionarMaterial(material));
        }
    }

    if (adicionarCopyBtn) {
        adicionarCopyBtn.addEventListener("click", () => adicionarCopy());
    }

    if (adicionarRegraBtn) {
        adicionarRegraBtn.addEventListener("click", () => adicionarRegra());
    }

    if (adicionarMaterialBtn) {
        adicionarMaterialBtn.addEventListener("click", () => adicionarMaterial());
    }

    if (copiesContainer) {
        copiesContainer.addEventListener("click", (event) => {
            const removerBtn = event.target.closest(".remover-copy");
            if (!removerBtn) return;

            const copy = removerBtn.closest(".copy-item");
            if (!copy) return;

            copy.remove();
            atualizarOrdens();
        });
    }

    if (regrasContainer) {
        regrasContainer.addEventListener("click", (event) => {
            const removerBtn = event.target.closest(".remover-regra");
            if (!removerBtn) return;

            const regra = removerBtn.closest(".regra-item");
            if (!regra) return;

            regra.remove();
            atualizarOrdensRegras();
        });
    }

    if (materiaisContainer) {
        materiaisContainer.addEventListener("click", (event) => {
            const material = event.target.closest(".material-item");
            if (!material) return;

            const removerBtn = event.target.closest(".remover-material");
            if (removerBtn) {
                material.remove();
                atualizarTitulosMateriais();
                return;
            }

            const selectBtn = event.target.closest(
                ".material-upload-select, .material-upload-replace"
            );
            if (selectBtn) {
                event.preventDefault();
                event.stopPropagation();
                material.querySelector(".material-upload-file")?.click();
                return;
            }

            const clearBtn = event.target.closest(".material-upload-clear");
            if (clearBtn) {
                event.preventDefault();
                event.stopPropagation();
                limparUploadMaterial(material);
                return;
            }

            const dropzone = event.target.closest(".material-upload-dropzone");
            if (
                dropzone &&
                !event.target.closest("button") &&
                !event.target.closest(".material-upload-preview")
            ) {
                const urlAtual = material.querySelector(".material-url")?.value;
                if (!urlAtual) {
                    material.querySelector(".material-upload-file")?.click();
                }
            }
        });

        materiaisContainer.addEventListener("change", (event) => {
            const fileInput = event.target.closest(".material-upload-file");
            if (!fileInput) return;

            const material = fileInput.closest(".material-item");
            const file = fileInput.files?.[0];
            if (material && file) {
                enviarArquivoMaterial(material, file);
            }
        });

        ["dragenter", "dragover"].forEach((evento) => {
            materiaisContainer.addEventListener(evento, (event) => {
                const dropzone = event.target.closest(".material-upload-dropzone");
                if (!dropzone) return;
                event.preventDefault();
                event.stopPropagation();
                dropzone.classList.add("is-dragover");
            });
        });

        ["dragleave", "drop"].forEach((evento) => {
            materiaisContainer.addEventListener(evento, (event) => {
                const dropzone = event.target.closest(".material-upload-dropzone");
                if (!dropzone) return;
                event.preventDefault();
                event.stopPropagation();
                dropzone.classList.remove("is-dragover");
            });
        });

        materiaisContainer.addEventListener("drop", (event) => {
            const dropzone = event.target.closest(".material-upload-dropzone");
            if (!dropzone) return;

            const material = dropzone.closest(".material-item");
            const file = event.dataTransfer?.files?.[0];
            if (material && file) {
                enviarArquivoMaterial(material, file);
            }
        });
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const textoOriginal = submitButton?.innerHTML;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = isEditando ? "Salvando..." : "Criando...";
        }

        try {
            if (uploadImagemEmAndamento || uploadMaterialEmAndamento > 0) {
                alert("Aguarde o envio dos arquivos terminar.");
                return;
            }

            const dados = pegarDadosCampanha();
            const copies = pegarCopies();
            const regras = pegarRegras();
            const materiais = pegarMateriais();

            if (
                !validarCampanha(dados) ||
                !validarCopies(copies) ||
                !validarRegras(regras) ||
                !validarMateriais(materiais)
            ) {
                return;
            }

            const url = isEditando
                ? `${API}/api/campanhas/${campanhaId}`
                : `${API}/api/campanhas`;

            const method = isEditando ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: await getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(dados)
            });

            const resultado = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    resultado.erro ||
                    resultado.error ||
                    (isEditando
                        ? "Erro ao atualizar campanha."
                        : "Erro ao criar campanha.")
                );
            }

            const campanha = resultado.campanha || resultado;
            const idCriado =
                campanha?.id ||
                resultado.campanha_id ||
                resultado.id ||
                campanhaId;

            // Em criação, envia todos.
            // Em edição, envia apenas itens sem id (adicionados agora).
            const copiesParaCriar = isEditando
                ? copies.filter((copy) => !copy.id)
                : copies;

            const regrasParaCriar = isEditando
                ? regras.filter((regra) => !regra.id)
                : regras;

            const materiaisParaCriar = isEditando
                ? materiais.filter((material) => !material.id)
                : materiais;

            if (idCriado && copiesParaCriar.length > 0) {
                await criarCopies(idCriado, copiesParaCriar);
            }

            if (idCriado && regrasParaCriar.length > 0) {
                await criarRegras(idCriado, regrasParaCriar);
            }

            if (idCriado && materiaisParaCriar.length > 0) {
                await criarMateriais(idCriado, materiaisParaCriar);
            }

            alert(
                isEditando
                    ? "Campanha atualizada com sucesso!"
                    : "Campanha criada com sucesso!"
            );

            irParaCampanhas();
        } catch (error) {
            console.error("Erro ao salvar campanha:", error);
            alert(error.message || "Erro ao salvar campanha.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML =
                    textoOriginal ||
                    '<i class="fa-solid fa-floppy-disk"></i> Salvar campanha';
            }
        }
    });

    // Modo edição: carrega dados. Modo criação: começa com 1 copy vazia.
    if (isEditando) {
        carregarCampanhaParaEdicao().catch((error) => {
            console.error(error);
            alert(error.message || "Erro ao carregar campanha.");
            irParaCampanhas();
        });
    } else {
        adicionarCopy();
    }
});
