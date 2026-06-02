/** @returns {string} YYYY-MM-DD for date inputs */
export function toDateInputValue(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Compute inclusive start/end dates for a report filter preset. */
export function rangeFromPreset(preset = 'last30days') {
  const now = new Date();
  let end = new Date(now);
  let start = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (preset) {
    case 'today':
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'last7days':
      start.setDate(start.getDate() - 6);
      break;
    case 'last30days':
      start.setDate(start.getDate() - 29);
      break;
    case 'last90days':
      start.setDate(start.getDate() - 89);
      break;
    case 'last365days':
      start.setDate(start.getDate() - 364);
      break;
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'thisQuarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      break;
    }
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
    default:
      if (preset !== 'custom') {
        start.setDate(start.getDate() - 29);
      }
      break;
  }

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function formatReportRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) return '';
  try {
    const fmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt.format(new Date(startDate))} – ${fmt.format(new Date(endDate))}`;
  } catch {
    return `${startDate} – ${endDate}`;
  }
}
