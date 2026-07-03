import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import Button from './ui/Button';
import { clearGuestSession, formatResumeAge } from '../utils/guestSessionResume';

const GuestResumeBanner = ({ sessions = [], onDismiss }) => {
  const navigate = useNavigate();
  if (!sessions.length) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="History" size={18} className="text-primary" />
        <p className="font-semibold text-foreground text-sm">Continue where you left off</p>
      </div>
      <div className="space-y-2">
        {sessions.slice(0, 3).map((session) => (
          <div
            key={session.key}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background border border-border rounded-lg px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session.type === 'calculator' ? 'Calculator: ' : ''}
                {session.title}
              </p>
              <p className="text-xs text-muted-foreground">
                Saved {formatResumeAge(session.savedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={() => navigate(session.path)}>
                Resume
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearGuestSession(session.key);
                  onDismiss?.();
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestResumeBanner;
