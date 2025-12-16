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
  if (status === "not_applied" && location.pathname !== "/writer-onboarding/apply") {
    return <Navigate to="/writer-onboarding/apply" replace />;
  }

  // Applied but not approved → redirect to pending page
  if (status === "applied" && location.pathname !== "/writer-onboarding/pending") {
    return <Navigate to="/writer-onboarding/pending" replace />;
  }

  // Approved but not activated → redirect to approved page
  if (status === "awaiting_initial_deposit" && location.pathname !== "/writer-onboarding/approved") {
    return <Navigate to="/writer-onboarding/approved" replace />;
  }

  // Fully active writers → redirect to dashboard
  if (status === "active") {
    return <Navigate to="/writer/orders/in-progress/all" replace />;
  }

  // All checks passed → render nested routes
  return <Outlet />;
};

export default ApplicationStatusGuard;
