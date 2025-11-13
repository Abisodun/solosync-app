/**
 * Currency formatting utilities
 * Supports all currency codes with their respective symbols
 */

// Common currency symbols
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  INR: '₹',
  RUB: '₽',
  BRL: 'R$',
  KRW: '₩',
  MXN: 'Mex$',
  ZAR: 'R',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  THB: '฿',
  IDR: 'Rp',
  MYR: 'RM',
  PHP: '₱',
  TRY: '₺',
  AED: 'د.إ',
  SAR: '﷼',
  ILS: '₪',
  NZD: 'NZ$',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  ISK: 'kr',
  UAH: '₴',
};

/**
 * Formats a number as currency with the appropriate symbol
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'USD', options = {}) {
  const {
    showSymbol = true,
    decimals = 2,
    locale = 'en-US'
  } = options;

  // Format the number
  const formattedNumber = amount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  // Get currency symbol
  const symbol = CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '$';

  // Return formatted currency
  return showSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
}

/**
 * Gets the currency symbol for a given currency code
 * @param {string} currencyCode - The ISO 4217 currency code
 * @returns {string} The currency symbol
 */
export function getCurrencySymbol(currencyCode = 'USD') {
  return CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '$';
}

/**
 * Formats currency for display in tables/lists (shorter format)
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO 4217 currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrencyShort(amount, currencyCode = 'USD') {
  const symbol = getCurrencySymbol(currencyCode);
  
  // For large numbers, abbreviate
  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount, currencyCode, { decimals: 0 });
}

export default {
  formatCurrency,
  getCurrencySymbol,
  formatCurrencyShort,
  CURRENCY_SYMBOLS
};