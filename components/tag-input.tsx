"use client";

import { X, Plus } from "lucide-react";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const displayTags = tags.length === 0 ? ["", ""] : tags;

  const removeTag = (index: number) => {
    if (displayTags.length > 1) {
      const newTags = displayTags.filter((_, i) => i !== index);
      setTags(newTags.filter((tag) => tag.trim() !== ""));
    }
  };

  const addTag = () => {
    setTags([...displayTags, ""]);
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...displayTags];
    newTags[index] = value;
    setTags(newTags.filter((tag) => tag.trim() !== ""));
  };

  return (
    <div className="flex items-center gap-3">
      {displayTags.map((tag, index) => (
        <div key={index} className="relative">
          <input
            type="text"
            value={tag}
            onChange={(e) => updateTag(index, e.target.value)}
            className="h-10 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 w-[220px]"
          />
          <button
            onClick={() => removeTag(index)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D9D9D9B2] flex items-center justify-center hover:bg-gray-400 transition-colors"
          >
            <X className="w-3 h-3 text-[#464646]" />
          </button>
        </div>
      ))}
      <button
        onClick={addTag}
        className="w-10 h-10 rounded-full bg-[#D9D9D9B2] flex items-center justify-center hover:bg-gray-400 transition-colors"
      >
        <Plus className="w-4 h-4 text-[#464646] " />
      </button>
    </div>
  );
}
