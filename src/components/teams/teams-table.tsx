// components/teams/teams-table.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditTeamDialog } from "./edit-team-dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

interface Team {
  team_id: number;
  team_name: string;
  manager_name: string;
  contact_number: string;
  email: string;
  created_at: string;
}

export function TeamsTable() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTeams();
  }, []);

  // Dalam fungsi fetchTeams di TeamsTable
  async function fetchTeams() {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teams",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTeam(teamId: number) {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("team_id", teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team",
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.team_id}>
                <TableCell className="font-medium">{team.team_name}</TableCell>
                <TableCell>{team.manager_name}</TableCell>
                <TableCell>{team.contact_number}</TableCell>
                <TableCell>{team.email}</TableCell>
                <TableCell>
                  {new Date(team.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setTeamToEdit(team)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/admin/teams/${team.team_id}/players`}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Manage Players
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteTeam(team.team_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditTeamDialog
        team={teamToEdit}
        open={!!teamToEdit}
        onOpenChange={() => setTeamToEdit(null)}
        onSuccess={fetchTeams}
      />
    </>
  );
}
