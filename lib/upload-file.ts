const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

function getFile(input: FormData | File): File | null {
  if (input instanceof File) {
    return input;
  }

  const file = input.get("file");
  return file instanceof File ? file : null;
}

export async function uploadFileToBlob(
  input: FormData | File,
): Promise<UploadResult> {
  try {
    const file = getFile(input);

    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return { success: false, error: "Arquivo muito grande. Maximo 50MB" };
    }

    // Mesmo valor usado para assinar e para o header do PUT (precisam bater).
    const contentType = file.type || "application/octet-stream";

    // 1. Pede ao servidor a URL presigned (PUT) e a URL publica final.
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType,
        size: file.size,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      uploadUrl?: string;
      publicUrl?: string;
      error?: string;
    } | null;

    if (!response.ok || !data?.uploadUrl || !data?.publicUrl) {
      return {
        success: false,
        error: data?.error || "Erro ao iniciar upload do arquivo",
      };
    }

    // 2. Envia o arquivo DIRETO para o S3 (nao passa pelo Lambda).
    const putResponse = await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });

    if (!putResponse.ok) {
      return {
        success: false,
        error: "Erro ao enviar arquivo para o storage",
      };
    }

    // 3. Mesmo contrato de retorno de antes.
    return {
      success: true,
      url: data.publicUrl,
      fileName: file.name,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Erro ao fazer upload do arquivo" };
  }
}

export async function deleteFileFromBlob(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!url) {
      return { success: false, error: "URL nao fornecida" };
    }

    // import dinamico para manter o SDK da AWS fora do bundle client.
    const { deleteObjectFromS3 } = await import("@/lib/s3");
    await deleteObjectFromS3(url);

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Erro ao deletar arquivo" };
  }
}
