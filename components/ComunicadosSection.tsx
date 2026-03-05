"use client";

import { useState, useTransition } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import FilterSelect from "@/components/filter-select";
import { fetchComunicados } from "@/lib/actions/mainpage";
import type { Comunicado } from "@prisma/client";
import Link from "next/link";

type FilterOption =
  | "Data (mais recentes)"
  | "Data (mais antigos)"
  | "Título (A-Z)"
  | "Título (Z-A)";

interface ComunicadosSectionProps {
  initialComunicados: Comunicado[];
  initialTotal: number;
  initialTotalPages: number;
}

export default function ComunicadosSection({
  initialComunicados,
  initialTotal,
  initialTotalPages,
}: ComunicadosSectionProps) {
  const [comunicados, setComunicados] = useState(initialComunicados);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentFilter, setCurrentFilter] = useState<FilterOption>(
    "Data (mais recentes)",
  );
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filter: FilterOption) => {
    setCurrentFilter(filter);
    setCurrentPage(1);

    startTransition(async () => {
      let orderBy: "date_desc" | "date_asc" | "title_asc" | "title_desc" =
        "date_desc";

      if (filter === "Data (mais antigos)") orderBy = "date_asc";
      else if (filter === "Título (A-Z)") orderBy = "title_asc";
      else if (filter === "Título (Z-A)") orderBy = "title_desc";

      const result = await fetchComunicados(1, 10, orderBy);
      setComunicados(result.data);
      setTotalPages(result.totalPages);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);

    startTransition(async () => {
      let orderBy: "date_desc" | "date_asc" | "title_asc" | "title_desc" =
        "date_desc";

      if (currentFilter === "Data (mais antigos)") orderBy = "date_asc";
      else if (currentFilter === "Título (A-Z)") orderBy = "title_asc";
      else if (currentFilter === "Título (Z-A)") orderBy = "title_desc";

      const result = await fetchComunicados(page, 10, orderBy);
      setComunicados(result.data);

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <section className="max-w-4xl mx-auto px-3 sm:px-4 py-10 sm:py-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 sm:mb-8 border-b border-gray-200 pb-2 relative z-30">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-lyon text-black leading-tight">
          Comunicados
        </h1>

        <div className="w-full md:w-auto flex justify-start md:justify-end">
          <FilterSelect onFilterChange={handleFilterChange} />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 relative z-10">
        {isPending ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
          </div>
        ) : (
          comunicados.map((comunicado) => (
            <Link
              key={comunicado.id}
              href={`/comunicado/${comunicado.id}`}
              className="block"
            >
              <AnnouncementItem
                title={comunicado.title}
                date={formatDate(comunicado.createdAt)}
                color="border-l-[#76790B]"
              />
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="
              flex items-center justify-center gap-1
              w-full sm:w-auto
              px-4 py-2
              font-lyon
              bg-transparent text-gray-700 border border-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-100 transition
            "
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={isPending}
                    className={`
                      px-3 sm:px-4 py-2 border transition text-sm sm:text-base
                      ${
                        page === currentPage
                          ? "bg-[#F8F9D1] text-[#76790B] border-[#F8F9D1]"
                          : "bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100"
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span
                    key={page}
                    className="px-2 py-2 text-gray-500 text-sm sm:text-base"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="
              flex items-center justify-center gap-1
              w-full sm:w-auto
              px-4 py-2
              font-lyon
              bg-transparent text-gray-700 border border-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-100 transition
            "
          >
            Próxima
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

function AnnouncementItem({
  title,
  date,
  color,
}: {
  title: string;
  date: string;
  color: string;
}) {
  return (
    <div
      className={`
        bg-[#F8F9D1] shadow-sm hover:shadow-md transition cursor-pointer group
        border-l-8 ${color}
        p-3 sm:p-4
        flex flex-col sm:flex-row
        sm:items-center sm:justify-between
        gap-3 sm:gap-4
      `}
    >
      <span className="font-bold text-[#76790B] text-[16px] sm:text-[20px] min-w-0 truncate">
        {title}
      </span>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
        <span className="bg-[#EAEE74] text-[#000000] font-akkurat-bold px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm whitespace-nowrap">
          {date}
        </span>

        <ChevronRight className="text-black shrink-0" />
      </div>
    </div>
  );
}
