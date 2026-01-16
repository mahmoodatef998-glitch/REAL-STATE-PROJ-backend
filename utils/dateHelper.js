/**
 * Date Helper Utilities
 * Provides date manipulation and formatting functions for monthly reports
 */

/**
 * Get start and end date for a specific month
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Object} { startDate, endDate }
 */
function getMonthDateRange(year, month) {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Get current month date range
 * @returns {Object} { startDate, endDate, year, month }
 */
function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const { startDate, endDate } = getMonthDateRange(year, month);
  
  return { startDate, endDate, year, month };
}

/**
 * Get previous month date range
 * @returns {Object} { startDate, endDate, year, month }
 */
function getPreviousMonthRange() {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  
  const { startDate, endDate } = getMonthDateRange(year, month);
  
  return { startDate, endDate, year, month };
}

/**
 * Format month for display
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @param {string} locale - Locale (default: 'en')
 * @returns {string} Formatted month (e.g., "January 2024")
 */
function formatMonth(month, year, locale = 'en') {
  const date = new Date(year, month - 1, 1);
  
  if (locale === 'ar') {
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${arabicMonths[month - 1]} ${year}`;
  }
  
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get list of months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of { year, month, label }
 */
function getMonthsList(startDate, endDate) {
  const months = [];
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  let current = new Date(start);
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    
    months.push({
      year,
      month,
      label: formatMonth(month, year),
      labelAr: formatMonth(month, year, 'ar'),
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 0, 23, 59, 59, 999)
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Get last N months
 * @param {number} count - Number of months
 * @returns {Array} Array of { year, month, label }
 */
function getLastNMonths(count = 12) {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    months.push({
      year,
      month,
      label: formatMonth(month, year),
      labelAr: formatMonth(month, year, 'ar'),
      ...getMonthDateRange(year, month)
    });
  }
  
  return months;
}

/**
 * Parse month string (format: "YYYY-MM")
 * @param {string} monthString - Month string
 * @returns {Object} { year, month, startDate, endDate }
 */
function parseMonthString(monthString) {
  const [year, month] = monthString.split('-').map(Number);
  
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }
  
  return {
    year,
    month,
    ...getMonthDateRange(year, month)
  };
}

/**
 * Format date range for display
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted range
 */
function formatDateRange(startDate, endDate) {
  const start = startDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const end = endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${start} - ${end}`;
}

/**
 * Check if date is in month range
 * @param {Date} date - Date to check
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {boolean}
 */
function isDateInMonth(date, year, month) {
  const { startDate, endDate } = getMonthDateRange(year, month);
  return date >= startDate && date <= endDate;
}

module.exports = {
  getMonthDateRange,
  getCurrentMonthRange,
  getPreviousMonthRange,
  formatMonth,
  getMonthsList,
  getLastNMonths,
  parseMonthString,
  formatDateRange,
  isDateInMonth
};

