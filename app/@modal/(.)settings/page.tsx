"use client";

import { useRouter } from "next/navigation";
import { SettingsModal } from "@/components/settings-modal";

/* Intercepts /settings during client-side navigation: the modal overlays the
 * chat behind it (which stays mounted), and closing returns to where you were. */
export default function InterceptedSettings() {
  const router = useRouter();
  return <SettingsModal onClose={() => router.back()} />;
}
