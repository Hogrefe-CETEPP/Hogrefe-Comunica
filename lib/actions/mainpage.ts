"use server";

import pool from "../db";
import type { RowDataPacket } from "mysql2";

export interface Comunicado {
  id: string;
  title: string;
  tags: string[];
  descricao: string | null;
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

export async function searchComunicadosByTitle(
  query: string,
): Promise<Comunicado[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const [rows] = await pool.execute<ComunicadoRow[]>(
      `SELECT * FROM comunicados 
       WHERE published = 1 
       AND LOWER(title) LIKE LOWER(?) 
       ORDER BY createdAt DESC 
       LIMIT 5`,
      [`%${query}%`],
    );

    return rows.map(mapRowToComunicado);
  } catch (error) {
    console.error("Error searching comunicados:", error);
    return [];
  }
}

export async function fetchComunicados(
  page: number = 1,
  limit: number = 10,
  orderBy?: "date_desc" | "date_asc" | "title_asc" | "title_desc",
) {
  try {
    let orderByClause = "createdAt DESC";

    if (orderBy === "date_asc") {
      orderByClause = "createdAt ASC";
    } else if (orderBy === "title_asc") {
      orderByClause = "title ASC";
    } else if (orderBy === "title_desc") {
      orderByClause = "title DESC";
    }

    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<ComunicadoRow[]>(
      `SELECT * FROM comunicados 
       WHERE published = 1 
       ORDER BY ${orderByClause} 
       LIMIT ? OFFSET ?`,
      [String(limit), String(offset)],
    );

    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM comunicados WHERE published = 1`,
    );

    const total = countResult[0]?.total ?? 0;

    return {
      data: rows.map(mapRowToComunicado),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching comunicados:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

export async function loadMoreComunicados(skip: number) {
  try {
    const [rows] = await pool.execute<ComunicadoRow[]>(
      `SELECT * FROM comunicados 
       WHERE published = 1 
       ORDER BY createdAt DESC 
       LIMIT 9 OFFSET ?`,
      [String(skip)],
    );

    return {
      data: rows.map(mapRowToComunicado),
    };
  } catch (error) {
    console.error("Error loading more comunicados:", error);
    return {
      data: [],
    };
  }
}
