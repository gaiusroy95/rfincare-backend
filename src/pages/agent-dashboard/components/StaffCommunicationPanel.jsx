import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { staffMessagingService } from '../../../services/staffMessagingService';
import { documentManagementService } from '../../../services/documentManagementService';
import { customerJourneyService } from '../../../services/customerJourneyService';
import { resolveUploadUrl } from '../../../utils/documentUrls';
import { APPLICANT_DOCUMENTS } from '../../../constants/assessmentDocuments';
import { useAuth } from '../../../contexts/AuthContext';

const DOC_TYPE_OPTIONS = APPLICANT_DOCUMENTS.map((d) => ({
  value: d.type,
  label: d.label,
}));

const StaffCommunicationPanel = ({
  isOpen,
  onClose,
  applicationId = null,
  clientLabel = '',
  variant = 'employee',
  initialMode = 'help',
}) => {
  const isAgentPortal = variant === 'agent';
  const [panelMode, setPanelMode] = useState(initialMode);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [channel, setChannel] = useState('internal');
  const [sending, setSending] = useState(false);
  const [openingAttachmentId, setOpeningAttachmentId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const uploadFileRef = useRef(null);
  const { user } = useAuth();

  const [appNumberQuery, setAppNumberQuery] = useState('');
  const [searchingApp, setSearchingApp] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [uploadApplication, setUploadApplication] = useState(null);
  const [uploadDocuments, setUploadDocuments] = useState([]);
  const [documentType, setDocumentType] = useState('pan_card');
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [employeeUploading, setEmployeeUploading] = useState(false);
  const employeeFileInputRef = useRef(null);

  const peer = context?.peer;
  const isEmployee = context?.role === 'employee';
  const helpApplicationId = applicationId || context?.applications?.[0]?.id;

  const loadUploadDocuments = useCallback(async (appId) => {
    if (!appId) {
      setUploadDocuments([]);
      return;
    }
    const docs = await documentManagementService.getDocumentsByApplication(appId);
    setUploadDocuments(Array.isArray(docs) ? docs : []);
  }, []);

  const loadThread = useCallback(async () => {
    if (!peer?.id) return;
    const data = await staffMessagingService.getMessages({
      peerId: peer.id,
      applicationId: helpApplicationId,
    });
    setMessages(Array.isArray(data) ? data : []);
  }, [peer?.id, helpApplicationId]);

  const resolveUploadApplication = useCallback(
    (apps, targetApplicationId) => {
      if (!targetApplicationId || !Array.isArray(apps)) return null;
      const match = apps.find((a) => a.id === targetApplicationId);
      if (!match) return null;
      return {
        applicationId: match.id,
        applicationNumber: match.applicationNumber,
        customerName: match.customerName,
        customerId: match.customerId,
      };
    },
    [],
  );

  const loadContext = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ctx = await staffMessagingService.getContext(helpApplicationId);
      setContext(ctx);
      if (ctx?.peer?.id) {
        const data = await staffMessagingService.getMessages({
          peerId: ctx.peer.id,
          applicationId: helpApplicationId,
        });
        setMessages(Array.isArray(data) ? data : []);
      }

      if (isAgentPortal && applicationId && ctx?.applications?.length) {
        const resolved = resolveUploadApplication(ctx.applications, applicationId);
        if (resolved) {
          setUploadApplication(resolved);
          setAppNumberQuery(resolved.applicationNumber || '');
          await loadUploadDocuments(resolved.applicationId);
        }
      }

      if (!isAgentPortal && helpApplicationId) {
        const docs = await staffMessagingService.getApplicationDocuments(helpApplicationId);
        setEmployeeDocuments(Array.isArray(docs) ? docs : []);
      } else if (!isAgentPortal) {
        setEmployeeDocuments([]);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not load communication');
    } finally {
      setLoading(false);
    }
  }, [
    helpApplicationId,
    applicationId,
    isAgentPortal,
    loadUploadDocuments,
    resolveUploadApplication,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    setPanelMode(initialMode);
    setSearchResults([]);
    setUploadNotice('');
    setNotice('');
    setError('');
    loadContext();
  }, [isOpen, initialMode, loadContext]);

  useEffect(() => {
    if (!isOpen || !peer?.id || panelMode !== 'help') return undefined;
    const timer = setInterval(() => {
      loadThread().catch(() => {});
    }, 12000);
    return () => clearInterval(timer);
  }, [isOpen, peer?.id, panelMode, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const searchApplicationByNumber = async () => {
    const query = appNumberQuery.trim();
    if (!query) {
      setError('Enter an application number to search.');
      return;
    }
    setSearchingApp(true);
    setError('');
    setUploadNotice('');
    setSearchResults([]);
    try {
      const results = await documentManagementService.getApplicationsWithDocuments({ search: query });
      const list = Array.isArray(results) ? results : [];
      const exact = list.find(
        (row) => String(row.applicationNumber || '').toLowerCase() === query.toLowerCase(),
      );
      const picked = exact || (list.length === 1 ? list[0] : null);
      if (picked) {
        setUploadApplication(picked);
        await loadUploadDocuments(picked.applicationId);
        return;
      }
      if (list.length > 1) {
        setSearchResults(list);
        setUploadApplication(null);
        setUploadDocuments([]);
        return;
      }
      setUploadApplication(null);
      setUploadDocuments([]);
      setError('No application found for that number. Check the application ID and try again.');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Search failed');
    } finally {
      setSearchingApp(false);
    }
  };

  const handleSelectSearchResult = async (app) => {
    setUploadApplication(app);
    setAppNumberQuery(app.applicationNumber || '');
    setSearchResults([]);
    setError('');
    await loadUploadDocuments(app.applicationId);
  };

  const handleAgentDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadApplication?.applicationId) return;
    setUploading(true);
    setError('');
    setUploadNotice('');
    try {
      await documentManagementService.uploadDocument(file, {
        applicationId: uploadApplication.applicationId,
        customerId: uploadApplication.customerId,
        documentType,
      });
      setUploadNotice(`${file.name} uploaded successfully.`);
      await loadUploadDocuments(uploadApplication.applicationId);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (uploadFileRef.current) uploadFileRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!peer?.id || !body.trim()) return;
    setSending(true);
    setError('');
    try {
      const result = await staffMessagingService.sendMessage({
        peerId: peer.id,
        applicationId: helpApplicationId,
        subject:
          channel === 'email'
            ? subject || `Help request${clientLabel ? ` — ${clientLabel}` : ''}`
            : subject,
        body: body.trim(),
        channel,
        documentIds: isAgentPortal ? [] : selectedDocIds,
      });
      setBody('');
      setSubject('');
      setSelectedDocIds([]);
      setNotice('');
      if (channel === 'email') {
        const delivery = result?.emailDelivery;
        if (delivery?.sent && delivery?.channel === 'smtp') {
          setNotice(
            `Email sent to ${delivery.to || peer.communicationEmail || peer.email}${
              delivery.attachmentCount ? ` with ${delivery.attachmentCount} attachment(s)` : ''
            }. A copy is also shown in this chat.`,
          );
        } else if (delivery?.warning) {
          setNotice(delivery.warning);
        } else if (delivery?.to) {
          setNotice(
            `Message saved in chat. Email could not be delivered to ${delivery.to} — ask your admin to configure SMTP on the server.`,
          );
        }
      }
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

  const handleEmployeeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !helpApplicationId) return;
    setEmployeeUploading(true);
    setError('');
    try {
      await documentManagementService.uploadDocument(file, {
        applicationId: helpApplicationId,
        documentType: 'income_proof',
      });
      const docs = await staffMessagingService.getApplicationDocuments(helpApplicationId);
      setEmployeeDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setEmployeeUploading(false);
      if (employeeFileInputRef.current) employeeFileInputRef.current.value = '';
    }
  };

  const handleOpenAttachment = async (att) => {
    setOpeningAttachmentId(att.id);
    setError('');
    try {
      if (att.documentId) {
        const { data, error: dlErr } = await customerJourneyService.downloadDocument(att.documentId, {
          inline: true,
        });
        if (dlErr || !data?.blob) {
          throw new Error(dlErr?.message || 'Could not open document');
        }
        const blobUrl = URL.createObjectURL(data.blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
        return;
      }
      const staticUrl = resolveUploadUrl(att.fileUrl);
      if (staticUrl) {
        window.open(staticUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      throw new Error('Document link is not available');
    } catch (err) {
      setError(err?.message || 'Could not open attachment');
    } finally {
      setOpeningAttachmentId(null);
    }
  };

  const panelTitle =
    isAgentPortal && panelMode === 'upload' ? 'Upload Customer Document' : 'Staff Communication';
  const panelSubtitle =
    isAgentPortal && panelMode === 'upload'
      ? 'Search by application number, then upload customer documents'
      : clientLabel
        ? `Re: ${clientLabel}`
        : isAgentPortal
          ? 'Ask your assigned staff for help'
          : '';

  const renderHelpChat = () => {
    if (!peer) {
      return (
        <div className="p-8 text-center">
          <Icon name="Users" size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-foreground font-medium">No hierarchy contact mapped</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
            {isEmployee
              ? 'Ask your admin to map you to an agent under Admin → Hierarchy mapping before in-app chat is available.'
              : 'Ask your admin to map you to an employee under Admin → Hierarchy mapping. Help messages route through that contact.'}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="px-4 py-3 bg-muted/50 border-b border-border text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">{isEmployee ? 'Agent: ' : 'Contact: '}</span>
            <strong>{peer.name}</strong>
            {peer.hierarchyLevel != null && (
              <span className="text-xs text-muted-foreground ml-2">Level {peer.hierarchyLevel}</span>
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
              {isAgentPortal
                ? 'No help messages yet. Describe what you need assistance with below.'
                : 'No messages yet. Start the conversation below.'}
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
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
                            <button
                              type="button"
                              onClick={() => handleOpenAttachment(att)}
                              disabled={openingAttachmentId === att.id}
                              className="underline flex items-center gap-1 text-left disabled:opacity-60"
                            >
                              <Icon name="Paperclip" size={12} />
                              {openingAttachmentId === att.id
                                ? 'Opening…'
                                : att.fileName || att.documentType}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[10px] opacity-70 mt-1">
                      {msg.channel === 'email' ? 'Sent as email · ' : ''}
                      {new Date(msg.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {!isAgentPortal && helpApplicationId && (
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Share documents</p>
              <div>
                <input
                  ref={employeeFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                  onChange={handleEmployeeUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  loading={employeeUploading}
                  iconName="Upload"
                  onClick={() => employeeFileInputRef.current?.click()}
                >
                  Upload
                </Button>
              </div>
            </div>
            {employeeDocuments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents on this application yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {employeeDocuments.map((doc) => (
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
            <>
              <p className="text-xs text-muted-foreground -mt-1">
                Delivers to the hierarchy communication email ({peer.communicationEmail || peer.email}
                ). A copy also appears in this chat.
              </p>
              <Input
                label="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isAgentPortal ? 'Need help with application / commission' : 'Document review / follow-up'}
              />
            </>
          )}
          <textarea
            className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder={
              isAgentPortal
                ? 'Describe what you need help with…'
                : 'Type your message…'
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {notice && (
            <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              {notice}
            </p>
          )}
          {error && panelMode === 'help' && (
            <p className="text-xs text-destructive">{error}</p>
          )}
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
    );
  };

  const renderAgentUpload = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Find application</p>
        <p className="text-xs text-muted-foreground">
          Enter the customer&apos;s application number (for example RFC1735123456789), then upload
          their documents here.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            label="Application number"
            value={appNumberQuery}
            onChange={(e) => setAppNumberQuery(e.target.value)}
            placeholder="RFC1735123456789"
            onKeyDown={(e) => {
              if (e.key === 'Enter') searchApplicationByNumber();
            }}
          />
          <div className="sm:pt-6">
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto"
              loading={searchingApp}
              iconName="Search"
              onClick={searchApplicationByNumber}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Multiple matches — select one:</p>
          {searchResults.map((app) => (
            <button
              key={app.applicationId}
              type="button"
              onClick={() => handleSelectSearchResult(app)}
              className="w-full text-left px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
            >
              <span className="font-mono font-medium">{app.applicationNumber}</span>
              {app.customerName && (
                <span className="text-muted-foreground"> · {app.customerName}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {uploadApplication && (
        <div className="rounded-lg border-2 border-primary/20 bg-card p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Selected application</p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-mono text-foreground">{uploadApplication.applicationNumber}</span>
              {uploadApplication.customerName && (
                <>
                  {' '}
                  · <span>{uploadApplication.customerName}</span>
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Select
              label="Document type"
              options={DOC_TYPE_OPTIONS}
              value={documentType}
              onChange={setDocumentType}
            />
            <div>
              <input
                ref={uploadFileRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                onChange={handleAgentDocumentUpload}
              />
              <Button
                type="button"
                variant="default"
                className="w-full"
                loading={uploading}
                iconName="Upload"
                onClick={() => uploadFileRef.current?.click()}
              >
                {uploading ? 'Uploading…' : 'Choose file & upload'}
              </Button>
            </div>
          </div>

          {uploadNotice && (
            <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              {uploadNotice}
            </p>
          )}

          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Documents on this application</p>
            {uploadDocuments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {uploadDocuments.map((doc) => (
                  <li key={doc.id} className="text-xs text-muted-foreground flex items-center gap-2">
                    <Icon name="FileText" size={12} />
                    {doc.documentName || doc.documentType}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && panelMode === 'upload' && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );

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
              <Icon
                name={isAgentPortal && panelMode === 'upload' ? 'Upload' : 'MessageSquare'}
                size={20}
                className="text-primary"
              />
              {panelTitle}
            </h2>
            {panelSubtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{panelSubtitle}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <Icon name="X" size={20} />
          </button>
        </div>

        {isAgentPortal && (
          <div className="px-4 pt-3 pb-0 border-b border-border">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setPanelMode('upload');
                  setError('');
                }}
                className={`flex-1 text-xs py-2 rounded-lg border ${
                  panelMode === 'upload'
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <Icon name="Upload" size={14} className="inline mr-1" />
                Upload documents
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelMode('help');
                  setError('');
                }}
                className={`flex-1 text-xs py-2 rounded-lg border ${
                  panelMode === 'help'
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <Icon name="LifeBuoy" size={14} className="inline mr-1" />
                Get help
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : isAgentPortal && panelMode === 'upload' ? (
          renderAgentUpload()
        ) : (
          renderHelpChat()
        )}
      </div>
    </div>
  );
};

export default StaffCommunicationPanel;
