'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ChevronDown, X, Search, Landmark, CreditCard, TrendingUp, Wallet, PiggyBank } from 'lucide-react';

interface AccountOption {
  id: string;
  name: string;
  type: string;
  institutionId: string;
  institutionName: string;
  currentBalance: number;
}

interface AccountSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  filterType?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH';
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  required?: boolean;
  showBalance?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão de Crédito',
  INVESTMENT: 'Investimento',
  CASH: 'Dinheiro',
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CHECKING: Landmark,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
  CASH: Wallet,
};

const TYPE_COLORS: Record<string, string> = {
  CHECKING: 'bg-blue-100 text-blue-800',
  SAVINGS: 'bg-green-100 text-green-800',
  CREDIT_CARD: 'bg-purple-100 text-purple-800',
  INVESTMENT: 'bg-amber-100 text-amber-800',
  CASH: 'bg-gray-100 text-gray-800',
};

export function AccountSelector({
  value,
  onChange,
  filterType,
  placeholder = 'Selecione uma conta',
  disabled = false,
  error = false,
  label,
  required = false,
  showBalance = true,
}: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch accounts on mount and when filterType changes
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const params = new URLSearchParams();
        if (filterType) params.set('type', filterType);

        const response = await fetch(`/api/accounts/flat?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAccounts(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
      }
    };

    fetchAccounts();
  }, [filterType]);

  // Find selected account
  const selectedAccount = accounts.find((acc) => acc.id === value);

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

  // Filter accounts by search term
  const filteredAccounts = searchTerm
    ? accounts.filter((acc) =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.institutionName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : accounts;

  const handleSelect = (account: AccountOption) => {
    onChange(account.id);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const getTypeLabel = (type: string) => TYPE_LABELS[type] || type;

  const getTypeColor = (type: string) => TYPE_COLORS[type] || 'bg-gray-100 text-gray-800';

  const TypeIcon = TYPE_ICONS[selectedAccount?.type || 'CHECKING'] || Landmark;

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="account-selector" required={required}>
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
          aria-label={label || 'Selecionar conta'}
        >
          <Input
            ref={inputRef}
            id="account-selector"
            type="text"
            readOnly
            placeholder={placeholder}
            value={
              selectedAccount
                ? `${selectedAccount.name} - ${selectedAccount.institutionName}${showBalance ? ` (${selectedAccount.currentBalance >= 0 ? '' : '-'}${Math.abs(selectedAccount.currentBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}`
                : ''
            }
            className={cn(
              'pr-10 bg-transparent border-0 focus:ring-0 focus:outline-none shadow-none',
              'py-0 h-10',
              disabled && 'cursor-not-allowed'
            )}
            disabled={disabled || true}
            aria-activedescendant={isOpen ? 'account-option-0' : undefined}
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
                  placeholder="Buscar contas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none"
                  aria-label="Buscar contas"
                />
              </div>
            </div>

            {/* Options */}
            {filteredAccounts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'Nenhuma conta encontrada' : 'Nenhuma conta disponível'}
              </div>
            ) : (
              <ul role="listbox" className="py-1">
                {filteredAccounts.map((account, index) => {
                  const TypeIcon = TYPE_ICONS[account.type] || Landmark;
                  const isSelected = account.id === value;
                  return (
                    <li
                      key={account.id}
                      role="option"
                      id={`account-option-${index}`}
                      aria-selected={isSelected}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                        'hover:bg-gray-50',
                        isSelected && 'bg-primary-50 text-primary-700'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(account);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: account.type === 'CREDIT_CARD' ? '#A855F7' : account.type === 'SAVINGS' ? '#22C55E' : account.type === 'INVESTMENT' ? '#F59E0B' : account.type === 'CASH' ? '#6B7280' : '#3B82F6' }}
                      >
                        <TypeIcon className="h-4 w-4 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{account.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span className={cn('px-1.5 py-0.5 rounded text-xs', getTypeColor(account.type))}>
                            {getTypeLabel(account.type)}
                          </span>
                          <span>{account.institutionName}</span>
                        </p>
                      </div>
                      {showBalance && (
                        <span className={cn('font-mono text-sm flex-shrink-0', account.currentBalance < 0 ? 'text-red-600' : 'text-gray-900')}>
                          {account.currentBalance >= 0 ? '' : '-'}{Math.abs(account.currentBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      {isSelected && (
                        <svg className="h-5 w-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* No account option */}
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
                  handleSelect({ id: '', name: '', type: '', institutionId: '', institutionName: '', currentBalance: 0 } as any);
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200">
                  <Landmark className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">— Nenhuma —</p>
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