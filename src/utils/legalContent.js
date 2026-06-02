function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function looksLikeHtml(content) {
  if (!content) return false;
  return /<(p|h[1-6]|ul|ol|li|br|div|section|article|strong|em)\b/i.test(content);
}

/** Insert breaks before numbered sections in a single-line wall of text */
export function splitNumberedSections(text) {
  if (!text || text.includes('\n')) return text;
  return text
    .replace(/\s+(?=\d+\.\d+(?:\s|$))/g, '\n\n')
    .replace(/\s+(?=\d+\.\s+(?=[A-Za-z]))/g, '\n\n');
}

export function formatPlainTextToHtml(text) {
  if (!text?.trim()) return '';

  const normalized = splitNumberedSections(text.replace(/\r\n/g, '\n').trim());
  const lines = normalized.split('\n');

  let html = '';
  let paragraph = [];
  let inList = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const content = escapeHtml(paragraph.join(' ').trim());
    if (content) html += `<p>${content}</p>`;
    paragraph = [];
  };

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const numbered = line.match(/^(\d+(?:\.\d+)?)\.?\s+(.+)$/);
    if (numbered) {
      flushParagraph();
      closeList();
      const isSub = /^\d+\.\d+/.test(line);
      const tag = isSub ? 'h3' : 'h2';
      const body = numbered[2];
      const titled = body.match(/^([^:]+):\s*(.+)$/);
      if (titled && titled[2].length > 20) {
        html += `<${tag}>${escapeHtml(`${numbered[1]}. ${titled[1].trim()}`)}</${tag}>`;
        html += `<p>${escapeHtml(titled[2].trim())}</p>`;
      } else {
        html += `<${tag}>${escapeHtml(line)}</${tag}>`;
      }
      continue;
    }

    const bullet = line.match(/^[-•*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${escapeHtml(bullet[1])}</li>`;
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return html;
}

/** Normalize content for storage and public display */
export function prepareLegalHtml(content) {
  if (!content?.trim()) return '';
  const trimmed = content.trim();
  if (looksLikeHtml(trimmed)) return trimmed;
  return formatPlainTextToHtml(trimmed);
}
