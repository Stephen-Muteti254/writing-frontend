import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ApplicationStatusGuard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const status = user.application_status;
  const path = location.pathname;

  // Rejected → force rejected page
  if (status === "rejected") {
    if (!path.startsWith("/writer-onboarding/rejected")) {
      return <Navigate to="/writer-onboarding/rejected" replace />;
    }
    return <Outlet />;
  }

  // Not applied
  if (
    status === "not_applied" &&
    !path.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer-onboarding/apply" replace />;
  }

  // Applied, under review
  if (
    status === "applied" &&
    !path.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer-onboarding/pending" replace />;
  }

  // Approved but awaiting activation fee
  if (
    status === "awaiting_initial_deposit" &&
    !path.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer-onboarding/approved" replace />;
  }

  // Fully active writer → block onboarding entirely
  if (
    status === "paid_initial_deposit" &&
    path.startsWith("/writer-onboarding")
  ) {
    return <Navigate to="/writer/orders/in-progress/all" replace />;
  }

  return <Outlet />;
};


export default ApplicationStatusGuard;
