# Schema do Lead — Prospect Master

## Interface `Lead`

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `id` | `string` (UUID) | ✅ | Identificador único do lead | `"a1b2c3d4-..."` |
| `nome` | `string` | ✅ | Nome da loja ou pessoa | `"Loja do Seu João"` |
| `plataforma` | `"instagram" \| "facebook" \| "google"` | ✅ | Onde o lead foi encontrado | `"instagram"` |
| `url` | `string` | ✅ | URL do perfil/página (chave de deduplicação) | `"https://instagram.com/lojadoseujoao"` |
| `cidade` | `string` | ✅ | Cidade do estabelecimento | `"Fortaleza"` |
| `estado` | `string` | ✅ | UF do estado | `"CE"` |
| `descricao` | `string` | ✅ | Bio, descrição ou snippet | `"Tudo por R$1,99!"` |
| `contato` | `string` | ❌ | Telefone ou e-mail | `"(85) 99999-1111"` |
| `status` | `"novo" \| "mensagem_gerada" \| "contatado"` | ✅ | Etapa do funil | `"novo"` |
| `mensagem` | `string` | ❌ | Mensagem gerada pelo Gemini | `"Olá João, vi sua loja..."` |
| `criadoEm` | `string` (ISO 8601) | ✅ | Data/hora de criação | `"2026-03-14T10:00:00.000Z"` |
| `contatadoEm` | `string` (ISO 8601) | ❌ | Data/hora do contato | `"2026-03-15T14:30:00.000Z"` |

## Interface `LeadsDatabase`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `leads` | `Lead[]` | Array com todos os leads |
| `atualizadoEm` | `string` (ISO 8601) | Última atualização do arquivo |
| `total` | `number` | Contagem total de leads |

## Valores válidos dos Enums

### `Plataforma`
| Valor | Descrição |
|-------|-----------|
| `"instagram"` | Perfil do Instagram |
| `"facebook"` | Página do Facebook |
| `"google"` | Resultado do Google Search |

### `StatusLead`
| Valor | Descrição |
|-------|-----------|
| `"novo"` | Lead recém-encontrado, sem mensagem |
| `"mensagem_gerada"` | Mensagem personalizada gerada pelo Gemini |
| `"contatado"` | Anderson já entrou em contato |
