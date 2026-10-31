import { KeyRound } from "lucide-react";
import type { Metadata } from "next";

import ChangePasswordForm from "@/components/admin/console/change-password-form";
import SectionCard from "@/components/admin/console/section-card";
import TopBar from "@/components/admin/console/top-bar";
import { requireAdmin } from "@/lib/access/require-admin";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <>
      <TopBar title="Settings" />
      <div className="space-y-6 p-4 md:p-6">
        <SectionCard title="Admin password" icon={KeyRound}>
          <div className="space-y-6">
            <p className="text-muted-foreground max-w-prose text-sm">
              Changing it logs you out on every other device. This browser stays
              logged in.
            </p>
            <ChangePasswordForm />
          </div>
        </SectionCard>
      </div>
    </>
  );
}
