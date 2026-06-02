import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";

const MAX_UPLOAD_SIZE = 30 * 1024 * 1024;
const UPLOAD_PATH_PREFIX = "comunicados/";

function isValidUploadPath(pathname: string) {
  return (
    pathname.startsWith(UPLOAD_PATH_PREFIX) &&
    !pathname.includes("..") &&
    /^[a-zA-Z0-9/_.,-]+$/.test(pathname)
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getCurrentUser();

        if (!session || session.role !== "admin") {
          throw new Error("Upload nao autorizado");
        }

        if (!isValidUploadPath(pathname)) {
          throw new Error("Caminho de upload invalido");
        }

        return {
          maximumSizeInBytes: MAX_UPLOAD_SIZE,
          addRandomSuffix: false,
          allowOverwrite: false,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Blob upload completed", blob.url, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao autorizar upload";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
