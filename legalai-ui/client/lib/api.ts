import type {
  SearchRequest,
  SearchResponse,
  CaseDetailRequest,
  CaseDetailResponse,
  CaseResult,
} from "@shared/api";

// ✅ Remove trailing slashes from base URL
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"
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
  console.log("📡 Request URL:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Try to extract error message from response body
    let errorMessage = `API request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If parsing JSON fails, use the default message
    }

    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

// ✅ POST /search
export async function searchCases(
  params: SearchRequest,
): Promise<SearchResponse> {
  const data = await apiRequest<any>("/search", {
    method: "POST",
    body: JSON.stringify(params),
  });

  const cases: CaseResult[] = data.docs.map((doc: any) => ({
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

// ✅ POST /doc/:docid
export async function getCaseDetail(
  docid: string,
): Promise<CaseDetailResponse> {
  console.log("📄 getCaseDetail → docid:", docid);
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

// ✅ Authentication API functions
export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string }> {
  return apiRequest<{ token: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signupUser(
  email: string,
  password: string,
  name: string,
): Promise<{ token: string }> {
  return apiRequest<{ token: string }>("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function getCurrentUser(
  token: string,
): Promise<{ id: string; email: string; name: string }> {
  return apiRequest<{ id: string; email: string; name: string }>("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ✅ Bookmark API functions
export async function addBookmark(
  token: string,
  docid: string,
  title: string,
  court: string,
  date: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/bookmark", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ docid, title, court, date }),
  });
}

export async function getBookmarks(token: string): Promise<any[]> {
  return apiRequest<any[]>("/bookmarks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function removeBookmark(
  token: string,
  docid: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/bookmark?docid=${encodeURIComponent(docid)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
