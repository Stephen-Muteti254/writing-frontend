import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Lock, AlertTriangle, Mail } from "lucide-react";
import api from "@/lib/api";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SuspensionGuardProps {
  children: ReactNode;
  allowNavigation?: boolean;
}

interface UserResponse {
  id: string;
  account_status: string;
  suspension_info?: { reason?: string; suspended_at?: string };
  [key: string]: any;
}

const SuspensionGuard = ({ children, allowNavigation = true }: SuspensionGuardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        console.log("SuspensionGuard API response:", res.data);
        setUser(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const isSuspended = user.account_status === "temporarily_suspended" || user.account_status === "permanently_suspended";
  if (!isSuspended) return <>{children}</>;

  const isPermanent = user.account_status === "permanently_suspended";

  if (allowNavigation) {
    return (
      <div className="flex flex-col h-full">
        <Alert className={`m-3 ${isPermanent ? "border-destructive/50 bg-destructive/10" : "border-warning/50 bg-warning/10"}`}>
          <ShieldAlert className={`h-4 w-4 ${isPermanent ? "text-destructive" : "text-warning"}`} />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Your account has been {isPermanent ? "permanently" : "temporarily"} suspended.
              {user.suspension_info?.reason && ` Reason: ${user.suspension_info.reason}`}
            </span>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@academichub.com?subject=Account Suspension Review">Contact Support</a>
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className={`max-w-2xl w-full ${isPermanent ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto mb-4 p-4 rounded-full ${isPermanent ? "bg-destructive/10" : "bg-warning/10"} w-fit`}>
            <ShieldAlert className={`h-12 w-12 ${isPermanent ? "text-destructive" : "text-warning"}`} />
          </div>
          <CardTitle className="text-2xl font-bold">Account {isPermanent ? "Permanently" : "Temporarily"} Suspended</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={`${isPermanent ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
            <Lock className={`h-4 w-4 ${isPermanent ? "text-destructive" : "text-warning"}`} />
            <AlertDescription className="text-base">
              Your account access has been {isPermanent ? "permanently" : "temporarily"} restricted.
            </AlertDescription>
          </Alert>
          <div className="pt-4">
            <Button className="w-full" size="lg" variant="default" asChild>
              <a href="mailto:support@academichub.com?subject=Account Suspension Appeal">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspensionGuard;
