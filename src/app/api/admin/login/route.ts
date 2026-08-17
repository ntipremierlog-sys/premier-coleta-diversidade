import { NextRequest, NextResponse } from "next/server";
import { setAdminSession, verifyAdminCredentials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Informe a senha de acesso." },
        { status: 400 }
      );
    }

    const role = verifyAdminCredentials(password);

    if (!role) {
      return NextResponse.json(
        { error: "Senha de acesso incorreta." },
        { status: 401 }
      );
    }

    setAdminSession(role);

    return NextResponse.json({
      success: true,
      role,
      message: `Autenticado com sucesso no perfil ${role === "rh_administrador" ? "Administrador de RH (Acesso Completo)" : "RH Agregado"}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar autenticação." },
      { status: 500 }
    );
  }
}
