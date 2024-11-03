// components/tournament/create-tournament-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateTournamentDialog } from "./create-tournament-dialog";
import { Plus } from "lucide-react";

export function CreateTournamentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Create Tournament
      </Button>
      <CreateTournamentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
