/**
 * Base de Dados de Produtos
 * 
 * Estrutura do Objeto:
 * - id: Identificador único (texto)
 * - titulo: Nome do produto
 * - desc: Descrição (ex: "36 Tiros")
 * - preco: Preço em Euros (texto ou número)
 * - imagem: Nome do ficheiro na pasta (ex: "1.webp")
 * - premium: true = Produto de destaque (Borda Ouro), false = Normal
 * - stock: true = Disponível, false = Esgotado (Fica cinzento no site)
 * - poucasUnidades: true = Mostra aviso de "Poucas Unidades", false = Normal
 */

const listaProdutos = [
    // --- BATERIAS ---
    { id: "1", titulo: "Big Panda", desc: "36 Tiros Calibre 20", preco: "30", imagem: "1.webp", premium: true, stock: true, poucasUnidades: false },
    { id: "2", titulo: "Feliz Ano Novo", desc: "36 Tiros Calibre 18", preco: "25", imagem: "2.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "3", titulo: "Mega Panda", desc: "100 Tiros Calibre 16", preco: "50", imagem: "10.webp", premium: true, stock: true, poucasUnidades: false },
    { id: "4", titulo: "Festival Balls ou Sea Crab", desc: "48 Tiros Calibre 20", preco: "40", imagem: "3.webp", premium: true, stock: true, poucasUnidades: true },
    { id: "5", titulo: "Gunfire", desc: "100 Tiros Calibre 20", preco: "75", imagem: "4.webp", premium: true, stock: true, poucasUnidades: false },
    { id: "6", titulo: "Happy Alfa", desc: "100 Tiros Calibre 16", preco: "45", imagem: "5.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "7", titulo: "Happy Alfa", desc: "49 Tiros Calibre 16", preco: "30", imagem: "6.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "8", titulo: "Happy Panda", desc: "36 Tiros Calibre 16", preco: "20", imagem: "7.webp", premium: false, stock: true, poucasUnidades: true },
    { id: "9", titulo: "Bateria Anti-Aérea", desc: "81 Disparos", preco: "10", imagem: "9.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "10", titulo: "Pro", desc: "222 Tiros Calibre 20", preco: "175", imagem: "8.webp", premium: true, stock: true, poucasUnidades: false },
    { id: "11", titulo: "Devils Cry", desc: "100 Tiros Calibre 20", preco: "70", imagem: "11.webp", premium: true, stock: true, poucasUnidades: false },
    { id: "12", titulo: "Clown", desc: "49 Tiros Calibre 20", preco: "35", imagem: "12.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "13", titulo: "Vampire", desc: "36 Tiros Calibre 20", preco: "30", imagem: "13.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "14", titulo: "Firefox", desc: "25 Tiros Calibre 20", preco: "20", imagem: "14.webp", premium: false, stock: true, poucasUnidades: false },
];

const listaPetardos = [
    // --- BOMBINHAS / PETARDOS ---
    { id: "1", titulo: "Traças", desc: "1 UNIDADE", preco: "1", imagem: "1.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "2", titulo: "25 Pk2", desc: "", preco: "6", imagem: "2.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "3", titulo: "P2", desc: "Caixa P2 10 UNIDADES", preco: "10", imagem: "3.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "4", titulo: "Valencianetes", desc: "Valencianetes 20 UNIDADES", preco: "10", imagem: "4.webp", premium: false, stock: true, poucasUnidades: true },
    { id: "5", titulo: "Traças", desc: "Traças 250 Picos", preco: "10", imagem: "5.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "6", titulo: "Foguete Viagem Lunar", desc: "144 UNIDADES", preco: "20", imagem: "6.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "7", titulo: "Candelas", desc: "Candelas 12 UNIDADES", preco: "15", imagem: "7.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "8", titulo: "Americanos", desc: "100 UNIDADES", preco: "7,50", imagem: "8.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "9", titulo: "Traça Valenciana", desc: "Traça 10 metros", preco: "20", imagem: "9.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "10", titulo: "Shovien Color", desc: "12 UNIDADES", preco: "30", imagem: "10.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "11", titulo: "Mísseis de Cruzeiro", desc: "Caixa 4 UNIDADES", preco: "20", imagem: "11.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "12", titulo: "Hilo Tiron", desc: "", preco: "2,50", imagem: "12.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "13", titulo: "Petardo", desc: "", preco: "4", imagem: "13.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "14", titulo: "Monfort", desc: "", preco: "10", imagem: "14.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "15", titulo: "6 MIC", desc: "", preco: "10", imagem: "15.webp", premium: false, stock: true, poucasUnidades: false },
    { id: "16", titulo: "Foguete Nacional", desc: "12 UNIDADES", preco: "35", imagem: "16.webp", premium: false, stock: true, poucasUnidades: false },
];
