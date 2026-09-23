"use client";

import React from "react";
import { AggregatedDiversityData } from "@/lib/excel-generator";
import {
  Users,
  Sparkles,
  Brain,
  Accessibility,
  HeartHandshake,
  CalendarClock,
  Layers,
  Award,
} from "lucide-react";

interface DiversityChartsProps {
  summary: AggregatedDiversityData | null;
}

export const DiversityCharts: React.FC<DiversityChartsProps> = ({ summary }) => {
  const total = summary?.total || 0;

  const getPct = (val: number) => {
    if (!total || total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  const getPctFormatted = (val: number) => {
    if (!total || total === 0) return "0.0";
    return ((val / total) * 100).toFixed(1);
  };

  // Dados Gênero
  const fem = summary?.genero.feminino || 0;
  const masc = summary?.genero.masculino || 0;
  const mulherTrans = summary?.genero.mulher_trans || 0;
  const homemTrans = summary?.genero.homem_trans || 0;
  const outroGen = (summary?.genero.outro || 0) + (summary?.genero.nao_informado || 0);

  // Cálculos para o Donut Chart de Gênero
  const femPct = getPct(fem);
  const mascPct = getPct(masc);
  const mTransPct = getPct(mulherTrans);
  const hTransPct = getPct(homemTrans);
  const outroPct = Math.max(0, 100 - femPct - mascPct - mTransPct - hTransPct);

  // Circunferência do círculo R=40 => 2 * PI * 40 = 251.32
  const circumference = 251.32;
  const femStroke = (femPct / 100) * circumference;
  const mascStroke = (mascPct / 100) * circumference;
  const mTransStroke = (mTransPct / 100) * circumference;
  const hTransStroke = (hTransPct / 100) * circumference;
  const outroStroke = (outroPct / 100) * circumference;

  const femOffset = 0;
  const mascOffset = -femStroke;
  const mTransOffset = -(femStroke + mascStroke);
  const hTransOffset = -(femStroke + mascStroke + mTransStroke);
  const outroOffset = -(femStroke + mascStroke + mTransStroke + hTransStroke);

  // Dados Raça/Cor IBGE
  const racaItems = [
    {
      label: "Parda",
      value: summary?.racaCor.parda || 0,
      gradient: "from-amber-500 to-amber-600",
      dotColor: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Branca",
      value: summary?.racaCor.branca || 0,
      gradient: "from-slate-400 to-slate-500",
      dotColor: "bg-slate-400",
      badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
    },
    {
      label: "Preta",
      value: summary?.racaCor.preta || 0,
      gradient: "from-neutral-700 to-neutral-900",
      dotColor: "bg-neutral-800",
      badgeBg: "bg-neutral-100 text-neutral-800 border-neutral-300",
    },
    {
      label: "Amarela",
      value: summary?.racaCor.amarela || 0,
      gradient: "from-yellow-400 to-yellow-500",
      dotColor: "bg-yellow-400",
      badgeBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      label: "Indígena",
      value: summary?.racaCor.indigena || 0,
      gradient: "from-emerald-500 to-emerald-600",
      dotColor: "bg-emerald-500",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Não informado",
      value: summary?.racaCor.nao_informado || 0,
      gradient: "from-slate-300 to-slate-400",
      dotColor: "bg-slate-300",
      badgeBg: "bg-slate-50 text-slate-500 border-slate-200",
    },
  ];

  // Dados Faixa Etária
  const ageItems = [
    { label: "Até 29 anos", val: summary?.faixaEtaria.ate_29 || 0 },
    { label: "30 a 44 anos", val: summary?.faixaEtaria["30_44"] || 0 },
    { label: "45 a 59 anos", val: summary?.faixaEtaria["45_59"] || 0 },
    { label: "60+ anos", val: summary?.faixaEtaria["60_mais"] || 0 },
  ];

  const maxAge = Math.max(1, ...ageItems.map((a) => a.val));

  // Dados Inclusão Afirmativa
  const inclusionItems = [
    {
      title: "PCD",
      fullTitle: "Pessoa com Deficiência",
      subtitle: "Autodeclaração PcD",
      count: summary?.pcd.sim || 0,
      pct: getPctFormatted(summary?.pcd.sim || 0),
      color: "text-blue-600",
      bgGradient: "from-blue-50/50 via-white to-white",
      borderColor: "border-blue-100 hover:border-blue-300",
      iconBg: "bg-blue-50 text-blue-600",
      strokeColor: "#2563EB",
      icon: Accessibility,
    },
    {
      title: "Neurodivergência",
      fullTitle: "Neurodivergentes",
      subtitle: "TDAH, TEA, Dislexia",
      count: summary?.neurodivergente.sim || 0,
      pct: getPctFormatted(summary?.neurodivergente.sim || 0),
      color: "text-purple-600",
      bgGradient: "from-purple-50/50 via-white to-white",
      borderColor: "border-purple-100 hover:border-purple-300",
      iconBg: "bg-purple-50 text-purple-600",
      strokeColor: "#9333EA",
      icon: Brain,
    },
    {
      title: "LGBTQIAPN+",
      fullTitle: "Comunidade LGBTQIAPN+",
      subtitle: "Identidade & Orientação",
      count: summary?.lgbtqiapn.sim || 0,
      pct: getPctFormatted(summary?.lgbtqiapn.sim || 0),
      color: "text-rose-600",
      bgGradient: "from-rose-50/50 via-white to-white",
      borderColor: "border-rose-100 hover:border-rose-300",
      iconBg: "bg-rose-50 text-rose-600",
      strokeColor: "#E11D48",
      icon: HeartHandshake,
    },
    {
      title: "Longevidade",
      fullTitle: "Profissionais 60+ Anos",
      subtitle: "Experiência e Maturidade",
      count: summary?.faixaEtaria["60_mais"] || 0,
      pct: getPctFormatted(summary?.faixaEtaria["60_mais"] || 0),
      color: "text-emerald-600",
      bgGradient: "from-emerald-50/50 via-white to-white",
      borderColor: "border-emerald-100 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-600",
      strokeColor: "#059669",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Seção 1: Gráficos Principais (Donut de Gênero + Barras de Raça/Cor) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO 1: GÊNERO (DONUT CHART) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200/90 hover:shadow-card-hover transition-all space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Distribuição de Gênero
                </h3>
                <p className="text-xs text-slate-500">
                  Identidade de gênero autodeclarada
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-lg">
              {total} respostas
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-1">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-sm">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                />

                {total > 0 && (
                  <>
                    {/* Feminino (Rosa Escuro / Fúcsia) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#E11D48"
                      strokeWidth="12"
                      strokeDasharray={`${femStroke} ${circumference}`}
                      strokeDashoffset={femOffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Masculino (Azul Corporativo) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#2563EB"
                      strokeWidth="12"
                      strokeDasharray={`${mascStroke} ${circumference}`}
                      strokeDashoffset={mascOffset}
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Mulher Trans (Roxo/Violeta) */}
                    {mTransPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#9333EA"
                        strokeWidth="12"
                        strokeDasharray={`${mTransStroke} ${circumference}`}
                        strokeDashoffset={mTransOffset}
                        className="transition-all duration-700 ease-out"
                      />
                    )}

                    {/* Homem Trans (Ciano / Sky) */}
                    {hTransPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#0284C7"
                        strokeWidth="12"
                        strokeDasharray={`${hTransStroke} ${circumference}`}
                        strokeDashoffset={hTransOffset}
                        className="transition-all duration-700 ease-out"
                      />
                    )}

                    {/* Outro / Não informado (Cinza) */}
                    {outroPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#94A3B8"
                        strokeWidth="12"
                        strokeDasharray={`${outroStroke} ${circumference}`}
                        strokeDashoffset={outroOffset}
                        className="transition-all duration-700 ease-out"
                      />
                    )}
                  </>
                )}
              </svg>

              {/* Centro do Donut */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Legenda do Donut */}
            <div className="space-y-2.5 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#E11D48] shrink-0 shadow-xs" />
                  <span className="text-xs text-slate-700 font-semibold">Feminino</span>
                </div>
                <div className="text-right sm:text-left flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{fem}</span>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                    {getPctFormatted(fem)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] shrink-0 shadow-xs" />
                  <span className="text-xs text-slate-700 font-semibold">Masculino</span>
                </div>
                <div className="text-right sm:text-left flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{masc}</span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                    {getPctFormatted(masc)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#9333EA] shrink-0 shadow-xs" />
                  <span className="text-xs text-slate-700 font-semibold">Mulher Trans</span>
                </div>
                <div className="text-right sm:text-left flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{mulherTrans}</span>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                    {getPctFormatted(mulherTrans)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0284C7] shrink-0 shadow-xs" />
                  <span className="text-xs text-slate-700 font-semibold">Homem Trans</span>
                </div>
                <div className="text-right sm:text-left flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{homemTrans}</span>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/60">
                    {getPctFormatted(homemTrans)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0 shadow-xs" />
                  <span className="text-xs text-slate-700 font-semibold">Outro / Recusado</span>
                </div>
                <div className="text-right sm:text-left flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{outroGen}</span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {getPctFormatted(outroGen)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: RAÇA E COR IBGE (BAR CHART HORIZONTAL) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200/90 hover:shadow-card-hover transition-all space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Raça e Cor (IBGE)
                </h3>
                <p className="text-xs text-slate-500">
                  Classificação étnico-racial declarada
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-lg">
              Oficial IBGE
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {racaItems.map((item) => {
              const pct = getPct(item.value);
              const formattedPct = getPctFormatted(item.value);

              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                      <span className="text-slate-800 font-semibold">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.value}</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${item.badgeBg}`}
                      >
                        {formattedPct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-700 ease-out`}
                      style={{
                        width: `${Math.max(pct, item.value > 0 ? 3 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção 2: Indicadores Circulares de Inclusão (PcD, Neuro, LGBTQIAPN+, Longevidade) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Award className="w-4 h-4 text-premier-primary" />
              <span>Indicadores de Inclusão & Representatividade</span>
            </h3>
            <p className="text-xs text-slate-500">
              Proporção de profissionais nos grupos afirmativos monitorados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inclusionItems.map((inc) => {
            const Icon = inc.icon;
            const numPct = parseFloat(inc.pct);
            const radius = 28;
            const circ = 2 * Math.PI * radius;
            const strokeDash = (numPct / 100) * circ;

            return (
              <div
                key={inc.title}
                className={`bg-gradient-to-br ${inc.bgGradient} rounded-2xl p-4 sm:p-5 shadow-card border ${inc.borderColor} flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${inc.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 tracking-tight">
                      {inc.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium pl-0.5">
                    {inc.subtitle}
                  </p>
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {inc.count}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      ({inc.pct}%)
                    </span>
                  </div>
                </div>

                {/* Mini Radial Gauge */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
                    <circle
                      cx="35"
                      cy="35"
                      r={radius}
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="6"
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r={radius}
                      fill="transparent"
                      stroke={inc.strokeColor}
                      strokeWidth="6"
                      strokeDasharray={`${strokeDash} ${circ}`}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[11px] font-black text-slate-800">
                      {Math.round(numPct)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção 3: Gráfico de Faixas Etárias (Distribuição em Colunas) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200/90 hover:shadow-card-hover transition-all space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-sm">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Distribuição por Faixas Etárias
              </h3>
              <p className="text-xs text-slate-500">
                Demografia e maturidade por gerações
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-lg">
            Gerações
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {ageItems.map((age) => {
            const heightPct = Math.round((age.val / maxAge) * 100);
            const formattedPct = getPctFormatted(age.val);

            return (
              <div
                key={age.label}
                className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col items-center justify-between gap-3 text-center transition-all group"
              >
                <span className="text-xs font-bold text-slate-800">{age.label}</span>

                {/* Barra Vertical Estilizada */}
                <div className="w-10 h-28 bg-slate-200/70 rounded-full flex items-end p-1 overflow-hidden relative shadow-inner">
                  <div
                    className="w-full bg-gradient-to-t from-[#180B38] to-[#3B1F80] rounded-full transition-all duration-700 ease-out group-hover:from-[#241052] group-hover:to-[#4C28A6]"
                    style={{ height: `${Math.max(heightPct, age.val > 0 ? 12 : 0)}%` }}
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="text-lg font-black text-slate-900 block tracking-tight">
                    {age.val}
                  </span>
                  <span className="text-xs font-bold text-premier-primary bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 inline-block">
                    {formattedPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
