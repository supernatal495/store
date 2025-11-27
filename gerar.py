import os

# --- CONFIGURAÇÕES ---
PASTA_IMAGENS = "baterias"
ARQUIVO_REGISTO = "base_dados.txt"
ARQUIVO_JS = "dados.js"
EXTENSOES_ACEITES = ('.jpg', '.jpeg', '.png', '.webp')

def carregar_dados_existentes():
    dados = {}
    if os.path.exists(ARQUIVO_REGISTO):
        with open(ARQUIVO_REGISTO, "r", encoding="utf-8") as f:
            for linha in f:
                if ";" in linha:
                    partes = linha.strip().split(";", 1)
                    if len(partes) == 2:
                        dados[int(partes[0])] = partes[1]
    return dados

def atualizar_loja():
    inventario = carregar_dados_existentes()
    proximo_id = max(inventario.keys()) + 1 if inventario else 1

    print(f"--- A ATUALIZAR GALOFIRE ---")
    
    # 1. Detetar e Renomear Novas Imagens
    if os.path.exists(PASTA_IMAGENS):
        arquivos = os.listdir(PASTA_IMAGENS)
        novas = [f for f in arquivos if f.lower().endswith(EXTENSOES_ACEITES) and not os.path.splitext(f)[0].isdigit()]
        
        if novas:
            with open(ARQUIVO_REGISTO, "a", encoding="utf-8") as f:
                for img in novas:
                    nome_original, ext = os.path.splitext(img)
                    novo_nome = f"{proximo_id}{ext}"
                    
                    try:
                        os.rename(os.path.join(PASTA_IMAGENS, img), os.path.join(PASTA_IMAGENS, novo_nome))
                        inventario[proximo_id] = nome_original
                        f.write(f"{proximo_id};{nome_original}\n")
                        print(f"[NOVO] {img} -> {novo_nome}")
                        proximo_id += 1
                    except Exception as e:
                        print(f"[ERRO] {img}: {e}")
        else:
            print("Nenhuma imagem nova para processar.")
    else:
        print(f"Cria a pasta '{PASTA_IMAGENS}' primeiro!")
        return

    # 2. Gerar o ficheiro dados.js (COM LÓGICA PREMIUM MELHORADA)
    print("A gerar o site...")
    
    # Mapear extensões reais dos ficheiros numerados
    mapa_extensoes = {}
    for f in os.listdir(PASTA_IMAGENS):
        nome, ext = os.path.splitext(f)
        if nome.isdigit():
            mapa_extensoes[int(nome)] = ext

    js_content = "const listaProdutos = [\n"
    
    for id_prod, nome_completo in inventario.items():
        if id_prod in mapa_extensoes:
            extensao = mapa_extensoes[id_prod]
            nome_final = f"{id_prod}{extensao}"
            
            partes = nome_completo.split("-")
            titulo = partes[0].strip() if len(partes) > 0 else "Sem Título"
            desc = partes[1].strip() if len(partes) > 1 else "..."
            preco = partes[2].strip() if len(partes) > 2 else "0"
            
            # LÓGICA PREMIUM (Deteta várias formas de escrever)
            texto_analise = nome_completo.lower()
            e_premium = "false"
            if "calibre 20" in texto_analise or "calibre20" in texto_analise or "cal. 20" in texto_analise or "cal.20" in texto_analise:
                e_premium = "true"

            js_content += f'    {{ id: "{id_prod}", titulo: "{titulo}", desc: "{desc}", preco: "{preco}", imagem: "{nome_final}", premium: {e_premium} }},\n'
        
    js_content += "];"

    with open(ARQUIVO_JS, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"--- SUCESSO! Site Atualizado. ---")

if __name__ == "__main__":
    if not os.path.exists(PASTA_IMAGENS):
        os.makedirs(PASTA_IMAGENS)
    atualizar_loja()
    input("\nPressiona ENTER para sair...")