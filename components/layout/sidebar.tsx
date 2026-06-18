"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardPen, Database, Home, Shield, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/app-config";

const links = [
  { href: "/", label: "Início", icon: Home },
  {
    href: "/players",
    label: "Análise de Jogadores",
    icon: BarChart3,
    children: [
      { href: "/players/total-competition", label: "Totais por Competição" },
      { href: "/players/total-all-matchdays", label: "Totais (Todas as Jornadas)" },
      { href: "/players/single-matchday", label: "Por Jornada" },
      { href: "/players/evolution", label: "Evolução" },
      { href: "/players/comparison-matchdays", label: "Comparação por Jornada" },
      { href: "/players/comparison-total", label: "Comparação Geral" },
      { href: "/players/action-profile", label: "Perfil de Ações" },
    ],
  },
  {
    href: "/teams",
    label: "Análise de Equipas",
    icon: BarChart3,
    children: [
      { href: "/teams/total-all-matchdays", label: "Totais (Todas as Jornadas)" },
      { href: "/teams/single-matchday", label: "Por Jornada" },
      { href: "/teams/evolution", label: "Evolução" },
    ],
  },
  { href: "/admin", label: "Administração", icon: Shield },
  { href: "/admin/seasons", label: "Épocas", icon: Database },
  { href: "/admin/competitions", label: "Competições", icon: Database },
  { href: "/admin/teams", label: "Equipas", icon: Users },
  { href: "/admin/players", label: "Jogadores", icon: Users },
  { href: "/admin/matches", label: "Jogos", icon: ClipboardPen },
  { href: "/admin/stats", label: "Registar Ações", icon: ClipboardPen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border/60 bg-card/60 backdrop-blur md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 border-b border-border/60 p-4">
        <img
          src="/favicon.ico"
          alt=""
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-md border border-border/70 bg-background object-contain"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-wide text-cyan-300">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">Gestão e análise estatística</p>
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

                <div className="grid gap-1 pl-4 md:pl-9">
                  {children.map((child) => {
                    const childIsActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          childIsActive
                            ? "bg-secondary/15 text-secondary ring-1 ring-secondary/40"
                            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        <span className="truncate">{child.label}</span>
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
