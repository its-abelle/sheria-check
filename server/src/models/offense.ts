export interface OffenseRow {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  description: string;
  citation: string;
  act: string;
  section: string;
  law_version: string;
  defining_provision_id: string;
  penalty_provision_id: string;
  defining_text: string;
  penalty_text: string;
  source_url: string;
  penalty_source_url: string;
  penalty_act: string;
  penalty_section: string;
  penalty_source_version: string;
  source_version: string;
  verified_at: string;
  updated_at: string;
}

export interface StatusRow {
  id: number;
  data_version: string;
  statutes_covered: string[];
  total_offenses: number;
  last_updated: string;
}
