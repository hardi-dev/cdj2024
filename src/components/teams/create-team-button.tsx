// components/teams/create-team-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateTeamDialog } from "./create-team-dialog";
import { Plus } from "lucide-react";

export function CreateTeamButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Team
      </Button>
      <CreateTeamDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
