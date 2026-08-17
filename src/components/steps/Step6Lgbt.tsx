"use client";

import React from "react";
import { OPCOES_SIM_NAO } from "@/lib/constants";
import { OptionCard } from "../OptionCard";

interface Step6LgbtProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Step6Lgbt: React.FC<Step6LgbtProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Comunidade LGBTQIAPN+
        </h2>
        <p className="text-sm text-slate-500">
          Você se identifica como parte da comunidade LGBTQIAPN+?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {OPCOES_SIM_NAO.map((op) => (
          <OptionCard
            key={op.value}
            idPrefix="lgbtqiapn"
            label={op.label}
            value={op.value}
            selectedValue={value}
            onChange={onChange}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-semibold mt-2">{error}</p>
      )}
    </div>
  );
};
