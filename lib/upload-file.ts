import { upload } from "@vercel/blob/client";

const MAX_UPLOAD_SIZE = 30 * 1024 * 1024;
const MULTIPART_UPLOAD_SIZE = 4 * 1024 * 1024;

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

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "arquivo";
}

function createBlobPath(fileName: string) {
  const safeFileName = sanitizeFileName(fileName);
  const fileExtension = safeFileName.includes(".")
    ? `.${safeFileName.split(".").pop()}`
    : "";
  const baseName = fileExtension
    ? safeFileName.slice(0, -fileExtension.length)
    : safeFileName;
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  return `comunicados/${baseName}_${timestamp}_${randomStr}${fileExtension}`;
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
      return { success: false, error: "Arquivo muito grande. Maximo 10MB" };
    }

    const blob = await upload(createBlobPath(file.name), file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type || "application/octet-stream",
      multipart: file.size > MULTIPART_UPLOAD_SIZE,
      clientPayload: JSON.stringify({
        originalFileName: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      }),
    });

    return {
      success: true,
      url: blob.url,
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

    const { del } = await import("@vercel/blob");
    await del(url);

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Erro ao deletar arquivo" };
  }
}
