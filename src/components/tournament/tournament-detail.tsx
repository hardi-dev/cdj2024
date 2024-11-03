// components/tournament/tournament-detail.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Calendar, Trophy } from "lucide-react";
import { PoolDisplay } from './pool-display';
import { ScheduleGenerator } from './scheduler';

interface Tournament {
  tournament_id: number;
  name: string;
  tournament_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  number_of_groups?: number;
  teams_per_group?: number;
  teams_to_playoff?: number;
  playoff_type?: string;
  use_seeding: boolean;
}

export function TournamentDetail({ tournamentId }: { tournamentId: number }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [statusCount, setStatusCount] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTournament();
    console.log("tournamentId", tournamentId);
    if (tournamentId) {
      getMatchStatusCounts(tournamentId);
      console.log("masuk");
    }
  }, [tournamentId]);

  async function fetchTournament() {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("tournament_id", tournamentId)
        .single();

      if (error) throw error;

      setTournament(data);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tournament details",
      });
    } finally {
      setLoading(false);
    }
  }

  async function getMatchStatusCounts(tournamentId) {
    const { data, error } = await supabase
      .from("matches")
      .select("status")
      .eq("tournament_id", tournamentId);

    if (error) {
      console.error("Error fetching matches:", error);
      return null;
    }

    // Initialize status counts with all possible statuses set to 0
    const possibleStatuses = [
      "SCHEDULED",
      "COMPLETED",
      "CANCELLED",
      "IN_PROGRESS",
    ]; // Adjust based on your actual status values
    const statusCounts = possibleStatuses.reduce((acc, status) => {
      acc[status] = 0; // Set initial count to 0
      return acc;
    }, {});

    // Count occurrences of each status from the fetched data
    data.forEach((match) => {
      if (statusCounts.hasOwnProperty(match.status)) {
        statusCounts[match.status] += 1; // Increment the count
      }
    });

    setStatusCount(statusCounts);
  }


  if (loading) return <div>Loading...</div>;
  if (!tournament) return <div>Tournament not found</div>;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {tournament.name}
          </h2>
          <p className="text-muted-foreground">
            {tournament.tournament_type.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusCount).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{status}</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          {tournament.tournament_type === "LEAGUE" && (
            <TabsTrigger value="standings">
              <Trophy className="h-4 w-4 mr-2" />
              Standings
            </TabsTrigger>
          )}
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          {tournament.tournament_type === "LEAGUE" ? (
            <PoolDisplay
              tournamentId={tournament.tournament_id}
              numberOfGroups={tournament.number_of_groups}
              teamsPerGroup={tournament.teams_per_group}
            />
          ) : // <BracketAssignment /> // Akan kita buat nanti
          null}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleGenerator tournamentId={tournament.tournament_id} />
        </TabsContent>

        {tournament.tournament_type === "LEAGUE" && (
          <TabsContent value="standings" className="space-y-4">
            {/* Standings Component akan kita buat */}
            <div>Standings component will go here</div>
          </TabsContent>
        )}

        <TabsContent value="settings" className="space-y-4">
          {/* Settings Component akan kita buat */}
          <div>Settings component will go here</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
