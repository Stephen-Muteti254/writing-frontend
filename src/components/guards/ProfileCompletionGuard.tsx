import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileCompletion } from "@/contexts/ProfileCompletionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCog } from "lucide-react";

const ProfileCompletionGuard = () => {
  const { user, isLoading } = useAuth();
  const { isOpen, openWizard } = useProfileCompletion();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "writer") return;
    if (user.profile_completion?.is_complete) return;
    if (isOpen) return;

    openWizard();
    }, [
      user?.id,
      user?.role,
      user?.profile_completion?.is_complete,
      isOpen,
      openWizard
    ]);

  if (isLoading) return null;
  if (!user) return null;

  if (!user.profile_completion?.is_complete) {
    return (
      <div className="flex items-center justify-center min-h-full p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <UserCog className="mx-auto h-10 w-10 text-primary mb-3" />
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Finish setting up your profile to unlock available orders.
            </p>
            <Button className="w-full" onClick={() => openWizard()}>
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default ProfileCompletionGuard;
