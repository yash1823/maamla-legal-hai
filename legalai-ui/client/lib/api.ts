import type {
  SearchRequest,
  SearchResponse,
  CaseDetailRequest,
  CaseDetailResponse,
  CaseResult,
} from "@shared/api";

// Ensure trailing slashes are removed from base URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001").replace(/\/+$/, "");

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Safely join base URL and endpoint
function joinUrl(base: string, endpoint: string): string {
  return `${base}/${endpoint.replace(/^\/+/, "")}`;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = joinUrl(API_BASE_URL, endpoint);

  console.log("Request URL:", url); // ✅ You can remove this in production

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
    );
  }

  return response.json();
}

export async function searchCases(params: SearchRequest): Promise<SearchResponse> {
  const url = joinUrl(API_BASE_URL, "/search");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  const cases = data.docs.map((doc: any): CaseResult => ({
    docid: doc.tid.toString(),
    title: doc.title || "Untitled",
    docsource: doc.docsource || "Unknown Court",
    date: doc.publishdate || "Unknown Date",
    snippet: doc.fragment || "",
    numcites: doc.numcites || 0,
  }));

  return {
    cases,
    total: cases.length,
  };
}

export async function getCaseDetail(
  docid: string,
): Promise<CaseDetailResponse> {
  console.log("getCaseDetail → docid:", docid); // ✅ for debugging
  return apiRequest<CaseDetailResponse>(`/doc/${docid}`, {
    method: "POST",
    body: JSON.stringify({ docid }),
  });
}

export async function summarizeCase(docid: string): Promise<{ summary: string }> {
  const url = joinUrl(API_BASE_URL, `/summarize/${docid}`);
  const res = await fetch(url, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to summarize case");
  return res.json();
}

export async function getRelevance(query: string, docid: string): Promise<{ explanation: string }> {
  const url = joinUrl(API_BASE_URL, `/relevance/${docid}?query=${encodeURIComponent(query)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to get relevance");
  return res.json();
}
