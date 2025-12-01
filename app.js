let tipoAtual = 'baterias';

function mostrarBaterias() {
    tipoAtual = 'baterias';
    document.getElementById('btnBaterias').className = 'px-4 py-2 sm:px-6 sm:py-3 text-base font-semibold rounded-full bg-gold-500 text-dark-900 hover:bg-gold-400 transition-colors';
    document.getElementById('btnBombinhas').className = 'px-4 py-2 sm:px-6 sm:py-3 text-base font-semibold rounded-full bg-dark-800 text-slate-300 border border-slate-700 hover:bg-dark-700 transition-colors';
    carregarGaleria();
}

function mostrarBombinhas() {
    tipoAtual = 'bombinhas';
    document.getElementById('btnBombinhas').className = 'px-4 py-2 sm:px-6 sm:py-3 text-base font-semibold rounded-full bg-gold-500 text-dark-900 hover:bg-gold-400 transition-colors';
    document.getElementById('btnBaterias').className = 'px-4 py-2 sm:px-6 sm:py-3 text-base font-semibold rounded-full bg-dark-800 text-slate-300 border border-slate-700 hover:bg-dark-700 transition-colors';
    carregarGaleria();
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
                
                // Classes de Destaque Premium
                let titleColorClass = 'text-white group-hover:text-gold-400';
                let priceColorClass = 'text-slate-200';
                let euroColorClass = 'text-gold-500';

                let primeiraPalavra = prod.desc.split(' ')[0]; 
                let textoTag = primeiraPalavra;
                
                if (!isNaN(primeiraPalavra)) {
                    textoTag += " Tiros";
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

                // ADICIONEI loading="lazy" na imagem para performance
                html += `
                    <div class="product-card rounded-2xl overflow-hidden group product-item ${classPremium} relative">
                        <div class="image-wrapper relative">
                            ${badgePremium}
                            
                            <img src="${pastaImagem}/${prod.imagem}" 
                                 loading="lazy" 
                                 onerror="this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire'" 
                                 alt="${prod.titulo}" class="product-image">
                        </div>
                        <div class="p-5 text-center">
                            <h3 class="text-lg font-semibold ${titleColorClass} mb-2 transition-colors">${prod.titulo}</h3>
                            <p class="text-xl font-bold text-gold-400 mb-2">${prod.desc}</p>
                            <span class="text-2xl font-black ${priceColorClass}">${prod.preco}<span class="text-lg align-top ${euroColorClass}">€</span></span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        window.onload = carregarGaleria;
    