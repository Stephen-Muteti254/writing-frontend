// ApplicationRejected.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle, Mail } from "lucide-react";

const ApplicationRejected = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-destructive/10 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Update</CardTitle>
          <CardDescription>
            Thank you for your interest in becoming a writer on AcademicHub.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            After careful review, we’re unable to proceed with your application at this time.
          </p>

          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 mt-0.5" />
            <p>
              You’ll find feedback and further details in the email we sent you.
            </p>
          </div>

          <p>
            You may reapply in the future if your qualifications change.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationRejected;
