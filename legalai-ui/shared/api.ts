/**
 * Shared code between client and server
 * Types for Maamla Legal Hai API
 */

export interface SearchRequest {
  query: string;
  page: number;
  filters?: {
    doctypes?: string;
    fromdate?: string;
    todate?: string;
    title?: string;
    cite?: string;
    author?: string;
    bench?: string;
    maxcites?: number;
    maxpages?: number;
  };
}

export interface CaseResult {
  docid: string;
  title: string;
  docsource: string; // renamed from court
  date: string;
  snippet: string;
  numcites?: number; // renamed from citation_count
}

export interface SearchResponse {
  cases: CaseResult[];
  total: number;
}

export interface CaseDetailRequest {
  docid: string;
}

export interface CaseDetail {
  title: string;
  citation_count: number;
  court: string;
  date: string;
  publish_date: string;
  clean_doc: string;
}


export interface CaseDetailResponse {
  case: CaseDetail;
}

/**
 * Example response type for /api/demo (legacy)
 */
export interface DemoResponse {
  message: string;
}
