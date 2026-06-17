# 🧠 GuardDrive Intelligence Hub

> **Central de Inteligência de Mercado & Data Room Comercial de Alta Performance**

## 🎯 Missão

Criar uma plataforma estratégica para coleta, análise e visualização de dados de mercado que alimente o desenvolvimento técnico do ecossistema GuardDrive e sirva como Data Room comercial para investidores e editais.

## 🏗️ Arquitetura

### **Camada 1: Autenticação & Acesso**
- Login seguro para escritório RS e Adriano
- Controle de permissões por usuário
- Sessões criptografadas

### **Camada 2: Coleta de Dados**
- Formulários estruturados para pesquisa de mercado
- Cadastro de empresas e contatos
- Integração com escritório RS para coleta field

### **Camada 3: Visualização de Inteligência**
- Dashboards interativos de dados coletados
- Gráficos e métricas de mercado
- Mapas de calor de oportunidades

### **Camada 4: Data Room Embrionário**
- Documentação lapidada para investidores
- Provas de capacidade técnica
- Demonstração de maturidade do ecossistema

### **Camada 5: Integração Técnica**
- Conexão com repositórios técnicos (GuardTag, Pilot, etc.)
- Alimentação de insights para desenvolvimento
- Feedback loop entre mercado e engenharia

## 🛠️ Stack Tecnológico

### **Frontend**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts (visualização de dados)
- NextAuth.js (autenticação)

### **Backend**
- FastAPI (Python)
- PostgreSQL (banco de dados)
- JWT (autenticação)
- Pandas (análise de dados)

### **Infraestrutura**
- Vercel (frontend)
- Railway/Render (backend)
- Supabase (banco de dados)

## 📂 Estrutura de Diretórios

```
guarddrive-intelligence-hub/
├── frontend/                 # Next.js App
│   ├── app/
│   │   ├── (auth)/          # Login/Registro
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── intelligence/     # Visualizadores de dados
│   │   └── dataroom/        # Data Room comercial
│   ├── components/          # Componentes reutilizáveis
│   └── lib/                 # Utilitários
├── backend/                 # FastAPI Backend
│   ├── api/
│   │   ├── auth/            # Endpoints de autenticação
│   │   ├── users/           # Gestão de usuários
│   │   ├── companies/       # Gestão de empresas
│   │   ├── leads/           # Coleta de leads
│   │   └── intelligence/     # Análise de dados
│   ├── models/              # Modelos de banco de dados
│   └── services/            # Lógica de negócio
├── database/                # Schema e migrations
└── docs/                    # Documentação
```

## 🚀 Quick Start

### **Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🎯 Objetivos Estratégicos

1. **Provar Capacidade Técnica**: Mostrar para escritório RS e editais a maturidade do ecossistema
2. **Coleta de Dados Estratégicos**: Alimentar desenvolvimento com insights de mercado reais
3. **Data Room Comercial**: Preparar documentação para investidores e parceiros
4. **Integração Técnica**: Conectar inteligência de mercado com repositórios técnicos

## 🔐 Segurança

- Autenticação JWT com refresh tokens
- Criptografia de dados sensíveis
- Controle de acesso granular
- Logs de auditoria

## 📊 Visualizadores de Dados

- **Mapa de Oportunidades**: Visualização geográfica de leads
- **Análise de Segmentos**: Gráficos de mercado por vertical
- **Timeline de Desenvolvimento**: Roadmap baseado em dados
- **Métricas de Engajamento**: KPIs de coleta de dados

## 🏢 Data Room Embrionário

- **Visão Executiva**: Resumo estratégico do ecossistema
- **Provas Técnicas**: Demonstração de capacidade
- **Análise de Mercado**: Dados lapidados
- **Roadmap Baseado em Dados**: Planejamento informado

---

© 2026 GuardDrive Tech · Central de Inteligência de Mercado
