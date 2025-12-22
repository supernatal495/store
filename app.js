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
    const classesAtivo = 'tab-btn active-tab px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-lg font-bold transition-all duration-300 flex items-center gap-2 rounded-full';
    const classesInativo = 'tab-btn px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-lg font-bold text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 rounded-full';

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
 * Le os dados (listaProdutos ou listaPetardos) e gera o HTML.
 */
function carregarGaleria() {
    const container = document.getElementById('galleryContainer');
    const loading = document.getElementById('loadingState');

    // Esconde a animação de loading
    loading.style.display = 'none';

    // Seleciona a lista de dados e a pasta de imagens correta
    const produtos = tipoAtual === 'baterias' ? listaProdutos : listaPetardos;
    const pastaImagem = tipoAtual === 'baterias' ? 'baterias' : 'petardo';

    // Validação de segurança se a lista estiver vazia
    if (typeof produtos === 'undefined' || produtos.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 mt-10">Sem produtos.</div>';
        return;
    }

    let html = "";

    // Loop através de cada produto para criar o cartão
    produtos.forEach(prod => {
        let badgePremium = "";
        let badgePoucasUnidades = "";
        let classPremium = "";
        let classEstoque = "";
        let badgeEsgotado = "";

        // Classes padrão para Título, Preço e Símbolo Euro
        let titleColorClass = 'text-white group-hover:text-gold-400';
        let priceColorClass = 'text-slate-200';
        let euroColorClass = 'text-gold-500';

        // Lógica: Determinar se o título começa por número (ex: "36 Tiros")
        let primeiraPalavra = prod.desc.split(' ')[0];
        let textoTag = primeiraPalavra;
        if (!isNaN(primeiraPalavra)) {
            textoTag += " Tiros";
        }

        // --- SISTEMA DE STOCK ---
        // Verifica se existe a propriedade stock (default true)
        const temStock = typeof prod.stock !== 'undefined' ? prod.stock : true;

        if (!temStock) {
            // Se não tiver stock:
            // 1. Aplica classe CSS que mete a cinzento e bloqueia cliques
            classEstoque = "out-of-stock pointer-events-none";
            // 2. Cria div vazia para ajudar no posicionamento do carimbo (opcional)
            badgeEsgotado = `<div class="absolute inset-0 z-10"></div>`;
        }

        // --- SISTEMA POUCAS UNIDADES ---
        const isPoucasUnidades = typeof prod.poucasUnidades !== 'undefined' ? prod.poucasUnidades : false;
        if (isPoucasUnidades && temStock) {
            badgePoucasUnidades = `
                <div class="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg uppercase tracking-wider z-20">
                    <i class="fas fa-fire-alt mr-1"></i> Poucas Unidades
                </div>`;
        }

        // --- SISTEMA PREMIUM ---
        if (prod.premium === true) {
            // Se for Premium: adiciona borda dourada e badge "Coroa"
            badgePremium = `
                <div class="absolute top-0 left-0 bg-gradient-to-r from-gold-500 to-yellow-700 text-black text-[10px] font-black px-3 py-1 rounded-br-xl shadow-lg uppercase tracking-wider z-20">
                    <i class="fas fa-crown mr-1"></i> Premium
                </div>`;
            classPremium = "premium-border";

            // Muda as cores do texto para Dourado
            titleColorClass = 'text-gold-400';
            priceColorClass = 'text-gold-400';
            euroColorClass = 'text-gold-400';
        }

        // Constrói o HTML do Cartão
        html += `
            <div class="product-card rounded-2xl overflow-hidden group product-item ${classPremium} ${classEstoque} relative">
                <div class="image-wrapper relative">
                    ${badgePremium}
                    ${badgePoucasUnidades}
                    ${badgeEsgotado}
                    
                    <!-- Imagem com Lazy Loading e Fallback de erro -->
                    <img src="${pastaImagem}/${prod.imagem}" 
                            loading="lazy" 
                            onerror="this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire'" 
                            alt="${prod.titulo}" class="product-image">
                </div>
                <div class="p-5 text-center">
                    <h3 class="text-2xl font-bold ${titleColorClass} mb-2 transition-colors">${prod.titulo}</h3>
                    <p class="text-xl font-semibold text-gold-400 mb-2">${prod.desc}</p>
                    <span class="text-3xl font-black ${priceColorClass}">${prod.preco}<span class="text-xl align-top ${euroColorClass}">€</span></span>
                </div>
            </div>
        `;
    });

    // Injeta o HTML no DOM
    container.innerHTML = html;
}

// Inicia a galeria quando a janela carrega
// Inicia a galeria quando a janela carrega
window.onload = function () {
    carregarGaleria();
    iniciarIntro();
};

/**
 * SEQUENCIA DE INTRODUÇÃO BOMBASTICA
 * 1. Rockets sobem (3 segundos)
 * 2. Mensagem aparece (1 segundo)
 * 3. Site revela-se
 */
function iniciarIntro() {
    const overlay = document.getElementById('intro-overlay');
    const container = document.getElementById('fireworks-container');
    const message = document.getElementById('intro-message');

    // 1. FASE DE FOGO ( Início )
    const intervaloLoop = setInterval(() => {
        // CAOS TOTAL: 5 Foguetes de cada vez
        lancarFoguete(container);
        lancarFoguete(container);
        lancarFoguete(container);
        lancarFoguete(container);
        lancarFoguete(container);
    }, 150);

    // 2. FASE DE MENSAGEM (Aparece logo aos 0.5s para leitura conjunta com o fogo)
    setTimeout(() => {
        // Revela a mensagem enquanto o fogo continua
        message.classList.remove('opacity-0', 'scale-0');
        message.classList.add('opacity-100', 'scale-100');
    }, 500);

    // 3. FIM DA FESTA (Aos 4.5s -> 4s de leitura/fogo)
    setTimeout(() => {
        clearInterval(intervaloLoop); // Pára os foguetes

        // Desaparece tudo
        overlay.classList.add('fade-out');

        setTimeout(() => {
            overlay.remove();
        }, 1000);

    }, 4500);
}

// Logica de lançar um foguete (baixo para cima)
function lancarFoguete(container) {
    if (!container) return;

    const rocket = document.createElement('div');
    rocket.className = 'rocket-particle';

    // Posição inicial (Fundo do ecrã, posição X aleatória)
    const startX = Math.random() * window.innerWidth;
    rocket.style.left = startX + 'px';
    rocket.style.bottom = '0px';

    // Altura aleatória para explodir
    const targetHeight = (window.innerHeight * 0.5) + (Math.random() * (window.innerHeight * 0.4));
    // Converter para pixeis negativos para o transform translateY
    rocket.style.setProperty('--rise-height', `-${targetHeight}px`);

    container.appendChild(rocket);

    // Quando a animação de subida acabar, EXPLODIR!
    // Nota: O user tinha posto 200ms, mas isso corta a subida. 
    // Coloquei 700ms para dar tempo de "subir" visualmente no telemóvel.
    setTimeout(() => {
        // Coordenadas da explosão
        // O rocket subiu 'targetHeight' pixeis a partir de baixo.
        // Y = Altura Janela - TargetHeight
        const explosionY = window.innerHeight - targetHeight;

        criarExplosao(container, startX, explosionY);
        rocket.remove();
    }, 700);
}


function criarExplosao(container, x, y) {
    const cores = ['#FACC15', '#EAB308', '#EF4444', '#FFFFFF', '#3B82F6', '#10B981', '#D946EF']; // Mais cores festivas
    const particulas = 40; // Mantive 40 para não crashar telemóveis (com 5 foguetes = 200 partículas/ciclo)

    for (let i = 0; i < particulas; i++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';

        // Cor aleatória
        p.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];

        // Posição explosão
        p.style.left = x + 'px';
        p.style.top = y + 'px';

        // Direção aleatória
        const angle = Math.random() * Math.PI * 2;
        // VELOCIDADE MASSIVA: Explosões gigantes
        const velocity = 80 + Math.random() * 200;

        p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

        container.appendChild(p);

        // Remove a partícula após a animação
        setTimeout(() => p.remove(), 1000);
    }
}
