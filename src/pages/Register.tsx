import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, PenTool } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"client" | "writer" | null>(null);

  const handleRoleSelection = (role: "client" | "writer") => {
    setSelectedRole(role);
    if (role === "client") {
      navigate("/register/client");
    } else {
      navigate("/register/writer");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Join AcademicHub</h1>
          <p className="text-muted-foreground">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Client Card */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary ${
              selectedRole === "client" ? "border-primary shadow-lg" : ""
            }`}
            onClick={() => handleRoleSelection("client")}
          >
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">I'm a Client</CardTitle>
              <CardDescription className="text-base">
                Looking for expert writers to complete academic work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Post orders and receive competitive bids
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Choose from verified expert writers
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Secure payment with satisfaction guarantee
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Real-time communication with writers
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => handleRoleSelection("client")}>
                Sign Up as Client
              </Button>
            </CardContent>
          </Card>

          {/* Writer Card */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary ${
              selectedRole === "writer" ? "border-primary shadow-lg" : ""
            }`}
            onClick={() => handleRoleSelection("writer")}
          >
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <PenTool className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">I'm a Writer</CardTitle>
              <CardDescription className="text-base">
                Earn money by completing academic orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Browse available orders in your expertise
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Set your own rates and schedule
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Secure and timely payments
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Build your reputation and earn more
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => handleRoleSelection("writer")}>
                Sign Up as Writer
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
