import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const EmailVerification = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isResending, setIsResending] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (!isLoading && user?.is_verified) {
      switch (user.role) {
        case "writer":
          navigate("/writer", { replace: true });
          break;
        case "client":
          navigate("/client", { replace: true });
          break;
        case "admin":
          navigate("/admin", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  const handleResend = async () => {
    if (isResending) return;

    setIsResending(true);

    try {
      await api.post("/auth/resend-verification");

      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder.",
      });
    } catch (err: any) {
      const status = err?.response?.status;

      toast({
        variant: "destructive",
        title:
          status === 429
            ? "Please wait before retrying"
            : "Unable to resend email",
        description:
          err?.response?.data?.message ||
          "Something went wrong. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = () => {
    navigate("/update-email");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (user.is_verified) return null;

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="max-w-lg w-full border-warning/30 bg-gradient-to-br from-warning/5 via-background to-warning/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-warning/10 w-fit">
            <Mail className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-warning/30 bg-warning/5">
            <AlertDescription className="text-base">
              Your email has not been verified. Check your inbox and click the
              link to activate your account.
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
            <h3 className="font-semibold">Didn't receive the email?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address above is correct</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              className="w-full"
              size="lg"
              disabled={isResending}
              onClick={handleResend}
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>

            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={handleUpdateEmail}
            >
              Update Email Address
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
