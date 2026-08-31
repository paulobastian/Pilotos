import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getDashboardCounts,
  getProfile,
  getProjects,
  getTags,
} from "@/lib/queries";
import { AppUIProvider } from "@/components/app/ui-context";
import { TaxonomyProvider } from "@/components/app/taxonomy-context";
import { GlobalHotkeys } from "@/components/app/global-hotkeys";
import { CommandPalette } from "@/components/app/command-palette";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { AddItemDialog } from "@/components/items/add-item-dialog";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [counts, profile, categories, projects, tags] = await Promise.all([
    getDashboardCounts(),
    getProfile(),
    getCategories(),
    getProjects(),
    getTags(),
  ]);

  return (
    <AppUIProvider>
      <TaxonomyProvider value={{ categories, projects, tags }}>
      <div className="flex min-h-dvh">
        <Sidebar counts={counts} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header counts={counts} profile={profile} email={user.email ?? ""} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>

      <GlobalHotkeys />
      <CommandPalette />
      <AddItemDialog
        categories={categories}
        projects={projects}
        tagSuggestions={tags.map((t) => t.name)}
      />
      </TaxonomyProvider>
    </AppUIProvider>
  );
}
