// app/dashboard/admin/teams/page.tsx
import { TeamsTable } from "@/components/teams/teams-table";
import { CreateTeamButton } from "@/components/teams/create-team-button";
import { Separator } from "@/components/ui/separator";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">
            Manage tournament teams here. You can add, edit, and remove teams.
          </p>
        </div>
        <CreateTeamButton />
      </div>
      <Separator />
      <TeamsTable />
    </div>
  );
}
