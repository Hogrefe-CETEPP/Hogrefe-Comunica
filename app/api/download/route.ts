import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("URL não fornecida", { status: 400 });
  }

  // Aceita apenas URLs do Vercel Blob
  if (!url.startsWith("https://") || !url.includes("blob.vercel-storage.com")) {
    return new NextResponse("URL inválida", { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse("Erro ao buscar arquivo", {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const filename = decodeURIComponent(url.split("/").pop() || "download");

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new NextResponse("Erro ao baixar arquivo", { status: 500 });
  }
}
