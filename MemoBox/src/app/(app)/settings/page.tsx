import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import {
  ImportPanel,
  ProfilePanel,
  ShortcutsPanel,
} from "@/components/settings/settings-panels";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile();

  return (
    <>
      <PageHeader title="Configurações" />
      <div className="space-y-4">
        <ProfilePanel profile={profile} email={user?.email ?? ""} />
        <ImportPanel />
        <ShortcutsPanel />
      </div>
    </>
  );
}
