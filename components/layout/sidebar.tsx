"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardPen, Database, Home, Shield, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Configurações", icon: Home },
  { href: "/dashboard/jogadores", label: "Consulta de Jogadores", icon: BarChart3 },
  { href: "/dashboard/equipas", label: "Consulta de Equipas", icon: BarChart3 },
  { href: "/admin", label: "Administracao", icon: Shield },
  { href: "/admin/seasons", label: "Epocas", icon: Database },
  { href: "/admin/competitions", label: "Competicoes", icon: Database },
  { href: "/admin/teams", label: "Equipas", icon: Users },
  { href: "/admin/players", label: "Jogadores", icon: Users },
  { href: "/admin/matches", label: "Jogos", icon: ClipboardPen },
  { href: "/admin/stats", label: "Registar ações", icon: ClipboardPen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border/60 bg-card/60 backdrop-blur md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-border/60 p-4">
        <p className="font-semibold tracking-wide text-cyan-300">G.A.P. - Nossos Jogadores</p>
        <p className="text-xs text-muted-foreground">Gestao e analise estatistica</p>
      </div>
      <nav className="grid grid-cols-2 gap-1 p-2 md:grid-cols-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
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
