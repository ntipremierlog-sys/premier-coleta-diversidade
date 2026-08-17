"use client";

import React from "react";
import { GENEROS } from "@/lib/constants";
import { OptionCard } from "../OptionCard";

interface Step1GenderProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Step1Gender: React.FC<Step1GenderProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Gênero
        </h2>
        <p className="text-sm text-slate-500">
          Com qual gênero você se identifica?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {GENEROS.map((g) => (
          <OptionCard
            key={g.value}
            idPrefix="genero"
            label={g.label}
            value={g.value}
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
