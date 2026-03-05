import { notFound } from "next/navigation";
import { PreviewLayout1 } from "@/components/preview-layout-1";
import { getComunicadoById } from "@/lib/actions/comunicados";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComunicadoPage({ params }: PageProps) {
  const { id } = await params;

  const result = await getComunicadoById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const comunicado = result.data;

  return (
    <>
      <img
        className="fixed min-h-screen mt-[16px] z-50 "
        src="/barra2.png"
        alt="barra"
      />
      <PreviewLayout1
        title={comunicado.title}
        tags={comunicado.tags}
        image={comunicado.image}
        text={comunicado.text}
        date={comunicado.createdAt}
        updated={comunicado.updatedAt}
        downloadButtonText={comunicado.downloadButtonText || ""}
        downloadFile={comunicado.downloadFile}
        downloadButtonText2={comunicado.downloadButtonText2 ?? undefined}
        accessLink={comunicado.accessLink ?? undefined}
        textAboveDownloadButton={
          comunicado.textAboveDownloadButton ?? undefined
        }
      />
    </>
  );
}
