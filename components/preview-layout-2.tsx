"use client";
import { Home, ChevronRight, Download, Link2 } from "lucide-react";
import Link from "next/link";
import Footer from "./Footer";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface PreviewLayout2Props {
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

export function PreviewLayout2({
  title,
  tags,
  image,
  text,
  downloadButtonText,
  downloadButtonText2,
  textAboveDownloadButton,
  accessLink,
  downloadFile,
  updated,
  date,
}: PreviewLayout2Props) {
  const extractBlocks = (html: string) => {
    const blockRegex = /<(p|ul|ol|div|blockquote|h[1-6])[^>]*>[\s\S]*?<\/\1>/gi;
    const matches = [...html.matchAll(blockRegex)];
    return matches.map((m) => m[0]);
  };
  const pathname = usePathname();
  const router = useRouter();
  // Apply font styles to HTML content
  const applyFontStyles = (html: string) => {
    return html
      .replace(
        /<p([^>]*)>/gi,
        "<p$1 style=\"font-family: 'Akkurat Pro Light', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 300; font-size: 18px;\">",
      )
      .replace(
        /<li([^>]*)>/gi,
        "<li$1 style=\"font-family: 'Akkurat Pro Light', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 300; font-size: 18px;\">",
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

  // ✅ split dinâmico
  const [splitIndex, setSplitIndex] = useState(2);

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

      // Find the split point where accumulated text height
      // best matches the image height.
      // Penalize overflow slightly more than underflow so text
      // preferably ends at or just before the image bottom.
      let acc = 0;
      let bestIndex = 1;
      let bestScore = Infinity;

      for (let i = 0; i < blockHeights.length; i++) {
        acc += blockHeights[i];

        const diff = acc - imgH;
        // overflow is penalized 1.4x more than underflow
        const score = diff > 0 ? diff * 1.4 : Math.abs(diff);

        if (score < bestScore) {
          bestScore = score;
          bestIndex = i + 1;
        }

        // Stop searching once we're well past the image
        if (acc > imgH * 1.5) break;
      }

      const safe = Math.max(1, Math.min(bestIndex, blocks.length));
      setSplitIndex(safe);
    };

    // tenta calcular imediatamente e após load da imagem
    compute();

    const onLoad = () => compute();
    imgEl.addEventListener("load", onLoad);

    // em resize, recalcula
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
      {image && blocks.length > 0 && (
        <div
          ref={measureWrapRef}
          className="absolute left-0 top-0 -z-10 opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full max-w-[700px]">
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
              className="flex items-center gap-1 lg:absolute lg:left-0 text-[#EE1515] font-medium hover:text-red-700 font-lyon-semibold mb-4 lg:mb-0"
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

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-lyon-semibold mb-2">
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
                {updated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 lg:gap-12 items-start">
                <div
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

              {restBlocks && (
                <div
                  className="prose prose-sm sm:prose-lg max-w-none text-[#464646] text-justify mt-6 sm:mt-8 mb-6 sm:mb-8 prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-sm sm:prose-p:text-[18px] prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:my-3 sm:prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:my-3 sm:prose-ol:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: restBlocks }}
                />
              )}

              {/* Download button 1 */}
              {downloadButtonText && (
                <div className="flex justify-center my-6 sm:my-8">
                  <Link
                    href={downloadFile || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="bg-[#EE1B2D] cursor-pointer text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 font-medium text-sm sm:text-base"
                      style={{
                        fontFamily:
                          "'Akkurat Pro Regular', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      {downloadButtonText}
                    </button>
                  </Link>
                </div>
              )}

              {textAboveDownloadButton && (
                <div
                  className="prose prose-sm sm:prose-lg max-w-none text-[#464646] text-justify mb-6 sm:mb-8 prose-p:mb-4 sm:prose-p:mb-6 prose-p:text-sm sm:prose-p:text-[18px] prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:my-3 sm:prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:my-3 sm:prose-ol:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{
                    __html: applyFontStyles(textAboveDownloadButton),
                  }}
                />
              )}

              {downloadButtonText2 && (
                <div className="flex justify-center my-6 sm:my-8">
                  <Link
                    href={accessLink ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="bg-[#EE1B2D] cursor-pointer text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 font-medium text-sm sm:text-base"
                      style={{
                        fontFamily:
                          "'Akkurat Pro Regular', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      {downloadButtonText2}
                    </button>
                  </Link>
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
