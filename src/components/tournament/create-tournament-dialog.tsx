// components/tournament/create-tournament-dialog.tsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const formSchema = z
  .object({
    name: z.string().min(1, "Tournament name is required"),
    tournamentType: z.enum([
      "LEAGUE",
      "SINGLE_ELIMINATION",
      "DOUBLE_ELIMINATION",
    ]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    // League fields
    numberOfGroups: z.number().min(1).optional(),
    teamsPerGroup: z.number().min(2).optional(),
    // Playoff fields
    hasPlayoff: z.boolean().default(false),
    teamsToPlayoff: z.number().min(2).optional(),
    playoffType: z
      .enum(["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION"])
      .optional(),
    useSeeding: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.tournamentType === "LEAGUE") {
        const isValid =
          data.numberOfGroups != null && data.teamsPerGroup != null;

        if (data.hasPlayoff) {
          return (
            isValid &&
            data.teamsToPlayoff != null &&
            data.playoffType != null &&
            // Validasi jumlah tim yang lolos playoff tidak lebih dari total tim
            data.teamsToPlayoff <= data.numberOfGroups * data.teamsPerGroup
          );
        }

        return isValid;
      }
      return true;
    },
    {
      message: "Invalid tournament configuration",
    }
  );

export function CreateTournamentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tournamentType: "LEAGUE",
      hasPlayoff: false,
      useSeeding: false,
    },
  });

  const tournamentType = form.watch("tournamentType");
  const hasPlayoff = form.watch("hasPlayoff");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      const { error } = await supabase.from("tournaments").insert([
        {
          name: values.name,
          tournament_type: values.tournamentType,
          start_date: values.startDate,
          end_date: values.endDate,
          number_of_groups: values.numberOfGroups,
          teams_per_group: values.teamsPerGroup,
          has_playoff: values.hasPlayoff,
          teams_to_playoff: values.teamsToPlayoff,
          playoff_type: values.playoffType,
          use_seeding: values.useSeeding,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tournament created successfully",
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create tournament",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tournament Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tournament Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter tournament name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tournament Type */}
            <FormField
              control={form.control}
              name="tournamentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tournament Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tournament type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LEAGUE">League</SelectItem>
                      <SelectItem value="SINGLE_ELIMINATION">
                        Single Elimination
                      </SelectItem>
                      <SelectItem value="DOUBLE_ELIMINATION">
                        Double Elimination
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* League specific fields */}
            {tournamentType === "LEAGUE" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numberOfGroups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Groups</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teamsPerGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teams per Group</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Playoff toggle */}
                <FormField
                  control={form.control}
                  name="hasPlayoff"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Playoff
                        </FormLabel>
                        <FormDescription>
                          Add playoff stage after league matches
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Playoff specific fields */}
                {hasPlayoff && (
                  <>
                    <FormField
                      control={form.control}
                      name="teamsToPlayoff"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teams to Playoff</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="playoffType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Playoff Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select playoff type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SINGLE_ELIMINATION">
                                Single Elimination
                              </SelectItem>
                              <SelectItem value="DOUBLE_ELIMINATION">
                                Double Elimination
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            )}

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
                    Creating...
                  </>
                ) : (
                  "Create Tournament"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
