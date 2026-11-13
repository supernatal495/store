// Estado global para controlar a aba ativa (baterias vs bombinhas)
let tipoAtual = 'baterias';
let produtosRenderizados = [];

/**
 * Muda a aba ativa entre 'baterias' e 'bombinhas'
 */
function mudarAba(novoTipo) {
    tipoAtual = novoTipo;
    carregarGaleria();

    const btnBaterias = document.getElementById('tabBaterias');
    const btnBombinhas = document.getElementById('tabBombinhas');

    const classesAtivo = 'tab-btn active-tab px-6 py-2.5 text-xs sm:px-9 sm:py-3 sm:text-base font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-full';
    const classesInativo = 'tab-btn px-6 py-2.5 text-xs sm:px-9 sm:py-3 sm:text-base font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 rounded-full';

    if (tipoAtual === 'baterias') {
        btnBaterias.className = classesAtivo;
        btnBombinhas.className = classesInativo;
    } else {
        btnBaterias.className = classesInativo;
        btnBombinhas.className = classesAtivo;
    }
}

/**
 * Renderiza a grelha de produtos:
 * - Produtos em stock aparecem primeiro
 * - Produtos esgotados ficam sempre no fim da lista
 */
function carregarGaleria() {
    const container = document.getElementById('galleryContainer');
    const loading = document.getElementById('loadingState');
    if (loading) loading.style.display = 'none';

    const produtosBase = tipoAtual === 'baterias' ? listaProdutos : listaPetardos;
    const pastaImagem = tipoAtual === 'baterias' ? 'baterias' : 'petardo';

    if (typeof produtosBase === 'undefined' || produtosBase.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 mt-10">Sem produtos.</div>';
        return;
    }

    // Ordena garantindo que todos os esgotados vão para o fim da lista
    const produtos = [...produtosBase].sort((a, b) => {
        const stockA = a.stock !== false ? 1 : 0;
        const stockB = b.stock !== false ? 1 : 0;
        return stockB - stockA;
    });

    produtosRenderizados = produtos.map(p => ({ ...p, pastaImagem }));

    let html = "";

    produtos.forEach((prod, index) => {
        const temStock = typeof prod.stock !== 'undefined' ? prod.stock : true;
        const classEstoque = !temStock ? "out-of-stock pointer-events-none" : "";
        const isPremium = prod.premium === true;
        const isNovo = prod.novo === true;

        let badgeTopo = "";
        if (isNovo && temStock) {
            badgeTopo = `
                <div class="absolute top-0 left-0 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-br-xl shadow-lg uppercase tracking-wider z-20">
                    Novo
                </div>`;
        } else if (isPremium) {
            badgeTopo = `
                <div class="absolute top-0 left-0 bg-gradient-to-r from-gold-500 to-yellow-600 text-black text-[10px] sm:text-xs font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-br-xl shadow-lg uppercase tracking-wider z-20">
                    <i class="fas fa-crown mr-1"></i> Premium
                </div>`;
        }

        const classPremium = isPremium ? "premium-border" : "";
        const titleColorClass = isPremium ? 'text-gold-400' : 'text-white group-hover:text-gold-400';
        const priceColorClass = isPremium ? 'text-gold-400' : 'text-slate-100';
        const euroColorClass = isPremium ? 'text-gold-400' : 'text-gold-500';

        const loadingAttr = index < 4 ? 'eager' : 'lazy';
        const fallbackPng = prod.imagem.replace('.webp', '.png');

        html += `
            <div onclick="${temStock ? `abrirModal(${index})` : ''}" class="product-card rounded-xl sm:rounded-2xl overflow-hidden group product-item ${classPremium} ${classEstoque} relative flex flex-col justify-between ${temStock ? 'cursor-pointer' : ''}">
                <div class="image-wrapper relative">
                    ${badgeTopo}
                    <img src="${pastaImagem}/${prod.imagem}" 
                         loading="${loadingAttr}" 
                         decoding="async"
                         onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${pastaImagem}/${fallbackPng}';}else{this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire';}" 
                         alt="${prod.titulo}" class="product-image">
                </div>
                <div class="p-3 sm:p-5 text-center flex flex-col flex-grow justify-between">
                    <div>
                        <h3 class="text-base sm:text-2xl font-bold ${titleColorClass} mb-1 leading-tight transition-colors">${prod.titulo}</h3>
                        <p class="text-xs sm:text-lg font-semibold text-gold-400/90 mb-2 min-h-[1rem]">${prod.desc}</p>
                    </div>
                    <span class="text-2xl sm:text-3xl font-black ${priceColorClass}">${prod.preco}<span class="text-sm sm:text-xl align-top ${euroColorClass}">€</span></span>
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
    const desc = document.getElementById('modalDesc');
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
    desc.textContent = prod.desc || '';
    price.textContent = prod.preco;

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
    }, 200);
}

/**
 * Brasas subtis em Canvas
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
    const total = isMobile ? 18 : 35;
    const cores = ['#FACC15', '#F97316', '#EF4444'];

    const brasas = Array.from({ length: total }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2,
        vy: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.35,
        alpha: 0.2 + Math.random() * 0.5,
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

document.addEventListener('DOMContentLoaded', () => {
    carregarGaleria();
    iniciarBrasasFundo();
    iniciarIntro();
});

function iniciarIntro() {
    const overlay = document.getElementById('intro-overlay');
    const container = document.getElementById('fireworks-container');
    const message = document.getElementById('intro-message');

    if (!overlay) return;

    const isMobile = window.innerWidth < 768;
    const foguetesPorCiclo = isMobile ? 3 : 5;
    let encerrado = false;

    const intervaloLoop = setInterval(() => {
        for (let i = 0; i < foguetesPorCiclo; i++) {
            lancarFoguete(container, isMobile);
        }
    }, 170);

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
    const particulas = isMobile ? 24 : 40;

    for (let i = 0; i < particulas; i++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';

        p.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        p.style.left = x + 'px';
        p.style.top = y + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = (isMobile ? 60 : 80) + Math.random() * (isMobile ? 135 : 200);

        p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

        container.appendChild(p);

        setTimeout(() => p.remove(), 950);
    }
}
