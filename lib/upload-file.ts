"use server";

import { put, del } from "@vercel/blob";

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

export async function uploadFileToBlob(
  formData: FormData,
): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "Arquivo muito grande. Máximo 10MB" };
    }

    // Adicionar timestamp e string aleatória ao nome do arquivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.includes(".")
      ? `.${file.name.split(".").pop()}`
      : "";
    const baseName = file.name.replace(fileExtension, "");
    const uniqueFileName = `${baseName}_${timestamp}_${randomStr}${fileExtension}`;

    // Upload para Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: "public",
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
      return { success: false, error: "URL não fornecida" };
    }

    await del(url);

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Erro ao deletar arquivo" };
  }
}
