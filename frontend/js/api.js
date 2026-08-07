/**
 * Camada de API — trocar mocks por fetch do banco quando integrar.
 */

/** Mock dos indicadores */
const statsMock = {
    campanhas: 1,
    materiais: 13,
    copies: 9,
    videos: 1
};

/**
 * Mock do destaque do dia ("O que divulgar hoje")
 * Esperado do banco/API — mesmos campos.
 */
const destaqueMock = {
    tag: "BULLCAR",
    titulo: "BULLCAR • Operou, acelerou",
    descricao: "Incentive traders a depositar com o cupom e operar para acumular tickets do HAVAL H6 GT.",
    copy: "Deposite a partir de R$150 com o cupom BULLCAR, opere R$60 e ganhe tickets para concorrer a um HAVAL H6 GT 0 km. Quanto mais operar, mais chances.",
    storyUrl: "assets/images/post.png",
    imagem: "assets/images/post.png",
    mediaLabel: "BULLCAR",
    mediaCaption: "Material recomendado pronto para uso"
};

/**
 * Busca os indicadores da plataforma.
 * Futuro:
 *   const response = await fetch("/api/stats");
 *   if (!response.ok) throw new Error("Falha ao carregar stats");
 *   return response.json();
 */
async function obterStats() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return statsMock;
}

/**
 * Busca o destaque do dia.
 * Futuro:
 *   const response = await fetch("/api/destaque");
 *   if (!response.ok) throw new Error("Falha ao carregar destaque");
 *   return response.json();
 */
async function obterDestaque() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return destaqueMock;
}

/**
 * Busca campanha na API.
 * Futuro: apontar API_URL para o endpoint real.
 */
async function buscarCampanha() {
    const resposta = await fetch("API_URL");
    const dados = await resposta.json();
    carregarCampanha(dados);
}
