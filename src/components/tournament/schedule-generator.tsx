// components/tournament/schedule-generator.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Pool {
  pool_id: number;
  pool_name: string;
  teams: {
    team_id: number;
    team_name: string;
  }[];
}

interface Match {
  match_id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  field_number: number;
  schedule_time: string | null;
  status: string;
}

interface ScheduleGeneratorProps {
  tournamentId: number;
}

export function ScheduleGenerator({ tournamentId }: ScheduleGeneratorProps) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfirmGenerate, setShowConfirmGenerate] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  async function fetchData() {
    try {
      // Fetch pools and their teams
      const { data: poolsData, error: poolsError } = await supabase
        .from("pools")
        .select(
          `
          pool_id,
          pool_name,
          pool_teams!pool_teams_pool_id_fkey (
            team_id,
            teams (
              team_id,
              team_name
            )
          )
        `
        )
        .eq("tournament_id", tournamentId)
        .order("pool_name");

      if (poolsError) throw poolsError;

      const processedPools =
        poolsData?.map((pool) => ({
          pool_id: pool.pool_id,
          pool_name: pool.pool_name,
          teams: pool.pool_teams.map((pt) => ({
            team_id: pt.teams.team_id,
            team_name: pt.teams.team_name,
          })),
        })) || [];

      setPools(processedPools);

      // Fetch existing matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(
          `
          match_id,
          home_team_id,
          away_team_id,
          home_team:teams!home_team_id(team_name),
          away_team:teams!away_team_id(team_name),
          field_number,
          schedule_time,
          status
        `
        )
        .eq("tournament_id", tournamentId)
        .eq("is_playoff", false)
        .order("match_id");

      if (matchesError) throw matchesError;

      const processedMatches = matchesData.map((match) => ({
        match_id: match.match_id,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        home_team_name: match.home_team.team_name,
        away_team_name: match.away_team.team_name,
        field_number: match.field_number,
        schedule_time: match.schedule_time,
        status: match.status,
      }));

      setMatches(processedMatches);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch schedule data",
      });
    } finally {
      setLoading(false);
    }
  }

  function generatePoolMatches(
    pool: Pool
  ): Array<{ home_team_id: number; away_team_id: number }> {
    const teams = pool.teams;
    const matches = [];
    const currentField = 1;

    // Generate round robin matches
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          home_team_id: teams[i].team_id,
          away_team_id: teams[j].team_id,
        });
      }
    }

    return matches;
  }

  async function handleGenerateSchedule() {
    try {
      setGenerating(true);

      // Delete existing matches
      const { error: deleteError } = await supabase
        .from("matches")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("is_playoff", false);

      if (deleteError) throw deleteError;

      // Generate new matches for each pool
      const allMatches: any[] = [];
      let currentField = 1;

      pools.forEach((pool) => {
        const poolMatches = generatePoolMatches(pool);
        poolMatches.forEach((match) => {
          allMatches.push({
            tournament_id: tournamentId,
            pool_id: pool.pool_id,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            field_number: currentField,
            status: "SCHEDULED",
            is_playoff: false,
            match_order: allMatches.length + 1,
            stage: "PRELIMINARY",
          });
          currentField = currentField === 1 ? 2 : 1; // Alternate between fields
        });
      });

      // Insert new matches
      const { error: insertError } = await supabase
        .from("matches")
        .insert(allMatches);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Schedule generated successfully",
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate schedule",
      });
    } finally {
      setGenerating(false);
      setShowConfirmGenerate(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Generate Schedule Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowConfirmGenerate(true)}
          disabled={generating || pools.length === 0}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Schedule
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmGenerate}
        onOpenChange={setShowConfirmGenerate}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all existing matches and generate a new schedule.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateSchedule}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Matches by Pool */}
      {pools.map((pool) => (
        <Card key={pool.pool_id}>
          <CardHeader>
            <CardTitle>Pool {pool.pool_name} Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Home Team</TableHead>
                  <TableHead>Away Team</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches
                  .filter(
                    (match) =>
                      pool.teams.some(
                        (t) => t.team_id === match.home_team_id
                      ) &&
                      pool.teams.some((t) => t.team_id === match.away_team_id)
                  )
                  .map((match, index) => (
                    <TableRow key={match.match_id}>
                      <TableCell>Match {index + 1}</TableCell>
                      <TableCell>{match.home_team_name}</TableCell>
                      <TableCell>{match.away_team_name}</TableCell>
                      <TableCell>Field {match.field_number}</TableCell>
                      <TableCell>
                        {match.schedule_time
                          ? new Date(match.schedule_time).toLocaleString()
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>{match.status}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
