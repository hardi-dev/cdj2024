// components/tournament/add-teams-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Team {
  team_id: number;
  team_name: string;
}

interface Pool {
  pool_id: number;
  pool_name: string;
  teams: any[];
}

interface AddTeamsDialogProps {
  tournamentId: number;
  pool: Pool | null;
  teamsPerGroup: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTeamsDialog({
  tournamentId,
  pool,
  teamsPerGroup,
  open,
  onOpenChange,
  onSuccess,
}: AddTeamsDialogProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (open && pool) {
      fetchAvailableTeams();
    } else {
      setSelectedTeams([]);
      setSearchTerm("");
    }
  }, [open, pool]);

  async function fetchAvailableTeams() {
    try {
      setLoading(true);

      // Get all teams already assigned to any pool in this tournament
      const { data: assignedTeams, error: assignedError } = await supabase
        .from("pool_teams")
        .select("team_id")

      if (assignedError) throw assignedError;

      // Get all teams except those already assigned
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("team_id, team_name")
        .order("team_name");

      if (teamsError) throw teamsError;

      const assignedTeamIds = new Set(
        assignedTeams?.map((t) => t.team_id) || []
      );
      const availableTeams = teams.filter(
        (team) => !assignedTeamIds.has(team.team_id)
      );

      setTeams(availableTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch available teams",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!pool) return;

    const availableSlots = teamsPerGroup - pool.teams.length;
    if (selectedTeams.length > availableSlots) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Can only add ${availableSlots} more teams to this pool`,
      });
      return;
    }

    try {
      setSaving(true);

      const poolTeams = selectedTeams.map((teamId) => ({
        pool_id: pool.pool_id,
        team_id: teamId,
        wins: 0,
        losses: 0,
        runs_for: 0,
        runs_against: 0,
      }));

      const { error } = await supabase.from("pool_teams").insert(poolTeams);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teams added successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add teams",
      });
    } finally {
      setSaving(false);
    }
  }

  const filteredTeams = teams.filter((team) =>
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Teams to Pool {pool?.pool_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Teams Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Team Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    Loading teams...
                  </TableCell>
                </TableRow>
              ) : filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    No teams found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeams.map((team) => (
                  <TableRow key={team.team_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTeams.includes(team.team_id)}
                        onCheckedChange={(checked) => {
                          setSelectedTeams((current) =>
                            checked
                              ? [...current, team.team_id]
                              : current.filter((id) => id !== team.team_id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{team.team_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || selectedTeams.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Add Selected Teams (${selectedTeams.length})`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
