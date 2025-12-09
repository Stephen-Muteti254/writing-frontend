import { useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";
import ApplicationPending from "@/pages/ApplicationPending";
import ApplicationApproved from "@/pages/ApplicationApproved";

interface ApplicationStatusGuardProps {
  children: ReactNode;
}

const ApplicationStatusGuard = ({ children }: ApplicationStatusGuardProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  // If user has not applied yet, show Writer Application page
  if (user.application_status === "not_applied") {
    return <Navigate to="/writer-application" replace />;
  }

  // Show "Application Pending" when applied
  if (user.application_status === "applied") {
    return <ApplicationPending />;
  }

  // Show "Application Approved" when awaiting initial deposit
  if (user.application_status === "awaiting_initial_deposit") {
    return <ApplicationApproved />;
  }

  // If application is fully active/approved, allow access to dashboard
  return <>{children}</>;
};

export default ApplicationStatusGuard;
