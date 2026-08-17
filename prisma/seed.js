const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const unidades = [
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
];

const generos = ["feminino", "masculino", "outro", "nao_informado"];
const racas = ["branca", "preta", "parda", "amarela", "indigena", "nao_informado"];
const opcoesSimNao = ["sim", "nao", "nao_informado"];
const faixas = ["ate_29", "30_44", "45_59", "60_mais", "nao_informado"];

async function main() {
  console.log("Iniciando seed de dados de teste...");

  const competencia = "2026-08";

  // Gerar amostras representativas
  const mockSubmissions = [
    // Indaiatuba (amostra com 12 respondentes)
    ...Array.from({ length: 12 }).map((_, i) => ({
      unidade: "Indaiatuba",
      competencia,
      genero: i % 2 === 0 ? "feminino" : "masculino",
      racaCor: i % 3 === 0 ? "parda" : i % 3 === 1 ? "branca" : "preta",
      pcd: i === 0 ? "sim" : "nao",
      pcdTipo: i === 0 ? "Física leve" : null,
      neurodivergente: i === 1 ? "sim" : "nao",
      faixaEtaria: i === 2 ? "60_mais" : i % 2 === 0 ? "30_44" : "ate_29",
      lgbtqiapn: i === 3 ? "sim" : "nao",
      outroGrupo: i === 4 ? "Maternidade recente" : null,
    })),

    // Cajamar (amostra com 18 respondentes)
    ...Array.from({ length: 18 }).map((_, i) => ({
      unidade: "Cajamar",
      competencia,
      genero: i < 8 ? "feminino" : i < 16 ? "masculino" : "outro",
      racaCor: i < 6 ? "preta" : i < 12 ? "parda" : i < 16 ? "branca" : "amarela",
      pcd: i === 0 || i === 5 ? "sim" : "nao",
      pcdTipo: i === 0 ? "Auditiva" : null,
      neurodivergente: i === 1 || i === 4 ? "sim" : "nao",
      faixaEtaria: i === 2 || i === 7 ? "60_mais" : i < 10 ? "30_44" : "45_59",
      lgbtqiapn: i === 3 || i === 8 ? "sim" : "nao",
      outroGrupo: null,
    })),

    // Guarulhos (amostra pequena de 3 respondentes para testar k-anonimato)
    ...Array.from({ length: 3 }).map((_, i) => ({
      unidade: "Guarulhos",
      competencia,
      genero: i === 0 ? "feminino" : "masculino",
      racaCor: i === 0 ? "parda" : "branca",
      pcd: "nao",
      pcdTipo: null,
      neurodivergente: "nao",
      faixaEtaria: "30_44",
      lgbtqiapn: "nao",
      outroGrupo: null,
    })),
  ];

  for (const item of mockSubmissions) {
    await prisma.diversitySubmission.create({ data: item });
  }

  console.log(`Seed concluído com sucesso! Inseridas ${mockSubmissions.length} submissões.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
