import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppProvider } from "@/components/shared/app-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's membership and organization
  const { data: membership } = await supabase
    .from("memberships")
    .select("*, organizations(*)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!membership?.organizations) redirect("/create-organization");

  // Fetch properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .is("deleted_at", null)
    .order("created_at");

  if (!properties?.length) redirect("/add-property");

  const org = membership.organizations as unknown as import("@/lib/types").Organization;

  return (
    <AppProvider
      organization={org}
      membership={membership}
      properties={properties}
    >
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header userEmail={user.email} />
          <main className="flex-1 overflow-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
