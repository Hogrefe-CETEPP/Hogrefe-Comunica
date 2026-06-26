import { NextRequest, NextResponse } from "next/server";

// Host publico do nosso bucket S3 — so aceitamos URLs dele, nunca arbitrarias.
const ALLOWED_HOST = "hogrefe-comunica-assets.s3.us-east-1.amazonaws.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("URL não fornecida", { status: 400 });
  }

  // Aceita apenas URLs do nosso bucket S3
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("URL inválida", { status: 400 });
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_HOST) {
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
    const filename = decodeURIComponent(
      parsed.pathname.split("/").pop() || "download",
    );

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
