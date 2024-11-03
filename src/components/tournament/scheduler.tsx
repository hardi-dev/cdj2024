// components/tournament/schedule-generator.tsx
"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Loader2, Calendar as CalendarIcon, Clock, Grid2x2, Undo2, X, GripVertical } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Match {
  match_id: number
  match_order: number
  pool_id: number
  pool_name: string
  home_team_id: number
  away_team_id: number
  home_team_name: string
  away_team_name: string
  field_number: number
  schedule_date: string | null
  schedule_time: string | null
  status: string
}

interface Pool {
  pool_id: number
  pool_name: string
  teams: {
    team_id: number
    team_name: string
  }[]
}

interface BatchUpdate {
  type: 'date' | 'time' | 'field'
  value: any
  matches: Match[]
}

interface ScheduleGeneratorProps {
  tournamentId: number
}

interface TimeSettings {
  startTime: string
  duration: number // dalam menit
  interval: number // dalam menit
}

interface BatchTimePreview {
  match_id: number
  schedule_time: string
  endTime: string
}

const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMinutes
    .toString()
    .padStart(2, "0")}`;
};

export function ScheduleGenerator({ tournamentId }: ScheduleGeneratorProps) {
  // States
  const [pools, setPools] = useState<Pool[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedMatches, setSelectedMatches] = useState<Match[]>([])
  const [selectedPool, setSelectedPool] = useState<string>("all")
  const [showConfirmGenerate, setShowConfirmGenerate] = useState(false)
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [showFieldDialog, setShowFieldDialog] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<BatchUpdate | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedField, setSelectedField] = useState<string>()
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    startTime: "08:00",
    duration: 90,
    interval: 15,
  });
  const [timePreview, setTimePreview] = useState<BatchTimePreview[]>([]);
  const [showTimePreview, setShowTimePreview] = useState(false);

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [tournamentId])

  // Fetch data
  async function fetchData() {
    try {
      setLoading(true)
      // Fetch pools and their teams
      const { data: poolsData, error: poolsError } = await supabase
        .from("pools")
        .select(`
          pool_id,
          pool_name,
          pool_teams!pool_teams_pool_id_fkey (
            team_id,
            teams (
              team_id,
              team_name
            )
          )
        `)
        .eq("tournament_id", tournamentId)
        .order("pool_name")

      if (poolsError) throw poolsError

      const processedPools = poolsData?.map((pool) => ({
        pool_id: pool.pool_id,
        pool_name: pool.pool_name,
        teams: pool.pool_teams.map((pt) => ({
          team_id: pt.teams.team_id,
          team_name: pt.teams.team_name,
        })),
      })) || []

      setPools(processedPools)

      // Fetch existing matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          match_order,
          match_id,
          home_team_id,
          away_team_id,
          home_team:teams!home_team_id(team_name),
          away_team:teams!away_team_id(team_name),
          field_number,
          schedule_date,
          schedule_time,
          status,
          pool:pools!inner(
            pool_id,
            pool_name
          )
        `)
        .eq("tournament_id", tournamentId)
        .eq("is_playoff", false)
        .order("match_order")

      if (matchesError) throw matchesError

      const processedMatches = matchesData.map((match) => ({
        match_order: match.match_order,
        match_id: match.match_id,
        pool_id: match.pool.pool_id,
        pool_name: match.pool.pool_name,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        home_team_name: match.home_team.team_name,
        away_team_name: match.away_team.team_name,
        field_number: match.field_number,
        schedule_date: match.schedule_date,
        schedule_time: match.schedule_time,
        status: match.status,
      }))

      setMatches(processedMatches)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch schedule data",
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate matches
  function generatePoolMatches(pool: Pool): Array<{ home_team_id: number; away_team_id: number }> {
    const teams = pool.teams
    const matches = []

    // Generate round robin matches
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          home_team_id: teams[i].team_id,
          away_team_id: teams[j].team_id,
        })
      }
    }

    return matches
  }

  async function handleGenerateSchedule() {
    try {
      setGenerating(true)

      // Delete existing matches
      const { error: deleteError } = await supabase
        .from("matches")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("is_playoff", false)

      if (deleteError) throw deleteError

      // Generate new matches for each pool
      const allMatches: any[] = []
      let currentField = 1

      pools.forEach((pool) => {
        const poolMatches = generatePoolMatches(pool)
        poolMatches.forEach((match) => {
          allMatches.push({
            tournament_id: tournamentId,
            pool_id: pool.pool_id,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            field_number: currentField,
            status: "SCHEDULED",
            is_playoff: false,
            match_order: allMatches.length + 1,
            stage: "PRELIMINARY",
          })
          currentField = currentField === 1 ? 2 : 1 // Alternate between fields
        })
      })

      // Insert new matches
      const { error: insertError } = await supabase
        .from("matches")
        .insert(allMatches)

      if (insertError) throw insertError

      toast({
        title: "Success",
        description: "Schedule generated successfully",
      })

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error generating schedule:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate schedule",
      })
    } finally {
      setGenerating(false)
      setShowConfirmGenerate(false)
    }
  }

  const createMatchUpdates = (match: Match) => ({
    match_id: match.match_id,
    tournament_id: tournamentId,
    pool_id: match.pool_id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    field_number: match.field_number,
    status: match.status,
    is_playoff: match.is_playoff ?? false,
    match_order: match.match_order,
    stage: match.stage ?? "PRELIMINARY",
  });

  // Batch updates
  const handleBatchDateUpdate = async (date: Date) => {
    try {
      const updates = selectedMatches.map((match) => ({
        ...createMatchUpdates(match),
        schedule_date: date.toISOString().split("T")[0],
      }));

      const { error } = await supabase
        .from("matches")
        .upsert(updates, { onConflict: ["match_id"] });

      if (error) throw error

      // Update local state
      setMatches(current =>
        current.map(match =>
          selectedMatches.includes(match)
            ? { ...match, schedule_date: date.toISOString().split('T')[0] }
            : match
        )
      )

      // Store last update for undo
      setLastUpdate({
        type: 'date',
        value: date,
        matches: selectedMatches
      })

      toast({
        title: "Success",
        description: `Updated date for ${selectedMatches.length} matches`
      })

      setSelectedDate(undefined)

    } catch (error) {
      console.error('Error updating dates:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update dates"
      })
    } finally {
      setShowDateDialog(false)
    }
  }

  const handleBatchFieldUpdate = async (fieldNumber: number) => {
    try {
      const updates = selectedMatches.map((match) => ({
        ...createMatchUpdates(match),
        field_number: fieldNumber,
      }));

      const { error } = await supabase
        .from('matches')
        .upsert(updates)

      if (error) throw error

      // Update local state
      setMatches(current =>
        current.map(match =>
          selectedMatches.includes(match)
            ? { ...match, field_number: fieldNumber }
            : match
        )
      )

      // Store last update for undo
      setLastUpdate({
        type: 'field',
        value: fieldNumber,
        matches: selectedMatches
      })

      toast({
        title: "Success",
        description: `Updated field for ${selectedMatches.length} matches`
      })

      setSelectedField(undefined)

    } catch (error) {
      console.error('Error updating fields:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update fields"
      })
    } finally {
      setShowFieldDialog(false)
    }
  }

  // Undo last batch update
  const handleUndo = async () => {
    if (!lastUpdate) return

    try {
      // Reverse the last update based on its type
      const updates = lastUpdate.matches.map(updatedMatch => {
        const originalMatch = matches.find(m => m.match_id === updatedMatch.match_id)
        return {
          match_id: updatedMatch.match_id,
          [lastUpdate.type === 'date' ? 'schedule_date' :
            lastUpdate.type === 'time' ? 'schedule_time' : 'field_number']:
            originalMatch?.[lastUpdate.type === 'date' ? 'schedule_date' :
              lastUpdate.type === 'time' ? 'schedule_time' : 'field_number']
        }
      })

      const { error } = await supabase
        .from('matches')
        .upsert(updates)

      if (error) throw error

      // Update local state
      fetchData() // Refresh data to ensure consistency

      setLastUpdate(null)
      toast({
        title: "Success",
        description: "Changes undone successfully"
      })

    } catch (error) {
      console.error('Error undoing changes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to undo changes"
      })
    }
  }

  const generateTimePreview = () => {
    let currentTime = timeSettings.startTime;

    const preview = selectedMatches.map((match) => {
      const scheduleTime = currentTime;
      const endTime = addMinutesToTime(currentTime, timeSettings.duration);
      currentTime = addMinutesToTime(endTime, timeSettings.interval);

      return {
        match_id: match.match_id,
        schedule_time: scheduleTime,
        endTime: endTime,
      };
    });

    setTimePreview(preview);
    setShowTimePreview(true);
  };

  const handleBatchTimeUpdate = async () => {
    try {
      const updates = timePreview.map((preview) => {
        const match = matches.find((m) => m.match_id === preview.match_id);
        return {
          ...createMatchUpdates(match!),
          schedule_time: preview.schedule_time,
        };
      });

      const { error } = await supabase.from("matches").upsert(updates);

      if (error) throw error;

      // Update local state
      setMatches((current) =>
        current.map((match) => {
          const preview = timePreview.find(
            (p) => p.match_id === match.match_id
          );
          return preview
            ? { ...match, schedule_time: preview.schedule_time }
            : match;
        })
      );

      // Store last update for undo
      setLastUpdate({
        type: "time",
        value: timeSettings,
        matches: selectedMatches,
      });

      toast({
        title: "Success",
        description: `Updated time for ${selectedMatches.length} matches`,
      });
    } catch (error) {
      console.error("Error updating times:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update times",
      });
    } finally {
      setShowTimeDialog(false);
      setShowTimePreview(false);
    }
  };

  // Drag and drop
  async function handleDragEnd(result: any) {
    if (!result.destination) return;

    const reorderedMatches = Array.from(matches);
    const [movedMatch] = reorderedMatches.splice(result.source.index, 1);
    reorderedMatches.splice(result.destination.index, 0, movedMatch);

    // Update match_order untuk semua matches
    const updatedMatches = reorderedMatches.map((match, index) => ({
      ...match,
      match_order: index + 1
    }));

    setMatches(updatedMatches);
    updateMatchOrder(updatedMatches);
  }


  async function updateMatchOrder(reorderedMatches: Match[]) {
    // Fetch current match data to retain required fields
    const { data: currentMatches, error: fetchError } = await supabase
      .from("matches")
      .select(
        "match_id, match_order, stage, tournament_id, pool_id, home_team_id, away_team_id, field_number, status"
      )
      .in(
        "match_id",
        reorderedMatches.map((match) => match.match_id)
      );

    if (fetchError) {
      console.error("Error fetching current matches:", fetchError);
      return;
    }

    // Prepare updates with all required fields
    const updates = reorderedMatches.map((match, index) => {
      const currentMatch = currentMatches.find(
        (m) => m.match_id === match.match_id
      );
      return {
        ...currentMatch, // Include existing values
        match_order: index + 1, // Update match_order
      };
    });

    const { error } = await supabase      
      .from("matches")
      .upsert(updates, { onConflict: ["match_id"] });

    if (error) {
      console.error("Error updating match order:", error);
    }
  }

  // Filter matches based on selected pool
  const filteredMatches = selectedPool === "all"
    ? matches
    : matches.filter(match => match.pool_id.toString() === selectedPool)

  if (loading) {
    return <div>Loading...</div>
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No Matches Scheduled</h3>
        <p className="text-muted-foreground mb-4">
          Start by generating matches for this tournament to get things
          underway.
        </p>
        <Button
          onClick={() => setShowConfirmGenerate(true)}
          disabled={generating || pools.length === 0}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Generate Schedule
            </>
          )}
        </Button>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={showConfirmGenerate}
          onOpenChange={setShowConfirmGenerate}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate Schedule?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all existing matches and generate a new
                schedule. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGenerateSchedule}>
                Generate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }


return (
  <Card>
    <CardContent className="p-6 space-y-6">
      {/* Header with Filter and Generate Button */}
      <div className="flex items-center justify-between">
        <Select value={selectedPool} onValueChange={setSelectedPool}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by pool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pools</SelectItem>
            {pools.map((pool) => (
              <SelectItem key={pool.pool_id} value={pool.pool_id.toString()}>
                Pool {pool.pool_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Batch Edit Toolbar */}
      {selectedMatches.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedMatches.length} matches selected
          </span>
          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateDialog(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Set Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimeDialog(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Set Time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFieldDialog(true)}
            >
              <Grid2x2 className="h-4 w-4 mr-2" />
              Set Field
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* {lastUpdate && (
              <Button variant="ghost" size="sm" onClick={handleUndo}>
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
            )} */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMatches([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}
      {/* Batch Edit Dialogs */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Date for Selected Matches</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                selectedDate && handleBatchDateUpdate(selectedDate)
              }
              disabled={!selectedDate}
            >
              Apply to {selectedMatches.length} matches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Field for Selected Matches</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Field 1</SelectItem>
                <SelectItem value="2">Field 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                selectedField && handleBatchFieldUpdate(parseInt(selectedField))
              }
              disabled={!selectedField}
            >
              Apply to {selectedMatches.length} matches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Time for Selected Matches</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Time</Label>
              <Input
                type="time"
                className="w-full"
                value={timeSettings.startTime}
                onChange={(e) =>
                  setTimeSettings({
                    ...timeSettings,
                    startTime: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Match Duration (minutes)
              </Label>
              <Input
                type="number"
                className="w-full"
                min={1}
                value={timeSettings.duration}
                onChange={(e) =>
                  setTimeSettings({
                    ...timeSettings,
                    duration: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Interval Between Matches (minutes)
              </Label>
              <Input
                type="number"
                className="w-full"
                min={0}
                value={timeSettings.interval}
                onChange={(e) =>
                  setTimeSettings({
                    ...timeSettings,
                    interval: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                generateTimePreview();
                setShowTimeDialog(false);
              }}
            >
              Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimePreview} onOpenChange={setShowTimePreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Time Schedule Preview</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timePreview.map((preview, index) => {
                  const match = matches.find(
                    (m) => m.match_id === preview.match_id
                  )!;
                  return (
                    <TableRow key={preview.match_id}>
                      <TableCell>Pool {match.pool_name}</TableCell>
                      <TableCell>
                        {match.home_team_name} vs {match.away_team_name}
                      </TableCell>
                      <TableCell>
                        <input
                          type="time"
                          value={preview.schedule_time}
                          onChange={(e) => {
                            const newPreview = [...timePreview];
                            newPreview[index].schedule_time = e.target.value;
                            newPreview[index].endTime = addMinutesToTime(
                              e.target.value,
                              timeSettings.duration
                            );
                            setTimePreview(newPreview);
                          }}
                        />
                      </TableCell>
                      <TableCell>{preview.endTime}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Recalculate times from this point
                            const newPreview = [...timePreview];
                            let currentTime = newPreview[index].schedule_time;
                            for (let i = index; i < newPreview.length; i++) {
                              newPreview[i].schedule_time = currentTime;
                              newPreview[i].endTime = addMinutesToTime(
                                currentTime,
                                timeSettings.duration
                              );
                              currentTime = addMinutesToTime(
                                newPreview[i].endTime,
                                timeSettings.interval
                              );
                            }
                            setTimePreview(newPreview);
                          }}
                        >
                          Recalculate Following
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimePreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleBatchTimeUpdate}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Matches Table */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="matches">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredMatches.length > 0 &&
                          filteredMatches.every((match) =>
                            selectedMatches.includes(match)
                          )
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMatches([
                              ...selectedMatches,
                              ...filteredMatches.filter(
                                (match) => !selectedMatches.includes(match)
                              ),
                            ]);
                          } else {
                            setSelectedMatches(
                              selectedMatches.filter(
                                (match) =>
                                  !filteredMatches.find(
                                    (m) => m.match_id === match.match_id
                                  )
                              )
                            );
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Pool</TableHead>
                    <TableHead>Home Team</TableHead>
                    <TableHead>Away Team</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match, index) => (
                    <Draggable
                      key={match.match_id}
                      draggableId={match.match_id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="group"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedMatches.includes(match)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMatches([
                                    ...selectedMatches,
                                    match,
                                  ]);
                                } else {
                                  setSelectedMatches(
                                    selectedMatches.filter(
                                      (selected) =>
                                        selected.match_id !== match.match_id
                                    )
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div
                              className="flex items-center gap-2"
                              {...provided.dragHandleProps}
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              {match.match_order}
                            </div>
                          </TableCell>
                          <TableCell>Pool {match.pool_name}</TableCell>
                          <TableCell>{match.home_team_name}</TableCell>
                          <TableCell>{match.away_team_name}</TableCell>
                          <TableCell>
                            <div className="relative group cursor-pointer">
                              <span>Field {match.field_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {match.schedule_date
                              ? format(
                                  new Date(match.schedule_date),
                                  "dd MMM yyyy"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>{match.schedule_time || "-"}</TableCell>
                          <TableCell>{match.status}</TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </CardContent>
  </Card>
);
}