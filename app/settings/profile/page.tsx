import { Suspense } from "react";
import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfileSettingsPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Profile</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileForm />
      </Suspense>
    </div>
  );
}
