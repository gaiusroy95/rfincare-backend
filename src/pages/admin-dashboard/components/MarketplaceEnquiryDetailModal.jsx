import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const prettify = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
    <dt className="text-sm font-medium text-muted-foreground sm:w-40 shrink-0">{label}</dt>
    <dd className="text-sm text-foreground flex-1">{value || '—'}</dd>
  </div>
);

const MarketplaceEnquiryDetailModal = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  const raw = application.rawApplication || {};
  const eligibility = raw.eligibilityData || raw.data?.eligibilityData || raw.data?.eligibility_data || {};
  const leadStatus = raw.leadStatus || raw.lead_status || eligibility.leadStatus;

  const profileFields = [
    ['Gender', prettify(eligibility.gender)],
    ['Date of birth', eligibility.dateOfBirth],
    ['Occupation', prettify(eligibility.occupation)],
    ['Annual income', eligibility.annualIncome],
    ['Education', prettify(eligibility.education)],
    ['Tobacco use', prettify(eligibility.tobaccoUse)],
    ['Alcohol use', prettify(eligibility.alcoholUse)],
  ].filter(([, value]) => value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Marketplace enquiry</h2>
            <p className="text-sm text-muted-foreground">{application.applicationNumber}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Customer</h3>
            <dl>
              <DetailRow label="Name" value={application.customerName} />
              <DetailRow label="Email" value={application.customerEmail} />
              <DetailRow label="Phone" value={raw.customer?.phone || eligibility.phone} />
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Product</h3>
            <dl>
              <DetailRow label="Product type" value={application.loanType} />
              <DetailRow label="Product" value={eligibility.productLabel || eligibility.productCategory} />
              <DetailRow label="Category" value={prettify(eligibility.productCategory)} />
              <DetailRow label="Segment" value={prettify(eligibility.productSegment)} />
              <DetailRow
                label="Amount / cover"
                value={
                  application.amount > 0
                    ? `₹${application.amount.toLocaleString('en-IN')}`
                    : '—'
                }
              />
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Enquiry status</h3>
            <dl>
              <DetailRow label="Lead status" value={prettify(leadStatus || raw.status)} />
              <DetailRow label="Source" value={prettify(raw.source)} />
              <DetailRow label="Eligibility score" value={raw.eligibilityScore ?? raw.eligibility_score} />
              <DetailRow label="Submitted" value={application.date} />
            </dl>
          </section>

          {profileFields.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">Profile details</h3>
              <dl>
                {profileFields.map(([label, value]) => (
                  <DetailRow key={label} label={label} value={value} />
                ))}
              </dl>
            </section>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceEnquiryDetailModal;
