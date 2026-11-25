// ============================================================================
// CONFIGURAÇÃO SUPABASE (Podes colar aqui diretamente para todos os telemóveis
// ou configurar no Painel de Gestão -> Base Dados)
// ============================================================================
const DEFAULT_SUPABASE_URL = "https://xsvptkqrekjgvwjimjfh.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_I9fwnz49FDgsF1bmmVODSA_jD-mrL4b";

// Estado global do catálogo
let tipoAtual = 'baterias';
let produtosRenderizados = [];

// Estado de Autenticação, Carrinho e Admin
let utilizadorAtual = null; // { id, nome, username, desconto, role }
let carrinho = {};          // { "baterias_11": { chave, categoria, id, titulo, precoPublico, imagem, pastaImagem, qtd } }
let abaAdminAtual = 'encomendas';
let filtroEncomendasAdmin = 'todas';
let cacheUtilizadoresAdmin = [];
let cacheEncomendasAdmin = [];

// ============================================================================
// CAMADA DE BASE DE DADOS (SUPABASE REST API + FALLBACK LOCALSTORAGE)
// ============================================================================
function getSupabaseConfig() {
    const url = (localStorage.getItem('gf_supabase_url') || DEFAULT_SUPABASE_URL || '').trim().replace(/\/$/, '');
    const key = (localStorage.getItem('gf_supabase_key') || DEFAULT_SUPABASE_KEY || '').trim();
    return { url, key, ativo: Boolean(url && key) };
}

async function sbFetch(path, options = {}) {
    const cfg = getSupabaseConfig();
    if (!cfg.ativo) throw new Error('SUPABASE_NOT_CONFIGURED');

    const headers = {
        'apikey': cfg.key,
        'Authorization': `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation',
        ...(options.headers || {})
    };

    const resp = await fetch(`${cfg.url}/rest/v1/${path}`, {
        ...options,
        headers
    });

    if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || `Erro HTTP ${resp.status}`);
    }

    const text = await resp.text();
    return text ? JSON.parse(text) : null;
}

// Base de dados local de fallback (para funcionar de imediato mesmo antes de ligar o Supabase)
function getLocalDB() {
    let users = JSON.parse(localStorage.getItem('gf_users_db') || 'null');
    if (!users || !Array.isArray(users) || users.length === 0) {
        users = [
            { id: 1, nome: 'Administrador GaloFire', username: 'admin', password: 'galofire2026', desconto: 0, role: 'admin', ativo: true },
            { id: 2, nome: 'Revendedor Exemplo (25%)', username: 'vendedor1', password: '1234', desconto: 25, role: 'revendedor', ativo: true }
        ];
        localStorage.setItem('gf_users_db', JSON.stringify(users));
    }
    const orders = JSON.parse(localStorage.getItem('gf_orders_db') || '[]');
    return { users, orders };
}

function saveLocalUsers(users) {
    localStorage.setItem('gf_users_db', JSON.stringify(users));
}

function saveLocalOrders(orders) {
    localStorage.setItem('gf_orders_db', JSON.stringify(orders));
}

// Operações de Dados Unificadas (Supabase ou Local)
async function dbAutenticar(username, password) {
    const uClean = username.trim().toLowerCase();
    const pClean = password.trim();
    const cfg = getSupabaseConfig();

    if (cfg.ativo) {
        const rows = await sbFetch(`utilizadores?username=ilike.${encodeURIComponent(uClean)}&ativo=eq.true&select=*`);
        const found = (rows || []).find(u => u.username.toLowerCase() === uClean && u.password === pClean);
        return found || null;
    } else {
        const { users } = getLocalDB();
        return users.find(u => u.username.toLowerCase() === uClean && u.password === pClean && u.ativo !== false) || null;
    }
}

async function dbListarUtilizadores() {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        return await sbFetch('utilizadores?select=*&order=id.asc') || [];
    } else {
        return getLocalDB().users;
    }
}

async function dbGuardarUtilizador(dados, editId = null) {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        if (editId) {
            const res = await sbFetch(`utilizadores?id=eq.${editId}`, {
                method: 'PATCH',
                body: JSON.stringify(dados)
            });
            return res?.[0];
        } else {
            const res = await sbFetch('utilizadores', {
                method: 'POST',
                body: JSON.stringify(dados)
            });
            return res?.[0];
        }
    } else {
        const { users } = getLocalDB();
        if (editId) {
            const idx = users.findIndex(u => String(u.id) === String(editId));
            if (idx !== -1) users[idx] = { ...users[idx], ...dados };
        } else {
            if (users.some(u => u.username.toLowerCase() === dados.username.toLowerCase())) {
                throw new Error('Já existe um utilizador com esse login.');
            }
            const novoId = users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1;
            users.push({ id: novoId, ativo: true, criado_em: new Date().toISOString(), ...dados });
        }
        saveLocalUsers(users);
        return true;
    }
}

async function dbApagarUtilizador(id) {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        await sbFetch(`utilizadores?id=eq.${id}`, { method: 'DELETE' });
    } else {
        const { users } = getLocalDB();
        saveLocalUsers(users.filter(u => String(u.id) !== String(id)));
    }
}

async function dbCriarEncomenda(encomenda) {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        const res = await sbFetch('encomendas', {
            method: 'POST',
            body: JSON.stringify(encomenda)
        });
        return res?.[0];
    } else {
        const { orders } = getLocalDB();
        const novoId = orders.length > 0 ? Math.max(...orders.map(o => Number(o.id) || 0)) + 1 : 101;
        const nova = { id: novoId, criado_em: new Date().toISOString(), ...encomenda };
        orders.unshift(nova);
        saveLocalOrders(orders);
        return nova;
    }
}

async function dbListarEncomendas(apenasUsername = null) {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        let query = 'encomendas?select=*&order=criado_em.desc';
        if (apenasUsername) {
            query += `&revendedor_username=eq.${encodeURIComponent(apenasUsername)}`;
        }
        return await sbFetch(query) || [];
    } else {
        const { orders } = getLocalDB();
        if (apenasUsername) {
            return orders.filter(o => o.revendedor_username.toLowerCase() === apenasUsername.toLowerCase());
        }
        return orders;
    }
}

async function dbAtualizarEstadoEncomenda(id, novoEstado) {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        await sbFetch(`encomendas?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: novoEstado })
        });
    } else {
        const { orders } = getLocalDB();
        const idx = orders.findIndex(o => String(o.id) === String(id));
        if (idx !== -1) {
            orders[idx].estado = novoEstado;
            saveLocalOrders(orders);
        }
    }
}

async function dbApagarEncomenda(id) {
    const cfg = getSupabaseConfig();
    if (cfg.ativo) {
        await sbFetch(`encomendas?id=eq.${id}`, { method: 'DELETE' });
    } else {
        const { orders } = getLocalDB();
        saveLocalOrders(orders.filter(o => String(o.id) !== String(id)));
    }
}

// ============================================================================
// CÁLCULOS DE PREÇO E DESCONTO DE REVENDEDOR
// ============================================================================
function parsePreco(precoStr) {
    if (!precoStr) return 0;
    return parseFloat(String(precoStr).replace(',', '.')) || 0;
}

function formatarMoeda(valor) {
    const num = Number(valor) || 0;
    return num % 1 === 0 ? String(num) : num.toFixed(2).replace('.', ',');
}

function formatarMoedaDecimal(valor) {
    return (Number(valor) || 0).toFixed(2).replace('.', ',');
}

function calcularPrecoRevendedor(precoPublicoStr) {
    const base = parsePreco(precoPublicoStr);
    const desconto = Number(utilizadorAtual?.desconto) || 0;
    if (!utilizadorAtual || desconto <= 0) return base;
    return Math.max(0, base * (1 - desconto / 100));
}

function isModoRevendedorAtivo() {
    return Boolean(utilizadorAtual && (utilizadorAtual.role === 'revendedor' || Number(utilizadorAtual.desconto) > 0));
}

// ============================================================================
// CATÁLOGO & RENDERIZAÇÃO DE PRODUTOS
// ============================================================================
function mudarAba(novoTipo) {
    tipoAtual = novoTipo;

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

function carregarGaleria() {
    const container = document.getElementById('galleryContainer');
    const loading = document.getElementById('loadingState');
    if (loading) loading.style.display = 'none';

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

    // Ordenação: Esgotados SEMPRE no fim da lista
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

        const novoA = a.novo === true ? 1 : 0;
        const novoB = b.novo === true ? 1 : 0;
        if (novoB !== novoA) return novoB - novoA;

        const premA = a.premium === true ? 1 : 0;
        const premB = b.premium === true ? 1 : 0;
        return premB - premA;
    });

    produtosRenderizados = produtos.map(p => ({ ...p, pastaImagem, categoria: tipoAtual }));

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
    let separadorEsgotadosInserido = false;
    const revendaAtiva = isModoRevendedorAtivo();
    const descontoPct = Number(utilizadorAtual?.desconto) || 0;

    produtos.forEach((prod, index) => {
        const temStock = typeof prod.stock !== 'undefined' ? prod.stock : true;
        const isBrevemente = prod.brevemente === true;
        const classEstoque = !temStock ? "out-of-stock pointer-events-none" : (isBrevemente ? "coming-soon" : "");
        const isPremium = prod.premium === true && temStock;
        const isNovo = prod.novo === true && temStock;

        if (!temStock && !separadorEsgotadosInserido) {
            separadorEsgotadosInserido = true;
            html += `
                <div class="col-span-full flex items-center gap-3 mt-6 mb-1">
                    <div class="h-px bg-white/10 flex-grow"></div>
                    <span class="font-display font-bold text-xs uppercase tracking-[0.2em] text-slate-500 px-3 py-1 rounded-full border border-white/10 bg-dark-900/80">
                        Produtos Esgotados
                    </span>
                    <div class="h-px bg-white/10 flex-grow"></div>
                </div>
            `;
        }

        const badgeTopo = isNovo ? `
            <div class="absolute top-2 left-2 badge-novo-2026 text-[10px] sm:text-xs font-display font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider z-20 flex items-center gap-1">
                <i class="fas fa-fire text-[9px] text-yellow-200"></i> Novo 2026
            </div>` : (isPremium ? `
            <div class="absolute top-2 left-2 bg-gradient-to-r from-gold-400 via-gold-500 to-ember-500 text-black text-[10px] sm:text-xs font-display font-bold px-2.5 py-0.5 rounded-md shadow-lg uppercase tracking-wider z-20 flex items-center gap-1">
                <i class="fas fa-crown text-[9px]"></i> Top
            </div>` : "");

        const zoomHint = temStock ? `
            <div class="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 border border-white/15 text-slate-300 text-[10px] flex items-center justify-center z-20 opacity-80 group-hover:opacity-100">
                <i class="fas fa-expand"></i>
            </div>` : "";

        const cardClass = (isPremium || isNovo) ? "premium-card" : "";
        const titleColor = (isPremium || isNovo) ? "text-gold-300" : "text-white group-hover:text-gold-300";
        const priceColor = (isPremium || isNovo) ? "text-black" : "text-gold-400";
        const euroColor = (isPremium || isNovo) ? "text-black/80" : "text-ember-500";

        const loadingAttr = index < 4 ? 'eager' : 'lazy';
        const fallbackPng = prod.imagem.replace('.webp', '.png');
        const pillsHtml = gerarSpecPills(prod.desc);

        // Bloco de Preço (Normal vs Revendedor com Desconto + Botões Quantidade)
        const chaveItem = `${tipoAtual}_${prod.id}`;
        const qtdNoCarrinho = carrinho[chaveItem]?.qtd || 0;
        let blocoPrecoHtml = "";

        if (revendaAtiva && temStock && !isBrevemente) {
            const precoRevenda = calcularPrecoRevendedor(prod.preco);
            blocoPrecoHtml = `
                <div class="space-y-2" onclick="event.stopPropagation()">
                    <div class="price-box rounded-xl py-1.5 px-2.5 flex items-center justify-between">
                        <div class="flex flex-col text-left">
                            <span class="text-[9px] uppercase font-bold ${(isPremium || isNovo) ? 'text-black/70' : 'text-slate-400'}">Público: <span class="line-through">${prod.preco}€</span></span>
                            <span class="text-[10px] uppercase font-extrabold ${(isPremium || isNovo) ? 'text-black' : 'text-emerald-400'}">Revenda (-${descontoPct}%)</span>
                        </div>
                        <span class="font-display font-bold text-xl sm:text-2xl leading-none ${priceColor}">${formatarMoeda(precoRevenda)}<span class="text-xs sm:text-sm align-top ml-0.5 ${euroColor}">€</span></span>
                    </div>

                    <!-- Controlos de Quantidade para Encomenda -->
                    <div class="flex items-center justify-between bg-dark-950/90 border ${qtdNoCarrinho > 0 ? 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-white/15'} rounded-xl p-1">
                        <button type="button" onclick="alterarQtdCarrinho(${index}, -1)"
                            class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold flex items-center justify-center active:scale-90 transition-transform">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span id="qtyBadge_${chaveItem}" class="font-display font-bold text-sm sm:text-base ${qtdNoCarrinho > 0 ? 'text-emerald-400' : 'text-slate-400'}">
                            ${qtdNoCarrinho}
                        </span>
                        <button type="button" onclick="alterarQtdCarrinho(${index}, 1)"
                            class="w-8 h-8 rounded-lg bg-gradient-to-r from-gold-400 to-ember-500 text-black font-bold flex items-center justify-center active:scale-90 transition-transform">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            const labelEstado = !temStock ? 'Indisponível' : (isBrevemente ? 'Brevemente' : 'Preço');
            blocoPrecoHtml = `
                <div class="price-box rounded-xl py-1.5 px-3 flex items-center justify-between">
                    <span class="text-[10px] sm:text-xs uppercase tracking-wider font-bold ${(isPremium || isNovo) ? 'text-black/75' : 'text-slate-400'}">${labelEstado}</span>
                    <span class="font-display font-bold text-xl sm:text-2xl leading-none ${priceColor}">${prod.preco}<span class="text-xs sm:text-sm align-top ml-0.5 ${euroColor}">€</span></span>
                </div>
            `;
        }

        html += `
            <div onclick="${temStock ? `abrirModal(${index})` : ''}" class="product-card ${cardClass} ${classEstoque} rounded-2xl overflow-hidden group relative flex flex-col justify-between ${temStock ? 'cursor-pointer' : ''}">
                <div class="image-wrapper relative">
                    ${badgeTopo}
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

                    ${blocoPrecoHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================================
// GESTÃO DE SESSÃO (LOGIN / LOGOUT / UI NAVBAR)
// ============================================================================
function carregarSessaoGuardada() {
    try {
        const saved = sessionStorage.getItem('gf_logged_user');
        if (saved) {
            utilizadorAtual = JSON.parse(saved);
        }
    } catch (e) {
        utilizadorAtual = null;
    }
    atualizarUISessao();
}

function atualizarUISessao() {
    const navArea = document.getElementById('navAuthArea');
    const banner = document.getElementById('resellerActiveBanner');

    if (!utilizadorAtual) {
        if (banner) banner.classList.add('hidden');
        if (navArea) {
            navArea.innerHTML = `
                <button onclick="abrirModalLogin()"
                    class="flex items-center gap-1.5 bg-gradient-to-r from-dark-800 to-dark-900 hover:from-gold-500/20 hover:to-ember-600/20 border border-gold-400/40 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all">
                    <i class="fas fa-user-lock text-gold-400 text-xs"></i>
                    <span class="font-display text-[11px] sm:text-xs font-bold tracking-wider uppercase text-gold-300">Área Revenda</span>
                </button>
            `;
        }
        atualizarBarraCarrinho();
        return;
    }

    if (utilizadorAtual.role === 'admin') {
        if (banner) banner.classList.add('hidden');
        if (navArea) {
            navArea.innerHTML = `
                <button onclick="abrirPainelAdmin()"
                    class="flex items-center gap-1.5 bg-gradient-to-r from-gold-400 to-ember-500 text-black px-3 py-1.5 rounded-full font-display text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <i class="fas fa-cog"></i>
                    <span>Painel Gestão</span>
                </button>
                <button onclick="logout()" title="Sair" class="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-red-400 flex items-center justify-center">
                    <i class="fas fa-sign-out-alt text-xs"></i>
                </button>
            `;
        }
    } else {
        if (banner) {
            banner.classList.remove('hidden');
            document.getElementById('bannerResellerName').textContent = `Olá, ${utilizadorAtual.nome}`;
            document.getElementById('bannerResellerDiscount').textContent = `-${utilizadorAtual.desconto}% Revenda`;
        }
        if (navArea) {
            navArea.innerHTML = `
                <button onclick="abrirModalMinhasEncomendas()"
                    class="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-1 rounded-full">
                    <i class="fas fa-tag text-emerald-400 text-[10px]"></i>
                    <span class="font-display text-[11px] sm:text-xs font-bold uppercase text-emerald-300">-${utilizadorAtual.desconto}%</span>
                </button>
                <button onclick="logout()" title="Sair da conta"
                    class="flex items-center gap-1 bg-white/10 hover:bg-red-500/20 border border-white/15 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-300 hover:text-red-300">
                    <i class="fas fa-sign-out-alt"></i>
                    <span class="hidden sm:inline">Sair</span>
                </button>
            `;
        }
    }

    atualizarBarraCarrinho();
}

function abrirModalLogin() {
    const modal = document.getElementById('loginModal');
    const err = document.getElementById('loginError');
    if (err) err.classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('loginUsername')?.focus(), 100);
}

function fecharModalLogin() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

async function efetuarLogin(event) {
    event.preventDefault();
    const userInp = document.getElementById('loginUsername');
    const passInp = document.getElementById('loginPassword');
    const errBox = document.getElementById('loginError');
    const btn = document.getElementById('btnSubmitLogin');

    errBox.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'A verificar...';

    try {
        const user = await dbAutenticar(userInp.value, passInp.value);
        if (!user) {
            errBox.textContent = 'Utilizador ou password incorretos.';
            errBox.classList.remove('hidden');
        } else {
            utilizadorAtual = {
                id: user.id,
                nome: user.nome,
                username: user.username,
                desconto: Number(user.desconto) || 0,
                role: user.role || 'revendedor'
            };
            sessionStorage.setItem('gf_logged_user', JSON.stringify(utilizadorAtual));
            passInp.value = '';
            fecharModalLogin();
            atualizarUISessao();
            carregarGaleria();

            if (utilizadorAtual.role === 'admin') {
                abrirPainelAdmin();
            }
        }
    } catch (err) {
        errBox.textContent = 'Erro ao autenticar: ' + err.message;
        errBox.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar na Área Reservada';
    }
}

function logout() {
    utilizadorAtual = null;
    carrinho = {};
    sessionStorage.removeItem('gf_logged_user');
    fecharPainelAdmin();
    atualizarUISessao();
    carregarGaleria();
}

// ============================================================================
// CARRINHO E ENCOMENDAS DO REVENDEDOR
// ============================================================================
function alterarQtdCarrinho(indexProd, delta) {
    const prod = produtosRenderizados[indexProd];
    if (!prod || !isModoRevendedorAtivo()) return;

    const chave = `${prod.categoria}_${prod.id}`;
    const atual = carrinho[chave]?.qtd || 0;
    const novaQtd = Math.max(0, atual + delta);

    if (novaQtd === 0) {
        delete carrinho[chave];
    } else {
        carrinho[chave] = {
            chave,
            categoria: prod.categoria,
            id: prod.id,
            titulo: prod.titulo,
            desc: prod.desc || '',
            precoPublico: parsePreco(prod.preco),
            imagem: prod.imagem,
            pastaImagem: prod.pastaImagem,
            qtd: novaQtd
        };
    }

    carregarGaleria();
    atualizarBarraCarrinho();
}

function limparCarrinho() {
    carrinho = {};
    carregarGaleria();
    atualizarBarraCarrinho();
}

function calcularTotaisCarrinho() {
    const itens = Object.values(carrinho);
    const descontoPct = Number(utilizadorAtual?.desconto) || 0;
    let totalQtd = 0;
    let subtotalPublico = 0;

    itens.forEach(item => {
        totalQtd += item.qtd;
        subtotalPublico += item.precoPublico * item.qtd;
    });

    const totalRevenda = subtotalPublico * (1 - descontoPct / 100);
    const poupanca = subtotalPublico - totalRevenda;

    return { itens, totalQtd, subtotalPublico, totalRevenda, poupanca, descontoPct };
}

function atualizarBarraCarrinho() {
    const bar = document.getElementById('resellerCartBar');
    if (!bar) return;

    const { totalQtd, totalRevenda } = calcularTotaisCarrinho();

    if (!isModoRevendedorAtivo() || totalQtd === 0) {
        bar.classList.add('hidden');
        return;
    }

    document.getElementById('cartBarCount').textContent = totalQtd;
    document.getElementById('cartBarTotal').textContent = formatarMoedaDecimal(totalRevenda);
    bar.classList.remove('hidden');
}

function abrirModalCheckout() {
    const { itens, totalQtd, subtotalPublico, totalRevenda, poupanca, descontoPct } = calcularTotaisCarrinho();
    if (totalQtd === 0) return;

    const modal = document.getElementById('checkoutModal');
    const list = document.getElementById('checkoutItemsList');

    document.getElementById('checkoutSubtitle').textContent = `${utilizadorAtual.nome} • Desconto Revenda -${descontoPct}%`;
    document.getElementById('checkoutPublicTotal').textContent = `${formatarMoedaDecimal(subtotalPublico)}€`;
    document.getElementById('checkoutDiscountPct').textContent = descontoPct;
    document.getElementById('checkoutSavings').textContent = `${formatarMoedaDecimal(poupanca)}€`;
    document.getElementById('checkoutFinalTotal').textContent = `${formatarMoedaDecimal(totalRevenda)}€`;

    list.innerHTML = itens.map(item => {
        const unitRevenda = item.precoPublico * (1 - descontoPct / 100);
        const linhaTotal = unitRevenda * item.qtd;
        return `
            <div class="flex items-center justify-between gap-3 bg-dark-950 border border-white/10 rounded-2xl p-2.5">
                <div class="flex items-center gap-2.5">
                    <img src="${item.pastaImagem}/${item.imagem}" alt="${item.titulo}" class="w-11 h-11 object-contain bg-dark-900 rounded-xl p-1">
                    <div>
                        <h4 class="font-display font-bold text-sm text-white uppercase leading-tight">${item.titulo}</h4>
                        <p class="text-[11px] text-slate-400">${item.qtd}x ${formatarMoedaDecimal(unitRevenda)}€ <span class="line-through text-slate-600 ml-1">${formatarMoedaDecimal(item.precoPublico)}€</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-display font-bold text-base text-gold-400">${formatarMoedaDecimal(linhaTotal)}€</span>
                </div>
            </div>
        `;
    }).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function fecharModalCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

async function submeterEncomenda() {
    const { itens, totalQtd, subtotalPublico, totalRevenda, descontoPct } = calcularTotaisCarrinho();
    if (totalQtd === 0 || !utilizadorAtual) return;

    const btn = document.getElementById('btnConfirmOrder');
    const notas = (document.getElementById('checkoutNotes')?.value || '').trim();

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> A registar encomenda...';

    try {
        const payload = {
            revendedor_id: utilizadorAtual.id,
            revendedor_nome: utilizadorAtual.nome,
            revendedor_username: utilizadorAtual.username,
            desconto_aplicado: descontoPct,
            itens: itens.map(i => ({
                id: i.id,
                categoria: i.categoria,
                titulo: i.titulo,
                desc: i.desc,
                qtd: i.qtd,
                preco_publico: i.precoPublico,
                preco_revenda: Number((i.precoPublico * (1 - descontoPct / 100)).toFixed(2))
            })),
            subtotal_publico: Number(subtotalPublico.toFixed(2)),
            total_revenda: Number(totalRevenda.toFixed(2)),
            notas,
            estado: 'pendente'
        };

        await dbCriarEncomenda(payload);

        carrinho = {};
        if (document.getElementById('checkoutNotes')) document.getElementById('checkoutNotes').value = '';
        fecharModalCheckout();
        carregarGaleria();
        atualizarBarraCarrinho();
        abrirModalMinhasEncomendas();
    } catch (err) {
        alert('Erro ao enviar encomenda: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Confirmar e Enviar Encomenda</span>';
    }
}

function badgeEstadoEncomenda(estado) {
    switch (estado) {
        case 'preparacao':
            return '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">🔥 Em Preparação</span>';
        case 'entregue':
            return '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">✅ Entregue</span>';
        case 'cancelada':
            return '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-400/40">❌ Cancelada</span>';
        default:
            return '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">⏳ Pendente</span>';
    }
}

async function abrirModalMinhasEncomendas() {
    if (!utilizadorAtual) return;
    const modal = document.getElementById('myOrdersModal');
    const list = document.getElementById('myOrdersList');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    list.innerHTML = '<p class="text-center text-slate-400 py-8 text-xs">A carregar as tuas encomendas...</p>';

    try {
        const orders = await dbListarEncomendas(utilizadorAtual.username);
        if (orders.length === 0) {
            list.innerHTML = '<p class="text-center text-slate-400 py-10 text-xs">Ainda não fizeste nenhuma encomenda.</p>';
            return;
        }

        list.innerHTML = orders.map(ord => {
            const dataStr = new Date(ord.criado_em).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const itensHtml = (ord.itens || []).map(i => `<span class="inline-block bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-[11px] text-slate-200">${i.qtd}x ${i.titulo}</span>`).join(' ');

            return `
                <div class="bg-dark-950 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="font-display font-bold text-xs text-gold-400">PEDIDO #${ord.id} • ${dataStr}</span>
                        ${badgeEstadoEncomenda(ord.estado)}
                    </div>
                    <div class="flex flex-wrap gap-1">${itensHtml}</div>
                    ${ord.notas ? `<p class="text-[11px] text-slate-400 italic">Nota: "${ord.notas}"</p>` : ''}
                    <div class="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                        <span class="text-slate-400">Desconto aplicado: -${ord.desconto_aplicado}%</span>
                        <span class="font-display font-bold text-base text-gold-400">${formatarMoedaDecimal(ord.total_revenda)}€</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        list.innerHTML = `<p class="text-center text-red-400 py-8 text-xs">Erro: ${err.message}</p>`;
    }
}

function fecharModalMinhasEncomendas() {
    const modal = document.getElementById('myOrdersModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// ============================================================================
// PAINEL DE GESTÃO / ADMINISTRAÇÃO
// ============================================================================
function abrirPainelAdmin() {
    if (!utilizadorAtual || utilizadorAtual.role !== 'admin') return;
    const modal = document.getElementById('adminModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const cfg = getSupabaseConfig();
    const badge = document.getElementById('adminSyncBadge');
    if (badge) {
        badge.textContent = cfg.ativo ? '☁️ Cloud Supabase Ligada' : '📱 Modo Local (Configura Supabase na aba Base Dados)';
        badge.className = cfg.ativo ? 'text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5' : 'text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5';
    }

    document.getElementById('cfgSupabaseUrl').value = cfg.url;
    document.getElementById('cfgSupabaseKey').value = cfg.key;

    carregarDadosAdmin();
}

function fecharPainelAdmin() {
    const modal = document.getElementById('adminModal');
    if (!modal) return;
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

function mudarAbaAdmin(aba) {
    abaAdminAtual = aba;
    const secoes = ['encomendas', 'revendedores', 'cloud'];

    secoes.forEach(s => {
        const secEl = document.getElementById(`adminSection${s.charAt(0).toUpperCase() + s.slice(1)}`);
        const tabEl = document.getElementById(`adminTab${s.charAt(0).toUpperCase() + s.slice(1)}`);
        if (s === aba) {
            secEl?.classList.remove('hidden');
            if (tabEl) tabEl.className = 'py-2 px-3 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-gold-400 to-ember-500 text-black flex items-center justify-center gap-1.5';
        } else {
            secEl?.classList.add('hidden');
            if (tabEl) tabEl.className = 'py-2 px-3 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider bg-white/5 text-slate-300 hover:text-white flex items-center justify-center gap-1.5';
        }
    });
}

async function carregarDadosAdmin() {
    try {
        const [orders, users] = await Promise.all([
            dbListarEncomendas(),
            dbListarUtilizadores()
        ]);
        cacheEncomendasAdmin = orders;
        cacheUtilizadoresAdmin = users;

        document.getElementById('adminOrdersCount').textContent = orders.length;
        document.getElementById('adminUsersCount').textContent = users.filter(u => u.role !== 'admin').length;

        renderizarEncomendasAdmin();
        renderizarVendedoresAdmin();
    } catch (err) {
        console.error(err);
    }
}

function filtrarEncomendasAdmin(estado) {
    filtroEncomendasAdmin = estado;
    ['todas', 'pendente', 'preparacao', 'entregue'].forEach(est => {
        const btn = document.getElementById(`filtroOrd_${est}`);
        if (btn) {
            btn.className = est === estado
                ? 'px-3 py-1 rounded-lg text-xs font-bold bg-gold-400 text-black'
                : 'px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300';
        }
    });
    renderizarEncomendasAdmin();
}

function renderizarEncomendasAdmin() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;

    const lista = cacheEncomendasAdmin.filter(o => filtroEncomendasAdmin === 'todas' || o.estado === filtroEncomendasAdmin);

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-dark-900/60 border border-white/5 rounded-2xl">
                <i class="fas fa-box-open text-2xl text-slate-500 mb-2"></i>
                <p class="text-xs text-slate-400">Nenhuma encomenda encontrada neste filtro.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = lista.map(ord => {
        const dataStr = new Date(ord.criado_em).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const linhasItens = (ord.itens || []).map(i => `
            <div class="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
                <span class="text-white font-medium"><b class="text-gold-400">${i.qtd}x</b> ${i.titulo} <span class="text-slate-500 text-[10px]">(${i.desc || i.categoria})</span></span>
                <span class="text-slate-300 font-bold">${formatarMoedaDecimal(i.preco_revenda * i.qtd)}€</span>
            </div>
        `).join('');

        return `
            <div class="bg-dark-900 border border-white/10 rounded-2xl p-4 space-y-3">
                <div class="flex flex-wrap justify-between items-start gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-display font-bold text-sm text-gold-400">#${ord.id}</span>
                            <span class="font-display font-bold text-base text-white uppercase">${ord.revendedor_nome}</span>
                            <span class="text-xs text-emerald-400 font-bold">(-${ord.desconto_aplicado}%)</span>
                        </div>
                        <p class="text-[11px] text-slate-400">Login: <b>${ord.revendedor_username}</b> • ${dataStr}</p>
                    </div>
                    ${badgeEstadoEncomenda(ord.estado)}
                </div>

                <div class="bg-dark-950 rounded-xl p-3 space-y-1">
                    ${linhasItens}
                </div>

                ${ord.notas ? `<p class="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2"><i class="fas fa-comment-alt mr-1"></i> <b>Nota:</b> ${ord.notas}</p>` : ''}

                <div class="flex flex-wrap justify-between items-center gap-3 pt-1">
                    <div>
                        <span class="text-[11px] text-slate-400">Público: <span class="line-through">${formatarMoedaDecimal(ord.subtotal_publico)}€</span></span>
                        <p class="font-display font-bold text-lg text-gold-400">Total Revenda: ${formatarMoedaDecimal(ord.total_revenda)}€</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-1.5">
                        <button onclick="mudarEstadoEncomenda(${ord.id}, 'pendente')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30">Pendente</button>
                        <button onclick="mudarEstadoEncomenda(${ord.id}, 'preparacao')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30">Em Prep.</button>
                        <button onclick="mudarEstadoEncomenda(${ord.id}, 'entregue')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">Entregue</button>
                        <button onclick="mudarEstadoEncomenda(${ord.id}, 'cancelada')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-400/30">Cancelar</button>
                        <button onclick="removerEncomendaAdmin(${ord.id})" title="Apagar encomenda" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function mudarEstadoEncomenda(id, novoEstado) {
    await dbAtualizarEstadoEncomenda(id, novoEstado);
    await carregarDadosAdmin();
}

async function removerEncomendaAdmin(id) {
    if (!confirm('Apagar esta encomenda permanentemente?')) return;
    await dbApagarEncomenda(id);
    await carregarDadosAdmin();
}

function renderizarVendedoresAdmin() {
    const container = document.getElementById('adminSellersList');
    if (!container) return;

    container.innerHTML = cacheUtilizadoresAdmin.map(u => {
        const isAdmin = u.role === 'admin';
        return `
            <div class="bg-dark-900 border ${isAdmin ? 'border-gold-400/40' : 'border-white/10'} rounded-2xl p-4 flex justify-between items-center gap-3">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-display font-bold text-base text-white uppercase">${u.nome}</span>
                        ${isAdmin
                            ? '<span class="bg-gold-400 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>'
                            : `<span class="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-display font-bold px-2 py-0.5 rounded-md">-${u.desconto}%</span>`
                        }
                    </div>
                    <p class="text-xs text-slate-400 mt-1">
                        Utilizador: <b class="text-slate-200">${u.username}</b> • Password: <code class="text-gold-300 bg-black/50 px-1.5 py-0.5 rounded">${u.password}</code>
                    </p>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="preencherEdicaoVendedor(${u.id})" title="Editar" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-gold-400 flex items-center justify-center">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    ${!isAdmin ? `
                        <button onclick="removerVendedorAdmin(${u.id})" title="Apagar" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function preencherEdicaoVendedor(id) {
    const u = cacheUtilizadoresAdmin.find(x => String(x.id) === String(id));
    if (!u) return;

    document.getElementById('sellerEditId').value = u.id;
    document.getElementById('sellerNome').value = u.nome;
    document.getElementById('sellerUsername').value = u.username;
    document.getElementById('sellerPassword').value = u.password;
    document.getElementById('sellerDesconto').value = u.desconto;
    document.getElementById('formSellerTitle').innerHTML = `<i class="fas fa-user-edit"></i> Editar: ${u.nome}`;
    document.getElementById('btnCancelEditSeller').classList.remove('hidden');
}

function limparFormularioVendedor() {
    document.getElementById('sellerEditId').value = '';
    document.getElementById('sellerNome').value = '';
    document.getElementById('sellerUsername').value = '';
    document.getElementById('sellerPassword').value = '';
    document.getElementById('sellerDesconto').value = '';
    document.getElementById('formSellerTitle').innerHTML = '<i class="fas fa-user-plus"></i> Criar Novo Revendedor';
    document.getElementById('btnCancelEditSeller').classList.add('hidden');
}

async function guardarRevendedor(event) {
    event.preventDefault();
    const editId = document.getElementById('sellerEditId').value;
    const nome = document.getElementById('sellerNome').value.trim();
    const username = document.getElementById('sellerUsername').value.trim().toLowerCase();
    const password = document.getElementById('sellerPassword').value.trim();
    const desconto = parseFloat(document.getElementById('sellerDesconto').value) || 0;

    try {
        await dbGuardarUtilizador({ nome, username, password, desconto }, editId || null);
        limparFormularioVendedor();
        await carregarDadosAdmin();
    } catch (err) {
        alert('Erro ao guardar vendedor: ' + err.message);
    }
}

async function removerVendedorAdmin(id) {
    if (!confirm('Tens a certeza que queres remover este revendedor?')) return;
    await dbApagarUtilizador(id);
    await carregarDadosAdmin();
}

async function guardarConfigSupabase(event) {
    event.preventDefault();
    const url = document.getElementById('cfgSupabaseUrl').value.trim();
    const key = document.getElementById('cfgSupabaseKey').value.trim();

    if (!url || !key) {
        localStorage.removeItem('gf_supabase_url');
        localStorage.removeItem('gf_supabase_key');
        abrirPainelAdmin();
        return;
    }

    localStorage.setItem('gf_supabase_url', url);
    localStorage.setItem('gf_supabase_key', key);

    try {
        await dbListarUtilizadores();
        alert('Ligação ao Supabase efetuada com sucesso!');
        abrirPainelAdmin();
    } catch (err) {
        alert('Não foi possível ligar ao Supabase. Confirma se já correste o script supabase_setup.sql no SQL Editor.\n\nDetalhe: ' + err.message);
    }
}

// ============================================================================
// MODAL DE ZOOM DA IMAGEM DO PRODUTO
// ============================================================================
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
    const precoMostrar = isModoRevendedorAtivo() ? formatarMoeda(calcularPrecoRevendedor(prod.preco)) : prod.preco;
    price.textContent = precoMostrar;
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

// ============================================================================
// BRASAS / FAÍSCAS EM CANVAS (60FPS)
// ============================================================================
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
    const total = isMobile ? 26 : 50;
    const cores = ['#FACC15', '#F97316', '#EF4444', '#FEF08A'];

    const brasas = Array.from({ length: total }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2.4,
        vy: 0.4 + Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.45,
        alpha: 0.25 + Math.random() * 0.65,
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
    carregarSessaoGuardada();
    carregarGaleria();
    iniciarBrasasFundo();
});
