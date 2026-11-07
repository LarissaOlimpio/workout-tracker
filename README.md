# Workout Tracker

Plataforma web para quem treina em casa. O usuário cria uma conta, informa seu perfil - parte em construção (objetivo, nível, dias por semana, equipamentos disponíveis e dados físicos ) e, no futuro, receberá sugestões de vídeos de treino do YouTube alinhadas ao seu perfil, avaliando cada sugestão com "gostei" ou "não gostei".

> Projeto em desenvolvimento. Veja o [status](#status) e o [roadmap](#roadmap).

## Funcionalidades

- Cadastro com confirmação de senha e login, com JWT guardado em cookie `HttpOnly`
- Logout e rotas protegidas na aplicação web (apenas login, cadastro e recuperação de senha são públicos)
- Recuperação de senha por e-mail, com link de uso único e validade curta
- CRUD de usuário (apenas dos próprios dados)
- Perfil de treino do usuário (API pronta, interface em desenvolvimento)
- Sugestão de vídeos de treino com feedback do usuário (planejado)

## Tecnologias

Monorepo gerenciado com **pnpm**.

| Camada           | Tecnologias                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| API (`apps/api`) | NestJS, TypeScript, TypeORM, PostgreSQL, JWT (cookie HttpOnly), Nodemailer                   |
| Web (`apps/web`) | React, Vite, TypeScript, TanStack Router, TanStack Query, React Hook Form, Zod, Tailwind CSS |
| Testes           | Vitest e Supertest (API)                                                                     |
| Lint             | Oxlint (API) e ESLint (web)                                                                  |
| Infra local      | Docker Compose (PostgreSQL 16 e Mailpit)                                                     |

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
2. Copie `.env.example` para `.env` e preencha as variáveis (veja a tabela abaixo). Nunca faça commit do `.env`.
3. Suba o banco de dados e o Mailpit:
   ```bash
   docker compose up -d db mailpit
   ```
4. Rode as migrations.
5. Inicie a API e a aplicação web, cada uma em um terminal:
   ```bash
   pnpm --filter api run start:dev
   pnpm --filter web run dev
   ```
6. Acesse `http://localhost:5173`.

### Variáveis de ambiente

| Variável                                                  | Descrição                                                                                                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão com o PostgreSQL                                                                                                                           |
| `JWT_SECRET`                                              | Segredo usado para assinar o JWT                                                                                                                   |
| `WEB_ORIGIN`                                              | Origem do front-end (ex.: `http://localhost:5173`, sem barra no final). Usada no CORS com credenciais e para montar o link de recuperação de senha |
| `SMTP_HOST`, `SMTP_PORT`                                  | Servidor SMTP (localmente, o Mailpit: `localhost` e `1025`)                                                                                        |
| `MAIL_FROM`                                               | Remetente dos e-mails                                                                                                                              |

> Acesse sempre o front por `localhost` (não misture com `127.0.0.1`) e reinicie a API após alterar o `.env`. Origens diferentes quebram o cookie e o CORS.

## Testando a recuperação de senha localmente

Em desenvolvimento, nenhum e-mail real é enviado. A API envia para o **Mailpit**, um servidor SMTP de teste com caixa de entrada na web.

1. Com o Mailpit rodando, peça a recuperação de senha na tela "Esqueceu sua senha?".
2. Abra `http://localhost:8025` e clique no e-mail recebido.
3. Abra o link do e-mail, defina a nova senha e faça login.

Em produção, basta trocar as variáveis `SMTP_*` e `MAIL_FROM` pelas de um provedor de e-mail real (com domínio próprio e registros SPF/DKIM configurados). O código não muda.

## Endpoints principais

| Método             | Rota                    | Acesso      | Descrição                                                   |
| ------------------ | ----------------------- | ----------- | ----------------------------------------------------------- |
| POST               | `/auth/login`           | público     | Autentica e grava o JWT no cookie                           |
| POST               | `/auth/logout`          | autenticado | Remove o cookie                                             |
| POST               | `/auth/forgot-password` | público     | Solicita o e-mail de recuperação (resposta sempre genérica) |
| POST               | `/auth/reset-password`  | público     | Redefine a senha com o token recebido por e-mail            |
| POST               | `/users`                | público     | Cria a conta                                                |
| GET, PATCH, DELETE | `/users/me`             | autenticado | Consulta, atualiza ou exclui o próprio usuário              |
| POST               | `/users/me/password`    | autenticado | Altera a senha                                              |
| GET, PUT           | `/users/me/profile`     | autenticado | Consulta ou substitui o perfil de treino                    |

## Comandos úteis

| Objetivo                | Comando                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| Build da API            | `pnpm --filter api run build`                                     |
| Build da web            | `pnpm --filter web run build`                                     |
| Testes unitários da API | `pnpm --filter api run test`                                      |
| Testes e2e da API       | `pnpm --filter api run test:e2e`                                  |
| Cobertura da API        | `pnpm --filter api run test:cov`                                  |
| Um arquivo de teste     | `pnpm --filter api exec vitest run src/user/user.service.spec.ts` |
| Lint da API             | `pnpm --filter api run lint`                                      |
| Lint da web             | `pnpm --filter web run lint`                                      |

## Decisões de projeto

- **Autorização somente do próprio usuário:** o id sempre vem do token JWT, nunca da URL ou do corpo da requisição (rotas no estilo `/users/me`).
- **JWT em cookie `HttpOnly`:** o token não fica acessível ao JavaScript, o que reduz o impacto de ataques XSS. O front envia as requisições com `credentials: "include"` e a API usa CORS com origem explícita e `credentials: true`.
- **Rotas protegidas no router:** um layout sem URL (`_auth`) verifica a sessão com TanStack Query no `beforeLoad` e redireciona para o login antes de renderizar a página, sem `useEffect`.
- **Mensagens que não revelam se o e-mail existe:** login e recuperação de senha respondem do mesmo jeito para e-mails cadastrados e não cadastrados.
- **Recuperação de senha segura:** o token é aleatório, de uso único e com validade curta, e apenas o hash dele é salvo no banco.
- **Confirmação de senha só no front-end:** o campo de confirmação é validado no cliente e não é enviado para a API.
- **Exclusão permanente (hard delete):** apagar a conta remove os dados do usuário, em linha com a LGPD.
- **Atualização parcial com `PATCH`** no perfil de acesso do usuário.
- **E-mail normalizado** (trim e minúsculas), com `409 Conflict` para duplicidade, inclusive quando o banco acusa violação de unicidade.
- **Perfil de treino separado do usuário:** tabela própria com relação 1:1 e `ON DELETE CASCADE`.
- **Campos do perfil como listas fixas** (objetivo, nível, dias por semana, equipamentos), para facilitar validação e buscas. O banco e a API guardam códigos em inglês (ex.: `lose_weight`) e o front traduz para exibir em português, o que facilita adicionar outros idiomas no futuro.

## Status

- [x] Cadastro, autenticação e CRUD de usuário
- [x] JWT em cookie HttpOnly, logout e rotas protegidas na web
- [x] Recuperação de senha por e-mail (testada localmente com Mailpit)
- [x] API do perfil de treino (`/users/me/profile`)
- [x] Testes unitários do `UserService` e do `UserProfileService`
- [ ] Interface web do perfil (em andamento)
- [ ] Testes do fluxo de autenticação e recuperação de senha

## Roadmap

1. **Perfil de treino:** objetivo, nível, dias por semana, equipamentos, peso, altura e data de nascimento (API pronta; interface em andamento).
2. **Histórico de peso** para acompanhar a evolução.
3. **Sugestão de vídeos:** busca na API do YouTube a partir do perfil, com cache dos resultados.
4. **Feedback do usuário:** avaliação de cada sugestão, usada para melhorar as próximas.
5. **IA:** gerar consultas de busca melhores e ordenar os resultados reais (a IA não inventa vídeos, apenas ajuda a escolher entre resultados reais).
6. **Extração do treino a partir de um vídeo aprovado:** listar exercícios e séries para o aluno não precisar rever o vídeo.
7. **Internacionalização:** opção de idioma na interface.

## Aviso

As sugestões de treino não substituem a orientação de um profissional de educação física ou de saúde.

## Trabalhando com agentes de código

O arquivo [`AGENTS.md`](./AGENTS.md) descreve a estrutura e as regras do projeto para agentes como o Codex. Mantenha-o curto e atualizado.
