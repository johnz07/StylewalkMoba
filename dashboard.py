import streamlit as st
import pandas as pd
import requests
import os

st.set_page_config(page_title="StyleWalk - Dashboard de Vendas", page_icon="👟", layout="wide")

st.title("👟 StyleWalk - Dashboard Gerencial e Estatístico")
st.markdown("Painel analítico integrado ao backend do e-commerce para acompanhamento de pedidos, faturamento e catálogo.")

# Endereço da API e conta de administrador (a rota de exportação é restrita ao admin).
# Os valores padrão são os do banco de desenvolvimento (npm run db:setup); sobrescreva por variável de ambiente.
API_URL = os.getenv("STYLEWALK_API_URL", "http://localhost:3000").rstrip("/")
ADMIN_EMAIL = os.getenv("STYLEWALK_ADMIN_EMAIL", "admin@admin.com.br")
ADMIN_PASSWORD = os.getenv("STYLEWALK_ADMIN_PASSWORD", "0000")

EMPTY_DATA = {"categorias": [], "produtos": [], "pedidos": [], "itens_pedido": []}


@st.cache_data(ttl=60)
def load_data():
    try:
        login = requests.post(f"{API_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        login.raise_for_status()
        token = login.json()["token"]
        response = requests.get(f"{API_URL}/relatorios/export", headers={"Authorization": f"Bearer {token}"}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        st.warning(f"Não foi possível carregar os dados da API ({e}). Exibindo o painel vazio.")
        return EMPTY_DATA


data = load_data()

# Transformando em DataFrames do Pandas
df_pedidos = pd.DataFrame(data.get("pedidos", []))
df_produtos = pd.DataFrame(data.get("produtos", []))
df_itens = pd.DataFrame(data.get("itens_pedido", []))

# Métricas Principais (KPIs)
st.subheader("📊 Indicadores de Desempenho (KPIs)")
col1, col2, col3, col4 = st.columns(4)

total_pedidos = len(df_pedidos)
faturamento_total = df_pedidos["total"].sum() if not df_pedidos.empty and "total" in df_pedidos.columns else 0.0
ticket_medio = faturamento_total / total_pedidos if total_pedidos > 0 else 0.0
total_produtos = len(df_produtos)

col1.metric("Total de Pedidos", total_pedidos)
col2.metric("Faturamento Total", f"R$ {faturamento_total:,.2f}")
col3.metric("Ticket Médio", f"R$ {ticket_medio:,.2f}")
col4.metric("Produtos Cadastrados", total_produtos)

st.markdown("---")

# Gráficos e Análises Estatísticas
col_a, col_b = st.columns(2)

with col_a:
    st.subheader("📦 Pedidos por Status")
    if not df_pedidos.empty and "status" in df_pedidos.columns:
        status_counts = df_pedidos["status"].value_counts()
        st.bar_chart(status_counts)
    else:
        st.info("Aguardando registros de pedidos no banco para exibir o gráfico de status.")

with col_b:
    st.subheader("🌎 Vendas por Estado (UF)")
    if not df_pedidos.empty and "entrega_uf" in df_pedidos.columns:
        uf_counts = df_pedidos["entrega_uf"].value_counts()
        st.bar_chart(uf_counts)
    else:
        st.info("Aguardando dados de entrega por estado.")

st.markdown("---")
st.subheader("📋 Detalhamento dos Pedidos Recentes")
if not df_pedidos.empty:
    st.dataframe(df_pedidos[["id", "status", "subtotal", "desconto", "total", "entrega_cidade", "entrega_uf", "criado_em"]])
else:
    st.info("Nenhum pedido encontrado na base de dados no momento.")