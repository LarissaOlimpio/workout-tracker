# Workout Tracker

Plataforma web para quem treina em casa. O usuário cria uma conta, informa seu perfil (objetivo, nível, dias por semana, equipamentos disponíveis e dados físicos), acompanha a evolução de peso e medidas corporais em um dashboard e recebe sugestões de vídeos de treino alinhadas ao seu perfil, avaliando cada sugestão com "gostei" ou "não gostei". Por enquanto os vídeos vêm de um catálogo de exemplo; a busca no YouTube está planejada.

> Projeto em desenvolvimento. Veja o [status](#status) e o [roadmap](#roadmap).

## Funcionalidades

- Cadastro com confirmação de senha e login, com JWT guardado em cookie `HttpOnly`
- Logout e rotas protegidas na aplicação web (apenas login, cadastro e recuperação de senha são públicos)
- Recuperação de senha por e-mail, com link de uso único e validade curta
- Configurações da conta: editar nome, e-mail e senha, e excluir a conta (apenas dos próprios dados)
- Perfil de treino: objetivo, nível, dias por semana, equipamentos, data de nascimento, peso, altura, medidas corporais (peito, cintura e quadril) e meta de peso, estas últimas opcionais
- Resumo do perfil com IMC e vídeos recomendados, com avaliação "gostei" / "não gostei" por vídeo (catálogo de exemplo)
- Recomendações que consideram o perfil e as avaliações anteriores do usuário
- Dashboard de evolução: peso atual e variação, IMC, gráficos de peso e de medidas, histórico de medições e registro de novas medições
- Cabeçalho compartilhado em todas as páginas autenticadas, com menu de conta e logout

## Tecnologias

Monorepo gerenciado com **pnpm**.

| Camada           | Tecnologias                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| API (`apps/api`) | NestJS, TypeScript, TypeORM, PostgreSQL, JWT (cookie HttpOnly), Nodemailer                             |
| Web (`apps/web`) | React, Vite, TypeScript, TanStack Router, TanStack Query, React Hook Form, Zod, Tailwind CSS, Recharts |
| Testes           | Vitest e Supertest (API)                                                                               |
| Lint             | Oxlint (API) e ESLint (web)                                                                            |
| Infra local      | Docker Compose (PostgreSQL 16 e Mailpit)                                                               |

As versões exatas estão nos `package.json` de cada aplicação. A versão do Node.js ainda não está declarada no projeto.

## Estrutura

```
apps/
  api/              API NestJS (módulos, controllers, services, DTOs, entities, migrations)
    src/
      user/         dados do usuário (criação, edição, exclusão, senha)
        profile/    perfil de treino (controller, service, entity, DTOs e enums próprios)
      video/        catálogo de vídeos, recomendações e feedback (gostei / não gostei)
      measurement/  histórico de peso e medidas corporais
      dashboard/    dados agregados do dashboard de evolução
    test/           testes e2e
  web/              Aplicação React
    src/routes/     rotas baseadas em arquivos (TanStack Router)
packages/           pacotes compartilhados (vazio por enquanto)
AGENTS.md           instruções para agentes de código (Codex)
```

Arquivos gerados que não devem ser editados à mão: `apps/api/dist` e `apps/web/src/routeTree.gen.ts`.

### Páginas da aplicação web

| Rota                                   | Acesso      | Descrição                                                 |
| -------------------------------------- | ----------- | --------------------------------------------------------- |
| `/`                                    | autenticado | Dashboard de evolução (página inicial após o login)       |
| `/profile/setup`                       | autenticado | Cadastro e edição do perfil de treino                     |
| `/profile/summary`                     | autenticado | Resumo do perfil e vídeos recomendados com avaliação      |
| `/account`                             | autenticado | Configurações da conta (dados pessoais, senha e exclusão) |
| Login, cadastro e recuperação de senha | público     | Telas de acesso, sem o cabeçalho compartilhado            |

Todas as páginas autenticadas ficam sob o layout `_auth`, que verifica a sessão e renderiza o cabeçalho compartilhado.

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

Os vídeos de exemplo vêm de uma seed do próprio projeto, pois ainda não há integração com o YouTube.

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

| Método             | Rota                        | Acesso      | Descrição                                                                                |
| ------------------ | --------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| POST               | `/auth/login`               | público     | Autentica e grava o JWT no cookie                                                        |
| POST               | `/auth/logout`              | autenticado | Remove o cookie                                                                          |
| POST               | `/auth/forgot-password`     | público     | Solicita o e-mail de recuperação (resposta sempre genérica)                              |
| POST               | `/auth/reset-password`      | público     | Redefine a senha com o token recebido por e-mail                                         |
| POST               | `/users`                    | público     | Cria a conta                                                                             |
| GET, PATCH, DELETE | `/users/me`                 | autenticado | Consulta, atualiza ou exclui o próprio usuário                                           |
| POST               | `/users/me/password`        | autenticado | Altera a senha                                                                           |
| GET, PUT           | `/users/me/profile`         | autenticado | Consulta ou substitui o perfil de treino                                                 |
| GET                | `/users/me/recommendations` | autenticado | Lista os vídeos recomendados para o perfil, já com a avaliação do usuário (`myFeedback`) |
| PUT, DELETE        | `/videos/:id/feedback`      | autenticado | Define ("like" ou "dislike") ou remove a avaliação do usuário para um vídeo              |
| POST               | `/users/me/measurements`    | autenticado | Registra (ou atualiza, na mesma data) uma medição de peso e medidas                      |
| GET                | `/users/me/dashboard`       | autenticado | Dados do dashboard: peso, IMC, meta, séries dos gráficos e histórico de medições         |

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
- **JWT em cookie `HttpOnly`:** o token não fica acessível ao JavaScript, o que reduz o impacto de ataques XSS. O front envia as requisições com `credentials: "include"` e a API usa CORS com origem explícita e `credentials: true`. Como o front não consegue apagar esse cookie, o logout é uma chamada à API; ao excluir a conta, o front chama `DELETE /users/me` e depois o logout.
- **Rotas protegidas no router:** um layout sem URL (`_auth`) verifica a sessão com TanStack Query no `beforeLoad` e redireciona para o login antes de renderizar a página, sem `useEffect`. O mesmo layout renderiza o cabeçalho compartilhado, e as páginas internas renderizam só o conteúdo.
- **Mensagens que não revelam se o e-mail existe:** login e recuperação de senha respondem do mesmo jeito para e-mails cadastrados e não cadastrados.
- **Recuperação de senha segura:** o token é aleatório, de uso único e com validade curta, e apenas o hash dele é salvo no banco.
- **Confirmação de senha só no front-end:** o campo de confirmação é validado no cliente e não é enviado para a API.
- **Exclusão permanente (hard delete):** apagar a conta remove os dados do usuário, em linha com a LGPD. Todas as tabelas ligadas ao usuário (perfil, medições e avaliações de vídeos) usam `ON DELETE CASCADE`.
- **Atualização parcial com `PATCH`** no perfil de acesso do usuário.
- **E-mail normalizado** (trim e minúsculas), com `409 Conflict` para duplicidade, inclusive quando o banco acusa violação de unicidade.
- **Controllers separados por assunto:** o controller do usuário cuida apenas dos dados da conta; o perfil de treino tem controller próprio em `user/profile/`. As rotas continuam sob `/users/me`.
- **Perfil de treino separado do usuário:** tabela própria com relação 1:1 e `ON DELETE CASCADE`.
- **Campos do perfil como listas fixas** (objetivo, nível, dias por semana, equipamentos), para facilitar validação e buscas. O banco e a API guardam códigos em inglês (ex.: `lose_weight`) e o front traduz para exibir em português com um único arquivo de mapeamento, o que facilita adicionar outros idiomas no futuro.
- **Tipos do formulário separados dos tipos da API:** o formulário guarda texto (ex.: `"72,5"` e `dd/mm/aaaa`) e a conversão para número e data ISO acontece só na hora de enviar.
- **Medidas e meta de peso opcionais:** peito, cintura, quadril e meta de peso podem ficar em branco; o dashboard esconde o que não existir.
- **Perfil guarda o estado atual, medições guardam o histórico:** a tabela `body_measurements` tem uma linha por usuário e data. Registrar uma medição mais recente atualiza o perfil; salvar o perfil com valores diferentes da medição mais recente cria uma medição do dia (e a primeira medição é criada a partir do perfil). O dashboard usa a medição mais recente como "atual" e a mais antiga como "inicial".
- **Datas de medição:** o front envia a data no fuso local (`yyyy-mm-dd`) e a API aceita até um dia à frente do UTC por causa do fuso. As medições criadas automaticamente a partir do perfil usam a data UTC do servidor.
- **IMC calculado pela API no dashboard** (com a classificação em código) e traduzido pelo front; a tela de resumo do perfil calcula o IMC no próprio front.
- **Avaliação de vídeos:** uma avaliação por usuário e vídeo (único por usuário + vídeo). Mudar de "gostei" para "não gostei" é um upsert e remover a avaliação apaga a linha. Na tela, os dois checkboxes funcionam como opção única.
- **Recomendação de vídeos:** filtra por objetivo, nível e equipamentos do usuário, oculta os vídeos com "não gostei" e prioriza os com "gostei" e os de tags parecidas.
- **Frequência de treino no dashboard:** mostra apenas a meta (dias por semana do perfil) até existir registro de treinos.

## Status

- [x] Cadastro, autenticação e CRUD de usuário
- [x] JWT em cookie HttpOnly, logout e rotas protegidas na web
- [x] Recuperação de senha por e-mail (testada localmente com Mailpit)
- [x] Perfil de treino: API e interface web (cadastro e resumo)
- [x] Vídeos recomendados com avaliação "gostei" / "não gostei" (catálogo de exemplo)
- [x] Dashboard de evolução com histórico de medições
- [ ] Edição e exclusão do perfil de treino (hoje só `GET` e `PUT`)
- [ ] Conectar com API do Youtube, por enquanto esta com dados mockados
- [ ] Possibilitar a troca de idiomas e tema
- [ ] Integração da aplicação com IA

## Roadmap

1. **Sugestão de vídeos de verdade:** busca na API do YouTube a partir do perfil, com cache dos resultados, substituindo o catálogo de exemplo.
2. **Registro de treinos:** guardar as sessões realizadas para alimentar o card de frequência do dashboard.
3. **Feedback mais inteligente:** hoje as avaliações filtram e ordenam por tags; evoluir para considerar canal, duração e histórico.
4. **IA:** gerar consultas de busca melhores e ordenar os resultados reais (a IA não inventa vídeos, apenas ajuda a escolher entre resultados reais).
5. **Extração do treino a partir de um vídeo aprovado:** listar exercícios e séries para o aluno não precisar rever o vídeo.
6. **Internacionalização:** opção de idioma na interface.
7. **Foto de perfil:** hoje o avatar usa as iniciais do usuário.

## Aviso

As sugestões de treino não substituem a orientação de um profissional de educação física ou de saúde.

## Trabalhando com agentes de código

O arquivo [`AGENTS.md`](./AGENTS.md) descreve a estrutura e as regras do projeto para agentes como o Codex. Mantenha-o curto e atualizado.
