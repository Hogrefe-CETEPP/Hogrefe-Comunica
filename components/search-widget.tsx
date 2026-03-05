"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { searchComunicadosByTitle } from "@/lib/actions/mainpage";
import type { Comunicado } from "@prisma/client";

export default function SearchWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Comunicado[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const results = await searchComunicadosByTitle(query);
        setSuggestions(results);
        setHasSearched(true);
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleComunicadoClick = (comunicado: Comunicado) => {
    router.push(`/comunicado/${comunicado.id}`);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-3xl relative" ref={containerRef}>
      {/* wrapper */}
      <div className="flex flex-row relative z-20">
        <input
          type="text"
          placeholder="Buscar comunicados"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="
            flex-1 bg-white border-none outline-none text-gray-700 placeholder:text-gray-400
            px-3 sm:px-4
            py-2.5 text-sm
            w-full
          "
        />

        <button
          type="button"
          className="
            bg-[#8B8B00] text-white font-medium hover:bg-[#757500] transition-colors
            flex items-center justify-center gap-1 sm:gap-2
            px-3 sm:px-6 py-2.5
            text-xs sm:text-sm
            shrink-0
          "
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          <span className="hidden xs:inline sm:inline">Buscar</span>
        </button>
      </div>

      {/* --- Sugestões de Busca --- */}
      {isOpen && query.trim() && (
        <div
          className="
            absolute top-full left-0 w-full
            bg-white border border-gray-200 shadow-lg
            mt-1 sm:mt-0
            z-10
            max-h-[50vh] overflow-auto
          "
        >
          {isPending ? (
            <div className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 text-xs sm:text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" />
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleComunicadoClick(item)}
                  className="
                    flex items-center justify-between
                    px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100
                    hover:bg-gray-50 cursor-pointer group
                  "
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="bg-[#BABA00] rounded-full p-1 text-white shrink-0">
                      <Search
                        size={10}
                        strokeWidth={3}
                        className="sm:w-3 sm:h-3"
                      />
                    </div>

                    {/* evita estourar no mobile */}
                    <span className="text-gray-600 text-xs sm:text-sm group-hover:text-gray-900 truncate">
                      {item.title}
                    </span>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-gray-400 shrink-0 sm:w-4 sm:h-4"
                  />
                </li>
              ))}
            </ul>
          ) : hasSearched ? (
            <div className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 text-xs sm:text-sm">
              Não encontrado resultado para sua pesquisa.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
