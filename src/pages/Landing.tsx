import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Users, 
  FileText, 
  Clock, 
  Shield, 
  TrendingUp,
  Star,
  Award
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Users,
      title: "Expert Writers",
      description: "Access to verified writers with proven expertise in various academic fields"
    },
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "Meet your deadlines with our efficient order management system"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and transactions are protected with enterprise-grade security"
    },
    {
      icon: TrendingUp,
      title: "Quality Assurance",
      description: "Every submission goes through rigorous quality checks and reviews"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up as a client or writer in minutes"
    },
    {
      number: "02",
      title: "Post or Bid",
      description: "Clients post orders, writers place competitive bids"
    },
    {
      number: "03",
      title: "Collaborate",
      description: "Work together through our secure messaging system"
    },
    {
      number: "04",
      title: "Complete & Pay",
      description: "Review work, approve, and release secure payment"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                Trusted by thousands of users
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Connect with
                <span className="text-primary"> Expert Writers</span> for Your Academic Needs
              </h1>
              <p className="text-lg text-muted-foreground">
                Whether you're a client seeking quality academic work or a writer looking for opportunities, 
                AcademicHub provides the perfect platform to collaborate and succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg">
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">4.9/5 Rating</h3>
                        <p className="text-muted-foreground">From 10,000+ reviews</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-success/10 rounded-lg p-3">
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">50,000+ Orders</h3>
                        <p className="text-muted-foreground">Successfully completed</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-info/10 rounded-lg p-3">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">2,000+ Writers</h3>
                        <p className="text-muted-foreground">Verified experts ready to help</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose AcademicHub?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for successful academic collaboration
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="text-5xl font-bold text-primary/20">{step.number}</div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of satisfied clients and writers today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
