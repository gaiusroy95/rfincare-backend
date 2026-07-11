import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supportChatService } from '../../../services/supportChatService';

function formatTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const CustomerLiveChatDrawer = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await supportChatService.getMessages();
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not load chat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    loadMessages();
    const timer = setInterval(loadMessages, 12_000);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => {
      clearInterval(timer);
      clearTimeout(focusTimer);
    };
  }, [open, loadMessages]);

  useEffect(() => {
    if (open) scrollToEnd();
  }, [messages, open, scrollToEnd]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      const data = await supportChatService.sendMessage(text);
      setDraft('');
      setMessages((prev) => {
        const next = [...prev];
        if (data?.message) next.push(data.message);
        if (data?.ack) next.push(data.ack);
        return next;
      });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close live chat"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md h-[min(92vh,640px)] sm:h-[min(85vh,620px)] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Icon name="MessageSquare" size={20} color="white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">Live Chat</p>
              <p className="text-xs text-emerald-50/90">Rfincare support · typically replies in minutes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <Icon name="X" size={18} color="white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/30">
          {loading && !messages.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Connecting…</p>
          ) : null}
          {messages.map((msg) => {
            const mine = msg.senderRole === 'customer';
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    mine
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-card border border-border text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                    {mine ? 'You' : 'Support'} · {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {error ? (
          <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-t border-red-100">{error}</div>
        ) : null}

        <form onSubmit={handleSend} className="border-t border-border p-3 bg-card flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message…"
            maxLength={4000}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <Button
            type="submit"
            size="sm"
            className="rf-btn-primary shrink-0"
            disabled={sending || !draft.trim()}
            iconName="Send"
          >
            {sending ? '…' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CustomerLiveChatDrawer;
