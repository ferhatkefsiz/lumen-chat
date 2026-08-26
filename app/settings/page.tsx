"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SettingsModal } from "@/components/settings-modal";

/* Direct load / refresh of /settings: render the app behind, with the modal
 * open on top. Closing goes home. */
export default function SettingsPage() {
  const router = useRouter();
  return (
    <>
      <AppShell />
      <Suspense fallback={null}>
        <SettingsModal onClose={() => router.push("/")} />
      </Suspense>
    </>
  );
}
