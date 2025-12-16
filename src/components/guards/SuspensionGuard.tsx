import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "react-router-dom";

interface SuspensionGuardProps {
  children: ReactNode;
  allowNavigation?: boolean;
}

const SuspensionGuard = ({ children, allowNavigation = true }: SuspensionGuardProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const isSuspended =
    user.account_status === "temporarily_suspended" ||
    user.account_status === "permanently_suspended";

  if (!isSuspended) return <Outlet />;

  const isPermanent = user.account_status === "permanently_suspended";

  if (allowNavigation) {
    return (
      <div className="flex flex-col h-full">
        <Alert className={`m-3 ${isPermanent ? "border-destructive/50 bg-destructive/10" : "border-warning/50 bg-warning/10"}`}>
          <ShieldAlert className={isPermanent ? "text-destructive" : "text-warning"} />
          <AlertDescription className="flex justify-between gap-2">
            <span>
              Your account has been {isPermanent ? "permanently" : "temporarily"} suspended.
              {user.suspension_info?.reason && ` Reason: ${user.suspension_info.reason}`}
            </span>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@academichub.com">Contact Support</a>
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className={`max-w-2xl ${isPermanent ? "border-destructive/50" : "border-warning/50"} w-full`}>
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12" />
          <CardTitle>Account {isPermanent ? "Permanently" : "Temporarily"} Suspended</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SuspensionGuard;
