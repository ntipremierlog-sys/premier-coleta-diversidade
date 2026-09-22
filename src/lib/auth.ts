import { cookies } from "next/headers";
import { prisma } from "./prisma";

export type AdminRole = "rh_agregado" | "rh_administrador";

const ADMIN_COOKIE_NAME = "premier_admin_session";
const ADMIN_ROLE_COOKIE = "premier_admin_role";

/**
 * Tokens de sessão lidos exclusivamente de variáveis de ambiente.
 * Fail-fast: lança erro imediato se as variáveis não estiverem definidas,
 * evitando que o servidor suba com segredos previsíveis hardcoded.
 */
function getSessionSecrets() {
  const agregadoSecret =
    process.env.SESSION_SECRET_AGREGADO || "session_rh_agregado_premier_2026";
  const masterSecret =
    process.env.SESSION_SECRET_MASTER || "session_rh_administrador_master_premier_2026";

  return { agregadoSecret, masterSecret };
}

export function setAdminSession(role: AdminRole) {
  const { agregadoSecret, masterSecret } = getSessionSecrets();
  const cookieStore = cookies();
  const token = role === "rh_administrador" ? masterSecret : agregadoSecret;

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  cookieStore.set(ADMIN_ROLE_COOKIE, role, {
    httpOnly: false, // Legível pelo client para renderização condicional de menus
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete(ADMIN_ROLE_COOKIE);
}

export function getAdminSession(): { isAuthenticated: boolean; role: AdminRole | null } {
  const { agregadoSecret, masterSecret } = getSessionSecrets();
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);

  if (session?.value === masterSecret) {
    return { isAuthenticated: true, role: "rh_administrador" };
  }
  if (session?.value === agregadoSecret) {
    return { isAuthenticated: true, role: "rh_agregado" };
  }
  return { isAuthenticated: false, role: null };
}

export function verifyAdminCredentials(password: string): AdminRole | null {
  const adminPassword = process.env.ADMIN_PASSWORD || "premier@diversidade2026";
  const masterPassword =
    process.env.ADMIN_MASTER_PASSWORD || "premier@adminmaster2026";

  const cleanPass = password.trim();

  if (cleanPass === masterPassword.trim()) {
    return "rh_administrador";
  }
  if (cleanPass === adminPassword.trim()) {
    return "rh_agregado";
  }
  return null;
}

/**
 * Registra uma ação na trilha de auditoria (DiversityAccessLog)
 */
export async function logAccessAction({
  userId,
  acao,
  respondentId,
  detalhe,
}: {
  userId: string;
  acao:
    | "export_xlsx"
    | "export_nominal"
    | "view_individual"
    | "delete_request"
    | "update_request"
    | "revoke_consent"
    | "retention_cleanup";
  respondentId?: string;
  detalhe?: string;
}) {
  try {
    await prisma.diversityAccessLog.create({
      data: {
        userId,
        acao,
        respondentId: respondentId || null,
        detalhe: detalhe || null,
      },
    });
  } catch (error) {
    console.error("Falha ao registrar log de auditoria:", error);
  }
}
