import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ApplicationPending = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-warning/10 p-4 rounded-full">
              <Clock className="h-12 w-12 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Under Review</CardTitle>
          <CardDescription>
            Thank you for applying to become a writer on AcademicHub!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Application Received</p>
                <p className="text-sm text-muted-foreground">
                  Your application has been successfully submitted
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">Under Review</p>
                <p className="text-sm text-muted-foreground">
                  Our team is currently reviewing your documents and qualifications
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Email Notification</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email once your application is approved
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What happens next?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Review typically takes 2-3 business days</li>
              <li>• You may be contacted for additional information</li>
              <li>• Once approved, you'll receive login credentials</li>
              <li>• After activation fee payment, your account will be activated</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
            {/*<Button variant="outline" asChild className="w-full">
              <Link to="/contact">Contact Support</Link>
            </Button>*/}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationPending;
