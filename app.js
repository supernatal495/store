
        function carregarGaleria() {
            const container = document.getElementById('galleryContainer');
            const loading = document.getElementById('loadingState');
            
            // Remove o loading
            loading.style.display = 'none';

            if (typeof listaProdutos === 'undefined' || listaProdutos.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center text-slate-500 mt-10">Sem produtos. Execute o script Python.</div>';
                return;
            }

            let html = "";
            listaProdutos.forEach(prod => {
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
                    <div class="product-card rounded-2xl overflow-hidden group product-item ${classPremium} cursor-pointer relative transition-transform active:scale-[0.98]" onclick="window.open('https://ig.me/m/galo.fire', '_blank')">
                        <div class="image-wrapper relative">
                            ${badgePremium}
                            
                            <img src="${prod.categoria}/${prod.imagem}" 
                                 loading="lazy" 
                                 onerror="this.src='https://placehold.co/600x400/1e293b/FFF?text=GaloFire'" 
                                 alt="${prod.titulo}" class="product-image">
                            
                            <div class="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-lg z-10">
                                ${textoTag}
                            </div>
                        </div>
                        <div class="p-5 relative flex flex-col"> <h3 class="text-2xl font-bold ${titleColorClass} mb-1 transition-colors truncate">${prod.titulo}</h3>
                            
                            <div class="flex items-end justify-between mb-4">
                                <p class="text-sm text-slate-400 font-medium truncate">${prod.desc}</p>
                                <span class="text-2xl font-black ${priceColorClass} shrink-0">${prod.preco}<span class="text-lg align-top ${euroColorClass}">€</span></span>
                            </div>

                            <div class="border-t border-white/5 pt-4 mt-auto">
                                <div class="bg-white/5 group-hover:bg-gold-500/10 p-3 rounded-lg text-center transition-all">
                                    <span class="font-semibold text-sm text-slate-300 group-hover:text-gold-400">
                                        Encomendar via Instagram <i class="fab fa-instagram ml-1"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        window.onload = carregarGaleria;
    