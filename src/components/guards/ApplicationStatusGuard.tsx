import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ApplicationStatusGuard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show full-page loader while auth/user data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const status = user.application_status;

  // Writer has not applied → redirect to apply page
  if (
    status === "not_applied" &&
    !location.pathname.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer-onboarding/apply" replace />;
  }

  // Applied but not approved
  if (
    status === "applied" &&
    !location.pathname.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer-onboarding/pending" replace />;
  }

  // Approved but not activated
  if (
    status === "awaiting_initial_deposit" &&
    !location.pathname.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer-onboarding/approved" replace />;
  }

  // Fully active → ONLY block onboarding
  if (
    status === "paid_initial_deposit" &&
    location.pathname.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer/orders/in-progress/all" replace />;
  }

  return <Outlet />;
};

export default ApplicationStatusGuard;
