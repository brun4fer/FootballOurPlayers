import { requireAdminAccess } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAccess();
  return children;
}
