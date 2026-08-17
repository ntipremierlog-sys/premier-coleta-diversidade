import crypto from "crypto";

/**
 * Remove todos os caracteres não numéricos do CPF
 */
export function cleanCpf(cpf: string): string {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "");
}

/**
 * Validação algorítmica completa de CPF com cálculo dos dígitos verificadores
 */
export function validateCpf(cpf: string): boolean {
  const digits = cleanCpf(cpf);

  if (digits.length !== 11) return false;

  // Rejeita sequências com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit1 = rest === 10 || rest === 11 ? 0 : rest;
  if (digit1 !== parseInt(digits.charAt(9), 10)) return false;

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  rest = 11 - (sum % 11);
  let digit2 = rest === 10 || rest === 11 ? 0 : rest;
  if (digit2 !== parseInt(digits.charAt(10), 10)) return false;

  return true;
}

/**
 * Formata CPF para visualização segura no padrão "123.***.***-45"
 */
export function maskCpf(cpf: string): string {
  const digits = cleanCpf(cpf);
  if (digits.length !== 11) return "000.***.***-00";
  const part1 = digits.slice(0, 3);
  const part4 = digits.slice(9, 11);
  return `${part1}.***.***-${part4}`;
}

/**
 * Aplica máscara de digitação em tempo real "000.000.000-00"
 */
export function formatCpfInput(value: string): string {
  const digits = cleanCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9
  )}-${digits.slice(9, 11)}`;
}

/**
 * Gera hash determinístico HMAC-SHA256 para checagem de unicidade/busca sem expor o CPF em texto plano
 */
export function hashCpf(cpf: string): string {
  const digits = cleanCpf(cpf);
  const secret =
    process.env.CPF_HASH_SECRET ||
    "premier_secret_key_cpf_hash_2026_x89a";
  return crypto.createHmac("sha256", secret).update(digits).digest("hex");
}
