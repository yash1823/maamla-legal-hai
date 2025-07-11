import type {
  SearchRequest,
  SearchResponse,
  CaseDetailRequest,
  CaseDetailResponse,
  CaseResult,
} from "@shared/api";

// You can update this base URL to point to your FastAPI backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

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
  const res = await fetch(`${API_BASE_URL}/search`, {
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
  return apiRequest<CaseDetailResponse>(`/doc/${docid}`, {
    method: "POST",
    body: JSON.stringify({ docid }),
  });
}

export async function summarizeCase(docid: string): Promise<{ summary: string }> {
  const res = await fetch(`${API_BASE_URL}/summarize/${docid}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to summarize case");
  return res.json();
}

export async function getRelevance(query: string, docid: string): Promise<{ explanation: string }> {
  const res = await fetch(`${API_BASE_URL}/relevance/${docid}?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to get relevance");
  return res.json();
}


