"use client";

import { ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="w-[240px] bg-[#1A1A27] text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="border-b border-gray-700/50">
        <div className="flex gap-2 p-4">
          <Image src="/logo2.webp" alt="Logo" width={120} height={76} />
        </div>
      </div>

      <nav className="flex flex-col p-4 gap-1">
        <Link href="/dashboard/">
          <button className="w-full cursor-pointer flex items-center justify-between px-4 py-3 hover:bg-gray-700/30 rounded-md text-sm transition-colors">
            <span>Cadastrar comunicado</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>

        <Link href="/dashboard/editar-comunicados">
          <button className="w-full cursor-pointer flex items-center justify-between px-4 py-3 hover:bg-gray-700/30 rounded-md text-sm transition-colors">
            <span>Visualizar comunicados</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/dashboard/configuracoes">
          <button className="w-full cursor-pointer flex items-center justify-between px-4 py-3 hover:bg-gray-700/30 rounded-md text-sm transition-colors">
            <span>Configurações</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </nav>

      <div className="mt-auto p-4 border-t border-gray-700/50">
        <button
          className="w-full flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          onClick={() => {
            signOut();
          }}
        >
          <LogOut className="w-4 h-4" />
          Fazer logout
        </button>
      </div>
    </aside>
  );
}
