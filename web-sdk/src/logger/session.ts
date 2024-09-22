// Helpers for session and user data
export function getSessionId(): string {
  return sessionStorage.getItem("sessionId") || "unknown-session";
}

export function getUserDetails(): { id: string; role: string } | null {
  const userId = sessionStorage.getItem("userId");
  const userRole = sessionStorage.getItem("userRole");

  if (userId && userRole) {
    return { id: userId, role: userRole };
  }
  return null;
}
