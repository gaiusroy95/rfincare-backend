import React, { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ConsentSection = ({ consents, onConsentChange, errors }) => {
  const consentItems = [
    {
      id: 'dataSharing',
      label: 'Data Sharing Authorization',
      description: `I authorize Rfincare to share my personal information, financial details, and application data with the selected bank(s) for the purpose of loan application processing and evaluation.\n\nThis includes but is not limited to: Personal identification details, Employment information, Income and financial statements, Credit history and scores, Property details (if applicable).`,
      required: true,
      icon: 'Shield'
    },
    {
      id: 'creditCheck',
      label: 'Credit Bureau Authorization',
      description: `I authorize the selected bank(s) to conduct credit checks and inquiries with credit bureaus (CIBIL, Experian, Equifax, CRIF) to assess my creditworthiness.\n\nI understand that:\n• Multiple credit inquiries may temporarily affect my credit score\n• Credit reports will be accessed for loan evaluation purposes\n• This authorization remains valid for 90 days from the date of consent`,
      required: true,
      icon: 'FileCheck'
    },
    {
      id: 'termsConditions',
      label: 'Terms and Conditions',
      description: `I have read, understood, and agree to Rfincare's Terms of Service and the selected bank's loan terms and conditions.\n\nI acknowledge that:\n• All information provided is accurate and complete\n• False information may result in application rejection\n• Loan approval is subject to bank's internal policies\n• Interest rates and terms are subject to final bank approval`,required: true,icon: 'FileText'
    },
    {
      id: 'privacyPolicy',label: 'Privacy Policy Acknowledgment',description: `I acknowledge that I have read and understood Rfincare's Privacy Policy regarding the collection, storage, and usage of my personal data.\n\nI understand:\n• How my data will be stored and protected\n• My rights regarding data access and deletion\n• Third-party data sharing practices\n• Data retention policies and timelines`,
      required: true,
      icon: 'Lock'
    },
    {
      id: 'communicationConsent',
      label: 'Communication Preferences',
      description: `I consent to receive communications from Rfincare and the selected bank(s) regarding my loan application via:\n• Email notifications\n• SMS updates\n• Phone calls from authorized representatives\n• WhatsApp messages (if applicable)\n\nI can update these preferences anytime in my account settings.`,
      required: false,
      icon: 'MessageSquare'
    },
    {
      id: 'marketingConsent',
      label: 'Marketing Communications (Optional)',
      description: `I agree to receive promotional offers, product updates, and marketing communications from Rfincare and partner banks about:\n• New loan products and special offers\n• Financial planning tips and resources\n• Exclusive deals for existing customers\n• Educational content about financial services\n\nYou can unsubscribe from marketing communications at any time.`,
      required: false,
      icon: 'Mail'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm md:text-base text-foreground font-medium mb-1">
            Important Information
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Please review each consent carefully. Items marked with an asterisk (*) are required to proceed with your loan application. You can expand each section to read the full details.
          </p>
        </div>
      </div>
      {consentItems?.map((item) => (
        <ConsentItem
          key={item?.id}
          item={item}
          checked={consents?.[item?.id] || false}
          onChange={(checked) => onConsentChange(item?.id, checked)}
          error={errors?.[item?.id]}
        />
      ))}
    </div>
  );
};

const ConsentItem = ({ item, checked, onChange, error }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name={item?.icon} size={18} className="text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <label className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                  {item?.label}
                  {item?.required && (
                    <span className="text-destructive text-xs">*</span>
                  )}
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
              >
                <Icon
                  name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                  size={18}
                  className="text-muted-foreground"
                />
              </button>
            </div>

            {isExpanded && (
              <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">
                  {item?.description}
                </p>
              </div>
            )}

            <Checkbox
              checked={checked}
              onChange={(e) => onChange(e?.target?.checked)}
              label={
                item?.required
                  ? 'I agree to the above terms and conditions' :'Yes, I would like to receive these communications'
              }
              error={error}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentSection;