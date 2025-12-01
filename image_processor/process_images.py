import os
import sys
from PIL import Image
from pillow_heif import register_heif_opener
from rembg import remove
import io

# Register HEIC opener
register_heif_opener()

def process_image(input_path, output_path, max_size=(1920, 1080)):
    """
    Processa uma única imagem:
    1. Lê a imagem (suporta HEIC).
    2. Remove o fundo.
    3. Redimensiona mantendo o aspect ratio.
    4. Salva como PNG.
    """
    try:
        print(f"Processando: {input_path}")
        
        # 1. Carregar imagem
        with open(input_path, 'rb') as i:
            input_data = i.read()
            
        # 2. Remover fundo
        # O rembg espera bytes ou PIL Image. Vamos passar bytes.
        print("  - Removendo fundo...")
        output_data = remove(input_data)
        
        # Converter bytes de volta para imagem PIL para redimensionar
        img = Image.open(io.BytesIO(output_data))
        
        # 3. Redimensionar
        print(f"  - Redimensionando (Original: {img.size})...")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        print(f"  - Novo tamanho: {img.size}")
        
        # 4. Salvar como PNG
        img.save(output_path, format='PNG')
        print(f"  - Salvo em: {output_path}")
        return True
        
    except Exception as e:
        print(f"ERRO ao processar {input_path}: {e}")
        return False

def main():
    # Diretório atual (onde o script está)
    current_dir = os.getcwd()
    
    # Pasta de saída
    output_dir = os.path.join(current_dir, 'output')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Pasta criada: {output_dir}")
        
    # Extensões suportadas
    valid_extensions = ('.heic', '.jpg', '.jpeg', '.png', '.HEIC', '.JPG', '.JPEG', '.PNG')
    
    files = [f for f in os.listdir(current_dir) if f.endswith(valid_extensions)]
    
    if not files:
        print("Nenhuma imagem encontrada na pasta atual.")
        return

    print(f"Encontradas {len(files)} imagens para processar.")
    print("-" * 50)

    success_count = 0
    for filename in files:
        input_path = os.path.join(current_dir, filename)
        
        # Nome do arquivo de saída (sempre .png)
        name_without_ext = os.path.splitext(filename)[0]
        output_filename = f"{name_without_ext}.png"
        output_path = os.path.join(output_dir, output_filename)
        
        if process_image(input_path, output_path):
            success_count += 1
            
    print("-" * 50)
    print(f"Concluído! {success_count}/{len(files)} imagens processadas com sucesso.")
    print(f"Verifique a pasta: {output_dir}")

if __name__ == "__main__":
    main()
