
import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.jsx';

import ScrollToTop from '@/components/ScrollToTop.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminProtectedRoute from '@/components/AdminProtectedRoute.jsx';
import { AdminRecoveryService } from '@/lib/AdminRecoveryService.js';

import HomePage from '@/pages/HomePage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import HowItWorksPage from '@/pages/HowItWorksPage.jsx';
import FAQPage from '@/pages/FAQPage.jsx';
import FastTrackPage from '@/pages/FastTrackPage.jsx';
import BlogPage from '@/pages/BlogPage.jsx';
import PropertiesPage from '@/pages/PropertiesPage.jsx';
import PropertyDetailsPage from '@/pages/PropertyDetailsPage.jsx';
import ProjectsPage from '@/pages/ProjectsPage.jsx';
import ProjectDetailPage from '@/pages/ProjectDetailPage.jsx';
import ListPropertyPage from '@/pages/ListPropertyPage.jsx';
import ProjectListingForm from '@/components/ProjectListingForm.jsx';
import AddRequirementPage from '@/pages/AddRequirementPage.jsx';
import PostRequirementPage from '@/pages/PostRequirementPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import InvestorPage from '@/pages/InvestorPage.jsx';
import GreaterNoidaAreaGuide from '@/components/GreaterNoidaAreaGuide.jsx';
import NoidaAreaGuide from '@/components/NoidaAreaGuide.jsx';
import YEIDAAreaGuide from '@/components/YEIDAAreaGuide.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import PasswordResetPage from '@/pages/PasswordResetPage.jsx';
import EmailVerificationPage from '@/pages/EmailVerificationPage.jsx';
import BuyerDashboard from '@/pages/BuyerDashboard.jsx';
import SellerDashboard from '@/pages/SellerDashboard.jsx';
import SetupProfilePage from '@/pages/SetupProfilePage.jsx';
import UserProfilePage from '@/pages/UserProfilePage.jsx';
import SearchResultsPage from '@/pages/SearchResultsPage.jsx';
import TermsAndConditionsPage from '@/pages/TermsAndConditionsPage.jsx';
import MyListingsPage from '@/pages/MyListingsPage.jsx';
import SitemapPage from '@/pages/SitemapPage.jsx';

import AdminLoginPage from '@/pages/AdminLoginPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import AdminPropertyDetailsPage from '@/pages/AdminPropertyDetailsPage.jsx';
import AdminDeviceAuthorizationPage from '@/pages/AdminDeviceAuthorizationPage.jsx';
import AdminDeviceManagementPage from '@/pages/AdminDeviceManagementPage.jsx';
import AdminForgotPasswordPage from '@/pages/AdminForgotPasswordPage.jsx';
import AdminResetPasswordPage from '@/pages/AdminResetPasswordPage.jsx';
import AdminSettingsPage from '@/pages/AdminSettingsPage.jsx';
import AdminApprovalsPage from '@/pages/AdminApprovalsPage.jsx';

function App() {
  console.log('[App] Rendering routes configuration');
  
  useEffect(() => {
    AdminRecoveryService.init();
    console.log('[App] Routing initialized.');
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/fast-track" element={<FastTrackPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectName" element={<ProjectDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/invest" element={<InvestorPage />} />
            <Route path="/area-guide/greater-noida" element={<GreaterNoidaAreaGuide />} />
            <Route path="/area-guide/noida" element={<NoidaAreaGuide />} />
            <Route path="/area-guide/yeida" element={<YEIDAAreaGuide />} />
            <Route path="/add-requirement" element={<AddRequirementPage />} />
            <Route path="/post-requirement" element={<PostRequirementPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin-forgot-password" element={<AdminForgotPasswordPage />} />
            <Route path="/admin/reset-password/:token" element={<AdminResetPasswordPage />} />
            <Route path="/admin-device-authorization" element={<AdminDeviceAuthorizationPage />} />
            
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            
            <Route path="/admin/properties/:id" element={
              <AdminProtectedRoute>
                <AdminPropertyDetailsPage />
              </AdminProtectedRoute>
            } />
            
            <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

            <Route path="/admin/devices" element={
              <AdminProtectedRoute>
                <AdminDeviceManagementPage />
              </AdminProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <AdminProtectedRoute>
                <AdminSettingsPage />
              </AdminProtectedRoute>
            } />

            <Route path="/admin/approvals" element={
              <AdminProtectedRoute>
                <AdminApprovalsPage />
              </AdminProtectedRoute>
            } />
            
            <Route path="/setup-profile" element={
              <ProtectedRoute>
                <SetupProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/list-property" element={
              <ProtectedRoute>
                <ListPropertyPage />
              </ProtectedRoute>
            } />
            
            <Route path="/sell-property" element={
              <ProtectedRoute>
                <ProjectListingForm />
              </ProtectedRoute>
            } />

            <Route path="/my-listings" element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/buyer" element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <BuyerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/seller" element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background">
                <h1 className="text-4xl font-extrabold mb-4 text-primary">404 - Page Not Found</h1>
                <p className="text-muted-foreground mb-8 font-medium">The page you are looking for doesn't exist.</p>
                <a href="/" className="text-[#10B981] hover:underline font-bold">Return to Home</a>
              </div>
            } />
          </Routes>
          <Toaster position="top-center" richColors />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
