export type HealthStatus = "healthy" | "needs_attention" | "critical";

export function getWebsiteHealth(
  score: number,
  openIssues: number,
  criticalAlerts: number
): HealthStatus {
  if (score < 50 || criticalAlerts > 0) return "critical";
  if (score < 70 || openIssues > 0) return "needs_attention";
  return "healthy";
}

export function normalizeDomain(url: string): string {
  try {
    let hostname = url.trim().toLowerCase();
    if (!/^https?:\/\//i.test(hostname)) hostname = "https://" + hostname;
    const parsed = new URL(hostname);
    hostname = parsed.hostname;
    hostname = hostname.replace(/^www\./, "");
    hostname = hostname.replace(/\/+$/, "");
    return hostname;
  } catch {
    return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").split("/")[0];
  }
}
