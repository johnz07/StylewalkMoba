-- Schema do StyleWalk (PostgreSQL). Recriado do zero por `npm run db:setup`.

DROP TABLE IF EXISTS itens_pedido, pedidos, cupons, produtos, categorias, enderecos, usuarios CASCADE;
DROP TYPE IF EXISTS perfil_usuario, status_pedido, selo_produto;

-- Busca de produtos sem diferenciar acentos ("tenis" encontra "tênis").
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TYPE perfil_usuario AS ENUM ('customer', 'admin');
CREATE TYPE status_pedido AS ENUM ('pending', 'approved', 'rejected');
-- Selo exibido no card do produto e usado nos atalhos da Home.
CREATE TYPE selo_produto AS ENUM ('exclusivo', 'novo', 'limitado');

CREATE TABLE usuarios (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome            VARCHAR(80)  NOT NULL,
  sobrenome       VARCHAR(80)  NOT NULL DEFAULT '',
  email           VARCHAR(160) NOT NULL UNIQUE,
  senha_hash      VARCHAR(100) NOT NULL,
  cpf             VARCHAR(14),
  telefone        VARCHAR(20),
  data_nascimento DATE,
  perfil          perfil_usuario NOT NULL DEFAULT 'customer',
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Endereço principal do cliente (um por usuário), usado para preencher o checkout.
CREATE TABLE enderecos (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id  INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  cep         VARCHAR(9)   NOT NULL DEFAULT '',
  logradouro  VARCHAR(160) NOT NULL DEFAULT '',
  numero      VARCHAR(20)  NOT NULL DEFAULT '',
  complemento VARCHAR(80)  NOT NULL DEFAULT '',
  bairro      VARCHAR(80)  NOT NULL DEFAULT '',
  cidade      VARCHAR(80)  NOT NULL DEFAULT '',
  uf          VARCHAR(2)   NOT NULL DEFAULT ''
);

CREATE TABLE categorias (
  id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(40) NOT NULL UNIQUE
);

-- Exclusão é lógica (ativo = false) para não quebrar o histórico de pedidos.
CREATE TABLE produtos (
  id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome                 VARCHAR(120)  NOT NULL,
  descricao            TEXT          NOT NULL DEFAULT '',
  preco                NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  categoria_id         INTEGER REFERENCES categorias(id),
  imagem_url           TEXT,
  selo                 selo_produto,
  destaque             BOOLEAN   NOT NULL DEFAULT false,
  tamanhos             INTEGER[] NOT NULL DEFAULT '{37,38,39,40,41,42,43,44}',
  ativo                BOOLEAN   NOT NULL DEFAULT true,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cupons (
  codigo     VARCHAR(30) PRIMARY KEY,
  percentual NUMERIC(5,2) NOT NULL CHECK (percentual > 0 AND percentual <= 100),
  ativo      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE pedidos (
  id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id        INTEGER NOT NULL REFERENCES usuarios(id),
  status            status_pedido NOT NULL DEFAULT 'pending',
  subtotal          NUMERIC(10,2) NOT NULL,
  desconto          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  cupom_codigo      VARCHAR(30) REFERENCES cupons(codigo),
  entrega_cep         VARCHAR(9)   NOT NULL,
  entrega_logradouro  VARCHAR(160) NOT NULL,
  entrega_numero      VARCHAR(20)  NOT NULL,
  entrega_complemento VARCHAR(80)  NOT NULL DEFAULT '',
  entrega_bairro      VARCHAR(80)  NOT NULL DEFAULT '',
  entrega_cidade      VARCHAR(80)  NOT NULL,
  entrega_uf          VARCHAR(2)   NOT NULL DEFAULT '',
  mp_preference_id  VARCHAR(80),
  mp_payment_id     VARCHAR(40),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE itens_pedido (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id      INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id     INTEGER NOT NULL REFERENCES produtos(id),
  tamanho        INTEGER NOT NULL,
  quantidade     INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(pedido_id);
