import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ConfirmationScreen = ({ selectedBank, applicationId, onContinue, onDownload }) => {
  const nextSteps = [
    {
      icon: 'FileText',
      title: 'Complete Additional Questionnaire',
      description: 'Answer bank-specific questions to strengthen your application',
      time: '5-10 minutes'
    },
    {
      icon: 'Upload',
      title: 'Upload Required Documents',
      description: 'Submit identity proof, income documents, and property papers',
      time: '15-20 minutes'
    },
    {
      icon: 'Search',
      title: 'Bank Verification Process',
      description: 'Bank will review your application and documents',
      time: '2-5 business days'
    },
    {
      icon: 'Phone',
      title: 'Verification Call',
      description: 'Bank representative may contact you for additional details',
      time: '1-2 business days'
    },
    {
      icon: 'CheckCircle2',
      title: 'Final Approval',
      description: 'Receive loan approval and disbursement details',
      time: '3-7 business days'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Success Animation */}
      <div className="text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center animate-scale-in">
          <Icon name="CheckCircle2" size={48} className="text-success" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Application Submitted Successfully!
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Your loan application has been submitted to {selectedBank?.name}
        </p>
      </div>
      {/* Application Details Card */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 pb-4 border-b border-border">
          <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white rounded-lg p-2 border border-border">
            <Image
              src={selectedBank?.logo}
              alt={selectedBank?.logoAlt}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
              {selectedBank?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedBank?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Hash" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Application ID</p>
              <p className="text-sm md:text-base font-semibold text-foreground">
                {applicationId}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Calendar" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Submitted On</p>
              <p className="text-sm md:text-base font-semibold text-foreground">
                {new Date()?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon name="TrendingDown" size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
              <p className="text-sm md:text-base font-semibold text-foreground">
                {selectedBank?.interestRate}% per annum
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Processing Time</p>
              <p className="text-sm md:text-base font-semibold text-foreground">
                {selectedBank?.processingTime}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Next Steps */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="ListChecks" size={24} className="text-primary" />
          What Happens Next?
        </h3>

        <div className="space-y-4">
          {nextSteps?.map((step, index) => (
            <div key={index} className="flex items-start gap-3 md:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name={step?.icon} size={20} className="text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm md:text-base font-semibold text-foreground">
                    {index + 1}. {step?.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {step?.time}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {step?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Important Information */}
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 md:p-5">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-2">
              Important Information
            </h4>
            <ul className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Keep your application ID safe for future reference</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Check your email and SMS for updates on your application status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Complete the additional questionnaire within 48 hours to avoid delays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Ensure all uploaded documents are clear and valid</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={onDownload}
          iconName="Download"
          iconPosition="left"
        >
          Download Confirmation
        </Button>
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={onContinue}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Questionnaire
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationScreen;