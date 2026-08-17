"use client";

import React, { useState } from "react";
import { formatCpfInput, validateCpf } from "@/lib/cpf-utils";
import {
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";

export interface ConsentimentosState {
  raca_cor: boolean;
  pcd: boolean;
  neurodivergencia: boolean;
  lgbtqiapn: boolean;
  geral: boolean;
}

interface Step05IdentificationProps {
  nomeCompleto: string;
  cpf: string;
  matricula: string;
  consentimentos: ConsentimentosState;
  onUpdate: (fields: {
    nomeCompleto?: string;
    cpf?: string;
    matricula?: string;
    consentimentos?: ConsentimentosState;
  }) => void;
  error?: string;
}

export const Step05Identification: React.FC<Step05IdentificationProps> = ({
  nomeCompleto,
  cpf,
  matricula,
  consentimentos,
  onUpdate,
  error,
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const isCpfValid = cpf ? validateCpf(cpf) : false;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfInput(e.target.value);
    onUpdate({ cpf: formatted });
  };

  const toggleConsent = (key: keyof ConsentimentosState) => {
    onUpdate({
      consentimentos: {
        ...consentimentos,
        [key]: !consentimentos[key],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Limpo - Sem caixas coloridas */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Identificação do Colaborador
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Preencha seus dados para atualização cadastral. O tratamento é protegido nos termos da LGPD.
        </p>
      </div>

      {/* Formulário de Identificação */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Nome Completo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="nome-completo-input"
            value={nomeCompleto}
            onChange={(e) => onUpdate({ nomeCompleto: e.target.value })}
            placeholder="Digite seu nome completo..."
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                CPF <span className="text-rose-500">*</span>
              </label>
              {cpf && (
                <span
                  className={`text-[10px] font-semibold flex items-center gap-1 ${
                    isCpfValid ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {isCpfValid ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Válido
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Inválido
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              id="cpf-input"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14}
              placeholder="000.000.000-00"
              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 ${
                cpf && !isCpfValid
                  ? "border-rose-300 focus:ring-rose-200 focus:border-rose-400"
                  : "border-slate-300 focus:ring-slate-400 focus:border-slate-500"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Matrícula (Opcional)
            </label>
            <input
              type="text"
              id="matricula-input"
              value={matricula}
              onChange={(e) => onUpdate({ matricula: e.target.value })}
              placeholder="Ex: 004589"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Consentimentos Granulares - Design Limpo e Minimalista */}
      <div className="space-y-3 pt-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-800">
            Autorizações por Categoria
          </h3>
          <p className="text-xs text-slate-500">
            Você pode autorizar ou recusar cada tema. Etapas desmarcadas serão puladas automaticamente.
          </p>
        </div>

        {/* Lista de Opções de Consentimento - Fundo Branco e Borda Limpa */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
          {[
            {
              key: "raca_cor" as const,
              title: "Raça / Cor (IBGE)",
              desc: "Classificação étnico-racial",
            },
            {
              key: "pcd" as const,
              title: "Pessoa com Deficiência (PcD)",
              desc: "Acessibilidade e inclusão",
            },
            {
              key: "neurodivergencia" as const,
              title: "Neurodivergência",
              desc: "TEA, TDAH, Dislexia e afins",
            },
            {
              key: "lgbtqiapn" as const,
              title: "Comunidade LGBTQIAPN+",
              desc: "Diversidade de gênero e orientação",
            },
            {
              key: "geral" as const,
              title: "Gênero e Faixa Etária",
              desc: "Mapeamento demográfico básico",
            },
          ].map((item) => {
            const isAccepted = consentimentos[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleConsent(item.key)}
                className="cursor-pointer p-3 sm:px-4 sm:py-3 transition-colors hover:bg-slate-50 flex items-center justify-between gap-3 select-none"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.desc}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                      isAccepted
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {isAccepted ? "Autorizado" : "Recusado"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmação de Leitura */}
      <div
        onClick={() => setHasReadTerms(!hasReadTerms)}
        className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
          hasReadTerms
            ? "border-slate-800 bg-slate-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <div className="pt-0.5 text-slate-900">
          {hasReadTerms ? (
            <CheckSquare className="w-5 h-5 fill-slate-900 text-white" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <label className="cursor-pointer text-xs font-medium text-slate-700 leading-snug">
            Li e compreendi a finalidade do tratamento e minhas opções de consentimento (LGPD).
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
