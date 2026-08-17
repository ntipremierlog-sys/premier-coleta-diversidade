# 🚀 Guia Passo a Passo: Publicação do Formulário na Vercel + Banco de Dados em Nuvem (Supabase / Neon)

Este guia orienta de ponta a ponta como colocar o **Formulário de Autodeclaração de Diversidade da Premier Logistics** online, com conexão segura HTTPS e banco de dados em nuvem escalável para os colaboradores.

---

## 📋 Visão Geral das Etapas

1. **Etapa 1:** Criar o Banco de Dados PostgreSQL gratuito no **Supabase** (ou **Neon.tech**).
2. **Etapa 2:** Configurar o Prisma para PostgreSQL e enviar o Schema (`prisma db push`).
3. **Etapa 3:** Subir o código para o **GitHub** (repositório privado).
4. **Etapa 4:** Conectar o repositório na **Vercel** e configurar as Variáveis de Ambiente.
5. **Etapa 5 (Opcional):** Configurar o domínio oficial (ex: `diversidade.premierlogistics.com.br`).

---

## 🗄️ ETAPA 1: Criar o Banco de Dados PostgreSQL no Supabase (2 minutos)

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta gratuita (ou faça login com o GitHub).
2. Clique em **"New Project"** (Novo Projeto).
3. Preencha os campos:
   - **Name:** `premier-diversidade-db`
   - **Database Password:** Crie uma senha forte e guarde-a (ex: `Premier@Db2026Secure!`).
   - **Region:** Selecione `South America (São Paulo)` para ter a menor latência.
   - **Pricing Plan:** Free tier (Gratuito).
4. Clique em **"Create new project"** e aguarde ~1 minuto até o banco ser provisionado.
5. Vá em **Project Settings (Ícone de engrenagem) > Database > Connection String**:
   - Selecione a aba **URI** (ou **Transaction / Session**).
   - Copie a URL gerada (ela terá o formato):
     ```text
     postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
   *(Substitua `[SUA-SENHA]` pela senha que você definiu).*

---

## ⚙️ ETAPA 2: Ajustar o Prisma para PostgreSQL

No projeto local, altere o arquivo [prisma/schema.prisma](file:///c:/Users/financeiro3/OneDrive%20-%20Premier%20Logistics/%C3%81rea%20de%20Trabalho/NTI/Coleta%20de%20Dados/prisma/schema.prisma):

Substitua:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Por:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Em seguida, no seu terminal local com a URL do Supabase no `.env`:
```bash
npx prisma db push
```
*Isso criará automaticamente todas as tabelas (`DiversityRespondent`, `DiversityConsent`, `DiversitySubmission`, `DiversityAccessLog`) no Supabase!*

---

## 🐙 ETAPA 3: Subir o Projeto para o GitHub (Repositório Privado)

1. Acesse **[github.com](https://github.com)** e crie um novo repositório com o nome `premier-coleta-diversidade` (marque como **Private / Privado**).
2. No terminal do projeto, execute:
   ```bash
   git init
   git add .
   git commit -m "feat: formulario oficial premier logistics com adequacao LGPD"
   git branch -M main
   git remote add origin https://github.com/[SEU-USUARIO]/premier-coleta-diversidade.git
   git push -u origin main
   ```

---

## 🔺 ETAPA 4: Conectar e Publicar na Vercel

1. Acesse **[vercel.com](https://vercel.com)** e faça login com sua conta do GitHub.
2. Clique no botão **"Add New..." > "Project"**.
3. Localize o repositório `premier-coleta-diversidade` e clique em **"Import"**.
4. Na tela de configuração **"Configure Project"**, abra a seção **Environment Variables** e adicione as seguintes variáveis:

| Nome da Variável | Valor Recomendado | Finalidade |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:[SENHA]@...supabase.co:5432/postgres` | URL de conexão com o banco |
| `ADMIN_PASSWORD` | `premier@diversidade2026` | Senha RH Agregado |
| `ADMIN_MASTER_PASSWORD` | `premier@adminmaster2026` | Senha RH Administrador Master |
| `CPF_HASH_SECRET` | `premier_secret_key_cpf_hash_2026_x89a` | Chave HMAC de segurança do CPF |
| `DATA_RETENTION_MONTHS` | `24` | Prazo de guarda em meses |
| `NEXT_PUBLIC_APP_URL` | `https://[SEU-DOMINIO-VERCEL].vercel.app` | URL pública da aplicação |

5. Clique em **"Deploy"**.
6. Aguarde cerca de 1 a 2 minutos. A Vercel compilará o projeto e gerará um link público e seguro:
   `https://premier-coleta-diversidade.vercel.app` (com HTTPS e certificado SSL ativo).

---

## 🌐 ETAPA 5 (Opcional): Configurar o Subdomínio Oficial da Premier

Para usar um endereço corporativo oficial (ex: `https://diversidade.premierlogistics.com.br`):

1. No painel da Vercel, acesse **Settings > Domains**.
2. Digite `diversidade.premierlogistics.com.br` e clique em **Add**.
3. A Vercel exibirá um registro de DNS para apontamento:
   - **Tipo:** `CNAME`
   - **Nome / Host:** `diversidade`
   - **Valor / Destino:** `cname.vercel-dns.com`
4. Solicite ao time de TI / Registro de Domínio da Premier para incluir esse CNAME na zona de DNS.
5. Em poucos minutos o domínio corporativo estará ativo com HTTPS automático!

---

## ✅ Pronto para Envio aos Colaboradores!

Com o link ativo (`https://diversidade.premierlogistics.com.br`):
- O RH pode enviar o link por **e-mail corporativo** ou **grupos de WhatsApp das filiais**.
- O colaborador acessa de qualquer smartphone ou computador sem precisar instalar nada.
- O RH acompanha as respostas e gráficos em tempo real acessando `/admin`.
