/**
 * Base de Dados de Produtos
 * 
 * Estrutura do Objeto:
 * - id: Identificador único (texto)
 * - titulo: Nome do produto
 * - desc: Descrição (ex: "36 Tiros")
 * - preco: Preço em Euros (texto ou número)
 * - imagem: Nome do ficheiro na pasta (ex: "1.png")
 * - premium: true = Produto de destaque (Borda Ouro), false = Normal
 * - stock: true = Disponível, false = Esgotado (Fica cinzento no site)
 */

const listaProdutos = [
    // --- BATERIAS ---
    { id: "1", titulo: "Big Panda", desc: "36Tiros Calibre 20", preco: "30", imagem: "1.png", premium: true, stock: true },
    { id: "2", titulo: "Feliz Ano Novo", desc: "36Tiros Calibre18", preco: "25", imagem: "2.png", premium: false, stock: true },
    { id: "3", titulo: "Mega Panda", desc: "100 Tiros Calibre 16", preco: "50", imagem: "10.png", premium: true, stock: false }, // EXEMPLO: Sem stock
    { id: "4", titulo: "Festival Balls ou Sea Crab", desc: "48 Tiros Calibre 20", preco: "40", imagem: "3.png", premium: true, stock: true },
    { id: "5", titulo: "Gunfire", desc: "100Tiros Calbire 20", preco: "75", imagem: "4.png", premium: true, stock: true },
    { id: "6", titulo: "Happy Alfa", desc: "100 Tiros Calibre 16", preco: "45", imagem: "5.png", premium: false, stock: true },
    { id: "7", titulo: "Happy Alfa", desc: "49Tiros Calibre16", preco: "30", imagem: "6.png", premium: false, stock: true },
    { id: "8", titulo: "Happy Panda", desc: "36Tiros Calibre16", preco: "20", imagem: "7.png", premium: false, stock: true },
    { id: "9", titulo: "Bateria Anti-Area", desc: "81 Disparos", preco: "10", imagem: "9.png", premium: false, stock: true },
    { id: "", titulo: "Pro", desc: "222 Tiros Calibre 20", preco: "175", imagem: "8.png", premium: true, stock: true },
];

const listaPetardos = [
    // --- BOMBINHAS / PETARDOS ---
    { id: "1", titulo: "Tracas", desc: "1 UNIDADE", preco: "1", imagem: "1.png", premium: false, stock: true },
    { id: "2", titulo: "25 Pk2", desc: "", preco: "6", imagem: "2.png", premium: false, stock: true },
    { id: "3", titulo: "P2", desc: "Caixa P2 10 UNIDADES", preco: "10", imagem: "3.png", premium: false, stock: true },
    { id: "4", titulo: "Valencianetes", desc: "Valencianetes 20 UNIDADES", preco: "10", imagem: "4.png", premium: false, stock: true },
    { id: "5", titulo: "Tracas", desc: "Tracas 250 Picos", preco: "10", imagem: "5.png", premium: false, stock: true },
    { id: "6", titulo: "Foguete Viagem Lunar", desc: "144 UNIDADES", preco: "20", imagem: "6.png", premium: false, stock: true },
    { id: "7", titulo: "Candelas", desc: "Candelas 12 UNIDADES", preco: "15", imagem: "7.png", premium: false, stock: true },
    { id: "8", titulo: "Americanos", desc: "100 UNIDADES", preco: "7,50", imagem: "8.png", premium: false, stock: true },
    { id: "9", titulo: "Traca Valenciana", desc: "Traca 10 metros", preco: "20", imagem: "9.png", premium: false, stock: true },
    { id: "10", titulo: "Shovien Color", desc: "12 UNIDADES", preco: "30", imagem: "10.png", premium: false, stock: true },
    { id: "11", titulo: "Misseis de Cruzeiro", desc: "Caixa 4 UNIDADES", preco: "20", imagem: "11.png", premium: false, stock: true },
    { id: "12", titulo: "Hilo Tiron", desc: "", preco: "2.50", imagem: "12.png", premium: false, stock: true },
    { id: "13", titulo: "Petardo", desc: "", preco: "4", imagem: "13.png", premium: false, stock: true },
    { id: "14", titulo: "Monfort", desc: "", preco: "10", imagem: "14.png", premium: false, stock: true },
    { id: "15", titulo: "6 MIC", desc: "", preco: "10", imagem: "15.png", premium: false, stock: true },
    { id: "16", titulo: "Foguere Nacional", desc: "12 UNIDADES", preco: "35", imagem: "16.png", premium: false, stock: true },
];


