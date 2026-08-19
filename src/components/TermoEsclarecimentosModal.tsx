"use client";

import React, { useState, useRef, useEffect } from "react";
import { TERMO_ESCLARECIMENTOS } from "@/lib/termo-esclarecimentos";
import { FileText, Download, CheckCircle2, X, Eye, ShieldCheck, ArrowDown } from "lucide-react";

interface TermoEsclarecimentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isAccepted: boolean;
}

export const TermoEsclarecimentosModal: React.FC<TermoEsclarecimentosModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isAccepted,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Se já foi aceito anteriormente ou o conteúdo cabe sem scroll, permitir aceite
      const checkScroll = () => {
        if (contentRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
          if (scrollHeight - scrollTop - clientHeight < 40) {
            setHasScrolledBottom(true);
          }
        }
      };
      
      // Delay pequeno para garantir renderização das dimensões
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (contentRef.current && !hasScrolledBottom) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight - scrollTop - clientHeight < 40) {
        setHasScrolledBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#180B38] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold leading-tight font-heading">
                Termo de Esclarecimentos
              </h3>
              <p className="text-xs text-slate-300">
                Autodeclaração de Diversidade (LGPD)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Text Container */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-700 text-sm leading-relaxed bg-slate-50/50"
        >
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 font-medium">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Documento oficial do projeto de coleta de dados.</span>
            </div>
            <a
              href="/TERMO_DE_ESCLARECIMENTOS.docx"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm transition-colors text-[11px] shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar (.docx)</span>
            </a>
          </div>

          <div className="space-y-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900 text-center text-sm sm:text-base border-b border-slate-100 pb-3">
              {TERMO_ESCLARECIMENTOS.titulo}
            </h4>

            {TERMO_ESCLARECIMENTOS.paragrafos.map((parag, index) => {
              const isLast = index === TERMO_ESCLARECIMENTOS.paragrafos.length - 1;
              return (
                <p
                  key={index}
                  className={
                    isLast
                      ? "font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2"
                      : ""
                  }
                >
                  {parag}
                </p>
              );
            })}
          </div>

          {!hasScrolledBottom && !isAccepted && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium py-1 animate-bounce">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Role até o final do documento para habilitar a confirmação</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {isAccepted ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Termo lido e aceito com sucesso!
              </span>
            ) : hasScrolledBottom ? (
              <span className="text-slate-600">
                Clique no botão ao lado para confirmar o aceite.
              </span>
            ) : (
              <span className="text-amber-700 font-medium">
                Role o texto até o final para confirmar o aceite.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>

            <button
              type="button"
              disabled={!hasScrolledBottom && !isAccepted}
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#180B38] hover:bg-[#281458] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Li e Aceito os Termos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
