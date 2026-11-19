export interface Offense {
  id: string;
  name: string;
  aliases: string[];
  category: string;
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
export interface OffenseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}
export interface ApiStatus {
  data_version: string;
  statutes_covered: string[];
  last_updated: string | null;
  total_offenses: number;
}
export interface LegalInstrument {
  id: string;
  title: string;
  source_url: string;
  version: string;
  retrieved_at: string;
  verified_at: string;
  provision_count: number;
}
export interface LegalProvision {
  id: string;
  instrument_id: string;
  number: string;
  heading: string;
  text: string;
  topics: string[];
  source_url: string;
  verified_at: string;
  instrument_title?: string;
  source_version?: string;
}
export interface InstrumentDetail extends LegalInstrument {
  provisions: LegalProvision[];
}
export interface JudgmentReference {
  id: string;
  citation: string;
  court: string;
  decision_date: string;
  source_url: string;
  verified_at: string;
}
export interface Pagination {
  cursor: number;
  limit: number;
  has_more: boolean;
  total?: number;
}
export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
}
