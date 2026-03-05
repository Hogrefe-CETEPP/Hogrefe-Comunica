"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import Color from "@tiptap/extension-color";
import HardBreak from "@tiptap/extension-hard-break";
import { useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link2,
  ImageIcon,
  AlignLeft,
  List,
  ListOrdered,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// 16 cores padrão do Word
const WORD_COLORS = [
  { color: "#000000", name: "Preto" },
  { color: "#7F7F7F", name: "Cinza escuro" },
  { color: "#880015", name: "Bordô" },
  { color: "#ED1C24", name: "Vermelho" },
  { color: "#FF7F27", name: "Laranja" },
  { color: "#FFF200", name: "Amarelo" },
  { color: "#22B14C", name: "Verde" },
  { color: "#00A2E8", name: "Azul claro" },
  { color: "#3F48CC", name: "Azul" },
  { color: "#A349A4", name: "Roxo" },
  { color: "#FFFFFF", name: "Branco" },
  { color: "#C3C3C3", name: "Cinza claro" },
  { color: "#B97A57", name: "Marrom" },
  { color: "#FFAEC9", name: "Rosa" },
  { color: "#FFC90E", name: "Dourado" },
  { color: "#EFE4B0", name: "Creme" },
];

const FONT_SIZES = [
  "8px",
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
  "72px",
];

export function TextEditor({ value, onChange }: TextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#464646");
  const [selectedFontSize, setSelectedFontSize] = useState("18px");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        //@ts-ignore
        history: {
          depth: 100,
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
        hardBreak: false, // Disable default to use custom config
      }),
      HardBreak.configure({
        keepMarks: true,
      }),
      ListItem,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#464646] underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "listItem"],
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[230px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 prose prose-sm max-w-none [&_.ProseMirror]:text-justify-inter-word",
        style: "text-justify: inter-word; hyphens: auto; ",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run();
  }, [editor]);

  const handleStrikethrough = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const handleLink = useCallback(() => {
    const url = window.prompt("Digite a URL do link:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleImage = useCallback(() => {
    const url = window.prompt("Digite a URL da imagem:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const handleUndo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const handleTextColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run();
      setSelectedColor(color);
      setShowColorPicker(false);
    },
    [editor],
  );

  const handleFontSize = useCallback(
    (size: string) => {
      editor?.chain().focus().setFontSize(size).run();
      setSelectedFontSize(size);
      setShowFontSizeMenu(false);
    },
    [editor],
  );

  const handleAlignment = useCallback(
    (alignment: "left" | "center" | "right" | "justify") => {
      editor?.chain().focus().setTextAlign(alignment).run();
      setShowAlignMenu(false);
    },
    [editor],
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBold}
            className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
              editor.isActive("bold") ? "bg-gray-200" : ""
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleItalic}
            className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
              editor.isActive("italic") ? "bg-gray-200" : ""
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleUnderline}
            className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
              editor.isActive("underline") ? "bg-gray-200" : ""
            }`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleStrikethrough}
            className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
              editor.isActive("strike") ? "bg-gray-200" : ""
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
            className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <span className="text-sm font-semibold">T</span>
            <span className="text-xs text-gray-500">{selectedFontSize}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showFontSizeMenu && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-10 max-h-60 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleFontSize(size)}
                  className={`w-full px-4 py-2 hover:bg-gray-100 text-left text-sm ${
                    selectedFontSize === size ? "bg-gray-100 font-semibold" : ""
                  }`}
                  style={{ fontSize: size }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLink}
          className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleImage}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <span
              className="text-sm font-semibold"
              style={{ color: selectedColor }}
            >
              A
            </span>
            <div
              className="w-3 h-3 rounded-sm border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10">
              <div className="grid grid-cols-8 gap-1">
                {WORD_COLORS.map(({ color, name }) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleTextColor(color)}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={handleList}
          className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAlignMenu(!showAlignMenu)}
            className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <AlignLeft className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showAlignMenu && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
              <button
                type="button"
                onClick={() => handleAlignment("left")}
                className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm ${
                  editor.isActive({ textAlign: "left" }) ? "bg-gray-100" : ""
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                <span>Esquerda</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlignment("center")}
                className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm ${
                  editor.isActive({ textAlign: "center" }) ? "bg-gray-100" : ""
                }`}
              >
                <AlignCenter className="w-4 h-4" />
                <span>Centro</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlignment("right")}
                className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm ${
                  editor.isActive({ textAlign: "right" }) ? "bg-gray-100" : ""
                }`}
              >
                <AlignRight className="w-4 h-4" />
                <span>Direita</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlignment("justify")}
                className={`w-full px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm ${
                  editor.isActive({ textAlign: "justify" }) ? "bg-gray-100" : ""
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                <span>Justificado</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={handleUndo}
          disabled={!editor.can().undo()}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={!editor.can().redo()}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
