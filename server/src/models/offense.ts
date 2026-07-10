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
