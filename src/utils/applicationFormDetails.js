const LABELS = {
  title: 'Title',
  firstName: 'First name',
  middleName: 'Middle name',
  lastName: 'Last name',
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  maritalStatus: 'Marital status',
  email: 'Email',
  phone: 'Phone',
  aadhaar: 'Aadhaar',
  pan: 'PAN',
  addressLine1: 'Address line 1',
  addressLine2: 'Address line 2',
  city: 'City',
  district: 'District',
  state: 'State',
  pinCode: 'PIN code',
  residenceType: 'Residence type',
  yearsAtAddress: 'Years at address',
  monthlyRent: 'Monthly rent',
  employmentType: 'Employment type',
  employerName: 'Employer name',
  jobTitle: 'Job title',
  industry: 'Industry',
  yearsEmployed: 'Years employed',
  annualIncome: 'Annual income',
  monthlyIncome: 'Monthly income',
  employerPhone: 'Employer phone',
  retirementIncome: 'Retirement income',
  loanPurpose: 'Loan purpose',
  loanAmount: 'Loan amount',
  creditScoreRange: 'Credit score range',
  monthlyDebtPayments: 'Monthly debt payments',
  totalAssets: 'Total assets',
  hasRunningLoanOrCard: 'Any running loan / credit card',
  personalLoanEmi1: 'Personal loan 1 EMI',
  personalLoanEmi2: 'Personal loan 2 EMI',
  housingLoanEmi1: 'Housing loan 1 EMI',
  housingLoanEmi2: 'Housing loan 2 EMI',
  carLoanEmi: 'Car loan EMI',
  twoWheelerLoanEmi: 'Two wheeler loan EMI',
  otherLoanEmi1: 'Other loan EMI 1',
  otherLoanEmi2: 'Other loan EMI 2',
  creditCardOutstanding1: 'Credit card 1 outstanding',
  creditCardOutstanding2: 'Credit card 2 outstanding',
  creditCardOutstanding3: 'Credit card 3 outstanding',
  creditCardOutstanding4: 'Credit card 4 outstanding',
  hasAnyOverdue: 'Any overdue in any loan',
  overdueAmount: 'Overdue amount',
  overdueLoanType: 'Overdue loan type',
  loanDefaultPast36Months: 'Loan default (90+ days, 36 months)',
  accountNpaWrittenOff: 'NPA / write-off / settlement',
  creditBureauOverdue: 'Credit bureau overdue',
  coApplicantOrGuarantor: 'Co-applicant or guarantor on other loan',
  preferredBankName: 'Preferred bank',
  relationship: 'Relationship',
};

const CO_APPLICANT_LABELS = {
  firstName: 'First name',
  lastName: 'Last name',
  relationship: 'Relationship',
  phone: 'Phone',
  email: 'Email',
  pan: 'PAN',
  aadhaar: 'Aadhaar',
  employmentType: 'Employment type',
  employerName: 'Employer name',
  jobTitle: 'Job title',
  industry: 'Industry',
  yearsEmployed: 'Years employed',
  annualIncome: 'Annual income',
  monthlyIncome: 'Monthly income',
  employerPhone: 'Employer phone',
};

function formatValue(key, value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === 'yes' || value === 'no') return value === 'yes' ? 'Yes' : 'No';
  if (key.toLowerCase().includes('income') || key === 'loanAmount' || key === 'monthlyRent' || key === 'totalAssets' || key === 'monthlyDebtPayments') {
    const num = Number(String(value).replace(/,/g, ''));
    if (Number.isFinite(num) && num > 0) return `₹${num.toLocaleString('en-IN')}`;
  }
  return String(value);
}

function pickFields(source, keys, labelMap = LABELS) {
  return keys
    .filter((key) => source[key] != null && source[key] !== '')
    .map((key) => ({
      key,
      label: labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      value: formatValue(key, source[key]),
    }));
}

function normalizeCoApplicant(data) {
  const raw = data?.coApplicant ?? data?.co_applicant;
  if (!raw || typeof raw !== 'object') return null;
  return {
    firstName: field(raw, 'firstName', 'first_name'),
    lastName: field(raw, 'lastName', 'last_name'),
    relationship: field(raw, 'relationship', 'relationship'),
    phone: field(raw, 'phone', 'phone'),
    email: field(raw, 'email', 'email'),
    pan: field(raw, 'pan', 'pan_number') || field(raw, 'panNumber', 'pan_number'),
    aadhaar: field(raw, 'aadhaar', 'aadhaar_number') || field(raw, 'aadhaarNumber', 'aadhaar_number'),
    employmentType: field(raw, 'employmentType', 'employment_type'),
    employerName: field(raw, 'employerName', 'employer_name'),
    jobTitle: field(raw, 'jobTitle', 'job_title'),
    industry: field(raw, 'industry', 'industry'),
    yearsEmployed: field(raw, 'yearsEmployed', 'years_employed'),
    annualIncome: field(raw, 'annualIncome', 'annual_income'),
    monthlyIncome: field(raw, 'monthlyIncome', 'monthly_income'),
    employerPhone: field(raw, 'employerPhone', 'employer_phone'),
  };
}

function field(data, camel, snake) {
  return data[camel] ?? data[snake];
}

/** Merge application row + nested data JSON into display sections for admin review. */
export function buildApplicationDetailSections(application) {
  const data = application?.data && typeof application.data === 'object' ? application.data : {};
  const fullName = application?.customer?.fullName || application?.customer?.full_name || '';
  const merged = {
    ...data,
    title: field(data, 'title', 'title'),
    firstName: field(data, 'firstName', 'first_name') || fullName.split(' ')[0],
    middleName: field(data, 'middleName', 'middle_name'),
    lastName: field(data, 'lastName', 'last_name') || fullName.split(' ').slice(1).join(' '),
    dateOfBirth: field(data, 'dateOfBirth', 'date_of_birth'),
    gender: field(data, 'gender', 'gender'),
    maritalStatus: field(data, 'maritalStatus', 'marital_status'),
    email: field(data, 'email', 'email') || application?.customer?.email || application?.customerEmail,
    phone: field(data, 'phone', 'phone'),
    aadhaar: field(data, 'aadhaar', 'aadhaar_number') || field(data, 'aadhaarNumber', 'aadhaar_number'),
    pan: field(data, 'pan', 'pan_number') || field(data, 'panNumber', 'pan_number'),
    addressLine1: field(data, 'addressLine1', 'address_line1'),
    addressLine2: field(data, 'addressLine2', 'address_line2'),
    city: field(data, 'city', 'city'),
    district: field(data, 'district', 'district'),
    state: field(data, 'state', 'state'),
    pinCode: field(data, 'pinCode', 'pin_code'),
    residenceType: field(data, 'residenceType', 'residence_type'),
    yearsAtAddress: field(data, 'yearsAtAddress', 'years_at_address'),
    monthlyRent: field(data, 'monthlyRent', 'monthly_rent'),
    employmentType: field(data, 'employmentType', 'employment_type'),
    employerName: field(data, 'employerName', 'employer_name'),
    jobTitle: field(data, 'jobTitle', 'job_title'),
    industry: field(data, 'industry', 'industry'),
    yearsEmployed: field(data, 'yearsEmployed', 'years_employed'),
    annualIncome: field(data, 'annualIncome', 'annual_income'),
    monthlyIncome: field(data, 'monthlyIncome', 'monthly_income'),
    employerPhone: field(data, 'employerPhone', 'employer_phone'),
    retirementIncome: field(data, 'retirementIncome', 'retirement_income'),
    loanAmount:
      field(data, 'loanAmount', 'loan_amount') ??
      field(data, 'requestedLoanAmount', 'requested_loan_amount') ??
      application?.loanAmount,
    loanPurpose:
      field(data, 'loanPurpose', 'loan_purpose') ?? application?.loanType ?? application?.loan_type,
    creditScoreRange: field(data, 'creditScoreRange', 'credit_score_range'),
    monthlyDebtPayments: field(data, 'monthlyDebtPayments', 'monthly_debt_payments'),
    totalAssets: field(data, 'totalAssets', 'total_assets'),
    preferredBankName: field(data, 'preferredBankName', 'preferred_bank_name'),
  };

  const coApplicant = normalizeCoApplicant(data);
  const sections = [
    {
      title: 'Personal information',
      icon: 'User',
      fields: pickFields(merged, [
        'title', 'firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
        'email', 'phone', 'aadhaar', 'pan',
      ]),
    },
    {
      title: 'Address',
      icon: 'MapPin',
      fields: pickFields(merged, [
        'addressLine1', 'addressLine2', 'city', 'district', 'state', 'pinCode',
        'residenceType', 'yearsAtAddress', 'monthlyRent',
      ]),
    },
    {
      title: 'Employment',
      icon: 'Briefcase',
      fields: pickFields(merged, [
        'employmentType', 'employerName', 'jobTitle', 'industry', 'yearsEmployed',
        'annualIncome', 'monthlyIncome', 'employerPhone', 'retirementIncome',
      ]),
    },
    {
      title: 'Loan & financial',
      icon: 'IndianRupee',
      fields: pickFields(merged, [
        'loanPurpose', 'loanAmount', 'creditScoreRange', 'monthlyDebtPayments', 'totalAssets',
        'hasRunningLoanOrCard',
        'personalLoanEmi1', 'personalLoanEmi2',
        'housingLoanEmi1', 'housingLoanEmi2',
        'carLoanEmi', 'twoWheelerLoanEmi',
        'otherLoanEmi1', 'otherLoanEmi2',
        'creditCardOutstanding1', 'creditCardOutstanding2', 'creditCardOutstanding3', 'creditCardOutstanding4',
        'hasAnyOverdue', 'overdueAmount', 'overdueLoanType',
        'loanDefaultPast36Months', 'accountNpaWrittenOff', 'creditBureauOverdue', 'coApplicantOrGuarantor',
        'preferredBankName',
      ]),
    },
  ];

  if (coApplicant) {
    sections.push({
      title: 'Co-applicant',
      icon: 'Users',
      fields: pickFields(
        coApplicant,
        [
          'firstName', 'lastName', 'relationship', 'phone', 'email', 'pan', 'aadhaar',
          'employmentType', 'employerName', 'jobTitle', 'industry', 'yearsEmployed',
          'annualIncome', 'monthlyIncome', 'employerPhone',
        ],
        CO_APPLICANT_LABELS,
      ),
    });
  }

  return sections.filter((section) => section.fields.length > 0);
}

export function pickCustomerPhotoDocument(documents = []) {
  const priority = ['customer_photo', 'aadhaar_card', 'pan_card'];
  for (const type of priority) {
    const doc = documents.find(
      (d) => d.documentType === type && (d.mimeType || '').startsWith('image/'),
    );
    if (doc) return doc;
  }
  return documents.find((d) => (d.mimeType || '').startsWith('image/')) || null;
}
