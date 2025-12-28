import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import LightLogo from "@/assets/light-mini-logo.PNG";
import DarkLogo from "@/assets/dark-mini-logo.PNG";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const data = response.data;

      console.log("Login response:", data);

      if (data.access_token && data.user) {
        const { access_token, refresh_token, user } = data;

        login(user, access_token);

        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }

        toast({
          title: "Login successful",
          description: `Welcome back, ${user.full_name || "User"}!`,
        });

        if (user.role === "writer") {
          navigate("/writer");
        } else if (user.role === "client") {
          navigate("/client");
        } else if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        const message =
          data.error?.message || data.message || "Invalid credentials. Please try again.";
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Unable to log in. Please check your credentials.";
      toast({
        title: "Login Error",
        description: message,
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
                className="w-auto h-16 block dark:hidden" 
              />
              <img 
                src={DarkLogo} 
                alt="AcademicHub" 
                className="w-auto h-16 hidden dark:block" 
              />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
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
