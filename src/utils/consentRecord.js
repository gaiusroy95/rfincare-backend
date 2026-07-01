import { calculateTotalMonthlyEmi } from './calculateTotalMonthlyEmi';

function formatInr(value) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || n < 0) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Download a printable consent / signature record (HTML) for the customer.
 */
export function downloadConsentRecord({ formData, applicationId, authMethod }) {
  const name = [formData?.firstName, formData?.middleName, formData?.lastName].filter(Boolean).join(' ');
  const signedAt = new Date().toLocaleString('en-IN');
  const totalMonthlyEmi = calculateTotalMonthlyEmi(formData);
  const signatureBlock =
    authMethod === 'otp'
      ? '<p><strong>Verification:</strong> Mobile OTP verified</p>'
      : formData?.customerSignature
        ? `<img src="${formData.customerSignature}" alt="Signature" style="max-height:120px;border:1px solid #ccc;" />`
        : '<p><em>No signature image</em></p>';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Rfincare Consent Record</title></head>
<body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px;">
<h1>Rfincare — Application consent record</h1>
<p><strong>Application ID:</strong> ${applicationId || 'Pending'}</p>
<p><strong>Applicant:</strong> ${name}</p>
<p><strong>Email:</strong> ${formData?.email || ''}</p>
<p><strong>Phone:</strong> ${formData?.phone || ''}</p>
<p><strong>Signed at:</strong> ${signedAt}</p>
<hr/>
<h2>Loan summary</h2>
<ul>
<li><strong>Loan purpose:</strong> ${formData?.loanPurpose || '—'}</li>
<li><strong>Requested amount:</strong> ${formatInr(formData?.loanAmount)}</li>
<li><strong>Credit score range:</strong> ${formData?.creditScoreRange || '—'}</li>
<li><strong>Total monthly EMI (auto-calculated):</strong> ${
    formData?.hasRunningLoanOrCard === 'no' ? '₹0' : formatInr(totalMonthlyEmi)
  }</li>
<li><strong>Running loans / credit cards:</strong> ${
    formData?.hasRunningLoanOrCard === 'yes' ? 'Yes' : formData?.hasRunningLoanOrCard === 'no' ? 'No' : '—'
  }</li>
</ul>
<hr/>
<p>I confirm that all information provided is accurate and authorize Rfincare to process my application.</p>
<ul>
<li>Certify accuracy: ${formData?.certifyAccuracy ? 'Yes' : 'No'}</li>
<li>Authorize credit check: ${formData?.authorizeCredit ? 'Yes' : 'No'}</li>
<li>Agree to terms: ${formData?.agreeTerms ? 'Yes' : 'No'}</li>
<li>Consent communications: ${formData?.consentCommunications ? 'Yes' : 'No'}</li>
</ul>
<h2>Signature</h2>
${signatureBlock}
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rfincare-consent-${applicationId || 'draft'}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
