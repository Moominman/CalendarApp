export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const MONTH_ABBREVS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const DAY_ABBREVS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365
}

// Returns 0=Mon, 1=Tue, ..., 6=Sun (Monday-based)
export function getDayOfWeekMondayBased(year, month, day) {
  const d = new Date(year, month, day)
  const jsDay = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1
}

// Get the ISO week number for a date
export function getWeekNumber(year, month, day) {
  const date = new Date(year, month, day)
  const dayOfYear = Math.floor((date - new Date(year, 0, 1)) / 86400000) + 1
  const jan1Day = getDayOfWeekMondayBased(year, 0, 1)
  const weekNum = Math.ceil((dayOfYear + jan1Day) / 7)
  return weekNum
}

// Get all days in a year, organized for the grid
export function getYearGrid(year) {
  const months = []

  for (let month = 0; month < 12; month++) {
    const days = daysInMonth(year, month)
    const monthDays = []

    for (let day = 1; day <= days; day++) {
      monthDays.push({
        year,
        month,
        day,
        dayOfWeek: getDayOfWeekMondayBased(year, month, day),
        date: new Date(year, month, day),
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      })
    }

    months.push({
      month,
      name: MONTH_NAMES[month],
      abbrev: MONTH_ABBREVS[month],
      days: monthDays,
      startDayOfWeek: getDayOfWeekMondayBased(year, month, 1),
      totalDays: days
    })
  }

  return months
}

// Total columns needed: from first Monday to last Sunday encompassing the whole year
export function getYearColumns(year) {
  // Find the Monday on or before Jan 1
  const jan1Dow = getDayOfWeekMondayBased(year, 0, 1) // 0=Mon
  const startOffset = jan1Dow // days to subtract to get to Monday

  // Find the Sunday on or after Dec 31
  const dec31Dow = getDayOfWeekMondayBased(year, 11, 31) // 0=Mon, 6=Sun
  const endOffset = dec31Dow === 6 ? 0 : 6 - dec31Dow // days to add to get to Sunday

  const totalDays = daysInYear(year) + startOffset + endOffset
  const totalWeeks = totalDays / 7

  return { totalWeeks: Math.round(totalWeeks), startOffset }
}

// Convert a date to a column index in the grid
export function dateToColumn(year, month, day, startOffset) {
  const jan1 = new Date(year, 0, 1)
  const target = new Date(year, month, day)
  const dayOfYear = Math.floor((target - jan1) / 86400000) // 0-based
  return dayOfYear + startOffset
}

// Convert a column index back to a date
export function columnToDate(year, column, startOffset) {
  const dayOfYear = column - startOffset // 0-based day of year
  const date = new Date(year, 0, 1 + dayOfYear)
  // Only return if the date is in the correct year
  if (date.getFullYear() !== year) return null
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    dateStr: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

export function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseDateStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month: month - 1, day }
}

export function daysBetween(dateStr1, dateStr2) {
  const d1 = parseDateStr(dateStr1)
  const d2 = parseDateStr(dateStr2)
  const date1 = new Date(d1.year, d1.month, d1.day)
  const date2 = new Date(d2.year, d2.month, d2.day)
  return Math.round((date2 - date1) / 86400000)
}

export function addDays(dateStr, numDays) {
  const d = parseDateStr(dateStr)
  const date = new Date(d.year, d.month, d.day + numDays)
  return formatDateStr(date.getFullYear(), date.getMonth(), date.getDate())
}
