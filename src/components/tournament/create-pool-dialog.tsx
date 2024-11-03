// components/tournament/create-pools-dialog.tsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreatePoolsDialogProps {
  tournamentId: number;
  numberOfGroups: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PoolInput {
  name: string;
}

export function CreatePoolsDialog({
  tournamentId,
  numberOfGroups,
  open,
  onOpenChange,
  onSuccess,
}: CreatePoolsDialogProps) {
  const [pools, setPools] = useState<PoolInput[]>(() =>
    Array.from({ length: numberOfGroups }, (_, i) => ({
      name: String.fromCharCode(65 + i), // Default names: A, B, C, etc.
    }))
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  function updatePoolName(index: number, name: string) {
    setPools((current) =>
      current.map((pool, i) => (i === index ? { ...pool, name } : pool))
    );
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const poolsData = pools.map((pool) => ({
        tournament_id: tournamentId,
        pool_name: pool.name,
        stage: "PRELIMINARY",
      }));

      const { error } = await supabase.from("pools").insert(poolsData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pools created successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating pools:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create pools",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pools</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {pools.map((pool, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                value={pool.name}
                onChange={(e) => updatePoolName(index, e.target.value)}
                placeholder={`Pool ${index + 1}`}
              />
            </div>
          ))}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Pools"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
