'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ChevronDown, ChevronRight, X, Search } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  color: string | null;
  icon: string | null;
  _level?: number;
  _children?: CategoryOption[];
}

interface CategorySelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  excludeId?: string;
  filterType?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  required?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  excludeId = '',
  filterType,
  placeholder = 'Selecione uma categoria',
  disabled = false,
  error = false,
  label,
  required = false,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on mount and when filterType changes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams();
        if (filterType) params.set('type', filterType);
        if (excludeId) params.set('exclude', excludeId);

        const response = await fetch(`/api/categories/flat?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, [filterType, excludeId]);

  // Build hierarchical tree for display
  const buildTree = useCallback((cats: CategoryOption[], parentId: string | null = null, level = 0): CategoryOption[] => {
    return cats
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((cat) => ({
        ...cat,
        _level: level,
        _children: buildTree(cats, cat.id, level + 1),
      }));
  }, []);

  const tree = buildTree(categories);

  // Flatten tree for search
  const flattenTree = useCallback((nodes: CategoryOption[]): CategoryOption[] => {
    return nodes.flatMap((node) => [node, ...flattenTree(node._children || [])]);
  }, []);

  const allNodes = flattenTree(tree);

  // Filter nodes by search term
  const filteredNodes = searchTerm
    ? allNodes.filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allNodes;

  // Find selected category
  const selectedCategory = categories.find((cat) => cat.id === value);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (category: CategoryOption) => {
    onChange(category.id);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INCOME: 'Receita',
      EXPENSE: 'Despesa',
      TRANSFER: 'Transferência',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INCOME: 'bg-green-100 text-green-800',
      EXPENSE: 'bg-red-100 text-red-800',
      TRANSFER: 'bg-blue-100 text-blue-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="category-selector" required={required}>
          {label}
        </Label>
      )}

      <div className="relative">
        <div
          className={cn(
            'relative flex items-center',
            'h-10 w-full rounded-lg border bg-white px-3 py-2',
            'placeholder:text-gray-400',
            'focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
            'cursor-pointer',
            error && 'border-red-500',
            !error && 'border-gray-300'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || 'Selecionar categoria'}
        >
          <Input
            ref={inputRef}
            id="category-selector"
            type="text"
            readOnly
            placeholder={placeholder}
            value={
              selectedCategory
                ? `${selectedCategory.name}${selectedCategory.parentId ? ` > ${categories.find(c => c.id === selectedCategory?.parentId)?.name || ''}` : ''}`
                : ''
            }
            className={cn(
              'pr-10 bg-transparent border-0 focus:ring-0 focus:outline-none shadow-none',
              'py-0 h-10',
              disabled && 'cursor-not-allowed'
            )}
            disabled={disabled || true}
            aria-activedescendant={isOpen ? 'category-option-0' : undefined}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Limpar seleção"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
            )}
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
            role="listbox"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none"
                  aria-label="Buscar categorias"
                />
              </div>
            </div>

            {/* Options */}
            {filteredNodes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria disponível'}
              </div>
            ) : (
              <ul role="listbox" className="py-1">
                {filteredNodes.map((node, index) => (
                  <li
                    key={node.id}
                    role="option"
                    id={`category-option-${index}`}
                    aria-selected={node.id === value}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                      'hover:bg-gray-50',
                      node.id === value && 'bg-primary-50 text-primary-700'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(node);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {/* Indentation */}
                    <span className="w-4" style={{ width: `${Math.max(12, (node._level || 0) * 16)}px` }} />

                    {/* Expand/Collapse indicator for parent categories */}
                    {node._children && node._children.length > 0 && (
                      <ChevronRight
                        className={cn('h-4 w-4 text-gray-400 flex-shrink-0 transition-transform')}
                      />
                    )}

                    {/* Color indicator */}
                    {node.color && (
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: node.color }}
                      />
                    )}

                    {/* Icon */}
                    {node.icon && (
                      <span className="text-gray-400 flex-shrink-0" aria-hidden="true">
                        {/* In a real implementation, you'd render the actual Lucide icon */}
                        ▸
                      </span>
                    )}

                    {/* Name and type */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{node.name}</p>
                      <p className="text-xs">
                        <span className={cn('px-1.5 py-0.5 rounded text-xs', getTypeColor(node.type))}>
                          {getTypeLabel(node.type)}
                        </span>
                      </p>
                    </div>

                    {/* Selected indicator */}
                    {node.id === value && (
                      <svg className="h-5 w-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* No parent option */}
            {!searchTerm && (
              <li
                role="option"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                  'hover:bg-gray-50',
                  !value && 'bg-primary-50 text-primary-700'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect({ id: '', name: '', type: '', parentId: null, color: null, icon: null } as any);
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="w-4" />
                <div className="h-3 w-3 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">— Nenhuma (categoria raiz) —</p>
                </div>
                {!value && (
                  <svg className="h-5 w-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            )}
          </div>
        )}
      </div>
    </div>
  );
}