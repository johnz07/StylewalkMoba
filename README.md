# StyleWalk

E-commerce de calçados em **React Native (Expo)** com API **Node.js + Express** e banco **PostgreSQL**.
Projeto Integrador IV (SENAC, ADS 4º semestre).

```
App Expo (React Native)  ──HTTP/JSON──►  API Node + Express (server/)  ──pg──►  PostgreSQL
  └ AsyncStorage: sessão, carrinho e favoritos   ├ Mercado Pago (Checkout Pro, credenciais de teste)
  └ ViaCEP e Correios (CEP)                      └ /images (fotos dos produtos)
dashboard.py (Streamlit) ──► GET /relatorios/export (JSON gerado pela API)
```

## Telas

Home, Lançamentos (catálogo com filtros e ordenação), Produto, Carrinho (cupom), Favoritos, Login, Cadastro (ViaCEP e máscaras), Checkout (Mercado Pago), Pedido confirmado e Admin (CRUD de produtos e exportação do JSON).

## Pré-requisitos

- Node.js 22 e npm
- Docker (para o PostgreSQL local)
- Python 3.10+ (só para o dashboard)

## Como rodar

### 1. Banco e API

```bash
cd server
cp .env.example .env        # ajuste JWT_SECRET e, para pagar, MP_ACCESS_TOKEN
npm install
npm run db:up               # PostgreSQL em Docker (porta 5432)
npm run db:setup            # cria as tabelas e os dados iniciais (APAGA o banco)
npm run dev                 # API em http://localhost:3000
```

Conferir: `http://localhost:3000/health` deve responder `{"status":"ok"}`.

### 2. App

```bash
# na raiz do projeto
npm install
npm run web                 # versão web (http://localhost:8081)
npm start                   # QR code para o Expo Go no celular
```

- **Web:** o app usa a API em `localhost:3000`.
- **Celular (Expo Go):** o app descobre o IP do PC automaticamente; PC e celular devem estar na mesma rede Wi-Fi.
- **API na nuvem:** copie `.env.example` para `.env` na raiz e defina `EXPO_PUBLIC_API_URL`.

### 3. Dashboard (Python)

```bash
pip install streamlit pandas requests
streamlit run dashboard.py
```

O script entra na API como administrador e lê `/relatorios/export`. Variáveis opcionais: `STYLEWALK_API_URL`, `STYLEWALK_ADMIN_EMAIL`, `STYLEWALK_ADMIN_PASSWORD`.

## Contas e cupons de teste (criados pelo `db:setup`)

| Perfil | E-mail | Senha |
|---|---|---|
| Cliente | `cliente@stylewalk.com.br` | `1234` |
| Administrador | `admin@admin.com.br` | `0000` |

Cupons: `BEMVINDO10` (10%) e `STYLE20` (20%).
O `db:setup` também cria 60 pedidos fictícios dos últimos 6 meses para o dashboard ter dados.

## Mercado Pago (ambiente de testes)

1. No painel de desenvolvedores do Mercado Pago, crie uma aplicação de teste e copie o **Access Token de teste**.
2. Coloque em `server/.env`: `MP_ACCESS_TOKEN=TEST-...`.
3. No checkout, o app abre o link de pagamento do Mercado Pago. Nenhum pagamento é real.

Cartões de teste (Brasil): confira a lista atual em <https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards>. Para aprovar, use o nome do titular `APRO` e o CPF `12345678909`.

## Testes

| Camada | Onde | Comando |
|---|---|---|
| Unitários do app (Jest + jest-expo) | `utils/`, `services/`, `context/` | `npm test` (raiz) |
| Unitários do servidor (Jest) | `server/tests/unit` | `npm run test:unit` (em `server/`) |
| Integração (supertest + PostgreSQL) | `server/tests/integration` | `npm run test:integration` (em `server/`) |
| E2E (Playwright, versão web) | `e2e/` | `npm run test:e2e` (raiz) |

- `npm test` dentro de `server/` roda unitários e integração.
- Integração e E2E precisam do PostgreSQL no ar (`npm run db:up` em `server/`) e usam o banco separado `stylewalk_test`, recriado a cada execução. O banco de desenvolvimento não é tocado. Para usar outro banco, defina `TEST_DATABASE_URL`.
- No E2E, o Playwright sobe sozinho a API (porta 3100) e o app web (porta 8091). Na primeira vez, instale o navegador: `npx playwright install chromium`.
- O Mercado Pago é simulado nos testes (nenhuma chamada externa).

## API

| Método | Rota | Acesso |
|---|---|---|
| GET | `/health` | público |
| POST | `/auth/register`, `/auth/login` | público |
| GET | `/auth/me` | login |
| GET | `/categorias`, `/produtos`, `/produtos/:id` | público (`/produtos?categoria=&selo=&busca=&ordem=`) |
| POST, PUT, DELETE | `/produtos`, `/produtos/:id` | admin |
| GET | `/cupons/:codigo` | público |
| POST | `/pedidos` | login (cria o pedido e o link do Mercado Pago) |
| POST | `/webhooks/mercadopago` | Mercado Pago (opcional, exige URL pública) |
| GET | `/relatorios/export` | admin |

Erros seguem o formato `{ "error": "mensagem" }`. Os preços dos pedidos são sempre lidos do banco.

## Exportação em JSON (dashboard)

O botão **Exportar JSON** do painel Admin (e `GET /relatorios/export`, com token de admin) devolve:

```json
{
  "gerado_em": "2026-11-23T20:00:00.000Z",
  "categorias":   [{ "id": 1, "nome": "Masculino" }],
  "produtos":     [{ "id": 1, "nome": "Velocity Pro", "preco": 1499.9, "categoria_id": 1, "destaque": true, "ativo": true }],
  "pedidos":      [{ "id": 1, "usuario_id": 2, "status": "approved", "subtotal": 899.9, "desconto": 0, "total": 899.9,
                     "cupom_codigo": null, "entrega_cidade": "São Paulo", "entrega_uf": "SP", "criado_em": "2026-09-01T14:30:00.000Z" }],
  "itens_pedido": [{ "pedido_id": 1, "produto_id": 1, "tamanho": 42, "quantidade": 1, "preco_unitario": 899.9 }]
}
```

- `pedidos.status`: `pending`, `approved` ou `rejected`.
- Valores em reais (número). Datas em ISO 8601 (UTC).
- `itens_pedido.pedido_id` e `produto_id` ligam às listas `pedidos` e `produtos`; `produtos.categoria_id` liga a `categorias`.

## Estrutura

```
server/            API (src/routes, controllers, services, models, middlewares), db/ (schema e seed), tests/
screens/           telas        components/  componentes       context/  Auth, Cart e Store
services/api.js    cliente HTTP da API
utils/             máscaras, formatação, navegação e storage
e2e/               testes E2E (Playwright)
dashboard.py       dashboard de Análise de Dados (Streamlit)
```
