import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supportChatService } from '../../../services/supportChatService';

const StaffSupportChatInbox = () => {
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadThreads = useCallback(async () => {
    try {
      const data = await supportChatService.listThreads();
      setThreads(Array.isArray(data?.threads) ? data.threads : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (customerId) => {
    if (!customerId) return;
    try {
      const data = await supportChatService.getThread(customerId);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not load thread');
    }
  }, []);

  useEffect(() => {
    loadThreads();
    const timer = setInterval(loadThreads, 20_000);
    return () => clearInterval(timer);
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) return undefined;
    loadThread(selectedId);
    const timer = setInterval(() => loadThread(selectedId), 10_000);
    return () => clearInterval(timer);
  }, [selectedId, loadThread]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const data = await supportChatService.reply(selectedId, draft.trim());
      setDraft('');
      if (data?.message) setMessages((prev) => [...prev, data.message]);
      loadThreads();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send reply');
    } finally {
      setSending(false);
    }
  };

  const selected = threads.find((t) => t.customerId === selectedId);

  return (
    <div className="rf-filter-card space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Icon name="MessageSquare" size={20} className="text-[var(--color-brand-green)]" />
        Customer live chats
      </h3>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading chats…</p> : null}
      {!loading && !threads.length ? (
        <p className="text-sm text-muted-foreground">No customer chats yet.</p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[280px]">
        <div className="md:col-span-2 border border-border rounded-xl overflow-hidden divide-y divide-border max-h-80 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.customerId}
              type="button"
              onClick={() => setSelectedId(thread.customerId)}
              className={`w-full text-left px-3 py-3 hover:bg-muted/60 transition-colors ${
                selectedId === thread.customerId ? 'bg-emerald-50' : 'bg-card'
              }`}
            >
              <p className="text-sm font-semibold text-foreground truncate">{thread.fullName}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastBody}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-3 border border-border rounded-xl flex flex-col min-h-[280px]">
          {selected ? (
            <>
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-semibold">{selected.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[selected.email, selected.phone].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-52">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm rounded-lg px-3 py-2 ${
                      msg.senderRole === 'customer'
                        ? 'bg-muted text-foreground'
                        : 'bg-emerald-50 text-emerald-900'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
                      {msg.senderRole === 'customer' ? 'Customer' : 'Support'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleReply} className="p-3 border-t border-border flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply to customer…"
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <Button type="submit" size="sm" className="rf-btn-primary" disabled={sending || !draft.trim()}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-6">
              Select a chat to reply
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSupportChatInbox;
