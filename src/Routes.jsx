import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ScrollToTop from 'components/ScrollToTop';
import ErrorBoundary from 'components/ErrorBoundary';
import ProtectedRoute from 'components/ProtectedRoute';
import AdminRouteShell from './components/layout/AdminRouteShell';
import ReportsRouteShell from './components/layout/ReportsRouteShell';
import PageLoader from './components/PageLoader';
import { LoanProductsProvider } from './contexts/LoanProductsContext';
import { MarketplaceVisibilityProvider } from './contexts/MarketplaceVisibilityContext';
import { SiteContactProvider } from './contexts/SiteContactContext';
import { MarketingProvider } from './contexts/MarketingContext';
import { useMarketingTags } from './hooks/useMarketingTags';
import { initAgentAttribution } from './utils/agentAttribution';

const lazyPage = (factory) => lazy(factory);

const Homepage = lazyPage(() => import('./pages/homepage'));
const AboutUs = lazyPage(() => import('./pages/about-us'));
const AboutTeam = lazyPage(() => import('./pages/about-team'));
const ContactUs = lazyPage(() => import('./pages/contact-us'));
const BookAppointment = lazyPage(() => import('./pages/book-appointment'));
const ProductComparison = lazyPage(() => import('./pages/product-comparison'));
const ProductLanding = lazyPage(() => import('./pages/product-landing'));
const EligibilityAssessment = lazyPage(() => import('./pages/eligibility-assessment'));
const LoanEmiCalculator = lazyPage(() => import('./pages/loan-emi-calculator'));
const FinancialCalculatorsHub = lazyPage(() => import('./pages/financial-calculators'));
const CalculatorDetailPage = lazyPage(() => import('./pages/financial-calculators/CalculatorDetailPage'));
const RetirementPlanningPage = lazyPage(() => import('./pages/retirement-planning'));
const TaxSavingPage = lazyPage(() => import('./pages/tax-saving'));
const WealthManagementPage = lazyPage(() => import('./pages/wealth-management'));
const LegalPage = lazyPage(() => import('./pages/legal-page'));
const ShareYourStory = lazyPage(() => import('./pages/share-your-story'));
const OAuthCallback = lazyPage(() => import('./pages/oauth-callback'));
const ResumeApplicationPage = lazyPage(() => import('./pages/resume-application'));
const DevelopmentPanel = lazyPage(() => import('./pages/development'));
const NotFound = lazyPage(() => import('./pages/NotFound'));

const LoginPage = lazyPage(() => import('./pages/login-page'));
const AdminLogin = lazyPage(() => import('./pages/admin-login'));
const EmployeeLogin = lazyPage(() => import('./pages/employee-login'));
const AgentLogin = lazyPage(() => import('./pages/agent-login'));
const CustomerLogin = lazyPage(() => import('./pages/customer-login'));

const CustomerAssessmentPortal = lazyPage(() => import('./pages/customer-assessment-portal'));
const BankMarketplace = lazyPage(() => import('./pages/bank-marketplace'));

const AdminDashboard = lazyPage(() => import('./pages/admin-dashboard'));
const EmployeePortal = lazyPage(() => import('./pages/employee-portal'));
const AgentDashboard = lazyPage(() => import('./pages/agent-dashboard'));
const AgentAssistedApplicationPage = lazyPage(() => import('./pages/agent-assisted-application'));
const AgentLearningPage = lazyPage(() => import('./pages/agent-learning'));
const AgentSettingsPage = lazyPage(() => import('./pages/agent-settings'));
const EmployeeSettingsPage = lazyPage(() => import('./pages/employee-settings'));
const CustomerDashboard = lazyPage(() => import('./pages/customer-dashboard'));

const AdminSecurityDashboard = lazyPage(() => import('./pages/admin-security-dashboard'));
const ReportsAndAnalytics = lazyPage(() => import('./pages/reports-and-analytics'));
const BankMarketplaceManagement = lazyPage(() => import('./pages/bank-marketplace-management'));
const CreditCardsPage = lazyPage(() => import('./pages/credit-cards'));
const InsuranceMarketplacePage = lazyPage(() => import('./pages/insurance-marketplace'));
const MutualFundMarketplacePage = lazyPage(() => import('./pages/mutual-fund-marketplace'));
const FixedIncomeMarketplacePage = lazyPage(() => import('./pages/fixed-income-marketplace'));
const PostOfficeMarketplacePage = lazyPage(() => import('./pages/post-office-marketplace'));
const GovernmentSchemesMarketplacePage = lazyPage(() => import('./pages/government-schemes-marketplace'));
const InvestmentMarketplacePage = lazyPage(() => import('./pages/investment-marketplace'));
const ApprovalMatrixManagement = lazyPage(() => import('./pages/approval-matrix-management'));
const InterestMatrixManagement = lazyPage(() => import('./pages/interest-matrix-management'));

const CustomerProfile = lazyPage(() => import('./pages/customer-profile'));
const DocumentManagementCenter = lazyPage(() => import('./pages/document-management-center'));
const AdditionalQuestionnaire = lazyPage(() => import('./pages/additional-questionnaire'));
const BankSelectionAndConsent = lazyPage(() => import('./pages/bank-selection-and-consent'));

const AuthenticationManagementCenter = lazyPage(
  () => import('./pages/authentication-management-center'),
);
const CustomerRegistrationPortal = lazyPage(() => import('./pages/customer-registration-portal'));
const PasswordManagementSystem = lazyPage(() => import('./pages/password-management-system'));

function SuspenseRoute({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const MarketingTracker = () => {
  useMarketingTags();
  React.useEffect(() => {
    initAgentAttribution();
  }, []);
  return null;
};

function Routes() {
  return (
    <BrowserRouter>
      <LoanProductsProvider>
        <MarketplaceVisibilityProvider>
        <SiteContactProvider>
          <MarketingProvider>
            <ErrorBoundary>
              <MarketingTracker />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <RouterRoutes>
                <Route path="/" element={<SuspenseRoute><Homepage /></SuspenseRoute>} />
                <Route path="/homepage" element={<SuspenseRoute><Homepage /></SuspenseRoute>} />
                <Route path="/about-us" element={<SuspenseRoute><AboutUs /></SuspenseRoute>} />
                <Route path="/about-team" element={<SuspenseRoute><AboutTeam /></SuspenseRoute>} />
                <Route path="/contact-us" element={<SuspenseRoute><ContactUs /></SuspenseRoute>} />
                <Route path="/book-appointment" element={<SuspenseRoute><BookAppointment /></SuspenseRoute>} />
                <Route path="/talk-to-expert" element={<SuspenseRoute><BookAppointment /></SuspenseRoute>} />
                <Route path="/products/:loanType" element={<SuspenseRoute><ProductLanding /></SuspenseRoute>} />
                <Route path="/product-comparison" element={<SuspenseRoute><ProductComparison /></SuspenseRoute>} />
                <Route path="/eligibility-assessment" element={<SuspenseRoute><EligibilityAssessment /></SuspenseRoute>} />
                <Route path="/resources/loan-emi-calculator" element={<SuspenseRoute><LoanEmiCalculator /></SuspenseRoute>} />
                <Route path="/resources/calculators" element={<SuspenseRoute><FinancialCalculatorsHub /></SuspenseRoute>} />
                <Route path="/resources/calculators/:slug" element={<SuspenseRoute><CalculatorDetailPage /></SuspenseRoute>} />
                <Route path="/retirement-planning" element={<SuspenseRoute><RetirementPlanningPage /></SuspenseRoute>} />
                <Route path="/tax-saving" element={<SuspenseRoute><TaxSavingPage /></SuspenseRoute>} />
                <Route path="/wealth-management" element={<SuspenseRoute><WealthManagementPage /></SuspenseRoute>} />
                <Route path="/legal/:slug" element={<SuspenseRoute><LegalPage /></SuspenseRoute>} />
                <Route path="/share-your-story" element={<SuspenseRoute><ShareYourStory /></SuspenseRoute>} />
                <Route path="/oauth/callback" element={<SuspenseRoute><OAuthCallback /></SuspenseRoute>} />
                <Route path="/development" element={<SuspenseRoute><DevelopmentPanel /></SuspenseRoute>} />

                <Route path="/login-page" element={<SuspenseRoute><LoginPage /></SuspenseRoute>} />
                <Route path="/admin-login" element={<SuspenseRoute><AdminLogin /></SuspenseRoute>} />
                <Route path="/employee-login" element={<SuspenseRoute><EmployeeLogin /></SuspenseRoute>} />
                <Route path="/agent-login" element={<SuspenseRoute><AgentLogin /></SuspenseRoute>} />
                <Route path="/customer-login" element={<SuspenseRoute><CustomerLogin /></SuspenseRoute>} />

                <Route path="/resume-application/:token" element={<SuspenseRoute><ResumeApplicationPage /></SuspenseRoute>} />
                <Route path="/customer-assessment-portal" element={<SuspenseRoute><CustomerAssessmentPortal /></SuspenseRoute>} />
                <Route path="/bank-marketplace" element={<SuspenseRoute><BankMarketplace /></SuspenseRoute>} />
                <Route path="/credit-cards" element={<SuspenseRoute><CreditCardsPage /></SuspenseRoute>} />
                <Route path="/insurance-marketplace" element={<SuspenseRoute><InsuranceMarketplacePage /></SuspenseRoute>} />
                <Route path="/mutual-fund-marketplace" element={<SuspenseRoute><MutualFundMarketplacePage /></SuspenseRoute>} />
                <Route path="/fixed-income-marketplace" element={<SuspenseRoute><FixedIncomeMarketplacePage /></SuspenseRoute>} />
                <Route path="/post-office-marketplace" element={<SuspenseRoute><PostOfficeMarketplacePage /></SuspenseRoute>} />
                <Route path="/government-schemes-marketplace" element={<SuspenseRoute><GovernmentSchemesMarketplacePage /></SuspenseRoute>} />
                <Route path="/investment-marketplace" element={<SuspenseRoute><InvestmentMarketplacePage /></SuspenseRoute>} />

                <Route element={<AdminRouteShell />}>
                  <Route path="/admin-dashboard" element={<SuspenseRoute><AdminDashboard /></SuspenseRoute>} />
                  <Route path="/admin-security-dashboard" element={<SuspenseRoute><AdminSecurityDashboard /></SuspenseRoute>} />
                  <Route path="/bank-marketplace-management" element={<SuspenseRoute><BankMarketplaceManagement /></SuspenseRoute>} />
                  <Route path="/approval-matrix-management" element={<SuspenseRoute><ApprovalMatrixManagement /></SuspenseRoute>} />
                  <Route path="/interest-matrix-management" element={<SuspenseRoute><InterestMatrixManagement /></SuspenseRoute>} />
                  <Route path="/admin/documents" element={<SuspenseRoute><DocumentManagementCenter /></SuspenseRoute>} />
                </Route>

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={['admin', 'super_admin', 'employee']}
                      employeeRoute="/reports-and-analytics"
                    >
                      <ReportsRouteShell />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="/reports-and-analytics"
                    element={<SuspenseRoute><ReportsAndAnalytics /></SuspenseRoute>}
                  />
                </Route>

                <Route
                  path="/employee-portal"
                  element={
                    <ProtectedRoute allowedRoles={['employee', 'admin', 'super_admin']}>
                      <SuspenseRoute><EmployeePortal /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee/settings"
                  element={
                    <ProtectedRoute allowedRoles={['employee', 'admin', 'super_admin']}>
                      <SuspenseRoute><EmployeeSettingsPage /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/agent-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin', 'super_admin']}>
                      <SuspenseRoute><AgentDashboard /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/customer-application"
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin', 'super_admin']}>
                      <SuspenseRoute><AgentAssistedApplicationPage /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/learning"
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin', 'super_admin']}>
                      <SuspenseRoute><AgentLearningPage /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent-learning"
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin', 'super_admin']}>
                      <SuspenseRoute><AgentLearningPage /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/settings"
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin', 'super_admin']}>
                      <SuspenseRoute><AgentSettingsPage /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customer-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <SuspenseRoute><CustomerDashboard /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <SuspenseRoute><CustomerProfile /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/document-management-center"
                  element={
                    <ProtectedRoute
                      allowedRoles={['customer', 'employee', 'agent']}
                      employeeRoute="/document-management-center"
                    >
                      <SuspenseRoute><DocumentManagementCenter /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/additional-questionnaire"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <SuspenseRoute><AdditionalQuestionnaire /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bank-selection-and-consent"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <SuspenseRoute><BankSelectionAndConsent /></SuspenseRoute>
                    </ProtectedRoute>
                  }
                />

                <Route path="/authentication-management-center" element={<SuspenseRoute><AuthenticationManagementCenter /></SuspenseRoute>} />
                <Route path="/customer-registration-portal" element={<SuspenseRoute><CustomerRegistrationPortal /></SuspenseRoute>} />
                <Route path="/password-management-system" element={<SuspenseRoute><PasswordManagementSystem /></SuspenseRoute>} />

                <Route path="*" element={<SuspenseRoute><NotFound /></SuspenseRoute>} />
              </RouterRoutes>
            </Suspense>
          </ErrorBoundary>
          </MarketingProvider>
        </SiteContactProvider>
        </MarketplaceVisibilityProvider>
      </LoanProductsProvider>
    </BrowserRouter>
  );
}

export default Routes;
