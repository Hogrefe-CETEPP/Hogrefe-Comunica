"use client";

import React, { useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Comunicado } from "@/lib/actions/comunicados";
import { loadMoreComunicados } from "@/lib/actions/mainpage";

import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";

interface ProductCarouselProps {
  initialComunicados: Comunicado[];
  total: number;
}

const colorMap: Record<number, string> = {
  0: "bg-teal-700",
  1: "bg-yellow-500",
  2: "bg-white",
  3: "bg-blue-600",
  4: "bg-emerald-600",
  5: "bg-orange-500",
  6: "bg-purple-600",
  7: "bg-pink-500",
  8: "bg-indigo-600",
};

export default function ProductCarousel({
  initialComunicados,
  total,
}: ProductCarouselProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [comunicados, setComunicados] =
    useState<Comunicado[]>(initialComunicados);
  const [isPending, startTransition] = useTransition();
  const swiperRef = useRef<SwiperType | null>(null);

  const handleSlideChange = (swiper: SwiperType) => {
    const currentIndex = swiper.activeIndex;
    const slidesPerView =
      typeof swiper.params.slidesPerView === "number"
        ? swiper.params.slidesPerView
        : 1;
    const visibleEnd = currentIndex + slidesPerView;

    if (
      visibleEnd >= 9 &&
      comunicados.length < total &&
      comunicados.length === 9
    ) {
      startTransition(async () => {
        const result = await loadMoreComunicados(comunicados.length);
        //@ts-ignore
        setComunicados((prev) => [...prev, ...result.data]);
      });
    }

    if (
      visibleEnd >= comunicados.length - 2 &&
      comunicados.length < total &&
      comunicados.length > 9
    ) {
      startTransition(async () => {
        const result = await loadMoreComunicados(comunicados.length);
        //@ts-ignore
        setComunicados((prev) => [...prev, ...result.data]);
      });
    }
  };

  return (
    <div className="relative group">
      <button
        ref={prevRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 md:-translate-x-12 bg-gray-400/50 hover:bg-gray-400 p-2 text-white rounded-sm disabled:opacity-30 transition"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        ref={nextRef}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 md:translate-x-12 bg-gray-400/50 hover:bg-gray-400 p-2 text-white rounded-sm disabled:opacity-30 transition"
      >
        <ChevronRight size={32} />
      </button>

      <Swiper
        modules={[Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
        breakpoints={{
          768: { slidesPerView: 3 },
        }}
        className="w-full"
      >
        {comunicados.map((comunicado, idx) => (
          <SwiperSlide key={comunicado.id}>
            <ProductCard
              id={comunicado.id || ""}
              title={comunicado.title.split(" - ")[0] || comunicado.title}
              subtitle={comunicado.descricao || ""}
              btn={comunicado.downloadButtonText || "Ver mais"}
              image={comunicado.image}
              color={colorMap[idx % Object.keys(colorMap).length]}
              type={
                comunicado.image ? "image" : idx % 3 === 2 ? "book" : "color"
              }
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  title,
  subtitle,
  image,
  color,
  id,
  type,
}: {
  title: string;
  subtitle: string;
  btn: string;
  id: string;
  image?: string | null;
  color: string;
  type: string;
}) {
  return (
    <div className="flex flex-col items-center text-center pb-8">
      <div className="w-[280px] h-[480px] bg-transparent hover:bg-white ">
        <div className="h-full px-0 pt-4 pb-4 flex flex-col items-center">
          <div className="w-48 h-64 mb-6 flex items-center justify-center">
            {image ? (
              <img
                src={image || "/placeholder.svg"}
                alt={title}
                className="w-full h-full border border-black shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
              />
            ) : type === "book" ? (
              <div className="w-full h-full border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <div className="text-4xl font-akkurat-pro text-black mb-2">
                  {title.substring(0, 4)}
                </div>
                <p className="text-xs text-center">{subtitle}</p>
              </div>
            ) : (
              <div
                className={`w-full h-full ${color} flex items-center justify-center text-white`}
              >
                <span className="font-serif text-2xl font-bold">{title}</span>
              </div>
            )}
          </div>

          <h3 className="text-2xl font-akkurat-bold text-black mb-1">
            {title}
          </h3>
          <p className="text-gray-600 mb-6 font-akkurat-light">{subtitle}</p>

          <div className="mt-auto w-full flex justify-center">
            <Link
              href={`/comunicado/${id}`}
              className="w-full flex justify-center"
            >
              <button className="bg-[#EE1B2D] rounded-lg cursor-pointer text-white font-akkurat-bold px-4 py-2 text-sm tracking-wide w-full max-w-[220px] shadow-sm">
                Abrir Comunicado
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
