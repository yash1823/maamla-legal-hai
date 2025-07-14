import type {
  SearchRequest,
  SearchResponse,
  CaseDetailRequest,
  CaseDetailResponse,
  CaseResult,
} from "@shared/api";

// ✅ Remove trailing slashes from base URL
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// ✅ API error handler
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ✅ Safely join base URL and endpoint
function joinUrl(base: string, endpoint: string): string {
  return `${base}/${endpoint.replace(/^\/+/, "")}`;
}

// ✅ Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = joinUrl(API_BASE_URL, endpoint);

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

// ✅ GET /search
export async function searchCases(
  params: SearchRequest,
): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("query", params.query);

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
  }

  const data = await apiRequest<any>(`/search?${searchParams.toString()}`);

  const cases: CaseResult[] = (data.cases || []).map((doc: any) => ({
    docid: doc.docid || doc.tid?.toString() || "",
    title: doc.title || "Untitled",
    docsource: doc.docsource || "Unknown Court",
    date: doc.date || doc.publishdate || "Unknown Date",
    snippet: doc.snippet || doc.fragment || "",
    numcites: doc.numcites || 0,
  }));

  return {
    cases,
    total: data.total || cases.length,
  };
}

// ✅ POST /doc/:docid
export async function getCaseDetail(
  docid: string,
): Promise<CaseDetailResponse> {
  return apiRequest<CaseDetailResponse>(`/doc/${encodeURIComponent(docid)}`, {
    method: "POST",
    body: JSON.stringify({ docid }),
  });
}

// ✅ POST /summarize/:docid
export async function summarizeCase(
  docid: string,
): Promise<{ summary: string }> {
  return apiRequest<{ summary: string }>(
    `/summarize/${encodeURIComponent(docid)}`,
    {
      method: "POST",
    },
  );
}

// ✅ GET /relevance/:docid?query=...
export async function getRelevance(
  query: string,
  docid: string,
): Promise<{ explanation: string }> {
  const endpoint = `/relevance/${encodeURIComponent(docid)}?query=${encodeURIComponent(query)}`;
  return apiRequest<{ explanation: string }>(endpoint);
}
