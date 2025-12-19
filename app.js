let tipoAtual = 'baterias';

function mudarAba(novoTipo) {
    tipoAtual = novoTipo;
    carregarGaleria();

    // Atualizar UI das Abas
    const btnBaterias = document.getElementById('tabBaterias');
    const btnBombinhas = document.getElementById('tabBombinhas');

    if (tipoAtual === 'baterias') {
        btnBaterias.className = 'tab-btn active-tab px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-lg font-bold transition-all duration-300 flex items-center gap-2 rounded-full';
        btnBombinhas.className = 'tab-btn px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-lg font-bold text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 rounded-full';
    } else {
        btnBaterias.className = 'tab-btn px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-lg font-bold text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 rounded-full';
        btnBombinhas.className = 'tab-btn active-tab px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-lg font-bold transition-all duration-300 flex items-center gap-2 rounded-full';
    }
}

function carregarGaleria() {
    const container = document.getElementById('galleryContainer');
    const loading = document.getElementById('loadingState');

    // Remove o loading
    loading.style.display = 'none';

    const produtos = tipoAtual === 'baterias' ? listaProdutos : listaPetardos;
    const pastaImagem = tipoAtual === 'baterias' ? 'baterias' : 'petardo';

    if (typeof produtos === 'undefined' || produtos.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 mt-10">Sem produtos.</div>';
        return;
    }

    let html = "";
    produtos.forEach(prod => {
        let badgePremium = "";
        let classPremium = "";
        let classEstoque = "";
        let badgeEsgotado = "";

        // Classes de Destaque Premium
        let titleColorClass = 'text-white group-hover:text-gold-400';
        let priceColorClass = 'text-slate-200';
        let euroColorClass = 'text-gold-500';

        let primeiraPalavra = prod.desc.split(' ')[0];
        let textoTag = primeiraPalavra;

        if (!isNaN(primeiraPalavra)) {
            textoTag += " Tiros";
        }

        // Lógica de Stock
        const temStock = typeof prod.stock !== 'undefined' ? prod.stock : true; // Default true para compatibilidade

        if (!temStock) {
            classEstoque = "out-of-stock pointer-events-none"; // pointer-events-none impede cliques
            badgeEsgotado = `<div class="absolute inset-0 z-10"></div>`; // Div extra se necessário
        }

        if (prod.premium === true) {
            badgePremium = `
                <div class="absolute top-0 left-0 bg-gradient-to-r from-gold-500 to-yellow-700 text-black text-[10px] font-black px-3 py-1 rounded-br-xl shadow-lg uppercase tracking-wider z-20">
                    <i class="fas fa-crown mr-1"></i> Premium
                </div>`;
            classPremium = "premium-border";

            // Aumentar destaque para o Premium
            titleColorClass = 'text-gold-400';
            priceColorClass = 'text-gold-400';
            euroColorClass = 'text-gold-400';
        }

        html += `
            <div class="product-card rounded-2xl overflow-hidden group product-item ${classPremium} ${classEstoque} relative">
                <div class="image-wrapper relative">
                    ${badgePremium}
                    ${badgeEsgotado}
                    
                    <img src="${pastaImagem}/${prod.imagem}" 
                            loading="lazy" 
                            onerror="this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire'" 
                            alt="${prod.titulo}" class="product-image">
                </div>
                <div class="p-5 text-center">
                    <h3 class="text-xl font-bold ${titleColorClass} mb-2 transition-colors">${prod.titulo}</h3>
                    <p class="text-lg font-semibold text-gold-400 mb-2">${prod.desc}</p>
                    <span class="text-2xl font-black ${priceColorClass}">${prod.preco}<span class="text-lg align-top ${euroColorClass}">€</span></span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.onload = carregarGaleria;
