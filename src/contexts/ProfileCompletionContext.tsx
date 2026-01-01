import { createContext, useContext, useState, useEffect } from "react";
import { WriterProfileData } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileCompletionContextType {
  isOpen: boolean;
  openWizard: (data?: Partial<WriterProfileData>) => void;
  closeWizard: () => void;
  initialData?: Partial<WriterProfileData>;
}

const ProfileCompletionContext =
  createContext<ProfileCompletionContextType | null>(null);

export function ProfileCompletionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth(); // THIS WAS MISSING

  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] =
    useState<Partial<WriterProfileData>>({});
  const [dismissed, setDismissed] = useState(false);

  // Auto-open ONCE when user is incomplete
  useEffect(() => {
    if (
      user &&
      !user.profile_completion?.is_complete &&
      !dismissed
    ) {
      setIsOpen(true);
    }
  }, [user, dismissed]);

  const closeWizard = () => {
    setDismissed(true);
    setIsOpen(false);
  };

  const openWizard = (data?: Partial<WriterProfileData>) => {
    if (data) setInitialData(data);
    setDismissed(false); // allow reopening manually
    setIsOpen(true);
  };

  return (
    <ProfileCompletionContext.Provider
      value={{ isOpen, openWizard, closeWizard, initialData }}
    >
      {children}
    </ProfileCompletionContext.Provider>
  );
}

export function useProfileCompletion() {
  const ctx = useContext(ProfileCompletionContext);
  if (!ctx) {
    throw new Error(
      "useProfileCompletion must be used within ProfileCompletionProvider"
    );
  }
  return ctx;
}
