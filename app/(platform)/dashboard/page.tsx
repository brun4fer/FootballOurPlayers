import { redirect } from "next/navigation";

type DashboardIndexPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardIndexPage({ searchParams }: DashboardIndexPageProps) {
  const params = (await searchParams) ?? {};
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
      continue;
    }
    query.append(key, value);
  }

  const suffix = query.toString();
  redirect(suffix ? `/dashboard/jogadores?${suffix}` : "/dashboard/jogadores");
}
