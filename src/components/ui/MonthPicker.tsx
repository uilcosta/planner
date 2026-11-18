'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getMonthName, getYearRange } from '@/lib/utils';

interface MonthPickerProps {
  month: number; // 0-11
  year: number;
  onChange: (month: number, year: number) => void;
  onGoToCurrent: () => void;
  className?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function MonthPicker({ month, year, onChange, onGoToCurrent, className }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    onChange(newMonth, newYear);
  };

  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    onChange(newMonth, newYear);
  };

  const handleMonthSelect = (m: number) => {
    setSelectedMonth(m);
    onChange(m, selectedYear);
    setIsOpen(false);
  };

  const handleYearSelect = (y: number) => {
    setSelectedYear(y);
    onChange(selectedMonth, y);
    setIsOpen(false);
  };

  const handleGoToCurrent = () => {
    onGoToCurrent();
    setIsOpen(false);
  };

  const years = getYearRange(2025, 2030);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setSelectedMonth(month);
          setSelectedYear(year);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text hover:bg-background transition-all min-w-[180px] lg:min-w-[200px]"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Mês selecionado: ${MONTH_NAMES[month]} ${year}`}
      >
        <Calendar className="h-4 w-4 text-text-muted" aria-hidden="true" />
        <span className="truncate">{MONTH_NAMES[month]} {year}</span>
        <ChevronRight className={cn('h-4 w-4 text-text-muted transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-50 mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-slide-down"
          role="dialog"
          aria-label="Selecionar mês e ano"
        >
          {/* Header com navegação rápida */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-text">{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Grid de meses */}
          <div className="p-2 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-3 gap-1">
              {MONTH_NAMES.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleMonthSelect(i)}
                  className={cn(
                    'py-2 px-2 rounded-lg text-sm font-medium transition-all',
                    i === selectedMonth && selectedYear === year
                      ? 'bg-primary text-on-primary'
                      : 'text-text-muted hover:text-text hover:bg-background'
                  )}
                  aria-pressed={i === selectedMonth && selectedYear === year}
                  aria-label={m}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-border mx-2" />

          {/* Seleção de ano */}
          <div className="p-2 max-h-48 overflow-y-auto">
            <p className="px-2 py-1 text-xs font-medium text-text-muted">Ano</p>
            <div className="grid grid-cols-4 gap-1">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleYearSelect(y)}
                  className={cn(
                    'py-2 px-2 rounded-lg text-sm font-medium transition-all',
                    y === selectedYear
                      ? 'bg-primary text-on-primary'
                      : 'text-text-muted hover:text-text hover:bg-background'
                  )}
                  aria-pressed={y === selectedYear}
                  aria-label={String(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Footer com ação "Mês atual" */}
          <div className="flex items-center justify-between p-3 border-t border-border bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToCurrent}
              className="text-sm"
            >
              <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
              Mês atual
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar seletor"
              className="h-8 w-8 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}