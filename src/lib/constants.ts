export const UNIDADES = [
  "Administração",
  "Petrobras",
  "Indaiatuba",
  "Cajamar",
  "Guarulhos",
  "Salvador/TECA",
  "Ribeirão Preto",
  "São José do Rio Preto",
  "Teresina",
  "Valinhos",
  "Bauru",
  "Blumenau",
  "Maranhão",
] as const;

export type UnidadeType = (typeof UNIDADES)[number];

export const GENEROS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "outro", label: "Outro" },
  { value: "nao_informado", label: "Prefiro não informar" },
] as const;

export const RACAS_CORES = [
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
] as const;

export const OPCOES_SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "nao_informado", label: "Prefiro não informar" },
] as const;

export const FAIXAS_ETARIAS = [
  { value: "ate_29", label: "Até 29 anos" },
  { value: "30_44", label: "30 a 44 anos" },
  { value: "45_59", label: "45 a 59 anos" },
  { value: "60_mais", label: "60 anos ou mais" },
  { value: "nao_informado", label: "Prefiro não informar" },
] as const;

export function formatCompetencia(competenciaStr: string): string {
  if (!competenciaStr) return "";
  const parts = competenciaStr.split("-");
  if (parts.length !== 2) return competenciaStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  if (month >= 1 && month <= 12) {
    return `${meses[month - 1]}/${year}`;
  }
  return competenciaStr;
}

export function getCurrentCompetencia(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
