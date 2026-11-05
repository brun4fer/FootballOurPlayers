const ACTION_MAP_ORIGIN = "https://action-map.local";

export function getAnalyticsDestination(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "/";

  try {
    const destination = new URL(value, ACTION_MAP_ORIGIN);
    const isLocal = destination.origin === ACTION_MAP_ORIGIN;
    const isTeamArea =
      destination.pathname === "/teams" || destination.pathname.startsWith("/teams/");
    const isPlayerArea =
      destination.pathname === "/players" || destination.pathname.startsWith("/players/");

    return isLocal && (isTeamArea || isPlayerArea)
      ? `${destination.pathname}${destination.search}`
      : "/";
  } catch {
    return "/";
  }
}
