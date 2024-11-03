// components/tournament/pool-display.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, UserMinus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTeamsDialog } from "./add-teams-dialog";
import { CreatePoolsDialog } from "./create-pool-dialog";

interface Team {
  team_id: number;
  team_name: string;
  rank: number;
  wins: number;
  losses: number;
  runs_for: number;
  runs_against: number;
}

interface Pool {
  pool_id: number;
  pool_name: string;
  teams: Team[];
}

interface PoolDisplayProps {
  tournamentId: number;
  numberOfGroups: number;
  teamsPerGroup: number;
}

export function PoolDisplay({
  tournamentId,
  numberOfGroups,
  teamsPerGroup,
}: PoolDisplayProps) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showAddTeams, setShowAddTeams] = useState(false);
  const [showCreatePools, setShowCreatePools] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPools();
  }, [tournamentId]);

  async function fetchPools() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pools")
        .select(
          `
          pool_id,
          pool_name,
          pool_teams!pool_teams_pool_id_fkey (
            team_id,
            wins,
            losses,
            runs_for,
            runs_against,
            rank,
            teams (
              team_id,
              team_name
            )
          )
        `
        )
        .eq("tournament_id", tournamentId)
        .order("pool_name");

      if (error) throw error;

      const processedPools =
        data?.map((pool) => ({
          pool_id: pool.pool_id,
          pool_name: pool.pool_name,
          teams: (pool.pool_teams || [])
            .map((pt) => ({
              team_id: pt.team_id,
              team_name: pt.teams.team_name,
              rank: pt.rank || 0,
              wins: pt.wins || 0,
              losses: pt.losses || 0,
              runs_for: pt.runs_for || 0,
              runs_against: pt.runs_against || 0,
            }))
            .sort((a, b) => {
              // Sort by wins first
              if (b.wins !== a.wins) return b.wins - a.wins;
              // If wins are equal, check head to head (to be implemented)
              // If still equal, check run against
              return (
                b.runs_for - b.runs_against - (a.runs_for - a.runs_against)
              );
            }),
        })) || [];

      setPools(processedPools);
    } catch (error) {
      console.error("Error fetching pools:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pools",
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeTeam(poolId: number, teamId: number) {
    try {
      const { error } = await supabase
        .from("pool_teams")
        .delete()
        .eq("pool_id", poolId)
        .eq("team_id", teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team removed successfully",
      });

      fetchPools();
    } catch (error) {
      console.error("Error removing team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team",
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // Render empty state jika belum ada pools
  if (pools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No Pools Created</h3>
        <p className="text-muted-foreground mb-4">
          Start by creating pool groups for this tournament
        </p>
        <Button onClick={() => setShowCreatePools(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Pools
        </Button>

        <CreatePoolsDialog
          tournamentId={tournamentId}
          numberOfGroups={numberOfGroups}
          open={showCreatePools}
          onOpenChange={setShowCreatePools}
          onSuccess={fetchPools}
        />
      </div>
    );
  }

  return (
    <>
      {/* Create Pools Dialog */}
      <CreatePoolsDialog
        tournamentId={tournamentId}
        numberOfGroups={numberOfGroups}
        open={showCreatePools}
        onOpenChange={setShowCreatePools}
        onSuccess={fetchPools}
      />

      {/* Add Teams Dialog */}
      <AddTeamsDialog
        tournamentId={tournamentId}
        pool={selectedPool}
        teamsPerGroup={teamsPerGroup}
        open={showAddTeams}
        onOpenChange={setShowAddTeams}
        onSuccess={fetchPools}
      />

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <Card key={pool.pool_id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pool {pool.pool_name}</CardTitle>
              {pool.teams.length < teamsPerGroup && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPool(pool);
                    setShowAddTeams(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teams ({pool.teams.length}/{teamsPerGroup})
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">W</TableHead>
                    <TableHead className="text-right">L</TableHead>
                    <TableHead className="text-right">RF</TableHead>
                    <TableHead className="text-right">RA</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pool.teams.map((team) => (
                    <TableRow key={team.team_id}>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell className="text-right">{team.wins}</TableCell>
                      <TableCell className="text-right">
                        {team.losses}
                      </TableCell>
                      <TableCell className="text-right">
                        {team.runs_for}
                      </TableCell>
                      <TableCell className="text-right">
                        {team.runs_against}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeam(pool.pool_id, team.team_id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pool.teams.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No teams assigned
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
