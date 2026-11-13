// Estado global para controlar a aba ativa (baterias vs bombinhas)
let tipoAtual = 'baterias';
let produtosRenderizados = [];

/**
 * Muda a aba ativa entre 'baterias' e 'bombinhas'
 */
function mudarAba(novoTipo) {
    tipoAtual = novoTipo;

    // Limpa pesquisa ao trocar de aba para mostrar todos os itens da categoria
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        searchInput.value = '';
    }

    carregarGaleria();

    const btnBaterias = document.getElementById('tabBaterias');
    const btnBombinhas = document.getElementById('tabBombinhas');

    const classesAtivo = 'tab-btn active-tab py-2.5 px-3 rounded-xl font-display font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2';
    const classesInativo = 'tab-btn py-2.5 px-3 rounded-xl font-display font-bold text-sm sm:text-base uppercase tracking-wider text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2';

    if (tipoAtual === 'baterias') {
        btnBaterias.className = classesAtivo;
        btnBombinhas.className = classesInativo;
    } else {
        btnBaterias.className = classesInativo;
        btnBombinhas.className = classesAtivo;
    }
}

/**
 * Converte preço textual (ex: "7,50") em número para ordenação
 */
function parsePreco(precoStr) {
    if (!precoStr) return 0;
    return parseFloat(String(precoStr).replace(',', '.')) || 0;
}

/**
 * Transforma a descrição (ex: "100 Tiros Calibre 20") em etiquetas visuais (pills)
 */
function gerarSpecPills(desc) {
    if (!desc || !desc.trim()) return '';

    const texto = desc.trim();
    const matchCalibre = texto.match(/^(.*?)\s*(Calibre\s*\d+)$/i);

    if (matchCalibre) {
        const parteTiros = matchCalibre[1].trim();
        const parteCalibre = matchCalibre[2].trim();
        return `
            <span class="spec-pill spec-pill-gold"><i class="fas fa-crosshairs mr-1 opacity-80"></i>${parteTiros}</span>
            <span class="spec-pill">${parteCalibre}</span>
        `;
    }

    return `<span class="spec-pill spec-pill-gold">${texto}</span>`;
}

/**
 * Renderiza a grelha de produtos com pesquisa, ordenação e visual de alto impacto
 */
function carregarGaleria() {
    const container = document.getElementById('galleryContainer');
    const loading = document.getElementById('loadingState');
    if (loading) loading.style.display = 'none';

    // Atualiza contadores nas abas
    const countBat = document.getElementById('countBaterias');
    const countBomb = document.getElementById('countBombinhas');
    if (countBat && typeof listaProdutos !== 'undefined') countBat.textContent = listaProdutos.length;
    if (countBomb && typeof listaPetardos !== 'undefined') countBomb.textContent = listaPetardos.length;

    const produtosBase = tipoAtual === 'baterias' ? listaProdutos : listaPetardos;
    const pastaImagem = tipoAtual === 'baterias' ? 'baterias' : 'petardo';

    if (typeof produtosBase === 'undefined' || produtosBase.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 mt-10">Sem produtos.</div>';
        return;
    }

    // Filtro de pesquisa
    const termo = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    const criterio = document.getElementById('sortSelect')?.value || 'destaque';

    let produtos = produtosBase.filter(prod => {
        if (!termo) return true;
        return (
            prod.titulo.toLowerCase().includes(termo) ||
            (prod.desc && prod.desc.toLowerCase().includes(termo)) ||
            String(prod.preco).includes(termo)
        );
    });

    // Ordenação
    produtos.sort((a, b) => {
        const stockA = a.stock !== false ? 1 : 0;
        const stockB = b.stock !== false ? 1 : 0;
        if (stockB !== stockA) return stockB - stockA;

        if (criterio === 'menor') {
            return parsePreco(a.preco) - parsePreco(b.preco);
        }
        if (criterio === 'maior') {
            return parsePreco(b.preco) - parsePreco(a.preco);
        }
        // Por defeito ('destaque'): Premium primeiro
        const premA = a.premium === true ? 1 : 0;
        const premB = b.premium === true ? 1 : 0;
        return premB - premA;
    });

    produtosRenderizados = produtos.map(p => ({ ...p, pastaImagem }));

    if (produtos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-14 px-4 bg-dark-900/60 border border-white/5 rounded-2xl">
                <i class="fas fa-search text-2xl text-gold-400 mb-2"></i>
                <p class="text-slate-300 font-bold">Nenhum produto encontrado para "${termo}"</p>
                <button onclick="document.getElementById('searchInput').value='';carregarGaleria();" class="mt-3 text-xs font-bold uppercase tracking-wider text-gold-400 underline">
                    Ver todos os produtos
                </button>
            </div>`;
        return;
    }

    let html = "";

    produtos.forEach((prod, index) => {
        const temStock = typeof prod.stock !== 'undefined' ? prod.stock : true;
        const classEstoque = !temStock ? "out-of-stock pointer-events-none" : "";
        const isPremium = prod.premium === true;

        const badgePremium = isPremium ? `
            <div class="absolute top-2 left-2 bg-gradient-to-r from-gold-400 via-gold-500 to-ember-500 text-black text-[10px] sm:text-xs font-display font-bold px-2.5 py-0.5 rounded-md shadow-lg uppercase tracking-wider z-20 flex items-center gap-1">
                <i class="fas fa-crown text-[9px]"></i> Top
            </div>` : "";

        const zoomHint = `
            <div class="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 border border-white/15 text-slate-300 text-[10px] flex items-center justify-center z-20 opacity-80 group-hover:opacity-100">
                <i class="fas fa-expand"></i>
            </div>`;

        const cardClass = isPremium ? "premium-card" : "";
        const titleColor = isPremium ? "text-gold-300" : "text-white group-hover:text-gold-300";
        const priceColor = isPremium ? "text-black" : "text-gold-400";
        const euroColor = isPremium ? "text-black/80" : "text-ember-500";

        const loadingAttr = index < 4 ? 'eager' : 'lazy';
        const fallbackPng = prod.imagem.replace('.webp', '.png');
        const pillsHtml = gerarSpecPills(prod.desc);

        html += `
            <div onclick="abrirModal(${index})" class="product-card ${cardClass} ${classEstoque} rounded-2xl overflow-hidden group relative flex flex-col justify-between cursor-pointer">
                <div class="image-wrapper relative">
                    ${badgePremium}
                    ${zoomHint}
                    <img src="${pastaImagem}/${prod.imagem}" 
                         loading="${loadingAttr}" 
                         decoding="async"
                         onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${pastaImagem}/${fallbackPng}';}else{this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire';}" 
                         alt="${prod.titulo}" class="product-image">
                </div>

                <div class="p-3 sm:p-4 flex flex-col flex-grow justify-between gap-2.5">
                    <div>
                        <h3 class="font-display font-bold text-base sm:text-xl uppercase tracking-wide ${titleColor} leading-tight line-clamp-2">${prod.titulo}</h3>
                        ${pillsHtml ? `<div class="flex flex-wrap gap-1 mt-1.5">${pillsHtml}</div>` : `<div class="h-4"></div>`}
                    </div>

                    <div class="price-box rounded-xl py-1.5 px-3 flex items-center justify-between">
                        <span class="text-[10px] sm:text-xs uppercase tracking-wider font-bold ${isPremium ? 'text-black/75' : 'text-slate-400'}">Preço</span>
                        <span class="font-display font-bold text-xl sm:text-2xl leading-none ${priceColor}">${prod.preco}<span class="text-xs sm:text-sm align-top ml-0.5 ${euroColor}">€</span></span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Abre o modal de visualização ampliada ao tocar num produto
 */
function abrirModal(index) {
    const prod = produtosRenderizados[index];
    if (!prod) return;

    const modal = document.getElementById('productModal');
    const card = document.getElementById('modalCard');
    const img = document.getElementById('modalImg');
    const title = document.getElementById('modalTitle');
    const badges = document.getElementById('modalBadges');
    const price = document.getElementById('modalPrice');

    const fallbackPng = prod.imagem.replace('.webp', '.png');
    img.dataset.fallback = '';
    img.onerror = function () {
        if (!this.dataset.fallback) {
            this.dataset.fallback = '1';
            this.src = `${prod.pastaImagem}/${fallbackPng}`;
        }
    };
    img.src = `${prod.pastaImagem}/${prod.imagem}`;
    img.alt = prod.titulo;

    title.textContent = prod.titulo;
    price.textContent = prod.preco;
    badges.innerHTML = gerarSpecPills(prod.desc);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    });
}

function fecharModal() {
    const modal = document.getElementById('productModal');
    const card = document.getElementById('modalCard');
    if (!modal) return;

    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 250);
}

/**
 * Sistema leve de Brasas / Faíscas flutuantes em Canvas (60fps em Mobile)
 */
function iniciarBrasasFundo() {
    const canvas = document.getElementById('ember-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }, { passive: true });

    const isMobile = w < 768;
    const total = isMobile ? 22 : 45;
    const cores = ['#FACC15', '#F97316', '#EF4444', '#FEF08A'];

    const brasas = Array.from({ length: total }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2.2,
        vy: 0.35 + Math.random() * 0.85,
        vx: (Math.random() - 0.5) * 0.4,
        alpha: 0.2 + Math.random() * 0.6,
        cor: cores[Math.floor(Math.random() * cores.length)]
    }));

    function animar() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < brasas.length; i++) {
            const b = brasas[i];
            b.y -= b.vy;
            b.x += b.vx;

            if (b.y < -10) {
                b.y = h + 10;
                b.x = Math.random() * w;
            }

            ctx.globalAlpha = b.alpha;
            ctx.fillStyle = b.cor;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(animar);
    }

    animar();
}

// Inicialização imediata
document.addEventListener('DOMContentLoaded', () => {
    carregarGaleria();
    iniciarBrasasFundo();
    iniciarIntro();
});

/**
 * SEQUENCIA DE INTRODUÇÃO BOMBASTICA
 */
function iniciarIntro() {
    const overlay = document.getElementById('intro-overlay');
    const container = document.getElementById('fireworks-container');
    const message = document.getElementById('intro-message');

    if (!overlay) return;

    if (sessionStorage.getItem('galofire_intro_seen') === '1') {
        overlay.remove();
        return;
    }
    sessionStorage.setItem('galofire_intro_seen', '1');

    const isMobile = window.innerWidth < 768;
    const foguetesPorCiclo = isMobile ? 3 : 5;
    let encerrado = false;

    const intervaloLoop = setInterval(() => {
        for (let i = 0; i < foguetesPorCiclo; i++) {
            lancarFoguete(container, isMobile);
        }
    }, 180);

    function fecharIntro() {
        if (encerrado) return;
        encerrado = true;
        clearInterval(intervaloLoop);
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 700);
    }

    overlay.addEventListener('click', fecharIntro, { once: true });
    overlay.addEventListener('touchstart', fecharIntro, { once: true, passive: true });

    setTimeout(() => {
        if (message) {
            message.classList.remove('opacity-0', 'scale-90');
            message.classList.add('opacity-100', 'scale-100');
        }
    }, 300);

    setTimeout(fecharIntro, 3500);
}

function lancarFoguete(container, isMobile) {
    if (!container) return;

    const rocket = document.createElement('div');
    rocket.className = 'rocket-particle';

    const startX = Math.random() * window.innerWidth;
    rocket.style.left = startX + 'px';
    rocket.style.bottom = '0px';

    const targetHeight = (window.innerHeight * 0.5) + (Math.random() * (window.innerHeight * 0.35));
    rocket.style.setProperty('--rise-height', `-${targetHeight}px`);

    container.appendChild(rocket);

    setTimeout(() => {
        const explosionY = window.innerHeight - targetHeight;
        criarExplosao(container, startX, explosionY, isMobile);
        rocket.remove();
    }, 650);
}

function criarExplosao(container, x, y, isMobile) {
    const cores = ['#FACC15', '#EAB308', '#EF4444', '#FFFFFF', '#3B82F6', '#10B981', '#D946EF'];
    const particulas = isMobile ? 22 : 40;

    for (let i = 0; i < particulas; i++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';

        p.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        p.style.left = x + 'px';
        p.style.top = y + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = (isMobile ? 55 : 80) + Math.random() * (isMobile ? 130 : 200);

        p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

        container.appendChild(p);

        setTimeout(() => p.remove(), 950);
    }
}
