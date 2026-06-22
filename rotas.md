# Rotas e Retornos da API

Este documento foi gerado a partir dos recursos JAX-RS do projeto e dos Exception Mappers globais.

## Padrão de erros da API

Quando ocorre erro de domínio/validação, a API retorna um objeto no formato:

- `message`: mensagem principal
- `code`: código interno do erro
- `timestamp`: data/hora do erro
- `details`: lista opcional com detalhes

Códigos de erro mapeados globalmente:

- `400 Bad Request`
  - `VALIDATION_ERROR` (ConstraintViolationException)
  - `BUSINESS_RULE_VIOLATION` (BusinessRuleException)
- `404 Not Found`
  - `ENTITY_NOT_FOUND` (EntityNotFoundException)
- `500 Internal Server Error`
  - `DOMAIN_ERROR` (DomainException não mapeada especificamente)
- `401 Unauthorized`
  - Token ausente/inválido em rotas protegidas
- `403 Forbidden`
  - Token válido, mas sem role/permissão necessária

## Autenticação

- Rotas com `@RolesAllowed` exigem `Authorization: Bearer <token>`.
- Rotas com `@PermitAll` são públicas.

## Enum obrigatório para série (`anoEscolar`)

Nas rotas que recebem o campo `anoEscolar`, o valor deve ser enviado como **ENUM** (não texto livre como "3º Ano").

Valores aceitos:

- `EF_1`
- `EF_2`
- `EF_3`
- `EF_4`
- `EF_5`
- `EF_6`
- `EF_7`
- `EF_8`
- `EF_9`
- `EM_1`
- `EM_2`
- `EM_3`

---

## Auth

| Método | Rota | Acesso | Sucesso | Possíveis retornos |
|---|---|---|---|---|
| POST | /auth/login | Público | `200 OK` com `LoginResponse` | `400` (validação/regra de negócio), `500` |

---

## Usuários

| Método | Rota | Acesso | Sucesso | Possíveis retornos |
|---|---|---|---|---|
| GET | /usuarios?tipo=&page=&size= | `ADMIN`, `PROFESSOR` | `200 OK` com `PageResponse<UsuarioResponse>` | `400`, `401`, `403`, `500` |
| POST | /usuarios | Público (`@PermitAll`) | `201 Created` sem body | `400`, `404` (token de convite inválido/inexistente), `500` |
| PATCH | /usuarios/{id} | `ADMIN`, `PROFESSOR`, `ALUNO` | `200 OK` com `UsuarioResponse` | `400`, `401`, `403`, `404`, `500` |
| PATCH | /usuarios/{id}/senha | `ADMIN`, `PROFESSOR`, `ALUNO` | `204 No Content` (quando usuário altera a própria senha) ou `200 OK` com `ResetSenhaResponse` (quando reseta senha de outro usuário) | `400`, `401`, `403`, `404`, `500` |
| POST | /usuarios/{id}/senha/reset | `ADMIN`, `PROFESSOR` | `200 OK` com `ResetSenhaResponse` | `400`, `401`, `403`, `404`, `500` |
| DELETE | /usuarios/{id} | `ADMIN`, `PROFESSOR` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |

---

## Convites

| Método | Rota | Acesso | Sucesso | Possíveis retornos |
|---|---|---|---|---|
| GET | /convites?status=&page=&size= | `ADMIN`, `PROFESSOR` | `200 OK` com `PageResponse<ConviteResponse>` | `400`, `401`, `403`, `500` |
| DELETE | /convites/{id} | `ADMIN`, `PROFESSOR` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |
| POST | /convites/alunos | `PROFESSOR`, `ADMIN` | `201 Created` com `{ "token": "..." }` | `400`, `401`, `403`, `500` |
| POST | /convites/professores | `ADMIN` | `201 Created` com `{ "token": "..." }` | `400`, `401`, `403`, `500` |

---

## Eventos

| Método | Rota | Acesso | Sucesso | Possíveis retornos |
|---|---|---|---|---|
| GET | /eventos?page=&size= | Público | `200 OK` com `PageResponse<EventoResponse>` | `400`, `500` |
| GET | /eventos/{id} | Público | `200 OK` com `EventoResponse` | `404`, `500` |
| POST | /eventos | `ADMIN` (multipart/form-data) | `201 Created` com `EventoResponse` | `400`, `401`, `403`, `500` |
| PUT | /eventos/{id} | `ADMIN` (application/json) | `200 OK` com `EventoResponse` | `400`, `401`, `403`, `404`, `500` |
| PUT | /eventos/{id}/capa | `ADMIN` (multipart/form-data) | `200 OK` com `EventoResponse` | `400`, `401`, `403`, `404`, `500` |
| DELETE | /eventos/{id}/capa | `ADMIN` | `200 OK` com `EventoResponse` | `400`, `401`, `403`, `404`, `500` |
| DELETE | /eventos/{id} | `ADMIN` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |

---

## Projetos

| Método | Rota | Acesso | Sucesso | Possíveis retornos |
|---|---|---|---|---|
| POST | /projetos | `ADMIN`, `PROFESSOR` | `201 Created` com `ProjetoResponse` | `400`, `401`, `403`, `404`, `500` |
| GET | /projetos | `ADMIN`, `PROFESSOR` | `200 OK` com `List<ProjetoResponse>` | `401`, `403`, `500` |
| GET | /projetos/{id} | Público | `200 OK` com `ProjetoResponse` | `404`, `500` |
| GET | /projetos/evento/{eventoId} | Público | `200 OK` com `List<ProjetoResponse>` | `400`, `404`, `500` |
| PUT | /projetos/{id} | `PROFESSOR`, `ADMIN` | `200 OK` com `ProjetoResponse` | `400`, `401`, `403`, `404`, `500` |
| PATCH | /projetos/{id}/materiais-descricao | Autenticado (token JWT) | `200 OK` com `ProjetoResponse` | `400`, `401`, `403`, `404`, `500` |
| DELETE | /projetos/{id} | `PROFESSOR`, `ADMIN` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |
| PUT | /projetos/{id}/capa | `ADMIN`, `PROFESSOR`, `ALUNO` (multipart/form-data) | `200 OK` com `ProjetoResponse` | `400`, `401`, `403`, `404`, `500` |
| DELETE | /projetos/{id}/capa | `ADMIN`, `PROFESSOR`, `ALUNO` | `200 OK` com `ProjetoResponse` | `400`, `401`, `403`, `404`, `500` |
| POST | /projetos/{id}/integrantes | `PROFESSOR`, `ADMIN` | `201 Created` com `IntegranteResponse` | `400`, `401`, `403`, `404`, `500` |
| GET | /projetos/{id}/integrantes | Público | `200 OK` com `List<IntegranteResponse>` | `404`, `500` |
| DELETE | /projetos/{id}/integrantes/{integranteId} | `ADMIN`, `PROFESSOR`, `ALUNO` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |
| POST | /projetos/{id}/comentarios | `ADMIN`, `PROFESSOR`, `ALUNO` | `201 Created` com `ComentarioResponse` | `400`, `401`, `403`, `404`, `500` |
| GET | /projetos/{id}/comentarios | Público | `200 OK` com `List<ComentarioResponse>` | `404`, `500` |
| DELETE | /projetos/{id}/comentarios/{comentarioId} | `ADMIN`, `PROFESSOR`, `ALUNO` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |
| POST | /projetos/{id}/registros-diarios | `ALUNO` (multipart/form-data) | `201 Created` com `RegistroDiarioResponse` | `400`, `401`, `403`, `404`, `500` |
| GET | /projetos/{id}/registros-diarios | `ADMIN`, `PROFESSOR`, `ALUNO` | `200 OK` com `List<RegistroDiarioResponse>` | `400`, `401`, `403`, `404`, `500` |
| PUT | /projetos/{id}/registros-diarios/{registroId} | `ALUNO` | `200 OK` com `RegistroDiarioResponse` | `400`, `401`, `403`, `404`, `500` |
| POST | /projetos/{id}/registros-diarios/{registroId}/arquivos | `ALUNO` (multipart/form-data) | `200 OK` com `RegistroDiarioResponse` | `400`, `401`, `403`, `404`, `500` |
| DELETE | /projetos/{id}/registros-diarios/{registroId}/arquivos/{chave} | `ALUNO` | `200 OK` com `RegistroDiarioResponse` | `400`, `401`, `403`, `404`, `500` |

---

## Observações importantes

- Onde o código não define explicitamente um status de erro no método, os erros listados consideram:
  - Exception Mappers globais já implementados.
  - Regras de autenticação/autorização do Quarkus/JWT.
- Algumas rotas públicas podem retornar `401/403` se, no futuro, forem protegidas por configuração global.
- Para referência oficial em runtime, consulte também o Swagger UI em `/q/swagger-ui`.

---

## Exemplos fictícios de retorno por rota

### Erro padrão (base para front)

Use este formato para mapear toasts, mensagens de formulário e tratamento global de erro:

```json
{
  "message": "Mensagem de erro",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-06-21T14:10:33",
  "details": [
    "campo: descricao do erro"
  ]
}
```

### Auth

#### POST /auth/login
Sucesso `200 OK`:
```json
{
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": 12,
    "nome": "Ana Souza",
    "email": "ana@escola.com",
    "tipo": "PROFESSOR"
  }
}
```
Erro `400`:
```json
{
  "message": "Credenciais invalidas.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

### Usuarios

#### GET /usuarios?tipo=ALUNO&page=0&size=20
Sucesso `200 OK`:
```json
{
  "content": [
    {
      "id": 101,
      "nome": "Lucas Lima",
      "email": "lucas@escola.com",
      "tipo": "ALUNO"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 1
}
```
Erro `403`:
```json
{
  "message": "Acesso negado.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /usuarios
Sucesso `201 Created`:
```json
{}
```
Erro `404`:
```json
{
  "message": "Convite nao encontrado ou expirado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PATCH /usuarios/{id}
Exemplo de request (quando `tipo=ALUNO`):
```json
{
  "nome": "Lucas Lima Atualizado",
  "email": "lucas.novo@escola.com",
  "matricula": "2024001",
  "anoEscolar": "EM_1"
}
```

Sucesso `200 OK`:
```json
{
  "id": 101,
  "nome": "Lucas Lima Atualizado",
  "email": "lucas.novo@escola.com",
  "tipo": "ALUNO",
  "matricula": "2024001"
}
```
Erro `400`:
```json
{
  "message": "Erro de validacao nos campos enviados.",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-06-21T14:10:33",
  "details": [
    "email: deve ser um email valido"
  ]
}
```

#### PATCH /usuarios/{id}/senha
Sucesso proprio usuario `204 No Content`:
```json
{}
```
Sucesso reset por terceiro `200 OK`:
```json
{
  "novaSenha": "Tmp@12345"
}
```
Erro `400`:
```json
{
  "message": "Senha atual incorreta.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /usuarios/{id}/senha/reset
Sucesso `200 OK`:
```json
{
  "novaSenha": "Tmp@98765"
}
```
Erro `403`:
```json
{
  "message": "Sem permissao para resetar senha deste usuario.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /usuarios/{id}
Sucesso `204 No Content`:
```json
{}
```
Erro `404`:
```json
{
  "message": "Usuario nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

### Convites

#### GET /convites?status=PENDENTE&page=0&size=20
Sucesso `200 OK`:
```json
{
  "content": [
    {
      "id": 55,
      "nomeConvidado": "Marina Alves",
      "status": "PENDENTE",
      "token": "f4d7b2...",
      "expiraEm": "2026-07-01T23:59:59"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 1
}
```
Erro `401`:
```json
{
  "message": "Token JWT ausente ou invalido.",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /convites/{id}
Sucesso `204 No Content`:
```json
{}
```
Erro `404`:
```json
{
  "message": "Convite nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /convites/alunos
Exemplo de request:
```json
{
  "nome": "Marina Alves",
  "matricula": "2024001",
  "anoEscolar": "EM_1"
}
```

Sucesso `201 Created`:
```json
{
  "token": "8b43f4f5-cc0f-4efb-90e5-b7d1f13d3f93"
}
```
Erro `400`:
```json
{
  "message": "Matricula ja cadastrada.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /convites/professores
Sucesso `201 Created`:
```json
{
  "token": "0e7321fb-c1ea-46f7-bf3b-5f1fcd2250ab"
}
```
Erro `403`:
```json
{
  "message": "Somente ADMIN pode gerar convite de professor.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

### Eventos

#### GET /eventos?page=0&size=20
Sucesso `200 OK`:
```json
{
  "content": [
    {
      "id": 10,
      "titulo": "Feira de Ciencias 2026",
      "descricao": "Edicao anual da escola",
      "dataInicio": "2026-09-01",
      "dataFim": "2026-09-20",
      "capaUrl": "https://cdn.exemplo.com/events/10/capa.jpg"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 1
}
```
Erro `500`:
```json
{
  "message": "Erro interno ao listar eventos.",
  "code": "DOMAIN_ERROR",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### GET /eventos/{id}
Sucesso `200 OK`:
```json
{
  "id": 10,
  "titulo": "Feira de Ciencias 2026",
  "descricao": "Edicao anual da escola",
  "dataInicio": "2026-09-01",
  "dataFim": "2026-09-20",
  "capaUrl": "https://cdn.exemplo.com/events/10/capa.jpg"
}
```
Erro `404`:
```json
{
  "message": "Evento nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /eventos
Sucesso `201 Created`:
```json
{
  "id": 11,
  "titulo": "Feira de Ciencias 2027",
  "descricao": "Nova edicao",
  "dataInicio": "2027-09-01",
  "dataFim": "2027-09-20",
  "capaUrl": "https://cdn.exemplo.com/events/11/capa.jpg"
}
```
Erro `400`:
```json
{
  "message": "O arquivo da capa e obrigatorio.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PUT /eventos/{id}
Sucesso `200 OK`:
```json
{
  "id": 10,
  "titulo": "Feira de Ciencias 2026 - Atualizada",
  "descricao": "Descricao atualizada",
  "dataInicio": "2026-09-05",
  "dataFim": "2026-09-25",
  "capaUrl": "https://cdn.exemplo.com/events/10/capa.jpg"
}
```
Erro `403`:
```json
{
  "message": "Usuario sem permissao para atualizar evento.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PUT /eventos/{id}/capa
Sucesso `200 OK`:
```json
{
  "id": 10,
  "titulo": "Feira de Ciencias 2026",
  "capaUrl": "https://cdn.exemplo.com/events/10/capa-nova.jpg"
}
```
Erro `400`:
```json
{
  "message": "Falha ao processar o arquivo da capa.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /eventos/{id}/capa
Sucesso `200 OK`:
```json
{
  "id": 10,
  "titulo": "Feira de Ciencias 2026",
  "capaUrl": null
}
```
Erro `404`:
```json
{
  "message": "Evento nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /eventos/{id}
Sucesso `204 No Content`:
```json
{}
```
Erro `404`:
```json
{
  "message": "Evento nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

### Projetos

#### GET /projetos
Sucesso `200 OK`:
```json
[
  {
    "id": 200,
    "eventoId": 10,
    "titulo": "Detector de pH com Arduino",
    "descricao": "Projeto de quimica aplicada",
    "status": "EM_ANDAMENTO"
  }
]
```
Erro `403`:
```json
{
  "message": "Acesso negado.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /projetos
Sucesso `201 Created`:
```json
{
  "id": 200,
  "eventoId": 10,
  "titulo": "Detector de pH com Arduino",
  "descricao": "Projeto de quimica aplicada",
  "status": "EM_ANDAMENTO",
  "capaUrl": null
}
```
Erro `404`:
```json
{
  "message": "Evento informado nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### GET /projetos/{id}
Sucesso `200 OK`:
```json
{
  "id": 200,
  "eventoId": 10,
  "titulo": "Detector de pH com Arduino",
  "descricao": "Projeto de quimica aplicada",
  "status": "EM_ANDAMENTO",
  "materiais": ["Arduino", "Sensor pH"]
}
```
Erro `404`:
```json
{
  "message": "Projeto nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### GET /projetos/evento/{eventoId}
Sucesso `200 OK`:
```json
[
  {
    "id": 200,
    "eventoId": 10,
    "titulo": "Detector de pH com Arduino",
    "status": "EM_ANDAMENTO"
  }
]
```
Erro `404`:
```json
{
  "message": "Evento nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PUT /projetos/{id}
Sucesso `200 OK`:
```json
{
  "id": 200,
  "titulo": "Detector de pH com Arduino - v2",
  "descricao": "Descricao revisada",
  "status": "EM_ANDAMENTO"
}
```
Erro `403`:
```json
{
  "message": "Sem permissao para atualizar este projeto.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PATCH /projetos/{id}/materiais-descricao
Sucesso `200 OK`:
```json
{
  "id": 200,
  "descricao": "Nova descricao do projeto",
  "materiais": ["Arduino", "Sensor pH", "LED"]
}
```
Erro `401`:
```json
{
  "message": "Token JWT ausente ou invalido.",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /projetos/{id}
Sucesso `204 No Content`:
```json
{}
```
Erro `404`:
```json
{
  "message": "Projeto nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PUT /projetos/{id}/capa
Sucesso `200 OK`:
```json
{
  "id": 200,
  "capaUrl": "https://cdn.exemplo.com/projects/200/capa.jpg"
}
```
Erro `400`:
```json
{
  "message": "O arquivo da capa e obrigatorio.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /projetos/{id}/capa
Sucesso `200 OK`:
```json
{
  "id": 200,
  "capaUrl": null
}
```
Erro `404`:
```json
{
  "message": "Projeto nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /projetos/{id}/integrantes
Sucesso `201 Created`:
```json
{
  "id": 501,
  "projetoId": 200,
  "usuarioId": 101,
  "tipoIntegrante": "ALUNO",
  "dataVinculo": "2026-06-21T14:10:33"
}
```
Erro `400`:
```json
{
  "message": "Usuario ja vinculado ao projeto.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### GET /projetos/{id}/integrantes
Sucesso `200 OK`:
```json
[
  {
    "id": 501,
    "projetoId": 200,
    "usuarioId": 101,
    "tipoIntegrante": "ALUNO",
    "dataVinculo": "2026-06-21T14:10:33"
  }
]
```
Erro `404`:
```json
{
  "message": "Projeto nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /projetos/{id}/integrantes/{integranteId}
Sucesso `204 No Content`:
```json
{}
```
Erro `403`:
```json
{
  "message": "Sem permissao para remover integrante.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /projetos/{id}/comentarios
Sucesso `201 Created`:
```json
{
  "id": 700,
  "projetoId": 200,
  "usuarioId": 12,
  "texto": "Excelente evolucao do projeto!",
  "dataCriacao": "2026-06-21T14:10:33"
}
```
Erro `400`:
```json
{
  "message": "Comentario nao pode ser vazio.",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-06-21T14:10:33",
  "details": [
    "texto: nao deve estar vazio"
  ]
}
```

#### GET /projetos/{id}/comentarios
Sucesso `200 OK`:
```json
[
  {
    "id": 700,
    "projetoId": 200,
    "usuarioId": 12,
    "texto": "Excelente evolucao do projeto!",
    "dataCriacao": "2026-06-21T14:10:33"
  }
]
```
Erro `404`:
```json
{
  "message": "Projeto nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /projetos/{id}/comentarios/{comentarioId}
Sucesso `204 No Content`:
```json
{}
```
Erro `403`:
```json
{
  "message": "Sem permissao para remover comentario.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /projetos/{id}/registros-diarios
Sucesso `201 Created`:
```json
{
  "id": 900,
  "projetoId": 200,
  "texto": "Hoje montamos o circuito inicial.",
  "arquivos": [
    {
      "nome": "foto1.jpg",
      "chave": "projects/200/registros/foto1.jpg",
      "url": "https://cdn.exemplo.com/projects/200/registros/foto1.jpg"
    }
  ],
  "dataCriacao": "2026-06-21T14:10:33"
}
```
Erro `403`:
```json
{
  "message": "Somente ALUNO pode criar registro diario.",
  "code": "FORBIDDEN",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### GET /projetos/{id}/registros-diarios
Sucesso `200 OK`:
```json
[
  {
    "id": 900,
    "projetoId": 200,
    "texto": "Hoje montamos o circuito inicial.",
    "dataCriacao": "2026-06-21T14:10:33"
  }
]
```
Erro `401`:
```json
{
  "message": "Token JWT ausente ou invalido.",
  "code": "UNAUTHORIZED",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### PUT /projetos/{id}/registros-diarios/{registroId}
Sucesso `200 OK`:
```json
{
  "id": 900,
  "projetoId": 200,
  "texto": "Texto atualizado do registro.",
  "dataAtualizacao": "2026-06-21T15:05:10"
}
```
Erro `404`:
```json
{
  "message": "Registro diario nao encontrado.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### POST /projetos/{id}/registros-diarios/{registroId}/arquivos
Sucesso `200 OK`:
```json
{
  "id": 900,
  "projetoId": 200,
  "arquivos": [
    {
      "nome": "grafico.pdf",
      "chave": "projects/200/registros/grafico.pdf",
      "url": "https://cdn.exemplo.com/projects/200/registros/grafico.pdf"
    }
  ]
}
```
Erro `400`:
```json
{
  "message": "O arquivo e obrigatorio.",
  "code": "BUSINESS_RULE_VIOLATION",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```

#### DELETE /projetos/{id}/registros-diarios/{registroId}/arquivos/{chave}
Sucesso `200 OK`:
```json
{
  "id": 900,
  "projetoId": 200,
  "arquivos": []
}
```
Erro `404`:
```json
{
  "message": "Arquivo nao encontrado no registro.",
  "code": "ENTITY_NOT_FOUND",
  "timestamp": "2026-06-21T14:10:33",
  "details": null
}
```
