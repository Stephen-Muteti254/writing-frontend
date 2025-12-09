import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import api from "@/lib/api";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface EmailVerificationGuardProps {
  children: ReactNode;
}

const EmailVerificationGuard = ({ children }: EmailVerificationGuardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        console.log("EmailVerificationGuard API response:", res.data);
        setUser(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  if (user.is_verified) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="max-w-lg w-full border-warning/30 bg-gradient-to-br from-warning/5 via-background to-warning/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-warning/10 w-fit">
            <Mail className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-warning/30 bg-warning/5">
            <AlertDescription className="text-base">
              Your email has not been verified.
              Check your inbox and click the link to activate your account.
            </AlertDescription>
          </Alert>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              We sent a verification link to:
            </p>
            <p className="text-base font-medium text-foreground">
              {user.email}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              Didn't receive the email?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address above is correct</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <Button className="w-full" size="lg" variant="default">
              Resend Verification Email
            </Button>
            <Button className="w-full" size="lg" variant="outline">
              Update Email Address
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationGuard;
