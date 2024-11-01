"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "./create-user-dialog";
import { Plus } from "lucide-react";

export function CreateUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add User
      </Button>
      <CreateUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
