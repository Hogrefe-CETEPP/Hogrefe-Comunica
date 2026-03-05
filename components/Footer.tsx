import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#748c8c] text-white mt-auto">
      {/* FAIXA PRINCIPAL — 3 LINKS (igual ao print) */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-center text-center font-akkurat-pro">
          <Link
            href="https://hogrefe.com.br/suporte-tecnico"
            className=" text-lg opacity-95 font-akkurat-regular"
          >
            Suporte técnico
          </Link>

          <Link
            href="https://hogrefe.com.br/politica-privacidade"
            className="text-lg opacity-95 font-akkurat-regular"
          >
            Políticas de privacidade
          </Link>

          <Link
            href="https://hogrefe.com.br/termos-uso"
            className="text-lg font-akkurat-regular opacity-95"
          >
            Termos e condições de uso
          </Link>
        </nav>

        {/* MÍDIAS SOCIAIS — MAIS ABAIXO */}
        <div className="mt-14 flex items-center justify-center gap-3">
          <SocialIcon Icon={Twitter} href="https://twitter.com/HogrefeCETEPP" />
          <SocialIcon
            Icon={Facebook}
            href="https://www.facebook.com/cetepp.editora/?ref=bookmarks"
          />
          <SocialIcon
            Icon={Instagram}
            href="https://www.instagram.com/editorahogrefecetepp/"
          />
          <SocialIcon
            Icon={Linkedin}
            href="https://www.linkedin.com/company/editora-hogrefe-cetepp"
          />
          <SocialIcon
            Icon={Youtube}
            href="https://www.youtube.com/channel/UCmHd9ot-sm_MD04gZogiTGg"
          />
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  Icon,
  href,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white text-[#708684] p-2 rounded-full hover:bg-gray-200 transition"
      aria-label={href}
    >
      <Icon size={20} />
    </Link>
  );
}
