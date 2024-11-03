import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeField } from "@/components/ui/time-field";
import { Match } from "@/types";

interface BatchEditDialogsProps {
  selectedMatches: Match[];
  showDateDialog: boolean;
  showTimeDialog: boolean;
  showFieldDialog: boolean;
  onCloseDateDialog: () => void;
  onCloseTimeDialog: () => void;
  onCloseFieldDialog: () => void;
  onUpdateDate: (date: Date) => void;
  onUpdateTime: (time: string) => void;
  onUpdateField: (field: number) => void;
}

export function BatchEditDialogs({
  selectedMatches,
  showDateDialog,
  showTimeDialog,
  showFieldDialog,
  onCloseDateDialog,
  onCloseTimeDialog,
  onCloseFieldDialog,
  onUpdateDate,
  onUpdateTime,
  onUpdateField,
}: BatchEditDialogsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedField, setSelectedField] = useState<string>();

  const handleDateUpdate = () => {
    if (selectedDate) {
      onUpdateDate(selectedDate);
      setSelectedDate(undefined);
    }
  };

  const handleTimeUpdate = () => {
    if (selectedTime) {
      onUpdateTime(selectedTime);
      setSelectedTime(undefined);
    }
  };

  const handleFieldUpdate = () => {
    if (selectedField) {
      onUpdateField(parseInt(selectedField));
      setSelectedField(undefined);
    }
  };

  return (
    <>
      {/* Date Dialog */}
      <Dialog open={showDateDialog} onOpenChange={onCloseDateDialog}>
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
            <Button onClick={handleDateUpdate} disabled={!selectedDate}>
              Apply to {selectedMatches.length} matches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={onCloseTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Time for Selected Matches</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <TimeField value={selectedTime} onChange={setSelectedTime} />
          </div>
          <DialogFooter>
            <Button onClick={handleTimeUpdate} disabled={!selectedTime}>
              Apply to {selectedMatches.length} matches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={onCloseFieldDialog}>
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
            <Button onClick={handleFieldUpdate} disabled={!selectedField}>
              Apply to {selectedMatches.length} matches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
