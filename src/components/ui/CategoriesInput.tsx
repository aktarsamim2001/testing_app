import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CategoriesInputProps {
  value: string[];
  onChange: (categories: string[]) => void;
  availableCategories: Category[];
  placeholder?: string;
}

export default function CategoriesInput({
  value,
  onChange,
  availableCategories,
  placeholder = 'Search and add categories...',
}: CategoriesInputProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search input and exclude already selected ones
  const filteredCategories = availableCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(cat.name)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCategory = (categoryName: string) => {
    if (!value.includes(categoryName)) {
      onChange([...value, categoryName]);
      setInput('');
      setIsOpen(false);
    }
  };

  const handleRemoveCategory = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      // Add as custom category if not found in available categories
      const existing = availableCategories.find(
        (cat) => cat.name.toLowerCase() === input.trim().toLowerCase()
      );
      if (existing) {
        handleAddCategory(existing.name);
      } else {
        // Allow custom categories
        handleAddCategory(input.trim());
      }
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-2 py-1 bg-muted/20 focus-within:ring-2 focus-within:ring-orange-500 min-h-[40px]">
        {value.map((category, idx) => (
          <span
            key={category + idx}
            className="flex items-center gap-1 bg-blue-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
          >
            {category}
            <button
              type="button"
              className="ml-1 hover:text-red-500 focus:outline-none"
              onClick={() => handleRemoveCategory(idx)}
              aria-label={`Remove category ${category}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[120px] bg-transparent outline-none border-none p-1 text-sm"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-md bg-white shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                onClick={() => handleAddCategory(category.name)}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-gray-400 group-hover:text-blue-600">+</span>
              </button>
            ))
          ) : input.trim() ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No categories found. Press Enter to add "{input.trim()}"
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400">
              Start typing to search categories...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
