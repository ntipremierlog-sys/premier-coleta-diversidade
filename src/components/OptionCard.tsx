"use client";

import React from "react";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  description?: string;
  idPrefix?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  value,
  selectedValue,
  onChange,
  description,
  idPrefix = "option",
}) => {
  const isSelected = selectedValue === value;
  const inputId = `${idPrefix}-${value}`;

  return (
    <div
      onClick={() => onChange(value)}
      className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-150 flex items-center gap-3 select-none bg-white ${
        isSelected
          ? "border-slate-900 ring-1 ring-slate-900 shadow-sm"
          : "border-slate-200 hover:border-slate-400"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
          isSelected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white"
        }`}
      >
        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
      </div>

      <div className="flex-1">
        <label
          htmlFor={inputId}
          className={`cursor-pointer text-xs sm:text-sm transition-colors ${
            isSelected ? "font-bold text-slate-900" : "font-medium text-slate-700"
          }`}
        >
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        )}
      </div>

      <input
        type="radio"
        id={inputId}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
    </div>
  );
};
