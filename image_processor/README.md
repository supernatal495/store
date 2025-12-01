# Processador de Imagens para iPhone

Este script automatiza o tratamento de fotos (HEIC/JPG), removendo o fundo e convertendo para PNG otimizado.

## Configuração Inicial

1.  **Instalar Python**: Certifique-se de ter o Python instalado.
2.  **Instalar Dependências**:
    Abra o terminal nesta pasta e execute:
    ```bash
    pip install -r requirements.txt
    ```
    *Nota: A primeira vez que executar, o download do modelo de IA para remover o fundo será feito automaticamente (pode demorar um pouco).*

## Como Usar

1.  Coloque as suas fotos (arquivos `.heic`, `.jpg`, `.png`) **nesta mesma pasta** onde está o script `process_images.py`.
2.  Execute o script:
    ```bash
    python process_images.py
    ```
3.  As imagens processadas serão salvas na pasta `output` que será criada automaticamente.

## O que o script faz?

1.  **Converte** arquivos HEIC (formato do iPhone) para imagem.
2.  **Remove o fundo** automaticamente (ideal para objetos em fundo preto/contrastante).
3.  **Redimensiona** a imagem para no máximo 1920x1080 (mantendo a proporção).
4.  **Salva** como PNG com fundo transparente.
