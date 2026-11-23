'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getYearRange } from '@/lib/utils';

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
  const [focusedMonth, setFocusedMonth] = useState(month);
  const [focusedYear, setFocusedYear] = useState(year);
  const [focusArea, setFocusArea] = useState<'months' | 'years'>('months');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const years = getYearRange(2025, 2030);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (focusArea === 'months') {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            setFocusedMonth((prev) => (prev === 0 ? 11 : prev - 1));
            break;
          case 'ArrowRight':
            event.preventDefault();
            setFocusedMonth((prev) => (prev === 11 ? 0 : prev + 1));
            break;
          case 'ArrowUp':
            event.preventDefault();
            setFocusedMonth((prev) => Math.max(0, prev - 3));
            break;
          case 'ArrowDown':
            event.preventDefault();
            setFocusedMonth((prev) => Math.min(11, prev + 3));
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            handleMonthSelect(focusedMonth);
            break;
          case 'Tab':
            if (!event.shiftKey) {
              event.preventDefault();
              setFocusArea('years');
              setFocusedYear(selectedYear);
            }
            break;
        }
      } else if (focusArea === 'years') {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            setFocusedYear((prev) => {
              const idx = years.indexOf(prev);
              return idx > 0 ? years[idx - 1] : years[years.length - 1];
            });
            break;
          case 'ArrowRight':
            event.preventDefault();
            setFocusedYear((prev) => {
              const idx = years.indexOf(prev);
              return idx < years.length - 1 ? years[idx + 1] : years[0];
            });
            break;
          case 'ArrowUp':
            event.preventDefault();
            setFocusedYear((prev) => {
              const idx = years.indexOf(prev);
              return idx >= 4 ? years[idx - 4] : years[idx];
            });
            break;
          case 'ArrowDown':
            event.preventDefault();
            setFocusedYear((prev) => {
              const idx = years.indexOf(prev);
              return idx + 4 < years.length ? years[idx + 4] : years[years.length - 1];
            });
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            handleYearSelect(focusedYear);
            break;
          case 'Tab':
            if (event.shiftKey) {
              event.preventDefault();
              setFocusArea('months');
              setFocusedMonth(selectedMonth);
            }
            break;
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusArea, selectedMonth, selectedYear, focusedMonth, focusedYear, years]);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setSelectedMonth(month);
          setSelectedYear(year);
          setFocusedMonth(month);
          setFocusedYear(year);
          setFocusArea('months');
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
            <div className="grid grid-cols-3 gap-1" role="grid" aria-label="Meses">
              {MONTH_NAMES.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleMonthSelect(i)}
                  onFocus={() => {
                    setFocusArea('months');
                    setFocusedMonth(i);
                  }}
                  className={cn(
                    'py-2 px-2 rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    i === selectedMonth && selectedYear === year
                      ? 'bg-primary text-on-primary'
                      : 'text-text-muted hover:text-text hover:bg-background',
                    focusArea === 'months' && focusedMonth === i
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                      : ''
                  )}
                  aria-pressed={i === selectedMonth && selectedYear === year}
                  aria-label={m}
                  role="gridcell"
                  tabIndex={focusArea === 'months' && focusedMonth === i ? 0 : -1}
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
            <div className="grid grid-cols-4 gap-1" role="grid" aria-label="Anos">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleYearSelect(y)}
                  onFocus={() => {
                    setFocusArea('years');
                    setFocusedYear(y);
                  }}
                  className={cn(
                    'py-2 px-2 rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    y === selectedYear
                      ? 'bg-primary text-on-primary'
                      : 'text-text-muted hover:text-text hover:bg-background',
                    focusArea === 'years' && focusedYear === y
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                      : ''
                  )}
                  aria-pressed={y === selectedYear}
                  aria-label={String(y)}
                  role="gridcell"
                  tabIndex={focusArea === 'years' && focusedYear === y ? 0 : -1}
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