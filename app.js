// Estado global para controlar a aba ativa (baterias vs bombinhas)
let tipoAtual = 'baterias';

/**
 * Funcao para mudar a aba ativa
 * @param {string} novoTipo - 'baterias' ou 'bombinhas'
 */
function mudarAba(novoTipo) {
    tipoAtual = novoTipo;
    carregarGaleria(); // Recarrega os dados

    // Obter referências aos botões
    const btnBaterias = document.getElementById('tabBaterias');
    const btnBombinhas = document.getElementById('tabBombinhas');

    // Classes CSS (Tailwind) para estados Ativo e Inativo
    // Nota: 'active-tab' contem estilos extra no style.css
    const classesAtivo = 'tab-btn active-tab px-5 py-2 text-xs sm:px-8 sm:py-3 sm:text-lg font-bold transition-all duration-300 flex items-center gap-2 rounded-full';
    const classesInativo = 'tab-btn px-5 py-2 text-xs sm:px-8 sm:py-3 sm:text-lg font-bold text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 rounded-full';

    // Aplica as classes consoante a seleção
    if (tipoAtual === 'baterias') {
        btnBaterias.className = classesAtivo;
        btnBombinhas.className = classesInativo;
    } else {
        btnBaterias.className = classesInativo;
        btnBombinhas.className = classesAtivo;
    }
}

/**
 * Função Principal de Renderização
 * Le os dados (listaProdutos ou listaPetardos), ordena stock disponível primeiro e gera o HTML.
 */
function carregarGaleria() {
    const container = document.getElementById('galleryContainer');
    const loading = document.getElementById('loadingState');

    // Esconde a animação de loading
    if (loading) loading.style.display = 'none';

    // Seleciona a lista de dados e a pasta de imagens correta
    const produtosBase = tipoAtual === 'baterias' ? listaProdutos : listaPetardos;
    const pastaImagem = tipoAtual === 'baterias' ? 'baterias' : 'petardo';

    // Validação de segurança se a lista estiver vazia
    if (typeof produtosBase === 'undefined' || produtosBase.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 mt-10">Sem produtos.</div>';
        return;
    }

    // Ordena automaticamente: produtos em stock primeiro, esgotados no fim
    const produtos = [...produtosBase].sort((a, b) => {
        const stockA = a.stock !== false ? 1 : 0;
        const stockB = b.stock !== false ? 1 : 0;
        return stockB - stockA;
    });

    let html = "";

    // Loop através de cada produto para criar o cartão
    produtos.forEach((prod, index) => {
        let badgePremium = "";
        let badgePoucasUnidades = "";
        let classPremium = "";
        let classEstoque = "";
        let badgeEsgotado = "";

        // Classes padrão para Título, Preço e Símbolo Euro
        let titleColorClass = 'text-white group-hover:text-gold-400';
        let priceColorClass = 'text-slate-200';
        let euroColorClass = 'text-gold-500';

        // --- SISTEMA DE STOCK ---
        // Verifica se existe a propriedade stock (default true)
        const temStock = typeof prod.stock !== 'undefined' ? prod.stock : true;

        if (!temStock) {
            // Se não tiver stock:
            // 1. Aplica classe CSS que mete a cinzento e bloqueia cliques
            classEstoque = "out-of-stock pointer-events-none";
            // 2. Cria div vazia para ajudar no posicionamento do carimbo
            badgeEsgotado = `<div class="absolute inset-0 z-10"></div>`;
        }

        // --- SISTEMA POUCAS UNIDADES ---
        const isPoucasUnidades = typeof prod.poucasUnidades !== 'undefined' ? prod.poucasUnidades : false;
        if (isPoucasUnidades && temStock) {
            badgePoucasUnidades = `
                <div class="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-bl-xl shadow-lg uppercase tracking-wider z-20 animate-pulse-alert">
                    <i class="fas fa-fire-alt mr-1"></i> Poucas Unid.
                </div>`;
        }

        // --- SISTEMA PREMIUM ---
        if (prod.premium === true) {
            // Se for Premium: adiciona borda dourada e badge "Coroa"
            badgePremium = `
                <div class="absolute top-0 left-0 bg-gradient-to-r from-gold-500 to-yellow-700 text-black text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-br-xl shadow-lg uppercase tracking-wider z-20">
                    <i class="fas fa-crown mr-1"></i> Premium
                </div>`;
            classPremium = "premium-border";

            // Muda as cores do texto para Dourado
            titleColorClass = 'text-gold-400';
            priceColorClass = 'text-gold-400';
            euroColorClass = 'text-gold-400';
        }

        // Os primeiros 4 produtos carregam imediatamente (acima da dobra no telemóvel), restantes com lazy loading
        const loadingAttr = index < 4 ? 'eager' : 'lazy';
        const fallbackPng = prod.imagem.replace('.webp', '.png');

        // Constrói o HTML do Cartão (Otimizado para 2 colunas em mobile)
        html += `
            <div class="product-card rounded-xl sm:rounded-2xl overflow-hidden group product-item ${classPremium} ${classEstoque} relative flex flex-col justify-between">
                <div class="image-wrapper relative">
                    ${badgePremium}
                    ${badgePoucasUnidades}
                    ${badgeEsgotado}
                    
                    <!-- Imagem WebP com Fallback automático para PNG e Placeholder -->
                    <img src="${pastaImagem}/${prod.imagem}" 
                            loading="${loadingAttr}" 
                            decoding="async"
                            onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${pastaImagem}/${fallbackPng}';}else{this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire';}" 
                            alt="${prod.titulo}" class="product-image">
                </div>
                <div class="p-3 sm:p-5 text-center flex flex-col flex-grow justify-between">
                    <div>
                        <h3 class="text-base sm:text-2xl font-bold ${titleColorClass} mb-1 sm:mb-2 leading-tight transition-colors">${prod.titulo}</h3>
                        <p class="text-xs sm:text-xl font-semibold text-gold-400 mb-2 min-h-[1rem]">${prod.desc}</p>
                    </div>
                    <span class="text-2xl sm:text-3xl font-black ${priceColorClass}">${prod.preco}<span class="text-sm sm:text-xl align-top ${euroColorClass}">€</span></span>
                </div>
            </div>
        `;
    });

    // Injeta o HTML no DOM
    container.innerHTML = html;
}

// Inicia a galeria assim que o DOM está pronto (muito mais rápido em redes móveis do que window.onload)
document.addEventListener('DOMContentLoaded', () => {
    carregarGaleria();
    iniciarIntro();
});

/**
 * SEQUENCIA DE INTRODUÇÃO BOMBASTICA (Otimizada para Mobile)
 * - Permite fechar ao tocar no ecrã
 * - Guarda em sessionStorage para não repetir se o utilizador atualizar a página
 */
function iniciarIntro() {
    const overlay = document.getElementById('intro-overlay');
    const container = document.getElementById('fireworks-container');
    const message = document.getElementById('intro-message');

    if (!overlay) return;

    // Se já viu a intro nesta sessão, remove imediatamente sem bloquear
    if (sessionStorage.getItem('galofire_intro_seen') === '1') {
        overlay.remove();
        return;
    }
    sessionStorage.setItem('galofire_intro_seen', '1');

    const isMobile = window.innerWidth < 768;
    const foguetesPorCiclo = isMobile ? 3 : 5;
    let encerrado = false;

    // 1. FASE DE FOGO (Início)
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

    // Permite saltar a intro ao tocar em qualquer parte do ecrã
    overlay.addEventListener('click', fecharIntro, { once: true });
    overlay.addEventListener('touchstart', fecharIntro, { once: true, passive: true });

    // 2. FASE DE MENSAGEM (Aparece logo aos 0.3s)
    setTimeout(() => {
        if (message) {
            message.classList.remove('opacity-0', 'scale-90');
            message.classList.add('opacity-100', 'scale-100');
        }
    }, 300);

    // 3. FIM DA FESTA (Aos 3.5s)
    setTimeout(fecharIntro, 3500);
}

// Logica de lançar um foguete (baixo para cima)
function lancarFoguete(container, isMobile) {
    if (!container) return;

    const rocket = document.createElement('div');
    rocket.className = 'rocket-particle';

    // Posição inicial (Fundo do ecrã, posição X aleatória)
    const startX = Math.random() * window.innerWidth;
    rocket.style.left = startX + 'px';
    rocket.style.bottom = '0px';

    // Altura aleatória para explodir
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
