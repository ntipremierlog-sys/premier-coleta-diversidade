import { z } from "zod";
import { UNIDADES } from "./constants";
import { validateCpf } from "./cpf-utils";

export const consentimentosSchema = z.object({
  raca_cor: z.boolean().default(true),
  pcd: z.boolean().default(true),
  neurodivergencia: z.boolean().default(true),
  lgbtqiapn: z.boolean().default(true),
  geral: z.boolean().default(true),
});

export const submissionSchema = z.object({
  // Identificação do Respondente
  nomeCompleto: z
    .string()
    .min(3, "Nome completo deve ter no mínimo 3 caracteres.")
    .max(150, "Nome muito longo."),
  cpf: z
    .string()
    .refine((val) => validateCpf(val), {
      message: "CPF inválido. Verifique os dígitos digitados.",
    }),
  matricula: z.string().max(50).optional().nullable(),

  // Metadados
  unidade: z.enum(UNIDADES, {
    errorMap: () => ({ message: "Por favor, selecione uma unidade válida." }),
  }),
  competencia: z.string().min(1, "Competência é obrigatória."),

  // Consentimentos Granulares
  consentimentos: consentimentosSchema,

  // Autodeclarações (preenchidas ou com fallback caso não consentido)
  genero: z
    .enum(["feminino", "masculino", "outro", "nao_informado"])
    .default("nao_informado"),
  racaCor: z
    .enum(["branca", "preta", "parda", "amarela", "indigena", "nao_informado"])
    .default("nao_informado"),
  pcd: z.enum(["sim", "nao", "nao_informado"]).default("nao_informado"),
  pcdTipo: z.string().max(120, "Máximo de 120 caracteres").optional().nullable(),
  neurodivergente: z
    .enum(["sim", "nao", "nao_informado"])
    .default("nao_informado"),
  faixaEtaria: z
    .enum(["ate_29", "30_44", "45_59", "60_mais", "nao_informado"])
    .default("nao_informado"),
  lgbtqiapn: z.enum(["sim", "nao", "nao_informado"]).default("nao_informado"),
  outroGrupo: z
    .string()
    .max(120, "Máximo de 120 caracteres.")
    .optional()
    .nullable(),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
