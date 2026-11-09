import Link from "next/link";

import { Button } from "@/components/ui/button";

export function GpsAdminTabs({ active }: { active: "matches" | "training" }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant={active === "matches" ? "default" : "outline"}><Link href="/admin/gps/matches">GPS Matches</Link></Button>
      <Button asChild variant={active === "training" ? "default" : "outline"}><Link href="/admin/gps/training">GPS Training</Link></Button>
    </div>
  );
}
