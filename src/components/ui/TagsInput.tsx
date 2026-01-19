import React, { useState, KeyboardEvent } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-2 py-1 bg-muted/20 focus-within:ring-2 focus-within:ring-orange-500">
      {value.map((tag, idx) => (
        <span key={tag + idx} className="flex items-center bg-blue-800 text-white px-2 py-1 rounded text-xs">
          {tag}
          <button
            type="button"
            className="ml-1 text-primary-foreground hover:text-red-500 focus:outline-none"
            onClick={() => removeTag(idx)}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] bg-transparent outline-none border-none p-1 text-sm"
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder || 'Add a tag'}
      />
    </div>
  );
}
