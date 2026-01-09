import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import LightLogo from "@/assets/light-mini-logo.PNG";
import DarkLogo from "@/assets/dark-mini-logo.PNG";
import { Eye, EyeOff } from "lucide-react";

type Step = "credentials" | "otp";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("credentials");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");

  /* --------------------------------
     STEP 1: Email + Password
  -------------------------------- */
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);

      if (data.otp_required) {
        setOtpSessionId(data.otp_session_id);
        setStep("otp");

        toast({
          title: "OTP Sent",
          description: "Check your email for the one-time password.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Login failed",
        description:
          err.response?.data?.error?.message ||
          "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------
     STEP 2: OTP Verification
  -------------------------------- */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login/verify-otp", {
        otp,
        otp_session_id: otpSessionId,
      });

      const { access_token, refresh_token, user } = data;

      login(user, access_token);

      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.full_name || "User"}!`,
      });

      if (user.role === "writer") navigate("/writer");
      else if (user.role === "client") navigate("/client");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err: any) {
      toast({
        title: "Invalid OTP",
        description:
          err.response?.data?.error?.message ||
          "The OTP you entered is incorrect or expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-lg">
              <img
                src={LightLogo}
                alt="AcademicHub"
                className="h-16 block dark:hidden"
              />
              <img
                src={DarkLogo}
                alt="AcademicHub"
                className="h-16 hidden dark:block"
              />
            </div>
          </div>

          <CardTitle className="text-2xl">
            {step === "credentials" ? "Welcome Back" : "Verify OTP"}
          </CardTitle>
          <CardDescription>
            {step === "credentials"
              ? "Enter your credentials to continue"
              : "Enter the OTP sent to your email"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <Label>Password</Label>
                  {/*<Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                    disabled={true}
                  >
                    Forgot?
                  </Link>*/}
                </div>

                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-6 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>


              <Button className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Continue"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>One-Time Password</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
