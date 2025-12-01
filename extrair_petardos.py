import pandas as pd
import os

def extrair_segunda_tabela():
    try:
        # Ler o ficheiro Excel
        df = pd.read_excel('preços.xlsx', sheet_name=0)
        
        # Encontrar onde começa a segunda tabela (procurar por "Petardos" ou linha vazia)
        inicio_segunda_tabela = None
        for i, row in df.iterrows():
            if pd.isna(row.iloc[0]) and pd.isna(row.iloc[1]) and pd.isna(row.iloc[2]):
                # Linha vazia encontrada, próxima linha pode ser o início da segunda tabela
                if i + 1 < len(df):
                    inicio_segunda_tabela = i + 1
                    break
        
        if inicio_segunda_tabela is None:
            print("Segunda tabela não encontrada. Tentando encontrar por 'Petardos'...")
            for i, row in df.iterrows():
                if any('petardo' in str(cell).lower() for cell in row if pd.notna(cell)):
                    inicio_segunda_tabela = i
                    break
        
        if inicio_segunda_tabela is None:
            print("Não foi possível encontrar a segunda tabela.")
            return
        
        # Extrair dados da segunda tabela
        segunda_tabela = df.iloc[inicio_segunda_tabela:].reset_index(drop=True)
        
        # Remover linhas completamente vazias
        segunda_tabela = segunda_tabela.dropna(how='all')
        
        print("Dados da segunda tabela encontrados:")
        print(segunda_tabela)
        
        # Gerar o bloco JavaScript para petardos
        js_content = "const listaPetardos = [\n"
        
        id_counter = 1
        for i, row in segunda_tabela.iterrows():
            # Pular linha de cabeçalho se existir
            if i == 0 and any('nome' in str(cell).lower() or 'produto' in str(cell).lower() for cell in row if pd.notna(cell)):
                continue
                
            # Extrair dados (assumindo colunas: Nome, Descrição, Preço)
            nome = str(row.iloc[0]) if pd.notna(row.iloc[0]) else "Produto"
            desc = str(row.iloc[1]) if pd.notna(row.iloc[1]) else "Descrição"
            preco = str(row.iloc[2]) if pd.notna(row.iloc[2]) else "0"
            
            # Limpar dados
            nome = nome.replace('"', '\\"')
            desc = desc.replace('"', '\\"')
            preco = preco.replace('€', '').replace(',', '.').strip()
            
            # Verificar se há imagem correspondente na pasta petardo
            imagem_encontrada = None
            if os.path.exists('petardo'):
                for ext in ['.png', '.jpg', '.jpeg']:
                    img_path = f"IMG_{5696 + id_counter}{ext}"
                    if os.path.exists(os.path.join('petardo', img_path)):
                        imagem_encontrada = img_path
                        break
            
            if not imagem_encontrada:
                imagem_encontrada = f"{id_counter}.png"
            
            js_content += f'    {{ id: "{id_counter}", titulo: "{nome}", desc: "{desc}", preco: "{preco}", imagem: "{imagem_encontrada}", premium: false }},\n'
            id_counter += 1
        
        js_content += "];"
        
        # Salvar no ficheiro
        with open('petardos.js', 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"\nBloco JavaScript gerado em 'petardos.js':")
        print(js_content)
        
    except Exception as e:
        print(f"Erro ao processar o ficheiro Excel: {e}")
        print("Tentando método alternativo...")
        
        # Método alternativo - criar dados de exemplo baseados nas imagens existentes
        criar_dados_exemplo()

def criar_dados_exemplo():
    """Cria dados de exemplo baseados nas imagens na pasta petardo"""
    if not os.path.exists('petardo'):
        print("Pasta 'petardo' não encontrada.")
        return
    
    imagens = [f for f in os.listdir('petardo') if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    imagens.sort()
    
    js_content = "const listaPetardos = [\n"
    
    for i, img in enumerate(imagens, 1):
        nome = f"Petardo {i}"
        desc = f"Petardo de qualidade"
        preco = str(5 + i * 2)  # Preços de exemplo
        
        js_content += f'    {{ id: "{i}", titulo: "{nome}", desc: "{desc}", preco: "{preco}", imagem: "{img}", premium: false }},\n'
    
    js_content += "];"
    
    with open('petardos.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Dados de exemplo criados baseados em {len(imagens)} imagens:")
    print(js_content)

if __name__ == "__main__":
    extrair_segunda_tabela()
    input("\nPressiona ENTER para sair...")