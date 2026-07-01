import React, { useMemo, useRef, useState } from 'react';
import Button from '../ui/Button';
import { prepareLegalHtml } from '../../utils/legalContent';

const LegalContentEditor = ({ value, onChange, label = 'Page content' }) => {
  const textareaRef = useRef(null);
  const [view, setView] = useState('edit');

  const previewHtml = useMemo(() => prepareLegalHtml(value), [value]);

  const wrapSelection = (before, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const insertBlock = (snippet) => {
    const el = textareaRef.current;
    const pos = el?.selectionStart ?? value.length;
    const next = `${value.slice(0, pos)}\n\n${snippet}\n\n${value.slice(pos)}`;
    onChange(next.trimStart());
  };

  const handleAutoFormat = () => {
    onChange(prepareLegalHtml(value));
    setView('preview');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant={view === 'edit' ? 'default' : 'outline'} onClick={() => setView('edit')}>
            Write
          </Button>
          <Button type="button" size="sm" variant={view === 'preview' ? 'default' : 'outline'} onClick={() => setView('preview')}>
            Preview
          </Button>
        </div>
      </div>

      {view === 'edit' && (
        <>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-muted/40">
            <Button type="button" size="sm" variant="outline" onClick={() => wrapSelection('<h2>', '</h2>')}>Heading</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => wrapSelection('<h3>', '</h3>')}>Subheading</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => wrapSelection('<strong>', '</strong>')}>Bold</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => wrapSelection('<em>', '</em>')}>Italic</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertBlock('<p>Paragraph text here.</p>')}>Paragraph</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => insertBlock('<ul>\n<li>First point</li>\n<li>Second point</li>\n</ul>')}>Bullet list</Button>
            <Button type="button" size="sm" variant="outline" onClick={handleAutoFormat}>Auto-format</Button>
          </div>
          <textarea
            ref={textareaRef}
            className="w-full min-h-[320px] border border-border rounded-xl p-4 font-mono text-sm leading-relaxed bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={'Paste or type your policy here.\n\nUse blank lines between paragraphs.\n\n1. First section\nDetails here.\n\n2. Second section\n• Bullet one\n• Bullet two\n\nOr click Auto-format to structure plain text.'}
          />
          <p className="text-xs text-muted-foreground">
            Tip: Paste plain text and click <strong>Auto-format</strong>, or use the toolbar for headings and lists. Preview before saving.
          </p>
        </>
      )}

      {view === 'preview' && (
        <article
          className="legal-document min-h-[320px] rounded-xl border border-border bg-card p-6 md:p-8"
          dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-muted-foreground">Nothing to preview yet.</p>' }}
        />
      )}
    </div>
  );
};

export default LegalContentEditor;
