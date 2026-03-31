import Link from "next/link";
import { Dumbbell, LayoutDashboard, List, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: List },
  { href: "/sessions/new", label: "New Session", icon: PlusCircle },
  { href: "/exercises", label: "Exercises", icon: Dumbbell }
];

export function AppShell({
  children,
  pathname
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/80 bg-background/70 backdrop-blur">
        <div className="container flex items-center justify-between gap-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Liftlytics</div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Strength Journal</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
