# Formulário de Autodeclaração de Diversidade & Cadastro | Premier Logistics

> Aplicação web corporativa para coleta de **autodeclarações identificadas (Nome + CPF) e consentimentos granulares de diversidade**, atualização de base cadastral e emissão automática do **Extrato de Diversidade (.xlsx)** e **Base Nominal Restrita (.xlsx)**, em estrita conformidade com a **LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018, Art. 5º, II e Art. 11)**.

---

## ⚖️ AVISO OBRIGATÓRIO — CHECKLIST JURÍDICO (Melo & Isaac / DPO)

> [!IMPORTANT]
> **Antes do Go-Live para os colaboradores**, os seguintes pontos **devem ser revisados e validados pelo Jurídico (Melo & Isaac) e pelo Encarregado de Dados (DPO)**:
>
> 1. **Texto de Finalidade & Base Legal (Etapa 0.5):** Validar se o texto de consentimento e a finalidade de atualização cadastral atendem aos requisitos do Art. 7º, I e Art. 11, I da LGPD.
> 2. **Nome e Canal de Contato do DPO:** Atualizar o e-mail/canal oficial de atendimento aos titulares (atualmente placeholder: `dpo@premierlogistics.com.br`).
> 3. **Prazo de Retenção (`DATA_RETENTION_MONTHS`):** Validar o período de guarda de 24 meses definido no `.env` para dados identificáveis antes da rotina de anonimização.
> 4. **Elaboração do RIPD:** Avaliar a necessidade de Relatório de Impacto à Proteção de Dados Pessoais devido ao volume estimado (~1.700 colaboradores) e à coleta de dados pessoais sensíveis (raça, saúde/PcD, neurodiversidade e orientação/gênero).

---

## 🎯 Visão Geral da Solução

1. **Colaborador:**
   - Preenche unidade e competência.
   - **Etapa 0.5 (Identificação & Consentimento Granular):** Informa Nome Completo, CPF (com validação de dígito verificador e máscara) e Matrícula opcional.
   - **Consentimento Segmentado por Categoria:** O colaborador pode aceitar ou recusar individualmente cada categoria sensível (Raça/Cor, PcD, Neurodiversidade, LGBTQIAPN+). **Etapas recusadas são puladas automaticamente**, com garantia explícita de não-discriminação.
2. **Segurança do CPF:**
   - O CPF **nunca é armazenado em texto plano**.
   - Salva-se apenas `cpfHash` (HMAC-SHA256 determinístico) para deduplicação/busca segura e `cpfMascarado` (`123.***.***-45`) para exibição.
3. **Controle de Acesso em Dois Perfis (/admin):**
   - **`rh_agregado`** *(Senha: `premier@diversidade2026`)*: Acessa apenas dados estatísticos agregados e exporta o Extrato de Diversidade (.xlsx).
   - **`rh_administrador`** *(Senha: `premier@adminmaster2026`)*: Acesso total, incluindo base nominal restrita, módulo de Direitos do Titular (Art. 18), retificações, revogações de consentimento, exclusões definitivas e Trilha de Auditoria.
4. **Exportações em Excel (.xlsx):**
   - **Extrato de Diversidade (Consolidado):** Idêntico ao modelo oficial corporativo, 100% agregado e anônimo.
   - **Base Nominal Restrita:** Planilha confidencial com tarja de sigilo LGPD contendo dados cadastrais e respostas (com log automático na trilha de auditoria).

---

## 🚀 Como Executar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (`.env`)
```env
DATABASE_URL="file:./dev.db"

# Senha RH Agregado (Apenas totais e Extrato consolidado)
ADMIN_PASSWORD="premier@diversidade2026"

# Senha RH Administrador Master (Nominal, Auditoria e Titulares)
ADMIN_MASTER_PASSWORD="premier@adminmaster2026"

# Chave secreta para Hash HMAC-SHA256 de CPF
CPF_HASH_SECRET="premier_secret_key_cpf_hash_2026_x89a"

# Prazo de retenção de dados cadastrais (meses)
DATA_RETENTION_MONTHS=24

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Sincronizar Banco de Dados (Prisma)
```bash
npx prisma db push
npx prisma generate
```

### 4. Iniciar a Aplicação
```bash
npm run dev
```
- **Formulário do Colaborador:** [http://localhost:3000](http://localhost:3000)
- **Painel Administrativo:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔒 Gestão de Direitos do Titular (LGPD Art. 18)

No perfil `rh_administrador`, a aba **"Direitos dos Titulares"** possibilita:
- **Consulta:** Busca por Nome ou CPF (calculando o hash internamente).
- **Retificação:** Alteração de dados cadastrais (Nome, Filial, Matrícula).
- **Revogação Parcial de Consentimento:** Revoga o aceite de uma categoria específica (ex: PcD ou Raça/Cor), limpando o dado sensível da base.
- **Exclusão Definitiva:** Exclui permanentemente o titular em `DiversityRespondent`, preservando a contagem estatística em `DiversitySubmission` (desvinculada e 100% anonimizada).
- **Trilha de Auditoria:** Toda ação é registrada em `DiversityAccessLog`.
