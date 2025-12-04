import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Shield } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To connect clients with expert writers, facilitating high-quality academic work through a transparent and efficient platform."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We ensure all transactions and data are protected with industry-leading security measures."
    },
    {
      icon: Award,
      title: "Quality First",
      description: "Every writer is vetted through a rigorous application process to maintain our high standards."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive ecosystem where clients and writers can collaborate successfully."
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About AcademicHub</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            AcademicHub is a leading platform connecting clients with professional academic writers. 
            We facilitate collaboration, ensure quality, and provide a secure environment for all transactions.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <Card key={index}>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Orders Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2K+</div>
              <div className="text-muted-foreground">Verified Writers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.9</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              Founded with a vision to revolutionize academic writing collaboration, AcademicHub has grown 
              into a trusted platform serving thousands of clients and writers worldwide.
            </p>
            <p>
              We understand the challenges both clients and writers face in the academic world. That's why 
              we've built a platform that prioritizes transparency, quality, and fair compensation.
            </p>
            <p>
              Today, AcademicHub continues to evolve, implementing new features and improvements based on 
              feedback from our vibrant community of users. We're committed to maintaining the highest 
              standards while making academic collaboration accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
