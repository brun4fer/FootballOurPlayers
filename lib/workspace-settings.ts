export const SIMAO_WORKSPACE_ID = 2;

export function usesManualPossessionLosses(workspaceId: number | null | undefined) {
  return workspaceId === SIMAO_WORKSPACE_ID;
}

export function usesPolishedPdfExports(workspaceId: number | null | undefined) {
  return workspaceId === SIMAO_WORKSPACE_ID;
}
