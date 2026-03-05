"use client";
import { Home, ChevronRight, Download } from "lucide-react";
import Footer from "./Footer";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useEffect, useRef, useState } from "react";

interface PreviewLayout1Props {
  title: string;
  tags: string[];
  image: string | null;
  text: string;
  downloadButtonText: string;
  downloadFile: string | null;
  downloadButtonText2?: string;
  accessLink?: string;
  textAboveDownloadButton?: string;
  date: Date;
  updated: Date;
}

export function PreviewLayout1({
  title,
  tags,
  image,
  text,
  downloadFile,
  downloadButtonText,
  date,
  updated,
  downloadButtonText2,
  accessLink,
  textAboveDownloadButton,
}: PreviewLayout1Props) {
  // Extrai blocos de nivel superior do HTML (p, ul, ol, div, etc.)
  const extractBlocks = (html: string) => {
    const blockRegex = /<(p|ul|ol|div|blockquote|h[1-6])[^>]*>[\s\S]*?<\/\1>/gi;
    const matches = [...html.matchAll(blockRegex)];
    return matches.map((m) => m[0]);
  };
  const pathname = usePathname();
  const router = useRouter();

  const applyFontStyles = (html: string) => {
    return html
      .replace(
        /<p([^>]*)>/gi,
        "<p$1 style=\"font-family: 'Akkurat Pro Light', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 300; font-size: 18px; text-align: justify; text-justify: inter-word; hyphens: auto; word-break: break-word; line-height: 1.7; color: #464646;\">",
      )
      .replace(
        /<li([^>]*)>/gi,
        "<li$1 style=\"font-family: 'Akkurat Pro Light', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 300; font-size: 18px; text-align: justify; text-justify: inter-word; hyphens: auto; word-break: break-word; line-height: 1.7;\">",
      )
      .replace(
        /<strong([^>]*)>/gi,
        "<strong$1 style=\"font-family: 'Akkurat Pro Bold', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; font-size: 18px;\">",
      )
      .replace(
        /<b([^>]*)>/gi,
        "<b$1 style=\"font-family: 'Akkurat Pro Bold', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; font-size: 18px;\">",
      );
  };

  const blocks = useMemo(() => extractBlocks(text), [text]);

  // ✅ split dinâmico (mesma regra do layout 2)
  const [splitIndex, setSplitIndex] = useState(1);

  // refs para medição
  const measureWrapRef = useRef<HTMLDivElement | null>(null);
  const measureImgRef = useRef<HTMLImageElement | null>(null);
  const measureBlockRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!image) {
      setSplitIndex(blocks.length);
      return;
    }

    const wrap = measureWrapRef.current;
    const imgEl = measureImgRef.current;

    if (!wrap || !imgEl) return;

    const compute = () => {
      const imgH = imgEl.getBoundingClientRect().height || 0;
      if (imgH <= 0) return;

      // Collect all block heights (including bottom margin)
      const blockHeights: number[] = [];
      for (let i = 0; i < blocks.length; i++) {
        const el = measureBlockRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        const mb = parseFloat(styles.marginBottom || "0") || 0;
        blockHeights.push(rect.height + mb);
      }

      if (blockHeights.length === 0) {
        setSplitIndex(1);
        return;
      }

      let acc = 0;
      let bestIndex = 1;
      let bestScore = Infinity;

      for (let i = 0; i < blockHeights.length; i++) {
        acc += blockHeights[i];

        const diff = acc - imgH;

        const score = diff > 0 ? diff * 1.4 : Math.abs(diff);

        if (score < bestScore) {
          bestScore = score;
          bestIndex = i + 1;
        }

        if (acc > imgH * 1.5) break;
      }

      const safe = Math.max(1, Math.min(bestIndex, blocks.length));
      setSplitIndex(safe);
    };

    compute();

    const onLoad = () => compute();
    imgEl.addEventListener("load", onLoad);

    const onResize = () => compute();
    window.addEventListener("resize", onResize);

    return () => {
      imgEl.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
    };
  }, [image, blocks]);

  const firstBlocks = useMemo(
    () => applyFontStyles(blocks.slice(0, splitIndex).join("")),
    [blocks, splitIndex],
  );

  const restBlocks = useMemo(
    () => applyFontStyles(blocks.slice(splitIndex).join("")),
    [blocks, splitIndex],
  );

  return (
    <div className="min-h-screen bg-white mt-8">
      {/* ✅ container invisível só para medir e decidir split */}
      {image && blocks.length > 0 && (
        <div
          ref={measureWrapRef}
          className="absolute left-0 top-0 -z-10 opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full max-w-[700px] ">
            <div className="flex gap-4 sm:gap-10 items-start">
              <div className="flex-1">
                <div className="prose prose-sm sm:prose-lg max-w-none text-[#464646] text-justify prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-sm sm:prose-p:text-[18px] prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:my-3 sm:prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:my-3 sm:prose-ol:my-4 prose-li:my-1">
                  {blocks.map((b, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        measureBlockRefs.current[i] = el;
                      }}
                      dangerouslySetInnerHTML={{ __html: applyFontStyles(b) }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                <img
                  ref={measureImgRef}
                  src={image || "/placeholder.svg"}
                  alt=""
                  className="w-[180px] sm:w-[220px] h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <img
          src="/logo.webp"
          alt="logo"
          className="w-[100px] sm:w-[127px] ml-2 md:ml-4 h-auto"
        />
      </header>

      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="cursor-pointer">
              {" "}
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <Link href="/" className="cursor-pointer">
              <span className="font-lyon text-[#000000A8] shrink-0">
                Comunicados
              </span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[#000000A8] font-lyon truncate">{title}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="lg:flex-shrink-0 lg:w-24">
            <button
              onClick={() => {
                pathname === "/dashboard" ? null : router.push("/");
              }}
              className="flex items-center cursor-pointer font-lyon-semibold gap-1 lg:absolute lg:left-0 text-[#EE1515] font-medium hover:text-red-700 mb-4 lg:mb-0"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
              <span className="text-sm sm:text-base">Voltar</span>
            </button>
          </div>

          {/* Main content - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[700px]">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 sm:px-4 py-1 border-2 border-[#2C2C2CA8] text-[#2C2C2CA8] rounded text-xs sm:text-sm font-lyon-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-lyon-semibold mb-2">
                {title}
              </h1>
              <p className="text-xs sm:text-sm font-lyon text-[#000000A8] mb-6 sm:mb-8">
                <span className="font-lyon-semibold">
                  {(() => {
                    const month = date.toLocaleDateString("pt-BR", {
                      month: "long",
                    });

                    const year = date.getFullYear();

                    const capitalizedMonth =
                      month.charAt(0).toUpperCase() + month.slice(1);

                    return `${capitalizedMonth}, ${year}`;
                  })()}
                </span>{" "}
                - Atualizado em: {updated.toLocaleDateString("pt-BR")} às{" "}
                {date.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* ✅ Texto + imagem lado a lado (igual ao padrão anterior) */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start">
                <div
                  lang="pt-BR"
                  className="flex-1 prose prose-sm sm:prose-lg max-w-none text-[#464646] text-justify prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-sm sm:prose-p:text-[18px] prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:my-3 sm:prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:my-3 sm:prose-ol:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: firstBlocks }}
                />

                {image && (
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="border border-gray-300 shadow-sm bg-white">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={title}
                        className="w-[180px] sm:w-[220px] h-auto border border-black shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Resto do conteudo */}
              {restBlocks && (
                <div
                  lang="pt-BR"
                  className="prose prose-sm sm:prose-lg max-w-none text-[#464646] text-justify mt-6 sm:mt-8 mb-6 sm:mb-8 prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-sm sm:prose-p:text-[18px] prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:my-3 sm:prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:my-3 sm:prose-ol:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: restBlocks }}
                />
              )}

              {/* Botão de Link — abre em nova guia */}
              {downloadButtonText2 && (
                <div className="flex justify-center my-6 sm:my-8">
                  <a
                    href={accessLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#EE1B2D] cursor-pointer text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 font-medium text-sm sm:text-base"
                    style={{
                      fontFamily:
                        "'Akkurat Pro Regular', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    {downloadButtonText2}
                  </a>
                </div>
              )}

              {/* Texto entre os botões */}
              {textAboveDownloadButton && (
                <div
                  lang="pt-BR"
                  className="prose prose-sm sm:prose-lg max-w-none text-[#464646] text-justify my-6 sm:my-8 prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-sm sm:prose-p:text-[18px] prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:my-3 sm:prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:my-3 sm:prose-ol:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{
                    __html: applyFontStyles(textAboveDownloadButton),
                  }}
                />
              )}

              {/* Botão de Arquivo — faz download */}
              {downloadButtonText && (
                <div className="flex justify-center my-6 sm:my-8">
                  <a
                    href={
                      downloadFile
                        ? `/api/download?url=${encodeURIComponent(downloadFile)}`
                        : "#"
                    }
                    rel="noopener noreferrer"
                    className="bg-[#EE1B2D] cursor-pointer text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 font-medium text-sm sm:text-base"
                    style={{
                      fontFamily:
                        "'Akkurat Pro Regular', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    {downloadButtonText}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right spacer for symmetry */}
          <div className="hidden lg:block lg:flex-shrink-0 lg:w-24" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
