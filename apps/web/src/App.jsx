
import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { usePageTracking } from '@/hooks/usePageTracking.js';
import { Toaster } from '@/components/ui/sonner.jsx';

import ScrollToTop from '@/components/ScrollToTop.jsx';
import CpVisitorTracker from '@/components/CpVisitorTracker.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext.jsx';
import { CpAuthProvider } from '@/contexts/CpAuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminProtectedRoute from '@/components/AdminProtectedRoute.jsx';
import CpProtectedRoute from '@/components/CpProtectedRoute.jsx';
import { AdminRecoveryService } from '@/lib/AdminRecoveryService.js';

// ── Public pages ──────────────────────────────────────────────────────────────
const HomePage              = lazy(() => import('@/pages/HomePage.jsx'));
const AboutPage             = lazy(() => import('@/pages/AboutPage.jsx'));
const HowItWorksPage        = lazy(() => import('@/pages/HowItWorksPage.jsx'));
const FastTrackPage         = lazy(() => import('@/pages/FastTrackPage.jsx'));
const BlogPage              = lazy(() => import('@/pages/BlogPage.jsx'));
const FAQPage               = lazy(() => import('@/pages/FAQPage.jsx'));
const PropertiesPage        = lazy(() => import('@/pages/PropertiesPage.jsx'));
const PropertyDetailsPage   = lazy(() => import('@/pages/PropertyDetailsPage.jsx'));
const ProjectsPage          = lazy(() => import('@/pages/ProjectsPage.jsx'));
const ProjectDetailPage     = lazy(() => import('@/pages/ProjectDetailPage.jsx'));
const ContactPage           = lazy(() => import('@/pages/ContactPage.jsx'));
const InvestorPage          = lazy(() => import('@/pages/InvestorPage.jsx'));
const BuyersPage            = lazy(() => import('@/pages/BuyersPage.jsx'));
const AddRequirementPage    = lazy(() => import('@/pages/AddRequirementPage.jsx'));
const PostRequirementPage   = lazy(() => import('@/pages/PostRequirementPage.jsx'));
const SearchResultsPage     = lazy(() => import('@/pages/SearchResultsPage.jsx'));
const SitemapPage           = lazy(() => import('@/pages/SitemapPage.jsx'));
const DownloadSectorMapsPage = lazy(() => import('@/pages/DownloadSectorMapsPage.jsx'));
const MasterPlansPage        = lazy(() => import('@/pages/MasterPlansPage.jsx'));

// Area guides
const GreaterNoidaAreaGuide = lazy(() => import('@/components/GreaterNoidaAreaGuide.jsx'));
const NoidaAreaGuide        = lazy(() => import('@/components/NoidaAreaGuide.jsx'));
const YEIDAAreaGuide        = lazy(() => import('@/components/YEIDAAreaGuide.jsx'));

// Legal / static pages
const TermsAndConditionsPage = lazy(() => import('@/pages/TermsAndConditionsPage.jsx'));
const DisclaimerPage         = lazy(() => import('@/pages/DisclaimerPage.jsx'));
const PrivacyPolicyPage      = lazy(() => import('@/pages/PrivacyPolicyPage.jsx'));
const RERADisclaimerPage     = lazy(() => import('@/pages/RERADisclaimerPage.jsx'));

// Auth pages
const LoginPage                  = lazy(() => import('@/pages/LoginPage.jsx'));
const SignupPage                  = lazy(() => import('@/pages/SignupPage.jsx'));
const PasswordResetPage           = lazy(() => import('@/pages/PasswordResetPage.jsx'));
const EmailVerificationPage       = lazy(() => import('@/pages/EmailVerificationPage.jsx'));
const GoogleSuccessPage           = lazy(() => import('@/pages/GoogleSuccessPage.jsx'));
const GoogleCompleteProfilePage   = lazy(() => import('@/pages/GoogleCompleteProfilePage.jsx'));

// User / seller pages
const SetupProfilePage  = lazy(() => import('@/pages/SetupProfilePage.jsx'));
const UserProfilePage   = lazy(() => import('@/pages/UserProfilePage.jsx'));
const MyListingsPage    = lazy(() => import('@/pages/MyListingsPage.jsx'));
const BuyerDashboard    = lazy(() => import('@/pages/BuyerDashboard.jsx'));
const SellerDashboard   = lazy(() => import('@/pages/SellerDashboard.jsx'));
const ListPropertyPage  = lazy(() => import('@/pages/ListPropertyPage.jsx'));
const ListPropertyFormPage = lazy(() => import('@/pages/ListPropertyFormPage.jsx'));
const ListProjectFormPage  = lazy(() => import('@/pages/ListProjectFormPage.jsx'));
const ProjectListingForm = lazy(() => import('@/components/ProjectListingForm.jsx'));

// Channel Partner — public
const BecomeChannelPartnerPage = lazy(() => import('@/pages/BecomeChannelPartnerPage.jsx'));
const CpStorePage              = lazy(() => import('@/pages/CpStorePage.jsx'));
const CpLoginPage              = lazy(() => import('@/pages/CpLoginPage.jsx'));
const CpSetupPage              = lazy(() => import('@/pages/CpSetupPage.jsx'));
const RefRedirectPage          = lazy(() => import('@/pages/RefRedirectPage.jsx'));

// Channel Partner — dashboard (lazy-loaded as a group)
const CpDashboardLayout    = lazy(() => import('@/pages/cp/CpDashboardLayout.jsx'));
const CpMyListingsPage     = lazy(() => import('@/pages/cp/CpMyListingsPage.jsx'));
const CpAddPropertyPage    = lazy(() => import('@/pages/cp/CpAddPropertyPage.jsx'));
const CpWishlistPage       = lazy(() => import('@/pages/cp/CpWishlistPage.jsx'));
const CpRequirementsPage   = lazy(() => import('@/pages/cp/CpRequirementsPage.jsx'));
const CpLeadsPage          = lazy(() => import('@/pages/cp/CpLeadsPage.jsx'));
const CpVisitRequestsPage  = lazy(() => import('@/pages/cp/CpVisitRequestsPage.jsx'));
const CpVisitorsPage       = lazy(() => import('@/pages/cp/CpVisitorsPage.jsx'));
const CpActivitiesPage     = lazy(() => import('@/pages/cp/CpActivitiesPage.jsx'));
const CpProfilePage        = lazy(() => import('@/pages/cp/CpProfilePage.jsx'));

// Admin pages (all lazy — never loaded by public users)
const AdminLoginPage               = lazy(() => import('@/pages/AdminLoginPage.jsx'));
const AdminDashboard               = lazy(() => import('@/pages/AdminDashboard.jsx'));
const AdminPropertyDetailsPage     = lazy(() => import('@/pages/AdminPropertyDetailsPage.jsx'));
const AdminDeviceAuthorizationPage = lazy(() => import('@/pages/AdminDeviceAuthorizationPage.jsx'));
const AdminDeviceManagementPage    = lazy(() => import('@/pages/AdminDeviceManagementPage.jsx'));
const AdminForgotPasswordPage      = lazy(() => import('@/pages/AdminForgotPasswordPage.jsx'));
const AdminResetPasswordPage       = lazy(() => import('@/pages/AdminResetPasswordPage.jsx'));
const AdminSettingsPage            = lazy(() => import('@/pages/AdminSettingsPage.jsx'));
const AdminApprovalsPage           = lazy(() => import('@/pages/AdminApprovalsPage.jsx'));
const AdminPropertiesPage          = lazy(() => import('@/pages/AdminPropertiesPage.jsx'));
const AdminListPropertyPage        = lazy(() => import('@/pages/AdminListPropertyPage.jsx'));
const AdminListPropertyFormPage    = lazy(() => import('@/pages/AdminListPropertyFormPage.jsx'));
const AdminListProjectFormPage     = lazy(() => import('@/pages/AdminListProjectFormPage.jsx'));
const AdminEditPropertyPage        = lazy(() => import('@/pages/AdminEditPropertyPage.jsx'));
const AdminUsersPage               = lazy(() => import('@/pages/AdminUsersPage.jsx'));
const AdminComingSoonPage          = lazy(() => import('@/pages/AdminComingSoonPage.jsx'));
const AdminCampaignsPage           = lazy(() => import('@/pages/AdminCampaignsPage.jsx'));
const AdminVisitsPage              = lazy(() => import('@/pages/AdminVisitsPage.jsx'));
const AdminRequirementsPage        = lazy(() => import('@/pages/AdminRequirementsPage.jsx'));
const AdminLeadsOverviewPage       = lazy(() => import('@/pages/AdminLeadsOverviewPage.jsx'));
const AdminInventoryOverviewPage   = lazy(() => import('@/pages/AdminInventoryOverviewPage.jsx'));
const AdminAnalyticsPage           = lazy(() => import('@/pages/AdminAnalyticsPage.jsx'));
const AdminTrafficPage             = lazy(() => import('@/pages/AdminTrafficPage.jsx'));
const AdminWebAnalyticsPage        = lazy(() => import('@/pages/AdminWebAnalyticsPage.jsx'));
const AdminChannelPartnersPage     = lazy(() => import('@/pages/AdminChannelPartnersPage.jsx'));
const BuyersAdminPage              = lazy(() => import('@/pages/BuyersPage.jsx'));

// ── Minimal page-load spinner (no extra imports needed) ───────────────────────
const PageFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
  }}>
    <div style={{
      width: 36,
      height: 36,
      border: '3px solid #e5e7eb',
      borderTopColor: '#1e3a5f',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function PageTracker() {
  usePageTracking();
  return null;
}

function App() {
  useEffect(() => {
    AdminRecoveryService.init();
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CpAuthProvider>
          <Router>
            <ScrollToTop />
            <PageTracker />
            <CpVisitorTracker />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* ── Public ── */}
                <Route path="/"                          element={<HomePage />} />
                <Route path="/about"                     element={<AboutPage />} />
                <Route path="/how-it-works"              element={<HowItWorksPage />} />
                <Route path="/fast-track"                element={<FastTrackPage />} />
                <Route path="/blog"                      element={<BlogPage />} />
                <Route path="/faq"                       element={<FAQPage />} />
                <Route path="/properties"                element={<PropertiesPage />} />
                <Route path="/property/:id"              element={<PropertyDetailsPage />} />
                <Route path="/projects"                  element={<ProjectsPage />} />
                <Route path="/projects/:projectName"     element={<ProjectDetailPage />} />
                <Route path="/contact"                   element={<ContactPage />} />
                <Route path="/invest"                    element={<InvestorPage />} />
                <Route path="/area-guide/greater-noida"  element={<GreaterNoidaAreaGuide />} />
                <Route path="/area-guide/noida"          element={<NoidaAreaGuide />} />
                <Route path="/area-guide/yeida"          element={<YEIDAAreaGuide />} />
                <Route path="/buyers"                    element={<BuyersPage />} />
                <Route path="/add-requirement"           element={<AddRequirementPage />} />
                <Route path="/post-requirement"          element={<PostRequirementPage />} />
                <Route path="/search"                    element={<SearchResultsPage />} />
                <Route path="/sitemap"                   element={<SitemapPage />} />
                <Route path="/download-sector-maps"      element={<DownloadSectorMapsPage />} />
                <Route path="/master-plans"               element={<MasterPlansPage />} />

                {/* ── Legal ── */}
                <Route path="/terms-and-conditions"      element={<TermsAndConditionsPage />} />
                <Route path="/terms"                     element={<TermsAndConditionsPage />} />
                <Route path="/disclaimer"                element={<DisclaimerPage />} />
                <Route path="/privacy"                   element={<PrivacyPolicyPage />} />
                <Route path="/rera-disclaimer"           element={<RERADisclaimerPage />} />

                {/* ── Auth ── */}
                <Route path="/login"                     element={<LoginPage />} />
                <Route path="/signup"                    element={<SignupPage />} />
                <Route path="/reset-password"            element={<PasswordResetPage />} />
                <Route path="/verify-email"              element={<EmailVerificationPage />} />
                <Route path="/auth/google/success"       element={<GoogleSuccessPage />} />
                <Route path="/complete-profile/google"   element={<GoogleCompleteProfilePage />} />

                {/* ── User ── */}
                <Route path="/setup-profile" element={<ProtectedRoute><SetupProfilePage /></ProtectedRoute>} />
                <Route path="/profile"       element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                <Route path="/my-listings"   element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                <Route path="/list-property" element={<ProtectedRoute><ListPropertyPage /></ProtectedRoute>} />
                <Route path="/list-property/property" element={<ProtectedRoute><ListPropertyFormPage /></ProtectedRoute>} />
                <Route path="/list-property/project" element={<ProtectedRoute><ListProjectFormPage /></ProtectedRoute>} />
                <Route path="/sell-property" element={<ProtectedRoute><ProjectListingForm /></ProtectedRoute>} />
                <Route path="/dashboard/buyer"  element={<ProtectedRoute allowedRoles={['buyer', 'admin']}><BuyerDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/seller" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><SellerDashboard /></ProtectedRoute>} />

                {/* ── Channel Partner — public ── */}
                <Route path="/become-channel-partner"        element={<BecomeChannelPartnerPage />} />
                <Route path="/cp/:shareToken/listings"        element={<CpStorePage />} />
                <Route path="/cp/:shareToken/buyers"          element={<CpStorePage />} />
                <Route path="/cp/login"                       element={<CpLoginPage />} />
                <Route path="/cp/newpassword"                 element={<CpSetupPage />} />
                <Route path="/ref/:cpPublicId/:refToken"      element={<RefRedirectPage />} />

                {/* ── Channel Partner — dashboard ── */}
                <Route path="/cp/dashboard" element={<CpProtectedRoute><CpDashboardLayout /></CpProtectedRoute>}>
                  <Route index           element={<Navigate to="/cp/dashboard/listings" replace />} />
                  <Route path="listings"   element={<CpMyListingsPage />} />
                  <Route path="add"        element={<CpAddPropertyPage />} />
                  <Route path="wishlist"   element={<CpWishlistPage />} />
                  <Route path="requirements" element={<CpRequirementsPage />} />
                  <Route path="leads"      element={<CpLeadsPage />} />
                  <Route path="visits"     element={<CpVisitRequestsPage />} />
                  <Route path="visitors"   element={<CpVisitorsPage />} />
                  <Route path="activities" element={<CpActivitiesPage />} />
                  <Route path="profile"    element={<CpProfilePage />} />
                </Route>

                {/* ── Admin auth ── */}
                <Route path="/admin-login"                       element={<AdminLoginPage />} />
                <Route path="/admin-forgot-password"             element={<AdminForgotPasswordPage />} />
                <Route path="/admin/reset-password/:token"       element={<AdminResetPasswordPage />} />
                <Route path="/admin-device-authorization"        element={<AdminDeviceAuthorizationPage />} />
                <Route path="/admin-dashboard"                   element={<Navigate to="/admin" replace />} />

                {/* ── Admin ── */}
                <Route path="/admin"                     element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/properties"          element={<AdminProtectedRoute><AdminPropertiesPage /></AdminProtectedRoute>} />
                <Route path="/admin/properties/:id"      element={<AdminProtectedRoute><AdminPropertyDetailsPage /></AdminProtectedRoute>} />
                <Route path="/admin/devices"             element={<AdminProtectedRoute><AdminDeviceManagementPage /></AdminProtectedRoute>} />
                <Route path="/admin/settings"            element={<AdminProtectedRoute><AdminSettingsPage /></AdminProtectedRoute>} />
                <Route path="/admin/approvals"           element={<AdminProtectedRoute><AdminApprovalsPage /></AdminProtectedRoute>} />
                <Route path="/admin/list-property"       element={<AdminProtectedRoute><AdminListPropertyPage /></AdminProtectedRoute>} />
                <Route path="/admin/list-property/property" element={<AdminProtectedRoute><AdminListPropertyFormPage /></AdminProtectedRoute>} />
                <Route path="/admin/list-property/project"  element={<AdminProtectedRoute><AdminListProjectFormPage /></AdminProtectedRoute>} />
                <Route path="/admin/edit-property/:id"   element={<AdminProtectedRoute><AdminEditPropertyPage /></AdminProtectedRoute>} />
                <Route path="/admin/users"               element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
                <Route path="/admin/campaigns"           element={<AdminProtectedRoute><AdminCampaignsPage /></AdminProtectedRoute>} />
                <Route path="/admin/visits"              element={<AdminProtectedRoute><AdminVisitsPage /></AdminProtectedRoute>} />
                <Route path="/admin/requirements"        element={<AdminProtectedRoute><AdminRequirementsPage /></AdminProtectedRoute>} />
                <Route path="/admin/buyers"               element={<AdminProtectedRoute><AdminRequirementsPage /></AdminProtectedRoute>} />
                <Route path="/admin/leads"               element={<AdminProtectedRoute><AdminLeadsOverviewPage /></AdminProtectedRoute>} />
                <Route path="/admin/analytics"           element={<AdminProtectedRoute><AdminAnalyticsPage /></AdminProtectedRoute>} />
                <Route path="/admin/traffic"             element={<AdminProtectedRoute><AdminTrafficPage /></AdminProtectedRoute>} />
                <Route path="/admin/web-analytics"       element={<AdminProtectedRoute><AdminWebAnalyticsPage /></AdminProtectedRoute>} />
                <Route path="/admin/inventory"           element={<AdminProtectedRoute><AdminInventoryOverviewPage /></AdminProtectedRoute>} />
                <Route path="/admin/channel-partners"    element={<AdminProtectedRoute><AdminChannelPartnersPage /></AdminProtectedRoute>} />

                {['/admin/transactions', '/admin/inquiries',
                  '/admin/lead-transactions', '/admin/announcements', '/admin/activity',
                ].map(p => (
                  <Route key={p} path={p} element={<AdminProtectedRoute><AdminComingSoonPage /></AdminProtectedRoute>} />
                ))}

                {/* ── 404 ── */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                    <h1 className="text-4xl font-extrabold mb-4 text-primary">404 — Page Not Found</h1>
                    <p className="text-muted-foreground mb-8 font-medium">The page you are looking for doesn't exist.</p>
                    <a href="/" className="text-[#10B981] hover:underline font-bold">Return to Home</a>
                  </div>
                } />
              </Routes>
            </Suspense>
            <Toaster position="top-center" richColors />
          </Router>
        </CpAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
