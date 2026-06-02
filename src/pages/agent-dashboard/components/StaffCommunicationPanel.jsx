import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { staffMessagingService } from '../../../services/staffMessagingService';
import { apiClient } from '../../../lib/apiClient';
import { getApiBaseUrl } from '../../../lib/runtimeConfig';
import { useAuth } from '../../../contexts/AuthContext';

const StaffCommunicationPanel = ({
  isOpen,
  onClose,
  applicationId = null,
  clientLabel = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [channel, setChannel] = useState('internal');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const peer = context?.peer;
  const activeApplicationId = applicationId || context?.applications?.[0]?.id;

  const loadThread = useCallback(async () => {
    if (!peer?.id) return;
    const data = await staffMessagingService.getMessages({
      peerId: peer.id,
      applicationId: activeApplicationId,
    });
    setMessages(Array.isArray(data) ? data : []);
  }, [peer?.id, activeApplicationId]);

  const loadContext = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ctx = await staffMessagingService.getContext(activeApplicationId);
      setContext(ctx);
      if (ctx?.peer?.id) {
        const data = await staffMessagingService.getMessages({
          peerId: ctx.peer.id,
          applicationId: activeApplicationId,
        });
        setMessages(Array.isArray(data) ? data : []);
      }
      if (activeApplicationId) {
        const docs = await staffMessagingService.getApplicationDocuments(activeApplicationId);
        setDocuments(Array.isArray(docs) ? docs : []);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not load communication');
    } finally {
      setLoading(false);
    }
  }, [activeApplicationId]);

  useEffect(() => {
    if (!isOpen) return;
    loadContext();
  }, [isOpen, loadContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!peer?.id || !body.trim()) return;
    setSending(true);
    setError('');
    try {
      await staffMessagingService.sendMessage({
        peerId: peer.id,
        applicationId: activeApplicationId,
        subject: channel === 'email' ? subject || `Message regarding ${clientLabel || 'application'}` : subject,
        body: body.trim(),
        channel,
        documentIds: selectedDocIds,
      });
      setBody('');
      setSelectedDocIds([]);
      await loadThread();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const toggleDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeApplicationId) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('applicationId', activeApplicationId);
      form.append('documentType', 'income_proof');
      await apiClient.post('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const docs = await staffMessagingService.getApplicationDocuments(activeApplicationId);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const docDownloadUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const base = getApiBaseUrl().replace(/\/$/, '');
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icon name="MessageSquare" size={20} className="text-primary" />
              Staff Communication
            </h2>
            {clientLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">Re: {clientLabel}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <Icon name="X" size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : !peer ? (
          <div className="p-8 text-center">
            <Icon name="Users" size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-foreground font-medium">No hierarchy contact mapped</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              Ask your admin to map you to an employee under Admin → Hierarchy mapping. Messages and
              emails route through that contact&apos;s communication address.
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 bg-muted/50 border-b border-border text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Contact: </span>
                <strong>{peer.name}</strong>
                {peer.hierarchyLevel != null && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Level {peer.hierarchyLevel}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                <Icon name="Mail" size={12} className="inline mr-1" />
                Communication email: <strong>{peer.communicationEmail || peer.email}</strong>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[40vh]">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          isMine
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {msg.subject && (
                          <p className="text-xs font-semibold opacity-90 mb-1">{msg.subject}</p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        {msg.attachments?.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs">
                            {msg.attachments.map((att) => (
                              <li key={att.id}>
                                <a
                                  href={docDownloadUrl(att.fileUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline flex items-center gap-1"
                                >
                                  <Icon name="Paperclip" size={12} />
                                  {att.fileName || att.documentType}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-[10px] opacity-70 mt-1">
                          {msg.channel === 'email' ? 'Email · ' : ''}
                          {new Date(msg.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {activeApplicationId && (
              <div className="px-4 py-2 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Share documents</p>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                      onChange={handleUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      loading={uploading}
                      iconName="Upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                  </div>
                </div>
                {documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No documents on this application yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => toggleDoc(doc.id)}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          selectedDocIds.includes(doc.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card'
                        }`}
                      >
                        {doc.documentName || doc.documentType}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-4 border-t border-border space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('internal')}
                  className={`flex-1 text-xs py-2 rounded-lg border ${
                    channel === 'internal'
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border'
                  }`}
                >
                  In-app chat
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`flex-1 text-xs py-2 rounded-lg border ${
                    channel === 'email'
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border'
                  }`}
                >
                  Send as email
                </button>
              </div>
              {channel === 'email' && (
                <Input
                  label="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Document review / follow-up"
                />
              )}
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Type your message…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                type="button"
                variant="default"
                className="w-full"
                loading={sending}
                iconName="Send"
                onClick={handleSend}
                disabled={!body.trim()}
              >
                {channel === 'email' ? 'Send email' : 'Send message'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffCommunicationPanel;
