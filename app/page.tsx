import SearchWidget from "@/components/search-widget";
import ComunicadosSection from "@/components/ComunicadosSection";
import ProductCarousel from "@/components/ProductCarousel";
import { fetchComunicados } from "@/lib/actions/mainpage";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {
    data: comunicados,
    total,
    totalPages,
  } = await fetchComunicados(1, 10);

  return (
    <main className="min-h-screen flex flex-col bg-white relative">
      <header className="w-full relative mt-12">
        {/* LOGO */}
        <img
          src="/logo.webp"
          alt="Logo"
          className="
      z-10
      w-[110px] h-auto

      relative mx-auto mb-3

      
      sm:absolute sm:mb-0 sm:mx-0
      sm:left-10 sm:top-[18px] sm:-translate-y-1/2
      sm:w-[127px] sm:h-[32px]
    "
        />
        <img
          className="absolute min-h-screen z-50 top-0"
          src="/barra2.png"
          alt="barra"
        />

        {/* FAIXA AMARELA */}
        <div className="bg-[#dce314] max-w-4xl mx-auto">
          <div
            className="
        max-w-4xl mx-auto px-4
        h-[56px]
        flex items-center justify-center
      "
          >
            <SearchWidget />
          </div>
        </div>
      </header>

      <section className="w-full max-w-4xl mx-auto  mt-4">
        <div className="relative w-full h-64 md:h-96 rounded-sm overflow-hidden bg-gray-200">
          <img
            src="/hero.webp"
            alt="Hero Banner"
            className="object-cover w-full object-center"
          />
        </div>
      </section>

      <ComunicadosSection
        initialComunicados={comunicados}
        initialTotal={total}
        initialTotalPages={totalPages}
      />

      <section className="bg-[#e4fcf4] py-16">
        <div className="max-w-4xl mx-auto px-4 relative">
          {/*//@ts-ignore */}
          <ProductCarousel initialComunicados={comunicados} total={total} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
