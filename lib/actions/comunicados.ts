"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { getCurrentUser } from "../auth";

export type ComunicadoInput = {
  title: string;
  tags?: string[];
  image?: string | null;
  text: string;
  slug: string;
  layout: "layout1" | "layout2";
  downloadButtonText?: string | null;
  downloadFile?: string | null;
  downloadButtonText2?: string | null;
  descricao?: string | null;
  textAboveDownloadButton?: string | null;
  accessLink?: string | null;
  published?: boolean;
  createdAt?: Date;
};

export type Comunicado = {
  id: string;
  title: string;
  tags: string[];
  image: string | null;
  text: string;
  layout: string;
  slug: string;
  descricao?: string | null;
  downloadButtonText: string | null;
  downloadFile: string | null;
  downloadButtonText2: string | null;
  textAboveDownloadButton?: string | null;
  accessLink: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface ComunicadoRow extends RowDataPacket {
  id: string;
  title: string;
  tags: string;
  image: string | null;
  text: string;
  layout: string;
  descricao: string | null;
  downloadButtonText: string | null;
  downloadFile: string | null;
  downloadButtonText2: string | null;
  textAboveDownloadButton: string | null;
  accessLink: string | null;
  published: number;
  createdAt: Date;
  updatedAt: Date;
}

function mapRowToComunicado(row: ComunicadoRow): Comunicado {
  return {
    id: row.id,
    title: row.title,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
    image: row.image,
    text: row.text,
    layout: row.layout,
    slug: row.id,
    descricao: row.descricao,
    downloadButtonText: row.downloadButtonText,
    downloadFile: row.downloadFile,
    downloadButtonText2: row.downloadButtonText2,
    textAboveDownloadButton: row.textAboveDownloadButton,
    accessLink: row.accessLink,
    published: row.published === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Listar todos os comunicados
export async function getComunicados() {
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

// Buscar comunicado por ID
export async function getComunicadoById(id: string) {
  try {
    const [rows] = await pool.query<ComunicadoRow[]>(
      "SELECT * FROM comunicados WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return { success: false, error: "Comunicado não encontrado" };
    }

    const comunicado = mapRowToComunicado(rows[0]);
    return { success: true, data: comunicado };
  } catch (error) {
    console.error("Erro ao buscar comunicado:", error);
    return { success: false, error: "Erro ao buscar comunicado" };
  }
}

export async function createComunicado(data: ComunicadoInput) {
  try {
    const id = data.slug;
    const userAuth = await getCurrentUser();
    if (userAuth.role !== "admin") {
      return { success: false, error: "Usuário não autenticado" };
    }
    const tags = JSON.stringify(data.tags || []);
    const published = data.published ? 1 : 0;

    await pool.query<ResultSetHeader>(
      `INSERT INTO comunicados (
        id, title, tags, image, text, layout, descricao,
        downloadButtonText, downloadFile, downloadButtonText2,
        textAboveDownloadButton, accessLink, createdAt, updatedAt, published 
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        tags,
        data.image || null,
        data.text,
        data.layout || "layout1",
        data.descricao || null,
        data.downloadButtonText || null,
        data.downloadFile || null,
        data.downloadButtonText2 || null,
        data.textAboveDownloadButton || null,
        data.accessLink || null,
        data.createdAt,
        data.createdAt,
        published,
      ],
    );

    const [rows] = await pool.query<ComunicadoRow[]>(
      "SELECT * FROM comunicados WHERE id = ?",
      [id],
    );

    const comunicado = mapRowToComunicado(rows[0]);

    return { success: true, data: comunicado };
  } catch (error) {
    console.error("Erro ao criar comunicado:", error);
    return { success: false, error: "Erro ao criar comunicado" };
  }
}

// Atualizar comunicado
export async function updateComunicado(
  id: string,
  data: Partial<ComunicadoInput>,
) {
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

    if (fields.length > 0) {
      values.push(id);
      await pool.query<ResultSetHeader>(
        `UPDATE comunicados SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    const [rows] = await pool.query<ComunicadoRow[]>(
      "SELECT * FROM comunicados WHERE id = ?",
      [id],
    );

    const comunicado = mapRowToComunicado(rows[0]);

    revalidatePath("/");
    revalidatePath("/admin/comunicados");
    revalidatePath(`/comunicado/${id}`);

    return { success: true, data: comunicado };
  } catch (error) {
    console.error("Erro ao atualizar comunicado:", error);
    return { success: false, error: "Erro ao atualizar comunicado" };
  }
}

// Excluir comunicado
export async function deleteComunicado(id: string) {
  try {
    const userAuth = await getCurrentUser();
    if (userAuth.role !== "admin") {
      return { success: false, error: "Usuário não autenticado" };
    }

    await pool.query<ResultSetHeader>("DELETE FROM comunicados WHERE id = ?", [
      id,
    ]);

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir comunicado:", error);
    return { success: false, error: "Erro ao excluir comunicado" };
  }
}
