"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FormProgress } from "@/components/FormProgress";
import { Step0Consent } from "@/components/steps/Step0Consent";
import { Step05Identification, ConsentimentosState } from "@/components/steps/Step05Identification";
import { Step1Gender } from "@/components/steps/Step1Gender";
import { Step2Race } from "@/components/steps/Step2Race";
import { Step3Pcd } from "@/components/steps/Step3Pcd";
import { Step4Neuro } from "@/components/steps/Step4Neuro";
import { Step5Age } from "@/components/steps/Step5Age";
import { Step6Lgbt } from "@/components/steps/Step6Lgbt";
import { Step7Other } from "@/components/steps/Step7Other";
import { Step8Confirm } from "@/components/steps/Step8Confirm";
import { SuccessView } from "@/components/SuccessView";
import { getCurrentCompetencia, UNIDADES } from "@/lib/constants";
import { validateCpf } from "@/lib/cpf-utils";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";

interface StepConfig {
  id: number;
  key: string;
  label: string;
  isAvailable: boolean;
}

function FormContent() {
  const searchParams = useSearchParams();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Unidade & Competência
    unidade: "",
    competencia: getCurrentCompetencia(),
    termoConsentimento: false,

    // Identificação
    nomeCompleto: "",
    cpf: "",
    matricula: "",

    // Consentimentos Granulares
    consentimentos: {
      raca_cor: true,
      pcd: true,
      neurodivergencia: true,
      lgbtqiapn: true,
      geral: true,
    } as ConsentimentosState,

    // Respostas
    genero: "nao_informado",
    racaCor: "",
    pcd: "nao_informado",
    pcdTipo: "",
    neurodivergente: "nao_informado",
    faixaEtaria: "nao_informado",
    lgbtqiapn: "nao_informado",
    outroGrupo: "",
  });

  // Inicializar com parâmetros da URL se existirem
  useEffect(() => {
    const urlUnidade = searchParams.get("unidade");
    const urlCompetencia = searchParams.get("competencia");

    if (urlUnidade && UNIDADES.includes(urlUnidade as any)) {
      setFormData((prev) => ({ ...prev, unidade: urlUnidade }));
    }
    if (urlCompetencia) {
      setFormData((prev) => ({ ...prev, competencia: urlCompetencia }));
    }
  }, [searchParams]);

  // Lista dinâmica de etapas ativas conforme os consentimentos concedidos
  const activeSteps: StepConfig[] = useMemo(() => {
    const steps: StepConfig[] = [
      { id: 0, key: "unidade", label: "Unidade & Competência", isAvailable: true },
      { id: 1, key: "identificacao", label: "Identificação & LGPD", isAvailable: true },
      {
        id: 2,
        key: "genero",
        label: "Gênero",
        isAvailable: formData.consentimentos.geral,
      },
      {
        id: 3,
        key: "racaCor",
        label: "Raça e Cor (IBGE)",
        isAvailable: formData.consentimentos.raca_cor,
      },
      {
        id: 4,
        key: "pcd",
        label: "Pessoa com Deficiência",
        isAvailable: formData.consentimentos.pcd,
      },
      {
        id: 5,
        key: "neuro",
        label: "Neurodivergência",
        isAvailable: formData.consentimentos.neurodivergencia,
      },
      {
        id: 6,
        key: "faixaEtaria",
        label: "Faixa Etária",
        isAvailable: formData.consentimentos.geral,
      },
      {
        id: 7,
        key: "lgbtqiapn",
        label: "LGBTQIAPN+",
        isAvailable: formData.consentimentos.lgbtqiapn,
      },
      {
        id: 8,
        key: "outro",
        label: "Outro Grupo (Opcional)",
        isAvailable: true,
      },
      {
        id: 9,
        key: "confirmacao",
        label: "Confirmação e Envio",
        isAvailable: true,
      },
    ];

    return steps.filter((s) => s.isAvailable);
  }, [formData.consentimentos]);

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;
  const stepLabels = activeSteps.map((s) => s.label);

  // Limpar erro ao mudar de etapa
  useEffect(() => {
    setStepError(null);
  }, [currentStepIndex]);

  // Validação por etapa
  const validateStep = (): boolean => {
    setStepError(null);

    if (currentStep.key === "unidade") {
      if (!formData.termoConsentimento) {
        setStepError("Você precisa abrir, ler e aceitar o Termo de Esclarecimentos para prosseguir.");
        return false;
      }
      if (!formData.unidade) {
        setStepError("Por favor, selecione sua unidade/filial de atuação.");
        return false;
      }
    } else if (currentStep.key === "identificacao") {
      if (!formData.nomeCompleto.trim() || formData.nomeCompleto.trim().length < 3) {
        setStepError("Por favor, informe seu nome completo.");
        return false;
      }
      if (!formData.cpf || !validateCpf(formData.cpf)) {
        setStepError("Por favor, digite um CPF válido.");
        return false;
      }
    } else if (currentStep.key === "genero") {
      if (!formData.genero || formData.genero === "nao_informado") {
        setStepError("Por favor, selecione uma opção de gênero.");
        return false;
      }
    } else if (currentStep.key === "racaCor") {
      if (!formData.racaCor) {
        setStepError("Por favor, selecione uma opção de raça/cor para continuar.");
        return false;
      }
    } else if (currentStep.key === "pcd") {
      if (!formData.pcd || formData.pcd === "nao_informado") {
        setStepError("Por favor, selecione uma opção para Pessoa com Deficiência.");
        return false;
      }
    } else if (currentStep.key === "neuro") {
      if (!formData.neurodivergente || formData.neurodivergente === "nao_informado") {
        setStepError("Por favor, selecione uma opção para neurodivergência.");
        return false;
      }
    } else if (currentStep.key === "faixaEtaria") {
      if (!formData.faixaEtaria || formData.faixaEtaria === "nao_informado") {
        setStepError("Por favor, selecione sua faixa etária.");
        return false;
      }
    } else if (currentStep.key === "lgbtqiapn") {
      if (!formData.lgbtqiapn || formData.lgbtqiapn === "nao_informado") {
        setStepError("Por favor, selecione uma opção para a comunidade LGBTQIAPN+.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrev = () => {
    setStepError(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao enviar suas respostas.");
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message || "Falha na conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCurrentStepIndex(0);
    setFormData({
      unidade: "",
      competencia: getCurrentCompetencia(),
      termoConsentimento: false,
      nomeCompleto: "",
      cpf: "",
      matricula: "",
      consentimentos: {
        raca_cor: true,
        pcd: true,
        neurodivergencia: true,
        lgbtqiapn: true,
        geral: true,
      },
      genero: "nao_informado",
      racaCor: "",
      pcd: "nao_informado",
      pcdTipo: "",
      neurodivergente: "nao_informado",
      faixaEtaria: "nao_informado",
      lgbtqiapn: "nao_informado",
      outroGrupo: "",
    });
  };

  const isLastStep = currentStep.key === "confirmacao";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-premier-bg">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center">
        {isSubmitted ? (
          <SuccessView unidade={formData.unidade} onReset={handleReset} />
        ) : (
          <div className="w-full">
            <FormProgress
              currentStep={currentStepIndex}
              totalSteps={totalSteps}
              stepLabels={stepLabels}
            />

            {/* Card Principal */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-card border border-slate-200/90 transition-all duration-200">
              {currentStep.key === "unidade" && (
                <Step0Consent
                  unidade={formData.unidade}
                  competencia={formData.competencia}
                  termoConsentimento={formData.termoConsentimento}
                  onUpdate={(fields) => setFormData((prev) => ({ ...prev, ...fields }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "identificacao" && (
                <Step05Identification
                  nomeCompleto={formData.nomeCompleto}
                  cpf={formData.cpf}
                  matricula={formData.matricula}
                  consentimentos={formData.consentimentos}
                  onUpdate={(fields) =>
                    setFormData((prev) => ({
                      ...prev,
                      ...fields,
                      consentimentos: fields.consentimentos || prev.consentimentos,
                    }))
                  }
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "genero" && (
                <Step1Gender
                  value={formData.genero}
                  onChange={(val) => setFormData((prev) => ({ ...prev, genero: val }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "racaCor" && (
                <Step2Race
                  value={formData.racaCor}
                  onChange={(val) => setFormData((prev) => ({ ...prev, racaCor: val }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "pcd" && (
                <Step3Pcd
                  pcd={formData.pcd}
                  pcdTipo={formData.pcdTipo}
                  onUpdate={(fields) =>
                    setFormData((prev) => ({ ...prev, ...fields }))
                  }
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "neuro" && (
                <Step4Neuro
                  value={formData.neurodivergente}
                  onChange={(val) => setFormData((prev) => ({ ...prev, neurodivergente: val }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "faixaEtaria" && (
                <Step5Age
                  value={formData.faixaEtaria}
                  onChange={(val) => setFormData((prev) => ({ ...prev, faixaEtaria: val }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "lgbtqiapn" && (
                <Step6Lgbt
                  value={formData.lgbtqiapn}
                  onChange={(val) => setFormData((prev) => ({ ...prev, lgbtqiapn: val }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "outro" && (
                <Step7Other
                  value={formData.outroGrupo}
                  onChange={(val) => setFormData((prev) => ({ ...prev, outroGrupo: val }))}
                  error={stepError || undefined}
                />
              )}

              {currentStep.key === "confirmacao" && (
                <Step8Confirm
                  unidade={formData.unidade}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  submitError={submitError}
                />
              )}

              {/* Botões de Navegação */}
              {!isLastStep && (
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  {currentStepIndex > 0 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#180B38] hover:bg-[#281458] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all ml-auto"
                  >
                    <span>Avançar</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isLastStep && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-start">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Voltar e revisar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Rodapé de Segurança */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Conexão criptografada • Tratamento em conformidade com a LGPD
              </span>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white/50 mt-auto">
        <p>© {new Date().getFullYear()} Premier Logistics Gestão Empresarial Ltda. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-premier-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}
