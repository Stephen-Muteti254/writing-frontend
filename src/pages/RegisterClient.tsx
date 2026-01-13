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
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CountrySelect } from "@/components/CountrySelect";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";

const RegisterClient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuthData } = useAuth?.() || {};
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
        role: "client",
        country: formData.country,
        phone: formData.phone,
      };

      const res = await api.post("/auth/register", payload);
      const data = res.data;

      // Flask success_response wraps data differently — extract intelligently
      const accessToken = data?.access_token || data?.data?.access_token;
      const refreshToken = data?.refresh_token || data?.data?.refresh_token;
      const user = data?.user || data?.data?.user;

      if (!user || !accessToken) {
        throw new Error("Invalid API response structure.");
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken || "");
      localStorage.setItem("user", JSON.stringify(user));

      if (setAuthData) {
        setAuthData({
          user,
          accessToken,
          refreshToken,
        });
      }

      toast({
        title: "Registration Successful",
        description: "Welcome to AcademicHub! Redirecting to your dashboard...",
      });

      setTimeout(() => navigate("/client/orders"), 1000);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Extract Flask-style error
      const errResponse = error.response?.data;
      const backendError = errResponse?.error;
      const message =
        backendError?.message ||
        errResponse?.message ||
        error.message ||
        "An unexpected error occurred during registration.";

      const details =
        backendError?.details && Object.keys(backendError.details).length > 0
          ? JSON.stringify(backendError.details)
          : "";

      toast({
        title: "Registration Failed",
        description: details ? `${message}: ${details}` : message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Helmet>
      <title>Hire Expert Academic Writers | Client Registration – Academic Hub</title>
      <meta
        name="description"
        content="Register as a client on Academic Hub to hire verified academic writers for essays, research papers, theses, and dissertations."
      />
      <meta name="robots" content="index, follow" />
    </Helmet>
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Create Client Account
          </CardTitle>
          <CardDescription className="text-center">
            Fill in your details to start posting orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

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
              />
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <CountrySelect
                value={formData.country}
                onChange={(country) =>
                  setFormData({ ...formData, country: country || "" })
                }
                placeholder="Select your country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default RegisterClient;
