"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { SettingsModal } from "@/components/settings-modal";

/* Intercepts /settings during client-side navigation: the modal overlays the
 * chat behind it (which stays mounted), and closing returns to where you were. */
export default function InterceptedSettings() {
  const router = useRouter();
  return (
    <Suspense fallback={null}>
      <SettingsModal onClose={() => router.back()} />
    </Suspense>
  );
}
