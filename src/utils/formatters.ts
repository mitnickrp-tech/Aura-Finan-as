/**
 * Formatting utilities for Brazilian currency (BRL), dates, and percentages
 */

export function formatCurrency(value: number, currency: 'BRL' | 'USD' | 'EUR' = 'BRL'): string {
  if (isNaN(value)) return 'R$ 0,00';
  
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } else if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  } else {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  }
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex] || '';
}

export function getCurrentMonthYear(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-12
  };
}

export function isDateInPeriod(dateStr: string, period: string, refDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-11

  switch (period) {
    case 'this_month':
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    case 'last_month': {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getFullYear() === prevYear && date.getMonth() === prevMonth;
    }
    case 'last_3_months': {
      const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
      const endOfThisMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      return date >= threeMonthsAgo && date <= endOfThisMonth;
    }
    case 'year':
      return date.getFullYear() === currentYear;
    case 'all':
    default:
      return true;
  }
}
