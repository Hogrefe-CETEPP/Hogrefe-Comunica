"use client";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { TagInput } from "@/components/tag-input";
import { TextEditor } from "@/components/text-editor";
import { PreviewLayout1 } from "@/components/preview-layout-1";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { createComunicado } from "@/lib/actions/comunicados";
import { uploadFileToBlob } from "@/lib/upload-file";

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center transition-colors"
        style={
          checked ? { borderColor: "#2dc4b4", backgroundColor: "#2dc4b4" } : {}
        }
      />
      <span className="text-sm font-medium text-[#464646]">{label}</span>
    </button>
  );
}

export default function NovoComunicadoPage() {
  const router = useRouter();
  const [showLink, setShowLink] = useState(false);
  const [showArquivo, setShowArquivo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [downloadButtonText, setDownloadButtonText] = useState("");
  const [downloadFile, setDownloadFile] = useState<string | null>(null);
  const [downloadButtonText2, setDownloadButtonText2] = useState("");
  const [accessLink, setAccessLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [textAboveDownloadButton, setTextAboveDownloadButton] = useState("");
  const BASE_URL = "http://hogrefe-comunica.com.br/comunicado";

  function handleSlugChange(value: string) {
    setSlug(generateSlug(value));
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadFileToBlob(formData);

      if (result.success && result.url) {
        setDownloadFile(result.url);
      } else {
        alert(result.error || "Erro ao fazer upload");
      }

      setIsUploading(false);
    }
  };

  const handlePublish = async (published: boolean = true) => {
    if (!title.trim()) {
      alert("Por favor, preencha o titulo do comunicado.");
      return;
    }

    setIsLoading(true);
    let finalCreatedAt = createdAt;
    if (!finalCreatedAt) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      finalCreatedAt = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    try {
      const result = await createComunicado({
        title,
        slug,
        tags: tags.filter((t) => t.trim() !== ""),
        image,
        text,
        //@ts-ignore
        createdAt: finalCreatedAt,
        descricao,
        layout: "layout1",
        downloadButtonText: showArquivo ? downloadButtonText || null : null,
        downloadFile: showArquivo ? downloadFile || null : null,
        downloadButtonText2: showLink ? downloadButtonText2 || null : null,
        accessLink: showLink ? accessLink || null : null,
        textAboveDownloadButton:
          showLink && showArquivo ? textAboveDownloadButton || null : null,
        published,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      if (published) {
        alert("Comunicado publicado com sucesso!");
        router.push(`/comunicado/${result.data?.id}`);
      } else {
        alert("Rascunho salvo com sucesso!");
        router.push("/admin/comunicados");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar comunicado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <AdminSidebar />
      <img className="fixed min-h-screen z-50 " src="/barra2.png" alt="barra" />
      <main className="ml-51.5 flex-1">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Olá, Editora Hogrefe</span>
            <div className="w-10 h-10 rounded-lg bg-[#1A1A27] flex items-center justify-center text-white font-semibold">
              H
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-[1100px] ml-12">
            <div className="flex items-center mb-8">
              <div className="flex items-center gap-3">
                <img
                  src="/livro.png"
                  alt="livro"
                  className="h-[51px] w-[56px]"
                />
                <h1 className="text-4xl font-serif text-[#464646]">
                  Cadastrar comunicado
                </h1>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Titulo */}
              <div className="flex items-center gap-8">
                <label className="text-[#464646] font-medium w-32">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="flex items-center gap-8">
                <label className="text-[#464646] font-medium w-32">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={descricao}
                  placeholder="'Atualização de normas'"
                  onChange={(e) => setDescricao(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="flex items-center gap-8">
                <label className="text-[#464646] font-medium w-32">
                  Data de Criação:
                </label>
                <input
                  type="datetime-local"
                  value={
                    createdAt ? createdAt.slice(0, 16).replace(" ", "T") : ""
                  }
                  placeholder="Data e Hora"
                  onChange={(e) => {
                    const dateTimeValue = e.target.value;
                    if (dateTimeValue) {
                      setCreatedAt(dateTimeValue.replace("T", " ") + ":00");
                    } else {
                      setCreatedAt(null);
                    }
                  }}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-8">
                  <label className="text-[#464646] font-medium w-32">
                    Slug
                  </label>

                  <input
                    type="text"
                    placeholder="exemplo-de-slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>

                {/* Preview da URL */}
                {slug && (
                  <p className="ml-40 text-sm text-gray-500">
                    Preview:{" "}
                    <span className="font-medium text-gray-700">
                      {BASE_URL}/{slug}
                    </span>
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-8">
                <label className="text-[#464646] font-medium w-32">Tags</label>
                <TagInput tags={tags} setTags={setTags} />
              </div>

              {/* Imagem */}
              <div className="flex items-center gap-8">
                <label className="text-[#464646] font-medium w-32">
                  Imagem
                </label>
                <label className="px-6 py-2 bg-[#0000001C] text-[#464646] rounded-full  text-sm hover:bg-gray-400 transition-colors italic cursor-pointer">
                  Selecionar arquivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {image && (
                  <span className="text-sm text-gray-600">
                    Imagem selecionada
                  </span>
                )}
              </div>

              {/* Texto */}
              <div className="flex gap-8">
                <label className="text-[#464646] font-medium w-32 pt-2">
                  Texto
                </label>
                <div className="flex-1">
                  <TextEditor value={text} onChange={setText} />
                </div>
              </div>

              {/* Tipo de Botão */}
              <div className="flex items-center gap-8">
                <label className="text-[#464646] font-medium w-32">
                  Tipo de Botão
                </label>
                <div className="flex items-center gap-6">
                  <ToggleSwitch
                    checked={showLink}
                    onChange={() => setShowLink((v) => !v)}
                    label="Link"
                  />
                  <ToggleSwitch
                    checked={showArquivo}
                    onChange={() => setShowArquivo((v) => !v)}
                    label="Arquivo"
                  />
                </div>
              </div>

              {/* Link fields */}
              {showLink && (
                <>
                  <div className="flex items-center gap-8">
                    <label className="text-[#464646] font-medium w-48">
                      Título do Botão do Link
                    </label>
                    <input
                      type="text"
                      value={downloadButtonText2}
                      onChange={(e) => setDownloadButtonText2(e.target.value)}
                      className="w-[300px] h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="text-[#464646] font-medium w-48">
                      Vincular Link
                    </label>
                    <input
                      type="text"
                      value={accessLink}
                      onChange={(e) => setAccessLink(e.target.value)}
                      placeholder="Colar link"
                      className="w-[300px] h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:italic placeholder:text-gray-400"
                    />
                  </div>
                </>
              )}

              {/* Texto intermediário (apenas quando ambos ativos) */}
              {showLink && showArquivo && (
                <div className="flex gap-8">
                  <label className="text-[#464646] font-medium w-48 pt-2">
                    Texto
                  </label>
                  <div className="flex-1">
                    <TextEditor
                      value={textAboveDownloadButton}
                      onChange={setTextAboveDownloadButton}
                    />
                  </div>
                </div>
              )}

              {/* Arquivo fields */}
              {showArquivo && (
                <>
                  <div className="flex items-center gap-8">
                    <label className="text-[#464646] font-medium w-48">
                      Título do Botão Arquivo
                    </label>
                    <input
                      type="text"
                      value={downloadButtonText}
                      onChange={(e) => setDownloadButtonText(e.target.value)}
                      className="w-[300px] h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="text-[#464646] font-medium w-48">
                      Selecionar Documento
                    </label>
                    <label className="px-6 py-2 bg-[#0000001C] text-[#464646] rounded-full text-sm hover:bg-gray-400 transition-colors italic cursor-pointer">
                      {isUploading ? "Enviando..." : "Selecionar arquivo"}
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {downloadFile && (
                      <span className="text-sm text-gray-600">
                        {downloadFile}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-6 pt-8 justify-center">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={isLoading}
                  className="px-12 py-3 bg-[#F8F9D1] text-[#464646] rounded-lg font-medium hover:bg-[#ebe9c4] transition-colors disabled:opacity-50"
                >
                  Visualizar Publicação
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish(true)}
                  disabled={isLoading}
                  className="px-12 py-3 bg-[#F8F9D1] text-[#464646] rounded-lg font-medium hover:bg-[#ebe9c4] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent
          className="min-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] overflow-y-auto p-0 rounded-lg"
          showCloseButton={true}
        >
          <PreviewLayout1
            title={title || "Titulo do comunicado"}
            tags={tags.filter((t) => t.trim() !== "")}
            image={image}
            date={new Date()}
            updated={new Date()}
            text={text || "<p>Digite o conteúdo aqui...</p>"}
            downloadButtonText={showArquivo ? downloadButtonText : ""}
            downloadFile={showArquivo ? downloadFile : null}
            downloadButtonText2={showLink ? downloadButtonText2 : ""}
            accessLink={showLink ? accessLink : ""}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
