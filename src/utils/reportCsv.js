export function escapeCsvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsvContent(columns, rows) {
  if (!columns?.length) {
    return '\uFEFF"No columns"\r\n';
  }
  const header = columns.map(escapeCsvCell).join(',');
  const lines = (rows || []).map((row) =>
    columns.map((col) => escapeCsvCell(row?.[col])).join(','),
  );
  return `\uFEFF${[header, ...lines].join('\r\n')}`;
}

export function triggerCsvDownload(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 250);
}

export function sectionToCsvBlock(section) {
  const { name, columns, rows } = section;
  const header = columns.map(escapeCsvCell).join(',');
  const dataLines = (rows || []).map((row) =>
    columns.map((col) => escapeCsvCell(row?.[col])).join(','),
  );
  return [`"--- ${name} (${rows?.length || 0} rows) ---"`, header, ...dataLines].join('\r\n');
}
