// components/admin/recent-matches.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function UpcomingMatches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function fetchMatches() {
      const supabase = createClientComponentClient();

      const { data } = await supabase
        .from("matches")
        .select(
          `
          *,
          home_team:teams!home_team_id(team_name),
          away_team:teams!away_team_id(team_name)
        `
        )
        .eq("is_completed", true)
        .order("created_at", { ascending: false })
        .limit(5);

      setMatches(data || []);
    }

    fetchMatches();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Latest completed matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match: any) => (
            <div
              key={match.match_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span>{match.home_team?.team_name}</span>
                  <span className="px-2 font-bold">{match.home_score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{match.away_team?.team_name}</span>
                  <span className="px-2 font-bold">{match.away_score}</span>
                </div>
              </div>
              <Button variant="ghost" className="ml-4">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// components/admin/upcoming-matches.tsx
// Similar structure to RecentMatches but with different query
