"use client";

import { Check, X } from "lucide-react";

interface PasswordValidatorProps {
  password: string;
  confirmPassword: string;
}

interface ValidationRule {
  label: string;
  isValid: boolean;
}

export function PasswordValidator({
  password,
  confirmPassword,
}: PasswordValidatorProps) {
  const rules: ValidationRule[] = [
    {
      label: "Minimo 8 caracteres",
      isValid: password.length >= 8,
    },
    {
      label: "Letra Minúscula",
      isValid: /[a-z]/.test(password),
    },
    {
      label: "Letra Maiúscula",
      isValid: /[A-Z]/.test(password),
    },
    {
      label: "Número",
      isValid: /\d/.test(password),
    },
    {
      label: "Caractere Especial",
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      label: "Senhas Coincidem",
      isValid: password === confirmPassword && password.length > 0,
    },
  ];

  const allValid = rules.every((rule) => rule.isValid);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#464646] mb-3">
        Requisitos da Senha
      </p>
      <div className="space-y-1">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {rule.isValid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className={rule.isValid ? "text-green-400" : "text-red-400"}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
      {allValid && (
        <div className="mt-3 p-2 bg-green-900/20 border border-green-500/20 rounded-md">
          <p className="text-green-400 text-sm font-medium">✓ Senha Válida!</p>
        </div>
      )}
    </div>
  );
}
