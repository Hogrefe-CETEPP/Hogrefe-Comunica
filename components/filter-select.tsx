"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type FilterOption =
  | "Data (mais recentes)"
  | "Data (mais antigos)"
  | "Título (A-Z)"
  | "Título (Z-A)";

interface FilterSelectProps {
  onFilterChange?: (filter: FilterOption) => void;
}

export default function FilterSelect({ onFilterChange }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<FilterOption>(
    "Data (mais recentes)",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const options: FilterOption[] = [
    "Data (mais recentes)",
    "Data (mais antigos)",
    "Título (A-Z)",
    "Título (Z-A)",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (option: FilterOption) => {
    setSelected(option);
    setIsOpen(false);
    onFilterChange?.(option);
  };

  const filteredOptions = options.filter((o) => o !== selected);

  return (
    <div
      className="
        z-10
        flex flex-col sm:flex-row
        sm:items-center items-stretch
        gap-2
        mt-3 sm:mt-4 md:mt-0
        w-full sm:w-auto
      "
    >
      <span className="font-bold text-sm text-gray-800 font-lyon-semibold whitespace-nowrap">
        Filtrar por:
      </span>

      <div
        ref={containerRef}
        className={`
          relative inline-block text-left bg-white
          w-full sm:w-auto 
          min-w-0 sm:min-w-[240px]
          border border-black shadow-none
          ${isOpen ? "z-50" : ""}
        `}
      >
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="
            w-full
            px-3 sm:px-4
            py-2
            text-base md:text-md
            font-serif italic
            flex items-center justify-between gap-3 sm:gap-4
            bg-white
          "
        >
          <span className="font-akkurat-light md:text-md">{selected}</span>

          {isOpen ? (
            <ChevronUp className="shrink-0" size={20} strokeWidth={2.5} />
          ) : (
            <ChevronDown className="shrink-0" size={20} strokeWidth={2.5} />
          )}
        </button>

        {isOpen && (
          <div
            className="
              absolute left-0 right-0 top-full
              w-full
              bg-white 
              border-t border-black
              shadow-2xl md:text-md
              max-h-60 overflow-y-auto
            "
          >
            <ul>
              {filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  className="
                    px-3 sm:px-4 py-2
                    text-base 
                    md:text-md
                    font-akkurat-light
                    text-gray-600 hover:bg-gray-100
                    cursor-pointer
                    border border-gray-300 last:border-b-0
                    truncate
                  "
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
