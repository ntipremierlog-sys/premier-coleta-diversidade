"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, ShieldCheck, HeartHandshake, RotateCcw } from "lucide-react";

interface SuccessViewProps {
  unidade: string;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ unidade, onReset }) => {
  useEffect(() => {
    // Dispara confetes comemorativos
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0B2545", "#1E5F8C", "#F2A93B", "#2E9E6B"],
      });
    } catch (e) {
      // Ignora caso canvas não esteja disponível
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-card border border-slate-200 text-center space-y-6 animate-fadeIn max-w-xl mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-premier-primary font-heading">
          Muito obrigado pela sua participação!
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Sua autodeclaração foi registrada com sucesso e de forma{" "}
          <strong className="text-emerald-700">estritamente anônima</strong>.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs sm:text-sm text-slate-600 space-y-2 text-left">
        <div className="flex items-start gap-2.5">
          <HeartHandshake className="w-4 h-4 text-premier-secondary shrink-0 mt-0.5" />
          <span>
            Sua contribuição fortalece as iniciativas de <strong>Diversidade, Equidade & Inclusão</strong> na Premier Logistics ({unidade || "sua unidade"}).
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Os dados serão consolidados no <strong>Extrato de Diversidade</strong> sem qualquer vínculo a você.
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Realizar outro preenchimento</span>
        </button>
      </div>
    </div>
  );
};
