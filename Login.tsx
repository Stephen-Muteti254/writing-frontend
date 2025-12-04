import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/api/v1/auth/login", formData);
      const { user, access_token, refresh_token } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.role) {
        case "client":
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          navigate("/client/orders");
          break;

        case "admin":
          toast({
            title: "Login successful",
            description: "Welcome back, admin!",
          });
          navigate("/admin/dashboard");
          break;

        case "writer":
          if (user.application_status === "not_applied") {
            toast({
              title: "Complete Application",
              description: "Please apply to become a verified writer.",
            });
            navigate("/writer-application");
          } else if (user.application_status === "pending") {
            toast({
              title: "Application Under Review",
              description: "Your application is under review.",
            });
            navigate("/application-pending");
          } else if (user.application_status === "approved_no_deposit") {
            toast({
              title: "Activation Required",
              description: "Please contact support to activate your account.",
            });
            navigate("/application-approved");
          } else if (user.application_status === "approved_active") {
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
            navigate("/writer/orders/in-progress/all");
          } else {
            navigate("/writer");
          }
          break;

        default:
          navigate("/");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Invalid credentials. Please try again.";

      console.log(msg);

      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border border-muted">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to continue to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
