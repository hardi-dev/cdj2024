// app/dashboard/admin/tournaments/[id]/page.tsx
import { TournamentDetail } from "@/components/tournament/tournament-detail";

export default function TournamentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TournamentDetail tournamentId={Number(params.id)} />;
}
