# Workout Tracker

Plataforma web para quem treina em casa. O usuário cria uma conta, informa seu perfil (objetivo, nível, dias por semana, equipamentos disponíveis e dados físicos) e, no futuro, receberá sugestões de vídeos de treino do YouTube alinhadas ao seu perfil, avaliando cada sugestão com "gostei" ou "não gostei".

> Projeto em desenvolvimento. Veja o [status](#status) e o [roadmap](#roadmap).

## Funcionalidades

- Cadastro e autenticação de usuários com JWT
- CRUD de usuário (apenas dos próprios dados)
- Perfil de treino do usuário (em desenvolvimento)
- Sugestão de vídeos de treino com feedback do usuário (planejado)

## Tecnologias

Monorepo gerenciado com **pnpm**.

| Camada | Tecnologias |
|---|---|
| API (`apps/api`) | NestJS, TypeScript, TypeORM, PostgreSQL, JWT |
| Web (`apps/web`) | React, Vite, TypeScript, TanStack Router, React Query, Tailwind CSS |
| Testes | Vitest e Supertest (API) |
| Lint | Oxlint (API) e ESLint (web) |
| Infra local | Docker Compose (PostgreSQL 16) |

As versões exatas estão nos `package.json` de cada aplicação. A versão do Node.js ainda não está declarada no projeto.

## Estrutura

```
apps/
  api/            API NestJS (módulos, controllers, services, DTOs, entities, migrations)
    src/
    test/         testes e2e
  web/            Aplicação React
    src/routes/   rotas baseadas em arquivos (TanStack Router)
packages/         pacotes compartilhados (vazio por enquanto)
AGENTS.md         instruções para agentes de código (Codex)
```

Arquivos gerados que não devem ser editados à mão: `apps/api/dist` e `apps/web/src/routeTree.gen.ts`.

## Como rodar

### Pré-requisitos

- Node.js e pnpm
- Docker

### Passo a passo

1. Instale as dependências na raiz:
   ```bash
   pnpm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis do banco e o `JWT_SECRET`. Nunca faça commit do `.env`.
3. Suba o banco de dados:
   ```bash
   docker compose up -d db
   ```
4. Rode as migrations (o fluxo ainda precisa ser documentado aqui; veja o `AGENTS.md`).
5. Inicie a API e a aplicação web, cada uma em um terminal:
   ```bash
   pnpm --filter api run start:dev
   pnpm --filter web run dev
   ```

## Comandos úteis

| Objetivo | Comando |
|---|---|
| Build da API | `pnpm --filter api run build` |
| Build da web | `pnpm --filter web run build` |
| Testes unitários da API | `pnpm --filter api run test` |
| Testes e2e da API | `pnpm --filter api run test:e2e` |
| Cobertura da API | `pnpm --filter api run test:cov` |
| Um arquivo de teste | `pnpm --filter api exec vitest run src/user/user.service.spec.ts` |
| Lint da API | `pnpm --filter api run lint` |
| Lint da web | `pnpm --filter web run lint` |

## Decisões de projeto

- **Autorização somente do próprio usuário:** o id sempre vem do token JWT, nunca da URL ou do corpo da requisição (rotas no estilo `/users/me`).
- **Exclusão permanente (hard delete):** apagar a conta remove os dados do usuário, em linha com a LGPD.
- **Atualização parcial com `PATCH`** no perfil de acesso do usuário.
- **E-mail normalizado** (trim e minúsculas), com `409 Conflict` para duplicidade, inclusive quando o banco acusa violação de unicidade.
- **Perfil de treino separado do usuário:** tabela própria com relação 1:1 e `ON DELETE CASCADE`.
- **Campos do perfil como listas fixas** (objetivo, nível, dias por semana, equipamentos), para facilitar validação e buscas.

## Status

- [x] Cadastro, autenticação e CRUD de usuário
- [x] Testes unitários do `UserService`
- [ ] Perfil de treino (`/users/me/profile`)
- [ ] Interface web do perfil

## Roadmap

1. **Perfil de treino:** objetivo, nível, dias por semana, equipamentos, peso, altura e data de nascimento.
2. **Histórico de peso** para acompanhar a evolução.
3. **Sugestão de vídeos:** busca na API do YouTube a partir do perfil, com cache dos resultados.
4. **Feedback do usuário:** avaliação de cada sugestão, usada para melhorar as próximas.
5. **IA:** gerar consultas de busca melhores e ordenar os resultados reais (a IA não inventa vídeos, apenas ajuda a escolher entre resultados reais).
6. **Extração do treino a partir de um vídeo aprovado:** listar exercícios e séries para o aluno não precisar rever o vídeo.

## Aviso

As sugestões de treino não substituem a orientação de um profissional de educação física ou de saúde.

## Trabalhando com agentes de código

O arquivo [`AGENTS.md`](./AGENTS.md) descreve a estrutura, os comandos e as regras do projeto para agentes como o Codex. Mantenha-o curto e atualizado.
