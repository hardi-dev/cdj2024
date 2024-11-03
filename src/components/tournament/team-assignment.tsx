// components/tournament/team-assignment.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Team {
  team_id: number;
  team_name: string;
}

interface Pool {
  pool_id: number;
  pool_name: string;
  tournament_id: number;
  teams: Team[];
}

interface TeamAssignmentProps {
  tournamentId: number;
  numberOfGroups: number;
  teamsPerGroup: number;
}

export function TeamAssignment({
  tournamentId,
  numberOfGroups,
  teamsPerGroup,
}: TeamAssignmentProps) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [unassignedTeams, setUnassignedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  
  async function assignTeam(teamId: number, poolId: number) {
    try {
      const pool = pools.find((p) => p.pool_id === poolId);
      if (!pool) return;

      // Check if pool is full
      if (pool.teams.length >= teamsPerGroup) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Pool ${pool.pool_name} is already full`,
        });
        return;
      }

      const { error } = await supabase.from("pool_teams").insert([
        {
          pool_id: poolId,
          team_id: teamId,
          wins: 0,
          losses: 0,
          runs_for: 0,
          runs_against: 0,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team assigned successfully",
      });

      fetchData();
    } catch (error) {
      console.error("Error assigning team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign team",
      });
    }
  }

  async function removeTeam(teamId: number, poolId: number) {
    try {
      const { error } = await supabase
        .from("pool_teams")
        .delete()
        .eq("team_id", teamId)
        .eq("pool_id", poolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team removed successfully",
      });

      fetchData();
    } catch (error) {
      console.error("Error removing team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team",
      });
    }
  }

  // Fungsi untuk fetch data tetap sama
  async function fetchData() {
    try {
      const { data: poolsData, error: poolsError } = await supabase
        .from("pools")
        .select(
          `
        pool_id,
        pool_name,
        tournament_id,
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

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("team_id, team_name")
        .order("team_name");

      if (teamsError) throw teamsError;

      const processedPools =
        poolsData?.map((pool) => ({
          pool_id: pool.pool_id,
          pool_name: pool.pool_name,
          tournament_id: pool.tournament_id,
          teams: (pool.pool_teams || []).map((pt) => ({
            team_id: pt.teams.team_id,
            team_name: pt.teams.team_name,
          })),
        })) || [];

      const assignedTeamIds = new Set(
        poolsData?.flatMap((pool) =>
          (pool.pool_teams || []).map((pt) => pt.team_id)
        ) || []
      );

      const unassigned = teamsData.filter(
        (team) => !assignedTeamIds.has(team.team_id)
      );

      setPools(processedPools);
      setUnassignedTeams(unassigned);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  }

  // Initialize pools jika belum ada
  async function initializePools() {
    try {
      setLoading(true);

      // Cek apakah sudah ada pools
      const { data: existingPools, error: checkError } = await supabase
        .from("pools")
        .select("pool_id")
        .eq("tournament_id", tournamentId);

      if (checkError) throw checkError;

      // Jika belum ada pools, buat sesuai number_of_groups
      if (!existingPools || existingPools.length === 0) {
        const pools = Array.from({ length: numberOfGroups }, (_, i) => ({
          tournament_id: tournamentId,
          pool_name: String.fromCharCode(65 + i), // A, B, C, dst
          stage: "PRELIMINARY",
        }));

        const { error: insertError } = await supabase
          .from("pools")
          .insert(pools);

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Pools created successfully",
        });
      }

      // Fetch data setelah memastikan pools ada
      await fetchData();
    } catch (error) {
      console.error("Error initializing pools:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize pools",
      });
      setLoading(false);
    }
  }

  // Panggil initializePools saat komponen dimuat
  useEffect(() => {
    initializePools();
  }, [tournamentId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Unassigned Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Assign To Pool</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassignedTeams.map((team) => (
                <TableRow key={team.team_id}>
                  <TableCell>{team.team_name}</TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) =>
                        assignTeam(team.team_id, parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pool" />
                      </SelectTrigger>
                      <SelectContent>
                        {pools.map((pool) => (
                          <SelectItem
                            key={pool.pool_id}
                            value={pool.pool_id.toString()}
                            disabled={pool.teams.length >= teamsPerGroup}
                          >
                            Pool {pool.pool_name}({pool.teams.length}/
                            {teamsPerGroup})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {unassignedTeams.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No unassigned teams
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pools.map((pool) => (
          <Card key={pool.pool_id}>
            <CardHeader>
              <CardTitle>Pool {pool.pool_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pool.teams.map((team) => (
                  <div
                    key={team.team_id}
                    className="flex items-center justify-between p-2 bg-secondary rounded"
                  >
                    <span>{team.team_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(team.team_id, pool.pool_id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {pool.teams.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No teams assigned
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
