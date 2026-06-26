import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createObjectKey,
  createPresignedPutUrl,
  publicUrlForKey,
} from "@/lib/s3";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const PRESIGN_EXPIRES_SECONDS = 5 * 60;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Upload nao autorizado" },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      fileName?: string;
      contentType?: string;
      size?: number;
    } | null;

    if (!body || typeof body.fileName !== "string" || !body.fileName) {
      return NextResponse.json(
        { error: "Metadados invalidos" },
        { status: 400 },
      );
    }

    if (typeof body.size !== "number" || body.size <= 0) {
      return NextResponse.json({ error: "Tamanho invalido" }, { status: 400 });
    }

    // Defesa extra: o arquivo nao passa pelo servidor, mas recusamos tamanhos
    // declarados acima do limite antes de assinar a URL.
    if (body.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Maximo 50MB" },
        { status: 400 },
      );
    }

    const contentType = body.contentType || "application/octet-stream";
    const key = createObjectKey(body.fileName);

    // Imagens devem abrir/renderizar normalmente (<img>); demais arquivos
    // (PDFs etc.) recebem Content-Disposition: attachment para forcar download
    // ao acessar a URL publica direto, sem proxy pelo Lambda.
    const contentDisposition = contentType.startsWith("image/")
      ? undefined
      : "attachment";

    const uploadUrl = await createPresignedPutUrl(key, contentType, {
      contentDisposition,
      expiresInSeconds: PRESIGN_EXPIRES_SECONDS,
    });
    const publicUrl = publicUrlForKey(key);

    return NextResponse.json({ uploadUrl, publicUrl, contentDisposition });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao gerar URL de upload";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
