export type Severity = "minor" | "serious" | "felony";

export interface Offense {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  category: string;
  severity: Severity;
  citation: string;
  act: string;
  section: string;
  min_fine: number;
  max_fine: number;
  max_imprisonment: string | null;
  course_of_action: string;
  law_version: string;
  created_at: string;
  updated_at: string;
}

export interface OffenseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface ReportPayload {
  offense_id?: string;
  officer_name?: string;
  officer_badge?: string;
  location?: string;
  amount_demanded?: number;
  amount_legal?: number;
  description: string;
}

export interface ApiStatus {
  data_version: string;
  statutes_covered: string[];
  last_updated: string;
  total_offenses: number;
}

export interface IncidentInsight {
  period: string;
  area: string;
  report_count: number;
  median_amount_demanded: number;
  median_amount_legal: number;
  top_offense_id: string | null;
  top_offense_name: string | null;
}
