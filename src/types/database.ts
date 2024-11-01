export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number;
          username: string;
          password_hash: string;
          full_name: string;
          email: string | null;
          contact_number: string | null;
          role: "ADMIN" | "SCORER" | "TEAM_MANAGER";
          team_id: number | null;
          is_active: boolean;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          user_id?: number;
          username: string;
          password_hash: string;
          full_name: string;
          email?: string | null;
          contact_number?: string | null;
          role: "ADMIN" | "SCORER" | "TEAM_MANAGER";
          team_id?: number | null;
          is_active?: boolean;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          user_id?: number;
          username?: string;
          password_hash?: string;
          full_name?: string;
          email?: string | null;
          contact_number?: string | null;
          role?: "ADMIN" | "SCORER" | "TEAM_MANAGER";
          team_id?: number | null;
          is_active?: boolean;
          created_at?: string;
          last_login?: string | null;
        };
      };
      user_permissions: {
        Row: {
          role: string;
          can_manage_users: boolean;
          can_manage_teams: boolean;
          can_manage_schedule: boolean;
          can_score_games: boolean;
          can_view_reports: boolean;
          can_manage_brackets: boolean;
          can_submit_lineup: boolean;
        };
        Insert: {
          role: string;
          can_manage_users?: boolean;
          can_manage_teams?: boolean;
          can_manage_schedule?: boolean;
          can_score_games?: boolean;
          can_view_reports?: boolean;
          can_manage_brackets?: boolean;
          can_submit_lineup?: boolean;
        };
        Update: {
          role?: string;
          can_manage_users?: boolean;
          can_manage_teams?: boolean;
          can_manage_schedule?: boolean;
          can_score_games?: boolean;
          can_view_reports?: boolean;
          can_manage_brackets?: boolean;
          can_submit_lineup?: boolean;
        };
      };
      teams: {
        Row: {
          team_id: number;
          team_name: string;
          manager_name: string | null;
          contact_number: string | null;
          email: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          team_id?: number;
          team_name: string;
          manager_name?: string | null;
          contact_number?: string | null;
          email?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          team_id?: number;
          team_name?: string;
          manager_name?: string | null;
          contact_number?: string | null;
          email?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          player_id: number;
          team_id: number;
          player_name: string;
          jersey_number: string | null;
          position: string | null;
          email: string | null;
          contact_number: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          player_id?: number;
          team_id: number;
          player_name: string;
          jersey_number?: string | null;
          position?: string | null;
          email?: string | null;
          contact_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          player_id?: number;
          team_id?: number;
          player_name?: string;
          jersey_number?: string | null;
          position?: string | null;
          email?: string | null;
          contact_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pools: {
        Row: {
          pool_id: number;
          pool_name: string;
          stage: "PRELIMINARY" | "SUPER_ROUND";
          created_at: string;
        };
        Insert: {
          pool_id?: number;
          pool_name: string;
          stage: "PRELIMINARY" | "SUPER_ROUND";
          created_at?: string;
        };
        Update: {
          pool_id?: number;
          pool_name?: string;
          stage?: "PRELIMINARY" | "SUPER_ROUND";
          created_at?: string;
        };
      };
      pool_teams: {
        Row: {
          pool_team_id: number;
          pool_id: number;
          team_id: number;
          wins: number;
          losses: number;
          runs_for: number;
          runs_against: number;
          winning_percentage: number;
          rank: number | null;
          updated_at: string;
        };
        Insert: {
          pool_team_id?: number;
          pool_id: number;
          team_id: number;
          wins?: number;
          losses?: number;
          runs_for?: number;
          runs_against?: number;
          winning_percentage?: number;
          rank?: number | null;
          updated_at?: string;
        };
        Update: {
          pool_team_id?: number;
          pool_id?: number;
          team_id?: number;
          wins?: number;
          losses?: number;
          runs_for?: number;
          runs_against?: number;
          winning_percentage?: number;
          rank?: number | null;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          match_id: number;
          pool_id: number | null;
          home_team_id: number;
          away_team_id: number;
          scorer_id: number | null;
          stage: "PRELIMINARY" | "SUPER_ROUND" | "PLAYOFF" | "BRONZE" | "FINAL";
          field_number: string | null;
          schedule_time: string;
          home_score: number;
          away_score: number;
          is_completed: boolean;
          status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          match_id?: number;
          pool_id?: number | null;
          home_team_id: number;
          away_team_id: number;
          scorer_id?: number | null;
          stage: "PRELIMINARY" | "SUPER_ROUND" | "PLAYOFF" | "BRONZE" | "FINAL";
          field_number?: string | null;
          schedule_time: string;
          home_score?: number;
          away_score?: number;
          is_completed?: boolean;
          status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          match_id?: number;
          pool_id?: number | null;
          home_team_id?: number;
          away_team_id?: number;
          scorer_id?: number | null;
          stage?:
            | "PRELIMINARY"
            | "SUPER_ROUND"
            | "PLAYOFF"
            | "BRONZE"
            | "FINAL";
          field_number?: string | null;
          schedule_time?: string;
          home_score?: number;
          away_score?: number;
          is_completed?: boolean;
          status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          created_at?: string;
          updated_at?: string;
        };
      };
      match_lineups: {
        Row: {
          lineup_id: number;
          match_id: number;
          team_id: number;
          player_id: number;
          batting_order: number;
          fielding_position: string;
          is_starter: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          lineup_id?: number;
          match_id: number;
          team_id: number;
          player_id: number;
          batting_order: number;
          fielding_position: string;
          is_starter?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          lineup_id?: number;
          match_id?: number;
          team_id?: number;
          player_id?: number;
          batting_order?: number;
          fielding_position?: string;
          is_starter?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      player_stats: {
        Row: {
          stat_id: number;
          match_id: number;
          player_id: number;
          at_bats: number;
          hits: number;
          runs: number;
          rbis: number;
          doubles: number;
          triples: number;
          homeruns: number;
          walks: number;
          strikeouts: number;
          errors: number;
          created_at: string;
        };
        Insert: {
          stat_id?: number;
          match_id: number;
          player_id: number;
          at_bats?: number;
          hits?: number;
          runs?: number;
          rbis?: number;
          doubles?: number;
          triples?: number;
          homeruns?: number;
          walks?: number;
          strikeouts?: number;
          errors?: number;
          created_at?: string;
        };
        Update: {
          stat_id?: number;
          match_id?: number;
          player_id?: number;
          at_bats?: number;
          hits?: number;
          runs?: number;
          rbis?: number;
          doubles?: number;
          triples?: number;
          homeruns?: number;
          walks?: number;
          strikeouts?: number;
          errors?: number;
          created_at?: string;
        };
      };
      score_updates: {
        Row: {
          update_id: number;
          match_id: number;
          scorer_id: number;
          inning: number;
          team_batting: "HOME" | "AWAY";
          runs_scored: number;
          play_description: string | null;
          updated_at: string;
        };
        Insert: {
          update_id?: number;
          match_id: number;
          scorer_id: number;
          inning: number;
          team_batting: "HOME" | "AWAY";
          runs_scored?: number;
          play_description?: string | null;
          updated_at?: string;
        };
        Update: {
          update_id?: number;
          match_id?: number;
          scorer_id?: number;
          inning?: number;
          team_batting?: "HOME" | "AWAY";
          runs_scored?: number;
          play_description?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
