// Types matching the backend API contract
export interface Mention {
  id: string;
  query_text: string;
  model: string;
  mentioned: boolean;
  position: number | null;
  sentiment: string | null;
  citation_url: string | null;
  created_at: string;
}

export interface MentionFilters {
  model: string;
  sentiment: "" | "positive" | "neutral" | "negative";
  date_from: string; // "YYYY-MM-DD" or ""
  date_to: string;   // "YYYY-MM-DD" or ""
}

export interface MentionsResponse {
  data: Mention[];
  total: number;
  per_page: number;
  page: number;
}

export interface TrendFilters {
  date_from?: string;
  date_to?: string;
  group_by: "day" | "week";
}

export interface TrendPoint {
  date: string;
  total: number;
  mentioned: number;
}
