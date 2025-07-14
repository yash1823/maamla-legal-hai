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
 * Authentication types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserResponse {
  user: User;
}

/**
 * Bookmarks types
 */
export interface BookmarkRequest {
  docid: string;
}

export interface Bookmark {
  id: string;
  docid: string;
  title: string;
  court: string;
  date: string;
  created_at: string;
}

export interface BookmarksResponse {
  bookmarks: Bookmark[];
}

/**
 * Example response type for /api/demo (legacy)
 */
export interface DemoResponse {
  message: string;
}
