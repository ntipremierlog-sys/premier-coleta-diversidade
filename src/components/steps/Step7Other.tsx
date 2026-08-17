"use client";

import React from "react";

interface Step7OtherProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Step7Other: React.FC<Step7OtherProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Outro Grupo Sub-representado
        </h2>
        <p className="text-sm text-slate-500">
          Você se identifica com algum outro grupo sub-representado não listado nas etapas anteriores? (Opcional)
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          id="outro-grupo-textarea"
          rows={3}
          maxLength={120}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Se sim, descreva brevemente aqui (opcional)..."
          className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 resize-none"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Opcional</span>
          <span>{value.length}/120</span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-semibold mt-2">{error}</p>
      )}
    </div>
  );
};
