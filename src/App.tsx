import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import Offices from "./pages/Offices";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Advisor pages
import AdvisorDashboard from "./pages/advisor/Dashboard";
import AdvisorReports from "./pages/advisor/Reports";
import AdvisorAnalytics from "./pages/advisor/Analytics";
import AdvisorAudit from "./pages/advisor/Audit";
import AdvisorGoals from "./pages/advisor/Goals";

// Client pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientCases from "./pages/client/Cases";
import ClientDocuments from "./pages/client/Documents";
import ClientMessages from "./pages/client/Messages";
import ClientNotifications from "./pages/client/Notifications";
import ClientAppointments from "./pages/client/Appointments";
import ClientTickets from "./pages/client/Tickets";
import ClientProfile from "./pages/client/Profile";
import ClientCompliance from "./pages/client/Compliance";

// Admin pages
import AdminCompliance from "./pages/admin/Compliance";
import AdminPayments from "./pages/admin/Payments";
import AdminLeads from "./pages/admin/Leads";
import AdminReferrals from "./pages/admin/Referrals";
import AdminPipeline from "./pages/admin/Pipeline";
import AdminTickets from "./pages/admin/Tickets";
import AdminAudit from "./pages/admin/Audit";
import AdminNotifications from "./pages/admin/Notifications";
import AdminProducts from "./pages/admin/Products";
import AdminReports from "./pages/admin/Reports";

// HR pages
import HRJobs from "./pages/hr/Jobs";
import HRApplications from "./pages/hr/Applications";
import HRInterviews from "./pages/hr/Interviews";
import HROnboarding from "./pages/hr/Onboarding";

// Public pages
import PublicJobs from "./pages/public/Jobs";
import PublicInquiries from "./pages/public/Inquiries";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/offices" element={<Offices />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Public application routes */}
          <Route path="/public/jobs" element={<PublicJobs />} />
          <Route path="/public/inquiries" element={<PublicInquiries />} />

          {/* Protected routes with layout */}
          <Route element={<AppLayout />}>
            {/* Advisor routes */}
            <Route path="/advisor/dashboard" element={
              <ProtectedRoute allowedRoles={['Advisor', 'Manager']}>
                <AdvisorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/advisor/reports" element={
              <ProtectedRoute allowedRoles={['Advisor', 'Manager', 'ReferralPartner']}>
                <AdvisorReports />
              </ProtectedRoute>
            } />
            <Route path="/advisor/analytics" element={
              <ProtectedRoute allowedRoles={['Advisor', 'Manager']}>
                <AdvisorAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/advisor/audit" element={
              <ProtectedRoute allowedRoles={['Advisor', 'Manager']}>
                <AdvisorAudit />
              </ProtectedRoute>
            } />
            <Route path="/advisor/goals" element={
              <ProtectedRoute allowedRoles={['Advisor', 'Manager']}>
                <AdvisorGoals />
              </ProtectedRoute>
            } />

            {/* Manager dashboard - uses advisor dashboard */}
            <Route path="/manager/dashboard" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <AdvisorDashboard />
              </ProtectedRoute>
            } />

            {/* Admin dashboard - redirect to compliance */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminCompliance />
              </ProtectedRoute>
            } />

            {/* Referral dashboard - uses advisor reports */}
            <Route path="/referral/dashboard" element={
              <ProtectedRoute allowedRoles={['ReferralPartner']}>
                <AdvisorReports />
              </ProtectedRoute>
            } />

            {/* Client routes */}
            <Route path="/client/dashboard" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/cases" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientCases />
              </ProtectedRoute>
            } />
            <Route path="/client/documents" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientDocuments />
              </ProtectedRoute>
            } />
            <Route path="/client/messages" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientMessages />
              </ProtectedRoute>
            } />
            <Route path="/client/notifications" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientNotifications />
              </ProtectedRoute>
            } />
            <Route path="/client/appointments" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientAppointments />
              </ProtectedRoute>
            } />
            <Route path="/client/tickets" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientTickets />
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientProfile />
              </ProtectedRoute>
            } />
            <Route path="/client/compliance" element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientCompliance />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/compliance" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminCompliance />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminPayments />
              </ProtectedRoute>
            } />
            <Route path="/admin/leads" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminLeads />
              </ProtectedRoute>
            } />
            <Route path="/admin/referrals" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminReferrals />
              </ProtectedRoute>
            } />
            <Route path="/admin/pipeline" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminPipeline />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminAudit />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminReports />
              </ProtectedRoute>
            } />

            {/* HR routes - accessible by managers through advisor portal */}
            <Route path="/advisor/recruitment" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <HRJobs />
              </ProtectedRoute>
            } />
            <Route path="/advisor/applicants" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <HRApplications />
              </ProtectedRoute>
            } />
            <Route path="/advisor/interviews" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <HRInterviews />
              </ProtectedRoute>
            } />
            <Route path="/advisor/onboarding" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <HROnboarding />
              </ProtectedRoute>
            } />

            {/* Legacy HR routes - kept for backwards compatibility */}
            <Route path="/hr/jobs" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <HRJobs />
              </ProtectedRoute>
            } />
            <Route path="/hr/applications" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <HRApplications />
              </ProtectedRoute>
            } />
            <Route path="/hr/interviews" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <HRInterviews />
              </ProtectedRoute>
            } />
            <Route path="/hr/onboarding" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <HROnboarding />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
