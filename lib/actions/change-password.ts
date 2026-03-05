"use server";

import db from "../db";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";

interface ChangePasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const userAuth = await getCurrentUser();
    if (userAuth.role !== "admin") {
      return { success: false, error: "Usuário não autenticado" };
    }
    if (!session || !session.user || !userEmail) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!currentPassword) {
      return { success: false, error: "Senha atual é obrigatória" };
    }

    if (!newPassword) {
      return { success: false, error: "Nova senha é obrigatória" };
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return {
        success: false,
        error:
          "A nova senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial",
      };
    }

    const [rows] = await db.query(
      "SELECT id, password FROM userscomunicados WHERE email = ?",
      [userEmail],
    );

    const users = rows as Array<{ id: string; password: string }>;

    if (!users || users.length === 0) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const user = users[0];

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: "Senha atual incorreta" };
    }

    // Hash da nova senha
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await db.query("UPDATE userscomunicados SET password = ? WHERE email = ?", [
      hashedNewPassword,
      userEmail,
    ]);

    return { success: true, message: "Senha atualizada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
