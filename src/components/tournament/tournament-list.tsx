// components/tournament/tournament-list.tsx
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Tournament {
  tournament_id: number;
  name: string;
  tournament_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTournaments();
  }, []);

  async function fetchTournaments() {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTournaments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tournaments",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tournaments.map((tournament) => (
          <TableRow key={tournament.tournament_id}>
            <TableCell className="font-medium">{tournament.name}</TableCell>
            <TableCell>{tournament.tournament_type}</TableCell>
            <TableCell>
              <Badge>{tournament.status}</Badge>
            </TableCell>
            <TableCell>
              {tournament.start_date
                ? format(new Date(tournament.start_date), "dd MMM yyyy")
                : "-"}
            </TableCell>
            <TableCell>
              {tournament.end_date
                ? format(new Date(tournament.end_date), "dd MMM yyyy")
                : "-"}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                onClick={() =>
                  (window.location.href = `/dashboard/admin/tournament/${tournament.tournament_id}`)
                }
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {tournaments.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No tournaments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
