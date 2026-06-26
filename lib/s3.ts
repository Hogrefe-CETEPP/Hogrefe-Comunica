import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = "hogrefe-comunica-assets";
const REGION = "us-east-1";

// Host publico dos objetos (bucket com leitura publica via bucket policy).
export const S3_PUBLIC_HOST = `${BUCKET}.s3.${REGION}.amazonaws.com`;

// Credenciais resolvidas automaticamente pela credential chain padrao do SDK
// (IAM Compute Role do Amplify). NAO passar accessKeyId/secretAccessKey aqui.
const s3 = new S3Client({ region: REGION });

// Mantem a mesma nomeacao/sanitizacao que o Vercel Blob usava.
function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFC")
    .replace(/[\\/]/g, "-")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[?#%]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".")
    .trim();

  return normalized || "arquivo";
}

// Replica createBlobPath: comunicados/<timestamp>-<hash>/<arquivo>
export function createObjectKey(fileName: string) {
  const safeFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  return `comunicados/${timestamp}-${randomStr}/${safeFileName}`;
}

export function publicUrlForKey(key: string) {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `https://${S3_PUBLIC_HOST}/${encoded}`;
}

// Extrai a key a partir de uma URL publica do NOSSO bucket. Retorna null se a
// URL nao pertencer ao bucket esperado (protecao contra URL arbitraria).
export function keyFromUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== S3_PUBLIC_HOST) {
    return null;
  }

  const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  return key || null;
}

// Gera uma URL presigned para o client fazer PUT direto no S3 (o arquivo NAO
// passa pelo servidor). O ContentType assinado precisa ser identico ao header
// "Content-Type" que o client enviar no PUT, senao o S3 rejeita a requisicao.
export async function createPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function deleteObjectFromS3(url: string): Promise<void> {
  const key = keyFromUrl(url);
  if (!key) {
    throw new Error("URL fora do bucket esperado");
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}
