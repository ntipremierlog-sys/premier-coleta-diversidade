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
    { label: "Parda", value: summary?.racaCor.parda || 0, barColor: "#D97706", dotColor: "bg-amber-600" },
    { label: "Branca", value: summary?.racaCor.branca || 0, barColor: "#64748B", dotColor: "bg-slate-500" },
    { label: "Preta", value: summary?.racaCor.preta || 0, barColor: "#262626", dotColor: "bg-neutral-800" },
    { label: "Amarela", value: summary?.racaCor.amarela || 0, barColor: "#CA8A04", dotColor: "bg-yellow-600" },
    { label: "Indígena", value: summary?.racaCor.indigena || 0, barColor: "#059669", dotColor: "bg-emerald-600" },
    { label: "Não informado", value: summary?.racaCor.nao_informado || 0, barColor: "#94A3B8", dotColor: "bg-slate-400" },
  ];

  // Dados Faixa Etária
  const ageItems = [
    { label: "Até 29", val: summary?.faixaEtaria.ate_29 || 0 },
    { label: "30 a 44", val: summary?.faixaEtaria["30_44"] || 0 },
    { label: "45 a 59", val: summary?.faixaEtaria["45_59"] || 0 },
    { label: "60+", val: summary?.faixaEtaria["60_mais"] || 0 },
  ];

  const maxAge = Math.max(1, ...ageItems.map((a) => a.val));

  // Dados Inclusão Afirmativa
  const inclusionItems = [
    {
      title: "PcD",
      subtitle: "Pessoas com Deficiência",
      count: summary?.pcd.sim || 0,
      pct: getPctFormatted(summary?.pcd.sim || 0),
      strokeColor: "#2563EB",
      icon: Accessibility,
      iconColor: "text-blue-600",
    },
    {
      title: "Neurodivergência",
      subtitle: "TDAH, TEA, Dislexia",
      count: summary?.neurodivergente.sim || 0,
      pct: getPctFormatted(summary?.neurodivergente.sim || 0),
      strokeColor: "#7C3AED",
      icon: Brain,
      iconColor: "text-purple-600",
    },
    {
      title: "LGBTQIAPN+",
      subtitle: "Diversidade de Gênero",
      count: summary?.lgbtqiapn.sim || 0,
      pct: getPctFormatted(summary?.lgbtqiapn.sim || 0),
      strokeColor: "#E11D48",
      icon: HeartHandshake,
      iconColor: "text-rose-600",
    },
    {
      title: "Longevidade",
      subtitle: "Profissionais 60+ anos",
      count: summary?.faixaEtaria["60_mais"] || 0,
      pct: getPctFormatted(summary?.faixaEtaria["60_mais"] || 0),
      strokeColor: "#059669",
      icon: CalendarClock,
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Seção 1: Donut de Gênero + Barras de Raça/Cor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* GRÁFICO 1: GÊNERO */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Identidade de Gênero
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {total} respondentes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-1">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="11"
                />

                {total > 0 && (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#E11D48"
                      strokeWidth="11"
                      strokeDasharray={`${femStroke} ${circumference}`}
                      strokeDashoffset={femOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#2563EB"
                      strokeWidth="11"
                      strokeDasharray={`${mascStroke} ${circumference}`}
                      strokeDashoffset={mascOffset}
                      className="transition-all duration-500 ease-out"
                    />

                    {mTransPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#9333EA"
                        strokeWidth="11"
                        strokeDasharray={`${mTransStroke} ${circumference}`}
                        strokeDashoffset={mTransOffset}
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {hTransPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#0284C7"
                        strokeWidth="11"
                        strokeDasharray={`${hTransStroke} ${circumference}`}
                        strokeDashoffset={hTransOffset}
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {outroPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#94A3B8"
                        strokeWidth="11"
                        strokeDasharray={`${outroStroke} ${circumference}`}
                        strokeDashoffset={outroOffset}
                        className="transition-all duration-500 ease-out"
                      />
                    )}
                  </>
                )}
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-slate-800">
                  {total}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Legenda Minimalista */}
            <div className="space-y-2 w-full sm:w-auto text-xs">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] shrink-0" />
                  <span className="text-slate-600">Feminino</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {fem} <span className="text-slate-400 font-normal">({getPctFormatted(fem)}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
                  <span className="text-slate-600">Masculino</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {masc} <span className="text-slate-400 font-normal">({getPctFormatted(masc)}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9333EA] shrink-0" />
                  <span className="text-slate-600">Mulher Trans</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {mulherTrans} <span className="text-slate-400 font-normal">({getPctFormatted(mulherTrans)}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                  <span className="text-slate-600">Homem Trans</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {homemTrans} <span className="text-slate-400 font-normal">({getPctFormatted(homemTrans)}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-slate-600">Outro / Recusado</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {outroGen} <span className="text-slate-400 font-normal">({getPctFormatted(outroGen)}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: RAÇA E COR IBGE */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Raça e Cor (IBGE)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Autodeclaração
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {racaItems.map((item) => {
              const pct = getPct(item.value);
              const formattedPct = getPctFormatted(item.value);

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                      <span className="text-slate-700">{item.label}</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {item.value} <span className="text-slate-400 font-normal">({formattedPct}%)</span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
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

      {/* Seção 2: Indicadores de Inclusão (4 cartões clean) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inclusionItems.map((inc) => {
          const Icon = inc.icon;
          const numPct = parseFloat(inc.pct);
          const radius = 24;
          const circ = 2 * Math.PI * radius;
          const strokeDash = (numPct / 100) * circ;

          return (
            <div
              key={inc.title}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Icon className={`w-3.5 h-3.5 ${inc.iconColor}`} />
                  <span>{inc.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{inc.subtitle}</p>
                <div className="pt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-900">{inc.count}</span>
                  <span className="text-xs text-slate-400">({inc.pct}%)</span>
                </div>
              </div>

              {/* Gauge Circular Fino */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="5"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke={inc.strokeColor}
                    strokeWidth="5"
                    strokeDasharray={`${strokeDash} ${circ}`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-slate-700">
                  {Math.round(numPct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção 3: Distribuição por Faixas Etárias */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Faixas Etárias
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Distribuição demográfica
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {ageItems.map((age) => {
            const heightPct = Math.round((age.val / maxAge) * 100);
            const formattedPct = getPctFormatted(age.val);

            return (
              <div
                key={age.label}
                className="bg-slate-50/70 rounded-lg p-3 border border-slate-200/60 flex flex-col items-center justify-between gap-2.5 text-center"
              >
                <span className="text-xs font-medium text-slate-600">{age.label}</span>

                {/* Barra Vertical Minimalista */}
                <div className="w-6 h-20 bg-slate-200/60 rounded-full flex items-end p-0.5 overflow-hidden">
                  <div
                    className="w-full bg-[#180B38] rounded-full transition-all duration-500 ease-out"
                    style={{ height: `${Math.max(heightPct, age.val > 0 ? 10 : 0)}%` }}
                  />
                </div>

                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    {age.val}
                  </span>
                  <span className="text-[10px] text-slate-400">
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
