import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import PageLoader from "@/components/PageLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function EmailVerificationConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setError("Invalid verification link.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      })
      .catch((err) => {
        setStatus("error");
        setError(
          err?.response?.data?.error?.message ??
          "Verification link is invalid or expired."
        );
      });
  }, [params, navigate]);


  if (status === "loading") {
    return <PageLoader label="Verifying your email…" />;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto mt-24 space-y-4 text-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto mt-24 space-y-4 text-center">
      <h1 className="text-xl font-semibold">Email Verified</h1>
      <p className="text-muted-foreground">
        Redirecting you to login…
      </p>
    </div>
  );
}
