import { Outlet } from "react-router-dom";
import { ProfileCompletionProvider } from "@/contexts/ProfileCompletionContext";
import ProfileCompletionController from "@/components/profile/ProfileCompletionController";

export default function WriterProfileCompletionLayout() {
  return (
    <ProfileCompletionProvider>
      <ProfileCompletionController />
      <Outlet />
    </ProfileCompletionProvider>
  );
}
