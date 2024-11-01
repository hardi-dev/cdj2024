// components/teams/edit-team-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  teamName: z
    .string()
    .min(1, "Team name is required")
    .min(3, "Team name must be at least 3 characters"),
  managerName: z
    .string()
    .min(1, "Manager name is required")
    .min(3, "Manager name must be at least 3 characters"),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .regex(/^[0-9+\-\s()]*$/, "Invalid contact number format"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

interface Team {
  team_id: number;
  team_name: string;
  manager_name: string;
  contact_number: string;
  email: string;
}

interface EditTeamDialogProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTeamDialog({
  team,
  open,
  onOpenChange,
  onSuccess,
}: EditTeamDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      managerName: "",
      contactNumber: "",
      email: "",
    },
  });

  // Update form when team data changes
  useEffect(() => {
    if (team) {
      form.reset({
        teamName: team.team_name,
        managerName: team.manager_name,
        contactNumber: team.contact_number,
        email: team.email,
      });
    }
  }, [team, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!team) return;

    try {
      setLoading(true);

      // Check if team name already exists (excluding current team)
      const { data: existingTeams } = await supabase
        .from("teams")
        .select("team_id")
        .eq("team_name", values.teamName)
        .neq("team_id", team.team_id);

      if (existingTeams && existingTeams.length > 0) {
        form.setError("teamName", {
          type: "manual",
          message: "Team name already exists",
        });
        return;
      }
      // Update team
      const { error } = await supabase
        .from("teams")
        .update({
          team_name: values.teamName,
          manager_name: values.managerName,
          contact_number: values.contactNumber,
          email: values.email,
        })
        .eq("team_id", team.team_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team updated successfully",
      });

      onOpenChange(false);

      // Refresh team list if callback provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update team",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Make changes to team information here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter team name"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter manager name"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter contact number"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
