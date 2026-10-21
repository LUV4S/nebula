
export const openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "Nebula API",
        version: "1.0.0",
        description:
            "Documentação da API da Nebula, plataforma de personagens e conversas com inteligência artificial.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Ambiente de desenvolvimento local",
        },
    ],
    tags: [
        {
            name: "Personagens",
            description: "Criação e gerenciamento de personagens",
        },
        {
            name: "Conversas",
            description: "Gerenciamento de conversas",
        },
        {
            name: "Mensagens",
            description: "Histórico e respostas dos personagens",
        },
        {
            name: "Imagens",
            description: "Geração e gerenciamento de imagens dos personagens.",
        },
        {
            name: "Memória",
            description: "Consulta e gerenciamento das memórias das conversas.",
        },
        {
            name: "Saúde",
            description: "Verificação do funcionamento da aplicação e da conexão com o banco de dados.",
        },
    ],
    paths: {

        "/api/characters": {
            get: {
                tags: ["Personagens"],
                summary: "Listar, filtrar e paginar personagens",
                description:
                    "Lista personagens publicamente, com filtro por categoria, busca textual por nome ou descrição, ordenação e paginação. Os parâmetros podem ser combinados. Não exige autenticação.",

                parameters: [
                    {
                        name: "category",
                        in: "query",
                        required: false,
                        description:
                            "Filtra personagens pela categoria exata, sem diferenciar letras maiúsculas e minúsculas.",
                        schema: {
                            type: "string",
                            maxLength: 40,
                        },
                        example: "Fantasia",
                    },
                    {
                        name: "search",
                        in: "query",
                        required: false,
                        description:
                            "Busca textual no nome ou na descrição do personagem, sem diferenciar letras maiúsculas e minúsculas.",
                        schema: {
                            type: "string",
                            maxLength: 100,
                        },
                        example: "Luna",
                    },
                    {
                        name: "ordering",
                        in: "query",
                        required: false,
                        description:
                            "Define o campo e a direção da ordenação. O prefixo '-' indica ordem decrescente.",
                        schema: {
                            type: "string",
                            enum: [
                                "name",
                                "-name",
                                "createdAt",
                                "-createdAt",
                                "category",
                                "-category",
                            ],
                            default: "-createdAt",
                        },
                        example: "name",
                    },
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        description:
                            "Número da página de resultados. Deve ser um inteiro entre 1 e 100000.",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100000,
                            default: 1,
                        },
                        example: 1,
                    },
                    {
                        name: "page_size",
                        in: "query",
                        required: false,
                        description:
                            "Quantidade de personagens por página. Deve ser um inteiro entre 1 e 50.",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 50,
                            default: 10,
                        },
                        example: 10,
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Personagens listados com sucesso, incluindo informações de paginação e filtros aplicados.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "characters",
                                        "pagination",
                                        "filters",
                                    ],
                                    properties: {
                                        characters: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/CharacterListItem",
                                            },
                                        },
                                        pagination: {
                                            type: "object",
                                            required: [
                                                "page",
                                                "page_size",
                                                "total",
                                                "totalPages",
                                                "hasNextPage",
                                                "hasPreviousPage",
                                            ],
                                            properties: {
                                                page: {
                                                    type: "integer",
                                                    example: 1,
                                                },
                                                page_size: {
                                                    type: "integer",
                                                    example: 10,
                                                },
                                                total: {
                                                    type: "integer",
                                                    example: 25,
                                                },
                                                totalPages: {
                                                    type: "integer",
                                                    example: 3,
                                                },
                                                hasNextPage: {
                                                    type: "boolean",
                                                    example: true,
                                                },
                                                hasPreviousPage: {
                                                    type: "boolean",
                                                    example: false,
                                                },
                                            },
                                        },
                                        filters: {
                                            type: "object",
                                            required: [
                                                "category",
                                                "search",
                                                "ordering",
                                            ],
                                            properties: {
                                                category: {
                                                    type: "string",
                                                    nullable: true,
                                                    example: "Fantasia",
                                                },
                                                search: {
                                                    type: "string",
                                                    nullable: true,
                                                    example: "Luna",
                                                },
                                                ordering: {
                                                    type: "string",
                                                    example: "-createdAt",
                                                },
                                            },
                                        },
                                    },
                                },
                                example: {
                                    characters: [
                                        {
                                            id: "cmexample123",
                                            name: "Luna",
                                            category: "Fantasia",
                                            description:
                                                "Uma exploradora de mundos desconhecidos.",
                                            createdAt: "2026-10-15T12:00:00.000Z",
                                            creator: {
                                                name: "Exemplo",
                                            },
                                        },
                                    ],
                                    pagination: {
                                        page: 1,
                                        page_size: 10,
                                        total: 25,
                                        totalPages: 3,
                                        hasNextPage: true,
                                        hasPreviousPage: false,
                                    },
                                    filters: {
                                        category: "Fantasia",
                                        search: "Luna",
                                        ordering: "-createdAt",
                                    },
                                },
                            },
                        },
                    },

                    "400": {
                        description:
                            "Parâmetros inválidos, como página menor que 1, tamanho acima de 50 ou ordenação não permitida.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },

                    "500": {
                        description:
                            "Erro interno ao consultar personagens.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },


            post: {
                tags: ["Personagens"],
                summary: "Criar personagem",
                description:
                    "Cria um personagem associado ao usuário autenticado. Todos os campos são obrigatórios.",
                security: [
                    {
                        sessionCookie: [],
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateCharacterRequest",
                            },
                            example: {
                                name: "Lara Mendes",
                                category: "Cotidiano",
                                description:
                                    "Uma jovem veterinária que divide apartamento com você.",
                                personality:
                                    "Lara é independente, sarcástica e reservada, mas demonstra carinho pelas pessoas próximas.",
                                scenario:
                                    "Você acabou de se mudar para um apartamento compartilhado com Lara.",
                                greeting:
                                    "*Lara abre a porta do apartamento.* — Oi! Pode entrar.",
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Personagem criado com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["message", "character"],
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Personagem criado com sucesso!",
                                        },
                                        character: {
                                            $ref: "#/components/schemas/CreatedCharacter",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "JSON inválido ou campos que não atendem às regras de validação.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao criar personagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/characters/{id}": {
            get: {
                tags: ["Personagens"],
                summary: "Consultar personagem por ID",
                description:
                    "Retorna os dados de um personagem criado pelo usuário autenticado. Inclui a URL da imagem, quando disponível.",
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID do personagem.",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Personagem encontrado.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["character"],
                                    properties: {
                                        character: {
                                            $ref: "#/components/schemas/CharacterDetail",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Personagem não encontrado ou sem permissão.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao carregar personagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },

            put: {
                tags: ["Personagens"],
                summary: "Atualizar personagem completamente",
                description:
                    "Substitui os seis campos textuais de um personagem pertencente ao usuário autenticado. Todos os campos são obrigatórios. A imagem permanece inalterada.",
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID do personagem.",
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateCharacterRequest",
                            },
                            example: {
                                name: "Luna",
                                category: "Ficção científica",
                                description:
                                    "Uma exploradora espacial em busca de respostas.",
                                personality:
                                    "Corajosa, curiosa e determinada a descobrir a verdade.",
                                scenario:
                                    "Uma estação espacial abandonada nos limites da galáxia.",
                                greeting:
                                    "Olá, viajante! Você também recebeu o sinal misterioso?",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Personagem atualizado completamente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["message", "character"],
                                    properties: {
                                        message: {
                                            type: "string",
                                            example:
                                                "Personagem atualizado completamente!",
                                        },
                                        character: {
                                            $ref: "#/components/schemas/UpdatedCharacter",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "JSON inválido ou campos obrigatórios inválidos.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Personagem não encontrado ou sem permissão.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao atualizar personagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },

            patch: {
                tags: ["Personagens"],
                summary: "Atualizar personagem parcialmente",
                description:
                    "Atualiza apenas os campos enviados. É obrigatório informar pelo menos um dos seis campos textuais. A imagem permanece inalterada.",
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID do personagem.",
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                additionalProperties: false,
                                minProperties: 1,
                                properties: {
                                    name: {
                                        type: "string",
                                        minLength: 2,
                                        maxLength: 60,
                                    },
                                    category: {
                                        type: "string",
                                        minLength: 2,
                                        maxLength: 40,
                                    },
                                    description: {
                                        type: "string",
                                        minLength: 10,
                                        maxLength: 1000,
                                    },
                                    personality: {
                                        type: "string",
                                        minLength: 10,
                                        maxLength: 3000,
                                    },
                                    scenario: {
                                        type: "string",
                                        minLength: 10,
                                        maxLength: 3000,
                                    },
                                    greeting: {
                                        type: "string",
                                        minLength: 2,
                                        maxLength: 1000,
                                    },
                                },
                            },
                            example: {
                                name: "Luna Atualizada",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Personagem atualizado parcialmente.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["message", "character"],
                                    properties: {
                                        message: {
                                            type: "string",
                                            example:
                                                "Personagem atualizado parcialmente!",
                                        },
                                        character: {
                                            $ref: "#/components/schemas/UpdatedCharacter",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "JSON inválido, nenhum campo informado ou dados fora dos limites.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Personagem não encontrado ou sem permissão.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao atualizar personagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },

            delete: {
                tags: ["Personagens"],
                summary: "Excluir personagem",
                description:
                    "Exclui permanentemente um personagem pertencente ao usuário autenticado. Também exclui suas conversas, mensagens e memórias vinculadas, conforme as relações em cascata do banco de dados. O arquivo de imagem armazenado localmente não é removido por esta operação.",
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID do personagem que será excluído.",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Personagem excluído com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["success", "message"],
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true,
                                        },
                                        message: {
                                            type: "string",
                                            example:
                                                "Personagem excluído com sucesso.",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Personagem não encontrado ou sem permissão.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao excluir personagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/conversations": {
            get: {
                tags: ["Conversas"],
                summary: "Listar conversas do usuário",
                description:
                    "Retorna todas as conversas do usuário autenticado, ordenadas por updatedAt (mais recentes primeiro). Inclui informações do personagem e a mensagem mais recente de cada conversa.",
                security: [{ sessionCookie: [] }],
                responses: {
                    "200": {
                        description: "Conversas listadas com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["conversations"],
                                    properties: {
                                        conversations: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/ConversationListItem",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao listar conversas.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },

            post: {
                tags: ["Conversas"],
                summary: "Iniciar ou recuperar conversa",
                description:
                    "Inicia uma conversa com um personagem. Se já existir uma conversa entre o usuário e esse personagem, retorna a conversa existente (200), preservando o histórico. Caso contrário, cria uma nova conversa (201) e salva automaticamente a saudação do personagem como mensagem ASSISTANT, quando preenchida. A resposta não inclui as mensagens.",
                security: [{ sessionCookie: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateConversationRequest",
                            },
                            example: {
                                characterId: "id-do-personagem",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Conversa existente retornada.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ConversationResponse",
                                },
                            },
                        },
                    },
                    "201": {
                        description:
                            "Conversa criada. A saudação do personagem é salva como primeira mensagem, quando disponível.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ConversationResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "JSON inválido ou characterId não informado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Personagem não encontrado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao criar conversa.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },


        "/api/conversations/{id}": {
            get: {
                tags: ["Conversas"],
                summary: "Consultar conversa por ID",
                description:
                    "Retorna o ID da conversa e as informações básicas do personagem associado. " +
                    "Somente o proprietário autenticado pode consultar a conversa.",

                security: [{ sessionCookie: [] }],

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID da conversa.",
                        schema: {
                            type: "string",
                        },
                    },
                ],

                responses: {
                    "200": {
                        description: "Conversa encontrada.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ConversationDetailResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Você precisa estar conectado.",
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "Conversa não encontrada ou não pertence ao usuário.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Conversa não encontrada.",
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Erro interno ao carregar a conversa.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },

            delete: {
                tags: ["Conversas"],
                summary: "Excluir conversa",
                description:
                    "Exclui permanentemente uma conversa pertencente ao usuário autenticado. " +
                    "Devido às relações com exclusão em cascata no PostgreSQL, " +
                    "as mensagens, versões de memória e fatos de memória associados " +
                    "também são excluídos. Esta operação não pode ser desfeita pela API.",

                security: [{ sessionCookie: [] }],

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID da conversa que será excluída.",
                        schema: {
                            type: "string",
                        },
                    },
                ],

                responses: {
                    "200": {
                        description: "Conversa excluída com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/DeleteConversationResponse",
                                },
                                example: {
                                    success: true,
                                    message: "Conversa excluída com sucesso.",
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Você precisa entrar na sua conta.",
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "Conversa não encontrada ou não pertence ao usuário.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Conversa não encontrada.",
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Erro interno ao excluir a conversa.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/conversations/{id}/messages": {
            get: {
                tags: ["Mensagens"],
                summary: "Listar mensagens da conversa",
                description:
                    "Retorna as últimas 100 mensagens da conversa, em ordem cronológica (mais antigas primeiro). Somente o proprietário da conversa pode acessar o histórico.",
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID da conversa.",
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Mensagens recuperadas com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["messages"],
                                    properties: {
                                        messages: {
                                            type: "array",
                                            maxItems: 100,
                                            items: {
                                                $ref: "#/components/schemas/ConversationMessage",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Conversa não encontrada ou sem permissão.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao buscar mensagens.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },

            post: {
                tags: ["Mensagens"],
                summary: "Enviar mensagem e gerar resposta da IA",
                description:
                    "Salva a mensagem do usuário no PostgreSQL, recupera o histórico recente e as memórias confirmadas, envia o contexto ao Ollama e transmite a resposta progressivamente em NDJSON. A mensagem do usuário pode permanecer salva mesmo se o Ollama falhar. O Swagger UI pode exibir o streaming apenas como texto bruto.",
                security: [{ sessionCookie: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID da conversa.",
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SendMessageRequest",
                            },
                            example: {
                                content: "Oi, Lara! Como foi seu dia?",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description:
                            "Streaming NDJSON. Cada linha contém um evento JSON independente.",
                        content: {
                            "application/x-ndjson": {
                                schema: {
                                    type: "string",
                                    description:
                                        "Sequência de eventos user_message, delta, done ou error, separados por quebras de linha.",
                                    example:
                                        '{"type":"user_message","message":{"id":"msg-1","role":"USER","content":"Oi!"}}\n' +
                                        '{"type":"delta","content":"*Ela sorri.*"}\n' +
                                        '{"type":"delta","content":"\\n\\n— Oi!"}\n' +
                                        '{"type":"done","assistantMessage":{"id":"msg-2","role":"ASSISTANT","content":"*Ela sorri.*\\n\\n— Oi!"}}',
                                },
                            },
                        },
                    },
                    "400": {
                        description:
                            "JSON inválido ou mensagem vazia ou acima de 10.000 caracteres.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Conversa não encontrada ou sem permissão.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "502": {
                        description:
                            "O Ollama não respondeu ou apresentou erro. A mensagem do usuário já foi salva.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/OllamaErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno ao processar mensagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },


        "/api/conversations/{id}/memory": {
            get: {
                tags: ["Memória"],
                summary: "Consultar memória da conversa",
                description:
                    "Retorna a memória narrativa, a memória permanente, " +
                    "a data da última atualização da memória e o nome " +
                    "do personagem associado à conversa. " +
                    "Somente o proprietário autenticado pode consultar " +
                    "essas informações. Esta rota não altera a memória.",

                security: [{ sessionCookie: [] }],

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID da conversa.",
                        schema: {
                            type: "string",
                        },
                    },
                ],

                responses: {
                    "200": {
                        description: "Memória recuperada com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ConversationMemoryResponse",
                                },
                                example: {
                                    memory:
                                        "O usuário chegou ao apartamento e conheceu Lara.",
                                    permanentMemory:
                                        "O usuário divide apartamento com Lara.",
                                    memoryUpdatedAt: "2026-10-15T10:30:00.000Z",
                                    characterName: "Lara Mendes",
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Você precisa entrar na sua conta.",
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "Conversa não encontrada ou não pertence ao usuário.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Conversa não encontrada.",
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Erro interno ao carregar a memória.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Não foi possível carregar a memória.",
                                },
                            },
                        },
                    },
                },
            },
        },


        "/api/conversations/{id}/memory/history": {
            get: {
                tags: ["Memória"],
                summary: "Consultar histórico de versões da memória",
                description:
                    "Retorna até 50 versões anteriores da memória de uma conversa. " +
                    "Os registros são ordenados por data de criação decrescente " +
                    "e, em caso de empate, pelo ID decrescente. " +
                    "Cada versão contém a memória permanente e a memória narrativa " +
                    "registradas naquele momento. " +
                    "Somente o proprietário autenticado da conversa pode acessar " +
                    "esse histórico. Esta operação não altera a memória.",

                security: [{ sessionCookie: [] }],

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID da conversa.",
                        schema: {
                            type: "string",
                        },
                    },
                ],

                responses: {
                    "200": {
                        description: "Histórico de memória recuperado com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/MemoryHistoryResponse",
                                },
                                example: {
                                    versions: [
                                        {
                                            id: "cmversion123",
                                            permanentMemory:
                                                "O usuário divide apartamento com Lara.",
                                            narrativeMemory:
                                                "O usuário chegou ao apartamento e conheceu Lara.",
                                            createdAt: "2026-10-15T10:30:00.000Z",
                                        },
                                    ],
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Não autorizado.",
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "Conversa não encontrada ou não pertence ao usuário.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Conversa não encontrada.",
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Erro interno ao consultar histórico.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Erro ao consultar histórico.",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/characters/{id}/generate-image": {
            post: {
                tags: ["Imagens"],
                summary: "Gerar imagem de personagem",
                description:
                    "Gera uma imagem PNG utilizando ComfyUI e SDXL. " +
                    "O prompt é construído automaticamente a partir do nome, " +
                    "categoria, descrição, personalidade e cenário do personagem. " +
                    "Somente o criador pode solicitar a geração. " +
                    "A imagem é retornada diretamente e não é salva " +
                    "automaticamente no cadastro do personagem. " +
                    "O ComfyUI precisa estar em execução.",

                security: [
                    {
                        sessionCookie: [],
                    },
                ],

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID do personagem que terá a imagem gerada.",
                        schema: {
                            type: "string",
                        },
                    },
                ],

                responses: {
                    "200": {
                        description: "Imagem gerada com sucesso.",
                        headers: {
                            "Cache-Control": {
                                description: "Impede o armazenamento da resposta em cache.",
                                schema: {
                                    type: "string",
                                    example: "no-store",
                                },
                            },
                        },
                        content: {
                            "image/png": {
                                schema: {
                                    type: "string",
                                    format: "binary",
                                    description: "Arquivo PNG gerado pelo ComfyUI.",
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Você precisa estar autenticado.",
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "Personagem não encontrado ou não pertence ao usuário.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Personagem não encontrado.",
                                },
                            },
                        },
                    },

                    "500": {
                        description:
                            "Erro ao gerar a imagem, incluindo possíveis falhas de comunicação com o ComfyUI.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error:
                                        "Não foi possível gerar a imagem. Verifique se o ComfyUI está aberto e funcionando.",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/characters/{id}/image": {
            post: {
                tags: ["Imagens"],
                summary: "Salvar imagem do personagem",
                description:
                    "Recebe uma imagem PNG de até 10 MB e associa ao personagem. " +
                    "Somente o criador pode realizar essa operação. " +
                    "O arquivo é salvo em public/uploads/characters com um nome UUID. " +
                    "A URL da imagem é armazenada no PostgreSQL. " +
                    "Quando uma nova imagem é salva, a imagem anterior é removida " +
                    "se estiver na pasta gerenciada por esta rota.",

                security: [{ sessionCookie: [] }],

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID do personagem que receberá a imagem.",
                        schema: {
                            type: "string",
                        },
                    },
                ],

                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["image"],
                                properties: {
                                    image: {
                                        type: "string",
                                        format: "binary",
                                        description:
                                            "Arquivo PNG válido, não vazio, com tamanho máximo de 10 MB.",
                                    },
                                },
                            },
                            encoding: {
                                image: {
                                    contentType: "image/png",
                                },
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description: "Imagem salva com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/SaveCharacterImageResponse",
                                },
                                example: {
                                    imageUrl:
                                        "/uploads/characters/550e8400-e29b-41d4-a716-446655440000.png",
                                    message: "Imagem salva com sucesso.",
                                },
                            },
                        },
                    },

                    "400": {
                        description:
                            "Imagem ausente, vazia, maior que 10 MB ou arquivo PNG inválido.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                examples: {
                                    missing: {
                                        summary: "Imagem não enviada",
                                        value: {
                                            error: "Nenhuma imagem foi enviada.",
                                        },
                                    },
                                    size: {
                                        summary: "Tamanho inválido",
                                        value: {
                                            error: "A imagem deve ter no máximo 10 MB.",
                                        },
                                    },
                                    format: {
                                        summary: "Formato inválido",
                                        value: {
                                            error: "Envie uma imagem PNG válida.",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Usuário não autenticado.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Você precisa estar autenticado.",
                                },
                            },
                        },
                    },

                    "404": {
                        description:
                            "Personagem não encontrado ou não pertence ao usuário.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Personagem não encontrado.",
                                },
                            },
                        },
                    },

                    "500": {
                        description:
                            "Erro interno ao processar, salvar ou associar a imagem.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                example: {
                                    error: "Não foi possível salvar a imagem.",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/health": {
            get: {
                tags: ["Saúde"],
                summary: "Verificar saúde da aplicação",
                description:
                    "Verifica se a aplicação consegue consultar o PostgreSQL " +
                    "utilizando Prisma. Retorna o estado da conexão e a " +
                    "quantidade de usuários cadastrados. " +
                    "Não exige autenticação e não verifica Ollama ou ComfyUI.",

                security: [],

                responses: {
                    "200": {
                        description:
                            "Consulta ao banco de dados realizada com sucesso.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/HealthSuccessResponse",
                                },
                                example: {
                                    status: "ok",
                                    database: "connected",
                                    users: 3,
                                },
                            },
                        },
                    },

                    "500": {
                        description:
                            "Não foi possível consultar o banco de dados.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/HealthErrorResponse",
                                },
                                example: {
                                    status: "error",
                                    message:
                                        "Não foi possível consultar o banco de dados.",
                                },
                            },
                        },
                    },
                },
            },
        },

    },
    components: {
        securitySchemes: {
            sessionCookie: {
                type: "apiKey",
                in: "cookie",
                name: "authjs.session-token",
                description:
                    "Sessão de autenticação gerenciada pelo Auth.js. O nome do cookie pode variar conforme a configuração e o ambiente. Em desenvolvimento, faça login normalmente na Nebula antes de testar rotas protegidas.",
            },
        },
        schemas: {
            ErrorResponse: {
                type: "object",
                required: ["error"],
                properties: {
                    error: {
                        type: "string",
                        example: "Não foi possível criar o personagem.",
                    },
                },
            },

            CreateCharacterRequest: {
                type: "object",
                required: [
                    "name",
                    "category",
                    "description",
                    "personality",
                    "scenario",
                    "greeting",
                ],
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 60,
                        example: "Lara Mendes",
                    },
                    category: {
                        type: "string",
                        minLength: 2,
                        maxLength: 40,
                        example: "Cotidiano",
                    },
                    description: {
                        type: "string",
                        minLength: 10,
                        maxLength: 1000,
                    },
                    personality: {
                        type: "string",
                        minLength: 10,
                        maxLength: 3000,
                    },
                    scenario: {
                        type: "string",
                        minLength: 10,
                        maxLength: 3000,
                    },
                    greeting: {
                        type: "string",
                        minLength: 2,
                        maxLength: 1000,
                    },
                },
            },

            CreatedCharacter: {
                type: "object",
                required: [
                    "id",
                    "name",
                    "category",
                    "description",
                    "personality",
                    "scenario",
                    "greeting",
                    "createdAt",
                ],
                properties: {
                    id: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    category: {
                        type: "string",
                    },
                    description: {
                        type: "string",
                    },
                    personality: {
                        type: "string",
                    },
                    scenario: {
                        type: "string",
                    },
                    greeting: {
                        type: "string",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            CharacterListItem: {
                type: "object",
                required: [
                    "id",
                    "name",
                    "category",
                    "description",
                    "createdAt",
                    "creator",
                ],
                properties: {
                    id: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    category: {
                        type: "string",
                    },
                    description: {
                        type: "string",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    creator: {
                        type: "object",
                        required: ["name"],
                        properties: {
                            name: {
                                type: "string",
                                nullable: true,
                            },
                        },
                    },
                },
            },

            CharacterDetail: {
                type: "object",
                required: [
                    "id",
                    "name",
                    "category",
                    "description",
                    "personality",
                    "scenario",
                    "greeting",
                    "imageUrl",
                ],
                properties: {
                    id: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    category: {
                        type: "string",
                    },
                    description: {
                        type: "string",
                    },
                    personality: {
                        type: "string",
                    },
                    scenario: {
                        type: "string",
                    },
                    greeting: {
                        type: "string",
                    },
                    imageUrl: {
                        type: "string",
                        nullable: true,
                        description:
                            "Caminho da imagem do personagem ou null quando não existe.",
                        example: "/uploads/characters/exemplo.png",
                    },
                },
            },

            UpdatedCharacter: {
                type: "object",
                required: [
                    "id",
                    "name",
                    "category",
                    "description",
                    "personality",
                    "scenario",
                    "greeting",
                    "updatedAt",
                ],
                properties: {
                    id: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    category: {
                        type: "string",
                    },
                    description: {
                        type: "string",
                    },
                    personality: {
                        type: "string",
                    },
                    scenario: {
                        type: "string",
                    },
                    greeting: {
                        type: "string",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            CreateConversationRequest: {
                type: "object",
                required: ["characterId"],
                properties: {
                    characterId: {
                        type: "string",
                        minLength: 1,
                        description: "ID do personagem com quem iniciar a conversa.",
                        example: "id-do-personagem",
                    },
                },
            },

            Conversation: {
                type: "object",
                required: [
                    "id",
                    "userId",
                    "characterId",
                    "title",
                    "createdAt",
                    "updatedAt",
                    "memory",
                    "memoryUpdatedAt",
                    "permanentMemory",
                    "memoryProcessingUntil",
                    "memoryProcessingToken",
                    "lastMessageAt",
                ],
                properties: {
                    id: {
                        type: "string",
                        example: "cm123abc",
                    },
                    userId: {
                        type: "string",
                    },
                    characterId: {
                        type: "string",
                    },
                    title: {
                        type: "string",
                        nullable: true,
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                    memory: {
                        type: "string",
                        description: "Memória narrativa da conversa.",
                        example: "",
                    },
                    memoryUpdatedAt: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                    permanentMemory: {
                        type: "string",
                        description: "Memória permanente da conversa.",
                        example: "",
                    },
                    memoryProcessingUntil: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                    memoryProcessingToken: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    lastMessageAt: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                },
            },

            ConversationResponse: {
                type: "object",
                required: ["conversation"],
                properties: {
                    conversation: {
                        $ref: "#/components/schemas/Conversation",
                    },
                },
            },

            ConversationCharacter: {
                type: "object",
                required: ["id", "name", "category"],
                properties: {
                    id: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    category: {
                        type: "string",
                    },
                },
            },

            ConversationMessage: {
                type: "object",
                required: [
                    "id",
                    "conversationId",
                    "role",
                    "content",
                    "createdAt",
                ],
                properties: {
                    id: {
                        type: "string",
                        example: "cm456def",
                    },
                    conversationId: {
                        type: "string",
                        example: "cm123abc",
                    },
                    role: {
                        type: "string",
                        enum: ["USER", "ASSISTANT"],
                        description: "Identifica quem enviou a mensagem.",
                        example: "ASSISTANT",
                    },
                    content: {
                        type: "string",
                        description: "Conteúdo textual da mensagem.",
                        example: "*Ela sorri.*\n\n— Oi! Tudo bem?",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            ConversationListItem: {
                allOf: [
                    {
                        $ref: "#/components/schemas/Conversation",
                    },
                    {
                        type: "object",
                        required: ["character", "messages"],
                        properties: {
                            character: {
                                $ref: "#/components/schemas/ConversationCharacter",
                            },
                            messages: {
                                type: "array",
                                description:
                                    "Contém no máximo uma mensagem: a mais recente da conversa.",
                                maxItems: 1,
                                items: {
                                    $ref: "#/components/schemas/ConversationMessage",
                                },
                            },
                        },
                    },
                ],
            },

            SendMessageRequest: {
                type: "object",
                required: ["content"],
                properties: {
                    content: {
                        type: "string",
                        minLength: 1,
                        maxLength: 10000,
                        description:
                            "Texto enviado pelo usuário. Espaços nas extremidades são removidos antes da validação.",
                        example: "Olá! Como você está?",
                    },
                },
            },

            OllamaErrorResponse: {
                type: "object",
                required: ["error", "message"],
                properties: {
                    error: {
                        type: "string",
                        example:
                            "Sua mensagem foi salva, mas o Ollama não respondeu.",
                    },
                    message: {
                        $ref: "#/components/schemas/ConversationMessage",
                    },
                },
            },

            MemoryFact: {
                type: "object",
                required: [
                    "id",
                    "conversationId",
                    "category",
                    "subject",
                    "content",
                    "originalText",
                    "contentHash",
                    "certainty",
                    "source",
                    "isEssential",
                    "createdAt",
                    "updatedAt",
                ],
                properties: {
                    id: { type: "string" },
                    conversationId: { type: "string" },
                    category: {
                        type: "string",
                        example: "general",
                    },
                    subject: {
                        type: "string",
                        example: "Usuário",
                    },
                    content: {
                        type: "string",
                        example: "O usuário gosta de café.",
                    },
                    originalText: {
                        type: "string",
                    },
                    contentHash: {
                        type: "string",
                        nullable: true,
                        maxLength: 64,
                    },
                    certainty: {
                        type: "string",
                        example: "confirmed",
                    },
                    source: {
                        type: "string",
                        example: "conversation",
                    },
                    isEssential: {
                        type: "boolean",
                        example: false,
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            MemoryVersion: {
                type: "object",
                required: [
                    "id",
                    "conversationId",
                    "permanentMemory",
                    "narrativeMemory",
                    "createdAt",
                ],
                properties: {
                    id: { type: "string" },
                    conversationId: { type: "string" },
                    permanentMemory: {
                        type: "string",
                    },
                    narrativeMemory: {
                        type: "string",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            SaveCharacterImageResponse: {
                type: "object",
                required: ["imageUrl", "message"],
                properties: {
                    imageUrl: {
                        type: "string",
                        description:
                            "Caminho público da imagem salva no servidor.",
                        example:
                            "/uploads/characters/550e8400-e29b-41d4-a716-446655440000.png",
                    },
                    message: {
                        type: "string",
                        example: "Imagem salva com sucesso.",
                    },
                },
            },

            ConversationMemoryResponse: {
                type: "object",
                required: [
                    "memory",
                    "permanentMemory",
                    "memoryUpdatedAt",
                    "characterName",
                ],
                properties: {
                    memory: {
                        type: "string",
                        description:
                            "Memória narrativa armazenada na conversa.",
                        example:
                            "O usuário chegou ao apartamento e conheceu Lara.",
                    },

                    permanentMemory: {
                        type: "string",
                        description:
                            "Memória permanente armazenada na conversa.",
                        example:
                            "O usuário divide apartamento com Lara.",
                    },

                    memoryUpdatedAt: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description:
                            "Data da última atualização da memória ou null quando não houver atualização registrada.",
                        example: "2026-10-15T10:30:00.000Z",
                    },

                    characterName: {
                        type: "string",
                        description:
                            "Nome do personagem associado à conversa.",
                        example: "Lara Mendes",
                    },
                },
            },

            MemoryHistoryResponse: {
                type: "object",
                required: ["versions"],
                properties: {
                    versions: {
                        type: "array",
                        description:
                            "Até 50 versões da memória, ordenadas da mais recente para a mais antiga.",
                        maxItems: 50,
                        items: {
                            $ref: "#/components/schemas/MemoryHistoryItem",
                        },
                    },
                },
            },

            MemoryHistoryItem: {
                type: "object",
                required: [
                    "id",
                    "permanentMemory",
                    "narrativeMemory",
                    "createdAt",
                ],
                properties: {
                    id: {
                        type: "string",
                        description: "Identificador da versão da memória.",
                    },
                    permanentMemory: {
                        type: "string",
                        description:
                            "Conteúdo da memória permanente registrado nesta versão.",
                    },
                    narrativeMemory: {
                        type: "string",
                        description:
                            "Conteúdo da memória narrativa registrado nesta versão.",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                        description: "Data e hora de criação da versão.",
                    },
                },
            },

            ConversationDetailResponse: {
                type: "object",
                required: ["conversation"],
                properties: {
                    conversation: {
                        $ref: "#/components/schemas/ConversationDetail",
                    },
                },
            },

            ConversationDetail: {
                type: "object",
                required: ["id", "character"],
                properties: {
                    id: {
                        type: "string",
                        description: "Identificador da conversa.",
                    },
                    character: {
                        type: "object",
                        required: ["id", "name", "category", "imageUrl"],
                        properties: {
                            id: {
                                type: "string",
                                description: "Identificador do personagem.",
                            },
                            name: {
                                type: "string",
                                example: "Lara Mendes",
                            },
                            category: {
                                type: "string",
                                example: "Cotidiano",
                            },
                            imageUrl: {
                                type: "string",
                                nullable: true,
                                description:
                                    "Caminho da imagem do personagem ou null quando não houver imagem.",
                                example: "/uploads/characters/exemplo.png",
                            },
                        },
                    },
                },
            },

            DeleteConversationResponse: {
                type: "object",
                required: ["success", "message"],
                properties: {
                    success: {
                        type: "boolean",
                        enum: [true],
                        example: true,
                    },
                    message: {
                        type: "string",
                        example: "Conversa excluída com sucesso.",
                    },
                },
            },

            HealthSuccessResponse: {
                type: "object",
                required: ["status", "database", "users"],
                properties: {
                    status: {
                        type: "string",
                        enum: ["ok"],
                        example: "ok",
                    },
                    database: {
                        type: "string",
                        enum: ["connected"],
                        example: "connected",
                    },
                    users: {
                        type: "integer",
                        minimum: 0,
                        description:
                            "Quantidade total de usuários cadastrados no banco de dados.",
                        example: 3,
                    },
                },
            },

            HealthErrorResponse: {
                type: "object",
                required: ["status", "message"],
                properties: {
                    status: {
                        type: "string",
                        enum: ["error"],
                        example: "error",
                    },
                    message: {
                        type: "string",
                        example:
                            "Não foi possível consultar o banco de dados.",
                    },
                },
            },

        },
    },
};
