// components/admin/dashboard-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Users, Trophy, Calendar, Clock } from "lucide-react";

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    completedMatches: 0,
    upcomingMatches: 0,
    activePlayers: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClientComponentClient();

      // Fetch teams count
      const { count: teamsCount } = await supabase
        .from("teams")
        .select("*", { count: "exact" });

      // Fetch completed matches
      const { count: completedCount } = await supabase
        .from("matches")
        .select("*", { count: "exact" })
        .eq("is_completed", true);

      // Fetch upcoming matches
      const { count: upcomingCount } = await supabase
        .from("matches")
        .select("*", { count: "exact" })
        .eq("is_completed", false);

      // Fetch active players
      const { count: playersCount } = await supabase
        .from("players")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      setStats({
        totalTeams: teamsCount || 0,
        completedMatches: completedCount || 0,
        upcomingMatches: upcomingCount || 0,
        activePlayers: playersCount || 0,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTeams}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed Matches
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedMatches}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Matches
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingMatches}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Players</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activePlayers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
