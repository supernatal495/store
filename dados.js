/**
 * Base de Dados de Produtos — NOVA CAMPANHA 2026
 * 
 * Estrutura do Objeto:
 * - id: Identificador único (texto)
 * - titulo: Nome do produto
 * - desc: Descrição (ex: "36 Tiros Calibre 20")
 * - preco: Preço em Euros
 * - imagem: Nome do ficheiro na pasta (ex: "11.webp")
 * - premium: true = Produto de destaque (Borda Ouro Incandescente)
 * - novo: true = Selo "NOVO 2026" (Nova Campanha)
 * - stock: true = Disponível, false = Esgotado (Vai para o fim da lista)
 * - poucasUnidades: false
 */

const listaProdutos = [
    // --- BATERIAS EM STOCK (NOVA CAMPANHA 2026 EM DESTAQUE NO TOPO) ---
    { id: "11", titulo: "Devils Cry", desc: "100 Tiros Calibre 20", preco: "70", imagem: "11.webp", premium: true, novo: true, stock: true, poucasUnidades: false },
    { id: "12", titulo: "Clown", desc: "49 Tiros Calibre 20", preco: "35", imagem: "12.webp", premium: true, novo: true, stock: true, poucasUnidades: false },
    { id: "13", titulo: "Vampire", desc: "36 Tiros Calibre 20", preco: "30", imagem: "13.webp", premium: false, novo: true, stock: true, poucasUnidades: false },
    { id: "14", titulo: "Firefox", desc: "25 Tiros Calibre 20", preco: "20", imagem: "14.webp", premium: false, novo: true, stock: true, poucasUnidades: false },
    { id: "10", titulo: "Pro", desc: "200 Tiros Calibre 20", preco: "175", imagem: "8.webp", premium: true, novo: false, stock: true, poucasUnidades: false },
    { id: "5", titulo: "Gunfire", desc: "100 Tiros Calibre 20", preco: "75", imagem: "4.webp", premium: true, novo: false, stock: true, poucasUnidades: false },
    { id: "2", titulo: "Feliz Ano Novo", desc: "36 Tiros Calibre 18", preco: "25", imagem: "2.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "8", titulo: "Happy Panda", desc: "36 Tiros Calibre 16", preco: "20", imagem: "7.webp", premium: false, novo: false, stock: true, poucasUnidades: false },

];

const listaPetardos = [
    // --- BOMBINHAS / PETARDOS EM STOCK (TOP EM DESTAQUE) ---
    { id: "10", titulo: "Shovien Color", desc: "12 UNIDADES", preco: "30", imagem: "10.webp", premium: true, novo: false, stock: true, poucasUnidades: false },
    { id: "11", titulo: "Mísseis de Cruzeiro", desc: "Caixa 4 UNIDADES", preco: "20", imagem: "11.webp", premium: true, novo: false, stock: true, poucasUnidades: false },
    { id: "13", titulo: "Petardo", desc: "", preco: "4", imagem: "13.webp", premium: true, novo: false, stock: true, poucasUnidades: false },
    { id: "6", titulo: "Foguete Viagem Lunar", desc: "144 UNIDADES", preco: "20", imagem: "6.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "7", titulo: "Candelas", desc: "Candelas 12 UNIDADES", preco: "15", imagem: "7.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "3", titulo: "P2", desc: "Caixa P2 10 UNIDADES", preco: "10", imagem: "3.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "4", titulo: "Valencianetes", desc: "Valencianetes 20 UNIDADES", preco: "10", imagem: "4.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "8", titulo: "Americanos", desc: "100 UNIDADES", preco: "7,50", imagem: "8.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "2", titulo: "25 Pk2", desc: "", preco: "6", imagem: "2.webp", premium: false, novo: false, stock: true, poucasUnidades: false },
    { id: "1", titulo: "Traças", desc: "1 UNIDADE", preco: "1", imagem: "1.webp", premium: false, novo: false, stock: true, poucasUnidades: false },

];
