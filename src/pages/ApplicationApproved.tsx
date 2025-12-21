import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Mail, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { triggerSupportChat } from '@/contexts/SupportChatContext';
import { ScrollArea } from "@/components/ui/scroll-area";

const ApplicationApproved = () => {
  return (
    // <ScrollArea className="h-screen w-full">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-success/10 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl">Congratulations!</CardTitle>
            <CardDescription>
              Your writer application has been approved
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-success">Application Approved</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your qualifications and documents have been verified successfully
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-warning">Activation Deposit Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    To activate your account and start bidding on orders, an activation deposit is required. 
                    This helps maintain the quality of our platform and ensures commitment from our writers.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Next Steps:</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2 flex-shrink-0">1.</span>
                  <span>Contact our support team to receive payment details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 flex-shrink-0">2.</span>
                  <span>Complete the activation deposit payment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 flex-shrink-0">3.</span>
                  <span>Your account will be activated within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 flex-shrink-0">4.</span>
                  <span>Start browsing and bidding on available orders</span>
                </li>
              </ul>
            </div>

            <div
              className="flex items-center justify-center gap-3 cursor-pointer"
              onClick={triggerSupportChat}
            >
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium text-center">
                Contact Support
              </p>
            </div>

            {/*<div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => triggerSupportChat()}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>*/}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Questions? Email us at{" "}
                <a href="mailto:support@academichub.com" className="text-primary hover:underline">
                  support@academichub.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    // </ScrollArea>
  );
};

export default ApplicationApproved;
