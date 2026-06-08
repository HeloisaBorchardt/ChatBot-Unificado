# Guia de integracao Frontend - Backend Chatbot

Este arquivo resume os endpoints disponiveis para conectar o frontend ao backend Django/DRF.

## Base URL

Em desenvolvimento local:

```text
http://localhost:8000
```

Prefixo da API:

```text
/api/
```

Exemplo:

```text
http://localhost:8000/api/perguntas/
```

## Observacoes gerais

- A API usa Django REST Framework.
- As respostas sao JSON, exceto upload de arquivos, que deve usar `multipart/form-data`.
- Atualmente nao ha autenticacao por token/JWT nos endpoints.
- O painel Swagger esta disponivel em:

```text
http://localhost:8000/swagger/
```

## Usuarios

### Listar usuarios

```http
GET /api/usuarios/
```

Resposta esperada:

```json
[
  {
    "id_usuario": 1,
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "senha": "pbkdf2_sha256$...",
    "admin": false,
    "data_cadastro": "2026-05-26T10:30:00-03:00",
    "ultimo_acesso": null
  }
]
```

### Buscar usuario por ID

```http
GET /api/usuarios/{id_usuario}/
```

Resposta esperada:

```json
{
  "id_usuario": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "pbkdf2_sha256$...",
  "admin": false,
  "data_cadastro": "2026-05-26T10:30:00-03:00",
  "ultimo_acesso": null
}
```

### Criar usuario

```http
POST /api/usuarios/
Content-Type: application/json
```

Body:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "123456",
  "admin": false
}
```

Resposta esperada:

```json
{
  "id_usuario": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "pbkdf2_sha256$...",
  "admin": false,
  "data_cadastro": "2026-05-26T10:30:00-03:00",
  "ultimo_acesso": null
}
```

Importante: a senha e salva com hash no backend, mas o serializer atual ainda retorna o campo `senha`.

### Login

```http
POST /api/usuarios/login/
Content-Type: application/json
```

Body:

```json
{
  "email": "maria@email.com",
  "senha": "123456"
}
```

Resposta de sucesso `200`:

```json
{
  "mensagem": "Login realizado com sucesso",
  "usuario": "Maria Silva"
}
```

Resposta quando a senha esta incorreta `401`:

```json
{
  "erro": "Senha incorreta"
}
```

Resposta quando o usuario nao existe `404`:

```json
{
  "erro": "Usuario nao encontrado"
}
```

### Atualizar usuario

```http
PUT /api/usuarios/{id_usuario}/
Content-Type: application/json
```

Body:

```json
{
  "nome": "Maria Souza",
  "email": "maria@email.com",
  "senha": "nova-senha",
  "admin": true
}
```

Tambem existe atualizacao parcial:

```http
PATCH /api/usuarios/{id_usuario}/
Content-Type: application/json
```

Body:

```json
{
  "nome": "Maria Souza"
}
```

### Deletar usuario

```http
DELETE /api/usuarios/{id_usuario}/
```

Resposta esperada:

```http
204 No Content
```

## Documentos

### Listar documentos

```http
GET /api/documentos/
```

Resposta esperada:

```json
[
  {
    "id_documento": 1,
    "nome": "Edital 2026",
    "arquivo": "http://localhost:8000/media/documentos/edital.pdf",
    "data_insercao": "2026-05-26T10:30:00-03:00"
  }
]
```

### Buscar documento por ID

```http
GET /api/documentos/{id_documento}/
```

Resposta esperada:

```json
{
  "id_documento": 1,
  "nome": "Edital 2026",
  "arquivo": "http://localhost:8000/media/documentos/edital.pdf",
  "data_insercao": "2026-05-26T10:30:00-03:00"
}
```

### Enviar documento

```http
POST /api/documentos/
Content-Type: multipart/form-data
```

Campos do form:

| Campo | Tipo | Obrigatorio | Descricao |
| --- | --- | --- | --- |
| `nome` | string | nao | Nome do documento |
| `arquivo` | file | nao | Arquivo enviado, normalmente PDF |

Exemplo com `FormData` no frontend:

```js
const formData = new FormData();
formData.append("nome", "Edital 2026");
formData.append("arquivo", arquivoSelecionado);

await fetch("http://localhost:8000/api/documentos/", {
  method: "POST",
  body: formData
});
```

Resposta esperada `201`:

```json
{
  "id_documento": 1,
  "nome": "Edital 2026",
  "arquivo": "http://localhost:8000/media/documentos/edital.pdf",
  "data_insercao": "2026-05-26T10:30:00-03:00"
}
```

Ao criar um documento, o backend chama automaticamente a vetorizacao do arquivo.

### Atualizar documento

```http
PUT /api/documentos/{id_documento}/
Content-Type: multipart/form-data
```

Tambem existe atualizacao parcial:

```http
PATCH /api/documentos/{id_documento}/
Content-Type: multipart/form-data
```

### Deletar documento

```http
DELETE /api/documentos/{id_documento}/
```

Resposta esperada:

```http
204 No Content
```

## Perguntas / Chatbot

Este e o endpoint principal para o chat do frontend.

### Enviar pergunta para o chatbot

```http
POST /api/perguntas/
Content-Type: application/json
```

Body:

```json
{
  "texto": "Quando termina o periodo de inscricao?"
}
```

Resposta esperada `201`:

```json
{
  "id_pergunta": 1,
  "conversa_id": 1,
  "pergunta": "Quando termina o periodo de inscricao?",
  "resposta": "O periodo de inscricao termina em ..."
}
```

Resposta quando `texto` nao e enviado `400`:

```json
{
  "erro": "Campo 'texto' e obrigatorio."
}
```

Comportamento interno:

- O backend busca chunks vetorizados dos documentos.
- Se encontrar contexto relevante, usa a LLM via RAG.
- Se nao encontrar, usa o fluxo NLP local.
- A pergunta, a resposta e a conversa sao salvas no banco.
- Se nao houver usuario logado, o backend usa/cria o usuario anonimo `anonimo@chatbot.local`.

### Listar perguntas

```http
GET /api/perguntas/
```

Resposta esperada:

```json
[
  {
    "texto": "Quando termina o periodo de inscricao?"
  }
]
```

Observacao: o serializer atual de perguntas retorna apenas o campo `texto`.

### Buscar pergunta por ID

```http
GET /api/perguntas/{id_pergunta}/
```

Resposta esperada:

```json
{
  "texto": "Quando termina o periodo de inscricao?"
}
```

## Conversas

### Listar conversas

```http
GET /api/conversas/
```

Resposta esperada:

```json
[
  {
    "id_conversa": 1,
    "data_conversa": "2026-05-26",
    "horario_conversa": "10:30:00",
    "avaliacao": null,
    "usuario": 1,
    "gerenciador": null,
    "pergunta": 1,
    "resposta": 1
  }
]
```

### Buscar conversa por ID

```http
GET /api/conversas/{id_conversa}/
```

Resposta esperada:

```json
{
  "id_conversa": 1,
  "data_conversa": "2026-05-26",
  "horario_conversa": "10:30:00",
  "avaliacao": null,
  "usuario": 1,
  "gerenciador": null,
  "pergunta": 1,
  "resposta": 1
}
```

### Criar conversa manualmente

```http
POST /api/conversas/
Content-Type: application/json
```

Body:

```json
{
  "usuario": 1,
  "gerenciador": null,
  "pergunta": 1,
  "resposta": 1,
  "avaliacao": null
}
```

Resposta esperada `201`:

```json
{
  "id_conversa": 1,
  "data_conversa": "2026-05-26",
  "horario_conversa": "10:30:00",
  "avaliacao": null,
  "usuario": 1,
  "gerenciador": null,
  "pergunta": 1,
  "resposta": 1
}
```

### Avaliar conversa

Use `PATCH` para atualizar apenas a avaliacao:

```http
PATCH /api/conversas/{id_conversa}/
Content-Type: application/json
```

Body:

```json
{
  "avaliacao": true
}
```

Resposta esperada:

```json
{
  "id_conversa": 1,
  "data_conversa": "2026-05-26",
  "horario_conversa": "10:30:00",
  "avaliacao": true,
  "usuario": 1,
  "gerenciador": null,
  "pergunta": 1,
  "resposta": 1
}
```

### Deletar conversa

```http
DELETE /api/conversas/{id_conversa}/
```

Resposta esperada:

```http
204 No Content
```

## Exemplo simples de consumo no frontend

```js
async function perguntar(texto) {
  const response = await fetch("http://localhost:8000/api/perguntas/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ texto })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || "Erro ao enviar pergunta");
  }

  return data;
}
```

Uso esperado:

```js
const resposta = await perguntar("Como faco minha inscricao?");

console.log(resposta.pergunta);
console.log(resposta.resposta);
console.log(resposta.conversa_id);
```

## Checklist para o frontend

- Configure a URL base como `http://localhost:8000/api`.
- Para chat, use `POST /perguntas/` com `{ "texto": "..." }`.
- Para upload de documento, use `FormData` e nao defina manualmente o header `Content-Type`.
- Para login, use `POST /usuarios/login/`.
- Para avaliacao de resposta, use `PATCH /conversas/{id}/` com `{ "avaliacao": true }` ou `{ "avaliacao": false }`.
