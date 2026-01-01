import { useAuth } from "@/contexts/AuthContext";
import { useProfileCompletion } from "@/contexts/ProfileCompletionContext";
import { ProfileCompletionWizard } from "./ProfileCompletionWizard";
import api from "@/lib/api";

export default function ProfileCompletionController() {
  const { user, refreshUser } = useAuth();
  const { isOpen, closeWizard, initialData } = useProfileCompletion();

  const handleComplete = async (data) => {
    await api.completeWriterProfile(data);
    await refreshUser();
    closeWizard();
  };

  return (
    <ProfileCompletionWizard
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) closeWizard();
      }}
      initialData={initialData}
      onComplete={handleComplete}
    />
  );
}
