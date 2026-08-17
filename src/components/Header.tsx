"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { PremierLogo } from "./PremierLogo";

interface HeaderProps {
  showAdminLink?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showAdminLink = true }) => {
  return (
    <header className="w-full bg-[#24134a] text-white border-b border-[#351e68]">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Título Oficial */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center group focus:outline-none shrink-0">
            <PremierLogo className="h-11 sm:h-12 w-auto group-hover:opacity-95 transition-opacity" />
          </Link>

          <div className="h-8 w-px bg-white/20 hidden sm:block" />

          <h1 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide text-center sm:text-left">
            Autodeclaração de Diversidade
          </h1>
        </div>

        {/* Indicador LGPD & Acesso Gestão */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Símbolo de Conformidade LGPD */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>De acordo com a LGPD</span>
          </div>

          {/* Link Painel de Gestão */}
          {showAdminLink && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors py-1.5 px-2.5 rounded-lg hover:bg-white/10 border border-white/10"
              title="Painel Administrativo"
            >
              <Lock className="w-3.5 h-3.5 opacity-70" />
              <span>Gestão</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
