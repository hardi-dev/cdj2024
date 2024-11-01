// components/admin/quick-actions.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserPlus,
  Users,
  CalendarPlus,
  Trophy,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Add Team",
      description: "Register a new team",
      icon: UserPlus,
      href: "/dashboard/admin/teams/new",
    },
    {
      title: "Manage Teams",
      description: "View and edit teams",
      icon: Users,
      href: "/dashboard/admin/teams",
    },
    {
      title: "Schedule Match",
      description: "Create new match",
      icon: CalendarPlus,
      href: "/dashboard/admin/matches/new",
    },
    {
      title: "Tournament Bracket",
      description: "View and update brackets",
      icon: Trophy,
      href: "/dashboard/admin/brackets",
    },
    {
      title: "Match Reports",
      description: "View match statistics",
      icon: ClipboardList,
      href: "/dashboard/admin/reports",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href} className="block">
            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-start space-x-4"
            >
              <action.icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
  