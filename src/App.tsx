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
              <ProtectedRoute allowedRoles={['advisor', 'manager']}>
                <AdvisorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/advisor/reports" element={
              <ProtectedRoute allowedRoles={['advisor', 'manager', 'referral']}>
                <AdvisorReports />
              </ProtectedRoute>
            } />
            <Route path="/advisor/analytics" element={
              <ProtectedRoute allowedRoles={['advisor', 'manager']}>
                <AdvisorAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/advisor/audit" element={
              <ProtectedRoute allowedRoles={['advisor', 'manager']}>
                <AdvisorAudit />
              </ProtectedRoute>
            } />
            <Route path="/advisor/goals" element={
              <ProtectedRoute allowedRoles={['advisor', 'manager']}>
                <AdvisorGoals />
              </ProtectedRoute>
            } />

            {/* Client routes */}
            <Route path="/client/cases" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientCases />
              </ProtectedRoute>
            } />
            <Route path="/client/documents" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDocuments />
              </ProtectedRoute>
            } />
            <Route path="/client/messages" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientMessages />
              </ProtectedRoute>
            } />
            <Route path="/client/notifications" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientNotifications />
              </ProtectedRoute>
            } />
            <Route path="/client/appointments" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientAppointments />
              </ProtectedRoute>
            } />
            <Route path="/client/tickets" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientTickets />
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientProfile />
              </ProtectedRoute>
            } />
            <Route path="/client/compliance" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientCompliance />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/compliance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCompliance />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPayments />
              </ProtectedRoute>
            } />
            <Route path="/admin/leads" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLeads />
              </ProtectedRoute>
            } />
            <Route path="/admin/referrals" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReferrals />
              </ProtectedRoute>
            } />
            <Route path="/admin/pipeline" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPipeline />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAudit />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            } />

            {/* HR routes */}
            <Route path="/hr/jobs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HRJobs />
              </ProtectedRoute>
            } />
            <Route path="/hr/applications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HRApplications />
              </ProtectedRoute>
            } />
            <Route path="/hr/interviews" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HRInterviews />
              </ProtectedRoute>
            } />
            <Route path="/hr/onboarding" element={
              <ProtectedRoute allowedRoles={['admin']}>
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
