import React from 'react';
import Icon from '../../../components/AppIcon';
import { getApiBaseUrl } from '../../../lib/runtimeConfig';
import EligibilityResultSummary from './EligibilityResultSummary';

const formatSubmittedAt = (value) => {
  if (!value) return new Date().toLocaleString('en-IN');
  try {
    return new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  } catch {
    return String(value);
  }
};

const ApplicationConfirmation = ({
  confirmation,
  eligibilityResult,
  assistedByAgent,
  generatedCredentials,
  onContinue,
}) => {
  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  const pdfUrl = confirmation?.pdfUrl ? `${apiBase}${confirmation.pdfUrl}` : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-lg shadow-lg max-w-lg w-full p-6 md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-success/10 mb-4 md:mb-6">
            <Icon name="CheckCircle2" size={40} className="text-success md:w-12 md:h-12" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Application Submitted Successfully
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            {assistedByAgent
              ? 'The customer application has been submitted and saved under your agent code.'
              : 'Your application has been received. Please save your Application ID for future reference.'}
          </p>

          <EligibilityResultSummary result={eligibilityResult} />

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 md:p-5 mb-6 text-left space-y-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs md:text-sm text-muted-foreground">Application ID</span>
              <span className="text-sm md:text-base font-mono font-bold text-primary text-right break-all">
                {confirmation?.applicationNumber || '—'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs md:text-sm text-muted-foreground">Applicant Name</span>
              <span className="text-sm md:text-base font-medium text-foreground text-right">
                {confirmation?.applicantName || '—'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs md:text-sm text-muted-foreground">Submitted On</span>
              <span className="text-sm md:text-base font-medium text-foreground text-right">
                {formatSubmittedAt(confirmation?.submittedAt)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs md:text-sm text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                <Icon name="BadgeCheck" size={16} />
                {confirmation?.statusLabel || 'Submitted Successfully'}
              </span>
            </div>
          </div>

          {(confirmation?.notifications?.email || confirmation?.notifications?.sms) && (
            <p className="text-xs md:text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
              <Icon name="Bell" size={14} />
              Confirmation sent via
              {confirmation.notifications.email ? ' email' : ''}
              {confirmation.notifications.email && confirmation.notifications.sms ? ' and' : ''}
              {confirmation.notifications.sms ? ' SMS' : ''}
            </p>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-6 py-3 mb-4 bg-muted text-foreground border border-border rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              <Icon name="FileDown" size={16} className="mr-2" />
              Download Application PDF
            </a>
          )}

          {generatedCredentials && (
            <div className="bg-muted rounded-lg p-4 mb-6 text-left border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Key" size={16} className="text-primary" />
                Your Login Credentials
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Email / Username</span>
                  <span className="text-xs font-mono font-semibold text-foreground bg-background px-2 py-1 rounded border">
                    {generatedCredentials?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Password</span>
                  <span className="text-xs font-mono font-semibold text-foreground bg-background px-2 py-1 rounded border">
                    {generatedCredentials?.password}
                  </span>
                </div>
              </div>
              <p className="text-xs text-warning mt-3 flex items-start gap-1">
                <Icon name="AlertTriangle" size={12} className="mt-0.5 flex-shrink-0" />
                Please save these credentials. You will need them to log in to your account.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="LayoutDashboard" size={16} className="mr-2" />
            {assistedByAgent ? 'Back to Agent Dashboard' : 'Go to My Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfirmation;
