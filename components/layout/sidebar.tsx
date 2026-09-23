"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardPen, Database, Home, Link2, Shield, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/app-config";

const links = [
  { href: "/", label: "Home", icon: Home },
  {
    href: "/players",
    label: "Player Analysis",
    icon: BarChart3,
    children: [
      {
        href: "/players/total-competition",
        label: "Players Comparison – Total Actions",
        description: "Ranks players by action efficiency across all matches in the competition.",
      },
      {
        href: "/players/total-all-matchdays",
        label: "Player Total Actions",
        description: "Evaluates the player's total actions across all matches.",
      },
      {
        href: "/players/single-matchday",
        label: "Player Actions by Match",
        description: "Evaluates the players' actions in a specific match.",
      },
      {
        href: "/players/evolution",
        label: "Player Actions Evolution",
        description: "Shows the player's action evolution from matchday to matchday.",
      },
      {
        href: "/players/comparison-matchdays",
        label: "Players Comparison – by Match",
        description: "Ranks players by action efficiency in a specific match.",
      },
      {
        href: "/players/comparison-total",
        label: "Filter Comparison",
        description: "Compares selected players action by action.",
      },
    ],
  },
  {
    href: "/teams",
    label: "Team Analysis",
    icon: BarChart3,
    children: [
      {
        href: "/teams/total-all-matchdays",
        label: "Team Evaluation Actions – All Matches",
        description: "Evaluates team action efficiency across all matches.",
      },
      {
        href: "/teams/single-matchday",
        label: "Team Actions by Match",
        description: "Evaluates team action efficiency in a selected match.",
      },
      {
        href: "/teams/evolution",
        label: "Team Actions Evolution",
        description: "Shows team action evolution from matchday to matchday.",
      },
    ],
  },
  { href: "/admin", label: "Administration", icon: Shield },
  { href: "/admin/seasons", label: "Seasons", icon: Database },
  { href: "/admin/competitions", label: "Competitions", icon: Database },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/matches", label: "Matches", icon: ClipboardPen },
  { href: "/admin/stats", label: "Enter Statistics", icon: ClipboardPen },
  { href: "/admin/integrations", label: "Integrations", icon: Link2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-border/60 bg-card/60 backdrop-blur md:sticky md:top-0 md:h-screen md:w-72 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 border-b border-border/60 p-4">
        <img
          src="/favicon.ico"
          alt=""
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-md border border-border/70 bg-background object-contain"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-wide text-cyan-300">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">Management and performance analysis</p>
        </div>
      </div>
      <nav className="grid grid-cols-2 gap-1 p-2 md:grid-cols-1">
        {links.map(({ href, label, icon: Icon, children }) => {
          const childActive = children?.some((child) => pathname === child.href) ?? false;
          const active =
            childActive || pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

          if (children?.length) {
            return (
              <div key={href} className="col-span-2 space-y-1 md:col-span-1">
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/50"
                      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{label}</span>
                </Link>

                <div className="grid gap-1 pl-3 md:pl-7">
                  {children.map((child) => {
                    const childIsActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        title={"description" in child ? child.description : undefined}
                        className={cn(
                          "flex min-h-9 items-start gap-2 rounded-lg px-3 py-2 text-sm leading-5 transition-colors",
                          childIsActive
                            ? "bg-secondary/15 text-secondary ring-1 ring-secondary/40"
                            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                        )}
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
                        <span className="min-w-0 break-words">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/50"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
