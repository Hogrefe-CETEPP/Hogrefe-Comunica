"use client";

import React from "react";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { TagInput } from "@/components/tag-input";
import { TextEditor } from "@/components/text-editor";
import { PreviewLayout1 } from "@/components/preview-layout-1";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash2, Eye, Search, Power } from "lucide-react";
import {
  getComunicados,
  updateComunicado,
  deleteComunicado,
  type Comunicado,
} from "@/lib/actions/editar-comunicados";
import { redirect } from "next/navigation";
import { uploadFileToBlob } from "@/lib/upload-file";

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

export default function EditarComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const [showLink, setShowLink] = useState(false);
  const [showArquivo, setShowArquivo] = useState(false);
  const [title, setTitle] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [downloadButtonText, setDownloadButtonText] = useState("");
  const [downloadFile, setDownloadFile] = useState<string | null>(null);
  const [downloadButtonText2, setDownloadButtonText2] = useState("");
  const [accessLink, setAccessLink] = useState("");
  const [textAboveDownloadButton, setTextAboveDownloadButton] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadComunicados();
  }, []);

  const loadComunicados = async () => {
    setIsLoading(true);
    const result = await getComunicados();
    if (result.success && result.data) {
      setComunicados(result.data);
    }
    setIsLoading(false);
  };

  const filteredComunicados = comunicados.filter((comunicado) => {
    const matchesSearch = comunicado.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && comunicado.published) ||
      (filterStatus === "draft" && !comunicado.published);
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (comunicado: Comunicado) => {
    setEditingComunicado(comunicado);
    setShowLink(!!(comunicado.accessLink || comunicado.downloadButtonText2));
    setShowArquivo(
      !!(comunicado.downloadFile || comunicado.downloadButtonText),
    );
    setTitle(comunicado.title);
    setDescricao(comunicado.descricao ?? "");
    setTags(comunicado.tags);
    setImage(comunicado.image ?? null);
    setText(comunicado.text);
    setDownloadButtonText(comunicado.downloadButtonText ?? "");
    setDownloadFile(comunicado.downloadFile ?? null);
    setDownloadButtonText2(comunicado.downloadButtonText2 ?? "");
    setAccessLink(comunicado.accessLink ?? "");
    setTextAboveDownloadButton(comunicado.textAboveDownloadButton ?? "");

    const dateObj = new Date(comunicado.updatedAt);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    const ss = String(dateObj.getSeconds()).padStart(2, "0");
    setCreatedAt(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`);

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingComunicado(null);
    resetForm();
  };

  const resetForm = () => {
    setShowLink(false);
    setShowArquivo(false);
    setTitle("");
    setTags([]);
    setImage(null);
    setText("");
    setDownloadButtonText("");
    setDownloadFile(null);
    setDownloadButtonText2("");
    setAccessLink("");
    setTextAboveDownloadButton("");
  };

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

  const handleSave = async (published: boolean) => {
    if (!editingComunicado || !title.trim()) {
      alert("Por favor, preencha o título do comunicado.");
      return;
    }

    setIsSaving(true);
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
      const result = await updateComunicado(editingComunicado.id, {
        title,
        tags: tags.filter((t) => t.trim() !== ""),
        image,
        text,
        layout: "layout1",
        descricao,
        downloadButtonText: showArquivo ? downloadButtonText || null : null,
        downloadFile: showArquivo ? downloadFile || null : null,
        downloadButtonText2: showLink ? downloadButtonText2 || null : null,
        accessLink: showLink ? accessLink || null : null,
        textAboveDownloadButton:
          showLink && showArquivo ? textAboveDownloadButton || null : null,
        published,
        //@ts-ignore
        updatedAt: finalCreatedAt,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      alert("Comunicado atualizado com sucesso!");
      closeEditModal();
      loadComunicados();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar comunicado. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const result = await deleteComunicado(deletingId);
      if (!result.success) {
        throw new Error(result.error);
      }
      alert("Comunicado excluído com sucesso!");
      loadComunicados();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir comunicado. Tente novamente.");
    } finally {
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const togglePublished = async (comunicado: Comunicado) => {
    try {
      const result = await updateComunicado(comunicado.id, {
        published: !comunicado.published,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      alert(
        `Comunicado ${!comunicado.published ? "ativado" : "inativado"} com sucesso!`,
      );
      loadComunicados();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao alterar status do comunicado. Tente novamente.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <AdminSidebar />
      <img className="fixed min-h-screen z-50 " src="/barra2.png" alt="barra" />
      <main className="ml-[206px] flex-1">
        <header className="flex items-center justify-end gap-4 border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Olá, Editora Hogrefe</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A27] font-semibold text-white">
              H
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="ml-12 max-w-[1100px]">
            <div className="mb-8 flex items-center gap-3">
              <img src="/livro.png" alt="livro" className="h-[51px] w-[56px]" />
              <h1 className="font-serif text-4xl text-[#464646]">
                Editar Comunicados
              </h1>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar comunicado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-lg border border-gray-300 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredComunicados.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                <p className="text-gray-500">Nenhum comunicado encontrado.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-[#464646]">
                        Slug
                      </TableHead>
                      <TableHead className="font-semibold text-[#464646]">
                        Título
                      </TableHead>
                      <TableHead className="font-semibold text-[#464646]">
                        Tags
                      </TableHead>
                      <TableHead className="font-semibold text-[#464646]">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-[#464646]">
                        Data
                      </TableHead>
                      <TableHead className="text-right font-semibold text-[#464646]">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComunicados.map((comunicado) => (
                      <TableRow key={comunicado.id}>
                        <TableCell className="max-w-[150px] truncate font-mono text-xs text-gray-500">
                          {comunicado.id}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {comunicado.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {comunicado.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                            {comunicado.tags.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{comunicado.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              comunicado.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {comunicado.published ? "Publicado" : "Rascunho"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(comunicado.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => togglePublished(comunicado)}
                              className={`rounded-lg p-2 transition-colors ${
                                comunicado.published
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-gray-400 hover:bg-gray-100"
                              }`}
                              title={
                                comunicado.published
                                  ? "Inativar Comunicado"
                                  : "Ativar Comunicado"
                              }
                            >
                              <Power className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                redirect(`/comunicado/${comunicado.id}`)
                              }
                              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#1A1A27]"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(comunicado)}
                              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#1A1A27]"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(comunicado.id)}
                              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent
          className="h-[95vh] max-h-[95vh] min-w-[90vw] overflow-y-auto p-0"
          showCloseButton={true}
        >
          <div className="p-8">
            <div className="mb-8 flex items-center">
              <h2 className="font-serif text-3xl text-[#464646]">
                Editar Comunicado
              </h2>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Slug (read-only) */}
              {editingComunicado && (
                <div className="flex items-center gap-8">
                  <label className="w-32 font-medium text-[#464646]">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editingComunicado.id}
                    readOnly
                    className="h-12 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 font-mono text-sm text-gray-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-8">
                <label className="w-32 font-medium text-[#464646]">
                  Data e Hora de Atualização
                </label>
                <input
                  type="datetime-local"
                  //@ts-ignore
                  value={createdAt}
                  placeholder="Data e Hora"
                  onChange={(e) => {
                    const dateTimeValue = e.target.value;
                    if (dateTimeValue) {
                      setCreatedAt(dateTimeValue.replace("T", " ") + ":00");
                    } else {
                      setCreatedAt(null);
                    }
                  }}
                  className="h-12 flex-1 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Título */}
              <div className="flex items-center gap-8">
                <label className="w-32 font-medium text-[#464646]">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 flex-1 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div className="flex items-center gap-8">
                <label className="w-32 font-medium text-[#464646]">
                  Descrição
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="h-12 flex-1 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Tags */}
              <div className="flex items-center gap-8">
                <label className="w-32 font-medium text-[#464646]">Tags</label>
                <TagInput tags={tags} setTags={setTags} />
              </div>

              {/* Imagem */}
              <div className="flex items-center gap-8">
                <label className="w-32 font-medium text-[#464646]">
                  Imagem
                </label>
                <label className="cursor-pointer rounded-full bg-[#0000001C] px-6 py-2 text-sm italic text-[#464646] transition-colors hover:bg-gray-400">
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
                <label className="w-32 pt-2 font-medium text-[#464646]">
                  Texto
                </label>
                <div className="flex-1">
                  <TextEditor value={text} onChange={setText} />
                </div>
              </div>

              {/* Tipo de Botão */}
              <div className="flex items-center gap-8">
                <label className="w-32 font-medium text-[#464646]">
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
                    <label className="w-48 font-medium text-[#464646]">
                      Título do Botão do Link
                    </label>
                    <input
                      type="text"
                      value={downloadButtonText2}
                      onChange={(e) => setDownloadButtonText2(e.target.value)}
                      className="h-12 w-[300px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="w-48 font-medium text-[#464646]">
                      Vincular Link
                    </label>
                    <input
                      type="text"
                      value={accessLink}
                      onChange={(e) => setAccessLink(e.target.value)}
                      placeholder="Colar link"
                      className="h-12 w-[300px] rounded-lg border border-gray-300 px-4 placeholder:italic placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
                </>
              )}

              {/* Texto intermediário (apenas quando ambos ativos) */}
              {showLink && showArquivo && (
                <div className="flex gap-8">
                  <label className="w-48 pt-2 font-medium text-[#464646]">
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
                    <label className="w-48 font-medium text-[#464646]">
                      Título do Botão Arquivo
                    </label>
                    <input
                      type="text"
                      value={downloadButtonText}
                      onChange={(e) => setDownloadButtonText(e.target.value)}
                      className="h-12 w-[300px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="w-48 font-medium text-[#464646]">
                      Selecionar Documento
                    </label>
                    <label className="cursor-pointer rounded-full bg-[#0000001C] px-6 py-2 text-sm italic text-[#464646] transition-colors hover:bg-gray-400">
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
              <div className="flex justify-center gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={isSaving}
                  className="rounded-lg bg-[#F8F9D1] px-12 py-3 font-medium text-[#464646] transition-colors hover:bg-[#ebe9c4] disabled:opacity-50"
                >
                  <Eye className="mr-2 inline-block h-4 w-4" />
                  Visualizar
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-[#F8F9D1] px-12 py-3 font-medium text-[#464646] transition-colors hover:bg-[#ebe9c4] disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent
          className="h-[98vh] max-h-[98vh] min-w-[98vw] overflow-y-auto rounded-lg p-0"
          showCloseButton={true}
        >
          <PreviewLayout1
            title={title || "Título do comunicado"}
            tags={tags.filter((t) => t.trim() !== "")}
            image={image}
            text={text || "<p>Digite o conteúdo aqui...</p>"}
            downloadButtonText={showArquivo ? downloadButtonText : ""}
            downloadFile={showArquivo ? downloadFile : null}
            date={new Date()}
            updated={new Date()}
            downloadButtonText2={showLink ? downloadButtonText2 : ""}
            accessLink={showLink ? accessLink : ""}
            textAboveDownloadButton={
              showLink && showArquivo ? textAboveDownloadButton : ""
            }
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <div className="p-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#464646]">
              Excluir Comunicado
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Tem certeza que deseja excluir este comunicado? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-[#464646] transition-colors hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
