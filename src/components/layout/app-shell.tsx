"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, List, PlusCircle } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: List },
  { href: "/sessions/new", label: "New Session", icon: PlusCircle },
  { href: "/exercises", label: "Exercises", icon: Dumbbell }
];

function getActiveNavHref(pathname: string) {
  return navItems
    .filter((item) => {
      if (item.href === "/") {
        return pathname === "/";
      }

      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function AppShell({
  children,
  pathname: initialPathname
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const clientPathname = usePathname();
  const pathname = clientPathname ?? initialPathname;
  const activeNavHref = getActiveNavHref(pathname);
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen">
      {!isLoginPage && (
        <header className="border-b border-border/80 bg-background/70 backdrop-blur">
          <div className="container flex items-center justify-between gap-4 py-3 md:gap-6 md:py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary md:h-11 md:w-11">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">Liftlytics</div>
                <div className="hidden text-xs uppercase tracking-[0.24em] text-muted-foreground md:block">
                  Workout <span aria-hidden="true">&middot;</span> Journal <span aria-hidden="true">&middot;</span> Analytics
                </div>
              </div>
            </Link>
            <div className="flex items-center md:hidden">
              <LogoutButton />
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <nav className="flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeNavHref === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                        active && "bg-muted text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      <main className={cn("container py-5 md:py-8", !isLoginPage && "pb-32 md:pb-8")}>{children}</main>
      {!isLoginPage && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur md:hidden">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNavHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground transition",
                    active && "bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
