"use client";

import React from "react";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const FormProgress: React.FC<FormProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 mb-5">
      <div className="flex items-center justify-between text-xs font-semibold mb-2">
        <span className="text-slate-400 uppercase tracking-wider text-[10px]">
          Etapa {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-slate-800">{percentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-800 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step current topic */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{stepLabels[currentStep] || "Preenchimento"}</span>
      </div>
    </div>
  );
};
