import * as Lazy from "@/lazy";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PublicLayout } from "./components/PublicLayout";
import EditBid from "./pages/EditBid";
import MyBids from "./pages/MyBids";
import Chats from "./pages/Chats";
import Leaderboard from "./pages/Leaderboard";
import Balance from "./pages/Balance";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import Profile from "./pages/Profile";
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
import OrderSubmissions from "./pages/client/NewOrderSubmissions";
import OrderBids from "./pages/client/OrderBids";
import ClientBids from "./pages/client/ClientBids";
import RegisterClient from "./pages/RegisterClient";
import RegisterWriter from "./pages/RegisterWriter";
import ApplicationPending from "./pages/ApplicationPending";
import ApplicationApproved from "./pages/ApplicationApproved";
import WriterApplication from "./pages/WriterApplication";
import EmailVerification from "./pages/EmailVerification";
import EmailVerificationConfirm from "./pages/EmailVerificationConfirm";
import WriterProfileCompletionLayout from "./pages/WriterProfileCompletionLayout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { RequireAuth } from '@/components/RequireAuth';
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { SupportChatProvider } from "@/contexts/SupportChatContext";

import { ProfileModalProvider } from "@/contexts/ProfileModalContext";

import EmailVerificationGuard from "@/components/guards/EmailVerificationGuard";
import ProfileCompletionGuard from "@/components/guards/ProfileCompletionGuard";
import SuspensionGuard from "@/components/guards/SuspensionGuard";
import ApplicationStatusGuard from "@/components/guards/ApplicationStatusGuard";
import { Suspense } from "react";
import PageLoader from "@/components/PageLoader";
import ClientWallet from "./pages/client/ClientWallet";
import RateWriter from "./pages/client/RateWriter";
import { ProfileCompletionProvider } from "@/contexts/ProfileCompletionContext";
import ProfileCompletionController from "@/components/profile/ProfileCompletionController";
import { HelmetProvider } from "react-helmet-async";

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
        <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
            <NotificationProvider>
              <ChatProvider>
              <SupportChatProvider>
                <ProfileModalProvider>
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ================= PUBLIC ================= */}
                    <Route element={<PublicLayout />}>
                      <Route index element={<Lazy.Landing />} />
                      <Route path="login" element={<Lazy.Login />} />
                      <Route path="register" element={<Lazy.Register />} />
                      <Route path="register/client" element={<RegisterClient />} />
                      <Route path="register/writer" element={<RegisterWriter />} />
                      <Route path="about" element={<About />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="privacy" element={<Privacy />} />
                      <Route path="terms" element={<Terms />} />

                      {/* Email verification (public layout only) */}
                      <Route path="email-verification" element={<EmailVerification />} />
                      <Route path="verify-email" element={<EmailVerificationConfirm />} />

                      {/* ===== Writer Onboarding (auth + public layout) ===== */}
                      <Route
                        path="writer-onboarding"
                        element={<RequireAuth requiredRole="writer" />}
                      >
                        <Route element={<EmailVerificationGuard />}>
                          <Route element={<ApplicationStatusGuard />}>
                            <Route path="apply" element={<WriterApplication />} />
                            <Route path="pending" element={<ApplicationPending />} />
                            <Route path="approved" element={<ApplicationApproved />} />
                          </Route>
                        </Route>
                      </Route>
                    </Route>

                    {/* ================= ADMIN ================= */}
                    <Route element={<RequireAuth requiredRole="admin" />}>
                      <Route element={<EmailVerificationGuard />}>
                        <Route path="/admin" element={<Lazy.AdminLayout />}>
                          <Route index element={<Navigate to="clients" replace />} />
                          <Route path="clients" element={<AdminClients />} />
                          <Route path="writers" element={<AdminWriters />} />
                          <Route path="applications" element={<AdminApplications />} />
                          <Route
                            path="applications/:id"
                            element={<AdminApplicationDetail />}
                          />

                          {/* Payments */}
                          <Route path="payments">
                            <Route index element={<Navigate to="all" replace />} />
                            <Route path=":tab" element={<AdminPayments />} />
                          </Route>

                          <Route path="notifications" element={<AdminNotifications />} />
                          <Route path="support" element={<AdminSupport />} />
                          <Route path="analytics" element={<AdminAnalytics />} />

                          <Route path="*" element={<Navigate to="clients" replace />} />
                        </Route>
                      </Route>
                    </Route>

                    {/* ================= CLIENT ================= */}
                    <Route element={<RequireAuth requiredRole="client" />}>
                      <Route element={<EmailVerificationGuard />}>
                        <Route path="/client" element={<Lazy.ClientLayout />}>
                          <Route
                            index
                            element={<Navigate to="orders/in-progress" replace />}
                          />

                          {/* Orders */}
                          <Route path="orders/:tab" element={<Lazy.NewClientOrders />}>

                            <Route path=":orderId" element={<Lazy.OrderDetails />} />
                            <Route path=":orderId/edit" element={<OrderFormPage />} />
                            <Route
                              path=":orderId/bids/:bidTab"
                              element={<OrderBids />}
                            />
                            <Route
                              path=":orderId/submissions"
                              element={<OrderSubmissions />}
                            />
                            <Route path=":orderId/rate" element={<RateWriter />} />
                            <Route path="create" element={<OrderFormPage />} />
                          </Route>

                          {/* Chats */}
                          <Route path="chats" element={<Chats />} />

                          {/* Balance */}
                          <Route path="balance/:tab" element={<Balance />} />

                          {/* Notifications */}
                          <Route path="notifications" element={<Notifications />} />

                          <Route path="wallet" element={<ClientWallet />} />

                          <Route
                            path="*"
                            element={<Navigate to="orders/in-progress" replace />}
                          />
                        </Route>
                      </Route>
                    </Route>

                    {/* ================= WRITER ================= */}
                    <Route element={<RequireAuth requiredRole="writer" />}>
                      <Route element={<EmailVerificationGuard />}>
                        <Route
                            path="/writer"
                            element={
                              <ProfileCompletionProvider>
                                <Lazy.DashboardLayout />
                                <ProfileCompletionController />
                              </ProfileCompletionProvider>
                            }
                          >
                        {/*<Route element={<WriterProfileCompletionLayout />}>*/}
                          {/*<ProfileProvider>*/}
                          <Route element={<ApplicationStatusGuard />}>
                            <Route element={<ProfileCompletionGuard />}>
                              <Route element={<SuspensionGuard allowNavigation={false} />}>

                                <Route
                                  index
                                  element={<Navigate to="available-orders/all" replace />}
                                />

                                {/* My Orders */}
                                <Route path="orders/:parentTab/*" element={<Lazy.MyOrders />} />

                                {/* Available Orders */}
                                <Route path="available-orders/:tab" element={<Lazy.AvailableOrders />} />
                                <Route
                                  path="available-orders"
                                  element={<Navigate to="available-orders/all" replace />}
                                />

                                {/* Order details */}
                                <Route path="order-details/:orderId" element={<Lazy.OrderDetails />} />

                                {/* My Bids */}
                                <Route path="my-bids/edit/:bidId" element={<EditBid />} />
                                <Route path="my-bids/view/:bidId" element={<EditBid />} />
                                <Route path="my-bids/:tab" element={<MyBids />} />
                                <Route
                                  path="my-bids"
                                  element={<Navigate to="open" replace />}
                                />

                                {/* Actions */}
                                <Route path="place-bid/:orderId" element={<PlaceBid />} />
                                <Route path="order-view/:orderId" element={<OrderView />} />
                                <Route path="submit-work/:orderId" element={<Lazy.SubmitWork />} />
                                <Route
                                  path="review-submission/:submissionId"
                                  element={<ReviewSubmission />}
                                />

                                {/* Extras */}
                                <Route path="chats" element={<Chats />} />
                                <Route path="leaderboard" element={<Leaderboard />} />
                                <Route path="balance/:tab" element={<Balance />} />
                                <Route path="notifications" element={<Notifications />} />
                                <Route
                                  path="notifications-settings"
                                  element={<NotificationSettings />}
                                />

                                <Route path="*" element={<NotFound />} />

                              </Route>
                            </Route>
                          </Route>
                          {/*</ProfileProvider>*/}
                          </Route>
                        {/*</Route>*/}
                      </Route>
                    </Route>
                    {/*End of writer routes*/}
                  </Routes>
                </Suspense>
                </ProfileModalProvider>
              </SupportChatProvider>
              </ChatProvider>
            </NotificationProvider>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
