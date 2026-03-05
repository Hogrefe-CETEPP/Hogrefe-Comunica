"use client";
import React, { useState } from "react";
import { PasswordValidator } from "@/components/Configuracoes/Validator";
import { changePassword } from "@/lib/actions/change-password";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function MudarSenhaPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid =
    newPassword.length >= 8 &&
    /[a-z]/.test(newPassword) &&
    /[A-Z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) &&
    newPassword === confirmPassword &&
    newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Por favor, preencha a senha atual");
      return;
    }

    if (!isPasswordValid) {
      setError("Por favor, verifique os requisitos da senha");
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(currentPassword, newPassword);

      if (!result.success) {
        setError(result.error || "Erro ao alterar senha");
      } else {
        alert("Senha alterada com sucesso!");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <img className="fixed min-h-screen z-50 " src="/barra2.png" alt="barra" />
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[900px]">
          <div className="flex items-center gap-3 mb-8">
            <img src="/livro.png" alt="livro" className="h-[51px] w-[56px]" />
            <h1 className="text-4xl font-serif text-[#464646]">Mudar Senha</h1>
          </div>

          <div className="rounded-2xl p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Senha Atual */}
              <div className="space-y-2">
                <label className="text-[#464646] font-medium text-sm">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-600  text-[#464646] focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <label className="text-[#464646] font-medium text-sm">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-600  text-[#464646] focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <label className="text-[#464646] font-medium text-sm">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-600  text-[#464646] focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <PasswordValidator
                  password={newPassword}
                  confirmPassword={confirmPassword}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid}
                  className="flex-1 px-8 py-3 bg-[#F8F9D1] text-[#464646] rounded-lg font-medium hover:bg-[#ebe9c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Alterando..." : "Alterar Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
