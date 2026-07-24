export interface OffenseRow {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  category: string;
  severity: "minor" | "serious" | "felony";
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

export interface ReportRow {
  id: number;
  offense_id: string | null;
  officer_name: string | null;
  officer_badge: string | null;
  location: string | null;
  amount_demanded: number | null;
  description: string;
  created_at: string;
}

export interface StatusRow {
  id: number;
  data_version: string;
  statutes_covered: string[];
  total_offenses: number;
  last_updated: string;
}
