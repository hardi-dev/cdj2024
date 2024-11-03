// app/dashboard/admin/tournaments/page.tsx
import { TournamentList } from "@/components/tournament/tournament-list";
import { CreateTournamentButton } from "@/components/tournament/create-tournament-button";

export default function TournamentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tournaments</h2>
          <p className="text-muted-foreground">Manage your tournaments here</p>
        </div>
        <CreateTournamentButton />
      </div>
      <TournamentList />
    </div>
  );
}
