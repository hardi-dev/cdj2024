export interface Match {
  match_id: number;
  match_order: number;
  pool_id: number;
  pool_name: string;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  field_number: number;
  schedule_date: string | null;
  schedule_time: string | null;
  status: string;
}

export interface Pool {
  pool_id: number;
  pool_name: string;
  teams: {
    team_id: number;
    team_name: string;
  }[];
}

export interface BatchUpdate {
  type: "date" | "time" | "field";
  value: any;
  matches: number[];
}
