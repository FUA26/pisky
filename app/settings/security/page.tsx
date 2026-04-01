import { Suspense } from "react";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { SessionList } from "@/components/profile/session-list";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold">Change Password</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <PasswordChangeForm />
        </Suspense>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-bold">Active Sessions</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <SessionList />
        </Suspense>
      </div>
    </div>
  );
}
