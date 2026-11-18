'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const monthNamesShort = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

interface MonthYearPickerProps {
  month: number; // 0-11
  year: number;
  onChange: (month: number, year: number) => void;
  className?: string;
  minYear?: number;
  maxYear?: number;
  showIcon?: boolean;
}

export function MonthYearPicker({
  month,
  year,
  onChange,
  className,
  minYear = 2025,
  maxYear = 2030,
  showIcon = true,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with props
  useEffect(() => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, [month, year]);

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    onChange(newMonth, selectedYear);
    setIsOpen(false);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    onChange(selectedMonth, newYear);
  };

  const handlePrevYear = () => {
    if (selectedYear > minYear) {
      handleYearChange(selectedYear - 1);
    }
  };

  const handleNextYear = () => {
    if (selectedYear < maxYear) {
      handleYearChange(selectedYear + 1);
    }
  };

  const handlePrevMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    if (newYear >= minYear) {
      handleMonthChange(newMonth);
      if (newYear !== selectedYear) handleYearChange(newYear);
    }
  };

  const handleNextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    if (newYear <= maxYear) {
      handleMonthChange(newMonth);
      if (newYear !== selectedYear) handleYearChange(newYear);
    }
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Trigger Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        className="gap-2 px-3 py-2 min-w-[180px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Mês atual: ${monthNames[month]} ${year}`}
      >
        {showIcon && <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        <span className="font-medium text-card-foreground truncate flex-1 text-left">
          {monthNames[month]} {year}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 mt-2 w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in"
          role="dialog"
          aria-label="Selecionar mês e ano"
        >
          {/* Year Selector */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevYear}
              disabled={selectedYear <= minYear}
              aria-label="Ano anterior"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-card-foreground">{selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextYear}
              disabled={selectedYear >= maxYear}
              aria-label="Próximo ano"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="p-2 grid grid-cols-3 gap-1">
            {monthNamesShort.map((shortName, index) => (
              <button
                key={index}
                onClick={() => handleMonthChange(index)}
                className={cn(
                  'px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  index === selectedMonth
                    ? 'bg-primary-500 text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                )}
                aria-current={index === month ? 'date' : undefined}
                aria-label={monthNames[index]}
              >
                {shortName}
              </button>
            ))}
          </div>

          {/* Quick Year Select */}
          <div className="px-2 pb-2 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearChange(y)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    y === selectedYear
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Compact version for header */
export function CompactMonthYearPicker({
  month,
  year,
  onChange,
  className,
  minYear = 2025,
  maxYear = 2030,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, [month, year]);

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    onChange(newMonth, selectedYear);
    setIsOpen(false);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    onChange(selectedMonth, newYear);
  };

  const handlePrevMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    if (newYear >= minYear) {
      handleMonthChange(newMonth);
      if (newYear !== selectedYear) handleYearChange(newYear);
    }
  };

  const handleNextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    if (newYear <= maxYear) {
      handleMonthChange(newMonth);
      if (newYear !== selectedYear) handleYearChange(newYear);
    }
  };

  return (
    <div className={cn('relative inline-flex items-center gap-2', className)}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        disabled={month === 0 && year === minYear}
        aria-label="Mês anterior"
        className="h-9 w-9 rounded-lg"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        ref={buttonRef}
        variant="outline"
        className="px-4 py-1.5 min-w-[160px] lg:min-w-[180px] gap-2 justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Mês atual: ${monthNames[month]} ${year}`}
      >
        <span className="text-sm font-semibold text-card-foreground w-40 text-center">
          {monthNames[month]} {year}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        disabled={month === 11 && year === maxYear}
        aria-label="Próximo mês"
        className="h-9 w-9 rounded-lg"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 mt-2 w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in"
          role="dialog"
          aria-label="Selecionar mês e ano"
        >
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevYear}
              disabled={selectedYear <= minYear}
              aria-label="Ano anterior"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-card-foreground">{selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextYear}
              disabled={selectedYear >= maxYear}
              aria-label="Próximo ano"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-2 grid grid-cols-3 gap-1">
            {monthNamesShort.map((shortName, index) => (
              <button
                key={index}
                onClick={() => handleMonthChange(index)}
                className={cn(
                  'px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  index === selectedMonth
                    ? 'bg-primary-500 text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                )}
                aria-current={index === month ? 'date' : undefined}
                aria-label={monthNames[index]}
              >
                {shortName}
              </button>
            ))}
          </div>
          <div className="px-2 pb-2 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearChange(y)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    y === selectedYear
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}