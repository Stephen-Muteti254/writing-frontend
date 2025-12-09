import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { DashboardLayout } from "./components/DashboardLayout";
import { AdminLayout } from "./components/AdminLayout";
import { ClientLayout } from "./components/ClientLayout";
import { PublicLayout } from "./components/PublicLayout";
import MyOrders from "./pages/MyOrders";
import EditBid from "./pages/EditBid";
import AvailableOrders from "./pages/AvailableOrders";
import MyBids from "./pages/MyBids";
import Chats from "./pages/Chats";
import Leaderboard from "./pages/Leaderboard";
import Balance from "./pages/Balance";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import Profile from "./pages/Profile";
import OrderDetails from "./pages/OrderDetails";
import PlaceBid from "./pages/PlaceBid";
import OrderView from "./pages/OrderView";
import NotFound from "./pages/NotFound";
import OrderFormPage from "./pages/OrderFormPage";
import SubmitWork from "./pages/SubmitWork";
import ReviewSubmission from "./pages/ReviewSubmission";
import AdminClients from "./pages/admin/AdminClients";
import AdminWriters from "./pages/admin/AdminWriters";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminApplicationDetail from "./pages/admin/AdminApplicationDetail";
// import ClientOrders from "./pages/client/ClientOrders";
import NewClientOrders from "./pages/client/NewClientOrders";
import OrderSubmissions from "./pages/client/NewOrderSubmissions";
import OrderBids from "./pages/client/OrderBids";
import ClientBids from "./pages/client/ClientBids";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterClient from "./pages/RegisterClient";
import RegisterWriter from "./pages/RegisterWriter";
import ApplicationPending from "./pages/ApplicationPending";
import ApplicationApproved from "./pages/ApplicationApproved";
import WriterApplication from "./pages/WriterApplication";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { RequireAuth } from '@/components/RequireAuth';
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ProfileModalProvider } from "@/contexts/ProfileModalContext";

import EmailVerificationGuard from "@/components/guards/EmailVerificationGuard";
import ProfileCompletionGuard from "@/components/guards/ProfileCompletionGuard";
import SuspensionGuard from "@/components/guards/SuspensionGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
            <ChatProvider>
            <ProfileModalProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicLayout>
                  <Landing />
                </PublicLayout>
              } />
              <Route path="/login" element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              } />
              <Route path="/register" element={
                <PublicLayout>
                  <Register />
                </PublicLayout>
              } />
              <Route path="/register/client" element={
                <PublicLayout>
                  <RegisterClient />
                </PublicLayout>
              } />
              <Route path="/register/writer" element={
                <PublicLayout>
                  <RegisterWriter />
                </PublicLayout>
              } />
              <Route path="/writer-application" element={
                <PublicLayout>
                  <WriterApplication />
                </PublicLayout>
              } />
              <Route path="/application-pending" element={
                <PublicLayout>
                  <ApplicationPending />
                </PublicLayout>
              } />
              <Route path="/application-approved" element={
                <PublicLayout>
                  <ApplicationApproved />
                </PublicLayout>
              } />
              <Route path="/about" element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              } />
              <Route path="/contact" element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              } />
              <Route path="/privacy" element={
                <PublicLayout>
                  <Privacy />
                </PublicLayout>
              } />
              <Route path="/terms" element={
                <PublicLayout>
                  <Terms />
                </PublicLayout>
              } />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <RequireAuth requiredRole="admin">
                    <AdminLayout>
                      <Routes>
                        <Route path="clients" element={<AdminClients />} />
                        <Route path="writers" element={<AdminWriters />} />
                        <Route path="applications" element={<AdminApplications />} />
                        <Route path="applications/:id" element={<AdminApplicationDetail />} />
                        <Route path="payments" element={<Navigate to="/admin/payments/all" replace />} />
                        <Route path="payments/:tab" element={<AdminPayments />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="support" element={<AdminSupport />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="*" element={<Navigate to="/admin/clients" replace />} />
                      </Routes>
                    </AdminLayout>
                  </RequireAuth>
                }
              />

              <Route
                path="/client/*"
                element={
                  <RequireAuth requiredRole="client">
                    <ClientLayout />
                  </RequireAuth>
                }
              >
                {/* /client → /client/orders/in-progress */}
                <Route index element={<Navigate to="orders/in-progress" replace />} />

                {/* /client/orders → /client/orders/in-progress */}
                <Route path="orders" element={<Navigate to="in-progress" replace />} />

                {/* All order-related pages inside NewClientOrders */}
                <Route path="orders/:tab" element={<NewClientOrders />}>
                  <Route index element={null} />

                  {/* Order view */}
                  <Route path=":orderId" element={<OrderDetails />} />

                  {/* Edit */}
                  <Route path=":orderId/edit" element={<OrderFormPage />} />

                  {/* Bids — FIXED NESTING */}
                  <Route path=":orderId/bids/:bidTab" element={<OrderBids />} />

                  {/* Submissions */}
                  <Route path=":orderId/submissions" element={<OrderSubmissions />} />

                  {/* Create order inside outlet */}
                  <Route path="create" element={<OrderFormPage />} />
                </Route>

                {/* Chats */}
                <Route path="chats" element={<Chats />} />

                {/* Balance */}
                <Route path="balance/:tab" element={<Balance />} />

                {/* Notifications */}
                <Route path="notifications" element={<Notifications />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="orders/in-progress" replace />} />
              </Route>

              <Route
                path="/writer/*"
                element={
                  <RequireAuth requiredRole="writer">
                    <DashboardLayout />
                  </RequireAuth>
                }
              >
                {/* Guards wrapping all writer routes */}
                <Route
                  element={
                    <EmailVerificationGuard>
                      <ProfileCompletionGuard>
                        <SuspensionGuard allowNavigation={false} />
                      </ProfileCompletionGuard>
                    </EmailVerificationGuard>
                  }
                >
                  {/* Default redirect */}
                  <Route index element={<Navigate to="orders/in-progress/all" replace />} />

                  {/* Orders */}
                  <Route path="orders/:parentTab/*" element={<MyOrders />} />

                  {/* Available orders */}
                  <Route path="available-orders/:tab" element={<AvailableOrders />} />
                  <Route path="available-orders" element={<Navigate to="available-orders/all" replace />} />

                  {/* Order details */}
                  <Route path="order-details/:orderId" element={<OrderDetails />} />

                  {/* My bids */}
                  <Route path="my-bids/edit/:bidId" element={<EditBid />} />
                  <Route path="my-bids/view/:bidId" element={<EditBid />} />
                  <Route path="my-bids/:tab" element={<MyBids />} />
                  <Route path="my-bids" element={<Navigate to="open" replace />} />

                  {/* Place bid / view / submit / review */}
                  <Route path="place-bid/:orderId" element={<PlaceBid />} />
                  <Route path="order-view/:orderId" element={<OrderView />} />
                  <Route path="submit-work/:orderId" element={<SubmitWork />} />
                  <Route path="review-submission/:submissionId" element={<ReviewSubmission />} />

                  {/* Chats, Leaderboard, Balance */}
                  <Route path="chats" element={<Chats />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="balance/:tab" element={<Balance />} />

                  {/* Notifications */}
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="notifications-settings" element={<NotificationSettings />} />

                  {/* Profile */}
                  <Route path="profile" element={<Profile />} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>

            </Routes>
            </ProfileModalProvider>
            </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
