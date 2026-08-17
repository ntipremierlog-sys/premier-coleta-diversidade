import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validation";
import { cleanCpf, hashCpf, maskCpf } from "@/lib/cpf-utils";

// Rate limiter simples em memória
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Muitas solicitações recebidas em curto período. Por favor, aguarde um momento antes de tentar novamente.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validação com Zod
    const validationResult = submissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados do formulário inválidos.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const rawCpf = cleanCpf(data.cpf);
    const calculatedCpfHash = hashCpf(rawCpf);
    const maskedCpf = maskCpf(rawCpf);

    // Texto snapshot de auditoria legal para consentimento
    const consentTextSnapshot =
      "Estas informações serão utilizadas para atualização da base cadastral da Premier Logistics e construção de indicadores internos de diversidade e inclusão, nos termos da LGPD (Lei nº 13.709/2018). A recusa não gera nenhum efeito negativo sobre a relação de trabalho.";

    // Transação atômica para gravação isolada
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar ou Atualizar Respondente (DiversityRespondent)
      let respondent = await tx.diversityRespondent.findUnique({
        where: { cpfHash: calculatedCpfHash },
      });

      if (respondent) {
        respondent = await tx.diversityRespondent.update({
          where: { id: respondent.id },
          data: {
            nomeCompleto: data.nomeCompleto.trim(),
            cpf: data.cpf.trim(),
            cpfMascarado: maskedCpf,
            unidade: data.unidade,
            matricula: data.matricula?.trim() || null,
          },
        });
      } else {
        respondent = await tx.diversityRespondent.create({
          data: {
            nomeCompleto: data.nomeCompleto.trim(),
            cpf: data.cpf.trim(),
            cpfHash: calculatedCpfHash,
            cpfMascarado: maskedCpf,
            unidade: data.unidade,
            matricula: data.matricula?.trim() || null,
          },
        });
      }

      // 2. Registrar Consentimentos Granulares
      const consentCategories = [
        { key: "raca_cor", aceito: data.consentimentos.raca_cor },
        { key: "pcd", aceito: data.consentimentos.pcd },
        { key: "neurodivergencia", aceito: data.consentimentos.neurodivergencia },
        { key: "lgbtqiapn", aceito: data.consentimentos.lgbtqiapn },
        { key: "genero", aceito: data.consentimentos.geral },
        { key: "faixa_etaria", aceito: data.consentimentos.geral },
      ];

      for (const cat of consentCategories) {
        await tx.diversityConsent.create({
          data: {
            respondentId: respondent.id,
            categoria: cat.key,
            aceito: cat.aceito,
            textoExibido: consentTextSnapshot,
          },
        });
      }

      // 3. Salvar ou Atualizar Submissão vinculada ao Respondent
      const submissionData = {
        unidade: data.unidade,
        competencia: data.competencia,
        genero: data.consentimentos.geral ? data.genero : "nao_informado",
        racaCor: data.consentimentos.raca_cor ? data.racaCor : "nao_informado",
        pcd: data.consentimentos.pcd ? data.pcd : "nao_informado",
        pcdTipo:
          data.consentimentos.pcd && data.pcd === "sim" && data.pcdTipo
            ? data.pcdTipo.trim()
            : null,
        neurodivergente: data.consentimentos.neurodivergencia
          ? data.neurodivergente
          : "nao_informado",
        faixaEtaria: data.consentimentos.geral
          ? data.faixaEtaria
          : "nao_informado",
        lgbtqiapn: data.consentimentos.lgbtqiapn
          ? data.lgbtqiapn
          : "nao_informado",
        outroGrupo: data.outroGrupo ? data.outroGrupo.trim() : null,
      };

      const existingSubmission = await tx.diversitySubmission.findUnique({
        where: { respondentId: respondent.id },
      });

      let submission;
      if (existingSubmission) {
        submission = await tx.diversitySubmission.update({
          where: { id: existingSubmission.id },
          data: submissionData,
        });
      } else {
        submission = await tx.diversitySubmission.create({
          data: {
            respondentId: respondent.id,
            ...submissionData,
          },
        });
      }

      return { respondent, submission };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Autodeclaração registrada com sucesso em conformidade com a LGPD.",
        id: result.submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao salvar submissão LGPD:", error);
    return NextResponse.json(
      {
        error: "Erro interno no servidor ao processar a autodeclaração.",
      },
      { status: 500 }
    );
  }
}
