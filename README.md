# Nebula

**Nebula** é uma aplicação web para criação de personagens e interação com eles por meio de conversas com inteligência artificial. O projeto foi desenvolvido como trabalho final da disciplina **Desenvolvimento Web II**.

A aplicação combina uma interface web em Next.js com uma API REST, autenticação de usuários, persistência em PostgreSQL e integração com serviços locais de IA.

## Funcionalidades

- Cadastro e autenticação de usuários.
- Criação, visualização, edição e exclusão de personagens.
- Listagem pública de personagens com filtro por categoria, busca textual, ordenação e paginação.
- Conversas com personagens usando um modelo de linguagem executado localmente pelo Ollama.
- Armazenamento de mensagens e informações de memória das conversas.
- Geração e associação de imagens aos personagens por integração com o ComfyUI.
- Documentação interativa da API com Swagger UI.

> **Observação:** as integrações com Ollama e ComfyUI dependem de serviços e modelos configurados localmente. O repositório não inclui os pesos dos modelos de IA.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Interface e servidor | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL |
| ORM e migrações | Prisma 7 |
| Autenticação | Auth.js / NextAuth |
| Validação | Zod |
| Modelo de linguagem | Ollama |
| Geração de imagens | ComfyUI |
| Documentação da API | OpenAPI / Swagger UI |

## Estrutura do projeto

```text
prisma/
  schema.prisma                 # Modelos do banco de dados
  migrations/                  # Histórico de migrações
src/
  app/
    api/                       # Endpoints REST
    api-docs/                  # Interface do Swagger
    characters/                # Páginas dos personagens
    chat/                      # Interface de conversas
    create-character/          # Criação de personagens
    conversations/             # Histórico de conversas
    login/                     # Autenticação
    register/                  # Cadastro
  lib/                         # Integrações e regras auxiliares
  workers/                     # Rotinas e testes auxiliares de memória
```

## Modelo de dados

O banco de dados utiliza PostgreSQL e Prisma. Entre as entidades do projeto estão:

- **User:** conta de usuário e informações de autenticação.
- **Character:** personagem criado por um usuário, com descrição, personalidade, cenário, saudação e imagem opcional.
- **Conversation:** conversa entre um usuário e um personagem, com campos de memória.
- **Message:** mensagens associadas a uma conversa.
- **MemoryVersion:** histórico de versões da memória da conversa.
- **MemoryFact:** fatos estruturados associados à memória da conversa.

Os relacionamentos e restrições podem ser consultados em `prisma/schema.prisma`.

## API REST

A documentação interativa está disponível em **http://localhost:3000/api-docs**, com a aplicação em execução.

### Personagens

| Método | Endpoint | Descrição | Autenticação |
| --- | --- | --- | --- |
| `GET` | `/api/characters` | Lista, busca, filtra, ordena e pagina personagens | Não |
| `POST` | `/api/characters` | Cria um personagem | Sim |
| `GET` | `/api/characters/{id}` | Consulta um personagem do usuário | Sim |
| `PUT` | `/api/characters/{id}` | Atualiza todos os campos editáveis | Sim |
| `PATCH` | `/api/characters/{id}` | Atualiza parte dos campos editáveis | Sim |
| `DELETE` | `/api/characters/{id}` | Exclui um personagem | Sim |

O endpoint de listagem aceita os seguintes parâmetros de consulta:

| Parâmetro | Finalidade | Padrão |
| --- | --- | --- |
| `category` | Filtrar por categoria | Sem filtro |
| `search` | Buscar por nome ou descrição | Sem busca |
| `ordering` | `name`, `-name`, `createdAt`, `-createdAt`, `category` ou `-category` | `-createdAt` |
| `page` | Página de resultados (1 a 100000) | `1` |
| `page_size` | Resultados por página (1 a 50) | `10` |

Exemplo:

```http
GET /api/characters?category=Fantasia&search=Luna&ordering=name&page=1&page_size=5
```

A resposta inclui `characters`, `pagination` e `filters`. Consulte o Swagger para os demais endpoints de autenticação, conversas, mensagens, memória e imagens.

## Pré-requisitos

- Node.js e npm compatíveis com a versão do Next.js utilizada no projeto.
- PostgreSQL instalado e em execução.
- Banco de dados PostgreSQL criado para a aplicação.
- Ollama instalado e configurado, para utilizar as conversas com IA.
- ComfyUI instalado e configurado, para utilizar a geração de imagens.

As funcionalidades da aplicação que dependem de IA requerem os respectivos serviços ativos. A configuração dos modelos e workflows pode variar conforme a instalação local.

## Instalação e execução local

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   git clone https://github.com/LUV4S/nebula.git
   cd nebula
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente exigidas pelo projeto:


   ```bash
   cp .env.example .env
   ```

4. Configure a conexão com o PostgreSQL e aplique as migrações:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse:

   - Aplicação: http://localhost:3000
   - Documentação da API: http://localhost:3000/api-docs

7. Versão da IA utilizada:

   ```bash
   ollama pull llama3.2:3b
   ```

## Validações e regras de negócio

- Criação e edição de personagens utilizam validação de campos com Zod.
- Operações de escrita exigem autenticação.
- A consulta, atualização e exclusão de personagens por ID verificam a propriedade do personagem.
- Parâmetros inválidos de listagem recebem resposta HTTP `400`.
- Os endpoints utilizam códigos HTTP apropriados, como `200`, `201`, `400`, `401`, `404` e `500`.

## Conta de teste para avaliação local

Após executar as migrações e iniciar a Nebula, abra a tela de cadastro em `http://localhost:3000/register` e crie a conta com estes dados fictícios:

| Campo | Valor de exemplo |
| --- | --- |
| Nome | Avaliador Nebula |
| E-mail | `avaliador.nebula@example.com` |
| Senha e confirmação | `Nebula-Avaliacao-2026!` |

A conta é criada no banco local pelo formulário. Em uma instalação nova, repita o cadastro. Use esses dados apenas para avaliação local.

Entre com a conta em `http://localhost:3000/login` e, no mesmo navegador, abra `http://localhost:3000/api-docs`. Para testar uma rota protegida, use `POST /api/characters` com o corpo de exemplo do Swagger. A resposta esperada é `201 Created`. Em uma janela anônima, a mesma operação deve retornar `401 Unauthorized`.

## Testes realizados

Foram realizados testes manuais dos endpoints de personagens, incluindo:

- Listagem, filtro por categoria, busca textual e ordenação.
- Paginação e rejeição de parâmetros inválidos.
- Criação, consulta, atualização completa, atualização parcial e exclusão.
- Rejeição de atualizações inválidas e consulta de personagem excluído.
- Verificação de tipos com `npx tsc --noEmit`.

A API pode ser testada diretamente pelo Swagger UI.

## Atendimento aos requisitos de Desenvolvimento Web II

| Requisito | Implementação na Nebula |
| --- | --- |
| API REST com CRUD | Endpoints de personagens com `GET`, `POST`, `PUT` e `DELETE` (além de `PATCH`) |
| Banco de dados relacional | PostgreSQL com Prisma |
| Validação e regras de negócio | Zod, autenticação e verificação de propriedade |
| Filtros e busca | `category` e `search` |
| Ordenação | Parâmetro `ordering` |
| Paginação | Parâmetros `page` e `page_size` |
| Interface web | Next.js com páginas de personagens e conversas |
| Múltiplas entidades | Usuários, personagens, conversas, mensagens e memória |
| Documentação da API | OpenAPI / Swagger UI |

## Observações

Este projeto está em desenvolvimento e foi preparado para execução local. Uma implantação pública não é necessária para testar as funcionalidades descritas neste README.

## Geração de imagens com ComfyUI

A Nebula utiliza o ComfyUI para gerar imagens de personagens por meio de um workflow baseado no Stable Diffusion XL (SDXL).

### Requisitos

- ComfyUI instalado e em execução.
- Checkpoint `sd_xl_base_1.0.safetensors` disponível em `ComfyUI/models/checkpoints/`.
- Servidor HTTP do ComfyUI acessível em `http://127.0.0.1:8188`, ou no endereço definido em `COMFYUI_URL`.

O checkpoint SDXL Base 1.0 está disponível em: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0

### Workflow

O arquivo `src/lib/nebula_sdxl_api.json` contém o workflow utilizado pela aplicação.

A geração utiliza resolução de 1024 × 1024 pixels, 25 passos, CFG 7 e sampler Euler.

A aplicação envia o workflow para `POST /prompt`, consulta seu progresso por meio de `GET /history/{prompt_id}` e recupera a imagem gerada utilizando `GET /view`.

O tempo máximo de espera pela conclusão da geração é de aproximadamente três minutos.

O workflow utiliza apenas nós nativos do ComfyUI, sem necessidade de extensões personalizadas.

**Observação:** os arquivos dos modelos de IA não estão incluídos no repositório e devem ser instalados separadamente.
