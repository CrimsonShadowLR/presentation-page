/**
 * Utility functions for formatting display values
 */

import { RiskLevel } from '@/types/game';

/**
 * Convert cents to dollars and format as currency
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "$1,000.00")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format currency with sign prefix for positive/negative amounts
 * @param cents - Amount in cents
 * @returns Formatted currency with sign (e.g., "+$3,000.00" or "-$1,000.00")
 */
export function formatCurrencyWithSign(cents: number): string {
  const formatted = formatCurrency(Math.abs(cents));
  return cents >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Format currency for input (without dollar sign)
 * @param cents - Amount in cents
 * @returns Formatted number (e.g., "1,000.00")
 */
export function formatCurrencyInput(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse currency input string to cents
 * @param value - Input string (e.g., "1,000.00" or "1000")
 * @returns Amount in cents
 */
export function parseCurrencyInput(value: string): number {
  // Remove commas and any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned) || 0;
  return Math.round(dollars * 100);
}

/**
 * Format win rate as percentage
 * @param winRate - Win rate as decimal (0-1)
 * @returns Formatted percentage (e.g., "60%")
 */
export function formatWinRate(winRate: number): string {
  return `${Math.round(winRate * 100)}%`;
}

/**
 * Get risk level display label
 * @param level - Risk level
 * @param multiplier - Multiplier value
 * @returns Formatted label (e.g., "LOW 1.5x")
 */
export function formatRiskLevel(level: RiskLevel, multiplier: number): string {
  const labels: Record<RiskLevel, string> = {
    low: 'LOW',
    medium: 'MED',
    high: 'HIGH',
    max: 'MAX',
  };
  return `${labels[level]} ${multiplier}x`;
}

/**
 * Get risk multiplier for display
 * @param level - Risk level
 * @returns Multiplier string (e.g., "1.5x")
 */
export function getRiskMultiplier(level: RiskLevel): string {
  const multipliers: Record<RiskLevel, string> = {
    low: '1.5x',
    medium: '2x',
    high: '3x',
    max: '5x',
  };
  return multipliers[level];
}

/**
 * Get numeric multiplier value
 * @param level - Risk level
 * @returns Multiplier as number
 */
export function getRiskMultiplierValue(level: RiskLevel): number {
  const multipliers: Record<RiskLevel, number> = {
    low: 1.5,
    medium: 2.0,
    high: 3.0,
    max: 5.0,
  };
  return multipliers[level];
}

/**
 * Format timestamp to readable date/time
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format compact number (for large values)
 * @param value - Number to format
 * @returns Compact formatted string (e.g., "1.2K", "3.4M")
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
