import { useScheduleStore } from "@/store/schedule-store";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Grid2x2, Undo2, X } from "lucide-react";

interface ScheduleToolbarProps {
  onEditDate: () => void;
  onEditTime: () => void;
  onEditField: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export function ScheduleToolbar({
  onEditDate,
  onEditTime,
  onEditField,
  onUndo,
  canUndo,
}: ScheduleToolbarProps) {
  const { selectedMatches, clearSelection } = useScheduleStore();

  if (selectedMatches.length === 0) return null;

  return (
    <div className="flex items-center gap-4 mb-4 p-2 bg-muted rounded-lg">
      <span className="text-sm font-medium">
        {selectedMatches.length} matches selected
      </span>
      <div className="flex-1 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEditDate}>
          <Calendar className="h-4 w-4 mr-2" />
          Set Date
        </Button>
        <Button variant="outline" size="sm" onClick={onEditTime}>
          <Clock className="h-4 w-4 mr-2" />
          Set Time
        </Button>
        <Button variant="outline" size="sm" onClick={onEditField}>
          <Grid2x2 className="h-4 w-4 mr-2" />
          Set Field
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {canUndo && (
          <Button variant="ghost" size="sm" onClick={onUndo}>
            <Undo2 className="h-4 w-4 mr-2" />
            Undo
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={clearSelection}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
