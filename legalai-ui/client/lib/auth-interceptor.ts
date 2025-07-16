import { toast } from "@/hooks/use-toast";

// Global state for auth handling
let authEventListeners: Array<() => void> = [];
let tokenCheckInterval: NodeJS.Timeout | null = null;

export interface AuthEvent {
  type: "token_expired" | "unauthorized";
}

// Subscribe to auth events (used by AuthContext)
export function onAuthEvent(listener: () => void) {
  authEventListeners.push(listener);

  return () => {
    authEventListeners = authEventListeners.filter((l) => l !== listener);
  };
}

// Trigger auth event to all listeners
function triggerAuthEvent() {
  authEventListeners.forEach((listener) => listener());
}

// Clear token and redirect
function handleTokenExpiry() {
  // Clear token from localStorage
  localStorage.removeItem("auth_token");

  // Show toast notification
  toast({
    title: "🔒 Session expired",
    description: "Please sign in again.",
    variant: "destructive",
    duration: 5000,
  });

  // Trigger event for AuthContext to update state
  triggerAuthEvent();

  // Redirect to login page
  window.location.href = "/login";
}

// Enhanced API request function with token expiry handling
export async function apiRequestWithAuth<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  // Add auth header if token exists
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    console.warn("401 Unauthorized - Token expired or invalid");
    handleTokenExpiry();
    throw new Error("Authentication required");
  }

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

    throw new Error(errorMessage);
  }

  return response.json();
}

// Token validation function
export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token has expiry time
    if (!payload.exp) return false; // No expiry set

    // Check if current time is past expiry (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= payload.exp;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true; // Treat parsing errors as expired tokens
  }
}

// Periodic token check (runs every 30 seconds)
export function startTokenExpiryCheck() {
  // Clear existing interval if any
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }

  tokenCheckInterval = setInterval(() => {
    const token = localStorage.getItem("auth_token");

    if (token && isTokenExpired(token)) {
      console.warn("Token expired during periodic check");
      handleTokenExpiry();
    }
  }, 30000); // Check every 30 seconds
}

// Stop token expiry check
export function stopTokenExpiryCheck() {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
}

// Check if user is currently authenticated
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("auth_token");
  return token ? !isTokenExpired(token) : false;
}
