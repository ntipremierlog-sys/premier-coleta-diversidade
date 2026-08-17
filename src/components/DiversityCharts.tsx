"use client";

import React from "react";
import { AggregatedDiversityData } from "@/lib/excel-generator";
import { Users, Sparkles, Brain, Accessibility, HeartHandshake, CalendarClock } from "lucide-react";

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
  const outroGen = (summary?.genero.outro || 0) + (summary?.genero.nao_informado || 0);

  // Cálculos para o Donut Chart de Gênero
  const femPct = getPct(fem);
  const mascPct = getPct(masc);
  const outroPct = Math.max(0, 100 - femPct - mascPct);

  // Circunferência do círculo R=40 => 2 * PI * 40 = 251.32
  const circumference = 251.32;
  const femStroke = (femPct / 100) * circumference;
  const mascStroke = (mascPct / 100) * circumference;
  const outroStroke = (outroPct / 100) * circumference;

  const femOffset = 0;
  const mascOffset = -femStroke;
  const outroOffset = -(femStroke + mascStroke);

  // Dados Raça/Cor
  const racaItems = [
    { label: "Parda", value: summary?.racaCor.parda || 0, color: "bg-amber-600", barColor: "#D97706" },
    { label: "Branca", value: summary?.racaCor.branca || 0, color: "bg-slate-500", barColor: "#64748B" },
    { label: "Preta", value: summary?.racaCor.preta || 0, color: "bg-stone-800", barColor: "#292524" },
    { label: "Amarela", value: summary?.racaCor.amarela || 0, color: "bg-yellow-500", barColor: "#EAB308" },
    { label: "Indígena", value: summary?.racaCor.indigena || 0, color: "bg-emerald-600", barColor: "#059669" },
    { label: "Não informado", value: summary?.racaCor.nao_informado || 0, color: "bg-slate-300", barColor: "#CBD5E1" },
  ];

  // Dados Faixa Etária
  const ageItems = [
    { label: "Até 29", val: summary?.faixaEtaria.ate_29 || 0 },
    { label: "30 a 44", val: summary?.faixaEtaria["30_44"] || 0 },
    { label: "45 a 59", val: summary?.faixaEtaria["45_59"] || 0 },
    { label: "60+", val: summary?.faixaEtaria["60_mais"] || 0 },
  ];

  const maxAge = Math.max(1, ...ageItems.map((a) => a.val));

  // Dados Inclusão (PcD, Neuro, LGBTQIAPN+, Idosos)
  const inclusionItems = [
    {
      title: "Pessoa com Deficiência",
      subtitle: "Autodeclaração PcD",
      count: summary?.pcd.sim || 0,
      pct: getPctFormatted(summary?.pcd.sim || 0),
      color: "text-blue-600",
      strokeColor: "#2563EB",
      icon: Accessibility,
    },
    {
      title: "Neurodivergência",
      subtitle: "TDAH, TEA, Dislexia",
      count: summary?.neurodivergente.sim || 0,
      pct: getPctFormatted(summary?.neurodivergente.sim || 0),
      color: "text-purple-600",
      strokeColor: "#9333EA",
      icon: Brain,
    },
    {
      title: "LGBTQIAPN+",
      subtitle: "Identidade & Orientação",
      count: summary?.lgbtqiapn.sim || 0,
      pct: getPctFormatted(summary?.lgbtqiapn.sim || 0),
      color: "text-rose-500",
      strokeColor: "#F43F5E",
      icon: HeartHandshake,
    },
    {
      title: "Longevidade (60+)",
      subtitle: "Profissionais 60 anos ou mais",
      count: summary?.faixaEtaria["60_mais"] || 0,
      pct: getPctFormatted(summary?.faixaEtaria["60_mais"] || 0),
      color: "text-teal-600",
      strokeColor: "#0D9488",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Seção 1: Gráficos Principais (Donut de Gênero + Barras de Raça/Cor) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* GRÁFICO 1: GÊNERO (DONUT CHART) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribuição de Gênero</h3>
                <p className="text-[11px] text-slate-400">Representatividade por identidade</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {total} respondentes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
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
                    {/* Feminino (Rosa/Fúcsia) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#EC4899"
                      strokeWidth="12"
                      strokeDasharray={`${femStroke} ${circumference}`}
                      strokeDashoffset={femOffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Masculino (Azul Índigo) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="12"
                      strokeDasharray={`${mascStroke} ${circumference}`}
                      strokeDashoffset={mascOffset}
                      className="transition-all duration-700 ease-out"
                    />

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
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-800 tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Legenda do Donut */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium">Feminino</span>
                </div>
                <div className="text-right sm:text-left">
                  <span className="text-xs font-bold text-slate-900">{fem}</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">({getPctFormatted(fem)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium">Masculino</span>
                </div>
                <div className="text-right sm:text-left">
                  <span className="text-xs font-bold text-slate-900">{masc}</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">({getPctFormatted(masc)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium">Outro / Recusado</span>
                </div>
                <div className="text-right sm:text-left">
                  <span className="text-xs font-bold text-slate-900">{outroGen}</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">({getPctFormatted(outroGen)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: RAÇA E COR IBGE (BAR CHART HORIZONTAL) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Raça e Cor (IBGE)</h3>
                <p className="text-[11px] text-slate-400">Classificação étnico-racial declarada</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {racaItems.map((item) => {
              const pct = getPct(item.value);
              const formattedPct = getPctFormatted(item.value);

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{item.value}</span>
                      <span className="text-[11px] text-slate-400">({formattedPct}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(pct, item.value > 0 ? 3 : 0)}%`,
                        backgroundColor: item.barColor,
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
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900">Indicadores de Inclusão & Representatividade</h3>
          <p className="text-xs text-slate-400">Proporção de profissionais nos recortes afirmativos</p>
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
                className="bg-white rounded-2xl p-4 shadow-card border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Icon className={`w-4 h-4 ${inc.color}`} />
                    <span>{inc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{inc.subtitle}</p>
                  <div className="pt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900">{inc.count}</span>
                    <span className="text-xs font-semibold text-slate-500">({inc.pct}%)</span>
                  </div>
                </div>

                {/* Mini Radial Gauge */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
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
                  <span className="absolute text-[10px] font-extrabold text-slate-700">
                    {Math.round(numPct)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção 3: Gráfico de Faixas Etárias (Distribuição em Colunas) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribuição por Faixas Etárias</h3>
              <p className="text-[11px] text-slate-400">Demografia por grupos de idade</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {ageItems.map((age) => {
            const heightPct = Math.round((age.val / maxAge) * 100);
            const formattedPct = getPctFormatted(age.val);

            return (
              <div
                key={age.label}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col items-center justify-between gap-3 text-center"
              >
                <span className="text-xs font-semibold text-slate-700">{age.label}</span>

                {/* Barra Vertical */}
                <div className="w-8 h-20 bg-slate-200 rounded-full flex items-end p-0.5 overflow-hidden">
                  <div
                    className="w-full bg-[#180B38] rounded-full transition-all duration-700 ease-out"
                    style={{ height: `${Math.max(heightPct, age.val > 0 ? 10 : 0)}%` }}
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="text-base font-extrabold text-slate-900 block">{age.val}</span>
                  <span className="text-[11px] text-slate-400 font-medium">({formattedPct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
