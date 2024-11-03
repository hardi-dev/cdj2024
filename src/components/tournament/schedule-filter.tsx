import { Pool } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleFilterProps {
  pools: Pool[];
  selectedPool: string;
  onPoolChange: (value: string) => void;
}

export function ScheduleFilter({
  pools,
  selectedPool,
  onPoolChange,
}: ScheduleFilterProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Filter by Pool:</span>
      <Select value={selectedPool} onValueChange={onPoolChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Pools" />
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
  );
}
