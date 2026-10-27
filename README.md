# TechX Todo List — Backend

API REST em NestJS e TypeScript responsável por autenticação, sessão JWT e persistência de tarefas em PostgreSQL. As operações sobre tarefas são vinculadas ao usuário autenticado, evitando acesso cruzado entre contas.

## Sumário

- [Recursos](#recursos)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e execução](#configuração-e-execução)
- [Banco de dados e Prisma](#banco-de-dados-e-prisma)
- [Autenticação e segurança](#autenticação-e-segurança)
- [Endpoints](#endpoints)
- [Exemplos de requisições](#exemplos-de-requisições)
- [Scripts disponíveis](#scripts-disponíveis)
- [Erros e solução de problemas](#erros-e-solução-de-problemas)

## Recursos

- cadastro, login, consulta da sessão atual e logout;
- hash de senha com bcrypt e custo 12;
- autenticação JWT por cookie HTTP-only ou cabeçalho Bearer;
- criação, consulta, atualização, conclusão e exclusão de tarefas;
- validação global dos DTOs;
- isolamento das tarefas pelo `userId` autenticado;
- filtro HTTP para respostas de erro consistentes;
- CORS configurável por variável de ambiente.

## Tecnologias

| Tecnologia | Versão declarada | Finalidade |
|---|---:|---|
| NestJS | `^12.2.0` | Controllers, módulos, serviços, guards e aplicação HTTP |
| TypeScript | `~6.0.3` | Implementação da API e tipagem de DTOs/serviços |
| Prisma ORM PostgreSQL | `8.0.0-rc.20` | Conexão e operações PostgreSQL |
| Prisma CLI | `8.0.0-rc.27` | Migrations, inspeção de banco e contrato |
| PostgreSQL | conforme a conexão | Persistência da aplicação |
| `@nestjs/jwt` | `^12.0.3` | Criação e validação de tokens JWT |
| bcrypt | `^6.0.0` | Hash seguro de senha |
| class-validator | `^0.15.1` | Validação dos corpos HTTP |

## Arquitetura

A API está organizada por módulos, com separação entre apresentação, aplicação, repositórios e infraestrutura:

- **Apresentação:** controllers, DTOs, decorators e guard em `auth/presentation` e `tasks/presentation`.
- **Aplicação:** `AuthService` e `TasksService` coordenam autenticação e tarefas.
- **Persistência:** `UsersRepository` e `TasksRepository` realizam acesso ao Prisma.
- **Infraestrutura:** `PrismaService`, `src/prisma/db.ts` e o contrato Prisma centralizam a conexão.
- **Segurança:** `JwtAuthGuard` valida sessão e `HttpExceptionFilter` padroniza erros.

Essa separação corresponde à estrutura implementada; não é necessário apresentá-la como Clean Architecture completa.

## Estrutura do projeto

```text
src/
├── main.ts                       # Bootstrap, CORS, validação e filtro HTTP
├── app.module.ts                 # Composição dos módulos
├── app.controller.ts             # Resposta da rota raiz
├── prisma.service.ts             # Conexão compartilhada
├── auth/
│   ├── auth.controller.ts        # Registro, login, sessão e logout
│   ├── auth.service.ts           # Hash, JWT e dados públicos
│   ├── auth.module.ts            # Configuração JWT
│   └── presentation/             # DTOs, guard e usuário atual
├── tasks/
│   ├── tasks.controller.ts       # Rotas CRUD protegidas
│   ├── tasks.service.ts          # Orquestração de tarefas
│   ├── application/              # Repositório de persistência
│   └── presentation/             # DTOs de entrada
├── users/
│   └── application/              # Repositório de usuários
├── common/
│   └── http-exception.filter.ts  # Formato global dos erros
└── prisma/
    ├── contract.prisma           # Schema do banco
    ├── contract.json/d.ts        # Contrato gerado
    ├── db.ts                     # Conexão PostgreSQL
    └── seed.ts, users.ts         # Utilitários de dados
```

## Pré-requisitos

- Node.js compatível com o campo `engines`: `^22.18.0`, `^24.11.0` ou `>=26.0.0`;
- npm `11.6.2`, declarado como package manager;
- PostgreSQL acessível pela URL definida em `DATABASE_URL`.

Não há scripts de teste ou lint configurados no `package.json`.

## Configuração e execução

### Variáveis de ambiente

```bash
cd backend-tech-x
cp .env.example .env
npm install
```

No PowerShell:

```powershell
Copy-Item .env.example .env
npm install
```

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/techx"
PORT="3000"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="24h"
CORS_ORIGINS="http://localhost:4200"
NODE_ENV="development"
```

| Variável | Uso confirmado |
|---|---|
| `DATABASE_URL` | String PostgreSQL usada pelo Prisma ORM |
| `PORT` | Porta HTTP; padrão `3000` se ausente ou inválida |
| `JWT_SECRET` | Segredo do JWT; obrigatório em produção |
| `JWT_EXPIRES_IN` | Expiração do JWT; padrão `24h` |
| `CORS_ORIGINS` | Origens separadas por vírgula; padrão `http://localhost:4200` |
| `NODE_ENV` | Ativa cookie `secure` e `sameSite=none` em `production` |

Não adicione `.env` ou segredos reais ao controle de versão.

### Desenvolvimento

```bash
npm run dev
```

Por padrão, a API inicia em `http://localhost:3000`.

### Build e produção

```bash
npm run build
npm start
```

`npm run build` gera `dist/server.mjs` com tsdown. Em produção configure banco, JWT, CORS e `NODE_ENV=production`.

## Banco de dados e Prisma

O schema efetivo está em [`src/prisma/contract.prisma`](src/prisma/contract.prisma):

- `User`: `id`, `email` único, senha, nome, username, posts, tarefas e timestamps;
- `Task`: `id`, título, descrição opcional, conclusão, proprietário e timestamps;
- `Post`: `id`, título, conteúdo opcional, autor e timestamps.

O modelo atual não possui endpoints REST para `Post`. Excluir um usuário remove suas tarefas ou posts por cascata.

```bash
npm run migration:plan
npm run migration:show
npm run migration:status
npm run migrate
npm run db:verify
```

Fluxo recomendado: planeje, confirme o status, aplique e verifique.

```bash
npm run migration:plan
npm run migration:status
npm run migrate
npm run db:verify
```

Não edite nem apague migrations manualmente. Migrations existentes ficam em `migrations/app/`.

## Autenticação e segurança

- registro e login só configuram o cookie após concluir a operação;
- senha é hashada com bcrypt usando custo 12;
- o JWT contém `sub`, `email` e `name`, com expiração definida por `JWT_EXPIRES_IN`;
- o cookie `access_token` é HTTP-only, usa `path=/` e expira em 24 horas;
- em produção usa `secure: true` e `sameSite: none`; fora de produção usa `secure: false` e `sameSite: lax`;
- o guard aceita o cookie ou `Authorization: Bearer <token>`;
- registro/login retornam dados públicos, sem senha ou token no JSON;
- logout limpa o cookie.

### Validação

- cadastro `name`: string não vazia, máximo 120 caracteres;
- `email`: válido, máximo 254 caracteres;
- senha de cadastro: mínimo 8 e máximo 72 caracteres;
- senha de login: mínimo 1 e máximo 72 caracteres;
- `whitelist` e `forbidNonWhitelisted` rejeitam campos não declarados;
- e-mail é normalizado com `trim()` e caixa baixa.

Todas as rotas de tarefas usam `JwtAuthGuard`. Consultas, atualização, conclusão e exclusão incluem simultaneamente `userId` e `id`, impedindo acesso às tarefas de outra conta.

## Endpoints

| Método | Rota | Autenticação | Finalidade |
|---|---|---|---|
| `GET` | `/` | Não | Resposta básica da API |
| `POST` | `/auth/register` | Não | Cadastrar usuário, definir cookie e retornar usuário público |
| `POST` | `/auth/login` | Não | Validar credenciais, definir cookie e retornar usuário público |
| `GET` | `/auth/me` | Sim | Retornar usuário da sessão atual |
| `POST` | `/auth/logout` | Não protegida por guard | Limpar o cookie de sessão |
| `GET` | `/tasks` | Sim | Listar tarefas do usuário autenticado |
| `GET` | `/tasks/:id` | Sim | Consultar tarefa própria por ID inteiro |
| `POST` | `/tasks` | Sim | Criar tarefa com título e descrição opcional |
| `PATCH` | `/tasks/:id` | Sim | Atualizar título e/ou descrição |
| `PATCH` | `/tasks/:id/completion` | Sim | Alterar o booleano `completed` |
| `DELETE` | `/tasks/:id` | Sim | Excluir tarefa própria; status 204 sem corpo |

## Exemplos de requisições

### Cadastro

```bash
curl -i -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@techx.com","password":"senha123"}' \
  http://localhost:3000/auth/register
```

```json
{
  "user": {
    "id": "1",
    "email": "maria@techx.com",
    "name": "Maria Silva",
    "createdAt": "2026-10-27T12:00:00.000Z"
  }
}
```

A resposta não contém o JWT. O token é definido como cookie HTTP-only `access_token`.

### Login

```bash
curl -i -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@techx.com","password":"senha123"}' \
  http://localhost:3000/auth/login
```

```json
{
  "user": {
    "id": "1",
    "email": "maria@techx.com",
    "name": "Maria Silva",
    "createdAt": "2026-10-27T12:00:00.000Z"
  }
}
```

### Sessão atual

```bash
curl -b cookies.txt http://localhost:3000/auth/me
```

### Criar tarefa

```bash
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Preparar apresentação","description":"Revisar os detalhes finais"}' \
  http://localhost:3000/tasks
```

`title` é obrigatório e suporta até 200 caracteres. `description` é opcional e suporta até 5000 caracteres.

```json
{
  "id": "1",
  "title": "Preparar apresentação",
  "description": "Revisar os detalhes finais",
  "completed": false,
  "userId": "1",
  "createdAt": "2026-10-27T12:00:00.000Z",
  "updatedAt": "2026-10-27T12:00:00.000Z"
}
```

### Atualizar conclusão

```bash
curl -b cookies.txt \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' \
  http://localhost:3000/tasks/1/completion
```

### Excluir tarefa

```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/tasks/1
```

## Scripts disponíveis

| Script | Comando real | Finalidade |
|---|---|---|
| Desenvolvimento | `npm run dev` | `tsx watch src/main.ts` |
| Build | `npm run build` | Gera bundle com tsdown |
| Produção | `npm start` | Executa `dist/server.mjs` |
| Migration | `npm run migrate` | Aplica migrations Prisma |
| Plano | `npm run migration:plan` | Planeja alterações de schema |
| Status | `npm run migration:status` | Consulta migrations |
| Detalhes | `npm run migration:show` | Exibe migration registrada |
| Banco | `npm run db:init`, `db:update`, `db:verify` | Inicializa, atualiza ou verifica banco |
| Contrato | `npm run contract:emit` | Emite o contrato Prisma |
| Composer | `npm run dev:composer`, `composer:deploy`, `deploy` | Build/composição e deploy via Prisma Composer |

Não existem scripts `test` ou `lint` configurados.

## Erros e solução de problemas

O filtro global responde com:

```json
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "path": "/tasks",
  "timestamp": "2026-10-27T12:00:00.000Z"
}
```

Mensagens de validação podem ser uma lista; o filtro a atribui ao campo `message`.

| Código | Situação observada |
|---|---|
| 400 | DTO inválido ou campo não declarado |
| 401 | Cookie/Bearer ausente ou inválido, credencial incorreta ou usuário não encontrado |
| 404 | Tarefa não encontrada no escopo do usuário autenticado |
| 409 | E-mail já registrado |
| 500 | Erro interno não tratado |

### Banco não conecta

Confirme `DATABASE_URL`, disponibilidade do PostgreSQL e reinicie a API após alterar `.env`.

### JWT_SECRET em produção

Defina um segredo forte. O bootstrap falha em produção quando `JWT_SECRET` está ausente ou continua como `replace-with-a-long-random-secret`.

### Cookie não é enviado pelo frontend

Confira `CORS_ORIGINS` e `NODE_ENV`. Em produção, frontend e API precisam ser compatíveis com cookie `secure`/`sameSite=none`; o navegador também deve aceitar credenciais.

### Migration falha

Planeje, consulte o status e revise migrations existentes antes de aplicar alterações.

```bash
npm run migration:plan
npm run migration:status
npm run migrate
npm run db:verify
```
