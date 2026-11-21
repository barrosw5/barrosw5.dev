import type { ReactNode } from "react";

import { AdminGate } from "@/components/AdminGate";
import { AdminShell } from "@/components/AdminShell";

// Every page in (panel) is private. The login sits outside this group, so it
// doesn't need a session to open.
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
