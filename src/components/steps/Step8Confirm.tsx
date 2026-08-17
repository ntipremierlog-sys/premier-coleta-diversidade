"use client";

import React from "react";
import { Send } from "lucide-react";

interface Step8ConfirmProps {
  unidade: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  submitError?: string | null;
}

export const Step8Confirm: React.FC<Step8ConfirmProps> = ({
  unidade,
  isSubmitting,
  onSubmit,
  submitError,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Confirmação e Envio
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Tudo pronto! Revise as informações e envie sua autodeclaração para a unidade <strong>{unidade || "selecionada"}</strong>.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          Suas respostas serão tratadas com segurança e sigilo, destinadas à atualização cadastral e mapeamento de diversidade da Premier Logistics.
        </p>
      </div>

      {submitError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
          {submitError}
        </div>
      )}

      <button
        type="button"
        id="submit-form-button"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="w-full bg-[#180B38] hover:bg-[#281458] text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Enviando dados...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Enviar autodeclaração</span>
          </>
        )}
      </button>
    </div>
  );
};
