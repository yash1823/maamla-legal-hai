/**
 * Shared code between client and server
 * Types for legal case search API
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
  court: string;
  date: string;
  snippet: string;
  citation_count?: number;
}

export interface SearchResponse {
  cases: CaseResult[];
  total: number;
}

export interface CaseDetailRequest {
  docid: string;
}

export interface CaseDetail {
  docid: string;
  title: string;
  court: string;
  date: string;
  citation_count: number;
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
