import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCog, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "react-router-dom";

interface ProfileCompletionGuardProps {
  children: ReactNode;
  onOpenProfile?: () => void;
}

const ProfileCompletionGuard = ({ children, onOpenProfile }: ProfileCompletionGuardProps) => {

  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const needsCompletion = user.account_status === "paid_initial_deposit" || user.application_status === "paid_initial_deposit";
  if (!needsCompletion) return <Outlet />;

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="max-w-lg w-full border-info/30 bg-gradient-to-br from-info/5 via-background to-info/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-info/10 w-fit">
            <UserCog className="h-12 w-12 text-info" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-info/30 bg-info/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-base">
              Initial deposit received. Complete your profile to access available orders.
            </AlertDescription>
          </Alert>

          <Button className="w-full" size="lg" onClick={onOpenProfile}>
            Complete Profile Setup
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletionGuard;
