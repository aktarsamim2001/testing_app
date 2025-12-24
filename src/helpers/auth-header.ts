/**
 * Auth Header Helper
 * Returns authorization headers with Bearer token for API requests
 */

interface AuthHeaders {
  Authorization?: string;
  "Content-Type"?: string;
}

export async function authHeader(type?: "FormData"): Promise<AuthHeaders> {
  // Return empty object on server-side rendering
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("authToken");

  if (token) {
    const headers: AuthHeaders =
      type === "FormData"
        ? { Authorization: `Bearer ${token}` }
        : {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

    return headers;
  } else {
    // Clear localStorage if no token found
    localStorage.clear();
    return {};
  }
}
