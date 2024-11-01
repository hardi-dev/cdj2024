// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  ClipboardList,
  UserCog,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const routes = {
    ADMIN: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/admin",
        pattern: /^\/dashboard\/admin$/,
      },
      {
        label: "Teams",
        icon: Users,
        href: "/dashboard/admin/teams",
        pattern: /^\/dashboard\/admin\/teams/,
      },
      {
        label: "Schedule",
        icon: Calendar,
        href: "/dashboard/admin/schedule",
        pattern: /^\/dashboard\/admin\/schedule/,
      },
      {
        label: "Tournament",
        icon: Trophy,
        href: "/dashboard/admin/tournament",
        pattern: /^\/dashboard\/admin\/tournament/,
      },
      {
        label: "Reports",
        icon: ClipboardList,
        href: "/dashboard/admin/reports",
        pattern: /^\/dashboard\/admin\/reports/,
      },
      {
        label: "Users",
        icon: UserCog,
        href: "/dashboard/admin/users",
        pattern: /^\/dashboard\/admin\/users/,
      },
    ],
    // Add routes for other roles (SCORER, TEAM_MANAGER) here
  };

  const roleRoutes = routes[user?.role as keyof typeof routes] || [];

  return (
    <div className="flex flex-col w-64 bg-white border-r min-h-screen p-4">
      <div className="space-y-1">
        {roleRoutes.map((route) => (
          <Link key={route.href} href={route.href} className="w-full">
            <Button
              variant={route.pattern.test(pathname) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start space-x-2",
                route.pattern.test(pathname) && "bg-secondary"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
