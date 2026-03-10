# API de Pedidos — Guia de Execução

Este guia explica, passo a passo, como instalar, configurar e executar a API sem problemas, usando banco de dados em memória, MongoDB local (Docker) ou MongoDB Atlas.

## Requisitos
- Node.js 18+ e npm instalados
- Internet habilitada (necessária na primeira execução do banco em memória para baixar binários)
- Opcional: Docker Desktop (para usar MongoDB local sem Atlas)

## Instalação
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Verifique os scripts disponíveis:
   - Iniciar API: `npm start`

## Modos de Banco de Dados
A API já lida com três cenários; escolha apenas um:

### 1) Banco em memória (padrão sem configuração)
- Não defina nenhuma variável `MONGO_URI`.
- Ao iniciar, a API sobe um MongoDB em memória automaticamente (não persiste dados entre reinicializações).
- Use este modo para desenvolvimento rápido e testes locais.

### 2) MongoDB local via Docker
1. Suba um container Mongo:
   ```bash
   docker run -d -p 27017:27017 --name mongo mongo:6
   ```
2. Defina a variável de ambiente e inicie:
   - Windows (PowerShell):
     ```powershell
     $env:MONGO_URI="mongodb://127.0.0.1:27017/jitterbit_db"
     npm start
     ```
   - Linux/macOS (bash):
     ```bash
     export MONGO_URI="mongodb://127.0.0.1:27017/jitterbit_db"
     npm start
     ```

### 3) MongoDB Atlas (recomendado para produção)
1. Crie o cluster no Atlas e anote usuário e senha.
2. Libere seu IP em Network Access (Allow Access From Anywhere ou adicione seu IP).
3. Use a string SRV:
   - Exemplo:
     ```
     mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/jitterbit_db?retryWrites=true&w=majority
     ```
4. Defina a variável e inicie:
   - Windows (PowerShell):
     ```powershell
     $env:MONGO_URI="mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/jitterbit_db?retryWrites=true&w=majority"
     npm start
     ```
   - Linux/macOS (bash):
     ```bash
     export MONGO_URI="mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/jitterbit_db?retryWrites=true&w=majority"
     npm start
     ```
5. Alternativa via arquivo `.env`:
   - Crie um arquivo `.env` na raiz com:
     ```
     MONGO_URI=mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/jitterbit_db?retryWrites=true&w=majority
     ```
   - Inicie com `npm start`.

## Executar a API
```bash
npm start
```

Logs esperados:
- Conexão com o banco estabelecida
- Servidor rodando na porta 3000

## Endpoints
- Criar pedido:
  - Método: `POST`
  - URL: `http://localhost:3000/order`
  - Body (JSON) — aceita variações de campos:
    ```json
    {
      "numeroPedido": "12345",
      "valor Total": "1.234,56",
      "dataCriacao": "2026-03-01T12:00:00Z",
      "items": [
        { "idItem": "100", "quantidadeItem": "2", "valorItem": "499,90" },
        { "idltem": "101", "quantidadeltem": 1, "valorltem": "235,66" }
      ]
    }
    ```
  - Respostas:
    - 201: criado com sucesso
    - 400: dados inválidos
    - 409: pedido duplicado

- Buscar pedido por ID:
  - Método: `GET`
  - URL: `http://localhost:3000/order/{orderId}`

- Listar pedidos:
  - Método: `GET`
  - URL: `http://localhost:3000/order/list`

## Testes rápidos (curl)
- Listar:
  ```bash
  curl -s http://localhost:3000/order/list
  ```
- Criar:
  ```bash
  curl -s -X POST http://localhost:3000/order \
    -H "Content-Type: application/json" \
    -d '{
      "numeroPedido": "12345",
      "valor Total": "1.234,56",
      "dataCriacao": "2026-03-01T12:00:00Z",
      "items": [
        { "idItem": "100", "quantidadeItem": "2", "valorItem": "499,90" },
        { "idltem": "101", "quantidadeltem": 1, "valorltem": "235,66" }
      ]
    }'
  ```

## Erros comuns e soluções
- Buffering timed out / serverSelectionTimeout:
  - Verifique internet e credenciais do Atlas (usuário/senha corretos).
  - Confirme whitelist de IP no Atlas.
  - Prefira URI `mongodb+srv://` em vez de múltiplos hosts `mongodb://`.
  - Se estiver offline, use Docker local ou o banco em memória.

- Falha ao baixar binário do banco em memória:
  - Exige internet na primeira execução. Se não for possível, use Docker local.

- Dados não persistem:
  - Banco em memória apaga ao reiniciar. Use Atlas ou Docker local para persistência.

## Boas práticas
- Nunca versionar `.env` com credenciais.
- Use variáveis de ambiente para segredos (MONGO_URI).
- Em produção, prefira Atlas com rede e usuários configurados corretamente.

## Scripts
- `npm start`: inicia a API em `http://localhost:3000`.

## Estrutura principal
- `src/app.js`: aplicação Express e conexão com o banco.
- `src/models/Order.js`: modelo Mongoose do pedido.
