"use client";

import React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError(response.error || "Credenciais incorretas. Tente novamente.");
      } else if (response?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Image src="/logo.webp" width={202} height={96} alt="logo" />
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-lyon-semibold text-[#4a4a4a] mb-2">
          Acesse a Hogrefe Comunica
        </h1>
        <p className="text-[#888888] font-lyon text-md">
          Entre com as credenciais para acessar sua conta:
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 bg-[#f0f0f0] border-0 rounded-md text-[#666666] placeholder:text-[#999999]"
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 bg-[#f0f0f0] border-0 rounded-md text-[#666666] placeholder:text-[#999999]"
        />

        {/* Submit Button */}
        <div className="pt-4 flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-48 h-11 bg-[#8B1A32] hover:bg-[#6d1428] text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
