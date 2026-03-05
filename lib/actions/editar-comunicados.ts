"use server";

import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "../auth";

export interface Comunicado {
  id: string;
  title: string;
  tags: string[];
  descricao?: string | null;
  image: string | null;
  text: string;
  layout: string;
  downloadButtonText: string | null;
  downloadFile: string | null;
  downloadButtonText2: string | null;
  accessLink: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  textAboveDownloadButton: string | null;
}

export interface ComunicadoInput {
  id: string;
  title: string;
  tags: string[];
  descricao?: string | null;
  image?: string | null;
  text: string;
  layout: string;
  downloadButtonText?: string | null;
  downloadFile?: string | null;
  downloadButtonText2?: string | null;
  accessLink?: string | null;
  published: boolean;
  textAboveDownloadButton?: string | null;
  publicatedAt: Date;
  createdAt: Date;
}

interface ComunicadoRow extends RowDataPacket {
  id: string;
  title: string;
  tags: string;
  descricao: string | null;
  image: string | null;
  text: string;
  layout: string;
  downloadButtonText: string | null;
  downloadFile: string | null;
  downloadButtonText2: string | null;
  accessLink: string | null;
  published: number;
  createdAt: Date;
  updatedAt: Date;
  textAboveDownloadButton: string | null;
}

function mapRowToComunicado(row: ComunicadoRow): Comunicado {
  return {
    id: row.id,
    title: row.title,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
    descricao: row.descricao,
    image: row.image,
    text: row.text,
    layout: row.layout,
    downloadButtonText: row.downloadButtonText,
    downloadFile: row.downloadFile,
    downloadButtonText2: row.downloadButtonText2,
    accessLink: row.accessLink,
    published: row.published === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    textAboveDownloadButton: row.textAboveDownloadButton,
  };
}

export async function getComunicados(): Promise<{
  success: boolean;
  data?: Comunicado[];
  error?: string;
}> {
  try {
    const [rows] = await pool.query<ComunicadoRow[]>(
      "SELECT * FROM comunicados ORDER BY createdAt DESC",
    );

    const comunicados = rows.map(mapRowToComunicado);

    return { success: true, data: comunicados };
  } catch (error) {
    console.error("Erro ao buscar comunicados:", error);
    return { success: false, error: "Erro ao buscar comunicados" };
  }
}

export async function getComunicadoById(id: string): Promise<{
  success: boolean;
  data?: Comunicado;
  error?: string;
}> {
  try {
    const [rows] = await pool.query<ComunicadoRow[]>(
      "SELECT * FROM comunicados WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return { success: false, error: "Comunicado não encontrado" };
    }

    return { success: true, data: mapRowToComunicado(rows[0]) };
  } catch (error) {
    console.error("Erro ao buscar comunicado:", error);
    return { success: false, error: "Erro ao buscar comunicado" };
  }
}

export async function updateComunicado(
  id: string,
  data: Partial<Omit<ComunicadoInput, "id">>,
): Promise<{
  success: boolean;
  data?: Comunicado;
  error?: string;
}> {
  try {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    const userAuth = await getCurrentUser();
    if (userAuth.role !== "admin") {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.tags !== undefined) {
      fields.push("tags = ?");
      values.push(JSON.stringify(data.tags));
    }
    if (data.descricao !== undefined) {
      fields.push("descricao = ?");
      values.push(data.descricao);
    }
    if (data.image !== undefined) {
      fields.push("image = ?");
      values.push(data.image);
    }
    if (data.text !== undefined) {
      fields.push("text = ?");
      values.push(data.text);
    }
    if (data.layout !== undefined) {
      fields.push("layout = ?");
      values.push(data.layout);
    }
    if (data.downloadButtonText !== undefined) {
      fields.push("downloadButtonText = ?");
      values.push(data.downloadButtonText);
    }
    if (data.downloadFile !== undefined) {
      fields.push("downloadFile = ?");
      values.push(data.downloadFile);
    }
    if (data.downloadButtonText2 !== undefined) {
      fields.push("downloadButtonText2 = ?");
      values.push(data.downloadButtonText2);
    }
    if (data.accessLink !== undefined) {
      fields.push("accessLink = ?");
      values.push(data.accessLink);
    }
    if (data.published !== undefined) {
      fields.push("published = ?");
      values.push(data.published ? 1 : 0);
    }
    if (data.textAboveDownloadButton !== undefined) {
      fields.push("textAboveDownloadButton = ?");
      values.push(data.textAboveDownloadButton);
    }
    if (data.createdAt !== undefined) {
      fields.push("createdAt = ?");
      //@ts-ignore
      values.push(data.createdAt);
    }
    //@ts-ignore
    if (data.updatedAt !== undefined) {
      fields.push("updatedAt = ?");
      //@ts-ignore
      values.push(data.updatedAt);
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE comunicados SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    const [rows] = await pool.query<ComunicadoRow[]>(
      "SELECT * FROM comunicados WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return { success: false, error: "Comunicado não encontrado" };
    }

    return { success: true, data: mapRowToComunicado(rows[0]) };
  } catch (error) {
    console.error("Erro ao atualizar comunicado:", error);
    return { success: false, error: "Erro ao atualizar comunicado" };
  }
}

export async function deleteComunicado(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userAuth = await getCurrentUser();
    if (userAuth.role !== "admin") {
      return { success: false, error: "Usuário não autenticado" };
    }
    await pool.query("DELETE FROM comunicados WHERE id = ?", [id]);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir comunicado:", error);
    return { success: false, error: "Erro ao excluir comunicado" };
  }
}
